import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  DollarSign,
  Flower2,
  Heart,
  LayoutDashboard,
  LineChart as LineChartIcon,
  PiggyBank,
  Repeat,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Trend = "up" | "down";

type Kpi = {
  label: string;
  value: string;
  delta: string;
  trend: Trend;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
};

const funnelData = [
  { etapa: "Leads", valor: 480 },
  { etapa: "Qualificados", valor: 312 },
  { etapa: "Reunião", valor: 184 },
  { etapa: "Proposta", valor: 96 },
  { etapa: "Fechados", valor: 42 },
];

const revenueData = [
  { mes: "Jan", MRR: 42, Comissoes: 8 },
  { mes: "Fev", MRR: 46, Comissoes: 9 },
  { mes: "Mar", MRR: 51, Comissoes: 10 },
  { mes: "Abr", MRR: 55, Comissoes: 11 },
  { mes: "Mai", MRR: 62, Comissoes: 12 },
  { mes: "Jun", MRR: 68, Comissoes: 13 },
  { mes: "Jul", MRR: 74, Comissoes: 14 },
];

const onboardingData = [
  { semana: "S1", dias: 14 },
  { semana: "S2", dias: 12 },
  { semana: "S3", dias: 11 },
  { semana: "S4", dias: 9 },
  { semana: "S5", dias: 8 },
  { semana: "S6", dias: 7 },
];

const channelMix = [
  { name: "Revendas", value: 42 },
  { name: "Consultorias", value: 28 },
  { name: "Agências", value: 18 },
  { name: "Referral", value: 12 },
];

const partners = [
  { nome: "Rosa & Co.", status: "Ativo", treino: 92, leads: 38, mrr: "R$ 14.2k", churn: 2.1 },
  { nome: "Petal Digital", status: "Ativo", treino: 88, leads: 31, mrr: "R$ 11.8k", churn: 1.4 },
  { nome: "Blossom Tech", status: "Onboarding", treino: 46, leads: 9, mrr: "R$ 2.1k", churn: 0 },
  { nome: "Camélia Ltda", status: "Ativo", treino: 74, leads: 22, mrr: "R$ 7.6k", churn: 3.2 },
  { nome: "Magnólia Sales", status: "Em risco", treino: 34, leads: 4, mrr: "R$ 1.4k", churn: 8.7 },
  { nome: "Peônia Partners", status: "Ativo", treino: 81, leads: 27, mrr: "R$ 9.3k", churn: 2.6 },
];

const chartColors = ["#f4a8c4", "#f5c2d0", "#e8b4c8", "#f7d1dc", "#d8a3bd"];

const activationKpis: Kpi[] = [
  { label: "Tempo médio de onboarding", value: "8 dias", delta: "-3d", trend: "up", hint: "meta: 10d", icon: Sparkles },
  { label: "% do canal treinado", value: "76%", delta: "+9pp", trend: "up", hint: "meta: 80%", icon: BookOpen },
  { label: "Acesso ao portal", value: "68%", delta: "+4pp", trend: "up", hint: "últimos 30d", icon: Activity },
  { label: "Ações de co-marketing", value: "23", delta: "+6", trend: "up", hint: "este trimestre", icon: Target },
];

const commercialKpis: Kpi[] = [
  { label: "Leads indicados", value: "480", delta: "+18%", trend: "up", hint: "vs. mês anterior", icon: Users },
  { label: "Taxa de conversão", value: "8,7%", delta: "+1,2pp", trend: "up", hint: "lead → fechado", icon: TrendingUp },
  { label: "Volume de vendas", value: "R$ 1,2M", delta: "+22%", trend: "up", hint: "YTD", icon: LineChartIcon },
  { label: "Ticket médio", value: "R$ 28,4k", delta: "-2%", trend: "down", hint: "trimestre", icon: BadgeCheck },
];

const financeKpis: Kpi[] = [
  { label: "MRR do canal", value: "R$ 74k", delta: "+9%", trend: "up", hint: "recorrente", icon: Repeat },
  { label: "Comissões pagas", value: "R$ 14k", delta: "+1,8k", trend: "up", hint: "mês atual", icon: DollarSign },
  { label: "Churn dos clientes", value: "3,1%", delta: "-0,4pp", trend: "up", hint: "meta: <4%", icon: Heart },
  { label: "CLV médio", value: "R$ 42k", delta: "+6%", trend: "up", hint: "por parceiro", icon: PiggyBank },
];

