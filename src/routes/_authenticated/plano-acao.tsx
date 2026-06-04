import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle2, Circle, Loader2, Flame, Clock, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/plano-acao")({
  head: () => ({ meta: [{ title: "Plano de Ação — Bibly" }] }),
  component: PlanoAcaoPage,
});

type Prioridade = "alta" | "normal" | "baixa";

interface Tarefa {
  id: string;
  titulo: string;
  concluida: boolean;
  prioridade: Prioridade;
  data_criacao: string;
}

const PRIO: Record<Prioridade, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  alta:   { label: "Alta",   icon: Flame,    color: "#EC4899", bg: "rgba(236,72,153,0.12)" },
  normal: { label: "Normal", icon: Clock,    color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  baixa:  { label: "Baixa",  icon: ArrowDown, color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
};

const hoje = () => new Date().toISOString().slice(0, 10);
const fmtData = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

function PlanoAcaoPage() {
  const [tarefas, setTarefas]   = useState<Tarefa[]>([]);
  const [loading, setLoading]   = useState(true);
  const [titulo, setTitulo]     = useState("");
  const [prio, setPrio]         = useState<Prioridade>("normal");
  const dataHoje = hoje();

  useEffect(() => {
    supabase
      .from("plano_acao_tarefas")
      .select("*")
      .eq("perfil", "bibi")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          if (error.code === "42P01") toast.error("Tabela não criada ainda — peça ao admin para rodar a migration.");
          else toast.error(error.message);
        } else {
          setTarefas((data ?? []) as Tarefa[]);
        }
        setLoading(false);
      });
  }, []);

  const adicionar = async () => {
    if (!titulo.trim()) return;
    const payload = { perfil: "bibi", titulo: titulo.trim(), concluida: false, prioridade: prio, data_criacao: dataHoje };
    const { data, error } = await supabase.from("plano_acao_tarefas").insert(payload).select().single();
    if (error) { toast.error(error.message); return; }
    setTarefas(p => [...p, data as Tarefa]);
    setTitulo("");
    toast.success("Tarefa adicionada!");
  };

  const toggleConcluida = async (t: Tarefa) => {
    const nova = !t.concluida;
    supabase.from("plano_acao_tarefas").update({ concluida: nova }).eq("id", t.id).then(({ error }) => {
      if (error) toast.error(error.message);
    });
    setTarefas(p => p.map(x => x.id === t.id ? { ...x, concluida: nova } : x));
  };

  const remover = async (id: string) => {
    supabase.from("plano_acao_tarefas").delete().eq("id", id).then(({ error }) => {
      if (error) toast.error(error.message);
    });
    setTarefas(p => p.filter(x => x.id !== id));
  };

  const limparConcluidas = async () => {
    const ids = tarefas.filter(t => t.concluida).map(t => t.id);
    if (!ids.length) return;
    await supabase.from("plano_acao_tarefas").delete().in("id", ids);
    setTarefas(p => p.filter(t => !t.concluida));
    toast.success("Concluídas removidas!");
  };

  const porPrioridade = (p: Prioridade) => tarefas.filter(t => t.prioridade === p && !t.concluida);
  const concluidas    = tarefas.filter(t => t.concluida);
  const totalFeitas   = concluidas.length;
  const totalPendentes = tarefas.filter(t => !t.concluida).length;
  const pctFeito = tarefas.length > 0 ? Math.round((totalFeitas / tarefas.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-pink">Foco de Hoje</p>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Plano de Ação</h1>
          <p className="text-sm text-muted-foreground capitalize mt-0.5">{fmtData(dataHoje)}</p>
        </div>
        {tarefas.length > 0 && (
          <div className="text-right">
            <p className="text-3xl font-black text-primary">{pctFeito}%</p>
            <p className="text-xs text-muted-foreground">{totalFeitas}/{tarefas.length} concluídas</p>
            <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${pctFeito}%`, background: "linear-gradient(90deg,#8B5CF6,#EC4899)" }} />
            </div>
          </div>
        )}
      </div>

      {/* Adicionar tarefa */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Nova tarefa</p>
        <div className="flex gap-3">
          <Input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && adicionar()}
            placeholder="Ex: Fazer 3 fechamentos até 18h..."
            className="flex-1"
          />
          <div className="flex gap-1 rounded-xl border border-border bg-secondary/50 p-1">
            {(["alta", "normal", "baixa"] as Prioridade[]).map(p => {
              const cfg = PRIO[p];
              const Icon = cfg.icon;
              return (
                <button
                  key={p}
                  onClick={() => setPrio(p)}
                  title={cfg.label}
                  className={cn("flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all", prio === p ? "text-white shadow-sm" : "text-muted-foreground hover:text-foreground")}
                  style={prio === p ? { background: cfg.color } : {}}
                >
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{cfg.label}</span>
                </button>
              );
            })}
          </div>
          <Button onClick={adicionar} className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
            <Plus className="mr-1 h-3.5 w-3.5" /> Adicionar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Colunas por prioridade */}
          {(["alta", "normal", "baixa"] as Prioridade[]).map(p => {
            const items = porPrioridade(p);
            const cfg   = PRIO[p];
            const Icon  = cfg.icon;
            return (
              <div key={p} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: cfg.bg }}>
                    <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
                  </div>
                  <p className="text-sm font-bold text-foreground">Prioridade {cfg.label}</p>
                  <span className="ml-auto text-xs text-muted-foreground font-semibold">{items.length}</span>
                </div>
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Nenhuma tarefa aqui.</p>
                ) : (
                  <ul className="space-y-2">
                    {items.map(t => (
                      <li key={t.id} className="group flex items-start gap-2.5">
                        <button onClick={() => toggleConcluida(t)} className="mt-0.5 shrink-0 transition-colors">
                          <Circle className="h-4 w-4 text-muted-foreground/40 hover:text-primary" />
                        </button>
                        <span className="flex-1 text-sm text-foreground leading-snug">{t.titulo}</span>
                        <button onClick={() => remover(t.id)} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Concluídas */}
      {concluidas.length > 0 && (
        <div className="rounded-2xl border border-success/30 bg-success/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <p className="text-sm font-bold text-success">Concluídas hoje ({concluidas.length})</p>
            </div>
            <button onClick={limparConcluidas} className="text-xs text-muted-foreground hover:text-destructive transition-colors">Limpar</button>
          </div>
          <ul className="space-y-2">
            {concluidas.map(t => (
              <li key={t.id} className="group flex items-center gap-2.5">
                <button onClick={() => toggleConcluida(t)} className="shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </button>
                <span className="flex-1 text-sm text-muted-foreground line-through">{t.titulo}</span>
                <button onClick={() => remover(t.id)} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && tarefas.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <p className="font-semibold text-foreground">Nenhuma tarefa ainda</p>
          <p className="text-sm text-muted-foreground mt-1">Adicione sua primeira tarefa do dia acima.</p>
        </div>
      )}
    </div>
  );
}
