import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Rocket, TrendingUp } from "lucide-react";
import { progressaoCarreira } from "@/data/dashboard";
import { fmtBRL } from "@/lib/dashboardUtils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/carreira")({
  component: CarreiraPage,
});

const NIVEL_ATUAL = "JR 2";

function NivelAtual() {
  const etapas = [
    { label: "JR I", concluido: true, ativo: false },
    { label: "JR II", concluido: false, ativo: true },
    { label: "Pleno", concluido: false, ativo: false },
    { label: "Sênior", concluido: false, ativo: false },
  ];
  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2"><Rocket className="h-4 w-4 text-pink" /><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nível Atual</p></div>
        <span className="rounded-full border border-warning/50 bg-warning/15 px-3 py-0.5 text-xs font-bold text-warning">★ Promovida!</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-lg font-extrabold text-primary-foreground shadow-glow">JR II</div>
        <div>
          <p className="text-xl font-bold text-foreground">SDR JR II</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Promovida em: Maio 2026</p>
          <span className="mt-1.5 inline-block rounded-full bg-pink/20 px-2.5 py-0.5 text-xs font-semibold text-pink">Ativo</span>
        </div>
      </div>
      <div className="flex items-center gap-0">
        {etapas.map((e, i) => (
          <div key={e.label} className="flex flex-1 items-center">
            <div className="flex flex-shrink-0 flex-col items-center gap-1">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold border", e.ativo ? "border-transparent bg-gradient-primary text-primary-foreground shadow-glow" : e.concluido ? "border-success/50 bg-success/20 text-success" : "border-border bg-muted text-muted-foreground")}>
                {e.concluido ? "✓" : i + 1}
              </div>
              <span className={cn("whitespace-nowrap text-xs font-medium", e.ativo ? "text-pink" : e.concluido ? "text-success" : "text-muted-foreground")}>{e.label}</span>
            </div>
            {i < etapas.length - 1 && <div className={cn("mx-1 mb-5 h-0.5 flex-1", e.concluido ? "bg-success/40" : "bg-border")} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function TabelaProgressao() {
  const [faixa, setFaixa] = useState<"faixa1" | "faixa2">("faixa1");
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-pink" /><p className="font-bold text-foreground">Progressão de Carreira</p></div>
        <div className="flex overflow-hidden rounded-lg border border-border">
          {(["faixa1", "faixa2"] as const).map((f) => (
            <button key={f} onClick={() => setFaixa(f)} className={cn("px-4 py-1.5 text-xs font-semibold transition-all", faixa === f ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {f === "faixa1" ? "Faixa 1 — Base" : "Faixa 2 — Estrela ★"}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {progressaoCarreira.map((row) => {
          const cur = faixa === "faixa1" ? row.faixa1 : row.faixa2;
          const isAtual = row.nivel === NIVEL_ATUAL;
          const oteM3 = row.base + (row.base * cur.m3) / 100;
          return (
            <div key={row.nivel} className={cn("relative space-y-3 overflow-hidden rounded-xl border p-4", isAtual ? "border-primary bg-primary/10 shadow-glow" : "border-border bg-card/60")}>
              {isAtual && <div className="absolute right-0 top-0"><span className="rounded-bl-xl bg-gradient-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">Você</span></div>}
              <div className="flex items-center justify-between">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl text-sm font-extrabold border", isAtual ? "border-primary bg-primary/20 text-primary" : "border-border bg-muted text-muted-foreground")}>{row.nivel}</div>
                <div className="text-right"><p className="text-xs text-muted-foreground">Base</p><p className="text-base font-bold text-foreground">{fmtBRL(row.base)}</p></div>
              </div>
              <div className="space-y-1.5">
                {[{ label: "Meta 1", pct: cur.m1 }, { label: "Meta 2", pct: cur.m2 }, { label: "Meta 3 ★", pct: cur.m3, destaque: true }].map(({ label, pct, destaque }) => {
                  const comissao = (row.base * pct) / 100; const ote = row.base + comissao;
                  return (
                    <div key={label} className={cn("flex items-center justify-between rounded-lg px-3 py-2", destaque && (isAtual ? "bg-primary/15 border border-primary/30" : "bg-muted border border-border"))}>
                      <div>
                        <p className={cn("text-xs font-semibold", destaque ? "text-pink" : "text-foreground")}>{label}</p>
                        <p className="text-xs text-muted-foreground">{pct}% · +{fmtBRL(comissao)}</p>
                      </div>
                      <div className="text-right"><p className="text-xs text-muted-foreground">OTE</p><p className={cn("text-sm font-bold", destaque ? "text-success" : "text-foreground")}>{fmtBRL(ote)}</p></div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-success/30 bg-success/10 px-3 py-2">
                <span className="text-xs font-semibold text-success">OTE máximo (M3)</span>
                <span className="text-sm font-extrabold text-success">{fmtBRL(oteM3)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CarreiraPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-pink">Trilha de Carreira</p>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Sua jornada profissional</h1>
      </div>
      <NivelAtual />
      <TabelaProgressao />
    </div>
  );
}
