import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Target, Calendar, TrendingUp, Plus, Minus, Save, Users, PhoneOff, CheckCircle2, Video, MessageSquare, Award, XCircle, Settings } from "lucide-react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Bar, MetricCard } from "@/components/dashboard/PrimitivesUI";
import { abrilFallback, abrilDiarioFallback, historico, STORAGE, type DadosAtual, type DadosDiarios, TIER_CFG } from "@/data/dashboard";
import { pct, calcDiasUteisRestantes, calcDiasUteisMesAte, calcFechamentosSemana, getDeadlineMes, getInicioSemana, storageGet, storageSet, getSaudacao } from "@/lib/dashboardUtils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/metas")({
  component: MetasPage,
});

interface RegistroGanho { id: number; data: string; quantidade: number; obs: string; }
let nextId = 1;

function StatusMeta({ clientesTotal, dados, onAdd, onRemove, onSave, saved, onEditMetas }: {
  clientesTotal: number; dados: DadosAtual; onAdd: () => void; onRemove: () => void;
  onSave: () => void; saved: boolean; onEditMetas: () => void;
}) {
  const { metas, diaAtual } = dados;
  const deadline = getDeadlineMes();
  const diasUteisRest = calcDiasUteisRestantes(deadline ?? undefined);
  const diasUteisNoMes = calcDiasUteisMesAte(deadline ?? undefined);
  const diasUteisDecorridos = Math.max(diasUteisNoMes - diasUteisRest, 1);
  const projecaoFinal = Math.round((clientesTotal / diasUteisDecorridos) * diasUteisNoMes);
  const esperadoHoje = Math.round((metas.m3 / diasUteisNoMes) * diaAtual);
  const emRitmo = clientesTotal >= esperadoHoje;
  const pctRitmo = esperadoHoje > 0 ? (clientesTotal / esperadoHoje) * 100 : 0;
  const forecastNivel = pctRitmo >= 100 ? 3 : pctRitmo >= 80 ? 2 : 1;
  const nec = (meta: number) => Math.max(Math.ceil((meta - clientesTotal) / Math.max(diasUteisRest, 1)), 0);
  const { diasRestantesSemana, fechPorSemana, semanaEncerrada } = calcFechamentosSemana(metas, diasUteisNoMes);
  const chave = `ravenna_semana_${getInicioSemana().toISOString().slice(0, 10)}`;
  const feitosEstaSemana = (storageGet<number>(chave) ?? 0);
  const necessarioM3 = Math.max(Math.ceil((metas.m3 / diasUteisNoMes) * diasRestantesSemana) - feitosEstaSemana, 0);

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-pink" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Meta do Mês — Status</p>
          <button onClick={onEditMetas} className="ml-1 rounded-md p-1 text-muted-foreground/50 hover:bg-secondary hover:text-muted-foreground transition-colors">
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className={cn("rounded-full border px-3 py-1 text-xs font-bold", emRitmo ? "border-primary bg-primary/15 text-primary" : "border-destructive bg-destructive/15 text-destructive")}>
          {emRitmo ? "No Ritmo" : "Atrasado"}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-3">
          <span className="bg-gradient-hero bg-clip-text text-6xl font-extrabold text-transparent">{clientesTotal}</span>
          <span className="text-2xl font-light text-muted-foreground">/ {metas.m3}</span>
        </div>
        <p className={cn("text-sm font-bold", forecastNivel === 3 ? "text-success" : forecastNivel === 2 ? "text-warning" : "text-pink")}>
          {forecastNivel === 3 ? "Você está no forecast da Meta 3 🏆" : forecastNivel === 2 ? "Você está no forecast da Meta 2 🎯" : "Você está no forecast da Meta 1"}
        </p>
      </div>
      <div className="relative pb-12 pt-7">
        {[{ label: "M1", val: metas.m1 }, { label: "M2", val: metas.m2 }].map(({ label, val }) => (
          <div key={label} className="absolute top-0 flex flex-col items-center" style={{ left: `${pct(val, metas.m3)}%`, transform: "translateX(-50%)" }}>
            <span className="text-xs text-muted-foreground">{label}</span>
            <div className="h-5 w-px bg-border" />
          </div>
        ))}
        <div className="absolute top-0 z-10 flex flex-col items-center transition-[left] duration-700" style={{ left: `${Math.min(pct(clientesTotal, metas.m3), 100)}%`, transform: "translateX(-50%)" }}>
          <span className="text-sm font-bold text-warning">{clientesTotal}</span>
          <div className="h-5 w-px bg-warning" />
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-gradient-primary shadow-glow transition-[width] duration-700" style={{ width: `${pct(clientesTotal, metas.m3)}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[{ label: "META 1", val: metas.m1 }, { label: "META 2", val: metas.m2 }, { label: "META 3 ★", val: metas.m3 }].map(({ label, val }) => {
          const n = nec(val); const falta = Math.max(val - clientesTotal, 0);
          return (
            <div key={label} className="rounded-xl border border-border bg-card/60 p-4">
              <p className="mb-0.5 text-xs font-bold tracking-wide text-muted-foreground">{label}</p>
              <p className="text-xs text-muted-foreground/70">{val} fechamentos</p>
              <p className={cn("mt-2 text-3xl font-extrabold", n === 0 ? "text-success" : "text-pink")}>
                {n === 0 ? "✓" : n}{n > 0 && <span className="ml-1 text-base font-normal text-muted-foreground">/dia</span>}
              </p>
              {falta > 0 ? <p className="mt-1.5 text-xs font-semibold text-muted-foreground">Falta <span className="font-extrabold text-pink">{falta}</span> pra meta</p> : <p className="mt-1.5 text-xs font-semibold text-success">✓ Meta atingida!</p>}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2">
          <span className="text-xs font-bold uppercase text-muted-foreground">Projeção Final</span>
          <span className={cn("text-lg font-extrabold", projecaoFinal >= metas.m3 ? "text-success" : "text-destructive")}>{projecaoFinal}</span>
          <span className="text-xs text-muted-foreground/70">/ {metas.m3}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2">
          <span className="text-xs font-bold uppercase text-muted-foreground">Dias Restantes</span>
          <span className="text-lg font-extrabold text-foreground">{diasUteisRest}</span>
          <span className="text-xs text-muted-foreground/70">úteis</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Calendar className={cn("h-3.5 w-3.5 flex-shrink-0", semanaEncerrada ? "text-primary" : necessarioM3 === 0 ? "text-success" : "text-pink")} />
          <p className={cn("text-xs font-semibold", semanaEncerrada ? "text-primary" : necessarioM3 === 0 ? "text-success" : "text-foreground")}>
            {semanaEncerrada ? "Final de semana chegou — descansa, Gabi" : necessarioM3 === 0 ? `✓ Meta da semana batida! (${feitosEstaSemana}/${fechPorSemana})` : `Faltam ${necessarioM3} fechamentos na semana pro forecast da Meta 3`}
          </p>
        </div>
        {!semanaEncerrada && <span className="text-xs text-muted-foreground/70">{feitosEstaSemana}/{fechPorSemana} esta semana · {diasRestantesSemana} dia(s)</span>}
      </div>
      <div className="space-y-2 border-t border-border pt-4">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={onRemove} className="border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive">
            <Minus className="mr-1.5 h-3.5 w-3.5" /> -1 ganho
          </Button>
          <Button onClick={onAdd} className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> +1 ganho
          </Button>
        </div>
        <Button variant="ghost" onClick={onSave} className={cn("w-full", saved && "bg-success/15 text-success hover:bg-success/20 hover:text-success")}>
          <Save className="mr-1.5 h-3.5 w-3.5" />{saved ? "✓ Salvo!" : "Salvar ganhos"}
        </Button>
      </div>
    </div>
  );
}

