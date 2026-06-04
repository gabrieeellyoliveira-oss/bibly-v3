import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/planos")({
  head: () => ({ meta: [{ title: "Planos — Bibly" }] }),
  component: PlanosPage,
});

type Periodo = "mensal" | "trimestral" | "semestral" | "anual";
type Tab = "planos" | "modulos";

const PERIODOS: { key: Periodo; label: string; meses: number; desconto: number; badge?: string }[] = [
  { key: "mensal",     label: "Mensal",     meses: 1,  desconto: 0 },
  { key: "trimestral", label: "Trimestral", meses: 3,  desconto: 5,  badge: "-5%" },
  { key: "semestral",  label: "Semestral",  meses: 6,  desconto: 10, badge: "-10%" },
  { key: "anual",      label: "Anual",      meses: 12, desconto: 15, badge: "-15%" },
];

const PRECOS: Record<string, Record<Periodo, number>> = {
  mesas:    { mensal: 169.99, trimestral: 159.99, semestral: 149.99, anual: 139.99 },
  delivery: { mensal: 209.99, trimestral: 199.99, semestral: 189.99, anual: 179.99 },
  premium:  { mensal: 269.99, trimestral: 259.99, semestral: 249.99, anual: 239.99 },
};
const TOTAIS: Record<string, Record<Periodo, number>> = {
  mesas:    { mensal: 169.99, trimestral: 479.97,  semestral: 899.94,  anual: 1679.88 },
  delivery: { mensal: 209.99, trimestral: 599.97,  semestral: 1139.94, anual: 2159.88 },
  premium:  { mensal: 269.99, trimestral: 779.97,  semestral: 1499.94, anual: 2879.88 },
};
const MOD_BASE: Record<string, number> = {
  ifood: 29.99, estoque: 29.99, cupom: 69.99,
  entregadores: 54.99, financeiro: 69.99, totem: 99.99,
};
const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const periodoInfo = (p: Periodo) => PERIODOS.find(x => x.key === p)!;

const PLANOS = [
  {
    id: "mesas", emoji: "🍽️", nome: "Plano Mesas",
    desc: "Para restaurantes com atendimento físico em mesas e balcão.",
    badge: "IDEAL PARA RESTAURANTES", cor: "#8B5CF6",
    features: [
      "Cardápio digital para mesas e balcão","Sistema PDV dentro do WhatsApp",
      "Cardápio rápido e com boa usabilidade","Disparador de mensagens em massa no WhatsApp",
      "Automações e agendamentos no WhatsApp","Cupons e descontos",
      "Filtros avançados de clientes","PDV, estoque simplificado, caixa e impressoras",
      "Gestão de rotas de entrega (Foody / Pick N Go)","Gestão financeira pela F360",
      "Fiado e KDS","Agendamento de pedidos",
    ],
    integracoes: [
      "Pagamentos: Cartão, Mercado Pago, Cielo, Pix, Tuna",
      "Gestão financeira: F360 · ERPs: Saipos, Eclética",
      "Rotas: Foody Delivery, Pick N Go",
      "Entregadores: Entrega Fácil iFood, Zumm",
    ],
  },
  {
    id: "delivery", emoji: "🛵", nome: "Plano Delivery",
    desc: "Para operações focadas em delivery e estratégias de marketing.",
    badge: "MELHOR PARA DELIVERY", cor: "#EC4899",
    features: [
      "Cardápio digital para delivery e balcão","ChatBot com Inteligência Artificial",
      "Disparador de mensagens em massa no WhatsApp","Automações e agendamentos no WhatsApp",
      "Integração Meta Ads e Google Ads","Programa de fidelidade",
      "Cupons e descontos","Pagamento online (Mercado Pago e Cielo)",
      "Filtros avançados de clientes","PDV, estoque simplificado, caixa e impressoras",
      "Gestão de rotas de entrega (Foody / Pick N Go)","Gestão financeira pela F360",
      "Fiado e KDS","Agendamento de pedidos",
    ],
    integracoes: [
      "Pagamentos: Cartão, Mercado Pago, Cielo, Pix, Tuna",
      "Gestão financeira: F360 · ERPs: Saipos, Eclética",
      "Entregadores: Entrega Fácil iFood, Zumm, Bee Delivery, Mottu, Husky",
      "Anúncios: Facebook Pixel, API Meta, GTM, Google Analytics",
    ],
  },
  {
    id: "premium", emoji: "👑", nome: "Plano Premium",
    desc: "Operação completa: mesas, delivery, marketing e iFood.",
    badge: "MAIS COMPLETO", cor: "#F59E0B",
    features: [
      "Cardápio digital delivery, mesas e balcão","Integração com iFood e Entrega Fácil iFood",
      "Sistema PDV dentro do WhatsApp","Cardápio rápido e com boa usabilidade",
      "ChatBot com Inteligência Artificial","Programa de fidelidade",
      "Pagamento online (Mercado Pago e Cielo)","Disparador de mensagens em massa no WhatsApp",
      "Automações e agendamentos no WhatsApp","Integração Meta Ads e Google Ads",
      "Cupons e descontos","Filtros avançados de clientes",
      "PDV, estoque simplificado, caixa e impressoras","Gestão de rotas (Foody / Pick N Go)",
      "Gestão financeira pela F360","Gestão de entregadores, fiado e KDS",
      "Agendamento de pedidos",
    ],
    integracoes: [
      "Pagamentos: Cartão, Mercado Pago, Cielo, Pix, Tuna",
      "Gestão financeira: F360 · ERPs: Saipos, Eclética",
      "Marketplaces: iFood · Entregadores: Entrega Fácil iFood, Zumm",
      "Anúncios: Facebook Pixel, API Meta, GTM, Google Analytics",
    ],
  },
];

