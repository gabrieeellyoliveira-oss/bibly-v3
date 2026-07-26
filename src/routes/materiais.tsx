import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, Image as ImageIcon } from "lucide-react";
import { IconChip } from "@/components/bibly/IconChip";
import { MATERIALS } from "@/lib/aurora-data";

export const Route = createFileRoute("/materiais")({
  head: () => ({
    meta: [
      { title: "Materiais — Aurora" },
      { name: "description", content: "Biblioteca de materiais prontos para uso da PSM." },
      { property: "og:title", content: "Materiais — Aurora" },
      { property: "og:description", content: "PDFs, infográficos e imagens para apoio comercial." },
    ],
  }),
  component: Materiais,
});

function Materiais() {
  const download = (m: (typeof MATERIALS)[number]) => {
    if (m.href && m.href !== "#") {
      const a = document.createElement("a");
      a.href = m.href;
      a.download = m.href.split("/").pop() ?? `${m.title}.png`;
      a.click();
      return;
    }
    const blob = new Blob([`Material: ${m.title}\n\n${m.desc}`], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${m.title.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <IconChip icon={Download} tone="primary" size="xl" gradient />
        <div>
          <h1 className="text-3xl font-bold">Materiais</h1>
          <p className="text-muted-foreground text-sm mt-1">Biblioteca de materiais prontos para baixar e usar em conversas com o cliente.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {MATERIALS.map((m) => {
          const hasRealImage = m.type === "Infográfico" && m.href && m.href !== "#";
          return (
            <div key={m.id} className="bg-card rounded-2xl shadow-card overflow-hidden flex flex-col">
              <div className="h-40 gradient-soft flex items-center justify-center relative overflow-hidden">
                {hasRealImage ? (
                  <img src={m.href} alt={m.title} className="h-full w-full object-cover" />
                ) : (
                  <IconChip icon={m.type === "PDF" ? FileText : ImageIcon} tone="magenta" size="xl" />
                )}
                <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-md bg-white shadow-sm">{m.type.toUpperCase()}</span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold">{m.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 flex-1">{m.desc}</p>
                <button
                  type="button"
                  onClick={() => download(m)}
                  className="mt-4 gradient-primary text-white rounded-xl py-2 text-sm font-semibold inline-flex items-center justify-center gap-2"
                >
                  <Download size={16} /> Baixar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
