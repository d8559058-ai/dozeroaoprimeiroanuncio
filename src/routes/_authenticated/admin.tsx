import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel — Do Zero ao Primeiro Anúncio" },
      { name: "description", content: "Gerencie o guia e os pedidos." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Painel administrativo" },
      { property: "og:description", content: "Gerencie o guia e os pedidos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

const statusLabel: Record<string, string> = {
  created: "Criado", pending: "Pendente", approved: "Aprovado", rejected: "Recusado", cancelled: "Cancelado", refunded: "Estornado",
};

function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [product, setProduct] = useState<Tables<"products"> | null>(null);
  const [orders, setOrders] = useState<Tables<"orders">[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", price: "" });

  const load = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", u.user!.id).eq("role", "admin").maybeSingle();
    setIsAdmin(!!role);
    if (!role) return;
    const { data: p } = await supabase.from("products").select("*").eq("id", "guia").single();
    if (p) {
      setProduct(p);
      setForm({ title: p.title, description: p.description, price: (p.price_cents / 100).toFixed(2).replace(".", ",") });
    }
    const { data: o } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500);
    setOrders(o ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const save = async () => {
    const cents = Math.round(Number(form.price.replace(",", ".")) * 100);
    if (!form.title.trim() || !Number.isFinite(cents) || cents < 100) return toast.error("Informe título e preço válido (mínimo R$ 1,00).");
    setBusy(true);
    const { error } = await supabase.from("products").update({ title: form.title.trim(), description: form.description, price_cents: cents, updated_at: new Date().toISOString() }).eq("id", "guia");
    setBusy(false);
    error ? toast.error("Erro ao salvar: " + error.message) : (toast.success("Produto atualizado"), load());
  };

  const uploadPdf = async (file: File) => {
    if (file.type !== "application/pdf") return toast.error("Envie um arquivo PDF.");
    setBusy(true);
    const path = `guia-${Date.now()}.pdf`;
    const { error } = await supabase.storage.from("product-files").upload(path, file, { contentType: "application/pdf" });
    if (!error) {
      const old = product?.file_path;
      await supabase.from("products").update({ file_path: path, file_updated_at: new Date().toISOString() }).eq("id", "guia");
      if (old) await supabase.storage.from("product-files").remove([old]);
    }
    setBusy(false);
    error ? toast.error("Erro no upload: " + error.message) : (toast.success("PDF enviado"), load());
  };

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("Envie uma imagem.");
    setBusy(true);
    const path = `capa-${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
    if (!error) {
      const old = product?.image_path;
      await supabase.from("products").update({ image_path: path, updated_at: new Date().toISOString() }).eq("id", "guia");
      if (old) await supabase.storage.from("product-images").remove([old]);
    }
    setBusy(false);
    error ? toast.error("Erro no upload: " + error.message) : (toast.success("Imagem atualizada"), load());
  };

  if (isAdmin === null) return <p className="p-8 text-muted-foreground">Carregando...</p>;
  if (!isAdmin)
    return (
      <main className="p-8">
        <p>Sua conta não tem permissão de administrador.</p>
        <button className="btn-ghost mt-4" onClick={signOut}>Sair</button>
      </main>
    );

  const shown = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const approved = orders.filter((o) => o.status === "approved");

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-5 py-8">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-4xl tracking-wide">PAINEL</h1>
        <button className="btn-ghost" onClick={signOut}>Sair</button>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-xl bg-card p-5">
          <h2 className="font-bold">Produto</h2>
          <label className="block text-sm">Título<input className="field mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <label className="block text-sm">Descrição<textarea className="field mt-1" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label className="block text-sm">Preço (R$)<input className="field mt-1" inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
          <button className="btn-cta w-full py-3 text-lg" disabled={busy} onClick={save}>SALVAR</button>
        </div>
        <div className="space-y-4 rounded-xl bg-card p-5">
          <h2 className="font-bold">Arquivos</h2>
          <div>
            <p className="text-sm text-muted-foreground">
              PDF atual: {product?.file_path ? `enviado em ${new Date(product.file_updated_at!).toLocaleString("pt-BR")}` : <span className="text-primary">nenhum — compradores não conseguirão baixar</span>}
            </p>
            <label className="btn-ghost mt-2 cursor-pointer">
              {product?.file_path ? "Substituir PDF" : "Enviar PDF"}
              <input type="file" accept="application/pdf" className="hidden" disabled={busy} onChange={(e) => e.target.files?.[0] && uploadPdf(e.target.files[0])} />
            </label>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Imagem de capa: {product?.image_path ? "personalizada" : "padrão (mockup)"}</p>
            {product?.image_path && <img src={`/api/public/product-image?v=${product.updated_at}`} alt="Capa" className="mt-2 h-32 rounded-lg" />}
            <label className="btn-ghost mt-2 cursor-pointer">
              Trocar imagem
              <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
            </label>
          </div>
          {busy && <p className="text-sm text-secondary">Processando...</p>}
        </div>
      </section>

      <section className="rounded-xl bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold">Pedidos ({orders.length}) · Aprovados: {approved.length} · Downloads: {approved.reduce((s, o) => s + o.download_count, 0)}</h2>
          <select className="field w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Todos</option>
            {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground"><tr><th className="py-2">Data</th><th>Pedido</th><th>E-mail</th><th>Valor</th><th>Status</th><th>Downloads</th></tr></thead>
            <tbody>
              {shown.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="py-2">{new Date(o.created_at).toLocaleString("pt-BR")}</td>
                  <td className="font-mono text-xs">{o.id.slice(0, 8)}</td>
                  <td>{o.payer_email ?? "—"}</td>
                  <td>{(o.amount_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td className={o.status === "approved" ? "text-success" : o.status === "pending" ? "text-secondary" : "text-muted-foreground"}>{statusLabel[o.status] ?? o.status}</td>
                  <td>{o.status === "approved" ? o.download_count : "—"}</td>
                </tr>
              ))}
              {!shown.length && <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">Nenhum pedido.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
