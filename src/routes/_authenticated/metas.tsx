import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Target, Rocket, Clock, ChevronLeft, ChevronRight, Save, TrendingUp, Star } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { abrilFallback, abrilDiarioFallback, STORAGE, type DadosAtual, type DadosDiarios } from "@/data/dashboard";
import { pct, calcDiasUteisRestantes, calcDiasUteisMesAte, calcFechamentosSemana, getDeadlineMes, getInicioSemana, storageGet, storageSet } from "@/lib/dashboardUtils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/metas")({
  component: MetasPage,
});

interface RegistroGanho { id: number; data: string; quantidade: number; obs: string; }
let nextId = 1;

const CARD: React.CSSProperties = { background: "#FFFFFF", border: "1px solid #E5DDF7", borderRadius: 16, boxShadow: "0 2px 12px rgba(139,92,246,0.08)" };

/* ── Mini Calendar ── */
function MiniCalendar() {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const deadline = getDeadlineMes();
  const deadlineDay = deadline ? deadline.getDate() : null;
  const deadlineMes = deadline ? deadline.getMonth() : null;

  const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const dias: (number | null)[] = Array(primeiroDia).fill(null).concat(Array.from({ length: totalDias }, (_, i) => i + 1));

  return (
    <div style={CARD} className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-foreground">{MESES[mes]} {ano}</span>
        <div className="flex gap-0.5">
          <button onClick={() => { if (mes === 0) { setMes(11); setAno(a => a - 1); } else setMes(m => m - 1); }} className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"><ChevronLeft className="h-3 w-3" /></button>
          <button onClick={() => { if (mes === 11) { setMes(0); setAno(a => a + 1); } else setMes(m => m + 1); }} className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"><ChevronRight className="h-3 w-3" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-0.5">
        {["D","S","T","Q","Q","S","S"].map((d, i) => (
          <span key={i} className="text-center text-[9px] font-semibold text-muted-foreground py-0.5">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-px">
        {dias.map((d, i) => {
          const isToday = d === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear();
          const isDeadline = d !== null && d === deadlineDay && mes === deadlineMes;
          return (
            <div key={i} className={cn("h-6 w-6 mx-auto flex items-center justify-center rounded-full text-[10px] font-medium transition-colors",
              isToday ? "text-white font-bold" : isDeadline ? "text-white font-bold" : d ? "text-foreground hover:bg-secondary" : ""
            )} style={isToday ? { background: "#8B5CF6" } : isDeadline ? { background: "#EC4899" } : {}}>
              {d}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border">
        <span className="flex items-center gap-1 text-[9px] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" /> Dia atual</span>
        <span className="flex items-center gap-1 text-[9px] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-pink inline-block" /> Data limite</span>
      </div>
    </div>
  );
}

/* ── Projeção Final ── */
function ProjecaoFinal({ clientesTotal, metas, diasUteisNoMes, diasUteisRest, feitosEstaSemana, fechPorSemana }: {
  clientesTotal: number; metas: { m1: number; m2: number; m3: number };
  diasUteisNoMes: number; diasUteisRest: number; feitosEstaSemana: number; fechPorSemana: number;
}) {
  const deadline = getDeadlineMes();
  const deadlineStr = deadline ? `até ${deadline.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}` : "até fim do mês";
  const diasUteisDecorridos = Math.max(diasUteisNoMes - diasUteisRest, 1);
  const projecao = Math.round((clientesTotal / diasUteisDecorridos) * diasUteisNoMes);
  const pctConc = Math.min(pct(clientesTotal, metas.m3), 100);
  const metaSemPct = Math.min(pct(feitosEstaSemana, fechPorSemana), 100);
  const donutData = [{ value: pctConc }, { value: 100 - pctConc }];

  return (
    <div style={CARD} className="p-3 space-y-2">
      <p className="text-xs font-semibold text-foreground">Projeção final</p>
      <div className="flex justify-center relative">
        <PieChart width={120} height={120}>
          <Pie data={donutData} cx={56} cy={56} innerRadius={38} outerRadius={52} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
            <Cell fill="#8B5CF6" />
            <Cell fill="#F0ECF9" />
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-primary">{projecao}</span>
          <span className="text-[10px] text-muted-foreground">/ {metas.m3}</span>
        </div>
      </div>
      <p className="text-[10px] text-center text-muted-foreground">{pctConc}% concluído</p>
      <div className="space-y-1.5 pt-1 border-t border-border">
        {[
          { icon: Clock, label: "Meta da semana", value: `${feitosEstaSemana} / ${fechPorSemana}`, badge: `${metaSemPct}%`, badgeColor: "#EF4444" },
          { icon: Target, label: "Dias restantes", value: `${diasUteisRest}`, badge: deadlineStr, badgeColor: "#7A6E8E" },
          { icon: TrendingUp, label: "Esta semana", value: `${feitosEstaSemana} / ${fechPorSemana}`, badge: `${metaSemPct}%`, badgeColor: "#EF4444" },
        ].map(({ icon: Icon, label, value, badge, badgeColor }) => (
          <div key={label} className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 text-muted-foreground"><Icon className="h-3 w-3" />{label}</div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">{value}</span>
              <span className="font-bold" style={{ color: badgeColor }}>{badge}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Evolução diária ── */
function EvolucaoChart({ diario, metaM3, diasTotal }: { diario: DadosDiarios[]; metaM3: number; diasTotal: number }) {
  const [range, setRange] = useState(7);
  const sliced = diario.slice(-range);
  const data = sliced.map((d, i) => ({
    dia: d.dia, acumulado: d.clientes,
    necessario: Math.round((metaM3 / diasTotal) * (diario.length - sliced.length + i + 1)),
  }));
  return (
    <div style={CARD} className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground">Evolução diária</p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-3 rounded bg-primary" /> Acumulado</span>
            <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-3 rounded border-t-2 border-dashed border-pink" /> Necessário</span>
          </div>
          <select value={range} onChange={(e) => setRange(Number(e.target.value))} className="text-[10px] border border-border rounded px-1.5 py-0.5 bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
            <option value={7}>7 dias</option>
            <option value={14}>14 dias</option>
            <option value={30}>30 dias</option>
          </select>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
          <XAxis dataKey="dia" tick={{ fill: "#B7ABC8", fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#B7ABC8", fontSize: 9 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E5DDF7", borderRadius: 10, fontSize: 11 }} />
          <Line type="monotone" dataKey="acumulado" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 2.5, fill: "#8B5CF6", strokeWidth: 0 }} name="Acumulado" />
          <Line type="monotone" dataKey="necessario" stroke="#EC4899" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Necessário" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Metas em andamento ── */
function MetasEmAndamento({ clientesTotal, metas }: { clientesTotal: number; metas: { m1: number; m2: number; m3: number } }) {
  const items = [
    { label: "Meta 1", val: metas.m1, color: "#8B5CF6" },
    { label: "Meta 2", val: metas.m2, color: "#EC4899" },
    { label: "Meta 3 ★", val: metas.m3, color: "#A855F7" },
  ];
  return (
    <div style={CARD} className="p-3 space-y-2.5 flex flex-col">
      <p className="text-xs font-semibold text-foreground">Metas em andamento</p>
      <div className="space-y-2 flex-1">
        {items.map(({ label, val, color }) => {
          const p = Math.min(pct(clientesTotal, val), 100);
          return (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" style={{ color }} />
                  <span className="font-medium text-foreground">{label}</span>
                  <span className="text-muted-foreground">{val} fechamentos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold px-1.5 py-0.5 rounded-full text-[9px]" style={{ background: "rgba(139,92,246,0.1)", color: "#8B5CF6" }}>{p}%</span>
                  <span className="text-muted-foreground">{clientesTotal}/{val}</span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full overflow-hidden bg-secondary">
                <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${p}%`, background: `linear-gradient(90deg, ${color}, #EC4899)` }} />
              </div>
            </div>
          );
        })}
      </div>
      <button className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors">
        <span>→</span> Ver todas as metas
      </button>
    </div>
  );
}

/* ── Insights rápidos ── */
function InsightsRapidos({ clientesTotal, metas, ritmoAtual, necM1, melhorDia }: {
  clientesTotal: number; metas: { m1: number; m2: number; m3: number };
  ritmoAtual: number; necM1: number; melhorDia: number;
}) {
  const acimaRitmo = necM1 > 0 ? Math.round(((ritmoAtual - necM1) / necM1) * 100) : 0;
  const mediaStr = ritmoAtual.toFixed(1).replace(".", ",");

  const insights = [
    {
      icon: TrendingUp, color: "#22C55E", bg: "rgba(34,197,94,0.1)",
      title: acimaRitmo >= 0
        ? `Você está ${Math.abs(acimaRitmo)}% acima do ritmo necessário da Meta 1`
        : `Você está ${Math.abs(acimaRitmo)}% abaixo do ritmo necessário da Meta 1`,
      sub: acimaRitmo >= 0 ? "Continue assim!" : "Acelere o ritmo!",
    },
    {
      icon: Clock, color: "#F59E0B", bg: "rgba(245,158,11,0.1)",
      title: `Média de ${mediaStr} fechamentos por dia`,
      sub: melhorDia > 0 ? `Seu melhor dia foi ${melhorDia} fechamentos` : "Continue registrando seus ganhos",
    },
    {
      icon: Star, color: "#8B5CF6", bg: "rgba(139,92,246,0.1)",
      title: `Meta 3 é sua melhor performance atual`,
      sub: `Você está ${Math.max(clientesTotal - metas.m3, 0) === 0 ? necM1 : clientesTotal - metas.m3} fechamento${necM1 !== 1 ? "s" : ""} ${clientesTotal >= metas.m3 ? "acima" : "abaixo"} do necessário`,
    },
  ];

  return (
    <div style={CARD} className="p-3 space-y-2.5">
      <p className="text-xs font-semibold text-foreground">Insights rápidos</p>
      <div className="space-y-2">
        {insights.map(({ icon: Icon, color, bg, title, sub }) => (
          <div key={title} className="flex items-start gap-2">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
              <Icon className="h-3.5 w-3.5" style={{ color }} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-foreground leading-snug">
                {title.split(/([\d,]+%?|Meta \d)/g).map((part, i) =>
                  /[\d,]+%?|Meta [123]/.test(part) ? <strong key={i}>{part}</strong> : part
                )}
              </p>
              <p className="text-[10px] text-muted-foreground">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Atividades recentes ── */
function AtividadesRecentes({ registros }: { registros: RegistroGanho[] }) {
  const metaColors = ["#8B5CF6", "#EC4899", "#A855F7", "#8B5CF6"];
  const metaLabels = ["Meta 1", "Meta 2", "Meta 3", "Meta 1"];
  const ultimos = registros.slice(-4).reverse();
  const hoje = new Date().toLocaleDateString("pt-BR");

  return (
    <div style={CARD} className="p-3 space-y-2.5 flex flex-col">
      <p className="text-xs font-semibold text-foreground">Atividades recentes</p>
      {ultimos.length === 0 ? (
        <p className="text-[10px] text-muted-foreground text-center py-2">Nenhum ganho registrado ainda.</p>
      ) : (
        <div className="space-y-1.5 flex-1">
          {ultimos.map((r, i) => (
            <div key={r.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0" style={{ background: metaColors[i % 4] + "18" }}>
                  <Target className="h-3 w-3" style={{ color: metaColors[i % 4] }} />
                </div>
                <p className="text-[11px] font-medium text-foreground">{metaLabels[i % 4]} - Fechamento realizado</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{r.data === hoje ? "Hoje" : "Ontem"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Ganhos de hoje ── */
function GanhosHoje({ clientesTotal, onAdd, onRemove, onSave, saved }: {
  clientesTotal: number; onAdd: () => void; onRemove: () => void; onSave: () => void; saved: boolean;
}) {
  return (
    <div style={CARD} className="p-3 flex flex-col gap-2">
      <p className="text-xs font-semibold text-foreground">Ganhos de hoje</p>
      <div className="flex items-center justify-center gap-6 py-1">
        <button onClick={onRemove} className="h-9 w-9 rounded-xl text-lg font-bold transition-all hover:scale-105 flex items-center justify-center" style={{ border: "1px solid rgba(139,92,246,0.2)", background: "#F0ECF9", color: "#8B5CF6" }}>−</button>
        <div className="text-center">
          <p className="text-4xl font-black leading-none" style={{ background: "linear-gradient(135deg,#8B5CF6,#EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{clientesTotal}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">ganhos</p>
        </div>
        <button onClick={onAdd} className="h-9 w-9 rounded-xl text-lg font-bold transition-all hover:scale-105 flex items-center justify-center" style={{ border: "1px solid rgba(139,92,246,0.2)", background: "#F0ECF9", color: "#8B5CF6" }}>+</button>
      </div>
      <button onClick={onSave} className={cn("w-full h-9 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90")} style={{ background: saved ? "rgba(34,197,94,0.2)" : "linear-gradient(135deg,#8B5CF6,#EC4899)", color: saved ? "#22C55E" : "white", border: saved ? "1px solid rgba(34,197,94,0.4)" : "none" }}>
        <Save className="h-3.5 w-3.5" />{saved ? "✓ Salvo!" : "Salvar ganhos"}
      </button>
    </div>
  );
}

/* ── Main Page ── */
function MetasPage() {
  const dadosPlanilha = storageGet<{ atual?: Partial<DadosAtual>; metas?: { m1?: number; m2?: number; m3?: number }; diario?: DadosDiarios[] }>(STORAGE.PLANILHA);
  const [metasOverride, setMetasOverride] = useState<{ m1: number; m2: number; m3: number } | null>(null);
  const [metasDialogOpen, setMetasDialogOpen] = useState(false);
  const [editM1, setEditM1] = useState(""); const [editM2, setEditM2] = useState(""); const [editM3, setEditM3] = useState("");
  const [metasSaving, setMetasSaving] = useState(false);

  useEffect(() => {
    supabase.from("dashboard_metas").select("m1,m2,m3").eq("id","singleton").maybeSingle().then(({ data }) => {
      if (data) setMetasOverride({ m1: data.m1, m2: data.m2, m3: data.m3 });
    });
  }, []);

  const metasBase = { m1: dadosPlanilha?.metas?.m1 ?? 0, m2: dadosPlanilha?.metas?.m2 ?? 0, m3: dadosPlanilha?.metas?.m3 ?? 0 };
  const metas = metasOverride ?? metasBase;
  const dadosAtual: DadosAtual = { ...abrilFallback, ...(dadosPlanilha?.atual ?? {}), metas };
  const diario = (dadosPlanilha?.diario && dadosPlanilha.diario.length > 0) ? dadosPlanilha.diario : abrilDiarioFallback;
  const deadline = getDeadlineMes();
  const diasUteisNoMes = calcDiasUteisMesAte(deadline ?? undefined);
  const diasUteisRest = calcDiasUteisRestantes(deadline ?? undefined);

  const [registros, setRegistros] = useState<RegistroGanho[]>(() => storageGet<RegistroGanho[]>(STORAGE.GANHOS) ?? []);
  const [saved, setSaved] = useState(false);
  const syncedRef = useRef(false);
  const totalManual = registros.reduce((s, r) => s + r.quantidade, 0);
  const clientesTotal = dadosAtual.clientes + totalManual;

  useEffect(() => {
    if (syncedRef.current) return; syncedRef.current = true;
    supabase.from("dashboard_ganhos").select("*").eq("perfil","bibi").order("created_at",{ascending:true}).then(({ data }) => {
      if (data && data.length > 0) {
        const rem: RegistroGanho[] = data.map((r: any) => ({ id: r.id, data: r.data_ganho, quantidade: r.quantidade, obs: r.obs ?? "" }));
        setRegistros(rem); storageSet(STORAGE.GANHOS, rem);
      }
    });
  }, []);
  useEffect(() => { storageSet(STORAGE.GANHOS, registros); }, [registros]);

  const { fechPorSemana } = calcFechamentosSemana(metas, diasUteisNoMes);
  const chave = `ravenna_semana_${getInicioSemana().toISOString().slice(0,10)}`;
  const feitosEstaSemana = storageGet<number>(chave) ?? 0;
  const diasDecorridos = Math.max(diasUteisNoMes - diasUteisRest, 1);
  const ritmoAtual = clientesTotal / diasDecorridos;
  const ritmoArred = Math.round(ritmoAtual);
  const necM1 = Math.max(Math.ceil((metas.m1 - clientesTotal) / Math.max(diasUteisRest, 1)), 0);
  const necM3 = Math.max(Math.ceil((metas.m3 - clientesTotal) / Math.max(diasUteisRest, 1)), 0);
  const faltamM1 = Math.max(metas.m1 - clientesTotal, 0);
  const melhorDia = Math.max(...diario.map(d => d.noDia), 0);
  const pctSemanal = fechPorSemana > 0 ? Math.round((feitosEstaSemana / fechPorSemana) * 100) : 0;

  const handleAdd = async () => {
    const dataHoje = new Date().toLocaleDateString("pt-BR");
    const { data } = await supabase.from("dashboard_ganhos").insert({ perfil:"bibi", data_ganho:dataHoje, quantidade:1, obs:"Ajuste rápido" }).select().single();
    setRegistros(p => [...p, { id: data?.id ?? nextId++, data: dataHoje, quantidade: 1, obs: "" }]);
    storageSet(chave, (storageGet<number>(chave) ?? 0) + 1);
  };
  const handleRemove = async () => {
    if (!registros.length) return;
    const u = registros[registros.length - 1];
    await supabase.from("dashboard_ganhos").delete().eq("id", u.id);
    setRegistros(p => p.slice(0, -1));
    storageSet(chave, Math.max((storageGet<number>(chave) ?? 0) - 1, 0));
  };
  const handleSave = () => { storageSet(STORAGE.GANHOS, registros); setSaved(true); setTimeout(() => setSaved(false), 2500); };
  const handleSaveMetas = async () => {
    const m1 = Number(editM1)||0, m2 = Number(editM2)||0, m3 = Number(editM3)||0;
    setMetasSaving(true);
    await supabase.from("dashboard_metas").upsert({ id:"singleton", m1, m2, m3, updated_at: new Date().toISOString() });
    setMetasOverride({ m1, m2, m3 }); setMetasSaving(false); setMetasDialogOpen(false);
    toast.success("Metas salvas!");
  };

  const kpis = [
    {
      label: "RITMO ATUAL", icon: Sparkles, iconBg: "rgba(139,92,246,0.12)", iconColor: "#8B5CF6",
      value: `${ritmoArred}`, unit: "/dia", sub: `${pctSemanal}% da meta semanal`, barColor: "#8B5CF6", barPct: pctSemanal,
      footer: `${clientesTotal} / ${metas.m3} fechamentos`,
    },
    {
      label: "NECESSÁRIO", icon: Target, iconBg: "rgba(236,72,153,0.1)", iconColor: "#EC4899",
      value: `${necM1}`, unit: "/dia", sub: "Para alcançar Meta 1", barColor: "#EC4899", barPct: 100,
      footer: `Meta 1: ${metas.m1} fechamentos`,
    },
    {
      label: "FALTAM", icon: Rocket, iconBg: "rgba(245,158,11,0.12)", iconColor: "#F59E0B",
      value: `${faltamM1}`, unit: null, sub: "fechamentos para Meta 1", barColor: "#F59E0B", barPct: pct(faltamM1, metas.m1),
      valueColor: "#F59E0B", footer: `${clientesTotal} / ${metas.m1} fechamentos`,
    },
    {
      label: "META EM", icon: Clock, iconBg: "rgba(34,197,94,0.1)", iconColor: "#22C55E",
      value: `${diasUteisRest}`, unit: " dias", sub: deadline ? `Prazo: ${deadline.toLocaleDateString("pt-BR",{day:"2-digit",month:"long"})}` : "Fim do mês",
      barColor: "#22C55E", barPct: pct(diasUteisNoMes - diasUteisRest, diasUteisNoMes),
      footer: `${diasUteisNoMes} dias úteis no mês`,
    },
  ];

  return (
    <>
      {/* Grid principal: coluna esquerda + sidebar. Linha inferior abrange as duas. */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gridTemplateRows: "auto auto auto auto", gap: 12 }}>

        {/* Row 1 — KPI cards (col 1) */}
        <div style={{ gridColumn: 1, gridRow: 1 }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {kpis.map(({ label, icon: Icon, iconBg, iconColor, value, unit, sub, barColor, barPct, valueColor, footer }: any) => (
              <div key={label} style={CARD} className="px-3 py-2.5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
                  <div className="h-6 w-6 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
                    <Icon className="h-3 w-3" style={{ color: iconColor }} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black leading-tight" style={{ color: valueColor ?? "#1A1530" }}>{value}</span>
                  {unit && <span className="text-xs font-medium text-muted-foreground">{unit}</span>}
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">{sub}</p>
                <div className="h-0.5 w-full rounded-full overflow-hidden" style={{ background: barColor + "20" }}>
                  <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${barPct}%`, background: barColor }} />
                </div>
                {footer && <p className="text-[10px] text-muted-foreground/80">{footer}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 — 3 Meta cards (col 1) */}
        <div style={{ gridColumn: 1, gridRow: 2 }}>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Meta 1", val: metas.m1, barColor: "#8B5CF6" },
              { label: "Meta 2", val: metas.m2, barColor: "#EC4899" },
              { label: "Meta 3 ★", val: metas.m3, barColor: "#A855F7" },
            ].map(({ label, val, barColor }) => {
              const n = Math.max(Math.ceil((val - clientesTotal) / Math.max(diasUteisRest, 1)), 0);
              const p2 = Math.min(pct(clientesTotal, val), 100);
              return (
                <div key={label} style={CARD} className="px-3 py-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{label}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.1)", color: "#8B5CF6" }}>{p2}%</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black" style={{ color: "#EC4899" }}>{n}</span>
                    <span className="text-xs text-muted-foreground">/dia</span>
                  </div>
                  <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: barColor + "20" }}>
                    <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${p2}%`, background: barColor }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Faltam <span className="font-bold text-pink">{Math.max(val - clientesTotal, 0)}</span> pra meta</span>
                    <span>{clientesTotal}/{val}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 3 — Insights + Evolução (col 1) */}
        <div style={{ gridColumn: 1, gridRow: 3 }}>
          <div className="grid grid-cols-[1fr_2fr] gap-3">
            <InsightsRapidos clientesTotal={clientesTotal} metas={metas} ritmoAtual={ritmoAtual} necM1={necM1} melhorDia={melhorDia} />
            <EvolucaoChart diario={diario} metaM3={metas.m3} diasTotal={diasUteisNoMes} />
          </div>
        </div>

        {/* Sidebar — rows 1-3, col 2 */}
        <div style={{ gridColumn: 2, gridRow: "1 / 4", display: "flex", flexDirection: "column", gap: 12 }}>
          <MiniCalendar />
          <ProjecaoFinal clientesTotal={clientesTotal} metas={metas} diasUteisNoMes={diasUteisNoMes} diasUteisRest={diasUteisRest} feitosEstaSemana={feitosEstaSemana} fechPorSemana={fechPorSemana} />
        </div>

        {/* Row 4 — Atividades + Metas + Ganhos (abrange as 2 colunas, Ganhos mais largo) */}
        <div style={{ gridColumn: "1 / 3", gridRow: 4 }}>
          <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr 1.6fr" }}>
            <AtividadesRecentes registros={registros} />
            <MetasEmAndamento clientesTotal={clientesTotal} metas={metas} />
            <GanhosHoje clientesTotal={clientesTotal} onAdd={handleAdd} onRemove={handleRemove} onSave={handleSave} saved={saved} />
          </div>
        </div>
      </div>

      {/* Dialog editar metas */}
      <Dialog open={metasDialogOpen} onOpenChange={setMetasDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Editar Metas do Mês</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {[{ label:"Meta 1",value:editM1,onChange:setEditM1 },{ label:"Meta 2",value:editM2,onChange:setEditM2 },{ label:"Meta 3 ★",value:editM3,onChange:setEditM3 }].map(({ label, value, onChange }) => (
              <div key={label} className="flex items-center gap-4">
                <span className="w-20 text-sm font-semibold">{label}</span>
                <Input type="number" min={0} value={value} onChange={e => onChange(e.target.value)} placeholder="0" className="flex-1" />
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild><Button variant="outline" size="sm">Cancelar</Button></DialogClose>
            <Button size="sm" onClick={handleSaveMetas} disabled={metasSaving} style={{ background: "linear-gradient(135deg,#8B5CF6,#EC4899)" }} className="text-white hover:opacity-90">{metasSaving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
