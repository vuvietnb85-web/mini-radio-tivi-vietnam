import { createFileRoute } from "@tanstack/react-router";
import { catalogJson, loadCatalog } from "@/lib/catalog.server";
import { FALLBACK_FEEDS } from "@/lib/feeds";

export const Route = createFileRoute("/api/catalog")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const payload = await loadCatalog();
          return catalogJson(payload);
        } catch (error) {
          console.error("[catalog]", error);
          return catalogJson({ feeds: FALLBACK_FEEDS });
        }
      },
    },
  },
});
