import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { IconChip } from "@/components/bibly/IconChip";

export const Route = createFileRoute("/pipeline")({
  head: () => ({ meta: [{ title: "Pipeline — Aurora" }, { name: "description", content: "Fluxo de oportunidades por etapa." }] }),
  component: () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="inline-flex">
          <IconChip icon={Construction} tone="magenta" size="xl" gradient />
        </div>
        <h1 className="text-3xl font-bold mt-4">Pipeline</h1>
        <p className="text-muted-foreground mt-2">Kanban do funil de canal — em breve.</p>
        <div className="mt-4 inline-block text-[10px] font-bold tracking-widest px-3 py-1 rounded-full" style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}>
          EM CONSTRUÇÃO
        </div>
      </div>
    </div>
  ),
});
