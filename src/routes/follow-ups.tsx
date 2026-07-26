import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageSquare, Star, Copy, Check } from "lucide-react";
import { TEMPLATES, FOLLOWUP_CATEGORIES } from "@/lib/aurora-data";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";

export const Route = createFileRoute("/follow-ups")({
  head: () => ({
    meta: [
      { title: "Follow-ups — Aurora" },
      { name: "description", content: "Templates de mensagens para representantes Cardápio Web." },
      { property: "og:title", content: "Follow-ups — Aurora" },
      { property: "og:description", content: "Mensagens prontas para colar no Kommo." },
    ],
  }),
  component: FollowUps,
});

function FollowUps() {
  const [cat, setCat] = useState<string>("Todas");
  const [favs, setFavs] = useLocalStorageState<string[]>("aurora.fu.favs", []);
  const [copied, setCopied] = useState<string | null>(null);

  const items = TEMPLATES.filter((t) => (cat === "Todas" ? true : cat === "Favoritos" ? favs.includes(t.id) : t.category === cat));

  const toggleFav = (id: string) => setFavs(favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id]);
  const copy = async (t: (typeof TEMPLATES)[number]) => {
    await navigator.clipboard.writeText(t.message);
    setCopied(t.id);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="space-y-6">
      <header>
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}
        >
          <MessageSquare size={14} /> ARSENAL DE MENSAGENS
        </div>
        <h1 className="text-3xl font-bold mt-3">Follow-ups</h1>
        <p className="text-muted-foreground mt-1 text-sm">Mensagens prontas para copiar e fechar negócios mais rápido — cole direto no chat do Kommo.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {FOLLOWUP_CATEGORIES.map((c) => {
          const active = cat === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all inline-flex items-center gap-1.5 ${
                active ? "gradient-primary text-white shadow-card" : "bg-card border text-muted-foreground"
              }`}
            >
              {c === "Favoritos" && <Star size={14} fill={active ? "currentColor" : "none"} />}
              {c}
              {c === "Favoritos" && <span className="opacity-80 text-xs">{favs.length}</span>}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((t) => (
          <div key={t.id} className="bg-card rounded-2xl shadow-card p-5 flex flex-col">
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "var(--category-label)" }}>
                {t.category}
              </span>
              <button type="button" onClick={() => toggleFav(t.id)} className="text-muted-foreground hover:text-amber-500">
                <Star size={18} fill={favs.includes(t.id) ? "#f2b53c" : "none"} color={favs.includes(t.id) ? "#f2b53c" : "currentColor"} />
              </button>
            </div>
            <h3 className="font-bold mt-1">{t.title}</h3>
            <div className="mt-3 flex-1 max-h-40 overflow-y-auto text-sm bg-muted/50 rounded-xl p-3 whitespace-pre-wrap leading-relaxed">{t.message}</div>
            <button type="button" onClick={() => copy(t)} className="mt-4 gradient-primary text-white rounded-xl py-2 text-sm font-semibold inline-flex items-center justify-center gap-2">
              {copied === t.id ? (
                <>
                  <Check size={16} /> Copiado!
                </>
              ) : (
                <>
                  <Copy size={16} /> Copiar
                </>
              )}
            </button>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-full text-center text-muted-foreground py-8">Nenhum template nesta categoria.</div>}
      </div>
    </div>
  );
}
