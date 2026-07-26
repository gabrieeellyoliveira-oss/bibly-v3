import { useState } from "react";
import { Award, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";

import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { IconChip } from "@/components/bibly/Playbook";
import { Panel } from "@/components/bibly/editors";

// ---------------------------------------------------------------------------
// Progressão de Carreira — trilha horizontal de níveis, evolução de OTE na
// Meta 3 e tabela completa de comissões/critérios por nível (expansível).
// ---------------------------------------------------------------------------

type Tier = "JR" | "PL" | "SR";

type Faixa = {
  nome: "Base" | "Estrela";
  baseSalarial: number | null;
  meta1: { pct: number; ote: number };
  meta2: { pct: number; ote: number };
  meta3: { pct: number; ote: number };
  criterios: string;
};

type Nivel = { id: string; label: string; tier: Tier; baseSalarial: number; faixas: Faixa[] };

const TIER_COLOR: Record<Tier, string> = { JR: "#9b7bff", PL: "#6d4cff", SR: "#d9468f" };
const TIER_LABEL: Record<Tier, string> = { JR: "Júnior", PL: "Pleno", SR: "Sênior" };

const CRIT_BASE = "Ramp-up concluído em caso de novato; Meta 3 nos últimos 2 meses";
const CRIT_ESTRELA = "Meta 3 (1 mês, no mês vigente) / se não bater Meta 3 na faixa 2, desce para o nível anterior";

function nivel(id: string, tier: Tier, baseSalarial: number, faixas: Omit<Faixa, "criterios">[]): Nivel {
  return {
    id,
    label: id,
    tier,
    baseSalarial,
    faixas: faixas.map((f, i) => ({ ...f, criterios: i === 0 ? CRIT_BASE : CRIT_ESTRELA })),
  };
}

const NIVEIS: Nivel[] = [
  nivel("JR 1", "JR", 1809.51, [
    { nome: "Base", baseSalarial: 1809.51, meta1: { pct: 20, ote: 2171.41 }, meta2: { pct: 25, ote: 2261.89 }, meta3: { pct: 30, ote: 2352.36 } },
    { nome: "Estrela", baseSalarial: null, meta1: { pct: 30, ote: 2352.36 }, meta2: { pct: 35, ote: 2442.84 }, meta3: { pct: 40, ote: 2533.31 } },
  ]),
  nivel("JR 2", "JR", 1988.48, [
    { nome: "Base", baseSalarial: 1988.48, meta1: { pct: 20, ote: 2386.18 }, meta2: { pct: 25, ote: 2485.6 }, meta3: { pct: 30, ote: 2585.02 } },
    { nome: "Estrela", baseSalarial: null, meta1: { pct: 30, ote: 2585.02 }, meta2: { pct: 35, ote: 2684.45 }, meta3: { pct: 40, ote: 2783.87 } },
  ]),
  nivel("JR 3", "JR", 2185.14, [
    { nome: "Base", baseSalarial: 2185.14, meta1: { pct: 20, ote: 2622.17 }, meta2: { pct: 25, ote: 2731.43 }, meta3: { pct: 30, ote: 2840.68 } },
    { nome: "Estrela", baseSalarial: null, meta1: { pct: 30, ote: 2840.68 }, meta2: { pct: 35, ote: 2949.94 }, meta3: { pct: 40, ote: 3059.2 } },
  ]),
  nivel("PL 1", "PL", 2401.25, [
    { nome: "Base", baseSalarial: 2401.25, meta1: { pct: 25, ote: 3001.56 }, meta2: { pct: 30, ote: 3121.62 }, meta3: { pct: 45, ote: 3481.81 } },
    { nome: "Estrela", baseSalarial: null, meta1: { pct: 30, ote: 3121.62 }, meta2: { pct: 35, ote: 3241.69 }, meta3: { pct: 50, ote: 3601.88 } },
  ]),
  nivel("PL 2", "PL", 2617.36, [
    { nome: "Base", baseSalarial: 2617.36, meta1: { pct: 25, ote: 3271.7 }, meta2: { pct: 30, ote: 3402.57 }, meta3: { pct: 45, ote: 3795.17 } },
    { nome: "Estrela", baseSalarial: null, meta1: { pct: 30, ote: 3402.57 }, meta2: { pct: 35, ote: 3533.44 }, meta3: { pct: 50, ote: 3926.04 } },
  ]),
  nivel("PL 3", "PL", 2852.93, [
    { nome: "Base", baseSalarial: 2852.93, meta1: { pct: 25, ote: 3566.16 }, meta2: { pct: 30, ote: 3708.81 }, meta3: { pct: 45, ote: 4136.75 } },
    { nome: "Estrela", baseSalarial: null, meta1: { pct: 30, ote: 3708.81 }, meta2: { pct: 35, ote: 3851.46 }, meta3: { pct: 50, ote: 4279.4 } },
  ]),
  nivel("SR 1", "SR", 3109.69, [
    { nome: "Base", baseSalarial: 3109.69, meta1: { pct: 25, ote: 3887.11 }, meta2: { pct: 30, ote: 4042.6 }, meta3: { pct: 45, ote: 4509.05 } },
    { nome: "Estrela", baseSalarial: null, meta1: { pct: 30, ote: 4042.6 }, meta2: { pct: 35, ote: 4198.08 }, meta3: { pct: 50, ote: 4664.53 } },
  ]),
  nivel("SR 2", "SR", 3389.56, [
    { nome: "Base", baseSalarial: 3389.56, meta1: { pct: 25, ote: 4236.95 }, meta2: { pct: 30, ote: 4406.43 }, meta3: { pct: 45, ote: 4914.86 } },
    { nome: "Estrela", baseSalarial: null, meta1: { pct: 30, ote: 4406.43 }, meta2: { pct: 35, ote: 4575.91 }, meta3: { pct: 50, ote: 5084.34 } },
  ]),
  nivel("SR 3", "SR", 3694.62, [
    { nome: "Base", baseSalarial: 3694.62, meta1: { pct: 25, ote: 4618.27 }, meta2: { pct: 30, ote: 4803.01 }, meta3: { pct: 45, ote: 5357.2 } },
    { nome: "Estrela", baseSalarial: null, meta1: { pct: 30, ote: 4803.01 }, meta2: { pct: 35, ote: 4987.74 }, meta3: { pct: 50, ote: 5541.93 } },
  ]),
];

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ProgressaoCarreira() {
  const [selecionado, setSelecionado] = useState(NIVEIS[0].id);

  const chartData = NIVEIS.map((n) => ({
    nivel: n.id,
    ote: n.faixas[1].meta3.ote,
    tier: n.tier,
  }));

  return (
    <div className="h-screen overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-8 sm:px-10">
        <div className="mb-1.5 flex items-center gap-3.5">
          <IconChip icon={Award} size={48} radius={14} />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Progressão de Carreira</h1>
        </div>
        <p className="mb-7 mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Evolução salarial e de comissão por nível de senioridade, dentro do mesmo cargo de representante.
        </p>

        {/* Trilha de níveis */}
        <Panel title="Trilha de níveis" subtitle="Base salarial por nível — clique para ver comissões e critérios">
          <div className="flex items-center overflow-x-auto pb-2">
            {NIVEIS.map((n, i) => {
              const active = selecionado === n.id;
              const color = TIER_COLOR[n.tier];
              return (
                <div key={n.id} className="flex items-center">
                  {i > 0 && <div className="h-[2px] w-8 shrink-0 sm:w-14" style={{ backgroundColor: "var(--border)" }} />}
                  <button
                    type="button"
                    onClick={() => setSelecionado(n.id)}
                    className="flex shrink-0 flex-col items-center gap-2 rounded-2xl px-3 py-2 transition-transform hover:-translate-y-0.5"
                  >
                    <div
                      className="grid h-12 w-12 place-items-center rounded-full text-[13px] font-bold text-white transition-shadow"
                      style={{
                        backgroundColor: color,
                        boxShadow: active ? `0 0 0 4px ${color}33` : "none",
                        opacity: active ? 1 : 0.55,
                      }}
                    >
                      {n.id.replace(" ", "")}
                    </div>
                    <div className={cn("text-[11px] font-semibold", active ? "text-foreground" : "text-muted-foreground")}>
                      {brl(n.baseSalarial)}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
            {(Object.keys(TIER_COLOR) as Tier[]).map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TIER_COLOR[t] }} />
                {TIER_LABEL[t]}
              </span>
            ))}
          </div>
        </Panel>

        {/* Evolução de OTE */}
        <div className="mt-5">
          <Panel title="Evolução de OTE" subtitle="Salário + comissão na Meta 3, faixa Estrela, por nível">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="nivel" width={48} stroke="#9aa0b4" fontSize={12} tickLine={false} axisLine={false} />
                <RTooltip
                  cursor={{ fill: "var(--muted)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload as (typeof chartData)[number];
                    return (
                      <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs" style={{ boxShadow: "var(--shadow-soft)" }}>
                        <div className="font-medium text-foreground">{p.nivel}</div>
                        <div className="text-muted-foreground">
                          OTE Meta 3: <span className="font-medium text-foreground">{brl(p.ote)}</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="ote" radius={[0, 8, 8, 0]} barSize={18}>
                  {chartData.map((d) => (
                    <Cell key={d.nivel} fill={TIER_COLOR[d.tier]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </div>

        {/* Tabela completa por nível */}
        <div className="mt-5">
          <Panel title="Tabela completa de comissões e critérios" subtitle="Expanda um nível para ver as duas faixas (Base e Estrela)">
            <Accordion type="single" collapsible defaultValue={NIVEIS[0].id}>
              {NIVEIS.map((n, i) => (
                <AccordionItem key={n.id} value={n.id} className={i === NIVEIS.length - 1 ? "border-b-0" : undefined}>
                  <AccordionTrigger className="text-[13.5px] font-semibold text-foreground hover:no-underline">
                    <span className="flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TIER_COLOR[n.tier] }} />
                      {n.id} <span className="font-normal text-muted-foreground">— base {brl(n.baseSalarial)}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="bg-muted/60">
                            <th className="whitespace-nowrap px-3 py-2 font-semibold text-foreground">Faixa</th>
                            <th className="whitespace-nowrap px-3 py-2 font-semibold text-foreground">Comissão Meta 1</th>
                            <th className="whitespace-nowrap px-3 py-2 font-semibold text-foreground">Comissão Meta 2</th>
                            <th className="whitespace-nowrap px-3 py-2 font-semibold text-foreground">Comissão Meta 3</th>
                            <th className="px-3 py-2 font-semibold text-foreground">Critérios</th>
                          </tr>
                        </thead>
                        <tbody>
                          {n.faixas.map((f) => (
                            <tr key={f.nome} className="border-t border-border">
                              <td className="whitespace-nowrap px-3 py-2 align-top font-medium text-foreground">{f.nome}</td>
                              <td className="whitespace-nowrap px-3 py-2 align-top text-muted-foreground">
                                {f.meta1.pct}% ({brl(f.meta1.ote)})
                              </td>
                              <td className="whitespace-nowrap px-3 py-2 align-top text-muted-foreground">
                                {f.meta2.pct}% ({brl(f.meta2.ote)})
                              </td>
                              <td className="whitespace-nowrap px-3 py-2 align-top text-muted-foreground">
                                {f.meta3.pct}% ({brl(f.meta3.ote)})
                              </td>
                              <td className="px-3 py-2 align-top text-muted-foreground">{f.criterios}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <p className="mt-3 flex items-start gap-1.5 text-[11px] text-muted-foreground">
              <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              As colunas originais "Meta de Clientes" e "Custo por Cliente (OTE)" estavam quebradas (#REF!) na planilha de origem para a maioria dos níveis e foram omitidas até serem corrigidas pela liderança.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
