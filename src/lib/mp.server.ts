// Server-only Mercado Pago helpers. Never import from client code.
const MP_API = "https://api.mercadopago.com";

export function mpToken() {
  const t = process.env["MP_ACCESS_TOKEN"];
  if (!t) throw new Error("Pagamento indisponível: credencial do Mercado Pago não configurada.");
  return t;
}

export async function mpFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(MP_API + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${mpToken()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("[MP] error", res.status, body);
    throw new Error(`Mercado Pago respondeu ${res.status}`);
  }
  return body as T;
}

export type OrderStatus = "created" | "pending" | "approved" | "rejected" | "cancelled" | "refunded";

export function mapMpStatus(s: string): OrderStatus {
  switch (s) {
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    case "cancelled":
      return "cancelled";
    case "refunded":
    case "charged_back":
      return "refunded";
    default:
      return "pending"; // pending, in_process, authorized, in_mediation
  }
}

/** Applies a payment fetched from the MP API to its order. Idempotent. */
export async function applyPayment(payment: any) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const orderId = payment?.external_reference;
  if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) return null;

  const { data: order } = await supabaseAdmin.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return null;

  let status = mapMpStatus(payment.status);
  // Amount/currency must match what the server priced
  const paidCents = Math.round(Number(payment.transaction_amount) * 100);
  if (status === "approved" && (paidCents !== order.amount_cents || payment.currency_id !== "BRL")) {
    console.error("[MP] amount mismatch", orderId, paidCents, order.amount_cents);
    return order;
  }
  // Once approved, only a refund/chargeback can change it (ignore stale pending/rejected notifications of other attempts)
  if (order.status === "approved" && status !== "refunded") return order;
  if (order.status === status && order.mp_payment_id === String(payment.id)) return order;

  const { data: updated } = await supabaseAdmin
    .from("orders")
    .update({
      status,
      mp_payment_id: String(payment.id),
      mp_status_detail: payment.status_detail ?? null,
      payer_email: payment.payer?.email ?? order.payer_email,
      approved_at: status === "approved" ? (order.approved_at ?? new Date().toISOString()) : order.approved_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select("*")
    .single();
  return updated;
}

/** Looks up payments for an order directly on the MP API and syncs. */
export async function syncOrder(orderId: string) {
  const res = await mpFetch<{ results: any[] }>(
    `/v1/payments/search?external_reference=${encodeURIComponent(orderId)}&sort=date_created&criteria=desc`,
  );
  const list = res.results ?? [];
  const pick = list.find((p) => p.status === "approved") ?? list[0];
  if (pick) await applyPayment(pick);
}

/** Verifies MP webhook x-signature (HMAC-SHA256). */
export async function verifyMpSignature(request: Request, dataId: string) {
  const secret = process.env["MP_WEBHOOK_SECRET"];
  if (!secret) {
    console.warn("[MP] MP_WEBHOOK_SECRET ausente — assinatura não verificada (pagamento ainda é consultado na API).");
    return true;
  }
  const sig = request.headers.get("x-signature") ?? "";
  const reqId = request.headers.get("x-request-id") ?? "";
  const parts: { ts?: string; v1?: string } = Object.fromEntries(sig.split(",").map((p) => p.trim().split("=") as [string, string]));
  if (!parts.ts || !parts.v1) return false;
  const manifest = `id:${dataId.toLowerCase()};request-id:${reqId};ts:${parts.ts};`;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(manifest));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex === parts.v1;
}
