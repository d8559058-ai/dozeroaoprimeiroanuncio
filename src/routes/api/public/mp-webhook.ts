import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/mp-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const body = (await request.json().catch(() => ({}))) as any;
        const type = body?.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
        const dataId = String(url.searchParams.get("data.id") ?? body?.data?.id ?? "");
        if (type !== "payment" || !/^\d+$/.test(dataId)) return new Response("ignored", { status: 200 });

        const { verifyMpSignature, mpFetch, applyPayment } = await import("@/lib/mp.server");
        if (!(await verifyMpSignature(request, dataId))) return new Response("invalid signature", { status: 401 });

        try {
          // Never trust the notification body: always fetch the payment from the API
          const payment = await mpFetch(`/v1/payments/${dataId}`);
          await applyPayment(payment);
          return new Response("ok", { status: 200 });
        } catch (e) {
          console.error("[MP webhook]", e);
          return new Response("error", { status: 500 }); // MP will retry
        }
      },
    },
  },
});
