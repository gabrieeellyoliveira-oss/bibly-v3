import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Phone, AlertTriangle, Sparkles, Target, Star, Bell, Download, UserPlus, RefreshCw, MessageSquare, ShieldAlert } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";
import { IconChip } from "@/components/bibly/IconChip";
import { EditGear } from "@/components/bibly/EditGear";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import jaguarBanner from "@/assets/jaguar-banner.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Visão Geral — Aurora" },
      { name: "description", content: "KPIs, saúde da carteira e próximas ações da PSM Squad Onça." },
      { property: "og:title", content: "Visão Geral — Aurora" },
      { property: "og:description", content: "Painel principal com indicadores da carteira." },
    ],
  }),
  component: Overview,
});

type Period = "hoje" | "7d" | "mes" | "tri" | "sem";
const PERIODS: { id: Period; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "7d", label: "7 dias" },
  { id: "mes", label: "Este mês" },
  { id: "tri", label: "Trimestre" },
  { id: "sem", label: "Semestre" },
];

type Kpis = { clientes: number; followUps: number; risco: number; receita: number; meta: number; health: number };
const KPIS_BY_PERIOD: Record<Period, Kpis & { deltas: number[] }> = {
  hoje: { clientes: 142, followUps: 6, risco: 4, receita: 2350, meta: 12, health: 82, deltas: [2, -1, 0, 3, 1, 2, 1] },
  "7d": { clientes: 142, followUps: 23, risco: 9, receita: 18700, meta: 48, health: 83, deltas: [3, 2, -1, 4, 2, 3, 5] },
  mes: { clientes: 142, followUps: 47, risco: 12, receita: 63510, meta: 78, health: 84, deltas: [8, -2, 3, 5, 4, 6, 8] },
  tri: { clientes: 138, followUps: 132, risco: 15, receita: 184300, meta: 92, health: 85, deltas: [10, 8, 6, 12, 9, 11, 14] },
  sem: { clientes: 129, followUps: 274, risco: 18, receita: 352800, meta: 97, health: 86, deltas: [15, 12, 18, 14, 20, 17, 22] },
};

function Sparkline({ data, color = "#6d4cff" }: { data: number[]; color?: string }) {
  const w = 100;
  const h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-7 mt-2">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-card rounded-2xl shadow-card p-5 ${className}`}>{children}</div>;
}

type Tone = "primary" | "magenta" | "danger" | "success" | "gold";

function KpiCard({
  icon,
  tone,
  label,
  value,
  delta,
  spark,
  invert = false,
}: {
  icon: typeof Users;
  tone: Tone;
  label: string;
  value: string | number;
  delta: number;
  spark: number[];
  invert?: boolean;
}) {
  const positive = invert ? delta < 0 : delta > 0;
  const badgeStyle = positive ? { backgroundColor: "#e7f8ef", color: "#0f9d58" } : { backgroundColor: "#fdeceb", color: "#d0453f" };
  return (
    <Card className="min-w-0">
      <div className="flex items-start justify-between">
        <IconChip icon={icon} tone={tone} />
        <span className="text-[11px] font-semibold px-2 py-1 rounded-md" style={badgeStyle}>
          {positive ? "↑" : "↓"} {Math.abs(delta)}%
        </span>
      </div>
      <div className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase mt-4">{label}</div>
      <div className="text-2xl font-bold mt-1 truncate">{value}</div>
      <Sparkline data={spark} color={tone === "danger" ? "#d0453f" : tone === "success" ? "#0f9d58" : tone === "gold" ? "#c68a1a" : tone === "magenta" ? "#d9468f" : "#6d4cff"} />
    </Card>
  );
}

