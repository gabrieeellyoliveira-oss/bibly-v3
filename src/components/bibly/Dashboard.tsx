import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  CheckCircle2,
  Download,
  LineChart as LineChartIcon,
  PhoneCall,
  Sparkles,
  Star,
  Target,
  UserPlus,
  Users,
  Workflow,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { type Column, ObjectEditorDialog, RowsEditorDialog } from "@/components/bibly/editors";

// ---------------------------------------------------------------------------
// Dados de exemplo — dashboard pessoal do PSM. Tudo editável pela engrenagem
// em cada painel; persiste no navegador (localStorage).
// ---------------------------------------------------------------------------

type Kpis = {
  totalClientes: number;
  deltaClientes: string;
  pendenciasHoje: number;
  deltaPendencias: string;
  clientesRisco: number;
  deltaRisco: string;
  receitaCarteira: number;
  deltaReceita: string;
  metaMesPercent: number;
  deltaMeta: string;
  healthScore: number;
  deltaHealth: string;
};

const KPIS_PADRAO: Kpis = {
  totalClientes: 84,
  deltaClientes: "+4 este mês",
  pendenciasHoje: 16,
  deltaPendencias: "+3 vs. ontem",
  clientesRisco: 7,
  deltaRisco: "-2 esta semana",
  receitaCarteira: 63510,
  deltaReceita: "+9% este mês",
  metaMesPercent: 73,
  deltaMeta: "+12pp",
  healthScore: 86,
  deltaHealth: "+3 pts",
};

const KPIS_FIELDS: Column<Kpis>[] = [
  { key: "totalClientes", label: "Minha carteira — clientes", type: "number" },
  { key: "deltaClientes", label: "Minha carteira — variação" },
  { key: "pendenciasHoje", label: "Pendências hoje", type: "number" },
  { key: "deltaPendencias", label: "Pendências — variação" },
  { key: "clientesRisco", label: "Clientes em risco", type: "number" },
  { key: "deltaRisco", label: "Risco — variação" },
  { key: "receitaCarteira", label: "Receita da carteira (R$)", type: "number" },
  { key: "deltaReceita", label: "Receita — variação" },
  { key: "metaMesPercent", label: "Meta do mês (%)", type: "number" },
  { key: "deltaMeta", label: "Meta — variação" },
  { key: "healthScore", label: "Health Score", type: "number" },
  { key: "deltaHealth", label: "Health Score — variação" },
];

type SaudeCarteira = { saudaveis: number; atencao: number; criticos: number };
const SAUDE_PADRAO: SaudeCarteira = { saudaveis: 58, atencao: 19, criticos: 7 };
const SAUDE_FIELDS: Column<SaudeCarteira>[] = [
  { key: "saudaveis", label: "Saudáveis", type: "number" },
  { key: "atencao", label: "Atenção", type: "number" },
  { key: "criticos", label: "Críticos", type: "number" },
];

type EvolucaoPonto = { mes: string; valor: number };
const EVOLUCAO_COLUMNS: Column<EvolucaoPonto>[] = [
  { key: "mes", label: "Mês" },
  { key: "valor", label: "Clientes ativos", type: "number" },
];
const EVOLUCAO_PADRAO: EvolucaoPonto[] = [
  { mes: "Fev", valor: 61 },
  { mes: "Mar", valor: 65 },
  { mes: "Abr", valor: 69 },
  { mes: "Mai", valor: 74 },
  { mes: "Jun", valor: 79 },
  { mes: "Jul", valor: 84 },
];

type Acao = { horario: string; descricao: string };
const ACOES_COLUMNS: Column<Acao>[] = [
  { key: "horario", label: "Horário" },
  { key: "descricao", label: "Descrição" },
];
const ACOES_PADRAO: Acao[] = [
  { horario: "09:00", descricao: "Ligar para João" },
  { horario: "11:00", descricao: "Follow-up Restaurante XPTO" },
  { horario: "14:00", descricao: "Enviar proposta" },
  { horario: "16:30", descricao: "Revisar contrato Sabor & Cia" },
];

type Objetivo = { label: string; atual: number; meta: number };
const OBJETIVOS_COLUMNS: Column<Objetivo>[] = [
  { key: "label", label: "Objetivo" },
  { key: "atual", label: "Atual", type: "number" },
  { key: "meta", label: "Meta", type: "number" },
];
const OBJETIVOS_PADRAO: Objetivo[] = [
  { label: "Follow-ups", atual: 11, meta: 16 },
  { label: "Clientes recuperados", atual: 2, meta: 4 },
  { label: "Upsell", atual: 3, meta: 5 },
  { label: "Visitas", atual: 4, meta: 6 },
];

