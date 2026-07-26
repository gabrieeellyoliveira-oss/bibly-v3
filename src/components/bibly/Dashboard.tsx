import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Award,
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Download,
  LayoutDashboard,
  LineChart as LineChartIcon,
  MessageSquareText,
  PhoneCall,
  Settings,
  Sparkles,
  Star,
  Tag,
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
import { cn } from "@/lib/utils";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { type Column, ObjectEditorDialog, Panel, RowsEditorDialog } from "@/components/bibly/editors";
import { Playbook } from "@/components/bibly/Playbook";
import { Templates } from "@/components/bibly/Templates";
import { ContentPage } from "@/components/bibly/ContentPage";
import { Metas } from "@/components/bibly/Metas";

// ---------------------------------------------------------------------------
// Aurora — PSM Command Center. Tudo editável pela engrenagem em cada painel;
// persiste no navegador (localStorage).
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

type Periodo = "hoje" | "semana" | "mes" | "trimestre" | "semestre";

const KPIS_POR_PERIODO: Record<Periodo, Kpis> = {
  hoje: {
    totalClientes: 84,
    deltaClientes: "+1 hoje",
    pendenciasHoje: 6,
    deltaPendencias: "+2 vs. ontem",
    clientesRisco: 7,
    deltaRisco: "sem mudança",
    receitaCarteira: 2340,
    deltaReceita: "+5% vs. ontem",
    metaMesPercent: 73,
    deltaMeta: "+1pp",
    healthScore: 86,
    deltaHealth: "estável",
  },
  semana: {
    totalClientes: 84,
    deltaClientes: "+4 esta semana",
    pendenciasHoje: 16,
    deltaPendencias: "+3 vs. semana passada",
    clientesRisco: 7,
    deltaRisco: "-2 esta semana",
    receitaCarteira: 14200,
    deltaReceita: "+9% esta semana",
    metaMesPercent: 73,
    deltaMeta: "+3pp",
    healthScore: 86,
    deltaHealth: "+1 pt",
  },
  mes: {
    totalClientes: 84,
    deltaClientes: "+4 este mês",
    pendenciasHoje: 41,
    deltaPendencias: "+9 vs. mês passado",
    clientesRisco: 7,
    deltaRisco: "-2 este mês",
    receitaCarteira: 63510,
    deltaReceita: "+9% este mês",
    metaMesPercent: 73,
    deltaMeta: "+12pp",
    healthScore: 86,
    deltaHealth: "+3 pts",
  },
  trimestre: {
    totalClientes: 84,
    deltaClientes: "+11 no trimestre",
    pendenciasHoje: 118,
    deltaPendencias: "+22 vs. trimestre anterior",
    clientesRisco: 9,
    deltaRisco: "-4 no trimestre",
    receitaCarteira: 178300,
    deltaReceita: "+22% no trimestre",
    metaMesPercent: 81,
    deltaMeta: "+18pp",
    healthScore: 84,
    deltaHealth: "+2 pts",
  },
  semestre: {
    totalClientes: 84,
    deltaClientes: "+19 no semestre",
    pendenciasHoje: 246,
    deltaPendencias: "+37 vs. semestre anterior",
    clientesRisco: 11,
    deltaRisco: "-6 no semestre",
    receitaCarteira: 342100,
    deltaReceita: "+34% no semestre",
    metaMesPercent: 88,
    deltaMeta: "+25pp",
    healthScore: 87,
    deltaHealth: "+5 pts",
  },
};

const KPIS_FIELDS: Column<Kpis>[] = [
  { key: "totalClientes", label: "Minha carteira — clientes", type: "number" },
  { key: "deltaClientes", label: "Minha carteira — variação" },
  { key: "pendenciasHoje", label: "Pendências", type: "number" },
  { key: "deltaPendencias", label: "Pendências — variação" },
  { key: "clientesRisco", label: "Clientes em risco", type: "number" },
  { key: "deltaRisco", label: "Risco — variação" },
  { key: "receitaCarteira", label: "Receita da carteira (R$)", type: "number" },
  { key: "deltaReceita", label: "Receita — variação" },
  { key: "metaMesPercent", label: "Meta do período (%)", type: "number" },
  { key: "deltaMeta", label: "Meta — variação" },
  { key: "healthScore", label: "Health Score", type: "number" },
  { key: "deltaHealth", label: "Health Score — variação" },
];

