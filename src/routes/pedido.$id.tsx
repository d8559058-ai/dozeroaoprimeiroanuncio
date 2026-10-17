import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { z } from "zod";
import { CheckCircle2, Clock, XCircle, Loader2, Download } from "lucide-react";
import { getOrderStatus, getDownloadLink } from "@/lib/shop.functions";

export const Route = createFileRoute("/pedido/$id")({
  validateSearch: z.object({ t: z.string().catch("") }),
  head: () => ({
    meta: [
      { title: "Seu pedido — Do Zero ao Primeiro Anúncio" },
      { name: "description", content: "Acompanhe o pagamento e baixe seu guia em PDF." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Seu pedido — Do Zero ao Primeiro Anúncio" },
      { property: "og:description", content: "Página de entrega do guia em PDF." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrderPage,
});

type S = { status: string; amountCents: number } | null;

function OrderPage() {
  const { id } = Route.useParams();
  const { t } = Route.useSearch();
  const check = useServerFn(getOrderStatus);
  const dl = useServerFn(getDownloadLink);
  const [order, setOrder] = useState<S>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const run = async (n: number) => {
      try {
        const r = await check({ data: { id, t } });
        if (stop) return;
        setOrder(r);
        if ((r.status === "pending" || r.status === "created") && n < 60) timer = setTimeout(() => run(n + 1), 5000);
      } catch (e) {
        if (!stop) setError(e instanceof Error ? e.message : "Erro ao consultar o pedido.");
      }
    };
    run(0);
    return () => { stop = true; clearTimeout(timer); };
  }, [id, t, check]);

  const download = async () => {
    setDownloading(true);
    try {
      const r = await dl({ data: { id, t } });
      window.location.href = r.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar download.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="bg-hero grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7 text-center">
        {error ? (
          <State icon={<XCircle className="h-14 w-14 text-primary" />} title="ALGO DEU ERRADO" text={error} />
        ) : !order ? (
          <State icon={<Loader2 className="h-14 w-14 animate-spin text-secondary" />} title="VERIFICANDO PAGAMENTO" text="Consultando o Mercado Pago..." />
        ) : order.status === "approved" ? (
          <>
            <State icon={<CheckCircle2 className="h-14 w-14 text-success" />} title="COMPRA CONFIRMADA!" text="Seu pagamento foi aprovado. Baixe seu guia abaixo. Salve o link desta página para baixar novamente quando quiser." />
            <button className="btn-cta mt-6 w-full" onClick={download} disabled={downloading}>
              <Download className="h-5 w-5" /> {downloading ? "GERANDO LINK..." : "BAIXAR MEU GUIA EM PDF"}
            </button>
          </>
        ) : order.status === "pending" || order.status === "created" ? (
          <State icon={<Clock className="h-14 w-14 text-secondary" />} title="PAGAMENTO PENDENTE" text="Assim que o Mercado Pago aprovar o pagamento, o download será liberado aqui automaticamente. Pagamentos via Pix costumam ser aprovados em instantes." />
        ) : order.status === "rejected" ? (
          <Retry title="PAGAMENTO RECUSADO" text="O pagamento não foi aprovado. Você pode tentar novamente com outra forma de pagamento." />
        ) : (
          <Retry title={order.status === "refunded" ? "PAGAMENTO ESTORNADO" : "PAGAMENTO CANCELADO"} text="Este pedido não está ativo. Você pode fazer uma nova compra." />
        )}
      </div>
    </main>
  );
}

function State({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <>
      <div className="flex justify-center">{icon}</div>
      <h1 className="mt-4 font-display text-4xl tracking-wide">{title}</h1>
      <p className="mt-2 text-muted-foreground">{text}</p>
    </>
  );
}

function Retry({ title, text }: { title: string; text: string }) {
  return (
    <>
      <State icon={<XCircle className="h-14 w-14 text-primary" />} title={title} text={text} />
      <Link to="/" className="btn-cta mt-6 w-full">VOLTAR E TENTAR NOVAMENTE</Link>
    </>
  );
}
