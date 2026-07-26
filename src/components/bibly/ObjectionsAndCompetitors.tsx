import { useState, useMemo } from "react";
import { Search, Shield, Check, Minus, X, Swords } from "lucide-react";
import { OBJECTIONS, OBJECTION_TYPES, COMPETITORS, CW, FEATURE_TABS, ALL_FEATURES, type Competitor } from "@/lib/aurora-data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function ObjectionsAndCompetitors() {
  return (
    <Tabs defaultValue="obj" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="obj">Objeções</TabsTrigger>
        <TabsTrigger value="conc">Concorrentes</TabsTrigger>
      </TabsList>
      <TabsContent value="obj">
        <ObjectionsView />
      </TabsContent>
      <TabsContent value="conc">
        <CompetitorsView />
      </TabsContent>
    </Tabs>
  );
}

function ObjectionsView() {
  const [type, setType] = useState<string>("Todas");
  const [q, setQ] = useState("");
  const filtered = OBJECTIONS.filter(
    (o) => (type === "Todas" || o.type === type) && (q === "" || o.title.toLowerCase().includes(q.toLowerCase()) || o.answer.toLowerCase().includes(q.toLowerCase())),
  );

  const counts = OBJECTION_TYPES.reduce<Record<string, number>>((m, t) => {
    m[t] = t === "Todas" ? OBJECTIONS.length : OBJECTIONS.filter((o) => o.type === t).length;
    return m;
  }, {});

  return (
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}>
        <Shield size={14} /> CONTORNO DE OBJEÇÕES
      </div>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar objeção..." className="pl-9" />
      </div>
      <div className="flex flex-wrap gap-2">
        {OBJECTION_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${type === t ? "gradient-primary text-white border-transparent" : "bg-card text-muted-foreground"}`}
          >
            {t} <span className="opacity-70 ml-1">{counts[t]}</span>
          </button>
        ))}
      </div>
      <div className="text-sm text-muted-foreground">
        {filtered.length} de {OBJECTIONS.length} objeções
      </div>
      <Accordion type="single" collapsible className="space-y-2">
        {filtered.map((o, i) => (
          <AccordionItem key={i} value={`o${i}`} className="border rounded-xl px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <span className="text-[10px] font-bold px-2 py-1 rounded" style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}>
                  {o.type.toUpperCase()}
                </span>
                <span className="font-semibold">{o.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-foreground/85 leading-relaxed">{o.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function StatusCell({ v }: { v: "full" | "partial" | "no" }) {
  if (v === "full") return <Check size={18} className="text-emerald-600" strokeWidth={3} />;
  if (v === "partial") return <Minus size={18} className="text-amber-500" strokeWidth={3} />;
  return <X size={16} className="text-muted-foreground/40" />;
}

function CompetitorsView() {
  const [q, setQ] = useState("");
  const [pillar, setPillar] = useState<keyof typeof FEATURE_TABS>("Cardápio Digital");
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<Competitor | null>(null);

  const filtered = COMPETITORS.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  const visiblePills = showAll ? COMPETITORS : COMPETITORS.slice(0, 10);
  const cols = FEATURE_TABS[pillar];

  return (
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}>
        <Swords size={14} /> MATRIZ DE CONCORRENTES
      </div>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar concorrente..." className="pl-9" />
      </div>
      <div className="flex flex-wrap gap-2">
        {visiblePills.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => setSelected(c)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-card border hover:border-primary hover:text-primary transition-colors"
          >
            {c.name}
          </button>
        ))}
        {!showAll && COMPETITORS.length > 10 && (
          <button type="button" onClick={() => setShowAll(true)} className="px-3 py-1.5 rounded-full text-xs font-semibold border-dashed border-2 text-muted-foreground">
            +{COMPETITORS.length - 10} mais
          </button>
        )}
      </div>

      <Tabs value={pillar} onValueChange={(v) => setPillar(v as keyof typeof FEATURE_TABS)}>
        <TabsList>
          {Object.keys(FEATURE_TABS).map((k) => (
            <TabsTrigger key={k} value={k}>
              {k}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="text-left p-3 font-semibold sticky left-0 bg-muted/60">Concorrente</th>
              <th className="text-left p-3 font-semibold">Preço</th>
              {cols.map((c) => (
                <th key={c} className="p-3 font-semibold text-center whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ backgroundColor: "var(--accent)" }} className="font-semibold">
              <td className="p-3 sticky left-0" style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}>
                Cardápio Web
              </td>
              <td className="p-3">{CW.price}</td>
              {cols.map((c) => (
                <td key={c} className="p-3 text-center">
                  <div className="flex justify-center">
                    <StatusCell v={CW.features[c]} />
                  </div>
                </td>
              ))}
            </tr>
            {filtered.map((comp) => (
              <tr key={comp.name} className="border-t hover:bg-muted/40 cursor-pointer" onClick={() => setSelected(comp)}>
                <td className="p-3 sticky left-0 bg-card font-medium">{comp.name}</td>
                <td className="p-3 text-muted-foreground text-xs">{comp.price}</td>
                {cols.map((c) => (
                  <td key={c} className="p-3 text-center">
                    <div className="flex justify-center">
                      <StatusCell v={comp.features[c]} />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ComparisonDialog comp={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}

function ComparisonDialog({ comp, onOpenChange }: { comp: Competitor | null; onOpenChange: (o: boolean) => void }) {
  const compare = useMemo(() => {
    if (!comp) return null;
    const same: string[] = [];
    const partial: string[] = [];
    const onlyCw: string[] = [];
    const onlyComp: string[] = [];
    ALL_FEATURES.forEach((f) => {
      const cw = CW.features[f];
      const c = comp.features[f];
      if (cw === "full" && c === "full") same.push(f);
      else if (cw === "full" && c === "partial") partial.push(f);
      else if (cw === "full" && c === "no") onlyCw.push(f);
      else if (cw === "no" && c === "full") onlyComp.push(f);
    });
    return { same, partial, onlyCw, onlyComp };
  }, [comp]);

  if (!comp || !compare) return null;

  const argumento = `A Cardápio Web entrega ${compare.onlyCw.length} funcionalidades exclusivas${
    compare.onlyCw.length ? ` (${compare.onlyCw.slice(0, 3).join(", ")}${compare.onlyCw.length > 3 ? "…" : ""})` : ""
  } que ${comp.name} não cobre. Temos ${compare.same.length} pontos em comum e ${compare.partial.length} onde eles entregam parcial. ${comp.note ?? ""}${
    compare.onlyComp.length ? ` Reconheça que eles têm ${compare.onlyComp.join(", ")}, mas o pacote completo da CW compensa.` : ""
  }`;

  return (
    <Dialog open={!!comp} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Cardápio Web vs. {comp.name}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          Preço do concorrente: <b className="text-foreground">{comp.price}</b>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#e7f8ef" }}>
            <div className="text-2xl font-bold text-emerald-700">{compare.same.length}</div>
            <div className="text-xs font-semibold text-emerald-800 mt-1">Também têm</div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#fef3c7" }}>
            <div className="text-2xl font-bold text-amber-700">{compare.partial.length}</div>
            <div className="text-xs font-semibold text-amber-800 mt-1">Fazem parcial</div>
          </div>
          <div className="rounded-xl p-4 text-center gradient-soft">
            <div className="text-2xl font-bold text-gradient">{compare.onlyCw.length}</div>
            <div className="text-xs font-semibold text-primary mt-1">Só a CW tem</div>
          </div>
        </div>

        {compare.onlyCw.length > 0 && (
          <div className="mt-2">
            <div className="text-sm font-semibold mb-2">Só a Cardápio Web tem</div>
            <ul className="space-y-1">
              {compare.onlyCw.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-emerald-600" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {compare.same.length > 0 && (
          <div className="mt-2">
            <div className="text-sm font-semibold mb-2">Funcionalidades em comum</div>
            <div className="flex flex-wrap gap-1.5">
              {compare.same.map((f) => (
                <span key={f} className="text-xs px-2 py-1 rounded-full bg-muted">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 p-4 rounded-xl gradient-soft border border-primary/20">
          <div className="text-xs font-bold tracking-widest uppercase text-primary mb-2">Argumento de fechamento</div>
          <p className="text-sm leading-relaxed">{argumento}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
