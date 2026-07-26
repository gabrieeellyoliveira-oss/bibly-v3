import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { IconChip } from "@/components/bibly/IconChip";

function makePlaceholder(title: string, subtitle: string) {
  return function Placeholder() {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex">
            <IconChip icon={Construction} tone="magenta" size="xl" gradient />
          </div>
          <h1 className="text-3xl font-bold mt-4">{title}</h1>
          <p className="text-muted-foreground mt-2">{subtitle}</p>
          <div className="mt-4 inline-block text-[10px] font-bold tracking-widest px-3 py-1 rounded-full" style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}>
            EM CONSTRUÇÃO
          </div>
        </div>
      </div>
    );
  };
}

export const Route = createFileRoute("/carteira")({
  head: () => ({ meta: [{ title: "Carteira — Aurora" }, { name: "description", content: "Visão consolidada da carteira." }] }),
  component: makePlaceholder("Carteira", "Aqui virá a visão detalhada da sua carteira de representantes."),
});
