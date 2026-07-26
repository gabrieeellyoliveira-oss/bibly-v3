import { Download, FileDown, ImageIcon } from "lucide-react";

import { IconChip } from "@/components/bibly/Playbook";

// ---------------------------------------------------------------------------
// Materiais — biblioteca de materiais para download que todo PSM precisa
// (infográficos, tabelas, PDFs). Cada item aponta pra um arquivo em /public.
// ---------------------------------------------------------------------------

type Material = {
  id: string;
  titulo: string;
  descricao: string;
  arquivo: string;
  nomeArquivo: string;
  tipo: "imagem" | "pdf";
};

const MATERIAIS: Material[] = [
  {
    id: "planos-modulos",
    titulo: "Planos e Módulos",
    descricao: "Infográfico com todos os planos, módulos e valores da Cardápio Web para usar em conversas com o cliente.",
    arquivo: "/materiais-planos-modulos.png",
    nomeArquivo: "Planos-e-Modulos-Cardapio-Web.png",
    tipo: "imagem",
  },
];

const TIPO_META: Record<Material["tipo"], { label: string; icon: typeof ImageIcon }> = {
  imagem: { label: "Imagem", icon: ImageIcon },
  pdf: { label: "PDF", icon: FileDown },
};

export function Materiais() {
  return (
    <div className="h-screen overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-8 sm:px-10">
        <div className="mb-1.5 flex items-center gap-3.5">
          <IconChip icon={FileDown} size={48} radius={14} />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Materiais</h1>
        </div>
        <p className="mb-7 mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Biblioteca de materiais prontos para baixar e usar em conversas com o cliente.
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {MATERIAIS.map((m) => {
            const tipoMeta = TIPO_META[m.tipo];
            return (
              <div
                key={m.id}
                className="flex flex-col overflow-hidden rounded-[20px] border border-border bg-card"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-center justify-center bg-muted/60 p-4" style={{ height: 160 }}>
                  {m.tipo === "imagem" ? (
                    <img src={m.arquivo} alt={m.titulo} className="max-h-full max-w-full rounded-lg object-contain" />
                  ) : (
                    <tipoMeta.icon className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span
                    className="mb-2 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide"
                    style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}
                  >
                    <tipoMeta.icon className="h-3 w-3" /> {tipoMeta.label}
                  </span>
                  <h3 className="text-[15px] font-bold text-foreground">{m.titulo}</h3>
                  <p className="mt-1 flex-1 text-[13px] leading-relaxed text-muted-foreground">{m.descricao}</p>
                  <a
                    href={m.arquivo}
                    download={m.nomeArquivo}
                    className="mt-4 flex h-9 items-center justify-center gap-1.5 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundImage: "var(--gradient-primary)" }}
                  >
                    <Download className="h-4 w-4" /> Baixar
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
