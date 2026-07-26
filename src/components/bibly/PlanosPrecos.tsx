import { useMemo, useState } from "react";
import { Check, Copy, CopyCheck, Info, Tag } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IconChip } from "@/components/bibly/Playbook";

// ---------------------------------------------------------------------------
// Planos e Preços — cards por plano (Mesas/Delivery/Premium) e módulos extras,
// com seletor de período de fidelidade e desconto calculado a partir do preço
// mensal sem fidelidade. Dados vindos da tabela oficial de preços.
// ---------------------------------------------------------------------------

type Periodo = "mensal" | "trimestral" | "semestral" | "anual";

const PERIODOS: { value: Periodo; label: string; meses: number }[] = [
  { value: "mensal", label: "Mensal", meses: 1 },
  { value: "trimestral", label: "Trimestral", meses: 3 },
  { value: "semestral", label: "Semestral", meses: 6 },
  { value: "anual", label: "Anual", meses: 12 },
];

type Preco = { mensal: number; total: number };
type PlanoKey = "mesas" | "delivery" | "premium";

type Plano = {
  nome: string;
  badge: string;
  destaque?: boolean;
  resumo: string;
  destaques: string[];
  completo: string[];
  precos: Record<Periodo, Preco>;
};

const PLANOS: Record<PlanoKey, Plano> = {
  mesas: {
    nome: "Plano Mesas",
    badge: "IDEAL PARA MESAS",
    resumo: "Cardápio digital para mesas e balcão, com PDV e gestão simplificada.",
    destaques: [
      "Cardápio digital para mesas e balcão",
      "Sistema PDV dentro do WhatsApp",
      "PDV, estoque simplificado, caixa e impressoras",
      "Gestão de rotas de entrega (Foody Delivery e Pick N Go)",
      "Fiado e KDS",
    ],
    completo: [
      "Cardápio digital para mesas e balcão",
      "Sistema PDV dentro do WhatsApp",
      "Cardápio rápido e com boa usabilidade",
      "Disparador de mensagens em massa no WhatsApp",
      "Automações e agendamentos de mensagens no WhatsApp",
      "Cupons e descontos",
      "Filtros avançados de clientes",
      "PDV, estoque simplificado (sem ficha técnica), caixa e impressoras",
      "Gestão de rotas de entrega pela Foody Delivery e Pick N Go",
      "Gestão financeira pela F360",
      "Fiado e KDS",
      "Agendamento de pedidos",
    ],
    precos: {
      mensal: { mensal: 169.99, total: 169.99 },
      trimestral: { mensal: 159.99, total: 479.97 },
      semestral: { mensal: 149.99, total: 899.94 },
      anual: { mensal: 139.99, total: 1679.88 },
    },
  },
  delivery: {
    nome: "Plano Delivery",
    badge: "IDEAL PARA DELIVERY",
    resumo: "Cardápio para delivery e balcão, com IA, fidelidade e pagamento online.",
    destaques: [
      "Cardápio digital para delivery e balcão",
      "ChatBot com Inteligência Artificial",
      "Pagamento online (Mercado Pago e Cielo)",
      "Programa de fidelidade",
      "Integração com Meta Ads e Google Ads",
    ],
    completo: [
      "Disparador de mensagens em massa no WhatsApp",
      "Automações e agendamentos de mensagens no WhatsApp",
      "Integração com ferramentas de anúncio e marketing (Meta Ads e Google Ads)",
      "Programa de fidelidade",
      "Cupons e descontos",
      "ChatBot com Inteligência Artificial",
      "Cardápio digital para delivery e balcão",
      "Agendamento de pedidos",
      "Pagamento online (Mercado Pago e Cielo)",
      "Filtros avançados de clientes",
      "PDV, estoque simplificado (sem ficha técnica), caixa e impressoras",
      "Gestão de rotas de entrega pela Foody Delivery e Pick N Go",
      "Gestão financeira pela F360",
      "Fiado e KDS",
    ],
    precos: {
      mensal: { mensal: 209.99, total: 209.99 },
      trimestral: { mensal: 199.99, total: 599.97 },
      semestral: { mensal: 189.99, total: 1139.94 },
      anual: { mensal: 179.99, total: 2159.88 },
    },
  },
  premium: {
    nome: "Plano Premium",
    badge: "MAIS COMPLETO",
    destaque: true,
    resumo: "Tudo dos outros planos + iFood, mesas, delivery e balcão no mesmo lugar.",
    destaques: [
      "Cardápio digital para delivery, mesas e balcão",
      "Integração com iFood e Entrega Fácil iFood",
      "ChatBot com Inteligência Artificial",
      "Programa de fidelidade",
      "Gestão de entregadores, fiado e KDS",
    ],
    completo: [
      "Integração com iFood e Entrega Fácil iFood",
      "Sistema PDV dentro do WhatsApp",
      "Cardápio rápido e com boa usabilidade",
      "Integração com ferramentas de anúncio e marketing (Meta Ads e Google Ads)",
      "Programa de fidelidade",
      "ChatBot com Inteligência Artificial",
      "Cardápio digital para delivery, mesas e balcão",
      "Agendamento de pedidos",
      "Pagamento online (Mercado Pago e Cielo)",
      "Disparador de mensagens em massa no WhatsApp",
      "Automações e agendamentos de mensagens no WhatsApp",
      "Cupons e descontos",
      "Filtros avançados de clientes",
      "PDV, estoque simplificado (sem ficha técnica), caixa e impressoras",
      "Gestão de rotas de entrega pela Foody Delivery e Pick N Go",
      "Gestão financeira pela F360",
      "Gestão de entregadores, fiado e KDS",
    ],
    precos: {
      mensal: { mensal: 269.99, total: 269.99 },
      trimestral: { mensal: 259.99, total: 779.97 },
      semestral: { mensal: 249.99, total: 1499.94 },
      anual: { mensal: 239.99, total: 2879.88 },
    },
  },
};