function EvolucaoChart({ diario, metaM3, diasTotal }: { diario: DadosDiarios[]; metaM3: number; diasTotal: number }) {
  const data = diario.map((d, i) => ({ dia: d.dia, acumulado: d.clientes, noDia: d.noDia, metaIdeal: Math.round((metaM3 / diasTotal) * (i + 1)) }));
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-bold text-foreground">Evolução de Fechamentos</p>
          <p className="text-xs text-muted-foreground">Acumulado diário no mês</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-5 rounded bg-primary" /> Acumulado</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-5 rounded bg-pink" /> No dia</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--pink))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--pink))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="dia" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} labelStyle={{ color: "hsl(var(--muted-foreground))" }} />
          <Area type="monotone" dataKey="acumulado" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#gA)" dot={{ r: 3, fill: "hsl(var(--primary))" }} name="Acumulado" />
          <Area type="monotone" dataKey="noDia" stroke="hsl(var(--pink))" strokeWidth={1.5} fill="url(#gP)" strokeDasharray="5 3" dot={false} name="No dia" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function EvolucaoPerformance() {
  const primeiro = historico[0]; const ultimo = historico[historico.length - 1];
  const crescPct = Math.round(((ultimo.clientes - primeiro.clientes) / primeiro.clientes) * 100);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-pink" />
        <p className="text-base font-bold text-foreground">Evolução de Performance — <span className="text-muted-foreground">{primeiro.tier}</span><span className="mx-1 text-muted-foreground/60">→</span><span className="text-success">{ultimo.tier}</span></p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {historico.map((d) => {
          const allMetas = [{ label: "Meta 1", val: d.metas.m1 }, { label: "Meta 2", val: d.metas.m2 }, { label: "Meta 3", val: d.metas.m3 }, ...(d.megaMeta ? [{ label: "Mega Meta 1", val: d.megaMeta }] : [])];
          const maxMeta = d.megaMeta ?? d.metas.m3;
          const tierCfg = TIER_CFG[d.tier] ?? TIER_CFG["Tier 4/5"];
          return (
            <div key={d.mes} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card transition-all hover:border-primary/40">
              <div className="flex flex-wrap items-start justify-between gap-1">
                <div><p className="font-bold text-foreground">{d.mes}</p><p className="text-xs text-muted-foreground/70">{d.ano}</p></div>
                <div className="flex flex-col items-end gap-1">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">Finalizado</span>
                  <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: tierCfg.bg, color: tierCfg.text }}>{d.tier}</span>
                </div>
              </div>
              <div className="py-1 text-center">
                <p className="text-5xl font-extrabold leading-none" style={{ color: d.conclusao.cor }}>{d.clientes}</p>
                <p className="mt-1 text-xs text-muted-foreground">clientes entregues</p>
              </div>
              <div className="space-y-1">
                <Bar value={d.clientes} max={maxMeta} />
                <div className="flex justify-between text-xs text-muted-foreground/70"><span>0</span><span>{d.megaMeta ? "Mega Meta 1" : "Meta 3"}: {maxMeta}</span></div>
              </div>
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
      <div className="flex items-center gap-3 rounded-xl border border-success/40 bg-success/10 px-5 py-3">
        <Award className="h-4 w-4 text-success" />
        <p className="text-sm font-semibold text-success">De {primeiro.tier} ({primeiro.clientes} clientes)<span className="text-success/80"> → </span>{ultimo.tier} ({ultimo.clientes} clientes)<span className="text-success/80"> · +{crescPct}% em {historico.length} meses</span></p>
      </div>
    </div>
  );
}

function MetasPage() {
  const dadosPlanilha = storageGet<{ atual?: Partial<DadosAtual>; metas?: { m1?: number; m2?: number; m3?: number }; diario?: DadosDiarios[] }>(STORAGE.PLANILHA);
  const [metasOverride, setMetasOverride] = useState<{ m1: number; m2: number; m3: number } | null>(null);
  const [metasDialogOpen, setMetasDialogOpen] = useState(false);
  const [editM1, setEditM1] = useState(""); const [editM2, setEditM2] = useState(""); const [editM3, setEditM3] = useState("");
  const [metasSaving, setMetasSaving] = useState(false);

  useEffect(() => {
    supabase.from("dashboard_metas").select("m1, m2, m3").eq("id", "singleton").maybeSingle().then(({ data }) => {
      if (data) setMetasOverride({ m1: data.m1, m2: data.m2, m3: data.m3 });
    });
  }, []);

  const metasBase = { m1: dadosPlanilha?.metas?.m1 ?? abrilFallback.metas.m1, m2: dadosPlanilha?.metas?.m2 ?? abrilFallback.metas.m2, m3: dadosPlanilha?.metas?.m3 ?? abrilFallback.metas.m3 };
  const metasAtivas = metasOverride ?? metasBase;
  const dadosAtual: DadosAtual = { ...abrilFallback, ...(dadosPlanilha?.atual ?? {}), metas: metasAtivas };
  const diarioAtual = (dadosPlanilha?.diario && dadosPlanilha.diario.length > 0) ? dadosPlanilha.diario : abrilDiarioFallback;

  const handleSaveMetas = async () => {
    const m1 = Number(editM1) || 0; const m2 = Number(editM2) || 0; const m3 = Number(editM3) || 0;
    setMetasSaving(true);
    await supabase.from("dashboard_metas").upsert({ id: "singleton", m1, m2, m3, updated_at: new Date().toISOString() });
    setMetasOverride({ m1, m2, m3 }); setMetasSaving(false); setMetasDialogOpen(false);
    toast.success("Metas salvas!");
  };

  const deadlineMes = getDeadlineMes();
  const diasUteisNoMesAtual = calcDiasUteisMesAte(deadlineMes ?? undefined);
  const [registros, setRegistros] = useState<RegistroGanho[]>(() => storageGet<RegistroGanho[]>(STORAGE.GANHOS) ?? []);
  const [saved, setSaved] = useState(false);
  const totalManual = registros.reduce((s, r) => s + r.quantidade, 0);
  const clientesTotal = dadosAtual.clientes + totalManual;
  const saudacao = getSaudacao();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (syncedRef.current) return; syncedRef.current = true;
    supabase.from("dashboard_ganhos").select("*").eq("perfil", "bibi").order("created_at", { ascending: true }).then(({ data }) => {
      if (data && data.length > 0) {
        const remoto: RegistroGanho[] = data.map((r: any) => ({ id: r.id, data: r.data_ganho, quantidade: r.quantidade, obs: r.obs ?? "" }));
        setRegistros(remoto); storageSet(STORAGE.GANHOS, remoto);
      }
    });
  }, []);

  useEffect(() => { storageSet(STORAGE.GANHOS, registros); }, [registros]);

  const handleAdd = async () => {
    const dataHoje = new Date().toLocaleDateString("pt-BR");
    const { data } = await supabase.from("dashboard_ganhos").insert({ perfil: "bibi", data_ganho: dataHoje, quantidade: 1, obs: "Ajuste rápido" }).select().single();
    const novoId = data?.id ?? nextId++;
    setRegistros((prev) => [...prev, { id: novoId, data: dataHoje, quantidade: 1, obs: "Ajuste rápido" }]);
    const chave = `ravenna_semana_${getInicioSemana().toISOString().slice(0, 10)}`;
    storageSet(chave, (storageGet<number>(chave) ?? 0) + 1);
  };

  const handleRemove = async () => {
    if (registros.length === 0) return;
    const ultimo = registros[registros.length - 1];
    await supabase.from("dashboard_ganhos").delete().eq("id", ultimo.id);
    setRegistros((prev) => prev.slice(0, -1));
    const chave = `ravenna_semana_${getInicioSemana().toISOString().slice(0, 10)}`;
    storageSet(chave, Math.max((storageGet<number>(chave) ?? 0) - 1, 0));
  };

  const handleSave = () => { storageSet(STORAGE.GANHOS, registros); setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-pink">Metas · {saudacao}</p>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Olá, Gabi</h1>
          <p className="text-sm text-muted-foreground">Acompanhe metas, forecast e ganhos do mês em tempo real.</p>
        </div>
      </div>
      <StatusMeta clientesTotal={clientesTotal} dados={dadosAtual} onAdd={handleAdd} onRemove={handleRemove} onSave={handleSave} saved={saved} onEditMetas={() => { setEditM1(String(metasAtivas.m1 || "")); setEditM2(String(metasAtivas.m2 || "")); setEditM3(String(metasAtivas.m3 || "")); setMetasDialogOpen(true); }} />
      <Dialog open={metasDialogOpen} onOpenChange={setMetasDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Editar Metas do Mês</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {[{ label: "Meta 1", value: editM1, onChange: setEditM1 }, { label: "Meta 2", value: editM2, onChange: setEditM2 }, { label: "Meta 3 ★", value: editM3, onChange: setEditM3 }].map(({ label, value, onChange }) => (
              <div key={label} className="flex items-center gap-4">
                <span className="w-20 text-sm font-semibold text-foreground">{label}</span>
                <Input type="number" min={0} value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" className="flex-1" />
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild><Button variant="outline" size="sm">Cancelar</Button></DialogClose>
            <Button size="sm" onClick={handleSaveMetas} disabled={metasSaving} className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">{metasSaving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <EvolucaoChart diario={diarioAtual} metaM3={dadosAtual.metas.m3} diasTotal={diasUteisNoMesAtual} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard title="Novos Leads" value={dadosAtual.leads} sub={`Até ${dadosAtual.atualizadoAte}`} icon={Users} />
        <MetricCard title="OPPs" value={dadosAtual.opps} sub={`Até ${dadosAtual.atualizadoAte}`} icon={Target} />
        <MetricCard title="LTR" value={`${dadosAtual.ltr}%`} sub="Lead-to-reply" icon={TrendingUp} trend="up" />
        <MetricCard title="No-show" value={`${dadosAtual.noshow}%`} sub="↓ Taxa de no-show" icon={PhoneOff} trend="down" />
        <MetricCard title="Clientes" value={dadosAtual.clientes} sub={`Até ${dadosAtual.atualizadoAte}`} icon={CheckCircle2} />
        <MetricCard title="Oportunidades" value={dadosAtual.oportunidades} sub={`Até ${dadosAtual.atualizadoAte}`} icon={Calendar} />
        <MetricCard title="Vídeo Chamada" value={dadosAtual.video} sub={`Até ${dadosAtual.atualizadoAte}`} icon={Video} />
        <MetricCard title="WhatsApp Opps" value={dadosAtual.whatsapp} sub={`Até ${dadosAtual.atualizadoAte}`} icon={MessageSquare} />
        <MetricCard title="Conversão" value={`${dadosAtual.conversao}%`} sub="Sobre OPPs" icon={Award} />
      </div>
      <EvolucaoPerformance />
    </div>
  );
}
