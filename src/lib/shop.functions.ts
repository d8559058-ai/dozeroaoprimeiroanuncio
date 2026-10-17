import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const PRODUCT_ID = "guia";

function siteOrigin() {
  const env = process.env["SITE_URL"];
  if (env) return env.replace(/\/$/, "");
  const req = getRequest();
  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  return `${proto}://${host}`;
}

export const getProduct = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("products")
    .select("title, description, price_cents, image_path, updated_at, file_path")
    .eq("id", PRODUCT_ID)
    .single();
  if (!data) throw new Error("Produto não encontrado");
  return {
    title: data.title,
    description: data.description,
    priceCents: data.price_cents,
    imageUrl: data.image_path ? `/api/public/product-image?v=${encodeURIComponent(data.updated_at)}` : null,
    available: !!data.file_path,
  };
});

export const createCheckout = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { mpFetch } = await import("./mp.server");
  const { data: product } = await supabaseAdmin.from("products").select("*").eq("id", PRODUCT_ID).single();
  if (!product) throw new Error("Produto não encontrado");

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .insert({ product_id: PRODUCT_ID, amount_cents: product.price_cents, status: "created" })
    .select("id, access_token")
    .single();
  if (error || !order) throw new Error("Não foi possível criar o pedido");

  const origin = siteOrigin();
  const back = `${origin}/pedido/${order.id}?t=${order.access_token}`;
  const pref = await mpFetch<{ id: string; init_point: string }>("/checkout/preferences", {
    method: "POST",
    headers: { "X-Idempotency-Key": order.id },
    body: JSON.stringify({
      items: [
        {
          id: PRODUCT_ID,
          title: product.title,
          description: "Guia digital em PDF",
          quantity: 1,
          currency_id: "BRL",
          unit_price: product.price_cents / 100,
          category_id: "learnings",
        },
      ],
      external_reference: order.id,
      back_urls: { success: back, pending: back, failure: back },
      auto_return: origin.startsWith("https") ? "approved" : undefined,
      notification_url: `${origin}/api/public/mp-webhook?source_news=webhooks`,
      statement_descriptor: "GUIA ANUNCIO",
    }),
  });

  await supabaseAdmin.from("orders").update({ mp_preference_id: pref.id, status: "pending" }).eq("id", order.id);
  return { url: pref.init_point, orderId: order.id, token: order.access_token };
});

const orderInput = z.object({ id: z.string().uuid(), t: z.string().min(16).max(128) });

async function loadOrder(id: string, t: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("orders").select("*").eq("id", id).maybeSingle();
  if (!data || data.access_token !== t) throw new Error("Pedido não encontrado ou link inválido.");
  return data;
}

export const getOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((d) => orderInput.parse(d))
  .handler(async ({ data }) => {
    let order = await loadOrder(data.id, data.t);
    if (order.status !== "approved") {
      try {
        const { syncOrder } = await import("./mp.server");
        await syncOrder(order.id);
        order = await loadOrder(data.id, data.t);
      } catch (e) {
        console.error("sync failed", e);
      }
    }
    return { status: order.status, amountCents: order.amount_cents, createdAt: order.created_at };
  });

export const getDownloadLink = createServerFn({ method: "POST" })
  .inputValidator((d) => orderInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const order = await loadOrder(data.id, data.t);
    if (order.status !== "approved") throw new Error("Pagamento ainda não aprovado.");
    const { data: product } = await supabaseAdmin.from("products").select("file_path").eq("id", order.product_id).single();
    if (!product?.file_path) throw new Error("O arquivo ainda não está disponível. Tente novamente em breve.");
    const { data: signed, error } = await supabaseAdmin.storage
      .from("product-files")
      .createSignedUrl(product.file_path, 300, { download: "do-zero-ao-primeiro-anuncio.pdf" });
    if (error || !signed) throw new Error("Falha ao gerar o link de download.");
    await supabaseAdmin.from("orders").update({ download_count: order.download_count + 1 }).eq("id", order.id);
    return { url: signed.signedUrl };
  });