type Modulo = {
  nome: string;
  descricao: string;
  precos: Record<Periodo, Preco>;
  nota?: string;
};

const MODULOS: Modulo[] = [
  {
    nome: "Marketplace",
    descricao: "Integração com iFood, 99 Food, Keeta e Aiqfome.",
    precos: {
      mensal: { mensal: 29.99, total: 29.99 },
      trimestral: { mensal: 29.99, total: 89.97 },
      semestral: { mensal: 29.99, total: 179.94 },
      anual: { mensal: 29.99, total: 359.88 },
    },
  },
  {
    nome: "Estoque Avançado",
    descricao: "Controle de estoque com ficha técnica.",
    precos: {
      mensal: { mensal: 29.99, total: 29.99 },
      trimestral: { mensal: 29.99, total: 89.97 },
      semestral: { mensal: 29.99, total: 179.94 },
      anual: { mensal: 29.99, total: 359.88 },
    },
  },
  {
    nome: "Cupom Fiscal",
    descricao: "Emissão de nota fiscal integrada ao PDV.",
    precos: {
      mensal: { mensal: 69.99, total: 69.99 },
      trimestral: { mensal: 69.99, total: 209.97 },
      semestral: { mensal: 69.99, total: 419.94 },
      anual: { mensal: 69.99, total: 839.88 },
    },
  },
  {
    nome: "Entregadores",
    descricao: "Gestão de entregadores e rotas de entrega.",
    nota: "Taxa por pedido: 0% até 500 pedidos, 8% de 501 a 1.500, 6% acima de 1.500.",
    precos: {
      mensal: { mensal: 54.99, total: 54.99 },
      trimestral: { mensal: 54.99, total: 164.97 },
      semestral: { mensal: 54.99, total: 329.94 },
      anual: { mensal: 54.99, total: 659.88 },
    },
  },
  {
    nome: "Financeiro",
    descricao: "Gestão financeira integrada à operação.",
    precos: {
      mensal: { mensal: 69.99, total: 69.99 },
      trimestral: { mensal: 69.99, total: 209.97 },
      semestral: { mensal: 69.99, total: 419.94 },
      anual: { mensal: 69.99, total: 839.88 },
    },
  },
  {
    nome: "Totem",
    descricao: "Dispositivos de autoatendimento no salão.",
    precos: {
      mensal: { mensal: 99.99, total: 99.99 },
      trimestral: { mensal: 99.99, total: 299.97 },
      semestral: { mensal: 99.99, total: 599.94 },
      anual: { mensal: 99.99, total: 1199.88 },
    },
  },
];

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function discountPercent(precos: Record<Periodo, Preco>, periodo: Periodo) {
  const base = precos.mensal.mensal;
  const atual = precos[periodo].mensal;
  if (periodo === "mensal" || atual >= base) return 0;
  return Math.round((1 - atual / base) * 100);
}

function useCopy() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1800);
  };
  return { copiedKey, copy };
}

