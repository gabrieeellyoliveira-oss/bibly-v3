import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, ChevronRight, Sparkles } from "lucide-react";
import { PLAYBOOK, CATEGORIES } from "@/lib/aurora-data";
import { IconChip } from "@/components/bibly/IconChip";

export const Route = createFileRoute("/playbook/")({
  head: () => ({
    meta: [
      { title: "Playbook — Aurora" },
      { name: "description", content: "Playbook comercial e operacional da Squad Onça." },
      { property: "og:title", content: "Playbook — Aurora" },
      { property: "og:description", content: "Onboarding, produto, IPP, objeções, SPIN, AIDA e mais." },
    ],
  }),
  component: PlaybookPage,
});

function PlaybookPage() {
  const [cat, setCat] = useState("Todas");
  const nav = useNavigate();
  const items = cat === "Todas" ? PLAYBOOK : PLAYBOOK.filter((p) => p.category === cat);

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <IconChip icon={BookOpen} tone="primary" size="xl" gradient />
        <div>
          <div className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">Base de conhecimento</div>
          <h1 className="text-3xl font-bold">Playbook</h1>
          <p className="text-muted-foreground mt-1 text-sm">Tudo que você precisa para vender, ativar e reter — em um só lugar.</p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              cat === c ? "gradient-primary text-white shadow-card" : "bg-card border text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((t) => (
          <button
            key={t.slug}
            type="button"
            onClick={() => nav({ to: "/playbook/$slug", params: { slug: t.slug } })}
            className="text-left bg-card rounded-2xl shadow-card p-5 hover:-translate-y-0.5 transition-transform group"
          >
            <div className="flex items-start justify-between">
              <IconChip icon={Sparkles} tone={t.widget ? "magenta" : "primary"} />
              {t.badge && (
                <span
                  className="text-[10px] font-bold px-2 py-1 rounded-md"
                  style={{ backgroundColor: t.badge === "Novo" ? "#dbeafe" : "#fef3c7", color: t.badge === "Novo" ? "#1d4ed8" : "#92400e" }}
                >
                  {t.badge.toUpperCase()}
                </span>
              )}
            </div>
            <div className="text-[10px] font-semibold tracking-widest uppercase mt-4" style={{ color: "var(--category-label)" }}>
              {t.category}
            </div>
            <h3 className="font-bold text-lg mt-1">{t.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{t.summary}</p>
            <div className="mt-4 flex items-center text-sm font-semibold text-primary">
              Ler <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
