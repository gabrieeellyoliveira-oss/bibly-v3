// Helpers compartilhados do dashboard.
import type { MetasMes } from "@/data/dashboard";

export function pct(v: number, t: number): number {
  if (!t) return 0;
  return Math.min(Math.round((v / t) * 100), 100);
}

export function fmtBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function calcChange(cur: number, prev: number, inverso = false) {
  if (prev === 0 && cur === 0) return null;
  if (prev === 0) return { val: 100, arrow: "↑", positive: !inverso };
  const p = Math.round(((cur - prev) / Math.abs(prev)) * 100);
  const subiu = p >= 0;
  const positive = inverso ? !subiu : subiu;
  return { val: Math.abs(p), arrow: subiu ? "↑" : "↓", positive };
}

const FERIADOS_2026 = [
  "2026-01-01", "2026-04-03", "2026-04-05", "2026-04-21",
  "2026-05-01", "2026-06-04", "2026-09-07", "2026-10-12",
  "2026-11-02", "2026-11-15", "2026-11-20", "2026-12-25",
];

export function isDiaUtil(d: Date): boolean {
  const dia = d.getDay();
  if (dia === 0 || dia === 6) return false;
  const iso = d.toISOString().slice(0, 10);
  return !FERIADOS_2026.includes(iso);
}

export function getDeadlineMes(): Date | null {
  const hoje = new Date();
  if (hoje.getFullYear() === 2026 && hoje.getMonth() === 4) {
    return new Date(2026, 4, 23);
  }
  return null;
}

