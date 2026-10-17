import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Painel administrativo" },
      { name: "description", content: "Acesso restrito ao administrador." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Entrar — Painel administrativo" },
      { property: "og:description", content: "Acesso restrito." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <form
        className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError(null);
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          setLoading(false);
          if (error) return setError("E-mail ou senha inválidos.");
          navigate({ to: "/admin" });
        }}
      >
        <h1 className="font-display text-4xl tracking-wide">ÁREA DO ADMIN</h1>
        <input className="field" type="email" placeholder="E-mail" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="field" type="password" placeholder="Senha" required value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-primary">{error}</p>}
        <button className="btn-cta w-full" disabled={loading}>{loading ? "ENTRANDO..." : "ENTRAR"}</button>
      </form>
    </main>
  );
}