type SaudeCarteira = { saudaveis: number; atencao: number; criticos: number };

const SAUDE_POR_PERIODO: Record<Periodo, SaudeCarteira> = {
  hoje: { saudaveis: 59, atencao: 18, criticos: 7 },
  semana: { saudaveis: 58, atencao: 19, criticos: 7 },
  mes: { saudaveis: 58, atencao: 19, criticos: 7 },
  trimestre: { saudaveis: 54, atencao: 21, criticos: 9 },
  semestre: { saudaveis: 50, atencao: 23, criticos: 11 },
};

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

const PLANOS_PRECOS_BODY = `Valores dos planos e módulos para a contratação da Cardápio Web, bem como os descontos disponíveis para negociações nas vendas.

| Fidelidade | Plano Mesas — Valor total | Plano Mesas — Valor mensal | Plano Delivery — Valor total | Plano Delivery — Valor mensal | Plano Premium — Valor total | Plano Premium — Valor mensal | Módulo Marketplace — Valor total | Módulo Marketplace — Valor mensal | Módulo Estoque Avançado — Valor total | Módulo Estoque Avançado — Valor mensal | Módulo Cupom Fiscal — Valor total | Módulo Cupom Fiscal — Valor mensal | Módulo Entregadores — Valor total | Módulo Entregadores — Valor mensal | Entregadores — até 500 pedidos (por pedido) | Entregadores — 501 a 1500 pedidos (por pedido) | Entregadores — acima de 1500 pedidos (por pedido) | Módulo Financeiro — Valor total | Módulo Financeiro — Valor mensal | Módulo Totem — Valor total | Módulo Totem — Valor mensal |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Anual | R$ 1.679,88 | R$ 139,99 | R$ 2.159,88 | R$ 179,99 | R$ 2.879,88 | R$ 239,99 | R$ 359,88 | R$ 29,99 | R$ 359,88 | R$ 29,99 | R$ 839,88 | R$ 69,99 | R$ 659,88 | R$ 54,99 | 0% | 8% | 6% | R$ 839,88 | R$ 69,99 | R$ 1.199,88 | R$ 99,99 |
| Semestral | R$ 899,94 | R$ 149,99 | R$ 1.139,94 | R$ 189,99 | R$ 1.499,94 | R$ 249,99 | R$ 179,94 | R$ 29,99 | R$ 179,94 | R$ 29,99 | R$ 419,94 | R$ 69,99 | R$ 329,94 | R$ 54,99 | 0% | 8% | 6% | R$ 419,94 | R$ 69,99 | R$ 599,94 | R$ 99,99 |
| Trimestral | R$ 479,97 | R$ 159,99 | R$ 599,97 | R$ 199,99 | R$ 779,97 | R$ 259,99 | R$ 89,97 | R$ 29,99 | R$ 89,97 | R$ 29,99 | R$ 209,97 | R$ 69,99 | R$ 164,97 | R$ 54,99 | 0% | 8% | 6% | R$ 209,97 | R$ 69,99 | R$ 299,97 | R$ 99,99 |
| Mensal | R$ 169,99 | R$ 169,99 | R$ 209,99 | R$ 209,99 | R$ 269,99 | R$ 269,99 | R$ 29,99 | R$ 29,99 | R$ 29,99 | R$ 29,99 | R$ 69,99 | R$ 69,99 | R$ 54,99 | R$ 54,99 | 0% | 8% | 6% | R$ 69,99 | R$ 69,99 | R$ 99,99 | R$ 99,99 |

**Nota:** o módulo Entregadores combina uma mensalidade fixa com uma taxa por pedido, escalonada por volume (0% até 500 pedidos, 8% de 501 a 1500, 6% acima de 1500).`;