type Movimentacao = { tipo: string; cliente: string; tempo: string };
const MOVIMENTACOES_COLUMNS: Column<Movimentacao>[] = [
  { key: "tipo", label: "Tipo (entrou, recuperado, followup, risco)" },
  { key: "cliente", label: "Cliente" },
  { key: "tempo", label: "Quando" },
];
const MOVIMENTACOES_PADRAO: Movimentacao[] = [
  { tipo: "entrou", cliente: "Sabor & Cia", tempo: "há 2h" },
  { tipo: "recuperado", cliente: "Cantina Bella", tempo: "há 5h" },
  { tipo: "followup", cliente: "Restaurante XPTO", tempo: "ontem" },
  { tipo: "risco", cliente: "Padaria Trigo Dourado", tempo: "há 2 dias" },
];

type Insight = { texto: string };
const INSIGHTS_COLUMNS: Column<Insight>[] = [{ key: "texto", label: "Insight" }];
const INSIGHTS_PADRAO: Insight[] = [
  { texto: "Sua conversão aumentou 12%." },
  { texto: "Você possui 3 clientes sem contato há mais de 10 dias." },
  { texto: "Hoje é um bom dia para realizar follow-ups." },
];

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "carteira", label: "Minha Carteira", icon: Briefcase },
  { id: "followups", label: "Follow-ups", icon: PhoneCall },
  { id: "pipeline", label: "Pipeline", icon: Workflow },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "metas", label: "Metas", icon: Target },
  { id: "relatorios", label: "Relatórios", icon: LineChartIcon },
] as const;

const MOVIMENTACAO_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  entrou: { label: "Cliente entrou", icon: UserPlus, className: "bg-emerald-100 text-emerald-600" },
  recuperado: { label: "Cliente recuperado", icon: CheckCircle2, className: "bg-primary/15 text-primary" },
  followup: { label: "Follow-up realizado", icon: PhoneCall, className: "bg-accent text-accent-foreground" },
  risco: { label: "Cliente em risco", icon: AlertTriangle, className: "bg-red-100 text-red-600" },
};

