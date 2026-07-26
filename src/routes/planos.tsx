import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tag, Check, Copy } from "lucide-react";
import { IconChip } from "@/components/bibly/IconChip";
import { PLANS, MODULES } from "@/lib/aurora-data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos e Preços — Aurora" },
      { name: "description", content: "Planos Cardápio Web e módulos extras com preços por período." },
      { property: "og:title", content: "Planos e Preços — Aurora" },
      { property: "og:description", content: "Mesas, Delivery, Premium e módulos." },
    ],
  }),
  component: Planos,
});

type Period = "mensal" | "tri" | "sem" | "anual";
const PERIODS: { id: Period; label: string; months: number }[] = [
  { id: "mensal", label: "Mensal", months: 1 },
  { id: "tri", label: "Trimestral", months: 3 },
  { id: "sem", label: "Semestral", months: 6 },
  { id: "anual", label: "Anual", months: 12 },
];

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Planos() {
  const [period, setPeriod] = useState<Period>("mensal");
  const copy = async (t: string) => {
    await navigator.clipboard.writeText(t);
    toast.success("Copiado!");
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <IconChip icon={Tag} tone="primary" size="xl" gradient />
        <div>
          <h1 className="text-3xl font-bold">Planos e Preços</h1>
          <p className="text-muted-foreground text-sm mt-1">Consulte planos, módulos e monte propostas rapidamente.</p>
        </div>
      </header>

      <Tabs defaultValue="planos">
        <TabsList>
          <TabsTrigger value="planos">Planos</TabsTrigger>
          <TabsTrigger value="modulos">Módulos Extras</TabsTrigger>
        </TabsList>

        <TabsContent value="planos" className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => {
              const active = period === p.id;
              const ref = PLANS[0].prices.mensal;
              const cur = PLANS[0].prices[p.id];
              const discount = p.id === "mensal" ? 0 : Math.round((1 - cur / ref) * 100);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2 transition-all ${
                    active ? "gradient-primary text-white shadow-card" : "bg-card border text-muted-foreground"
                  }`}
                >
                  {p.label}
                  {discount > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${active ? "bg-white/20" : ""}`} style={active ? {} : { backgroundColor: "#e7f8ef", color: "#0f9d58" }}>
                      -{discount}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {PLANS.map((plan) => {
              const price = plan.prices[period];
              const months = PERIODS.find((p) => p.id === period)!.months;
              const total = price * months;
              const discount = period === "mensal" ? 0 : Math.round((1 - price / plan.prices.mensal) * 100);
              const highlighted = "highlighted" in plan && plan.highlighted;

              return (
                <div
                  key={plan.id}
                  className="relative bg-card rounded-2xl p-6 shadow-card"
                  style={
                    highlighted
                      ? {
                          border: "2px solid transparent",
                          backgroundImage: "linear-gradient(white,white), var(--gradient-primary)",
                          backgroundOrigin: "border-box",
                          backgroundClip: "padding-box, border-box",
                        }
                      : {}
                  }
                >
                  <span
                    className="inline-block text-[10px] font-bold tracking-widest px-2 py-1 rounded-md"
                    style={{ backgroundColor: highlighted ? "var(--accent)" : "var(--muted)", color: highlighted ? "var(--accent-foreground)" : "var(--muted-foreground)" }}
                  >
                    {plan.badge}
                  </span>
                  <h3 className="text-2xl font-bold mt-3">{plan.label}</h3>
                  <div className="mt-4">
                    {discount > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <s>{brl(plan.prices.mensal)}</s>
                        <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: "#e7f8ef", color: "#0f9d58" }}>
                          -{discount}%
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{brl(price)}</span>
                      <span className="text-sm text-muted-foreground">/mês</span>
                    </div>
                    {months > 1 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Total do período: <b>{brl(total)}</b>
                      </div>
                    )}
                  </div>

                  <ul className="mt-5 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check size={16} className="text-primary mt-0.5 shrink-0" strokeWidth={3} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button type="button" className="flex-1 gradient-primary text-white rounded-xl py-2 text-sm font-semibold">
                          Ver detalhes
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{plan.label} — funcionalidades</DialogTitle>
                        </DialogHeader>
                        <ul className="space-y-2 py-2">
                          {plan.full.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-sm">
                              <Check size={16} className="text-primary mt-0.5" strokeWidth={3} />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </DialogContent>
                    </Dialog>
                    <button
                      type="button"
                      onClick={() => copy(`${plan.label} — ${brl(price)}/mês (${PERIODS.find((p) => p.id === period)!.label})\n\n${plan.features.map((f) => `• ${f}`).join("\n")}`)}
                      className="h-10 w-10 rounded-xl border flex items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="modulos" className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold ${period === p.id ? "gradient-primary text-white shadow-card" : "bg-card border text-muted-foreground"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULES.map((m) => {
              const months = PERIODS.find((p) => p.id === period)!.months;
              const total = m.price * months;
              return (
                <div key={m.id} className="bg-card rounded-2xl shadow-card p-5">
                  <h3 className="font-bold text-lg">{m.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{brl(m.price)}</span>
                    <span className="text-xs text-muted-foreground">/mês</span>
                  </div>
                  {months > 1 && (
                    <div className="text-xs text-muted-foreground">
                      Total do período: <b>{brl(total)}</b>
                    </div>
                  )}
                  {m.note && <p className="text-xs mt-2 p-2 rounded-lg gradient-soft">{m.note}</p>}
                  <button
                    type="button"
                    onClick={() => copy(`${m.label} — ${brl(m.price)}/mês\n${m.desc}${m.note ? `\n${m.note}` : ""}`)}
                    className="mt-4 w-full gradient-primary text-white rounded-xl py-2 text-sm font-semibold inline-flex items-center justify-center gap-2"
                  >
                    <Copy size={16} /> Copiar
                  </button>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
