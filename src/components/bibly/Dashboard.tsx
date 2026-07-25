import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronsLeft,
  ChevronsRight,
  Download,
  LineChart as LineChartIcon,
  MessageSquareText,
  PhoneCall,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { type Column, ObjectEditorDialog, RowsEditorDialog } from "@/components/bibly/editors";
import { Playbook } from "@/components/bibly/Playbook";
import { Templates } from "@/components/bibly/Templates";
import { ContentPage } from "@/components/bibly/ContentPage";

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

type MetaItem = { metrica: string; valor: string; contexto: string };
const METAS_COLUMNS: Column<MetaItem>[] = [
  { key: "metrica", label: "Métrica" },
  { key: "valor", label: "Valor atual" },
  { key: "contexto", label: "Contexto / meta" },
];

const METAS_ATIVACAO_PADRAO: MetaItem[] = [
  { metrica: "Tempo médio de onboarding", valor: "9 dias", contexto: "meta: até 10 dias" },
  { metrica: "% do canal treinado", valor: "78%", contexto: "meta: 90%" },
  { metrica: "Taxa de acesso ao portal", valor: "64%", contexto: "dos representantes ativos" },
  { metrica: "Consumo de materiais de capacitação", valor: "52%", contexto: "dos módulos concluídos" },
  { metrica: "Ações de co-marketing realizadas", valor: "3", contexto: "no período" },
];

const METAS_COMERCIAL_PADRAO: MetaItem[] = [
  { metrica: "Volume de leads indicados", valor: "27", contexto: "no período" },
  { metrica: "Taxa de conversão por etapa", valor: "18%", contexto: "lead → cliente" },
  { metrica: "Valor total de vendas", valor: "R$ 42.300", contexto: "no período" },
  { metrica: "Ticket médio das oportunidades", valor: "R$ 1.567", contexto: "por venda fechada" },
  { metrica: "Ciclo de vendas no canal", valor: "14 dias", contexto: "média do funil" },
];