const PROGRESSAO_CARREIRA_BODY = `A progressão de carreira por nível trata da evolução do agente de parcerias dentro do seu mesmo nível de senioridade, seja como Channel Hunter ou Channel Account Manager. O principal critério é a performance em relação às metas estipuladas para o canal, com benefício de aumento da taxa de comissionamento e maior protagonismo na gestão e desenvolvimento das parcerias.

| Nível | Faixa | Base salarial | Comissão Meta 1 | Comissão Meta 2 | Comissão Meta 3 | Critérios de elegibilidade / desclassificação |
|---|---|---|---|---|---|---|
| JR 1 | Faixa 1 – Base | R$ 1.809,51 | 20% (OTE R$ 2.171,41) | 25% (OTE R$ 2.261,89) | 30% (OTE R$ 2.352,36) | Ramp-up concluído em caso de novato; Meta 3 nos últimos 2 meses |
| JR 1 | Faixa 2 – Estrela |  | 30% (OTE R$ 2.352,36) | 35% (OTE R$ 2.442,84) | 40% (OTE R$ 2.533,31) | Meta 3 (1 mês, no mês vigente) / se não bater Meta 3 na faixa 2, desce para o nível anterior |
| JR 2 | Faixa 1 – Base | R$ 1.988,48 | 20% (OTE R$ 2.386,18) | 25% (OTE R$ 2.485,60) | 30% (OTE R$ 2.585,02) | Ramp-up concluído em caso de novato; Meta 3 nos últimos 2 meses |
| JR 2 | Faixa 2 – Estrela |  | 30% (OTE R$ 2.585,02) | 35% (OTE R$ 2.684,45) | 40% (OTE R$ 2.783,87) | Meta 3 (1 mês, no mês vigente) / se não bater Meta 3 na faixa 2, desce para o nível anterior |
| JR 3 | Faixa 1 – Base | R$ 2.185,14 | 20% (OTE R$ 2.622,17) | 25% (OTE R$ 2.731,43) | 30% (OTE R$ 2.840,68) | Ramp-up concluído em caso de novato; Meta 3 nos últimos 2 meses |
| JR 3 | Faixa 2 – Estrela |  | 30% (OTE R$ 2.840,68) | 35% (OTE R$ 2.949,94) | 40% (OTE R$ 3.059,20) | Meta 3 (1 mês, no mês vigente) / se não bater Meta 3 na faixa 2, desce para o nível anterior |
| PL 1 | Faixa 1 – Base | R$ 2.401,25 | 25% (OTE R$ 3.001,56) | 30% (OTE R$ 3.121,62) | 45% (OTE R$ 3.481,81) | Ramp-up concluído em caso de novato; Meta 3 nos últimos 2 meses |
| PL 1 | Faixa 2 – Estrela |  | 30% (OTE R$ 3.121,62) | 35% (OTE R$ 3.241,69) | 50% (OTE R$ 3.601,88) | Meta 3 (1 mês, no mês vigente) / se não bater Meta 3 na faixa 2, desce para o nível anterior |
| PL 2 | Faixa 1 – Base | R$ 2.617,36 | 25% (OTE R$ 3.271,70) | 30% (OTE R$ 3.402,57) | 45% (OTE R$ 3.795,17) | Ramp-up concluído em caso de novato; Meta 3 nos últimos 2 meses |
| PL 2 | Faixa 2 – Estrela |  | 30% (OTE R$ 3.402,57) | 35% (OTE R$ 3.533,44) | 50% (OTE R$ 3.926,04) | Meta 3 (1 mês, no mês vigente) / se não bater Meta 3 na faixa 2, desce para o nível anterior |
| PL 3 | Faixa 1 – Base | R$ 2.852,93 | 25% (OTE R$ 3.566,16) | 30% (OTE R$ 3.708,81) | 45% (OTE R$ 4.136,75) | Ramp-up concluído em caso de novato; Meta 3 nos últimos 2 meses |
| PL 3 | Faixa 2 – Estrela |  | 30% (OTE R$ 3.708,81) | 35% (OTE R$ 3.851,46) | 50% (OTE R$ 4.279,40) | Meta 3 (1 mês, no mês vigente) / se não bater Meta 3 na faixa 2, desce para o nível anterior |
| SR 1 | Faixa 1 – Base | R$ 3.109,69 | 25% (OTE R$ 3.887,11) | 30% (OTE R$ 4.042,60) | 45% (OTE R$ 4.509,05) | Ramp-up concluído em caso de novato; Meta 3 nos últimos 2 meses |
| SR 1 | Faixa 2 – Estrela |  | 30% (OTE R$ 4.042,60) | 35% (OTE R$ 4.198,08) | 50% (OTE R$ 4.664,53) | Meta 3 (1 mês, no mês vigente) / se não bater Meta 3 na faixa 2, desce para o nível anterior |
| SR 2 | Faixa 1 – Base | R$ 3.389,56 | 25% (OTE R$ 4.236,95) | 30% (OTE R$ 4.406,43) | 45% (OTE R$ 4.914,86) | Ramp-up concluído em caso de novato; Meta 3 nos últimos 2 meses |
| SR 2 | Faixa 2 – Estrela |  | 30% (OTE R$ 4.406,43) | 35% (OTE R$ 4.575,91) | 50% (OTE R$ 5.084,34) | Meta 3 (1 mês, no mês vigente) / se não bater Meta 3 na faixa 2, desce para o nível anterior |
| SR 3 | Faixa 1 – Base | R$ 3.694,62 | 25% (OTE R$ 4.618,27) | 30% (OTE R$ 4.803,01) | 45% (OTE R$ 5.357,20) | Ramp-up concluído em caso de novato; Meta 3 nos últimos 2 meses |
| SR 3 | Faixa 2 – Estrela |  | 30% (OTE R$ 4.803,01) | 35% (OTE R$ 4.987,74) | 50% (OTE R$ 5.541,93) | Meta 3 (1 mês, no mês vigente) / se não bater Meta 3 na faixa 2, desce para o nível anterior |

**Nota:** as colunas originais "Meta de Clientes" e "Custo por Cliente (OTE)" estavam quebradas (#REF!) na planilha de origem para a maioria dos níveis e foram omitidas até serem corrigidas pela liderança.`;

