import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Target, TrendingUp, Minus, Plus, Save, Trophy, Settings,
  Rocket, Users, PhoneOff, CheckCircle2, Video, MessageSquare, Award, XCircle,
} from "lucide-react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { MetricCard } from "@/components/dashboard/PrimitivesUI";
import { abrilFallback, abrilDiarioFallback, historico, STORAGE, type DadosAtual, type DadosDiarios, TIER_CFG } from "@/data/dashboard";
import {
  pct, calcDiasUteisRestantes, calcDiasUteisMesAte, calcFechamentosSemana,
  getDeadlineMes, getInicioSemana, storageGet, storageSet, getSaudacao,
} from "@/lib/dashboardUtils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/metas")({
  component: MetasPage,
});

interface RegistroGanho { id: number; data: string; quantidade: number; obs: string; }
let nextId = 1;

const CARD = { background: "#FFFFFF", border: "1px solid #E5DDF7", boxShadow: "0 2px 16px -2px rgba(139,92,246,0.1), 0 1px 4px rgba(0,0,0,0.04)" } as const;
const GRAD = "linear-gradient(135deg,#8B5CF6,#EC4899)";

/* ── Progress bar slim ── */
function SlimBar({ value, max }: { value: number; max: number }) {
  const w = Math.min(pct(value, max), 100);
  return (
    <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "rgba(139,92,246,0.12)" }}>
      <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${w}%`, background: GRAD }} />
    </div>
  );
}

/* ── Main progress card ── */
function ProgressCard({ clientesTotal, dados, onEditMetas }: {
  clientesTotal: number; dados: DadosAtual; onEditMetas: () => void;
}) {
  const { metas, diaAtual } = dados;
  const deadline = getDeadlineMes();
  const diasUteisRest = calcDiasUteisRestantes(deadline ?? undefined);
  const diasUteisNoMes = calcDiasUteisMesAte(deadline ?? undefined);
  const diasUteisDecorridos = Math.max(diasUteisNoMes - diasUteisRest, 1);
  const projecaoFinal = Math.round((clientesTotal / diasUteisDecorridos) * diasUteisNoMes);
  const esperadoHoje = Math.round((metas.m3 / diasUteisNoMes) * diaAtual);
  const pctM3 = pct(clientesTotal, metas.m3);
  const emRitmo = clientesTotal >= esperadoHoje;
  const pctRitmo = esperadoHoje > 0 ? (clientesTotal / esperadoHoje) * 100 : 0;
  const forecastNivel = pctRitmo >= 100 ? 3 : pctRitmo >= 80 ? 2 : 1;
  const nec = (meta: number) => Math.max(Math.ceil((meta - clientesTotal) / Math.max(diasUteisRest, 1)), 0);

  const { diasRestantesSemana, fechPorSemana, semanaEncerrada } = calcFechamentosSemana(metas, diasUteisNoMes);
  const chave = `ravenna_semana_${getInicioSemana().toISOString().slice(0, 10)}`;
  const feitosEstaSemana = storageGet<number>(chave) ?? 0;
  const metaSemBatida = feitosEstaSemana >= fechPorSemana;
  const ritmoAtual = diasUteisDecorridos > 0 ? Math.ceil(clientesTotal / diasUteisDecorridos) : 0;

  const marcadores = [
    { label: "M1", val: metas.m1, color: "#F59E0B" },
    { label: "M2", val: metas.m2, color: "#A855F7" },
    { label: "M3", val: metas.m3, color: "#EC4899" },
  ];

  return (
    <div className="rounded-2xl p-6 space-y-5" style={CARD}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-pink" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Progresso do Mês</span>
          <button onClick={onEditMetas} className="ml-1 p-1 rounded-lg text-muted-foreground/40 hover:text-muted-foreground hover:bg-white/5 transition-all">
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className={cn("text-xs font-bold px-3 py-1 rounded-full border", emRitmo ? "border-success/40 bg-success/10 text-success" : "border-destructive/40 bg-destructive/10 text-destructive")}>
          {emRitmo ? "No Ritmo" : "Atrasado"}
        </span>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — big number */}
        <div className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="text-7xl font-black leading-none" style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {clientesTotal}
            </span>
            <span className="text-xl text-muted-foreground font-light">/ {metas.m3}</span>
          </div>
          <p className="text-sm text-muted-foreground">de {metas.m3} fechamentos</p>
          <span className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "rgba(236,72,153,0.12)", color: "#EC4899", border: "1px solid rgba(236,72,153,0.25)" }}>
            {pctM3}% da Meta 3
          </span>

          {/* Forecast */}
          <div className="pt-2 space-y-1">
            <p className={cn("text-sm font-bold", forecastNivel === 3 ? "text-success" : forecastNivel === 2 ? "text-warning" : "text-pink")}>
              {forecastNivel === 3 ? "🏆 Forecast da Meta 3" : forecastNivel === 2 ? "🎯 Forecast da Meta 2" : "🚀 Forecast da Meta 1"}
            </p>
          </div>
        </div>

        {/* Right — visual progress bar with trophies */}
        <div className="space-y-4">
          {/* Trophy markers */}
          <div className="relative pt-8 pb-2">
            {marcadores.map(({ label, val, color }) => {
              const leftPct = Math.min(pct(val, metas.m3), 98);
              return (
                <div key={label} className="absolute top-0 flex flex-col items-center" style={{ left: `${leftPct}%`, transform: "translateX(-50%)" }}>
                  <Trophy className="h-4 w-4 mb-0.5" style={{ color }} />
                  <span className="text-[10px] font-bold" style={{ color }}>{label}</span>
                  <span className="text-[10px] text-muted-foreground">{val}</span>
                  <div className="h-3 w-px mt-0.5" style={{ background: color + "60" }} />
                </div>
              );
            })}
            {/* Current position indicator */}
            <div
              className="absolute top-0 z-10 flex flex-col items-center transition-[left] duration-700"
              style={{ left: `${Math.min(pct(clientesTotal, metas.m3), 98)}%`, transform: "translateX(-50%)" }}
            >
              <span className="text-xs font-extrabold text-warning">{clientesTotal}</span>
              <div className="h-3 w-px bg-warning mt-0.5" />
            </div>
            {/* Bar */}
            <div className="h-3 w-full rounded-full overflow-hidden mt-3" style={{ background: "rgba(139,92,246,0.08)" }}>
              <div className="h-full rounded-full transition-[width] duration-700 shadow-glow" style={{ width: `${pct(clientesTotal, metas.m3)}%`, background: GRAD }} />
            </div>
          </div>

          {/* Ritmo e meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 space-y-0.5" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Seu ritmo atual</p>
              <p className="text-2xl font-extrabold text-primary">{ritmoAtual}<span className="text-sm font-normal text-muted-foreground">/dia</span></p>
            </div>
            <div className="rounded-xl p-3 space-y-0.5" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Necessário M1</p>
              <p className="text-2xl font-extrabold" style={{ color: nec(metas.m1) === 0 ? "#22C55E" : "#EC4899" }}>
                {nec(metas.m1) === 0 ? "✓" : nec(metas.m1)}<span className="text-sm font-normal text-muted-foreground">/dia</span>
              </p>
            </div>
          </div>

          {/* Faltam para M1 */}
          {nec(metas.m1) > 0 && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <Rocket className="h-4 w-4 text-warning shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Faltam <span className="text-warning font-extrabold">{Math.max(metas.m1 - clientesTotal, 0)}</span> fechamentos para a Meta 1</p>
                <p className="text-xs text-muted-foreground">Mantendo {nec(metas.m1)}/dia, você alcança em {diasUteisRest} dias</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3 meta cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Meta 1", val: metas.m1, pctVal: pct(clientesTotal, metas.m1) },
          { label: "Meta 2", val: metas.m2, pctVal: pct(clientesTotal, metas.m2) },
          { label: "Meta 3 ★", val: metas.m3, pctVal: pct(clientesTotal, metas.m3) },
        ].map(({ label, val, pctVal }) => {
          const n = Math.max(Math.ceil((val - clientesTotal) / Math.max(diasUteisRest, 1)), 0);
          return (
            <div key={label} className="rounded-xl p-4 space-y-2" style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.14)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="text-[11px] text-muted-foreground/70">{val} fechamentos</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.15)", color: "#A78BFA" }}>
                  {Math.min(pctVal, 100)}%
                </span>
              </div>
              <p className={cn("text-3xl font-extrabold", n === 0 ? "text-success" : "text-pink")}>
                {n === 0 ? "✓" : n}<span className="text-base font-normal text-muted-foreground">/dia</span>
              </p>
              <SlimBar value={clientesTotal} max={val} />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                {n > 0 ? <span>Falta <span className="font-bold text-pink">{Math.max(val - clientesTotal, 0)}</span> pra meta</span> : <span className="text-success font-semibold">✓ Meta atingida!</span>}
                <span>{clientesTotal}/{val}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl px-4 py-3 space-y-0.5" style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.12)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Projeção Final</p>
          <div className="flex items-center gap-1.5">
            <span className={cn("text-xl font-extrabold", projecaoFinal >= metas.m3 ? "text-success" : "text-destructive")}>{projecaoFinal}</span>
            <span className="text-xs text-muted-foreground">/ {metas.m3}</span>
          </div>
          {projecaoFinal > metas.m3 && <p className="text-[10px] text-success">↑ {projecaoFinal - metas.m3} acima da Meta 3</p>}
        </div>
        <div className={cn("rounded-xl px-4 py-3 space-y-0.5", metaSemBatida ? "border-success/30 bg-success/8" : "")} style={{ background: metaSemBatida ? "rgba(34,197,94,0.08)" : "rgba(139,92,246,0.04)", border: metaSemBatida ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(139,92,246,0.12)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Meta da Semana</p>
          <p className={cn("text-sm font-bold", metaSemBatida ? "text-success" : "text-foreground")}>
            {semanaEncerrada ? "🎉 Fim de semana!" : metaSemBatida ? "✓ Batida!" : `${feitosEstaSemana}/${fechPorSemana}`}
          </p>
          {!semanaEncerrada && <p className="text-[10px] text-muted-foreground">{diasRestantesSemana} dia(s) restante(s)</p>}
        </div>
        <div className="rounded-xl px-4 py-3 space-y-0.5" style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.12)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Dias Restantes</p>
          <p className="text-xl font-extrabold text-foreground">{diasUteisRest} <span className="text-xs font-normal text-muted-foreground">úteis</span></p>
        </div>
        <div className="rounded-xl px-4 py-3 space-y-0.5" style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.12)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Esta Semana</p>
          <p className="text-xl font-extrabold text-foreground">{feitosEstaSemana}<span className="text-xs font-normal text-muted-foreground">/{fechPorSemana}</span></p>
          <p className="text-[10px] text-muted-foreground">{diasRestantesSemana} dia(s) restante(s)</p>
        </div>
      </div>
    </div>
  );
}

/* ── Evolução chart ── */
function EvolucaoChart({ diario, metaM3, diasTotal }: { diario: DadosDiarios[]; metaM3: number; diasTotal: number }) {
  const data = diario.map((d, i) => ({
    dia: d.dia, acumulado: d.clientes, noDia: d.noDia,
    metaIdeal: Math.round((metaM3 / diasTotal) * (i + 1)),
  }));
  return (
    <div className="rounded-2xl p-6 space-y-4 h-full" style={CARD}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Evolução Diária</p>
          <p className="text-xs text-muted-foreground">Acumulado no mês</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 rounded" style={{ background: "#8B5CF6" }} /> Acumulado</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 rounded" style={{ background: "#EC4899" }} /> No dia</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EC4899" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(139,92,246,0.06)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="dia" tick={{ fill: "#B7ABC8", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#B7ABC8", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#FFFFFF", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 12, color: "#1A1530", fontSize: 12 }}
            labelStyle={{ color: "#B7ABC8" }}
          />
          <Area type="monotone" dataKey="acumulado" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#gA)" dot={{ r: 3, fill: "#8B5CF6", strokeWidth: 0 }} name="Acumulado" />
          <Area type="monotone" dataKey="noDia" stroke="#EC4899" strokeWidth={1.5} fill="url(#gP)" strokeDasharray="4 3" dot={false} name="No dia" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Ganhos panel ── */
function GanhosPanel({ clientesTotal, registros, onAdd, onRemove, onSave, saved }: {
  clientesTotal: number; registros: unknown[]; onAdd: () => void; onRemove: () => void; onSave: () => void; saved: boolean;
}) {
  return (
    <div className="rounded-2xl p-6 space-y-5 h-full flex flex-col" style={CARD}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Ganhos de Hoje</p>
          <p className="text-xs text-muted-foreground">Registre seus ganhos e mantenha seu ritmo!</p>
        </div>
        <TrendingUp className="h-4 w-4 text-pink" />
      </div>

      {/* Big counter */}
      <div className="flex items-center justify-center gap-5 py-2">
        <button
          onClick={onRemove}
          className="h-12 w-12 rounded-xl border text-2xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
          style={{ border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#EF4444" }}
        >
          −
        </button>
        <div className="text-center">
          <p className="text-5xl font-black" style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {clientesTotal}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">ganhos</p>
        </div>
        <button
          onClick={onAdd}
          className="h-12 w-12 rounded-xl border text-2xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
          style={{ border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.08)", color: "#A78BFA" }}
        >
          +
        </button>
      </div>

      <div className="space-y-2 mt-auto">
        <button
          onClick={onSave}
          className={cn("w-full h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all", saved ? "opacity-80" : "hover:opacity-90 active:scale-[0.98]")}
          style={{ background: saved ? "rgba(34,197,94,0.2)" : GRAD, border: saved ? "1px solid rgba(34,197,94,0.4)" : "none", color: saved ? "#22C55E" : "white", boxShadow: saved ? "none" : "0 0 20px -4px rgba(139,92,246,0.4)" }}
        >
          <Save className="h-4 w-4" />
          {saved ? "✓ Salvo!" : "Salvar ganhos"}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onRemove} className="h-10 rounded-xl text-xs font-semibold transition-all hover:opacity-80" style={{ border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.06)", color: "#EF4444" }}>
            − 1 ganho
          </button>
          <button onClick={onAdd} className="h-10 rounded-xl text-xs font-semibold transition-all hover:opacity-80" style={{ border: "1px solid rgba(139,92,246,0.25)", background: "rgba(139,92,246,0.06)", color: "#A78BFA" }}>
            + 1 ganho
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Performance history ── */
function EvolucaoPerformance() {
  const primeiro = historico[0]; const ultimo = historico[historico.length - 1];
  const crescPct = Math.round(((ultimo.clientes - primeiro.clientes) / primeiro.clientes) * 100);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-pink" />
        <p className="text-sm font-semibold text-foreground">Evolução de Performance — <span className="text-muted-foreground">{primeiro.tier}</span><span className="mx-1 text-muted-foreground/40">→</span><span className="text-success">{ultimo.tier}</span></p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {historico.map((d) => {
          const maxMeta = d.megaMeta ?? d.metas.m3;
          const tierCfg = TIER_CFG[d.tier] ?? TIER_CFG["Tier 4/5"];
          const batida = d.clientes >= d.metas.m3;
          return (
            <div key={d.mes} className="rounded-xl p-4 space-y-2" style={CARD}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-foreground">{d.mes}</p>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: tierCfg.bg, color: tierCfg.text }}>{d.tier}</span>
              </div>
              <p className="text-3xl font-extrabold" style={{ color: d.conclusao.cor }}>{d.clientes}</p>
              <SlimBar value={d.clientes} max={maxMeta} />
              <p className="text-[10px]" style={{ color: d.conclusao.cor }}>{d.conclusao.tipo === "fail" ? "✕ " : d.conclusao.tipo === "mega" ? "★ " : "✓ "}{batida ? "Meta batida" : "Não bateu"}</p>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 rounded-xl px-5 py-3" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
        <Award className="h-4 w-4 text-success" />
        <p className="text-sm font-semibold text-success">{primeiro.tier} ({primeiro.clientes}) → {ultimo.tier} ({ultimo.clientes}) · <span className="text-success/80">+{crescPct}% em {historico.length} meses</span></p>
      </div>
    </div>
  );
}

/* ── Main page ── */
function MetasPage() {
  const dadosPlanilha = storageGet<{ atual?: Partial<DadosAtual>; metas?: { m1?: number; m2?: number; m3?: number }; diario?: DadosDiarios[] }>(STORAGE.PLANILHA);
  const [metasOverride, setMetasOverride] = useState<{ m1: number; m2: number; m3: number } | null>(null);
  const [metasDialogOpen, setMetasDialogOpen] = useState(false);
  const [editM1, setEditM1] = useState(""); const [editM2, setEditM2] = useState(""); const [editM3, setEditM3] = useState("");
  const [metasSaving, setMetasSaving] = useState(false);

  useEffect(() => {
    supabase.from("dashboard_metas").select("m1, m2, m3").eq("id", "singleton").maybeSingle().then(({ data }) => {
      if (data) setMetasOverride({ m1: data.m1, m2: data.m2, m3: data.m3 });
    });
  }, []);

  const metasBase = { m1: dadosPlanilha?.metas?.m1 ?? abrilFallback.metas.m1, m2: dadosPlanilha?.metas?.m2 ?? abrilFallback.metas.m2, m3: dadosPlanilha?.metas?.m3 ?? abrilFallback.metas.m3 };
  const metasAtivas = metasOverride ?? metasBase;
  const dadosAtual: DadosAtual = { ...abrilFallback, ...(dadosPlanilha?.atual ?? {}), metas: metasAtivas };
  const diarioAtual = (dadosPlanilha?.diario && dadosPlanilha.diario.length > 0) ? dadosPlanilha.diario : abrilDiarioFallback;
  const deadline = getDeadlineMes();
  const diasUteisNoMesAtual = calcDiasUteisMesAte(deadline ?? undefined);

  const [registros, setRegistros] = useState<RegistroGanho[]>(() => storageGet<RegistroGanho[]>(STORAGE.GANHOS) ?? []);
  const [saved, setSaved] = useState(false);
  const syncedRef = useRef(false);
  const totalManual = registros.reduce((s, r) => s + r.quantidade, 0);
  const clientesTotal = dadosAtual.clientes + totalManual;
  const saudacao = getSaudacao();

  useEffect(() => {
    if (syncedRef.current) return; syncedRef.current = true;
    supabase.from("dashboard_ganhos").select("*").eq("perfil", "bibi").order("created_at", { ascending: true }).then(({ data }) => {
      if (data && data.length > 0) {
        const remoto: RegistroGanho[] = data.map((r: any) => ({ id: r.id, data: r.data_ganho, quantidade: r.quantidade, obs: r.obs ?? "" }));
        setRegistros(remoto); storageSet(STORAGE.GANHOS, remoto);
      }
    });
  }, []);

  useEffect(() => { storageSet(STORAGE.GANHOS, registros); }, [registros]);

  const handleAdd = async () => {
    const dataHoje = new Date().toLocaleDateString("pt-BR");
    const { data } = await supabase.from("dashboard_ganhos").insert({ perfil: "bibi", data_ganho: dataHoje, quantidade: 1, obs: "Ajuste rápido" }).select().single();
    setRegistros((prev) => [...prev, { id: data?.id ?? nextId++, data: dataHoje, quantidade: 1, obs: "" }]);
    const chave = `ravenna_semana_${getInicioSemana().toISOString().slice(0, 10)}`;
    storageSet(chave, (storageGet<number>(chave) ?? 0) + 1);
  };

  const handleRemove = async () => {
    if (registros.length === 0) return;
    const ultimo = registros[registros.length - 1];
    await supabase.from("dashboard_ganhos").delete().eq("id", ultimo.id);
    setRegistros((prev) => prev.slice(0, -1));
    const chave = `ravenna_semana_${getInicioSemana().toISOString().slice(0, 10)}`;
    storageSet(chave, Math.max((storageGet<number>(chave) ?? 0) - 1, 0));
  };

  const handleSave = () => { storageSet(STORAGE.GANHOS, registros); setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const handleSaveMetas = async () => {
    const m1 = Number(editM1) || 0; const m2 = Number(editM2) || 0; const m3 = Number(editM3) || 0;
    setMetasSaving(true);
    await supabase.from("dashboard_metas").upsert({ id: "singleton", m1, m2, m3, updated_at: new Date().toISOString() });
    setMetasOverride({ m1, m2, m3 }); setMetasSaving(false); setMetasDialogOpen(false);
    toast.success("Metas salvas!");
  };

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* TOP: Progress (largo) + Ganhos (estreito) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5 items-start">
        <ProgressCard
          clientesTotal={clientesTotal}
          dados={dadosAtual}
          onEditMetas={() => {
            setEditM1(String(metasAtivas.m1 || "")); setEditM2(String(metasAtivas.m2 || "")); setEditM3(String(metasAtivas.m3 || ""));
            setMetasDialogOpen(true);
          }}
        />
        <GanhosPanel
          clientesTotal={clientesTotal} registros={registros}
          onAdd={handleAdd} onRemove={handleRemove} onSave={handleSave} saved={saved}
        />
      </div>

      {/* Chart */}
      <EvolucaoChart diario={diarioAtual} metaM3={dadosAtual.metas.m3} diasTotal={diasUteisNoMesAtual} />

      {/* Edit metas dialog */}
      <Dialog open={metasDialogOpen} onOpenChange={setMetasDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Editar Metas do Mês</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {[{ label: "Meta 1", value: editM1, onChange: setEditM1 }, { label: "Meta 2", value: editM2, onChange: setEditM2 }, { label: "Meta 3 ★", value: editM3, onChange: setEditM3 }].map(({ label, value, onChange }) => (
              <div key={label} className="flex items-center gap-4">
                <span className="w-20 text-sm font-semibold">{label}</span>
                <Input type="number" min={0} value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" className="flex-1" />
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild><Button variant="outline" size="sm">Cancelar</Button></DialogClose>
            <Button size="sm" onClick={handleSaveMetas} disabled={metasSaving} className="bg-gradient-primary text-white shadow-glow hover:opacity-90">{metasSaving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
