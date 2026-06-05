// Feriados nacionais 2026 (formato MM-DD)
const FERIADOS_2026 = new Set([
  "01-01", "04-20", "04-21", "05-01", "09-07", "10-12", "11-02", "11-15", "12-25",
]);

export function isDiaUtil(date: Date): boolean {
  const dow = date.getDay();
  if (dow === 0 || dow === 6) return false;
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return !FERIADOS_2026.has(`${mm}-${dd}`);
}

export function calcDiasUteisRestantes(hoje = new Date()): number {
  const year = hoje.getFullYear();
  const month = hoje.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let d = hoje.getDate(); d <= lastDay; d++) {
    if (isDiaUtil(new Date(year, month, d))) count++;
  }
  return count;
}

export function calcDiasUteisTotaisMes(hoje = new Date()): number {
  const year = hoje.getFullYear();
  const month = hoje.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let d = 1; d <= lastDay; d++) {
    if (isDiaUtil(new Date(year, month, d))) count++;
  }
  return count;
}

export function calcDiasUteisDecorridos(hoje = new Date()): number {
  return calcDiasUteisTotaisMes(hoje) - calcDiasUteisRestantes(hoje) + (isDiaUtil(hoje) ? 1 : 0);
}

export function mesAtualKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function rangeMesAtual(d = new Date()): { start: string; end: string } {
  const year = d.getFullYear();
  const month = d.getMonth();
  const last = new Date(year, month + 1, 0).getDate();
  const mm = String(month + 1).padStart(2, "0");
  return {
    start: `${year}-${mm}-01`,
    end: `${year}-${mm}-${String(last).padStart(2, "0")}`,
  };
}

export function hojeISO(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function saudacao(d = new Date()): string {
  const h = d.getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export function formatarDataPtBr(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
}