const NAV_ITEMS = [
  { id: "dashboard", label: "Visão Geral", icon: LayoutDashboard },
  { id: "playbook", label: "Playbook", icon: BookOpen },
  { id: "templates", label: "Follow-ups", icon: MessageSquareText },
  { id: "carteira", label: "Carteira", icon: Briefcase },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "pipeline", label: "Pipeline", icon: Workflow },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "planos-precos", label: "Planos e Preços", icon: Tag },
  { id: "progressao-carreira", label: "Progressão de Carreira", icon: Award },
  { id: "metas", label: "Metas", icon: Target },
  { id: "relatorios", label: "Relatórios", icon: LineChartIcon },
  { id: "insights", label: "Insights", icon: Sparkles },
  { id: "configuracoes", label: "Configurações", icon: Settings },
] as const;

const MOVIMENTACAO_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  entrou: { label: "Cliente entrou", icon: UserPlus, className: "bg-emerald-100 text-emerald-600" },
  recuperado: { label: "Cliente recuperado", icon: CheckCircle2, className: "bg-secondary text-primary" },
  followup: { label: "Follow-up realizado", icon: PhoneCall, className: "bg-accent text-accent-foreground" },
  risco: { label: "Cliente em risco", icon: AlertTriangle, className: "bg-red-100 text-red-600" },
};

