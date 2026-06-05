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

const CARD: React.CSSProperties = { background: "#FFFFFF", border: "1px solid rgba(89,50,122,0.14)", borderRadius: 14, boxShadow: "0 2px 10px rgba(89,50,122,0.08)" };

/* ──────────────────────────────────────────
   Mini Calendar
────────────────────────────────────────── */
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
    <div style={CARD} className="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-foreground">{MESES[mes]} {ano}</span>
        <div className="flex gap-1">
          <button onClick={() => { if (mes === 0) { setMes(11); setAno(a => a - 1); } else setMes(m => m - 1); }} className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"><ChevronLeft className="h-3.5 w-3.5" /></button>
          <button onClick={() => { if (mes === 11) { setMes(0); setAno(a => a + 1); } else setMes(m => m + 1); }} className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"><ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {["D","S","T","Q","Q","S","S"].map((d, i) => (
          <span key={i} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {dias.map((d, i) => {
          const isToday = d === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear();
          const isDeadline = d !== null && d === deadlineDay && mes === deadlineMes;
          return (
            <div key={i} className={cn("h-7 w-7 mx-auto flex items-center justify-center rounded-full text-xs font-medium transition-colors",
              isToday ? "text-white font-bold" : isDeadline ? "text-white font-bold" : d ? "text-foreground hover:bg-secondary" : ""
            )} style={isToday ? { background: "#8B5CF6" } : isDeadline ? { background: "#EC4899" } : {}}>
              {d}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="h-2 w-2 rounded-full bg-primary inline-block" /> Dia atual</span>
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="h-2 w-2 rounded-full bg-pink inline-block" /> Data limite</span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Projeção Final — donut
────────────────────────────────────────── */
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

  const donutData = [
    { value: pctConc },
    { value: 100 - pctConc },
  ];

  return (
    <div style={CARD} className="p-3 space-y-2">
      <p className="text-sm font-semibold text-foreground">Projeção final</p>
      <div className="flex justify-center relative">
        <PieChart width={120} height={120}>
          <Pie data={donutData} cx={60} cy={60} innerRadius={40} outerRadius={55} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
            <Cell fill="#8B5CF6" />
            <Cell fill="#F0ECF9" />
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-primary">{projecao}</span>
          <span className="text-xs text-muted-foreground">/ {metas.m3}</span>
        </div>
      </div>
      <p className="text-xs text-center text-muted-foreground">{pctConc}% concluído</p>
      <div className="space-y-2.5 pt-1 border-t border-border">
        {[
          { icon: Clock, label: "Meta da semana", value: `${feitosEstaSemana} / ${fechPorSemana}`, badge: `${metaSemPct}%`, badgeColor: "#EF4444" },
          { icon: Target, label: "Dias restantes", value: `${diasUteisRest}`, badge: deadlineStr, badgeColor: "#7A6E8E" },
          { icon: TrendingUp, label: "Esta semana", value: `${feitosEstaSemana} / ${fechPorSemana}`, badge: `${metaSemPct}%`, badgeColor: "#EF4444" },
        ].map(({ icon: Icon, label, value, badge, badgeColor }) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground"><Icon className="h-3.5 w-3.5" />{label}</div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{value}</span>
              <span className="text-[10px] font-bold" style={{ color: badgeColor }}>{badge}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Evolução diária chart
────────────────────────────────────────── */
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
        <div>
          <p className="text-sm font-semibold text-foreground">Evolução diária</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 rounded bg-primary" /> Acumulado</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 rounded border-t-2 border-dashed border-pink" /> Necessário</span>
          </div>
          <select value={range} onChange={(e) => setRange(Number(e.target.value))} className="text-xs border border-border rounded-lg px-2 py-1 bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
            <option value={7}>7 dias</option>
            <option value={14}>14 dias</option>
            <option value={30}>30 dias</option>
          </select>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
          <XAxis dataKey="dia" tick={{ fill: "#B7ABC8", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#B7ABC8", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E5DDF7", borderRadius: 10, fontSize: 12 }} />
          <Line type="monotone" dataKey="acumulado" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 3, fill: "#8B5CF6", strokeWidth: 0 }} name="Acumulado" />
          <Line type="monotone" dataKey="necessario" stroke="#EC4899" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Necessário" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


/* ──────────────────────────────────────────
   Insights rápidos
────────────────────────────────────────── */
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
    <div style={CARD} className="p-3 space-y-2">
      <p className="text-sm font-semibold text-foreground">Insights rápidos</p>
      <div className="space-y-3">
        {insights.map(({ icon: Icon, color, bg, title, sub }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground leading-snug">
                {title.split(/([\d,]+%?|Meta \d|Meta 1|Meta 2|Meta 3)/g).map((part, i) =>
                  /[\d,]+%?|Meta [123]/.test(part)
                    ? <strong key={i} className="font-bold">{part}</strong>
                    : part
                )}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ──────────────────────────────────────────
   Ganhos de hoje
────────────────────────────────────────── */
function GanhosHoje({ clientesTotal, onAdd, onRemove, onSave, saved }: {
  clientesTotal: number; onAdd: () => void; onRemove: () => void; onSave: () => void; saved: boolean;
}) {
  return (
    <div style={CARD} className="p-3 space-y-2">
      <p className="text-sm font-semibold text-foreground">Ganhos de hoje</p>
      <div className="flex items-center justify-center gap-4 py-1">
        <button onClick={onRemove} className="h-8 w-8 rounded-xl text-base font-bold transition-all hover:scale-105 flex items-center justify-center" style={{ border: "1px solid rgba(139,92,246,0.2)", background: "#F0ECF9", color: "#8B5CF6" }}>−</button>
        <div className="text-center">
          <p className="text-3xl font-black" style={{ background: "linear-gradient(135deg,#8B5CF6,#EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{clientesTotal}</p>
          <p className="text-xs text-muted-foreground">ganhos</p>
        </div>
        <button onClick={onAdd} className="h-8 w-8 rounded-xl text-base font-bold transition-all hover:scale-105 flex items-center justify-center" style={{ border: "1px solid rgba(139,92,246,0.2)", background: "#F0ECF9", color: "#8B5CF6" }}>+</button>
      </div>
      <div className="space-y-2">
        <button onClick={onSave} className={cn("w-full h-10 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90")} style={{ background: saved ? "rgba(34,197,94,0.2)" : "linear-gradient(135deg,#8B5CF6,#EC4899)", color: saved ? "#22C55E" : "white", border: saved ? "1px solid rgba(34,197,94,0.4)" : "none" }}>
          <Save className="h-3.5 w-3.5" />{saved ? "✓ Salvo!" : "Salvar ganhos"}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onRemove} className="h-9 rounded-xl text-xs font-semibold transition-all hover:opacity-80" style={{ border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.05)", color: "#EF4444" }}>- 1 ganho</button>
          <button onClick={onAdd} className="h-9 rounded-xl text-xs font-semibold transition-all hover:opacity-80" style={{ border: "1px solid rgba(139,92,246,0.2)", background: "rgba(139,92,246,0.05)", color: "#8B5CF6" }}>+ 1 ganho</button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Agendamentos & Fechamentos por Meta
────────────────────────────────────────── */
function AgendFechCard({ metas, clientesTotal, diasUteisRest, conversaoPct }: {
  metas: { m1: number; m2: number; m3: number };
  clientesTotal: number;
  diasUteisRest: number;
  conversaoPct: number;
}) {
  const taxa = conversaoPct > 0 && conversaoPct <= 100 ? conversaoPct / 100 : 0.5;

  const rows = [
    { label: "Meta 1", val: metas.m1, color: "#59327A", bg: "rgba(89,50,122,0.07)" },
    { label: "Meta 2", val: metas.m2, color: "#EC4899", bg: "rgba(236,72,153,0.07)" },
    { label: "Meta 3 ★", val: metas.m3, color: "#8B35C0", bg: "rgba(139,53,192,0.07)" },
  ].map(({ label, val, color, bg }) => {
    const faltam = Math.max(val - clientesTotal, 0);
    const diasEfetivos = Math.max(diasUteisRest, 1);
    const fechDia = Math.ceil(faltam / diasEfetivos);
    const agendDia = taxa > 0 ? Math.ceil(fechDia / taxa) : 0;
    const concluida = clientesTotal >= val;
    return { label, val, color, bg, faltam, fechDia, agendDia, concluida };
  });

  return (
    <div style={CARD} className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-foreground">📅 Ritmo Diário por Meta</p>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
          style={{ background: "rgba(255,182,0,0.15)", color: "#9A6600", border: "1px solid rgba(255,182,0,0.3)" }}>
          {Math.round(taxa * 100)}% conversão
        </span>
      </div>
      <div className="space-y-2">
        {rows.map(({ label, val, color, bg, fechDia, agendDia, concluida }) => (
          <div key={label} className="flex items-center justify-between rounded-xl px-3 py-2.5"
            style={{ background: bg, border: `1px solid ${color}22` }}>
            <div>
              <p className="text-xs font-bold" style={{ color }}>{label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{val} fechamentos</p>
            </div>
            {concluida ? (
              <span className="text-xs font-bold" style={{ color: "#22C55E" }}>✓ Atingida!</span>
            ) : (
              <div className="text-right space-y-0.5">
                <p className="text-sm font-black leading-tight" style={{ color }}>
                  {fechDia} <span className="text-[10px] font-medium text-muted-foreground">fech/dia</span>
                </p>
                <p className="text-[11px] text-muted-foreground">{agendDia} agend/dia</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Main Page
────────────────────────────────────────── */
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
  const ritmoAtual = Math.round(clientesTotal / diasDecorridos);
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

  /* KPI cards data */
  const kpis = [
    {
      label: "RITMO ATUAL", icon: Sparkles, iconBg: "rgba(139,92,246,0.12)", iconColor: "#8B5CF6",
      value: `${ritmoAtual}`, unit: "/dia", sub: `${pctSemanal}% da meta semanal`, barColor: "#8B5CF6", barPct: pctSemanal,
      footer: `${clientesTotal} / ${metas.m3} fechamentos`,
    },
    {
      label: "NECESSÁRIO", icon: Target, iconBg: "rgba(255,182,0,0.12)", iconColor: "#B8860B",
      value: `${necM1}`, unit: "/dia", sub: "Para alcançar Meta 1", barColor: "#FFB600", barPct: 100,
      footer: `Meta 1: ${metas.m1} fechamentos`,
    },
    {
      label: "FALTAM", icon: Rocket, iconBg: "rgba(245,158,11,0.12)", iconColor: "#F59E0B",
      value: `${faltamM1}`, unit: null, sub: "fechamentos para Meta 1", barColor: "#F59E0B", barPct: pct(faltamM1, metas.m1),
      valueColor: "#F59E0B",
      footer: `${clientesTotal} / ${metas.m1} fechamentos`,
    },
    {
      label: "META EM", icon: Clock, iconBg: "rgba(34,197,94,0.1)", iconColor: "#22C55E",
      value: `${diasUteisRest}`, unit: " dias", sub: deadline ? `Prazo final: ${deadline.toLocaleDateString("pt-BR",{day:"2-digit",month:"long"})}` : "Fim do mês",
      barColor: "#22C55E", barPct: pct(diasUteisNoMes - diasUteisRest, diasUteisNoMes),
      footer: `${diasUteisNoMes} dias úteis no mês`,
    },
  ];

  return (
    <div className="flex gap-4 w-full items-start">

      {/* ── Coluna esquerda (conteúdo principal) ── */}
      <div className="flex-1 min-w-0 space-y-3">

        {/* KPI 4 cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map(({ label, icon: Icon, iconBg, iconColor, value, unit, sub, barColor, barPct, valueColor, footer }: any) => (
            <div key={label} style={CARD} className="px-3 pt-3 pb-2 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
                <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
                  <Icon className="h-3.5 w-3.5" style={{ color: iconColor }} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black leading-tight" style={{ color: valueColor ?? "#1A1530" }}>{value}</span>
                {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">{sub}</p>
              <div className="h-0.5 w-full rounded-full overflow-hidden" style={{ background: barColor + "20" }}>
                <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${barPct}%`, background: barColor }} />
              </div>
              {footer && <p className="text-[11px] text-muted-foreground/80 mt-0.5">{footer}</p>}
            </div>
          ))}
        </div>

        {/* 3 Meta cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Meta 1", val: metas.m1, barColor: "#8B5CF6" },
            { label: "Meta 2", val: metas.m2, barColor: "#EC4899" },
            { label: "Meta 3 ★", val: metas.m3, barColor: "#A855F7" },
          ].map(({ label, val, barColor }) => {
            const n = Math.max(Math.ceil((val - clientesTotal) / Math.max(diasUteisRest, 1)), 0);
            const p2 = Math.min(pct(clientesTotal, val), 100);
            return (
              <div key={label} style={CARD} className="px-3 pt-2.5 pb-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">{label}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.1)", color: "#8B5CF6" }}>{p2}%</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black" style={{ color: "#EC4899" }}>{n}</span>
                  <span className="text-sm text-muted-foreground">/dia</span>
                </div>
                <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: barColor + "20" }}>
                  <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${p2}%`, background: barColor }} />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Faltam <span className="font-bold text-pink">{Math.max(val - clientesTotal, 0)}</span> pra meta</span>
                  <span>{clientesTotal}/{val}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{val} fechamentos</p>
              </div>
            );
          })}
        </div>

        {/* Agend & Fech por Meta */}
        <AgendFechCard
          metas={metas}
          clientesTotal={clientesTotal}
          diasUteisRest={diasUteisRest}
          conversaoPct={dadosAtual.conversao ?? 50}
        />

        {/* Insights + Evolução */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-3">
          <InsightsRapidos clientesTotal={clientesTotal} metas={metas} ritmoAtual={ritmoAtual} necM1={necM1} melhorDia={melhorDia} />
          <EvolucaoChart diario={diario} metaM3={metas.m3} diasTotal={diasUteisNoMes} />
        </div>

        {/* Ganhos */}
        <div className="w-full">
          <GanhosHoje clientesTotal={clientesTotal} onAdd={handleAdd} onRemove={handleRemove} onSave={handleSave} saved={saved} />
        </div>
      </div>

      {/* ── Coluna direita fixa (calendário + projeção) ── */}
      <div className="w-[260px] shrink-0 space-y-4">
        <MiniCalendar />
        <ProjecaoFinal clientesTotal={clientesTotal} metas={metas} diasUteisNoMes={diasUteisNoMes} diasUteisRest={diasUteisRest} feitosEstaSemana={feitosEstaSemana} fechPorSemana={fechPorSemana} />
      </div>

      {/* Edit metas dialog */}
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
    </div>
  );
}