export function calcDiasUteisRestantes(fim?: Date): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const fimEfetivo = fim ?? new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  let count = 0;
  const cur = new Date(hoje);
  while (cur <= fimEfetivo) {
    if (isDiaUtil(cur)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export function calcDiasUteisMesAte(fim?: Date): number {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimEfetivo = fim ?? new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  let count = 0;
  const cur = new Date(inicioMes);
  while (cur <= fimEfetivo) {
    if (isDiaUtil(cur)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export function getInicioSemana(): Date {
  const hoje = new Date();
  const diaSemana = hoje.getDay();
  const diff = diaSemana === 0 ? -6 : 1 - diaSemana;
  const seg = new Date(hoje);
  seg.setDate(hoje.getDate() + diff);
  seg.setHours(0, 0, 0, 0);
  return seg;
}

export function calcFechamentosSemana(metas: MetasMes, diasUteisNoMes?: number) {
  const hoje = new Date();
  const diaSemana = hoje.getDay();
  const hora = hoje.getHours();
  const deadline = getDeadlineMes();

  let diasRestantesSemana = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    if (!isDiaUtil(d)) continue;
    if (i === 0 && hora >= 18) continue;
    if (deadline && d > deadline) break;
    const inicioSemana = getInicioSemana();
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 4);
    if (d > fimSemana) break;
    diasRestantesSemana++;
  }

  const totalDias = diasUteisNoMes ?? 22;
  const fechPorSemana = Math.ceil((metas.m3 / totalDias) * 5);
  const semanaEncerrada =
    diaSemana === 0 || diaSemana === 6 || (diaSemana === 5 && hora >= 18);

  return { diasRestantesSemana, fechPorSemana, semanaEncerrada };
}

export function getSaudacao(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export type ParsedPlanilha = {
  diario: { dia: string; clientes: number; noDia: number }[];
  atual: Partial<{
    atualizadoAte: string;
    diaAtual: number;
    clientes: number;
    leads: number;
    opps: number;
    ltr: number;
    noshow: number;
    oportunidades: number;
    conversao: number;
    whatsapp: number;
    video: number;
  }>;
  metas: { m1: number | null; m2: number | null; m3: number | null };
};

export function parsearTSV(texto: string): ParsedPlanilha | null {
  if (!texto || !texto.trim()) return null;
  const linhas = texto
    .trim()
    .split("\n")
    .map((l) => l.split("\t").map((c) => c.trim()));
  if (linhas.length < 4) return null;

  const limparNum = (v: string) => {
    if (v == null || v === "" || v === "-") return 0;
    const s = String(v).replace(/[^0-9.,]/g, "").replace(",", ".");
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  };
  const limparPct = (v: string) => {
    if (v == null || v === "" || v === "-") return 0;
    const s = String(v).replace("%", "").replace(",", ".").trim();
    const n = parseFloat(s);
    if (isNaN(n) || n > 200) return 0;
    return n;
  };

  const MAPA: [string, string[]][] = [
    ["whatsapp", ["whatsapp"]],
    ["video", ["vídeo chamada", "video chamada", "vídeo", "video"]],
    ["noshow", ["no-show", "noshow", "no show"]],
    ["conversao", ["taxa de convers", "conversão", "conversao"]],
    ["opors", ["oportunidades"]],
    ["clientes", ["clientes (os que", "clientes"]],
    ["leads", ["novos leads", "leads"]],
    ["opps", ["opps do mesmo", "opps"]],
    ["ltr", ["ltr"]],
  ];

  const detectar = (cel: string) => {
    const c = cel.toLowerCase();
    for (const [chave, termos] of MAPA) {
      if (termos.some((t) => c.includes(t))) return chave;
    }
    return null;
  };

  const idx: Record<string, number> = {};
  let headerIdx: number | null = null;
  linhas.forEach((row, i) => {
    const cel = (row[0] || "").toLowerCase().trim();
    if (
      headerIdx === null &&
      (cel.includes("jan") || cel.includes("fev") || cel.includes("mar") ||
        cel.includes("abr") || cel.includes("mai") || cel.includes("jun") ||
        cel.includes("jul") || cel.includes("ago") || cel.includes("set") ||
        cel.includes("out") || cel.includes("nov") || cel.includes("dez") ||
        /^\d{2}[-/]/.test(cel))
    ) {
      headerIdx = i;
      return;
    }
    const tipo = detectar(row[0] || "");
    if (tipo && idx[tipo] == null) idx[tipo] = i;
  });
  if (headerIdx === null) headerIdx = 0;
  const header = linhas[headerIdx] || [];
  let ultimaCol = 1;
  const refLinha = linhas[idx.clientes ?? idx.leads ?? headerIdx + 1] || [];
  for (let c = 1; c < refLinha.length; c++) {
    if (refLinha[c] !== "" && refLinha[c] != null) ultimaCol = c;
  }

  const diario: ParsedPlanilha["diario"] = [];
  for (let c = 1; c <= ultimaCol; c++) {
    const clientesAcum = idx.clientes != null ? limparNum(linhas[idx.clientes][c]) : 0;
    const clientesPrev = idx.clientes != null && c > 1 ? limparNum(linhas[idx.clientes][c - 1]) : 0;
    diario.push({
      dia: header[c] || `Dia ${c}`,
      clientes: clientesAcum,
      noDia: Math.max(clientesAcum - clientesPrev, 0),
    });
  }

  const col = ultimaCol;
  const get = (k: string) => linhas[idx[k]]?.[col] ?? "";
  const atual = {
    atualizadoAte: header[col] || "",
    diaAtual: col,
    clientes: limparNum(get("clientes")),
    leads: limparNum(get("leads")),
    opps: limparNum(get("opps")),
    ltr: limparPct(get("ltr")),
    noshow: limparPct(get("noshow")),
    oportunidades: limparNum(get("opors")),
    conversao: limparPct(get("conversao")),
    whatsapp: limparNum(get("whatsapp")),
    video: limparNum(get("video")),
  };

  const metas: ParsedPlanilha["metas"] = { m1: null, m2: null, m3: null };
  linhas.forEach((row) => {
    const txt = (row[0] || "") + " " + (row[1] || "");
    const m = txt.match(/Meta\s*0?(\d)[^:]*:\s*(\d+)/i);
    if (m) {
      const n = parseInt(m[1]);
      const v = parseInt(m[2]);
      if (n === 1) metas.m1 = v;
      if (n === 2) metas.m2 = v;
      if (n === 3) metas.m3 = v;
    }
  });

  return { diario, atual, metas };
}

export function storageGet<T = unknown>(key: string): T | null {
  try {
    const r = localStorage.getItem(key);
    return r ? (JSON.parse(r) as T) : null;
  } catch {
    return null;
  }
}

export function storageSet(key: string, val: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* ignore */
  }
}
