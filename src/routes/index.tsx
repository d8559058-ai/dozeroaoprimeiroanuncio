import { createFileRoute } from "@tanstack/react-router";
import { Facebook, Instagram, MessageCircle, Sparkles, Megaphone, Target, Wallet, Rocket, BarChart3, FileText, AlertTriangle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BuyButton } from "@/components/BuyButton";
import { getProduct } from "@/lib/shop.functions";
import mockup from "@/assets/guia-mockup.jpg";

export const Route = createFileRoute("/")({
  loader: () => getProduct(),
  head: () => ({
    meta: [
      { title: "Do Zero ao Primeiro Anúncio — Guia em PDF por R$ 10" },
      { name: "description", content: "Aprenda a criar anúncios do zero: da presença digital à publicação e acompanhamento no Meta Ads. Guia em PDF." },
      { property: "og:title", content: "Do Zero ao Primeiro Anúncio — Guia em PDF" },
      { property: "og:description", content: "Guia em PDF para iniciantes criarem e acompanharem seus primeiros anúncios no Meta Ads." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const topics = [
  { icon: Facebook, t: "Página do Facebook", d: "Criar e configurar sua Página do Facebook." },
  { icon: Instagram, t: "Instagram profissional", d: "Preparar o perfil profissional e organizar os dados comerciais." },
  { icon: MessageCircle, t: "WhatsApp Business", d: "Configurar o WhatsApp Business e os canais de contato." },
  { icon: Sparkles, t: "Inteligência artificial", d: "Usar IA para gerar ideias, textos publicitários e imagens." },
  { icon: Megaphone, t: "Campanhas no Meta Ads", d: "Criar sua campanha passo a passo." },
  { icon: Target, t: "Objetivo e público", d: "Escolher o objetivo da campanha e o público certo." },
  { icon: Wallet, t: "Orçamento e programação", d: "Definir orçamento, posicionamentos e programação." },
  { icon: Rocket, t: "Publicação", d: "Configurar o anúncio e publicá-lo." },
  { icon: BarChart3, t: "Métricas e ajustes", d: "Acompanhar métricas e identificar ajustes necessários." },
];

const problems = [
  "Você quer divulgar seu negócio, mas não sabe por onde começar.",
  "O Gerenciador de Anúncios parece confuso, com opções demais.",
  "Não sabe qual objetivo, público ou orçamento escolher.",
  "Tem medo de gastar dinheiro com uma campanha mal configurada.",
  "Seus perfis e canais de contato ainda não estão prontos para receber clientes.",
];

const faqs: [string, string][] = [
  ["Que tipo de material é?", "É um guia digital em PDF. Não inclui videoaulas, comunidade ou acompanhamento individual."],
  ["Como recebo o guia?", "Assim que o Mercado Pago confirmar o pagamento, você é levado à página de entrega com o botão para baixar o PDF. Guarde o link dessa página para voltar quando quiser."],
  ["Quais formas de pagamento?", "As disponíveis no checkout do Mercado Pago, como Pix e cartão. Você escolhe na hora do pagamento."],
  ["Paguei com Pix ou boleto e ainda está pendente. E agora?", "O guia é liberado automaticamente quando o pagamento é aprovado. A página do pedido se atualiza sozinha."],
  ["Preciso ter experiência?", "Não. O guia foi feito para iniciantes e começa pela preparação da sua presença digital."],
  ["Preciso investir em anúncios?", "Para publicar campanhas no Meta Ads é necessário definir um orçamento na própria plataforma, que é cobrado pela Meta, separado do guia."],
];

function Index() {
  const p = Route.useLoaderData();
  const cover = p.imageUrl ?? mockup;
  return (
    <main className="min-h-screen">
      <section className="bg-hero px-5 pb-16 pt-10 md:pt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase text-secondary-foreground">
              <FileText className="h-3.5 w-3.5" /> Guia em PDF para iniciantes
            </span>
            <h1 className="mt-5 font-display text-6xl leading-[0.9] tracking-wide md:text-7xl">
              APRENDA A CRIAR <span className="text-primary">ANÚNCIOS</span> DO <span className="text-secondary">ZERO</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              O guia <strong className="text-foreground">{p.title}</strong> ensina, passo a passo, desde a preparação da sua presença digital até a publicação e o acompanhamento dos seus anúncios.
            </p>
            <div className="mt-7 flex flex-col items-center gap-4 sm:flex-row md:items-center">
              <div>
                <div className="text-xs uppercase text-muted-foreground">Acesso ao PDF por</div>
                <div className="font-display text-5xl text-secondary">{brl(p.priceCents)}</div>
              </div>
              <BuyButton />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Pagamento seguro pelo Mercado Pago · Pix, cartão e outras opções</p>
          </div>
          <img src={cover} alt="Mockup do guia Do Zero ao Primeiro Anúncio em PDF" width={1024} height={1024} className="mx-auto w-full max-w-md rounded-2xl" />
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="section-title text-center">QUER ANUNCIAR, MAS <span className="text-primary">TRAVA</span> NA CONFIGURAÇÃO?</h2>
          <ul className="mt-8 space-y-3">
            {problems.map((x) => (
              <li key={x} className="flex gap-3 rounded-lg bg-card p-4">
                <AlertTriangle className="h-5 w-5 shrink-0 text-secondary" /> <span>{x}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-card/50 px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="section-title text-center">O QUE VOCÊ VAI <span className="text-secondary">APRENDER</span></h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map(({ icon: I, t, d }, i) => (
              <div key={t} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground"><I className="h-5 w-5" /></span>
                  <span className="font-display text-2xl text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-card p-6">
            <h2 className="section-title text-3xl md:text-4xl">SOBRE O <span className="text-primary">GUIA</span></h2>
            <p className="mt-3 text-muted-foreground">{p.description}</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>✔ Material digital em PDF, organizado em etapas</li>
              <li>✔ Do começo ao acompanhamento dos anúncios</li>
              <li>✔ Leia no celular, tablet ou computador</li>
              <li>✔ Download liberado após a confirmação do pagamento</li>
            </ul>
          </div>
          <div className="rounded-xl bg-card p-6">
            <h2 className="section-title text-3xl md:text-4xl">PARA QUEM <span className="text-secondary">É</span></h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li>→ Pequenos empreendedores e autônomos</li>
              <li>→ Quem nunca criou uma campanha no Meta Ads</li>
              <li>→ Quem quer organizar Facebook, Instagram e WhatsApp antes de anunciar</li>
              <li>→ Quem quer usar IA para criar textos e imagens de anúncios</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-card/50 px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="section-title text-center">PERGUNTAS FREQUENTES</h2>
          <Accordion type="single" collapsible className="mt-8">
            {faqs.map(([q, a]) => (
              <AccordionItem key={q} value={q}>
                <AccordionTrigger className="text-left">{q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="bg-hero px-5 py-20 text-center">
        <h2 className="section-title">SEU PRIMEIRO ANÚNCIO COMEÇA <span className="text-secondary">AGORA</span></h2>
        <p className="mt-3 text-muted-foreground">Guia completo em PDF por apenas</p>
        <div className="font-display text-6xl text-secondary">{brl(p.priceCents)}</div>
        <div className="mt-6"><BuyButton /></div>
      </section>
      <footer className="px-5 py-8 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Do Zero ao Primeiro Anúncio</footer>
    </main>
  );
}
