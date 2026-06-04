import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { TrendingUp, CheckCircle2, XCircle, Award, Loader2, Star } from "lucide-react";
import { Bar } from "@/components/dashboard/PrimitivesUI";
import { TIER_CFG, type HistoricoMes } from "@/data/dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/historia")({
  component: HistoriaPage,
});

function HistoriaPage() {
  const [historico, setHistorico] = useState<HistoricoMes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("historia_meses").select("*").order("ordem", { ascending: true }).then(({ data, error }) => {
      if (error) toast.error(error.message);
      else {
        const meses: HistoricoMes[] = (data ?? []).map((r: any) => ({
          mes: r.mes, ano: r.ano, tier: r.tier, clientes: r.clientes,
          metas: { m1: r.meta_m1, m2: r.meta_m2, m3: r.meta_m3 }, megaMeta: r.mega_meta ?? null,
          m: { leads: r.leads, opps: r.opps, ltr: r.ltr, noshow: r.noshow, oportunidades: r.oportunidades, conversao: r.conversao, whatsapp: r.whatsapp, video: r.video },
          conclusao: { texto: r.conclusao_texto, cor: r.conclusao_cor, tipo: r.conclusao_tipo },
        }));
        setHistorico(meses);
      }
      setLoading(false);
    });
  }, []);

  const primeiro = historico[0]; const ultimo = historico[historico.length - 1];
  const crescPct = primeiro && ultimo ? Math.round(((ultimo.clientes - primeiro.clientes) / primeiro.clientes) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-pink">Jornada</p>
        <h1 className="text-2xl font-black tracking-tight text-foreground">História de Sucesso</h1>
        <p className="text-sm text-muted-foreground">Evolução de performance mês a mês — alimentada conforme a jornada avança.</p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="flex items-center gap-2"><Star className="h-4 w-4 text-warning" /><p className="text-base font-bold text-foreground">Promoções</p></div>
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-warning/40 bg-warning/10 px-5 py-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-warning/20 text-warning"><Star className="h-6 w-6 fill-warning" /></div>
            <div>
              <p className="text-sm font-extrabold text-warning">Promovida a SDR Jr II — Maio 2026</p>
              <p className="text-xs text-muted-foreground mt-0.5">Reconhecimento oficial pela evolução de performance e consistência de resultados.</p>
            </div>
          </div>
          {primeiro && ultimo && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-pink" />
              <p className="text-base font-bold text-foreground">Evolução de Performance — <span className="text-muted-foreground">{primeiro.tier}</span><span className="mx-1 text-muted-foreground/60">→</span><span className="text-success">{ultimo.tier}</span></p>
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {historico.map((d) => {
              const allMetas = [{ label: "Meta 1", val: d.metas.m1 }, { label: "Meta 2", val: d.metas.m2 }, { label: "Meta 3", val: d.metas.m3 }, ...(d.megaMeta ? [{ label: "Mega Meta 1", val: d.megaMeta }] : [])];
              const maxMeta = d.megaMeta ?? d.metas.m3;
              const tierCfg = TIER_CFG[d.tier] ?? TIER_CFG["Tier 4/5"];
              return (
                <div key={`${d.mes}-${d.ano}`} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card transition-all hover:border-primary/40">
                  <div className="flex flex-wrap items-start justify-between gap-1">
                    <div><p className="font-bold text-foreground">{d.mes}</p><p className="text-xs text-muted-foreground/70">{d.ano}</p></div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">Finalizado</span>
                      <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: tierCfg.bg, color: tierCfg.text }}>{d.tier}</span>
                    </div>
                  </div>
                  <div className="py-1 text-center"><p className="text-5xl font-extrabold leading-none" style={{ color: d.conclusao.cor }}>{d.clientes}</p><p className="mt-1 text-xs text-muted-foreground">clientes entregues</p></div>
                  <div className="space-y-1"><Bar value={d.clientes} max={maxMeta} /><div className="flex justify-between text-xs text-muted-foreground/70"><span>0</span><span>{d.megaMeta ? "Mega Meta 1" : "Meta 3"}: {maxMeta}</span></div></div>
                  <div className="flex-1 space-y-1.5">
                    {allMetas.map(({ label, val }) => {
                      const batida = d.clientes >= val;
                      return (
                        <div key={label} className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">{batida ? <CheckCircle2 className="h-3 w-3 text-success" /> : <XCircle className="h-3 w-3 text-destructive" />}{label}: {val}</span>
                          <span className={batida ? "text-success" : "text-destructive"}>{d.clientes}/{val}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="rounded-lg px-3 py-2 text-center" style={{ backgroundColor: `${d.conclusao.cor}22`, border: `1px solid ${d.conclusao.cor}55` }}>
                    <p className="text-xs font-semibold" style={{ color: d.conclusao.cor }}>{d.conclusao.tipo === "fail" ? "✕ " : d.conclusao.tipo === "mega" ? "★ " : "✓ "}{d.conclusao.texto}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {primeiro && ultimo && (
            <div className="flex items-center gap-3 rounded-xl border border-success/40 bg-success/10 px-5 py-3">
              <Award className="h-4 w-4 text-success" />
              <p className="text-sm font-semibold text-success">De {primeiro.tier} ({primeiro.clientes} clientes)<span className="text-success/80"> → </span>{ultimo.tier} ({ultimo.clientes} clientes)<span className="text-success/80"> · +{crescPct}% em {historico.length} meses</span></p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
