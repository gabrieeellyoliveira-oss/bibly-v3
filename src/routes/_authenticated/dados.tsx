import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sun, Sunset, Moon, RefreshCw, Bell, CheckCircle2, FileText, Table, X, XCircle, TrendingUp, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MiniMetricCard } from "@/components/dashboard/PrimitivesUI";
import { abrilFallback, historico, STORAGE, type DadosAtual } from "@/data/dashboard";
import { parsearTSV, storageSet, type ParsedPlanilha, calcChange } from "@/lib/dashboardUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dados")({
  component: DadosPage,
});

function getSaudacaoHora() {
  const h = new Date().getHours();
  if (h < 12) return { texto: "Bom dia", icon: Sun, color: "text-warning" };
  if (h < 18) return { texto: "Boa tarde", icon: Sunset, color: "text-pink" };
  return { texto: "Boa noite", icon: Moon, color: "text-primary" };
}

function EvolucaoMensal({ atual }: { atual: DadosAtual }) {
  const todosMeses = [
    ...historico,
    { mes: "Junho", ano: "2026", tier: "Tier 1", m: { leads: atual.leads, opps: atual.opps, ltr: atual.ltr, noshow: atual.noshow, oportunidades: atual.oportunidades, conversao: atual.conversao, whatsapp: atual.whatsapp, video: atual.video }, clientes: atual.clientes },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-pink" />
        <p className="text-base font-bold text-foreground">Evolução Mensal</p>
      </div>
      {todosMeses.map((d, idx) => {
        const prev = idx > 0 ? todosMeses[idx - 1].m : null;
        const isBase = idx === 0;
        const metricas = [
          { label: "OPPs", valor: d.m.opps, prev: prev?.opps },
          { label: "Oportunidades", valor: d.m.oportunidades, prev: prev?.oportunidades },
          { label: "Novos Leads", valor: d.m.leads, prev: prev?.leads },
          { label: "LTR", valor: `${d.m.ltr}%`, prev: prev ? `${prev.ltr}%` : null, prevNum: prev?.ltr },
          { label: "No-show", valor: `${d.m.noshow}%`, prev: prev ? `${prev.noshow}%` : null, prevNum: prev?.noshow, inverso: true },
          { label: "Clientes", valor: d.clientes, prev: prev ? todosMeses[idx - 1].clientes : null },
          { label: "Conversão", valor: `${d.m.conversao}%`, prev: prev ? `${prev.conversao}%` : null, prevNum: prev?.conversao },
          { label: "WhatsApp", valor: d.m.whatsapp, prev: prev?.whatsapp },
          { label: "Vídeo", valor: d.m.video, prev: prev?.video },
        ];
        return (
          <div key={d.mes} className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-pink" />
              <p className="font-semibold text-foreground">{d.mes}</p>
              {isBase && <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">Base inicial</span>}
              {idx === todosMeses.length - 1 && !isBase && <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">Em andamento</span>}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {metricas.map((m) => {
                const curNum = typeof m.valor === "string" ? parseFloat(m.valor) : m.valor;
                const prevNum = (m as { prevNum?: number }).prevNum ?? (typeof m.prev === "number" ? m.prev : null);
                const delta = !isBase && prevNum != null ? calcChange(curNum, prevNum, (m as { inverso?: boolean }).inverso) : null;
                return <MiniMetricCard key={m.label} label={m.label} valor={m.valor} prev={isBase ? null : m.prev} delta={delta} />;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DadosPage() {
  const s = getSaudacaoHora();
  const Icon = s.icon;
  const horaAtual = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const dataAtual = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const [planilha, setPlanilha] = useState<ParsedPlanilha | null>(null);
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    supabase.from("dashboard_planilha").select("dados").eq("id", "singleton").maybeSingle().then(({ data }) => {
      if (data) { setPlanilha(data.dados as ParsedPlanilha); storageSet(STORAGE.PLANILHA, data.dados); }
      setLoading(false);
    });
  }, []);

  const atual: DadosAtual = {
    ...abrilFallback, ...(planilha?.atual ?? {}),
    metas: { ...abrilFallback.metas, ...(planilha?.metas?.m1 != null ? { m1: planilha.metas.m1 } : {}), ...(planilha?.metas?.m2 != null ? { m2: planilha.metas.m2 } : {}), ...(planilha?.metas?.m3 != null ? { m3: planilha.metas.m3 } : {}) },
  };

  const handleProcessar = async () => {
    setErro("");
    if (!texto.trim()) { setErro("Cole os dados da planilha no campo acima."); return; }
    const dados = parsearTSV(texto);
    if (!dados) { setErro("Não foi possível reconhecer os dados. Copie diretamente do Google Sheets ou Excel."); return; }
    const { error } = await supabase.from("dashboard_planilha").upsert({ id: "singleton", dados, updated_at: new Date().toISOString() });
    if (error) { setErro("Erro ao salvar: " + error.message); return; }
    setPlanilha(dados); storageSet(STORAGE.PLANILHA, dados); setTexto("");
    toast.success("Planilha importada — métricas atualizadas!");
  };

  const handleLimpar = async () => {
    await supabase.from("dashboard_planilha").delete().eq("id", "singleton");
    setPlanilha(null); storageSet(STORAGE.PLANILHA, null); setTexto(""); setErro("");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-pink">Dados</p>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Performance e planilha</h1>
      </div>
      <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/40 p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
              <Icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xl font-bold text-foreground">{s.texto}, Gabi!</p>
                <span className={`rounded-full bg-secondary px-2.5 py-1 text-xs font-bold ${s.color}`}>{horaAtual}</span>
              </div>
              <p className="mt-1 text-xs capitalize text-muted-foreground">{dataAtual}</p>
              <p className="mt-2 text-sm text-muted-foreground">Dá um pulinho na planilha pra atualizar os números do dia.</p>
            </div>
          </div>
          <Button onClick={() => document.getElementById("secao-planilha")?.scrollIntoView({ behavior: "smooth" })} className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
            <RefreshCw className="mr-2 h-4 w-4" /> Atualizar métricas
          </Button>
        </div>
        {loading ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-secondary/20 px-4 py-3"><Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" /><p className="text-xs text-muted-foreground">Carregando dados...</p></div>
        ) : !planilha ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3"><Bell className="h-3.5 w-3.5 text-primary" /><p className="text-xs text-foreground/80">Nenhum dado importado ainda. Clique em <strong className="text-primary">"Atualizar métricas"</strong>.</p></div>
        ) : (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3"><CheckCircle2 className="h-3.5 w-3.5 text-success" /><p className="text-xs text-success">Dados atualizados até <strong>{atual.atualizadoAte}</strong>.</p></div>
        )}
      </div>
      <EvolucaoMensal atual={atual} />
      <div id="secao-planilha" className="space-y-5 pt-4">
        <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Table className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">Importar dados da planilha</p>
            <p className="mt-1 text-sm text-muted-foreground">Abra sua planilha no Google Sheets, selecione tudo (Ctrl+A), copie (Ctrl+C) e cole abaixo.</p>
          </div>
        </div>
        <Textarea value={texto} onChange={(e) => { setTexto(e.target.value); setErro(""); }} placeholder="Cole aqui os dados copiados da planilha..." rows={8} className="min-h-[180px] resize-y border-border bg-card font-mono text-sm" />
        {erro && <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3"><XCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-destructive" /><p className="text-xs text-destructive">{erro}</p></div>}
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleProcessar} disabled={!texto.trim()} className="flex-1 bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90 disabled:opacity-40">
            <FileText className="mr-2 h-4 w-4" /> Processar dados colados
          </Button>
          {planilha && <Button variant="outline" onClick={handleLimpar} className="border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"><X className="mr-2 h-4 w-4" /> Limpar dados</Button>}
        </div>
        {planilha && (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Preview — dados atuais {planilha.atual?.atualizadoAte ? `· até ${planilha.atual.atualizadoAte}` : ""}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {[{ label: "Clientes", val: planilha.atual?.clientes ?? 0 }, { label: "Novos Leads", val: planilha.atual?.leads ?? 0 }, { label: "OPPs", val: planilha.atual?.opps ?? 0 }, { label: "LTR", val: `${planilha.atual?.ltr ?? 0}%` }, { label: "No-show", val: `${planilha.atual?.noshow ?? 0}%` }, { label: "Oportunidades", val: planilha.atual?.oportunidades ?? 0 }, { label: "Conversão", val: `${planilha.atual?.conversao ?? 0}%` }, { label: "WhatsApp", val: planilha.atual?.whatsapp ?? 0 }, { label: "Vídeo", val: planilha.atual?.video ?? 0 }, { label: "Atualizado até", val: planilha.atual?.atualizadoAte ?? "—" }, { label: "Meta 1", val: planilha.metas?.m1 ?? "—" }, { label: "Meta 2", val: planilha.metas?.m2 ?? "—" }, { label: "Meta 3", val: planilha.metas?.m3 ?? "—" }, { label: "Dias com dados", val: planilha.diario?.length ?? 0 }].map(({ label, val }) => (
                <div key={label} className="rounded-xl border border-border bg-card/60 p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="bg-gradient-hero bg-clip-text text-lg font-bold text-transparent">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