const MODULOS = [
  { id: "ifood",        nome: "iFood / Marketplaces",           desc: "Receba pedidos do iFood, Keeta, 99Food e AiqFome direto no sistema — tudo centralizado, sem precisar alternar telas." },
  { id: "estoque",      nome: "Estoque Avançado",               desc: "Controle completo dos insumos, com entradas, saídas, perdas e alertas automáticos pra evitar falta ou desperdício." },
  { id: "financeiro",   nome: "Financeiro",                     desc: "Gestão financeira clara e organizada, com controle de entradas, saídas, categorias e relatórios do negócio." },
  { id: "entregadores", nome: "Entregadores / Roteirização",    desc: "Organize e acompanhe as entregas com controle dos entregadores e rotas otimizadas — ideal pra alto volume de pedidos." },
  { id: "cupom",        nome: "Cupom Fiscal / Fiscal Completo", desc: "Emissão de notas fiscais, geração de XML, acompanhamento de status e integração com a Receita — tudo dentro do sistema." },
  { id: "totem",        nome: "Totem de Autoatendimento",       desc: "Pedido, pagamento e envio pra cozinha — tudo pelo cliente no totem. Cardápio digital completo, mídias personalizadas e KDS integrado.", por: "dispositivo" },
];

function PlanoCard({ p, periodo }: { p: typeof PLANOS[0]; periodo: Periodo }) {
  const [open, setOpen] = useState(false);
  const { meses, desconto, label } = periodoInfo(periodo);
  const mensal = PRECOS[p.id][periodo];
  const total  = TOTAIS[p.id][periodo];

  const handleCopy = () => {
    const txt = `${p.nome} — Cardápio Web\nPeríodo: ${label}\nR$ ${fmt(mensal)}/mês · Total: R$ ${fmt(total)}\n\nFuncionalidades:\n${p.features.map(f => `• ${f}`).join("\n")}\n\nIntegrações:\n${p.integracoes.map(i => `• ${i}`).join("\n")}`;
    navigator.clipboard.writeText(txt).then(() => toast.success("Copiado!"));
  };

  return (
    <div className="flex flex-col rounded-2xl bg-card overflow-hidden"
      style={{
        border: p.id === "premium" ? `2px solid ${p.cor}50` : "1px solid #E5DDF7",
        boxShadow: p.id === "premium" ? `0 4px 24px ${p.cor}18, 0 2px 8px rgba(139,92,246,0.06)` : "0 2px 8px rgba(139,92,246,0.07)",
      }}>
      {/* Barra de cor */}
      <div className="h-1 w-full flex-shrink-0" style={{ background: `linear-gradient(90deg,${p.cor},#EC4899)` }} />

      {/* Cabeçalho */}
      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{p.emoji}</span>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground leading-none">{p.id.toUpperCase()}</p>
              <p className="text-base font-bold text-foreground leading-tight">{p.nome}</p>
            </div>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 mt-0.5"
            style={{ background: p.cor + "18", color: p.cor, border: `1px solid ${p.cor}35` }}>
            ✦ {p.badge}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground">{p.desc}</p>
      </div>

      {/* Preço */}
      <div className="px-4 pb-2.5 border-b border-border flex-shrink-0">
        {meses > 1 && <p className="text-[9px] text-muted-foreground leading-none mb-0.5">{meses}x de</p>}
        <div className="flex items-baseline gap-0.5">
          <span className="text-2xl font-black leading-tight" style={{ color: p.cor }}>R$ {fmt(mensal)}</span>
          <span className="text-xs text-muted-foreground">/mês</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Total {label.toLowerCase()}: R$ {fmt(total)}
          {desconto > 0 && <span className="ml-1.5 font-bold text-success">ECONOMIZE {desconto}%</span>}
        </p>
      </div>

      {/* Funcionalidades em 2 colunas */}
      <div className="px-4 py-2.5 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Funcionalidades</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {p.features.map(f => (
            <div key={f} className="flex items-start gap-1">
              <Check className="h-2.5 w-2.5 mt-0.5 shrink-0" style={{ color: p.cor }} />
              <span className="text-[10px] text-foreground/75 leading-snug">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Integrações colapsável */}
      <div className="px-4 pb-2">
        <button onClick={() => setOpen(v => !v)}
          className="flex items-center justify-between w-full text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors py-1.5 border-t border-border">
          <span>🔗 Integrações</span>
          {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        {open && (
          <ul className="space-y-0.5 mt-1">
            {p.integracoes.map(i => (
              <li key={i} className="text-[10px] text-foreground/70 leading-snug">• {i}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 flex gap-2 flex-shrink-0">
        <button className="flex-1 h-9 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: `linear-gradient(135deg,${p.cor},#EC4899)` }}>
          Ver detalhes do plano →
        </button>
        <button onClick={handleCopy} title="Copiar resumo"
          className="h-9 w-9 rounded-xl flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-secondary transition-all shrink-0">
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ModuloCard({ m, periodo }: { m: typeof MODULOS[0]; periodo: Periodo }) {
  const base   = MOD_BASE[m.id];
  const { meses, desconto, label } = periodoInfo(periodo);
  const mensal = Math.round(base * (1 - desconto / 100) * 100) / 100;
  const total  = Math.round(mensal * meses * 100) / 100;

  return (
    <div className="rounded-2xl bg-card border border-border p-4 flex flex-col gap-2.5" style={{ boxShadow: "0 2px 8px rgba(139,92,246,0.07)" }}>
      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-primary mb-1">Módulo opcional</p>
        <p className="text-sm font-bold text-foreground">{m.nome}</p>
        <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{m.desc}</p>
        {m.por && <p className="text-[10px] text-primary mt-1 font-semibold">💡 Cobrado por {m.por}</p>}
      </div>
      <div className="border-t border-border pt-2.5">
        {meses > 1 && <p className="text-[9px] text-muted-foreground leading-none mb-0.5">{meses}x de</p>}
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-foreground">R$ {fmt(mensal)}</span>
          <span className="text-[10px] text-muted-foreground">/mês{m.por ? `/${m.por}` : ""}</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Total {label.toLowerCase()}: R$ {fmt(total)}
          {desconto > 0 && <span className="ml-1.5 font-bold text-success">-{desconto}%</span>}
        </p>
      </div>
    </div>
  );
}

function PlanosPage() {
  const [tab, setTab]       = useState<Tab>("planos");
  const [periodo, setPeriodo] = useState<Periodo>("anual");

  return (
    <div className="flex flex-col gap-4">
      {/* Header compacto */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-pink">Cardápio Web · Planos & Preços</p>
          <h1 className="text-xl font-black text-foreground leading-tight">Escolha o plano ideal para o seu negócio</h1>
        </div>
      </div>

      {/* Controles: tabs + período — tudo numa linha */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Tab switcher */}
        <div className="flex items-center rounded-xl border border-border bg-card p-1 gap-1">
          {(["planos", "modulos"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-3 py-1.5 rounded-lg text-sm font-semibold transition-all",
                tab === t ? "text-white shadow-sm" : "text-muted-foreground hover:text-foreground")}
              style={tab === t ? { background: "linear-gradient(135deg,#8B5CF6,#EC4899)" } : {}}>
              {t === "planos" ? "Planos" : "Módulos Extras"}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-border" />

        {/* Período */}
        <span className="text-xs text-muted-foreground font-semibold">Período:</span>
        {PERIODOS.map(p => (
          <button key={p.key} onClick={() => setPeriodo(p.key)}
            className={cn("flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-all border",
              periodo === p.key
                ? "text-white border-transparent"
                : "text-muted-foreground border-border bg-card hover:border-primary/40 hover:text-foreground")}
            style={periodo === p.key ? { background: "linear-gradient(135deg,#8B5CF6,#EC4899)" } : {}}>
            {p.label}
            {p.badge && (
              <span className="text-[9px] font-bold px-1 py-px rounded-full bg-success/15 text-success">{p.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Grid de conteúdo */}
      {tab === "planos" ? (
        <div className="grid grid-cols-3 gap-4">
          {PLANOS.map(p => <PlanoCard key={p.id} p={p} periodo={periodo} />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {MODULOS.map(m => <ModuloCard key={m.id} m={m} periodo={periodo} />)}
        </div>
      )}
    </div>
  );
}