const METAS_FINANCEIRO_PADRAO: MetaItem[] = [
  { metrica: "Receita recorrente gerada", valor: "R$ 63.510", contexto: "MRR da carteira" },
  { metrica: "Comissões pagas", valor: "R$ 8.240", contexto: "no período" },
  { metrica: "Margem gerada por canal", valor: "34%", contexto: "sobre a receita" },
  { metrica: "Taxa de churn dos clientes do parceiro", valor: "3,2%", contexto: "mensal" },
  { metrica: "CLV por canal", valor: "R$ 4.980", contexto: "médio por cliente" },
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
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "playbook", label: "Playbook", icon: BookOpen },
  { id: "templates", label: "Templates", icon: MessageSquareText },
  { id: "planos-precos", label: "Planos e Preços", icon: Tag },
  { id: "progressao-carreira", label: "Progressão de Carreira", icon: Award },
  { id: "carteira", label: "Minha Carteira", icon: Briefcase },
  { id: "pipeline", label: "Pipeline", icon: Workflow },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "relatorios", label: "Relatórios", icon: LineChartIcon },
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
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [menuAberto, setMenuAberto] = useLocalStorageState("bibly-menu-aberto", false);

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
  const [metasAtivacao, setMetasAtivacao] = useLocalStorageState<MetaItem[]>(
    "bibly-metas-ativacao",
    METAS_ATIVACAO_PADRAO,
  );
  const [metasComercial, setMetasComercial] = useLocalStorageState<MetaItem[]>(
    "bibly-metas-comercial",
    METAS_COMERCIAL_PADRAO,
  );
  const [metasFinanceiro, setMetasFinanceiro] = useLocalStorageState<MetaItem[]>(
    "bibly-metas-financeiro",
    METAS_FINANCEIRO_PADRAO,
  );
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

  const periodoLabel = PERIODO_OPTIONS.find((o) => o.value === periodo)?.label ?? periodo;

  const handleExport = () => {
    downloadCsv("bibly-resumo.csv", [
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
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-background">
        <div className="flex">
          {/* Sidebar retrátil — recolhida mostra só ícones, expandida mostra ícone + label */}
          <aside
            className={cn(
              "bibly-sidebar sticky top-0 h-screen shrink-0 flex-col gap-1 border-r border-sidebar-border bg-sidebar py-6 transition-[width] duration-200",
              menuAberto ? "w-[220px] items-stretch px-3" : "w-[72px] items-center",
            )}
          >
            <div
              className={cn(
                "mb-6 flex items-center gap-2",
                menuAberto ? "px-1" : "flex-col",
              )}
            >
              <img
                src="/bibly-mascot.png"
                alt="Bibly"
                className="h-11 w-11 shrink-0 rounded-2xl object-cover shadow-[var(--shadow-soft)]"
              />
              {menuAberto && <span className="text-sm font-semibold text-foreground">Bibly</span>}
            </div>

            {NAV_ITEMS.map((item) => {
              const active = secao === item.id;
              const button = (
                <button
                  type="button"
                  onClick={() => setSecao(item.id)}
                  aria-label={item.label}
                  className={cn(
                    "grid place-items-center rounded-2xl text-muted-foreground transition-colors",
                    menuAberto
                      ? "h-11 w-full grid-cols-[auto_1fr] grid-flow-col justify-start gap-3 px-3"
                      : "h-11 w-11",
                    active
                      ? "bg-secondary text-primary"
                      : "hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {menuAberto && <span className="justify-self-start text-sm font-medium">{item.label}</span>}
                </button>
              );

              if (menuAberto) {
                return <div key={item.id}>{button}</div>;
              }

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            })}

            <div className="mt-auto pt-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setMenuAberto((v) => !v)}
                    aria-label={menuAberto ? "Recolher menu" : "Expandir menu"}
                    className={cn(
                      "grid place-items-center rounded-2xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                      menuAberto ? "h-11 w-full" : "h-11 w-11",
                    )}
                  >
                    {menuAberto ? (
                      <ChevronsLeft className="h-[18px] w-[18px]" />
                    ) : (
                      <ChevronsRight className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{menuAberto ? "Recolher menu" : "Expandir menu"}</TooltipContent>
              </Tooltip>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {secao === "playbook" ? (
              <Playbook />
            ) : secao === "templates" ? (
              <Templates />
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
                    <h1 className="text-[26px] font-semibold tracking-tight text-foreground">
                      Olá, Gabrielly 👋
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Aqui está um resumo da sua carteira hoje.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex gap-1.5 rounded-full border border-border bg-card p-1"
                      style={{ boxShadow: "0 1px 2px rgba(43,37,48,0.04)" }}
                    >
                      {PERIODO_OPTIONS.map((opt) => {
                        const active = periodo === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setPeriodo(opt.value)}
                            className={cn(
                              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                              active ? "text-white" : "text-muted-foreground hover:text-foreground",
                            )}
                            style={active ? { backgroundImage: "var(--gradient-primary)" } : undefined}
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
                  </div>
                </header>

                <div className="space-y-6 px-8 pb-10">
                  {/* KPIs */}
                  <section className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
                    <div className="absolute -top-2 right-0 xl:-top-9">
                      <ObjectEditorDialog title={`indicadores — ${periodoLabel}`} fields={KPIS_FIELDS} value={kpis} onSave={setKpis} />
                    </div>
                    <StatCard icon={Users} label="Minha carteira" value={`${kpis.totalClientes}`} unit="clientes" delta={kpis.deltaClientes} />
                    <StatCard icon={Bell} label="Pendências" value={`${kpis.pendenciasHoje}`} unit="follow-ups" delta={kpis.deltaPendencias} />
                    <StatCard icon={AlertTriangle} label="Clientes em risco" value={`${kpis.clientesRisco}`} unit="clientes" delta={kpis.deltaRisco} invert />
                    <StatCard
                      icon={Sparkles}
                      label="Receita da carteira"
                      value={kpis.receitaCarteira.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                      delta={kpis.deltaReceita}
                    />
                    <StatCard icon={Target} label="Meta do período" value={`${kpis.metaMesPercent}%`} delta={kpis.deltaMeta} />
                    <StatCard icon={Star} label="Health Score" value={`${kpis.healthScore}`} delta={kpis.deltaHealth} />
                  </section>

                  {/* Corpo: duas colunas */}
                  <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    <div className="space-y-4 lg:col-span-7">
                      <Panel
                        title="Saúde da carteira"
                        subtitle={periodoLabel}
                        actions={
                          <ObjectEditorDialog title={`saúde da carteira — ${periodoLabel}`} fields={SAUDE_FIELDS} value={saude} onSave={setSaude} />
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

                    </div>
                  </section>

                  {/* Minhas metas — Ativação/Engajamento, Performance Comercial, Financeiro/Retenção */}
                  <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Panel
                      title="Ativação e engajamento"
                      actions={
                        <RowsEditorDialog
                          title="ativação e engajamento"
                          columns={METAS_COLUMNS}
                          rows={metasAtivacao}
                          emptyRow={() => ({ metrica: "Nova métrica", valor: "—", contexto: "" })}
                          onSave={setMetasAtivacao}
                        />
                      }
                    >
                      <MetaLista itens={metasAtivacao} />
                    </Panel>

                    <Panel
                      title="Performance comercial"
                      actions={
                        <RowsEditorDialog
                          title="performance comercial"
                          columns={METAS_COLUMNS}
                          rows={metasComercial}
                          emptyRow={() => ({ metrica: "Nova métrica", valor: "—", contexto: "" })}
                          onSave={setMetasComercial}
                        />
                      }
                    >
                      <MetaLista itens={metasComercial} />
                    </Panel>

                    <Panel
                      title="Indicadores financeiros e de retenção"
                      actions={
                        <RowsEditorDialog
                          title="indicadores financeiros e de retenção"
                          columns={METAS_COLUMNS}
                          rows={metasFinanceiro}
                          emptyRow={() => ({ metrica: "Nova métrica", valor: "—", contexto: "" })}
                          onSave={setMetasFinanceiro}
                        />
                      }
                    >
                      <MetaLista itens={metasFinanceiro} />
                    </Panel>
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
      className="rounded-[22px] border border-border bg-card p-5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div
        className="grid h-11 w-11 place-items-center rounded-[14px] text-white"
        style={{ backgroundImage: "var(--gradient-primary)" }}
      >
        <Icon className="h-[18px] w-[18px]" />
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
    <div className="rounded-[22px] border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
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

function MetaLista({ itens }: { itens: MetaItem[] }) {
  return (
    <ul className="space-y-3">
      {itens.map((m) => (
        <li key={m.metrica} className="flex items-start justify-between gap-3 text-sm">
          <div>
            <div className="font-medium text-foreground">{m.metrica}</div>
            {m.contexto && <div className="text-xs text-muted-foreground">{m.contexto}</div>}
          </div>
          <span className="shrink-0 font-semibold text-foreground">{m.valor}</span>
        </li>
      ))}
    </ul>
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
