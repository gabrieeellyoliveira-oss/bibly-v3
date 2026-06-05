// Dados estáticos do dashboard — fallback caso usuário não importe planilha.
export type DadosDiarios = { dia: string; clientes: number; noDia: number };

export type MetasMes = { m1: number; m2: number; m3: number };

export type DadosAtual = {
  metas: MetasMes;
  diaAtual: number;
  diasTotal: number;
  diasUteisRestantes: number;
  atualizadoAte: string;
  clientes: number;
  leads: number;
  opps: number;
  ltr: number;
  noshow: number;
  oportunidades: number;
  conversao: number;
  whatsapp: number;
  video: number;
};

export type HistoricoMes = {
  mes: string;
  ano: string;
  tier: string;
  clientes: number;
  metas: MetasMes;
  megaMeta: number | null;
  m: {
    leads: number;
    opps: number;
    ltr: number;
    noshow: number;
    oportunidades: number;
    conversao: number;
    whatsapp: number;
    video: number;
  };
  conclusao: { texto: string; cor: string; tipo: "fail" | "meta2" | "mega" | "meta1" };
};

export const abrilDiarioFallback: DadosDiarios[] = [
  { dia: "01/06", clientes: 0, noDia: 0 },
];

export const abrilFallback: DadosAtual = {
  metas: { m1: 0, m2: 0, m3: 0 },
  diaAtual: 1,
  diasTotal: 30,
  diasUteisRestantes: 21,
  atualizadoAte: "01/06",
  clientes: 0,
  leads: 0,
  opps: 0,
  ltr: 0,
  noshow: 0,
  oportunidades: 0,
  conversao: 0,
  whatsapp: 0,
  video: 0,
};

export const TIER_CFG: Record<string, { bg: string; text: string }> = {
  "Tier 4/5": { bg: "hsl(var(--muted))",  text: "hsl(var(--muted-foreground))" },
  "Tier 3":   { bg: "hsl(38 95% 90%)",    text: "hsl(38 80% 30%)" },
  "Tier 2":   { bg: "hsl(245 80% 92%)",   text: "hsl(245 70% 40%)" },
  "Tier 1":   { bg: "hsl(142 60% 88%)",   text: "hsl(142 50% 28%)" },
};

export const historico: HistoricoMes[] = [
  {
    mes: "Dezembro", ano: "2025", tier: "Tier 4/5", clientes: 22,
    metas: { m1: 32, m2: 40, m3: 55 }, megaMeta: null,
    m: { leads: 861, opps: 30, ltr: 33, noshow: 43, oportunidades: 43, conversao: 0, whatsapp: 0, video: 0 },
    conclusao: { texto: "Não bateu meta — 22 clientes", cor: "hsl(var(--destructive))", tipo: "fail" },
  },
  {
    mes: "Janeiro", ano: "2026", tier: "Tier 3", clientes: 44,
    metas: { m1: 32, m2: 40, m3: 50 }, megaMeta: null,
    m: { leads: 1121, opps: 44, ltr: 40, noshow: 11, oportunidades: 44, conversao: 72, whatsapp: 16, video: 40 },
    conclusao: { texto: "Meta 2 batida — 44 clientes", cor: "hsl(var(--success))", tipo: "meta2" },
  },
  {
    mes: "Fevereiro", ano: "2026", tier: "Tier 3", clientes: 58,
    metas: { m1: 25, m2: 30, m3: 38 }, megaMeta: 50,
    m: { leads: 580, opps: 56, ltr: 40, noshow: 15, oportunidades: 77, conversao: 71, whatsapp: 3, video: 57 },
    conclusao: { texto: "Mega Meta 1 batida! — 58 clientes", cor: "hsl(var(--warning))", tipo: "mega" },
  },
  {
    mes: "Março", ano: "2026", tier: "Tier 1", clientes: 88,
    metas: { m1: 62, m2: 68, m3: 76 }, megaMeta: 86,
    m: { leads: 702, opps: 111, ltr: 52, noshow: 24, oportunidades: 154, conversao: 63, whatsapp: 29, video: 104 },
    conclusao: { texto: "Mega Meta 1 batida! — 88 clientes", cor: "hsl(var(--success))", tipo: "mega" },
  },
  {
    mes: "Abril", ano: "2026", tier: "Tier 1", clientes: 81,
    metas: { m1: 60, m2: 70, m3: 80 }, megaMeta: null,
    m: { leads: 462, opps: 86, ltr: 30, noshow: 19, oportunidades: 137, conversao: 58, whatsapp: 10, video: 103 },
    conclusao: { texto: "Meta 3 batida! — 81 clientes", cor: "hsl(var(--success))", tipo: "meta1" },
  },
  {
    mes: "Maio", ano: "2026", tier: "Tier 1", clientes: 67,
    metas: { m1: 60, m2: 70, m3: 80 }, megaMeta: null,
    m: { leads: 299, opps: 62, ltr: 32, noshow: 13, oportunidades: 97, conversao: 64, whatsapp: 12, video: 73 },
    conclusao: { texto: "Meta 1 batida — 67 clientes", cor: "hsl(var(--warning))", tipo: "meta1" },
  },
];

