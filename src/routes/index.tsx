import { createFileRoute } from "@tanstack/react-router";
import { StagePlayer } from "@/components/stage-player";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <StagePlayer />;
}
