import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { createCheckout } from "@/lib/shop.functions";

export function BuyButton({ label = "QUERO COMEÇAR A APRENDER" }: { label?: string }) {
  const start = useServerFn(createCheckout);
  const [loading, setLoading] = useState(false);
  return (
    <button
      className="btn-cta w-full sm:w-auto"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const r = await start();
          window.location.href = r.url;
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Não foi possível iniciar o pagamento.");
          setLoading(false);
        }
      }}
    >
      {loading ? "ABRINDO CHECKOUT..." : label}
    </button>
  );
}