const PERIODO_OPTIONS: { value: Periodo; label: string }[] = [
  { value: "hoje", label: "Hoje" },
  { value: "semana", label: "7 dias" },
  { value: "mes", label: "Este mês" },
  { value: "trimestre", label: "Trimestre" },
  { value: "semestre", label: "Semestre" },
];

const KPI_SPARKLINES: Record<string, number[]> = {
  clientes: [76, 78, 79, 80, 81, 83, 84],
  pendencias: [10, 14, 9, 12, 15, 11, 16],
  risco: [10, 9, 9, 8, 8, 7, 7],
  receita: [48, 52, 55, 58, 60, 61, 63.5],
  meta: [55, 58, 62, 65, 68, 71, 73],
  health: [80, 81, 82, 83, 84, 85, 86],
};

const KPI_TINTS = {
  purple: { bg: "#f0ebff", fg: "#6d4cff" },
  magenta: { bg: "#fdeaf3", fg: "#d9468f" },
  red: { bg: "#fdecea", fg: "#e5484d" },
  green: { bg: "#e9f9ef", fg: "#16a34a" },
  gold: { bg: "#fef6e7", fg: "#c7930a" },
} as const;

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
  const [periodo, setPeriodo] = useState<Periodo>("mes");

  const [kpisPorPeriodo, setKpisPorPeriodo] = useLocalStorageState<Record<Periodo, Kpis>>(
    "bibly-kpis-por-periodo",
    KPIS_POR_PERIODO,
  );
  const [saudePorPeriodo, setSaudePorPeriodo] = useLocalStorageState<Record<Periodo, SaudeCarteira>>(
    "bibly-saude-por-periodo",
    SAUDE_POR_PERIODO,
  );
  const kpis = kpisPorPeriodo[periodo];
  const saude = saudePorPeriodo[periodo];
  const setKpis = (next: Kpis) => setKpisPorPeriodo((prev) => ({ ...prev, [periodo]: next }));
  const setSaude = (next: SaudeCarteira) => setSaudePorPeriodo((prev) => ({ ...prev, [periodo]: next }));

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
  const saudeTotal = saude.saudaveis + saude.atencao + saude.criticos;

  const progressoSemanal = useMemo(() => {
    if (objetivos.length === 0) return 0;
    const media =
      objetivos.reduce((acc, o) => acc + Math.min(o.atual / Math.max(o.meta, 1), 1), 0) / objetivos.length;
    return Math.round(media * 100);
  }, [objetivos]);

  const periodoLabel = PERIODO_OPTIONS.find((o) => o.value === periodo)?.label ?? periodo;

  const handleExport = () => {
    downloadCsv("aurora-resumo.csv", [
      ["Indicador", "Valor", "Variação"],
      ["Minha carteira (clientes)", String(kpis.totalClientes), kpis.deltaClientes],
      ["Pendências", String(kpis.pendenciasHoje), kpis.deltaPendencias],
      ["Clientes em risco", String(kpis.clientesRisco), kpis.deltaRisco],
      ["Receita da carteira", String(kpis.receitaCarteira), kpis.deltaReceita],
      ["Meta do período (%)", String(kpis.metaMesPercent), kpis.deltaMeta],
      ["Health Score", String(kpis.healthScore), kpis.deltaHealth],
    ]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AuroraSidebar secao={secao} onNavigate={setSecao} />

        <main className="min-w-0 flex-1">
          {secao === "playbook" ? (
            <Playbook />
          ) : secao === "templates" ? (
            <Templates />
          ) : secao === "metas" ? (
            <Metas />
          ) : secao === "planos-precos" ? (
            <ContentPage
              storageKey="bibly-content-planos-precos"
              title="Planos e Preços"
              summary="Valores oficiais dos planos e módulos, por fidelidade."
              icon={Tag}
              defaultBody={PLANOS_PRECOS_BODY}
            />
          ) : secao === "progressao-carreira" ? (
            <ContentPage
              storageKey="bibly-content-progressao-carreira"
              title="Progressão de Carreira"
              summary="Evolução salarial e de comissão por nível de senioridade."
              icon={Award}
              defaultBody={PROGRESSAO_CARREIRA_BODY}
            />
          ) : secao !== "dashboard" ? (
            <PlaceholderSection label={NAV_ITEMS.find((n) => n.id === secao)!.label} />
          ) : (
            <>
              {/* Header */}
              <header className="flex flex-wrap items-center justify-between gap-4 px-8 pb-6 pt-8">
                <div>
                  <h1 className="text-[26px] font-bold tracking-tight text-foreground">Olá, Gabrielly! 👋</h1>
                  <p className="mt-1 text-sm text-muted-foreground">Aqui está o resumo da sua carteira.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1 rounded-full border border-border bg-card p-1">
                    {PERIODO_OPTIONS.map((opt) => {
                      const active = periodo === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setPeriodo(opt.value)}
                          className={cn(
                            "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                            active ? "text-white" : "text-muted-foreground hover:text-foreground",
                          )}
                          style={active ? { background: "var(--sidebar)" } : undefined}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    className="h-9 rounded-xl border-border bg-card text-sm"
                    onClick={handleExport}
                  >
                    <Download className="h-4 w-4" /> Exportar
                  </Button>
                  <button
                    type="button"
                    aria-label="Notificações"
                    className="relative grid h-9 w-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Bell className="h-4 w-4" />
                    <span
                      className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundImage: "var(--gradient-primary)" }}
                    >
                      3
                    </span>
                  </button>
                </div>
              </header>

              <div className="space-y-4 px-8 pb-10">
                {/* KPIs */}
                <section className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
                  <div className="absolute -top-2 right-0 xl:-top-9">
                    <ObjectEditorDialog title={`indicadores — ${periodoLabel}`} fields={KPIS_FIELDS} value={kpis} onSave={setKpis} />
                  </div>
                  <StatCard
                    icon={Users}
                    tint="purple"
                    label="Clientes"
                    value={`${kpis.totalClientes}`}
                    delta={kpis.deltaClientes}
                    spark={KPI_SPARKLINES.clientes}
                  />
                  <StatCard
                    icon={PhoneCall}
                    tint="magenta"
                    label="Follow-ups"
                    value={`${kpis.pendenciasHoje}`}
                    delta={kpis.deltaPendencias}
                    spark={KPI_SPARKLINES.pendencias}
                  />
                  <StatCard
                    icon={AlertTriangle}
                    tint="red"
                    label="Clientes em risco"
                    value={`${kpis.clientesRisco}`}
                    delta={kpis.deltaRisco}
                    invert
                    spark={KPI_SPARKLINES.risco}
                  />
                  <StatCard
                    icon={Sparkles}
                    tint="green"
                    label="Receita da carteira"
                    value={kpis.receitaCarteira.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                    delta={kpis.deltaReceita}
                    spark={KPI_SPARKLINES.receita}
                  />
                  <StatCard
                    icon={Target}
                    tint="purple"
                    label="Meta do período"
                    value={`${kpis.metaMesPercent}%`}
                    delta={kpis.deltaMeta}
                    spark={KPI_SPARKLINES.meta}
                  />
                  <StatCard
                    icon={Star}
                    tint="gold"
                    label="Health Score"
                    value={`${kpis.healthScore}`}
                    delta={kpis.deltaHealth}
                    spark={KPI_SPARKLINES.health}
                  />
                </section>

                {/* Saúde | Próximas ações | Banner institucional */}
                <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <Panel
                    title="Saúde da carteira"
                    subtitle={periodoLabel}
                    actions={
                      <ObjectEditorDialog title={`saúde da carteira — ${periodoLabel}`} fields={SAUDE_FIELDS} value={saude} onSave={setSaude} />
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0" style={{ width: 148, height: 148 }}>
                        <ResponsiveContainer width={148} height={148}>
                          <PieChart>
                            <Pie data={saudeData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={70} paddingAngle={3} strokeWidth={0}>
                              {saudeData.map((d, i) => (
                                <Cell key={i} fill={d.color} />
                              ))}
                            </Pie>
                            <RTooltip content={<AuroraTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-xl font-bold text-foreground">{saudeTotal}</div>
                          <div className="text-[10px] text-muted-foreground">Clientes</div>
                        </div>
                      </div>
                      <ul className="flex-1 space-y-2 text-sm">
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
                        <li key={i} className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm transition-colors hover:bg-muted/60">
                          <span className="w-14 shrink-0 rounded-lg bg-secondary px-2 py-1 text-center text-xs font-medium text-secondary-foreground">
                            {a.horario}
                          </span>
                          <span className="text-foreground">{a.descricao}</span>
                        </li>
                      ))}
                    </ul>
                  </Panel>

                  <SquadOncaBanner />
                </section>

                {/* Evolução | Objetivos da semana */}
                <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                  <div className="lg:col-span-7">
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
                              <stop offset="0%" stopColor="#6d4cff" stopOpacity={0.28} />
                              <stop offset="100%" stopColor="#6d4cff" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="mes" stroke="#9aa0b4" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#9aa0b4" fontSize={12} tickLine={false} axisLine={false} width={30} />
                          <RTooltip content={<AuroraTooltip />} />
                          <Area type="monotone" dataKey="valor" stroke="#6d4cff" strokeWidth={2.5} fill="url(#evolucaoGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Panel>
                  </div>

                  <div className="lg:col-span-5">
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
                      <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-3.5">
                          {objetivos.map((o) => (
                            <div key={o.label} className="space-y-1.5">
                              <div className="flex items-center justify-between text-[13px]">
                                <span className="font-medium text-foreground">{o.label}</span>
                                <span className="text-muted-foreground">
                                  {o.atual}/{o.meta}
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${Math.min((o.atual / Math.max(o.meta, 1)) * 100, 100)}%`,
                                    backgroundImage: "var(--gradient-primary)",
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div
                          className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full"
                          style={{ background: `conic-gradient(#6d4cff ${progressoSemanal * 3.6}deg, var(--muted) 0deg)` }}
                        >
                          <div className="grid h-[72px] w-[72px] place-items-center rounded-full bg-card text-center">
                            <div>
                              <div className="text-base font-bold text-foreground">{progressoSemanal}%</div>
                              <div className="text-[9px] leading-tight text-muted-foreground">
                                Progresso
                                <br />
                                geral
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Panel>
                  </div>
                </section>

                {/* Movimentações | Insights */}
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
                      <div className="space-y-2.5">
                        {insights.map((ins, i) => (
                          <div key={i} className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground">
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
  );
}

function StarMark({ size = 22 }: { size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-lg text-white"
      style={{ width: size, height: size, backgroundImage: "var(--gradient-primary)" }}
    >
      <Sparkles style={{ width: size * 0.6, height: size * 0.6 }} />
    </div>
  );
}

function AuroraSidebar({
  secao,
  onNavigate,
}: {
  secao: (typeof NAV_ITEMS)[number]["id"];
  onNavigate: (id: (typeof NAV_ITEMS)[number]["id"]) => void;
}) {
  return (
    <aside className="aurora-sidebar sticky top-0 h-screen w-[252px] shrink-0 flex-col bg-sidebar">
      <div className="flex items-center gap-2.5 px-5 pb-6 pt-6">
        <StarMark size={28} />
        <div>
          <div className="text-[15px] font-extrabold tracking-wide text-white">AURORA</div>
          <div className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: "var(--sidebar-muted)" }}>
            PSM Command Center
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {NAV_ITEMS.map((item) => {
          const active = secao === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                active ? "font-semibold text-white" : "hover:bg-white/5 hover:text-white",
              )}
              style={{
                background: active ? "var(--sidebar-accent)" : undefined,
                color: active ? "#ffffff" : "var(--sidebar-muted)",
              }}
            >
              <item.icon className="h-[17px] w-[17px] shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-5 pb-5 pt-4">
        <div
          className="flex flex-col items-center gap-2 rounded-2xl border px-4 py-4 text-center"
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          <div className="h-14 w-14 overflow-hidden rounded-2xl">
            <img
              src="/squad-onca.png"
              alt="Squad Onça"
              className="h-full w-full object-cover"
              style={{ objectPosition: "72% 42%" }}
            />
          </div>
          <div>
            <div className="text-xs font-bold" style={{ color: "#ff6fb0" }}>
              SQUAD ONÇA
            </div>
            <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-widest" style={{ color: "var(--sidebar-muted)" }}>
              Foco • Garra • Resultado
            </div>
          </div>
        </div>

        <button
          type="button"
          className="mt-4 flex w-full items-center gap-2.5 border-t pt-4 text-left"
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          <img src="/bibly-mascot.png" alt="Gabrielly Oliveira" className="h-9 w-9 shrink-0 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-white">Gabrielly Oliveira</div>
            <div className="truncate text-[11px]" style={{ color: "var(--sidebar-muted)" }}>
              PSM Representantes
            </div>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0" style={{ color: "var(--sidebar-muted)" }} />
        </button>
      </div>
    </aside>
  );
}

function SquadOncaBanner() {
  return (
    <div className="relative min-h-[210px] overflow-hidden rounded-[20px]" style={{ background: "#0d0b14" }}>
      <img
        src="/squad-onca.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-90"
        style={{ objectPosition: "68% 45%" }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(100deg, rgba(10,8,20,0.94) 0%, rgba(10,8,20,0.6) 55%, rgba(10,8,20,0.1) 100%)" }}
      />
      <div className="relative z-10 flex h-full min-h-[210px] flex-col justify-between p-5">
        <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#ff6fb0" }}>
          Squad Onça
        </div>
        <div className="text-lg font-bold leading-snug text-white">
          Precisão.
          <br />
          Estratégia.
          <br />
          <span style={{ color: "#ff6fb0" }}>Excelência.</span>
          <br />
          <span style={{ color: "#ff6fb0" }}>Resultado.</span>
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-white/50">Foco • Garra • Resultado</div>
      </div>
    </div>
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

function Sparkline({ data, color = "#6d4cff" }: { data: number[]; color?: string }) {
  const w = 100;
  const h = 28;
  const pad = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * (w - pad * 2) + pad;
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");
  const areaPoints = `${pad},${h} ${points} ${w - pad},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-full" preserveAspectRatio="none">
      <polyline points={areaPoints} fill={color} opacity={0.08} stroke="none" />
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({
  icon: Icon,
  tint,
  label,
  value,
  delta,
  invert = false,
  spark,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tint: keyof typeof KPI_TINTS;
  label: string;
  value: string;
  delta: string;
  invert?: boolean;
  spark: number[];
}) {
  const isDown = delta.trim().startsWith("-");
  const positive = invert ? isDown : !isDown;
  const { bg, fg } = KPI_TINTS[tint];

  return (
    <div className="rounded-[18px] border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ backgroundColor: bg, color: fg }}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight text-foreground">{value}</div>
      <div
        className={cn(
          "mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-semibold",
          positive ? "text-[var(--badge-positive-fg)]" : "text-[var(--badge-negative-fg)]",
        )}
        style={{ backgroundColor: positive ? "var(--badge-positive-bg)" : "var(--badge-negative-bg)" }}
      >
        {isDown ? "↓" : "↑"} {delta}
      </div>
      <div className="mt-2">
        <Sparkline data={spark} color={fg === KPI_TINTS.gold.fg ? "#c7930a" : "#6d4cff"} />
      </div>
    </div>
  );
}

function AuroraTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs" style={{ boxShadow: "var(--shadow-soft)" }}>
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
