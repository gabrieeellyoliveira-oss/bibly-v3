import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/planos")({
  head: () => ({ meta: [{ title: "Planos — Bibly" }] }),
  component: PlanosPage,
});

/* ── Tipos e dados ── */
type Periodo = "mensal" | "trimestral" | "semestral" | "anual";
type TabAtiva = "planos" | "modulos";

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

const MODULOS_BASE: Record<string, number> = {
  ifood: 29.99, estoque: 29.99, cupom: 69.99,
  entregadores: 54.99, financeiro: 69.99, totem: 99.99,
};

function precoMod(base: number, periodo: Periodo) {
  const d = PERIODOS.find(p => p.key === periodo)!.desconto;
  return Math.round(base * (1 - d / 100) * 100) / 100;
}
function totalMod(base: number, periodo: Periodo) {
  const { meses } = PERIODOS.find(p => p.key === periodo)!;
  return Math.round(precoMod(base, periodo) * meses * 100) / 100;
}
function fmt(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ── Dados dos planos ── */
const PLANOS = [
  {
    id: "mesas", emoji: "🍽️", nome: "Plano Mesas",
    desc: "Para restaurantes com atendimento físico em mesas e balcão.",
    badge: "IDEAL PARA RESTAURANTES", accentColor: "#8B5CF6",
    funcionalidades: [
      "Cardápio digital para mesas e balcão","Sistema PDV dentro do WhatsApp",
      "Cardápio rápido e com boa usabilidade","Disparador de mensagens em massa no WhatsApp",
      "Automações e agendamentos de mensagens no WhatsApp","Cupons e descontos",
      "Filtros avançados de clientes","PDV, estoque simplificado (sem ficha técnica), caixa e impressoras",
      "Gestão de rotas de entrega pela Foody Delivery e Pick N Go","Gestão financeira pela F360",
      "Fiado e KDS","Agendamento de pedidos",
    ],
    integracoes: [
      { label: "Pagamentos", itens: "Cartão, Mercado Pago, Cielo, Pix, Tuna" },
      { label: "Gestão financeira", itens: "F360" },
      { label: "ERPs", itens: "Saipos, Eclética" },
      { label: "Rotas de entrega", itens: "Foody Delivery, Pick N Go" },
      { label: "Entregadores", itens: "Entrega Fácil iFood, Zumm" },
    ],
  },
  {
    id: "delivery", emoji: "🛵", nome: "Plano Delivery",
    desc: "Para operações focadas em delivery e estratégias de marketing.",
    badge: "MELHOR PARA DELIVERY", accentColor: "#EC4899",
    funcionalidades: [
      "Cardápio digital para delivery e balcão","ChatBot com Inteligência Artificial",
      "Disparador de mensagens em massa no WhatsApp","Automações e agendamentos de mensagens no WhatsApp",
      "Integração com ferramentas de anúncio e marketing (Meta Ads e Google Ads)","Programa de fidelidade",
      "Cupons e descontos","Pagamento online (Mercado Pago e Cielo)","Filtros avançados de clientes",
      "PDV, estoque simplificado (sem ficha técnica), caixa e impressoras",
      "Gestão de rotas de entrega pela Foody Delivery e Pick N Go","Gestão financeira pela F360",
      "Fiado e KDS","Agendamento de pedidos",
    ],
    integracoes: [
      { label: "Pagamentos", itens: "Cartão, Mercado Pago, Cielo, Pix, Tuna" },
      { label: "Gestão financeira", itens: "F360" },
      { label: "ERPs", itens: "Saipos, Eclética" },
      { label: "Rotas de entrega", itens: "Foody Delivery, Pick N Go" },
      { label: "Entregadores", itens: "Entrega Fácil iFood, Zumm, Bee Delivery, Mottu, Husky" },
      { label: "Anúncios", itens: "Facebook Pixel, API de conversões do Meta, Catálogo do Facebook, Google Tag Manager, Google Analytics" },
    ],
  },
  {
    id: "premium", emoji: "👑", nome: "Plano Premium",
    desc: "Operação completa: mesas, delivery, marketing e iFood.",
    badge: "MAIS COMPLETO", accentColor: "#F59E0B",
    funcionalidades: [
      "Cardápio digital para delivery, mesas e balcão","Integração com iFood e Entrega Fácil iFood",
      "Sistema PDV dentro do WhatsApp","Cardápio rápido e com boa usabilidade",
      "ChatBot com Inteligência Artificial","Programa de fidelidade",
      "Pagamento online (Mercado Pago e Cielo)","Disparador de mensagens em massa no WhatsApp",
      "Automações e agendamentos de mensagens no WhatsApp",
      "Integração com ferramentas de anúncio e marketing (Meta Ads e Google Ads)",
      "Cupons e descontos","Filtros avançados de clientes",
      "PDV, estoque simplificado (sem ficha técnica), caixa e impressoras",
      "Gestão de rotas de entrega pela Foody Delivery e Pick N Go","Gestão financeira pela F360",
      "Gestão de entregadores, fiado e KDS","Agendamento de pedidos",
    ],
    integracoes: [
      { label: "Pagamentos", itens: "Cartão, Mercado Pago, Cielo, Pix, Tuna" },
      { label: "Gestão financeira", itens: "F360" },
      { label: "ERPs", itens: "Saipos, Eclética" },
      { label: "Rotas de entrega", itens: "Foody Delivery, Pick N Go" },
      { label: "Entregadores", itens: "Entrega Fácil iFood, Zumm" },
      { label: "Marketplaces", itens: "iFood" },
      { label: "Anúncios", itens: "Facebook Pixel, API de conversões do Meta, Catálogo do Facebook, Google Tag Manager, Google Analytics" },
    ],
  },
];

const MODULOS_INFO = [
  { id: "ifood",        nome: "iFood / Marketplaces",           desc: "Receba pedidos do iFood, Keeta, 99Food e AiqFome direto no sistema — tudo centralizado, sem precisar alternar telas." },
  { id: "estoque",      nome: "Estoque Avançado",               desc: "Controle completo dos insumos, com entradas, saídas, perdas e alertas automáticos pra evitar falta ou desperdício." },
  { id: "financeiro",   nome: "Financeiro",                     desc: "Gestão financeira clara e organizada, com controle de entradas, saídas, categorias e relatórios pra acompanhar o resultado do negócio." },
  { id: "entregadores", nome: "Entregadores / Roteirização",    desc: "Organize e acompanhe as entregas com controle dos entregadores e rotas otimizadas — ideal pra horários de pico e alto volume de pedidos." },
  { id: "cupom",        nome: "Cupom Fiscal / Fiscal Completo", desc: "Emissão de notas fiscais, geração de XML, acompanhamento de status e integração com a Receita — tudo dentro do sistema." },
  { id: "totem",        nome: "Totem de Autoatendimento",       desc: "Seus clientes fazem o próprio pedido no totem, com cardápio digital completo, pagamento integrado e envio automático pra cozinha via KDS.", porDispositivo: true },
];

/* ── Card de plano ── */
function PlanoCard({ plano, periodo }: { plano: typeof PLANOS[0]; periodo: Periodo }) {
  const [inteOpen, setInteOpen] = useState(false);
  const mensal = PRECOS[plano.id][periodo];
  const total  = TOTAIS[plano.id][periodo];
  const meses  = PERIODOS.find(p => p.key === periodo)!.meses;
  const desc   = PERIODOS.find(p => p.key === periodo)!.desconto;
  const isPremium = plano.id === "premium";

  const handleCopy = () => {
    const periodoLabel = PERIODOS.find(p => p.key === periodo)!.label;
    const txt = `${plano.nome} — Cardápio Web\nPeríodo: ${periodoLabel}\nR$ ${fmt(mensal)}/mês · Total: R$ ${fmt(total)}\n\nFuncionalidades:\n${plano.funcionalidades.map(f => `• ${f}`).join("\n")}\n\nIntegrações:\n${plano.integracoes.map(i => `• ${i.label}: ${i.itens}`).join("\n")}`;
    navigator.clipboard.writeText(txt).then(() => toast.success("Copiado!"));
  };

  return (
    <div
      className="flex flex-col rounded-2xl bg-card overflow-hidden"
      style={{
        border: isPremium ? `2px solid ${plano.accentColor}60` : "1px solid #E5DDF7",
        boxShadow: isPremium
          ? `0 4px 32px ${plano.accentColor}20, 0 2px 12px rgba(139,92,246,0.08)`
          : "0 2px 12px rgba(139,92,246,0.08)",
      }}
    >
      {/* Barra de cor no topo */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${plano.accentColor}, #EC4899)` }} />

      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{plano.emoji}</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{plano.id.toUpperCase()}</p>
              <p className="text-lg font-bold text-foreground leading-tight">{plano.nome}</p>
            </div>
          </div>
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
            style={{ background: plano.accentColor + "18", color: plano.accentColor, border: `1px solid ${plano.accentColor}40` }}
          >
            ✦ {plano.badge}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{plano.desc}</p>
      </div>

      {/* Preço */}
      <div className="px-5 pb-4 border-b border-border">
        {meses > 1 && <p className="text-[10px] text-muted-foreground mb-0.5">{meses}x de</p>}
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black" style={{ color: plano.accentColor }}>
            R$ {fmt(mensal)}
          </span>
          <span className="text-sm text-muted-foreground">/mês</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Total {PERIODOS.find(p => p.key === periodo)!.label.toLowerCase()}: R$ {fmt(total)}
          {desc > 0 && <span className="ml-2 font-bold text-success">ECONOMIZE {desc}%</span>}
        </p>
      </div>

      {/* Funcionalidades */}
      <div className="px-5 py-4 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Funcionalidades</p>
        <ul className="space-y-2">
          {plano.funcionalidades.map(f => (
            <li key={f} className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: plano.accentColor }} />
              <span className="text-xs text-foreground/80 leading-snug">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Integrações */}
      <div className="px-5 pb-4">
        <button
          onClick={() => setInteOpen(v => !v)}
          className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors py-2 border-t border-border"
        >
          <span>🔗 Integrações</span>
          {inteOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        {inteOpen && (
          <ul className="space-y-1.5 mt-2">
            {plano.integracoes.map(int => (
              <li key={int.label} className="text-xs text-foreground/70">
                <span className="font-semibold text-foreground">{int.label}:</span> {int.itens}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 flex gap-2">
        <button
          className="flex-1 h-10 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: `linear-gradient(135deg, ${plano.accentColor}, #EC4899)` }}
        >
          Ver detalhes do plano →
        </button>
        <button
          onClick={handleCopy}
          title="Copiar resumo"
          className="h-10 w-10 rounded-xl flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-secondary transition-all shrink-0"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Card de módulo ── */
function ModuloCard({ modulo, periodo }: { modulo: typeof MODULOS_INFO[0]; periodo: Periodo }) {
  const base   = MODULOS_BASE[modulo.id];
  const mensal = precoMod(base, periodo);
  const total  = totalMod(base, periodo);
  const meses  = PERIODOS.find(p => p.key === periodo)!.meses;
  const desc   = PERIODOS.find(p => p.key === periodo)!.desconto;

  return (
    <div className="rounded-2xl bg-card border border-border p-5 flex flex-col gap-3" style={{ boxShadow: "0 2px 12px rgba(139,92,246,0.08)" }}>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Módulo opcional</p>
        <p className="text-sm font-bold text-foreground">{modulo.nome}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{modulo.desc}</p>
        {modulo.porDispositivo && (
          <p className="text-[10px] text-primary mt-1.5 font-semibold">💡 Cobrado por dispositivo</p>
        )}
      </div>
      <div className="border-t border-border pt-3">
        {meses > 1 && <p className="text-[10px] text-muted-foreground mb-0.5">{meses}x de</p>}
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-foreground">R$ {fmt(mensal)}</span>
          <span className="text-xs text-muted-foreground">/mês{modulo.porDispositivo ? "/disp." : ""}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Total {PERIODOS.find(p => p.key === periodo)!.label.toLowerCase()}: R$ {fmt(total)}
          {desc > 0 && <span className="ml-2 font-bold text-success">-{desc}%</span>}
        </p>
      </div>
    </div>
  );
}

/* ── Página principal ── */
function PlanosPage() {
  const [tab, setTab] = useState<TabAtiva>("planos");
  const [periodo, setPeriodo] = useState<Periodo>("anual");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-pink mb-1">Cardápio Web</p>
        <h1 className="text-2xl font-black text-foreground">Planos & Preços</h1>
        <p className="text-sm text-muted-foreground mt-1">Escolha o plano ideal para o seu negócio.</p>
      </div>

      {/* Controles: tab (Planos / Módulos) + período */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Tab switcher */}
        <div className="flex items-center rounded-xl border border-border bg-card p-1 gap-1">
          {(["planos", "modulos"] as TabAtiva[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
                tab === t
                  ? "text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={tab === t ? { background: "linear-gradient(135deg,#8B5CF6,#EC4899)" } : {}}
            >
              {t === "planos" ? "Planos" : "Módulos Extras"}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-border" />

        {/* Período */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground font-semibold">Período:</span>
          {PERIODOS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriodo(p.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all border",
                periodo === p.key
                  ? "text-white border-transparent"
                  : "text-muted-foreground border-border bg-card hover:border-primary/40 hover:text-foreground"
              )}
              style={periodo === p.key ? { background: "linear-gradient(135deg,#8B5CF6,#EC4899)" } : {}}
            >
              {p.label}
              {p.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-success/15 text-success">
                  {p.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo por tab */}
      {tab === "planos" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANOS.map(plano => (
            <PlanoCard key={plano.id} plano={plano} periodo={periodo} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MODULOS_INFO.map(modulo => (
            <ModuloCard key={modulo.id} modulo={modulo} periodo={periodo} />
          ))}
        </div>
      )}
    </div>
  );
}
