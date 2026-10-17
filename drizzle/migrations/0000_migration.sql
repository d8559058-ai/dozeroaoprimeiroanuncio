CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.assign_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_admin AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.assign_first_admin();

CREATE TABLE public.products (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_cents integer NOT NULL CHECK (price_cents >= 100),
  image_path text,
  file_path text,
  file_updated_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT UPDATE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin update products" ON public.products FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.products (id, title, description, price_cents) VALUES
('guia', 'Do Zero ao Primeiro Anúncio', 'Guia em PDF para iniciantes: da preparação da presença digital até a publicação e o acompanhamento dos anúncios no Meta Ads.', 1000);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL REFERENCES public.products(id),
  access_token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(24), 'hex'),
  amount_cents integer NOT NULL,
  status text NOT NULL DEFAULT 'created',
  mp_preference_id text,
  mp_payment_id text,
  mp_status_detail text,
  payer_email text,
  approved_at timestamptz,
  download_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin manage pdf" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id IN ('product-files','product-images') AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id IN ('product-files','product-images') AND public.has_role(auth.uid(), 'admin'));