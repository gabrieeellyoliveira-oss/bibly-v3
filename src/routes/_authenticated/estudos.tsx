import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BookOpen, GraduationCap, Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bar } from "@/components/dashboard/PrimitivesUI";
import { STATUS_CFG, type StatusEstudo } from "@/data/dashboard";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/estudos")({
  component: EstudosPage,
});

interface ItemEstudo { id: string; tipo: "livro" | "curso"; titulo: string; detalhe: string; progresso: number; status: StatusEstudo; }

function ItemRow({ item, onRemove, onProgress }: { item: ItemEstudo; onRemove: () => void; onProgress: (p: number) => void; }) {
  const cfg = STATUS_CFG[item.status];
  return (
    <div className="group space-y-3 border-b border-border py-4 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug text-foreground">{item.titulo}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{item.detalhe}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.text }}>{cfg.label}</span>
          <button onClick={onRemove} className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/15 text-destructive opacity-0 transition-opacity hover:bg-destructive/25 group-hover:opacity-100" aria-label="Remover">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground"><span>Progresso</span><span className={item.progresso === 100 ? "text-pink" : "text-foreground"}>{item.progresso}%</span></div>
        <input type="range" min={0} max={100} value={item.progresso} onChange={(e) => onProgress(Number(e.target.value))} className="w-full accent-primary" />
        <Bar value={item.progresso} max={100} />
      </div>
    </div>
  );
}

function EstudosPage() {
  const [livros, setLivros] = useState<ItemEstudo[]>([]);
  const [cursos, setCursos] = useState<ItemEstudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState<"livro" | "curso">("livro");
  const [titulo, setTitulo] = useState("");
  const [detalhe, setDetalhe] = useState("");

  useEffect(() => {
    supabase.from("estudos_items").select("*").order("created_at", { ascending: true }).then(({ data, error }) => {
      if (error) toast.error(error.message);
      else { const items = (data ?? []) as ItemEstudo[]; setLivros(items.filter((i) => i.tipo === "livro")); setCursos(items.filter((i) => i.tipo === "curso")); }
      setLoading(false);
    });
  }, []);

  const adicionar = async () => {
    if (!titulo.trim()) return;
    const payload = { tipo, titulo: titulo.trim(), detalhe: detalhe.trim() || (tipo === "livro" ? "Autor não informado" : "Plataforma não informada"), progresso: 0, status: "andamento" };
    const { data, error } = await supabase.from("estudos_items").insert(payload).select().single();
    if (error) { toast.error(error.message); return; }
    const novo = data as ItemEstudo;
    if (tipo === "livro") setLivros((prev) => [...prev, novo]); else setCursos((prev) => [...prev, novo]);
    setTitulo(""); setDetalhe("");
  };

  const remover = async (id: string, t: "livro" | "curso") => {
    const { error } = await supabase.from("estudos_items").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    if (t === "livro") setLivros((prev) => prev.filter((i) => i.id !== id)); else setCursos((prev) => prev.filter((i) => i.id !== id));
  };

  const updateProgress = async (id: string, t: "livro" | "curso", progresso: number) => {
    const status: StatusEstudo = progresso === 100 ? "concluido" : progresso === 0 ? "nao_iniciado" : "andamento";
    supabase.from("estudos_items").update({ progresso, status }).eq("id", id).then(({ error }) => { if (error) toast.error(error.message); });
    const patch = (prev: ItemEstudo[]) => prev.map((i) => i.id === id ? { ...i, progresso, status } : i);
    if (t === "livro") setLivros(patch); else setCursos(patch);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-pink">Estudos</p>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Liderança e desenvolvimento</h1>
      </div>
      <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Adicione um item</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[140px_1fr_1fr_auto]">
          <Select value={tipo} onValueChange={(v) => setTipo(v as "livro" | "curso")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="livro">Livro</SelectItem><SelectItem value="curso">Curso</SelectItem></SelectContent>
          </Select>
          <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={tipo === "livro" ? "Nome do livro" : "Nome do curso"} />
          <Input value={detalhe} onChange={(e) => setDetalhe(e.target.value)} placeholder={tipo === "livro" ? "Autor (opcional)" : "Plataforma (opcional)"} />
          <Button onClick={adicionar} className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"><Plus className="mr-1.5 h-3.5 w-3.5" /> Adicionar</Button>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-pink" /><p className="font-bold text-foreground">Livros</p></div>
          <span className="text-xs text-muted-foreground">{livros.length} livro(s)</span>
        </div>
        {loading ? <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : livros.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">Nenhum livro ainda. Adicione um acima.</p> : livros.map((l) => <ItemRow key={l.id} item={l} onRemove={() => remover(l.id, "livro")} onProgress={(p) => updateProgress(l.id, "livro", p)} />)}
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-pink" /><p className="font-bold text-foreground">Cursos</p></div>
          <span className="text-xs text-muted-foreground">{cursos.length} curso(s)</span>
        </div>
        {loading ? <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : cursos.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">Nenhum curso ainda. Adicione um acima.</p> : cursos.map((c) => <ItemRow key={c.id} item={c} onRemove={() => remover(c.id, "curso")} onProgress={(p) => updateProgress(c.id, "curso", p)} />)}
      </div>
      <p className={cn("text-xs text-muted-foreground")}>Salvo automaticamente na nuvem.</p>
    </div>
  );
}
