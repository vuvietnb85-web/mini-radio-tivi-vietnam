import { createFileRoute } from "@tanstack/react-router";
import { proxyMedia } from "@/lib/media.server";

export const Route = createFileRoute("/api/media")({
  server: {
    handlers: {
      GET: ({ request }) => proxyMedia(request),
    },
  },
});