export function PlanosPrecos() {
  const [tab, setTab] = useState<"planos" | "modulos">("planos");
  const [periodo, setPeriodo] = useState<Periodo>("anual");
  const [detalhe, setDetalhe] = useState<PlanoKey | null>(null);
  const { copiedKey, copy } = useCopy();

  const periodoLabel = PERIODOS.find((p) => p.value === periodo)!.label;

  return (
    <div className="h-screen overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
        <div className="mb-1.5 flex items-center gap-3.5">
          <IconChip icon={Tag} size={48} radius={14} />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Planos e Preços</h1>
        </div>
        <p className="mb-6 mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Valores oficiais dos planos e módulos, por fidelidade. Use os cards para negociar e copiar a proposta para o cliente.
        </p>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-full border border-border bg-card p-1">
            {(
              [
                { id: "planos", label: "Planos" },
                { id: "modulos", label: "Módulos Extras" },
              ] as const
            ).map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors",
                    active ? "text-white" : "text-muted-foreground hover:text-foreground",
                  )}
                  style={active ? { background: "var(--sidebar)" } : undefined}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-1 rounded-full border border-border bg-card p-1">
            {PERIODOS.map((p) => {
              const active = periodo === p.value;
              const desconto =
                tab === "planos"
                  ? Math.max(...(Object.keys(PLANOS) as PlanoKey[]).map((k) => discountPercent(PLANOS[k].precos, p.value)))
                  : 0;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPeriodo(p.value)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                    active ? "text-white" : "text-muted-foreground hover:text-foreground",
                  )}
                  style={active ? { backgroundImage: "var(--gradient-primary)" } : undefined}
                >
                  {p.label}
                  {desconto > 0 && (
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                      style={{
                        backgroundColor: active ? "rgba(255,255,255,0.25)" : "var(--badge-positive-bg)",
                        color: active ? "#ffffff" : "var(--badge-positive-fg)",
                      }}
                    >
                      -{desconto}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {tab === "planos" ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {(Object.keys(PLANOS) as PlanoKey[]).map((key) => {
              const plano = PLANOS[key];
              const preco = plano.precos[periodo];
              const desconto = discountPercent(plano.precos, periodo);
              const copyText = `${plano.nome} — ${periodoLabel}\nR$ ${preco.mensal.toFixed(2).replace(".", ",")}/mês${
                periodo !== "mensal" ? ` (total ${brl(preco.total)} no período)` : ""
              }\n\nPrincipais funcionalidades:\n${plano.completo.map((f) => `- ${f}`).join("\n")}`;

              return (
                <div
                  key={key}
                  className={cn(
                    "relative flex flex-col rounded-[22px] border bg-card p-6",
                    plano.destaque ? "border-transparent" : "border-border",
                  )}
                  style={{
                    boxShadow: plano.destaque ? "0 20px 44px -22px rgba(109,76,255,0.45)" : "var(--shadow-card)",
                    ...(plano.destaque
                      ? {
                          backgroundImage:
                            "linear-gradient(var(--card), var(--card)) padding-box, var(--gradient-primary) border-box",
                          border: "2px solid transparent",
                        }
                      : {}),
                  }}
                >
                  <span
                    className="mb-4 inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide"
                    style={{
                      backgroundColor: plano.destaque ? "var(--accent)" : "var(--secondary)",
                      color: plano.destaque ? "var(--accent-foreground)" : "var(--secondary-foreground)",
                    }}
                  >
                    {plano.badge}
                  </span>

                  <h3 className="text-lg font-bold text-foreground">{plano.nome}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{plano.resumo}</p>

                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-foreground">{brl(preco.mensal)}</span>
                    <span className="pb-1 text-xs font-medium text-muted-foreground">/mês</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    {desconto > 0 && (
                      <>
                        <span className="line-through opacity-70">{brl(plano.precos.mensal.mensal)}</span>
                        <span className="font-semibold" style={{ color: "var(--badge-positive-fg)" }}>
                          -{desconto}%
                        </span>
                      </>
                    )}
                    {periodo !== "mensal" && <span>· total {brl(preco.total)}</span>}
                  </div>

                  <ul className="mt-5 flex-1 space-y-2.5">
                    {plano.destaques.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[13px] text-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 flex-1 rounded-xl border-border text-[13px]"
                      onClick={() => setDetalhe(key)}
                    >
                      <Info className="h-4 w-4" /> Ver detalhes do plano
                    </Button>
                    <button
                      type="button"
                      aria-label="Copiar resumo do plano"
                      title="Copiar resumo do plano"
                      onClick={() => copy(key, copyText)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {copiedKey === key ? <CopyCheck className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {MODULOS.map((mod) => {
              const preco = mod.precos[periodo];
              const copyKey = `mod-${mod.nome}`;
              const copyText = `Módulo ${mod.nome} — ${periodoLabel}\nR$ ${preco.mensal.toFixed(2).replace(".", ",")}/mês${
                periodo !== "mensal" ? ` (total ${brl(preco.total)} no período)` : ""
              }${mod.nota ? `\n${mod.nota}` : ""}`;

              return (
                <div key={mod.nome} className="flex flex-col rounded-[20px] border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
                  <h3 className="text-[15px] font-bold text-foreground">{mod.nome}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{mod.descricao}</p>

                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-2xl font-extrabold tracking-tight text-foreground">{brl(preco.mensal)}</span>
                    <span className="pb-0.5 text-xs font-medium text-muted-foreground">/mês</span>
                  </div>
                  {periodo !== "mensal" && (
                    <div className="mt-1 text-xs text-muted-foreground">total {brl(preco.total)} no período</div>
                  )}
                  {mod.nota && <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{mod.nota}</p>}

                  <button
                    type="button"
                    onClick={() => copy(copyKey, copyText)}
                    className="mt-4 flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {copiedKey === copyKey ? (
                      <>
                        <CopyCheck className="h-4 w-4 text-primary" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Copiar
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={detalhe !== null} onOpenChange={(open) => !open && setDetalhe(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          {detalhe && (
            <>
              <DialogHeader>
                <DialogTitle>{PLANOS[detalhe].nome} — todas as funcionalidades</DialogTitle>
              </DialogHeader>
              <ul className="space-y-2 py-2">
                {PLANOS[detalhe].completo.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
