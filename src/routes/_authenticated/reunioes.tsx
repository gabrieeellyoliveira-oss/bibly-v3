import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CalendarCheck, Plus, Trash2, Loader2, ChevronDown, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/reunioes")({
  component: ReuniõesPage,
});

interface Reuniao {
  id: string; data: string; nome_lead_numero: string; closer: string;
  resultado: string | null; data_reuniao_original?: string | null; resumo: string; created_at?: string;
}

const CLOSERS = ["Luan Nicolas", "Gustavo Duarte", "Leonardo Santos", "Guilherme Silva"];

const RESULTADO_OPTIONS = [
  { value: "fechou",       label: "Fechou na reunião",                         color: "text-success",     bg: "bg-success/10 border-success/40" },
  { value: "nao_fechou",   label: "Não fechou",                                color: "text-destructive", bg: "bg-destructive/10 border-destructive/40" },
  { value: "no_show",      label: "No show",                                   color: "text-orange-500",  bg: "bg-orange-500/10 border-orange-500/40" },
  { value: "continua",     label: "Não contratou, closer continua o processo", color: "text-primary",     bg: "bg-primary/10 border-primary/40" },
  { value: "pagou_depois", label: "Pagou — reunião anterior",                  color: "text-success",     bg: "bg-success/10 border-success/40" },
] as const;

function resultadoOpt(v: string | null) { return RESULTADO_OPTIONS.find((o) => o.value === v) ?? null; }
function parseDate(s: string): number { const [d, m, y] = s.split("/").map(Number); return new Date(y, m - 1, d).getTime(); }
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
function getMesAno(data: string): string { const parts = data.split("/"); const m = parseInt(parts[1]) - 1; const y = parts[2]; return `${MESES[m]} ${y}`; }