function Overview() {
  const [period, setPeriod] = useState<Period>("mes");
  const k = KPIS_BY_PERIOD[period];

  const [health, setHealth] = useLocalStorageState("aurora.health", { saudaveis: 96, atencao: 34, criticos: 12 });
  const [actions, setActions] = useLocalStorageState("aurora.actions", [
    { time: "09:00", text: "Ligar para João — Pizzaria do Bairro" },
    { time: "10:30", text: "Enviar proposta para Rede Sabor" },
    { time: "13:00", text: "Reunião com time — pipeline semanal" },
    { time: "15:00", text: "Follow-up de onboarding — Deli Norte" },
    { time: "17:00", text: "Revisar metas do dia" },
  ]);
  const [evo, setEvo] = useLocalStorageState("aurora.evo", [
    { m: "Jan", v: 98 },
    { m: "Fev", v: 106 },
    { m: "Mar", v: 112 },
    { m: "Abr", v: 118 },
    { m: "Mai", v: 124 },
    { m: "Jun", v: 129 },
    { m: "Jul", v: 135 },
    { m: "Ago", v: 142 },
  ]);
  const [goals, setGoals] = useLocalStorageState("aurora.goals", [
    { label: "Follow-ups da semana", cur: 34, target: 50 },
    { label: "Novos onboardings", cur: 6, target: 8 },
    { label: "Recuperados", cur: 4, target: 6 },
    { label: "Reuniões realizadas", cur: 12, target: 15 },
  ]);
  const [moves] = useLocalStorageState("aurora.moves", [
    { type: "in", text: "Novo cliente ativado: Empório Verde", time: "há 2h" },
    { type: "rec", text: "Recuperado: Cantina Bella", time: "há 4h" },
    { type: "fu", text: "Follow-up realizado com Pizzaria Massa", time: "hoje" },
    { type: "risk", text: "Cliente em risco: Bar do Zé (queda de uso)", time: "ontem" },
    { type: "in", text: "Novo cliente ativado: Sushi Prime", time: "ontem" },
  ]);
  const [insights] = useLocalStorageState("aurora.insights", [
    "Sua conversão aumentou 12% neste mês.",
    "3 clientes precisam de follow-up hoje.",
    "Health score da carteira subiu 4pt.",
    "Meta trimestral em ritmo de bater 108%.",
  ]);

  const totalHealth = health.saudaveis + health.atencao + health.criticos;
  const goalAvg = Math.round((goals.reduce((s, g) => s + g.cur / g.target, 0) / goals.length) * 100);

  const exportCsv = () => {
    const rows = [
      ["metric", "value"],
      ["periodo", period],
      ["clientes", k.clientes],
      ["follow_ups", k.followUps],
      ["clientes_risco", k.risco],
      ["receita", k.receita],
      ["meta_pct", k.meta],
      ["health", k.health],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aurora-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  const MOVE_MAP: Record<string, { icon: typeof UserPlus; tone: Tone }> = {
    in: { icon: UserPlus, tone: "success" },
    rec: { icon: RefreshCw, tone: "primary" },
    fu: { icon: MessageSquare, tone: "magenta" },
    risk: { icon: ShieldAlert, tone: "danger" },
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">Painel Aurora</div>
          <h1 className="text-3xl font-bold mt-1">Visão Geral</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1 bg-card p-1 rounded-xl shadow-card">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === p.id ? "gradient-primary text-white shadow" : "text-muted-foreground hover:text-foreground"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={exportCsv} className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl text-sm font-medium shadow-card hover:bg-muted">
            <Download size={16} /> Exportar
          </button>
          <button type="button" className="relative bg-card h-10 w-10 rounded-xl shadow-card flex items-center justify-center hover:bg-muted">
            <Bell size={18} />
            <span
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
              style={{ backgroundColor: "#d9468f" }}
            >
              3
            </span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard icon={Users} tone="primary" label="Clientes" value={k.clientes} delta={4} spark={k.deltas} />
        <KpiCard icon={Phone} tone="magenta" label="Follow-ups" value={k.followUps} delta={12} spark={k.deltas} />
        <KpiCard icon={AlertTriangle} tone="danger" label="Em risco" value={k.risco} delta={-8} invert spark={k.deltas} />
        <KpiCard icon={Sparkles} tone="success" label="Receita" value={brl(k.receita)} delta={9} spark={k.deltas} />
        <KpiCard icon={Target} tone="primary" label="Meta período" value={`${k.meta}%`} delta={6} spark={k.deltas} />
        <KpiCard icon={Star} tone="gold" label="Health Score" value={k.health} delta={3} spark={k.deltas} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Saúde da carteira</div>
              <div className="text-lg font-bold mt-1">Distribuição atual</div>
            </div>
            <EditGear title="Editar saúde da carteira">
              {() => (
                <div className="space-y-3">
                  {(["saudaveis", "atencao", "criticos"] as const).map((key) => (
                    <div key={key}>
                      <Label className="capitalize">{key}</Label>
                      <Input type="number" value={health[key]} onChange={(e) => setHealth({ ...health, [key]: +e.target.value || 0 })} />
                    </div>
                  ))}
                </div>
              )}
            </EditGear>
          </div>
          <div className="mt-3 relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Saudáveis", value: health.saudaveis, color: "#0f9d58" },
                    { name: "Atenção", value: health.atencao, color: "#f2b53c" },
                    { name: "Críticos", value: health.criticos, color: "#d0453f" },
                  ]}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {[0, 1, 2].map((i) => (
                    <Cell key={i} fill={["#0f9d58", "#f2b53c", "#d0453f"][i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-3xl font-bold">{totalHealth}</div>
              <div className="text-xs text-muted-foreground">clientes</div>
            </div>
          </div>
          <div className="mt-3 space-y-2 text-sm">
            {(
              [
                ["Saudáveis", "#0f9d58", health.saudaveis],
                ["Atenção", "#f2b53c", health.atencao],
                ["Críticos", "#d0453f", health.criticos],
              ] as const
            ).map(([l, c, v]) => (
              <div key={l} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c }} />
                  {l}
                </span>
                <span className="font-semibold">{v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Próximas ações</div>
              <div className="text-lg font-bold mt-1">Hoje</div>
            </div>
            <EditGear title="Editar próximas ações">
              {() => (
                <div className="space-y-2">
                  {actions.map((a, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        className="w-24"
                        value={a.time}
                        onChange={(e) => {
                          const c = [...actions];
                          c[i] = { ...c[i], time: e.target.value };
                          setActions(c);
                        }}
                      />
                      <Input
                        value={a.text}
                        onChange={(e) => {
                          const c = [...actions];
                          c[i] = { ...c[i], text: e.target.value };
                          setActions(c);
                        }}
                      />
                      <button type="button" className="text-destructive text-sm" onClick={() => setActions(actions.filter((_, j) => j !== i))}>
                        ×
                      </button>
                    </div>
                  ))}
                  <button type="button" className="text-sm text-primary font-semibold" onClick={() => setActions([...actions, { time: "00:00", text: "Nova ação" }])}>
                    + Adicionar
                  </button>
                </div>
              )}
            </EditGear>
          </div>
          <ul className="mt-4 space-y-3">
            {actions.map((a, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="text-xs font-bold w-12 shrink-0" style={{ color: "var(--category-label)" }}>
                  {a.time}
                </span>
                <span className="text-sm">{a.text}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="rounded-2xl overflow-hidden shadow-card relative min-h-[300px] flex flex-col justify-between p-6 text-white" style={{ backgroundColor: "#0d0b14" }}>
          <img src={jaguarBanner} alt="Squad Onça" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(13,11,20,0.85), rgba(13,11,20,0.55) 60%, rgba(217,70,143,0.25))" }} />
          <div className="relative">
            <div className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "#f2a6ce" }}>
              Squad Onça
            </div>
            <h3 className="mt-3 text-2xl font-bold leading-tight">
              Precisão. Estratégia.
              <br />
              <span style={{ color: "#f2a6ce" }}>Excelência.</span>
              <br />
              <span style={{ color: "#f2a6ce" }}>Resultado.</span>
            </h3>
          </div>
          <div className="relative text-[10px] font-bold tracking-[0.25em] text-white/80 uppercase">Foco • Garra • Resultado</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-7">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Evolução da carteira</div>
              <div className="text-lg font-bold mt-1">Clientes ativos por mês</div>
            </div>
            <EditGear title="Editar evolução">
              {() => (
                <div className="space-y-2">
                  {evo.map((e, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        className="w-20"
                        value={e.m}
                        onChange={(ev) => {
                          const c = [...evo];
                          c[i] = { ...c[i], m: ev.target.value };
                          setEvo(c);
                        }}
                      />
                      <Input
                        type="number"
                        value={e.v}
                        onChange={(ev) => {
                          const c = [...evo];
                          c[i] = { ...c[i], v: +ev.target.value || 0 };
                          setEvo(c);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </EditGear>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={evo} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6d4cff" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6d4cff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="m" stroke="#8b90a6" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
              <Area type="monotone" dataKey="v" stroke="#6d4cff" strokeWidth={2.5} fill="url(#gp)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Objetivos da semana</div>
              <div className="text-lg font-bold mt-1">Progresso</div>
            </div>
            <EditGear title="Editar objetivos">
              {() => (
                <div className="space-y-2">
                  {goals.map((g, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={g.label}
                        onChange={(e) => {
                          const c = [...goals];
                          c[i] = { ...c[i], label: e.target.value };
                          setGoals(c);
                        }}
                      />
                      <Input
                        className="w-20"
                        type="number"
                        value={g.cur}
                        onChange={(e) => {
                          const c = [...goals];
                          c[i] = { ...c[i], cur: +e.target.value || 0 };
                          setGoals(c);
                        }}
                      />
                      <Input
                        className="w-20"
                        type="number"
                        value={g.target}
                        onChange={(e) => {
                          const c = [...goals];
                          c[i] = { ...c[i], target: +e.target.value || 0 };
                          setGoals(c);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </EditGear>
          </div>

          <div className="flex items-center gap-5 mt-4">
            <div className="relative h-24 w-24 shrink-0 rounded-full" style={{ background: `conic-gradient(#6d4cff ${goalAvg * 3.6}deg, #eceef5 0)` }}>
              <div className="absolute inset-2 rounded-full bg-card flex items-center justify-center">
                <span className="text-xl font-bold text-gradient">{goalAvg}%</span>
              </div>
            </div>
            <div className="flex-1 space-y-3 min-w-0">
              {goals.map((g, i) => {
                const pct = Math.min(100, Math.round((g.cur / g.target) * 100));
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="truncate font-medium">{g.label}</span>
                      <span className="text-muted-foreground shrink-0 ml-2">
                        {g.cur}/{g.target}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full gradient-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-7">
          <div className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Últimas movimentações</div>
          <div className="text-lg font-bold mt-1 mb-4">Timeline</div>
          <ol className="relative border-l-2 border-muted ml-3 space-y-4">
            {moves.map((m, i) => {
              const c = MOVE_MAP[m.type];
              return (
                <li key={i} className="relative pl-8">
                  <div className="absolute -left-[18px] top-0">
                    <IconChip icon={c.icon} tone={c.tone} size="sm" />
                  </div>
                  <div className="text-sm font-medium">{m.text}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{m.time}</div>
                </li>
              );
            })}
          </ol>
        </Card>

        <Card className="lg:col-span-5">
          <div className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Insights rápidos</div>
          <div className="text-lg font-bold mt-1 mb-4">Para agir agora</div>
          <ul className="space-y-3">
            {insights.map((t, i) => (
              <li key={i} className="flex items-start gap-3 p-3 rounded-xl gradient-soft">
                <IconChip icon={Sparkles} tone="primary" size="sm" />
                <span className="text-sm leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