function trend(delta: string): "up" | "down" {
  return delta.trim().startsWith("-") ? "down" : "up";
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------

export function Dashboard() {
  const [secao, setSecao] = useState<(typeof NAV_ITEMS)[number]["id"]>("dashboard");
  const [periodo, setPeriodo] = useState("mes");

  const [kpis, setKpis] = useLocalStorageState<Kpis>("bibly-kpis", KPIS_PADRAO);
  const [saude, setSaude] = useLocalStorageState<SaudeCarteira>("bibly-saude", SAUDE_PADRAO);
  const [evolucao, setEvolucao] = useLocalStorageState<EvolucaoPonto[]>("bibly-evolucao", EVOLUCAO_PADRAO);
  const [acoes, setAcoes] = useLocalStorageState<Acao[]>("bibly-acoes", ACOES_PADRAO);
  const [objetivos, setObjetivos] = useLocalStorageState<Objetivo[]>("bibly-objetivos", OBJETIVOS_PADRAO);
  const [movimentacoes, setMovimentacoes] = useLocalStorageState<Movimentacao[]>(
    "bibly-movimentacoes",
    MOVIMENTACOES_PADRAO,
  );
  const [insights, setInsights] = useLocalStorageState<Insight[]>("bibly-insights", INSIGHTS_PADRAO);

  const saudeData = useMemo(
    () => [
      { name: "Saudáveis", value: saude.saudaveis, color: "#34d399" },
      { name: "Atenção", value: saude.atencao, color: "#fbbf24" },
      { name: "Críticos", value: saude.criticos, color: "#f87171" },
    ],
    [saude],
  );

  const handleExport = () => {
    downloadCsv("bibly-resumo.csv", [
      ["Indicador", "Valor", "Variação"],
      ["Minha carteira (clientes)", String(kpis.totalClientes), kpis.deltaClientes],
      ["Pendências hoje", String(kpis.pendenciasHoje), kpis.deltaPendencias],
      ["Clientes em risco", String(kpis.clientesRisco), kpis.deltaRisco],
      ["Receita da carteira", String(kpis.receitaCarteira), kpis.deltaReceita],
      ["Meta do mês (%)", String(kpis.metaMesPercent), kpis.deltaMeta],
      ["Health Score", String(kpis.healthScore), kpis.deltaHealth],
    ]);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-background">
        <div className="flex">
          {/* Sidebar compacta — só ícones */}
          <aside className="hidden md:flex w-[72px] flex-col items-center gap-1 border-r border-sidebar-border bg-sidebar py-6 sticky top-0 h-screen">
            <img
              src="/bibly-mascot.png"
              alt="Bibly"
              className="mb-6 h-11 w-11 rounded-2xl object-cover shadow-[var(--shadow-soft)]"
            />
            {NAV_ITEMS.map((item) => {
              const active = secao === item.id;
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setSecao(item.id)}
                      aria-label={item.label}
                      className={cn(
                        "grid h-11 w-11 place-items-center rounded-2xl text-muted-foreground transition-colors",
                        active
                          ? "bg-secondary text-primary"
                          : "hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </aside>

          <main className="flex-1 min-w-0">
            {secao !== "dashboard" ? (
              <PlaceholderSection label={NAV_ITEMS.find((n) => n.id === secao)!.label} />
            ) : (
              <>
                {/* Header */}
                <header className="flex flex-wrap items-center justify-between gap-4 px-8 pb-6 pt-8">
                  <div>
                    <h1 className="text-[26px] font-semibold tracking-tight text-foreground">
                      Olá, Gabrielly 👋
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Aqui está um resumo da sua carteira hoje.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={periodo} onValueChange={setPeriodo}>
                      <SelectTrigger className="h-9 w-[160px] rounded-xl border-border bg-card text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hoje">Hoje</SelectItem>
                        <SelectItem value="semana">Últimos 7 dias</SelectItem>
                        <SelectItem value="mes">Este mês</SelectItem>
                        <SelectItem value="trimestre">Este trimestre</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      className="h-9 rounded-xl border-border bg-card text-sm"
                      onClick={handleExport}
                    >
                      <Download className="h-4 w-4" /> Exportar
                    </Button>
                  </div>
                </header>

                <div className="space-y-6 px-8 pb-10">
                  {/* KPIs */}
                  <section className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
                    <div className="absolute -top-2 right-0 xl:-top-9">
                      <ObjectEditorDialog title="indicadores" fields={KPIS_FIELDS} value={kpis} onSave={setKpis} />
                    </div>
                    <StatCard icon={Users} label="Minha carteira" value={`${kpis.totalClientes}`} unit="clientes" delta={kpis.deltaClientes} />
                    <StatCard icon={Bell} label="Pendências hoje" value={`${kpis.pendenciasHoje}`} unit="follow-ups" delta={kpis.deltaPendencias} />
                    <StatCard icon={AlertTriangle} label="Clientes em risco" value={`${kpis.clientesRisco}`} unit="clientes" delta={kpis.deltaRisco} invert />
                    <StatCard
                      icon={Sparkles}
                      label="Receita da carteira"
                      value={kpis.receitaCarteira.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                      delta={kpis.deltaReceita}
                    />
                    <StatCard icon={Target} label="Meta do mês" value={`${kpis.metaMesPercent}%`} delta={kpis.deltaMeta} />
                    <StatCard icon={Star} label="Health Score" value={`${kpis.healthScore}`} delta={kpis.deltaHealth} />
                  </section>

                  {/* Corpo: duas colunas */}
                  <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    <div className="space-y-4 lg:col-span-7">
                      <Panel
                        title="Saúde da carteira"
                        actions={
                          <ObjectEditorDialog title="saúde da carteira" fields={SAUDE_FIELDS} value={saude} onSave={setSaude} />
                        }
                      >
                        <div className="flex flex-col items-center gap-4 sm:flex-row">
                          <ResponsiveContainer width={180} height={180}>
                            <PieChart>
                              <Pie data={saudeData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3} strokeWidth={0}>
                                {saudeData.map((d, i) => (
                                  <Cell key={i} fill={d.color} />
                                ))}
                              </Pie>
                              <RTooltip content={<DonutTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                          <ul className="flex-1 space-y-2.5 text-sm">
                            {saudeData.map((d) => (
                              <li key={d.name} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                                  {d.name}
                                </span>
                                <span className="font-semibold text-foreground">{d.value}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Panel>

                      <Panel
                        title="Evolução da carteira"
                        subtitle="Clientes ativos ao longo do tempo"
                        actions={
                          <RowsEditorDialog
                            title="evolução da carteira"
                            columns={EVOLUCAO_COLUMNS}
                            rows={evolucao}
                            emptyRow={() => ({ mes: "Novo mês", valor: 0 })}
                            onSave={setEvolucao}
                          />
                        }
                      >
                        <ResponsiveContainer width="100%" height={220}>
                          <AreaChart data={evolucao} margin={{ left: -20, right: 8, top: 8 }}>
                            <defs>
                              <linearGradient id="evolucaoGrad" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#e87db0" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#e87db0" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="mes" stroke="#b7b0bf" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#b7b0bf" fontSize={12} tickLine={false} axisLine={false} width={30} />
                            <RTooltip content={<DonutTooltip />} />
                            <Area type="monotone" dataKey="valor" stroke="#e87db0" strokeWidth={2.5} fill="url(#evolucaoGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Panel>
                    </div>

                    <div className="space-y-4 lg:col-span-5">
                      <Panel
                        title="Próximas ações"
                        actions={
                          <RowsEditorDialog
                            title="próximas ações"
                            columns={ACOES_COLUMNS}
                            rows={acoes}
                            emptyRow={() => ({ horario: "00:00", descricao: "Nova ação" })}
                            onSave={setAcoes}
                          />
                        }
                      >
                        <ul className="space-y-1">
                          {acoes.map((a, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm transition-colors hover:bg-muted/60"
                            >
                              <span className="w-14 shrink-0 rounded-lg bg-secondary px-2 py-1 text-center text-xs font-medium text-secondary-foreground">
                                {a.horario}
                              </span>
                              <span className="text-foreground">{a.descricao}</span>
                            </li>
                          ))}
                        </ul>
                      </Panel>

                      <Panel
                        title="Objetivos da semana"
                        actions={
                          <RowsEditorDialog
                            title="objetivos da semana"
                            columns={OBJETIVOS_COLUMNS}
                            rows={objetivos}
                            emptyRow={() => ({ label: "Novo objetivo", atual: 0, meta: 1 })}
                            onSave={setObjetivos}
                          />
                        }
                      >
                        <div className="space-y-4">
                          {objetivos.map((o) => (
                            <div key={o.label} className="space-y-1.5">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-foreground">{o.label}</span>
                                <span className="text-muted-foreground">
                                  {o.atual}/{o.meta}
                                </span>
                              </div>
                              <Progress value={Math.min((o.atual / Math.max(o.meta, 1)) * 100, 100)} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </Panel>
                    </div>
                  </section>

                  {/* Rodapé: duas colunas */}
                  <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                      <Panel
                        title="Últimas movimentações"
                        actions={
                          <RowsEditorDialog
                            title="últimas movimentações"
                            description="Tipos aceitos: entrou, recuperado, followup, risco."
                            columns={MOVIMENTACOES_COLUMNS}
                            rows={movimentacoes}
                            emptyRow={() => ({ tipo: "entrou", cliente: "Novo cliente", tempo: "agora" })}
                            onSave={setMovimentacoes}
                          />
                        }
                      >
                        <ol className="relative space-y-5 pl-1">
                          {movimentacoes.map((m, i) => {
                            const meta = MOVIMENTACAO_META[m.tipo] ?? {
                              label: m.tipo,
                              icon: CheckCircle2,
                              className: "bg-muted text-muted-foreground",
                            };
                            return (
                              <li key={i} className="flex gap-3">
                                <div className="flex flex-col items-center">
                                  <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full", meta.className)}>
                                    <meta.icon className="h-4 w-4" />
                                  </span>
                                  {i < movimentacoes.length - 1 && <span className="mt-1 h-full w-px flex-1 bg-border" />}
                                </div>
                                <div className="pb-1">
                                  <div className="text-sm font-medium text-foreground">
                                    {meta.label} · {m.cliente}
                                  </div>
                                  <div className="text-xs text-muted-foreground">{m.tempo}</div>
                                </div>
                              </li>
                            );
                          })}
                        </ol>
                      </Panel>
                    </div>

                    <div className="lg:col-span-5">
                      <Panel
                        title="Insights rápidos"
                        actions={
                          <RowsEditorDialog
                            title="insights rápidos"
                            columns={INSIGHTS_COLUMNS}
                            rows={insights}
                            emptyRow={() => ({ texto: "Novo insight" })}
                            onSave={setInsights}
                          />
                        }
                      >
                        <div className="space-y-3">
                          {insights.map((ins, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2.5 rounded-xl border border-border bg-[var(--gradient-soft)] px-3 py-2.5 text-sm text-foreground"
                            >
                              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              {ins.texto}
                            </div>
                          ))}
                        </div>
                      </Panel>
                    </div>
                  </section>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

function PlaceholderSection({ label }: { label: string }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2 px-8 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary">
        <Sparkles className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{label}</h2>
      <p className="max-w-xs text-sm text-muted-foreground">Essa área ainda está em construção. Em breve por aqui.</p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  delta,
  invert = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit?: string;
  delta: string;
  invert?: boolean;
}) {
  const dir = trend(delta);
  const positive = invert ? dir === "down" : dir === "up";
  const TrendIcon = dir === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <div
      className="rounded-[20px] border border-border bg-card p-5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-2xl font-semibold tracking-tight text-foreground">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      <div className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-2 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
          positive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600",
        )}
      >
        <TrendIcon className="h-3 w-3" />
        {delta}
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

function DonutTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-[var(--shadow-soft)]">
      {label !== undefined && <div className="font-medium text-foreground">{label}</div>}
      {payload.map((p: any) => (
        <div key={p.dataKey ?? p.name} className="flex items-center gap-2 text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color ?? p.payload?.color ?? p.payload?.fill }} />
          <span className="text-foreground">{p.name ?? p.payload?.name}:</span>
          <span className="font-medium text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}
