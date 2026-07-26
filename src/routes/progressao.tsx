import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { IconChip } from "@/components/bibly/IconChip";
import { LEVELS } from "@/lib/aurora-data";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export const Route = createFileRoute("/progressao")({
  head: () => ({
    meta: [
      { title: "Progressão de Carreira — Aurora" },
      { name: "description", content: "Trilha de níveis, OTE e critérios da carreira PSM." },
      { property: "og:title", content: "Progressão de Carreira — Aurora" },
      { property: "og:description", content: "Do JR1 ao SR3 com bases, comissões e OTE." },
    ],
  }),
  component: Progressao,
});

const TIER_COLORS = { jr: "#b98fff", pl: "#6d4cff", sr: "#d9468f" };
const TIER_LABEL = { jr: "Júnior", pl: "Pleno", sr: "Sênior" };
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });

function Progressao() {
  const [selected, setSelected] = useState("JR3");
  const chart = LEVELS.map((l) => ({ id: l.id, ote: l.estrela.m3.ote, tier: l.tier }));

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <IconChip icon={Award} tone="primary" size="xl" gradient />
        <div>
          <h1 className="text-3xl font-bold">Progressão de Carreira</h1>
          <p className="text-muted-foreground text-sm mt-1">Trilha PSM: 9 níveis, 2 faixas (Base e Estrela), 3 metas cada.</p>
        </div>
      </header>

      <div className="bg-card rounded-2xl shadow-card p-6">
        <div className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4">Trilha de níveis</div>
        <div className="overflow-x-auto">
          <div className="flex items-center min-w-max gap-2">
            {LEVELS.map((l, i) => (
              <div key={l.id} className="flex items-center">
                <button type="button" onClick={() => setSelected(l.id)} className="flex flex-col items-center gap-2 group">
                  <div
                    className={`h-16 w-16 rounded-2xl flex items-center justify-center text-white font-bold shadow-card transition-transform ${selected === l.id ? "scale-110 ring-4 ring-primary/20" : ""}`}
                    style={{ backgroundColor: TIER_COLORS[l.tier] }}
                  >
                    {l.id}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground">{brl(l.base)}</div>
                </button>
                {i < LEVELS.length - 1 && <div className="w-8 h-0.5 bg-border mx-1" />}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t">
          {(["jr", "pl", "sr"] as const).map((t) => (
            <div key={t} className="flex items-center gap-2 text-sm">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: TIER_COLORS[t] }} />
              {TIER_LABEL[t]}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-card p-6">
        <div className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1">Evolução de OTE</div>
        <div className="text-lg font-bold mb-4">Faixa Estrela — Meta 3</div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chart} layout="vertical" margin={{ left: 20, right: 40 }}>
            <XAxis type="number" stroke="#8b90a6" fontSize={11} tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`} />
            <YAxis dataKey="id" type="category" stroke="#8b90a6" fontSize={12} width={40} />
            <Tooltip formatter={(v: number) => brl(v)} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
            <Bar dataKey="ote" radius={[0, 8, 8, 0]}>
              {chart.map((c, i) => (
                <Cell key={i} fill={TIER_COLORS[c.tier as keyof typeof TIER_COLORS]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-2xl shadow-card p-6">
        <div className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4">Tabela completa de comissões e critérios</div>
        <Accordion type="single" collapsible defaultValue={selected}>
          {LEVELS.map((l) => (
            <AccordionItem key={l.id} value={l.id}>
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: TIER_COLORS[l.tier] }}>
                    {l.id}
                  </div>
                  <span className="font-semibold">
                    {TIER_LABEL[l.tier]} — base {brl(l.base)}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-muted-foreground text-xs uppercase">
                      <tr>
                        <th className="text-left p-2">Faixa</th>
                        <th className="text-left p-2">Meta 1</th>
                        <th className="text-left p-2">Meta 2</th>
                        <th className="text-left p-2">Meta 3</th>
                        <th className="text-left p-2">Elegibilidade</th>
                        <th className="text-left p-2">Desclassificação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: "Base", data: l.base_meta },
                        { label: "Estrela", data: l.estrela },
                      ].map((row) => (
                        <tr key={row.label} className="border-t">
                          <td className="p-2 font-semibold">{row.label}</td>
                          {(["m1", "m2", "m3"] as const).map((k) => (
                            <td key={k} className="p-2">
                              <div className="font-medium">{row.data[k].pct}%</div>
                              <div className="text-xs text-muted-foreground">OTE {brl(row.data[k].ote)}</div>
                            </td>
                          ))}
                          <td className="p-2 text-xs">{l.criterio}</td>
                          <td className="p-2 text-xs text-destructive">{l.desclassificacao}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