function RankingHorizontal({ titulo, items }: { titulo: string; items: { nome: string; count: number }[] }) {
  const max = items[0]?.count ?? 1;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card space-y-3">
      <p className="text-sm font-bold text-foreground">{titulo}</p>
      {items.length === 0 ? <p className="text-xs text-muted-foreground py-4 text-center">Nenhum dado ainda.</p> : (
        <div className="space-y-2">
          {items.map(({ nome, count }) => (
            <div key={nome} className="flex items-center gap-2">
              <span className="w-20 text-xs font-semibold text-foreground truncate text-right shrink-0">{nome}</span>
              <div className="flex-1 h-4 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-primary/50 transition-all duration-500" style={{ width: `${Math.max(8, (count / max) * 100)}%` }} />
              </div>
              <span className="w-5 text-xs font-extrabold text-foreground text-right shrink-0">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const HOJE = new Date().toLocaleDateString("pt-BR");
const CLOSER_KEY = "reunioes_closer";
function formInicial() { return { data: HOJE, nomeLeadNumero: "", closer: localStorage.getItem(CLOSER_KEY) ?? "", resultado: "", dataReuniaoOriginal: "" }; }

function ReuniõesPage() {
  const [registros, setRegistros] = useState<Reuniao[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState(formInicial);
  const [erro, setErro] = useState("");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("reunioes_sdr").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) toast.error(error.message);
      else setRegistros((data ?? []) as Reuniao[]);
      setLoading(false);
    });
  }, []);

  const handleAdd = async () => {
    if (!form.data) { setErro("Informe a data."); return; }
    if (!form.nomeLeadNumero.trim()) { setErro("Informe o nome e número do lead."); return; }
    if (!form.closer.trim()) { setErro("Informe o nome do closer."); return; }
    if (form.resultado === "pagou_depois" && !form.dataReuniaoOriginal.trim()) { setErro("Informe a data em que a reunião aconteceu."); return; }
    setErro(""); setSalvando(true);
    const payload: Record<string, unknown> = {
      data: form.data, nome_lead_numero: form.nomeLeadNumero.trim(), closer: form.closer.trim(),
      resultado: form.resultado || null,
      data_reuniao_original: form.resultado === "pagou_depois" ? form.dataReuniaoOriginal.trim() : null,
      resumo: `${form.data} — ${form.nomeLeadNumero.trim()} | Closer: ${form.closer.trim()}`,
      reunioes: 1, no_shows: form.resultado === "no_show" ? 1 : 0,
      fechou: form.resultado === "fechou" || form.resultado === "pagou_depois" ? true : form.resultado === "nao_fechou" ? false : null,
    };
    const { data, error } = await supabase.from("reunioes_sdr").insert(payload).select().single();
    setSalvando(false);
    if (error) { toast.error(error.message); return; }
    setRegistros((prev) => [data as Reuniao, ...prev]);
    localStorage.setItem(CLOSER_KEY, form.closer.trim());
    setForm((p) => ({ data: p.data, nomeLeadNumero: "", closer: p.closer, resultado: "", dataReuniaoOriginal: "" }));
    toast.success("Reunião registrada!");
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("reunioes_sdr").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setRegistros((prev) => prev.filter((r) => r.id !== id));
  };

  const handleEditResultado = async (id: string, novoResultado: string) => {
    const val = novoResultado || null;
    const { error } = await supabase.from("reunioes_sdr").update({ resultado: val, no_shows: val === "no_show" ? 1 : 0, fechou: val === "fechou" || val === "pagou_depois" ? true : val === "nao_fechou" ? false : null }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setRegistros((prev) => prev.map((r) => r.id === id ? { ...r, resultado: val } : r));
    setEditandoId(null); toast.success("Resultado atualizado");
  };

  const totalReunioes = registros.length;
  const totalFechou = registros.filter((r) => r.resultado === "fechou" || r.resultado === "pagou_depois").length;
  const totalNoShows = registros.filter((r) => r.resultado === "no_show").length;
  const diasOrdenados = Array.from(new Set(registros.map((r) => r.data))).sort((a, b) => parseDate(b) - parseDate(a));
  const porDia = registros.reduce((acc, r) => { if (!acc[r.data]) acc[r.data] = []; acc[r.data].push(r); return acc; }, {} as Record<string, Reuniao[]>);
  const mesesOrdenados: string[] = []; const diasPorMes: Record<string, string[]> = {};
  diasOrdenados.forEach((dia) => { const mes = getMesAno(dia); if (!diasPorMes[mes]) { diasPorMes[mes] = []; mesesOrdenados.push(mes); } diasPorMes[mes].push(dia); });
  const closerTotais = registros.reduce((acc, r) => { acc[r.closer] = (acc[r.closer] || 0) + 1; return acc; }, {} as Record<string, number>);
  const rankingAgendamento = Object.entries(closerTotais).map(([nome, count]) => ({ nome, count })).sort((a, b) => b.count - a.count);
  const closerFechou = registros.filter((r) => r.resultado === "fechou" || r.resultado === "pagou_depois").reduce((acc, r) => { acc[r.closer] = (acc[r.closer] || 0) + 1; return acc; }, {} as Record<string, number>);
  const rankingContratou = Object.entries(closerFechou).map(([nome, count]) => ({ nome, count })).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-pink">Reuniões</p>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Controle de Reuniões</h1>
        <p className="text-sm text-muted-foreground">Registre leads, resultados e acompanhe os closers.</p>
      </div>
      {registros.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card text-center"><p className="text-3xl font-extrabold text-foreground">{totalReunioes}</p><p className="text-xs text-muted-foreground mt-1">Total agendados</p></div>
          <div className="rounded-2xl border border-success/40 bg-success/10 p-4 shadow-card text-center"><p className="text-3xl font-extrabold text-success">{totalFechou}</p><p className="text-xs text-muted-foreground mt-1">Contrataram</p></div>
          <div className="rounded-2xl border border-orange-500/40 bg-orange-500/10 p-4 shadow-card text-center"><p className="text-3xl font-extrabold text-orange-500">{totalNoShows}</p><p className="text-xs text-muted-foreground mt-1">No shows</p></div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <RankingHorizontal titulo="Agendamento de Vídeo Chamada" items={rankingAgendamento} />
        <RankingHorizontal titulo="Contratou na Reunião" items={rankingContratou} />
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2"><Plus className="h-4 w-4 text-pink" /><p className="text-sm font-bold text-foreground">Nova entrada</p></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Data</label>
            <input type="text" placeholder="dd/mm/aaaa" value={form.data} onChange={(e) => setForm((p) => ({ ...p, data: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Nome e número do lead</label>
            <input type="text" placeholder="Ex: João Silva — (11) 99999-9999" value={form.nomeLeadNumero} onChange={(e) => setForm((p) => ({ ...p, nomeLeadNumero: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Closer</label>
            <select value={form.closer} onChange={(e) => { setForm((p) => ({ ...p, closer: e.target.value })); localStorage.setItem(CLOSER_KEY, e.target.value); }} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="">Selecione o closer</option>
              {CLOSERS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {form.resultado === "pagou_depois" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Data em que a reunião aconteceu</label>
              <input type="text" placeholder="dd/mm/aaaa" value={form.dataReuniaoOriginal} onChange={(e) => setForm((p) => ({ ...p, dataReuniaoOriginal: e.target.value }))} className="w-full rounded-lg border border-success/40 bg-success/5 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-success/50" />
            </div>
          )}
          <div className={cn("space-y-1.5", form.resultado !== "pagou_depois" && "sm:col-span-2")}>
            <label className="text-xs font-semibold text-muted-foreground">Resultado</label>
            <div className="flex gap-2 flex-wrap">
              {RESULTADO_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" onClick={() => setForm((p) => ({ ...p, resultado: p.resultado === opt.value ? "" : opt.value, dataReuniaoOriginal: "" }))} className={cn("rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all", form.resultado === opt.value ? opt.bg + " " + opt.color : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/40")}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {erro && <p className="text-xs font-semibold text-destructive">{erro}</p>}
        <Button type="button" onClick={handleAdd} disabled={salvando} className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90 disabled:opacity-50">
          {salvando ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Salvando...</> : <><Plus className="mr-1.5 h-3.5 w-3.5" /> Adicionar</>}
        </Button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : registros.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground shadow-card"><CalendarCheck className="mx-auto mb-3 h-8 w-8 opacity-40" /><p className="text-sm">Nenhuma reunião registrada ainda.</p></div>
      ) : (
        <div className="space-y-6">
          {mesesOrdenados.map((mes) => (
            <div key={mes} className="space-y-3">
              <div className="flex items-center gap-3"><span className="text-base font-extrabold tracking-tight text-foreground">{mes}</span><div className="flex-1 h-px bg-border" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {diasPorMes[mes].map((dia) => {
                  const lista = porDia[dia] ?? []; const total = lista.length;
                  const fechouDia = lista.filter((r) => r.resultado === "fechou" || r.resultado === "pagou_depois").length;
                  const noShowDia = lista.filter((r) => r.resultado === "no_show").length;
                  const naoFechou = lista.filter((r) => r.resultado === "nao_fechou").length;
                  const continua = lista.filter((r) => r.resultado === "continua").length;
                  const isOpen = expandedDay === dia;
                  const vendaCor = fechouDia > 0 ? "hsl(var(--success))" : "hsl(var(--muted-foreground))";
                  return (
                    <div key={dia} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card transition-all hover:border-primary/40">
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-bold text-foreground text-base">{dia}</p>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground shrink-0">{total} lead{total !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="py-1 text-center"><p className="text-5xl font-extrabold leading-none text-foreground">{total}</p><p className="mt-1 text-xs text-muted-foreground">agendados</p></div>
                      <div className="space-y-1">
                        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden"><div className="h-full rounded-full bg-success transition-all" style={{ width: total > 0 ? `${(fechouDia / total) * 100}%` : "0%" }} /></div>
                        <div className="flex justify-between text-[10px] text-muted-foreground/70"><span>0</span><span>Total: {total}</span></div>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[{ label: "Fecharam na reunião", val: fechouDia, icon: <CheckCircle2 className="h-3 w-3 text-success" />, cor: "text-success" }, { label: "No show", val: noShowDia, icon: <XCircle className="h-3 w-3 text-orange-500" />, cor: "text-orange-500" }, { label: "Não fechou", val: naoFechou, icon: <XCircle className="h-3 w-3 text-destructive" />, cor: "text-destructive" }, { label: "Closer continua", val: continua, icon: <ArrowRight className="h-3 w-3 text-primary" />, cor: "text-primary" }].map(({ label, val, icon, cor }) => (
                          <div key={label} className="flex items-center justify-between text-xs text-muted-foreground"><span className="flex items-center gap-1">{icon}{label}</span><span className={cn("font-bold", cor)}>{val}/{total}</span></div>
                        ))}
                      </div>
                      <div className="rounded-lg px-3 py-2 text-center" style={{ backgroundColor: `${vendaCor}22`, border: `1px solid ${vendaCor}55` }}>
                        <p className="text-xs font-semibold" style={{ color: vendaCor }}>{fechouDia > 0 ? `✓ ${fechouDia} venda${fechouDia !== 1 ? "s" : ""} no dia` : "Nenhuma venda no dia"}</p>
                      </div>
                      <button type="button" onClick={() => setExpandedDay(isOpen ? null : dia)} className="flex items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
                        {isOpen ? "Ocultar leads" : "Ver e editar leads"}<ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", isOpen && "rotate-180")} />
                      </button>
                    </div>
                  );
                })}
              </div>
              {expandedDay && diasPorMes[mes].includes(expandedDay) && (
                <div className="rounded-2xl border border-primary/30 bg-card p-5 shadow-card space-y-3">
                  <div className="flex items-center gap-2 border-b border-border/50 pb-3"><CalendarCheck className="h-4 w-4 text-pink" /><p className="text-sm font-bold text-foreground">Leads — {expandedDay}</p></div>
                  <div className="space-y-2">
                    {(porDia[expandedDay] ?? []).map((r) => {
                      const opt = resultadoOpt(r.resultado); const editing = editandoId === r.id;
                      return (
                        <div key={r.id} className="rounded-xl border border-border bg-card/60 p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0"><p className="text-sm font-bold text-foreground truncate">{r.nome_lead_numero}</p><p className="text-xs text-muted-foreground">{r.closer}</p>{r.resultado === "pagou_depois" && r.data_reuniao_original && <p className="text-[10px] text-success mt-0.5">Reunião original: {r.data_reuniao_original}</p>}</div>
                            <div className="flex items-center gap-2 shrink-0">
                              {opt && !editing && <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold", opt.bg, opt.color)}>{opt.label}</span>}
                              <button type="button" onClick={() => setEditandoId(editing ? null : r.id)} className="text-[10px] font-semibold text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">{editing ? "Cancelar" : "Editar"}</button>
                              <button type="button" onClick={() => handleDelete(r.id)} className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </div>
                          {editing && (
                            <div className="flex gap-2 flex-wrap pt-1">
                              {RESULTADO_OPTIONS.map((opt) => (
                                <button key={opt.value} type="button" onClick={() => handleEditResultado(r.id, opt.value)} className={cn("rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all", r.resultado === opt.value ? opt.bg + " " + opt.color : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/40")}>{opt.label}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
