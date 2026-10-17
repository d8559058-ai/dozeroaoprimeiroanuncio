import { createFileRoute } from "@tanstack/react-router";

// Serves only the public product cover image from private storage.
export const Route = createFileRoute("/api/public/product-image")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: p } = await supabaseAdmin.from("products").select("image_path").eq("id", "guia").single();
        if (!p?.image_path) return new Response("not found", { status: 404 });
        const { data } = await supabaseAdmin.storage.from("product-images").download(p.image_path);
        if (!data) return new Response("not found", { status: 404 });
        return new Response(data, {
          headers: { "content-type": data.type || "image/jpeg", "cache-control": "public, max-age=3600" },
        });
      },
    },
  },
});