export type NivelCarreira = {
  nivel: string;
  base: number;
  faixa1: MetasMes;
  faixa2: MetasMes;
};

export const progressaoCarreira: NivelCarreira[] = [
  { nivel: "JR 1", base: 1809.51, faixa1: { m1: 20, m2: 25, m3: 30 }, faixa2: { m1: 30, m2: 35, m3: 40 } },
  { nivel: "JR 2", base: 1988.48, faixa1: { m1: 20, m2: 25, m3: 30 }, faixa2: { m1: 30, m2: 35, m3: 40 } },
  { nivel: "JR 3", base: 2185.14, faixa1: { m1: 20, m2: 25, m3: 30 }, faixa2: { m1: 30, m2: 35, m3: 40 } },
  { nivel: "PL 1", base: 2401.25, faixa1: { m1: 25, m2: 30, m3: 45 }, faixa2: { m1: 30, m2: 35, m3: 50 } },
  { nivel: "PL 2", base: 2617.36, faixa1: { m1: 25, m2: 30, m3: 45 }, faixa2: { m1: 30, m2: 35, m3: 50 } },
  { nivel: "PL 3", base: 2852.93, faixa1: { m1: 25, m2: 30, m3: 45 }, faixa2: { m1: 30, m2: 35, m3: 50 } },
  { nivel: "SR 1", base: 3109.69, faixa1: { m1: 25, m2: 30, m3: 45 }, faixa2: { m1: 30, m2: 35, m3: 50 } },
  { nivel: "SR 2", base: 3389.56, faixa1: { m1: 25, m2: 30, m3: 45 }, faixa2: { m1: 30, m2: 35, m3: 50 } },
  { nivel: "SR 3", base: 3694.62, faixa1: { m1: 25, m2: 30, m3: 45 }, faixa2: { m1: 30, m2: 35, m3: 50 } },
];

export const STORAGE = {
  GANHOS: "ravenna_ganhos",
  PLANILHA: "ravenna_planilha",
  NEGOCIOS: "ravenna_negocios",
  PERFIL: "ravenna_perfil",
  LIVROS: "ravenna_livros",
  CURSOS: "ravenna_cursos",
  LINKS: "ravenna_links",
  TRAINING: "ravenna-training",
  REUNIOES_DIA: "bibly_reunioes_dia",
  REUNIOES: "bibly_reunioes",
} as const;

export type StatusEstudo = "concluido" | "andamento" | "nao_iniciado";

export const STATUS_CFG: Record<StatusEstudo, { label: string; bg: string; text: string }> = {
  concluido:    { label: "concluído",     bg: "hsl(142 60% 88%)",         text: "hsl(142 50% 28%)" },
  andamento:    { label: "em andamento",  bg: "hsl(var(--secondary))",     text: "hsl(var(--primary))" },
  nao_iniciado: { label: "não iniciado",  bg: "hsl(var(--muted))",         text: "hsl(var(--muted-foreground))" },
};
