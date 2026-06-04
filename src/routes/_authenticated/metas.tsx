import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Target, Settings, Plus, Minus, Save, Trophy, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/use-profile";
import {
  calcDiasUteisRestantes, calcDiasUteisTotaisMes, calcDiasUteisDecorridos,
  hojeISO, rangeMesAtual, saudacao, formatarDataPtBr,
} from "@/lib/dias-uteis";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export const Route = createFileRoute("/_authenticated/metas")({
  head: () => ({ meta: [{ title: "Metas — Bibly" }] }),
  component: MetasPage,
});

function MetasPage() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  const nome = profile?.display_name ?? "Gabi";

  const { data: metas } = useQuery({
    queryKey: ["metas"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("dashboard_metas").select("*").eq("id", "singleton").maybeSingle();
      return (data as any) ?? { m1: 121, m2: 135, m3: 141 };
    },
  });

  const { data: ganhos } = useQuery({
    queryKey: ["ganhos-mes"],
    queryFn: async () => {
      const { start, end } = rangeMesAtual();
      const { data } = await supabase
        .from("dashboard_ganhos")
        .select("*")
        .gte("data_ganho", start).lte("data_ganho", end)
        .order("data_ganho");
      return (data ?? []) as any[];
    },
  });

  const M1 = metas?.m1 ?? 121, M2 = metas?.m2 ?? 135, M3 = metas?.m3 ?? 141;
  const clientesTotal = (ganhos ?? []).reduce((s, g) => s + (g.quantidade ?? 1), 0);
  const diasRest = calcDiasUteisRestantes();
  const diasTotais = calcDiasUteisTotaisMes();
  const diaAtual = calcDiasUteisDecorridos();
  const projecao = diaAtual > 0 ? Math.round((clientesTotal / diaAtual) * diasTotais) : 0;
  const esperadoHoje = (M3 / diasTotais) * diaAtual;
  const pctRitmo = esperadoHoje > 0 ? (clientesTotal / esperadoHoje) * 100 : 0;

  let tier: { label: string; cls: string };
  if (pctRitmo >= 100) tier = { label: "No Ritmo da Meta 3 🏆", cls: "bg-success/20 text-success border-success/40" };
  else if (pctRitmo >= 80) tier = { label: "No Ritmo da Meta 2", cls: "bg-pink/20 text-pink border-pink/40" };
  else if (pctRitmo >= 60) tier = { label: "No Ritmo da Meta 1", cls: "bg-primary/20 text-primary border-primary/40" };
  else tier = { label: "Abaixo do Ritmo", cls: "bg-destructive/20 text-destructive border-destructive/40" };

  const nec = (m: number) => clientesTotal >= m ? 0 : Math.ceil(((m - clientesTotal) / Math.max(diasRest, 1)) * 10) / 10;

  // Chart data
  const chartData = useMemo(() => {
    if (!ganhos) return [];
    const byDay: Record<string, number> = {};
    ganhos.forEach((g) => { byDay[g.data_ganho] = (byDay[g.data_ganho] ?? 0) + (g.quantidade ?? 1); });
    const { start, end } = rangeMesAtual();
    const startD = new Date(start), endD = new Date(end);
    const arr: { dia: string; diario: number; acumulado: number }[] = [];
    let acc = 0;
    for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
      const iso = hojeISO(d);
      const v = byDay[iso] ?? 0;
      acc += v;
      arr.push({ dia: iso.slice(8), diario: v, acumulado: acc });
    }
    return arr;
  }, [ganhos]);

  async function addGanho() {
    const { error } = await (supabase as any).from("dashboard_ganhos").insert({ perfil: "bibi", data_ganho: hojeISO(), quantidade: 1 });
    if (error) return toast.error(error.message);
    toast.success("+1 ganho!");
    qc.invalidateQueries({ queryKey: ["ganhos-mes"] });
  }
  async function removeGanho() {
    const { data } = await (supabase as any).from("dashboard_ganhos").select("id").eq("data_ganho", hojeISO()).order("id", { ascending: false }).limit(1);
    if (!data?.length) return toast.warning("Nenhum ganho hoje.");
    const { error } = await (supabase as any).from("dashboard_ganhos").delete().eq("id", (data[0] as any).id);
    if (error) return toast.error(error.message);
    toast.success("-1 ganho");
    qc.invalidateQueries({ queryKey: ["ganhos-mes"] });
  }

  async function salvarMetas(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const { error } = await (supabase as any).from("dashboard_metas").upsert({
      id: "singleton",
      m1: Number(fd.get("m1")), m2: Number(fd.get("m2")), m3: Number(fd.get("m3")),
      mes: new Date().toISOString().slice(0, 7),
    }, { onConflict: "id" });
    if (error) return toast.error(error.message);
    toast.success("Metas atualizadas!");
    qc.invalidateQueries({ queryKey: ["metas"] });
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        breadcrumb={<>METAS · {saudacao().toUpperCase()}</>}
        title={<>{saudacao()}, <span className="text-gradient">{nome}</span> 👋</>}
        subtitle="Acompanhe metas, forecast e ganhos do mês em tempo real."
      />

      <Card className="shadow-card border-border bg-card overflow-hidden animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              <Target className="h-4 w-4 text-pink" /> Meta do Mês — Status
              <Dialog>
                <DialogTrigger asChild><Button size="icon" variant="ghost" className="h-6 w-6"><Settings className="h-3 w-3" /></Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Editar Metas</DialogTitle></DialogHeader>
                  <form onSubmit={salvarMetas} className="space-y-3">
                    <div><Label>Meta 1</Label><Input name="m1" type="number" defaultValue={M1} /></div>
                    <div><Label>Meta 2</Label><Input name="m2" type="number" defaultValue={M2} /></div>
                    <div><Label>Meta 3</Label><Input name="m3" type="number" defaultValue={M3} /></div>
                    <DialogFooter><Button type="submit" className="bg-gradient-primary text-white">Salvar</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <Badge className={`rounded-full border ${tier.cls}`}>{tier.label}</Badge>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-7xl md:text-8xl font-bold text-gradient transition-all duration-700">{clientesTotal}</span>
            <span className="text-3xl text-muted-foreground">/ {M3}</span>
          </div>
          <p className="mt-2 text-sm text-success font-medium">
            Você está {pctRitmo >= 60 ? "no forecast" : "abaixo do forecast"} da Meta {pctRitmo >= 100 ? 3 : pctRitmo >= 80 ? 2 : 1} <Trophy className="inline h-4 w-4" />
          </p>

          {/* progress bar with markers */}
          <div className="relative h-3 bg-secondary rounded-full mt-6">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-primary rounded-full shadow-glow transition-all duration-700"
              style={{ width: `${Math.min(100, (clientesTotal / M3) * 100)}%` }}
            />
            {[
              { v: clientesTotal, label: String(clientesTotal), color: "text-warning", pos: (clientesTotal / M3) * 100 },
              { v: M1, label: "M1", color: "text-muted-foreground", pos: (M1 / M3) * 100 },
              { v: M2, label: "M2", color: "text-muted-foreground", pos: (M2 / M3) * 100 },
            ].map((m, i) => (
              <div key={i} className="absolute -top-5" style={{ left: `${Math.min(100, m.pos)}%`, transform: "translateX(-50%)" }}>
                <span className={`text-xs font-semibold ${m.color}`}>{m.label}</span>
              </div>
            ))}
          </div>

          {/* 3 metas */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            {[{ n: 1, m: M1, fech: "121 fechamentos" }, { n: 2, m: M2, fech: "135 fechamentos" }, { n: 3, m: M3, fech: "141 fechamentos", star: true }].map((c) => {
              const v = nec(c.m);
              const batida = v === 0;
              return (
                <Card key={c.n} className="bg-secondary/40 border-border">
                  <CardContent className="p-4">
                    <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">META {c.n} {c.star && "★"}</div>
                    <div className="text-xs text-muted-foreground mt-1">{c.fech}</div>
                    {batida ? (
                      <div className="text-2xl font-bold text-success mt-3">✓ Batida</div>
                    ) : (
                      <div className="mt-3">
                        <span className="text-4xl font-bold text-pink">{v}</span>
                        <span className="text-muted-foreground"> /dia</span>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-2">Falta <b className="text-foreground">{Math.max(0, c.m - clientesTotal)}</b> pra meta</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* projeção + dias */}
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Card className="bg-secondary/40 border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">PROJEÇÃO FINAL</span>
                <div><span className="text-2xl font-bold text-destructive">{projecao}</span><span className="text-muted-foreground"> / {M3}</span></div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/40 border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">DIAS RESTANTES</span>
                <div><span className="text-2xl font-bold">{diasRest}</span><span className="text-muted-foreground"> úteis</span></div>
              </CardContent>
            </Card>
          </div>

          {/* banner semanal */}
          <Card className="mt-4 border-success/30 bg-success/10">
            <CardContent className="p-3 flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-success" />
              <span className="text-success font-medium">Meta da semana batida! ({clientesTotal}/34)</span>
              <span className="ml-auto text-xs text-muted-foreground">{clientesTotal}/34 esta semana</span>
            </CardContent>
          </Card>

          {/* botões */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button onClick={removeGanho} variant="outline" className="h-12 border-destructive/40 text-destructive hover:bg-destructive/10">
              <Minus className="h-4 w-4" /> -1 ganho
            </Button>
            <Button onClick={addGanho} className="h-12 bg-gradient-primary text-white shadow-glow">
              <Plus className="h-4 w-4" /> +1 ganho
            </Button>
          </div>
          <div className="text-center mt-3">
            <Button variant="ghost" size="sm" onClick={() => toast.success("Salvo!")}><Save className="h-3 w-3" /> Salvar ganhos</Button>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="mt-6 shadow-card animate-fade-in">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-1">Evolução do Mês</h2>
          <p className="text-sm text-muted-foreground mb-4">Acumulado e diário · {formatarDataPtBr(hojeISO())}</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="acc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.62 0.24 295)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.62 0.24 295)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.04 290 / 0.4)" />
                <XAxis dataKey="dia" stroke="oklch(0.68 0.04 290)" />
                <YAxis stroke="oklch(0.68 0.04 290)" />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.03 290)", border: "1px solid oklch(0.28 0.04 290)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="acumulado" stroke="oklch(0.62 0.24 295)" fill="url(#acc)" strokeWidth={2} />
                <Area type="monotone" dataKey="diario" stroke="oklch(0.72 0.27 350)" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 9 metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
        {[
          { l: "Novos Leads", v: 0 }, { l: "OPPs", v: 0 }, { l: "LTR%", v: "0%" },
          { l: "No-show%", v: "0%" }, { l: "Clientes", v: clientesTotal },
          { l: "Oportunidades", v: 0 }, { l: "Vídeo Chamada", v: 0 },
          { l: "WhatsApp OPPs", v: 0 }, { l: "Conversão%", v: "0%" },
        ].map((m) => (
          <Card key={m.l} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{m.l}</div>
              <div className="text-2xl font-bold mt-1 text-gradient">{m.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