export function Dashboard() {
  const [tab, setTab] = useState("visao");

  const totalPartners = partners.length;
  const ativos = useMemo(() => partners.filter((p) => p.status === "Ativo").length, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="hidden md:flex w-60 flex-col gap-1 border-r border-sidebar-border bg-sidebar px-4 py-6 sticky top-0 h-screen">
          <div className="flex items-center gap-2 px-2 pb-6">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/70 text-primary-foreground shadow-[var(--shadow-soft)]">
              <Flower2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight text-sidebar-foreground">Bibly</div>
              <div className="text-[11px] text-muted-foreground">PSM Jr. TR3</div>
            </div>
          </div>
          {[
            { icon: LayoutDashboard, label: "Visão geral", active: true },
            { icon: Users, label: "Parceiros" },
            { icon: TrendingUp, label: "Pipeline" },
            { icon: PiggyBank, label: "Financeiro" },
            { icon: BookOpen, label: "Capacitação" },
            { icon: Settings, label: "Configurações" },
          ].map((item) => (
            <button
              key={item.label}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                item.active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
          <div className="mt-auto rounded-xl border border-sidebar-border bg-card p-3 text-xs text-muted-foreground">
            <div className="font-medium text-foreground mb-1">Dica da semana 🌸</div>
            Escolha 3–5 KPIs fixos e revise sempre no mesmo dia. Consistência {'>'} volume.
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/80 px-6 py-5 backdrop-blur">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Dashboard</div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Olá 🌷 vamos ver como está o canal hoje
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                {ativos}/{totalPartners} parceiros ativos
              </Badge>
              <Badge className="bg-primary/80 text-primary-foreground hover:bg-primary/80">Q3 · 2026</Badge>
            </div>
          </header>

          <div className="px-6 py-6 space-y-6">
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <HeroCard title="MRR do canal" value="R$ 74.320" delta="+9,4%" trend="up" caption="Receita recorrente" />
              <HeroCard title="Leads indicados" value="480" delta="+18%" trend="up" caption="Últimos 30 dias" />
              <HeroCard title="Conversão do funil" value="8,7%" delta="+1,2pp" trend="up" caption="Lead → fechado" />
              <HeroCard title="Churn do canal" value="3,1%" delta="-0,4pp" trend="up" caption="Meta: abaixo de 4%" />
            </section>

            <Tabs value={tab} onValueChange={setTab} className="space-y-6">
              <TabsList className="bg-secondary/70">
                <TabsTrigger value="visao">Visão geral</TabsTrigger>
                <TabsTrigger value="ativacao">Ativação & engajamento</TabsTrigger>
                <TabsTrigger value="comercial">Performance comercial</TabsTrigger>
                <TabsTrigger value="financeiro">Financeiro & retenção</TabsTrigger>
              </TabsList>

              <TabsContent value="visao" className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-3">
                  <Panel title="Receita recorrente vs. comissões" subtitle="R$ mil · últimos 7 meses" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={revenueData} margin={{ left: -10, right: 8, top: 8 }}>
                        <defs>
                          <linearGradient id="mrr" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#f4a8c4" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#f4a8c4" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="com" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#e8b4c8" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#e8b4c8" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#f3dfe8" vertical={false} />
                        <XAxis dataKey="mes" stroke="#a97a92" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#a97a92" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip content={<PrettyTooltip />} />
                        <Area type="monotone" dataKey="MRR" stroke="#e0759a" strokeWidth={2} fill="url(#mrr)" />
                        <Area type="monotone" dataKey="Comissoes" stroke="#c98aa8" strokeWidth={2} fill="url(#com)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Panel>

                  <Panel title="Mix por tipo de canal" subtitle="Participação na receita">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={channelMix} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={4}>
                          {channelMix.map((_, i) => (
                            <Cell key={i} fill={chartColors[i % chartColors.length]} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip content={<PrettyTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {channelMix.map((c, i) => (
                        <li key={c.name} className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartColors[i % chartColors.length] }} />
                            {c.name}
                          </span>
                          <span className="font-medium text-foreground">{c.value}%</span>
                        </li>
                      ))}
                    </ul>
                  </Panel>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Panel title="Funil comercial" subtitle="Últimos 30 dias">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 20 }}>
                        <CartesianGrid stroke="#f3dfe8" horizontal={false} />
                        <XAxis type="number" stroke="#a97a92" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="etapa" stroke="#a97a92" fontSize={12} tickLine={false} axisLine={false} width={90} />
                        <Tooltip content={<PrettyTooltip />} />
                        <Bar dataKey="valor" radius={[0, 10, 10, 0]}>
                          {funnelData.map((_, i) => (
                            <Cell key={i} fill={chartColors[i % chartColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Panel>

                  <Panel title="Tempo médio de onboarding" subtitle="Dias até parceiro ativado">
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={onboardingData} margin={{ left: -10, right: 8, top: 8 }}>
                        <CartesianGrid stroke="#f3dfe8" vertical={false} />
                        <XAxis dataKey="semana" stroke="#a97a92" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#a97a92" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip content={<PrettyTooltip />} />
                        <Line type="monotone" dataKey="dias" stroke="#e0759a" strokeWidth={3} dot={{ r: 4, fill: "#f4a8c4", stroke: "#e0759a", strokeWidth: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Panel>
                </div>

                <PartnersTable />
              </TabsContent>

              <TabsContent value="ativacao">
                <KpiGrid kpis={activationKpis} />
                <div className="mt-6">
                  <Panel title="Progresso de capacitação por parceiro" subtitle="% da trilha concluída">
                    <div className="space-y-4">
                      {partners.map((p) => (
                        <div key={p.nome} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-foreground">{p.nome}</span>
                            <span className="text-muted-foreground">{p.treino}%</span>
                          </div>
                          <Progress value={p.treino} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </Panel>
                </div>
              </TabsContent>

              <TabsContent value="comercial">
                <KpiGrid kpis={commercialKpis} />
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <Panel title="Funil comercial" subtitle="Leads → fechados">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={funnelData} margin={{ left: -10, right: 8, top: 8 }}>
                        <CartesianGrid stroke="#f3dfe8" vertical={false} />
                        <XAxis dataKey="etapa" stroke="#a97a92" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#a97a92" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip content={<PrettyTooltip />} />
                        <Bar dataKey="valor" radius={[10, 10, 0, 0]}>
                          {funnelData.map((_, i) => (
                            <Cell key={i} fill={chartColors[i % chartColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Panel>
                  <Panel title="Ciclo de vendas" subtitle="Dias por etapa (média)">
                    <ul className="space-y-3 text-sm">
                      {[
                        { etapa: "Lead → Qualificação", dias: 4 },
                        { etapa: "Qualificação → Reunião", dias: 6 },
                        { etapa: "Reunião → Proposta", dias: 9 },
                        { etapa: "Proposta → Fechamento", dias: 12 },
                      ].map((s) => (
                        <li key={s.etapa} className="flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-2">
                          <span className="text-foreground">{s.etapa}</span>
                          <span className="rounded-full bg-primary/70 px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                            {s.dias}d
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Panel>
                </div>
              </TabsContent>

              <TabsContent value="financeiro">
                <KpiGrid kpis={financeKpis} />
                <div className="mt-6">
                  <Panel title="Receita recorrente vs. comissões" subtitle="R$ mil · últimos 7 meses">
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={revenueData} margin={{ left: -10, right: 8, top: 8 }}>
                        <defs>
                          <linearGradient id="mrr2" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#f4a8c4" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#f4a8c4" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="com2" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#e8b4c8" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#e8b4c8" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#f3dfe8" vertical={false} />
                        <XAxis dataKey="mes" stroke="#a97a92" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#a97a92" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip content={<PrettyTooltip />} />
                        <Area type="monotone" dataKey="MRR" stroke="#e0759a" strokeWidth={2} fill="url(#mrr2)" />
                        <Area type="monotone" dataKey="Comissoes" stroke="#c98aa8" strokeWidth={2} fill="url(#com2)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Panel>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

function HeroCard({ title, value, delta, trend, caption }: { title: string; value: string; delta: string; trend: Trend; caption: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]" style={{ backgroundImage: "var(--gradient-soft)" }}>
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/25 blur-2xl" />
      <div className="relative">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</div>
        <div className="mt-2 flex items-baseline gap-2">
          <div className="text-3xl font-semibold tracking-tight text-foreground">{value}</div>
          <TrendPill delta={delta} trend={trend} />
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{caption}</div>
      </div>
    </div>
  );
}

function TrendPill({ delta, trend }: { delta: string; trend: Trend }) {
  const Icon = trend === "up" ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium", trend === "up" ? "bg-primary/40 text-foreground" : "bg-destructive/15 text-destructive")}>
      <Icon className="h-3 w-3" />
      {delta}
    </span>
  );
}

function Panel({ title, subtitle, children, className }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]", className)}>
      <div className="mb-4">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function KpiGrid({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((k) => (
        <div key={k.label} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-start justify-between">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-secondary-foreground">
              <k.icon className="h-4 w-4" />
            </div>
            <TrendPill delta={k.delta} trend={k.trend} />
          </div>
          <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{k.value}</div>
          <div className="text-xs font-medium text-foreground/80">{k.label}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">{k.hint}</div>
        </div>
      ))}
    </div>
  );
}

function PartnersTable() {
  return (
    <Panel title="Parceiros" subtitle="Saúde e desempenho">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="pb-3 font-medium">Parceiro</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Treino</th>
              <th className="pb-3 font-medium">Leads</th>
              <th className="pb-3 font-medium">MRR</th>
              <th className="pb-3 font-medium">Churn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {partners.map((p) => (
              <tr key={p.nome} className="text-foreground">
                <td className="py-3 font-medium">{p.nome}</td>
                <td className="py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Progress value={p.treino} className="h-1.5 w-24" />
                    <span className="text-xs text-muted-foreground">{p.treino}%</span>
                  </div>
                </td>
                <td className="py-3">{p.leads}</td>
                <td className="py-3">{p.mrr}</td>
                <td className={cn("py-3", p.churn > 5 ? "text-destructive" : "text-foreground")}>{p.churn.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Ativo: "bg-primary/40 text-foreground",
    Onboarding: "bg-accent/60 text-accent-foreground",
    "Em risco": "bg-destructive/15 text-destructive",
  };
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", map[status] ?? "bg-secondary")}>{status}</span>;
}

function PrettyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-[var(--shadow-soft)]">
      {label !== undefined && <div className="text-xs font-medium text-foreground">{label}</div>}
      <div className="mt-1 space-y-0.5">
        {payload.map((p: any) => (
          <div key={p.dataKey ?? p.name} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color ?? p.payload?.fill }} />
            <span className="text-foreground">{p.name}:</span>
            <span className="font-medium text-foreground">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
