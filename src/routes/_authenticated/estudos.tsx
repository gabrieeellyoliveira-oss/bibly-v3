import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BookOpen, GraduationCap, Trash2, Plus, Loader2, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_CFG, type StatusEstudo } from "@/data/dashboard";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/estudos")({
  component: EstudosPage,
});

interface ItemEstudo {
  id: string; tipo: "livro" | "curso"; titulo: string;
  detalhe: string; progresso: number; status: StatusEstudo;
}

function ItemRow({ item, onRemove, onProgress }: {
  item: ItemEstudo; onRemove: () => void; onProgress: (p: number) => void;
}) {
  const cfg = STATUS_CFG[item.status];
  const concluido = item.progresso === 100;

  return (
    <div className="group py-4 border-b border-border last:border-0">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            onClick={() => onProgress(concluido ? 0 : 100)}
            className="shrink-0 transition-colors"
          >
            {concluido
              ? <CheckCircle2 className="h-5 w-5 text-success" />
              : <Circle className="h-5 w-5 text-muted-foreground/40 hover:text-primary" />
            }
          </button>
          <div className="min-w-0">
            <p className={cn("text-sm font-semibold leading-snug", concluido && "line-through text-muted-foreground")}>
              {item.titulo}
            </p>
            {item.detalhe && <p className="text-xs text-muted-foreground mt-0.5">{item.detalhe}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.text }}>
            {cfg.label}
          </span>
          <button
            onClick={onRemove}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-all"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Barra de progresso + % */}
      <div className="pl-7">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>Progresso</span>
          <span className={cn("font-semibold", concluido ? "text-success" : "text-primary")}>
            {item.progresso}%
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{
              width: `${item.progresso}%`,
              background: "linear-gradient(90deg, #8B5CF6, #EC4899)",
            }}
          />
        </div>
        <input
          type="range" min={0} max={100} value={item.progresso}
          onChange={(e) => onProgress(Number(e.target.value))}
          className="w-full mt-1 opacity-0 h-2 cursor-pointer absolute"
          style={{ marginTop: "-0.5rem" }}
        />
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, count, items, loading, emptyMsg, onRemove, onProgress }: {
  icon: React.ElementType; title: string; count: number; items: ItemEstudo[];
  loading: boolean; emptyMsg: string;
  onRemove: (id: string) => void; onProgress: (id: string, p: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-pink" />
          <p className="font-bold text-foreground">{title}</p>
        </div>
        <span className="text-xs text-muted-foreground">{count} item(s)</span>
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{emptyMsg}</p>
      ) : (
        items.map(item => (
          <ItemRow
            key={item.id} item={item}
            onRemove={() => onRemove(item.id)}
            onProgress={(p) => onProgress(item.id, p)}
          />
        ))
      )}
    </div>
  );
}

function EstudosPage() {
  const [livros, setLivros]   = useState<ItemEstudo[]>([]);
  const [cursos, setCursos]   = useState<ItemEstudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo]       = useState<"livro" | "curso">("livro");
  const [titulo, setTitulo]   = useState("");
  const [detalhe, setDetalhe] = useState("");

  useEffect(() => {
    supabase.from("estudos_items").select("*").order("created_at", { ascending: true }).then(({ data, error }) => {
      if (error) toast.error(error.message);
      else {
        const items = (data ?? []) as ItemEstudo[];
        setLivros(items.filter(i => i.tipo === "livro"));
        setCursos(items.filter(i => i.tipo === "curso"));
      }
      setLoading(false);
    });
  }, []);

  const adicionar = async () => {
    if (!titulo.trim()) return;
    const payload = {
      tipo, titulo: titulo.trim(),
      detalhe: detalhe.trim() || (tipo === "livro" ? "Autor não informado" : "Plataforma não informada"),
      progresso: 0, status: "andamento",
    };
    const { data, error } = await supabase.from("estudos_items").insert(payload).select().single();
    if (error) { toast.error(error.message); return; }
    const novo = data as ItemEstudo;
    if (tipo === "livro") setLivros(p => [...p, novo]); else setCursos(p => [...p, novo]);
    setTitulo(""); setDetalhe("");
    toast.success("Item adicionado!");
  };

  const remover = async (id: string, t: "livro" | "curso") => {
    const { error } = await supabase.from("estudos_items").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    if (t === "livro") setLivros(p => p.filter(i => i.id !== id));
    else setCursos(p => p.filter(i => i.id !== id));
  };

  const updateProgress = async (id: string, t: "livro" | "curso", progresso: number) => {
    const status: StatusEstudo = progresso === 100 ? "concluido" : progresso === 0 ? "nao_iniciado" : "andamento";
    supabase.from("estudos_items").update({ progresso, status }).eq("id", id).then(({ error }) => {
      if (error) toast.error(error.message);
    });
    const patch = (p: ItemEstudo[]) => p.map(i => i.id === id ? { ...i, progresso, status } : i);
    if (t === "livro") setLivros(patch); else setCursos(patch);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-pink">Estudos</p>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Liderança e desenvolvimento</h1>
      </div>

      {/* Adicionar */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Adicione um item</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[140px_1fr_1fr_auto]">
          <Select value={tipo} onValueChange={(v) => setTipo(v as "livro" | "curso")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="livro">Livro</SelectItem>
              <SelectItem value="curso">Curso</SelectItem>
            </SelectContent>
          </Select>
          <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && adicionar()} placeholder={tipo === "livro" ? "Nome do livro" : "Nome do curso"} />
          <Input value={detalhe} onChange={(e) => setDetalhe(e.target.value)} onKeyDown={(e) => e.key === "Enter" && adicionar()} placeholder={tipo === "livro" ? "Autor (opcional)" : "Plataforma (opcional)"} />
          <Button onClick={adicionar} className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Adicionar
          </Button>
        </div>
      </div>

      <Section
        icon={BookOpen} title="Livros" count={livros.length} items={livros}
        loading={loading} emptyMsg="Nenhum livro ainda. Adicione um acima."
        onRemove={(id) => remover(id, "livro")}
        onProgress={(id, p) => updateProgress(id, "livro", p)}
      />
      <Section
        icon={GraduationCap} title="Cursos" count={cursos.length} items={cursos}
        loading={loading} emptyMsg="Nenhum curso ainda. Adicione um acima."
        onRemove={(id) => remover(id, "curso")}
        onProgress={(id, p) => updateProgress(id, "curso", p)}
      />
    </div>
  );
}
