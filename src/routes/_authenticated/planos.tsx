import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/planos")({
  head: () => ({ meta: [{ title: "Planos — Bibly" }] }),
  component: PlanosPage,
});

/* ── Dados de preços ── */
type Periodo = "mensal" | "trimestral" | "semestral" | "anual";

const PERIODOS: { key: Periodo; label: string; meses: number; desconto: number; badge?: string }[] = [
  { key: "mensal",      label: "Mensal",      meses: 1,  desconto: 0 },
  { key: "trimestral",  label: "Trimestral",  meses: 3,  desconto: 5,  badge: "-5%" },
  { key: "semestral",   label: "Semestral",   meses: 6,  desconto: 10, badge: "-10%" },
  { key: "anual",       label: "Anual",       meses: 12, desconto: 15, badge: "-15%" },
];

const PRECOS_MENSAIS: Record<string, Record<Periodo, number>> = {
  mesas:    { mensal: 169.99, trimestral: 159.99, semestral: 149.99, anual: 139.99 },
  delivery: { mensal: 209.99, trimestral: 199.99, semestral: 189.99, anual: 179.99 },
  premium:  { mensal: 269.99, trimestral: 259.99, semestral: 249.99, anual: 239.99 },
};

const TOTAIS: Record<string, Record<Periodo, number>> = {
  mesas:    { mensal: 169.99, trimestral: 479.97,  semestral: 899.94,  anual: 1679.88 },
  delivery: { mensal: 209.99, trimestral: 599.97,  semestral: 1139.94, anual: 2159.88 },
  premium:  { mensal: 269.99, trimestral: 779.97,  semestral: 1499.94, anual: 2879.88 },
};

// Preços base mensais dos módulos
const MODULOS_BASE: Record<string, number> = {
  ifood: 29.99, estoque: 29.99, cupom: 69.99,
  entregadores: 54.99, financeiro: 69.99, totem: 99.99,
};

function precoModulo(base: number, periodo: Periodo) {
  const d = PERIODOS.find(p => p.key === periodo)!.desconto;
  return Math.round(base * (1 - d / 100) * 100) / 100;
}
function totalModulo(base: number, periodo: Periodo) {
  const { meses } = PERIODOS.find(p => p.key === periodo)!;
  return Math.round(precoModulo(base, periodo) * meses * 100) / 100;
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ── Dados dos planos ── */
const PLANOS = [
  {
    id: "mesas",
    emoji: "🍽️",
    nome: "Plano Mesas",
    desc: "Para restaurantes com atendimento físico em mesas e balcão.",
    badge: "IDEAL PARA RESTAURANTES",
    badgeColor: "#8B5CF6",
    destaque: false,
    funcionalidades: [
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
    integracoes: [
      { label: "Pagamentos", itens: "Cartão, Mercado Pago, Cielo, Pix, Tuna" },
      { label: "Gestão financeira", itens: "F360" },
      { label: "ERPs", itens: "Saipos, Eclética" },
      { label: "Rotas de entrega", itens: "Foody Delivery, Pick N Go" },
      { label: "Entregadores", itens: "Entrega Fácil iFood, Zumm" },
    ],
  },
  {
    id: "delivery",
    emoji: "🛵",
    nome: "Plano Delivery",
    desc: "Para operações focadas em delivery e estratégias de marketing.",
    badge: "MELHOR PARA DELIVERY",
    badgeColor: "#EC4899",
    destaque: false,
    funcionalidades: [
      "Cardápio digital para delivery e balcão",
      "ChatBot com Inteligência Artificial",
      "Disparador de mensagens em massa no WhatsApp",
      "Automações e agendamentos de mensagens no WhatsApp",
      "Integração com ferramentas de anúncio e marketing (Meta Ads e Google Ads)",
      "Programa de fidelidade",
      "Cupons e descontos",
      "Pagamento online (Mercado Pago e Cielo)",
      "Filtros avançados de clientes",
      "PDV, estoque simplificado (sem ficha técnica), caixa e impressoras",
      "Gestão de rotas de entrega pela Foody Delivery e Pick N Go",
      "Gestão financeira pela F360",
      "Fiado e KDS",
      "Agendamento de pedidos",
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
    id: "premium",
    emoji: "👑",
    nome: "Plano Premium",
    desc: "Operação completa: mesas, delivery, marketing e iFood.",
    badge: "MAIS COMPLETO",
    badgeColor: "#F59E0B",
    destaque: true,
    funcionalidades: [
      "Cardápio digital para delivery, mesas e balcão",
      "Integração com iFood e Entrega Fácil iFood",
      "Sistema PDV dentro do WhatsApp",
      "Cardápio rápido e com boa usabilidade",
      "ChatBot com Inteligência Artificial",
      "Programa de fidelidade",
      "Pagamento online (Mercado Pago e Cielo)",
      "Disparador de mensagens em massa no WhatsApp",
      "Automações e agendamentos de mensagens no WhatsApp",
      "Integração com ferramentas de anúncio e marketing (Meta Ads e Google Ads)",
      "Cupons e descontos",
      "Filtros avançados de clientes",
      "PDV, estoque simplificado (sem ficha técnica), caixa e impressoras",
      "Gestão de rotas de entrega pela Foody Delivery e Pick N Go",
      "Gestão financeira pela F360",
      "Gestão de entregadores, fiado e KDS",
      "Agendamento de pedidos",
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
  {
    id: "ifood",
    nome: "iFood / Marketplaces",
    desc: "Receba pedidos do iFood, Keeta, 99Food e AiqFome direto no sistema — tudo centralizado, sem precisar alternar telas.",
  },
  {
    id: "estoque",
    nome: "Estoque Avançado",
    desc: "Controle completo dos insumos, com entradas, saídas, perdas e alertas automáticos pra evitar falta ou desperdício.",
  },
  {
    id: "financeiro",
    nome: "Financeiro",
    desc: "Gestão financeira clara e organizada, com controle de entradas, saídas, categorias e relatórios pra acompanhar o resultado do negócio.",
  },
  {
    id: "entregadores",
    nome: "Entregadores / Roteirização",
    desc: "Organize e acompanhe as entregas com controle dos entregadores e rotas otimizadas — ideal pra horários de pico e alto volume de pedidos.",
  },
  {
    id: "cupom",
    nome: "Cupom Fiscal / Fiscal Completo",
    desc: "Emissão de notas fiscais, geração de XML, acompanhamento de status e integração com a Receita — tudo dentro do sistema.",
  },
  {
    id: "totem",
    nome: "Totem de Autoatendimento",
    desc: "Seus clientes fazem o próprio pedido no totem, com cardápio digital completo, pagamento integrado e envio automático pra cozinha via KDS. Você ainda personaliza mídias e banners exibidos no equipamento.",
    porDispositivo: true,
  },
];

/* ── Componente do card de plano ── */
function PlanoCard({ plano, periodo }: { plano: typeof PLANOS[0]; periodo: Periodo }) {
  const [inteOpen, setInteOpen] = useState(false);
  const mensal = PRECOS_MENSAIS[plano.id][periodo];
  const total = TOTAIS[plano.id][periodo];
  const meses = PERIODOS.find(p => p.key === periodo)!.meses;
  const desconto = PERIODOS.find(p => p.key === periodo)!.desconto;

  const handleCopy = () => {
    const texto = `${plano.nome} — Cardápio Web\nPeríodo: ${PERIODOS.find(p => p.key === periodo)!.label}\nR$ ${fmt(mensal)}/mês (Total: R$ ${fmt(total)})\n\nFuncionalidades:\n${plano.funcionalidades.map(f => `• ${f}`).join("\n")}\n\nIntegrações:\n${plano.integracoes.map(i => `• ${i.label}: ${i.itens}`).join("\n")}`;
    navigator.clipboard.writeText(texto).then(() => toast.success("Copiado para a área de transferência!"));
  };

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: plano.destaque ? "linear-gradient(180deg,#2D1B00 0%,#1A0A2E 100%)" : "#1A0A2E",
        border: plano.destaque ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(139,92,246,0.25)",
        boxShadow: plano.destaque ? "0 0 32px rgba(245,158,11,0.15)" : "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      {/* Header */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{plano.emoji}</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: plano.badgeColor }}>{plano.id.toUpperCase()}</p>
              <p className="text-lg font-bold text-white leading-tight">{plano.nome}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: plano.badgeColor + "25", color: plano.badgeColor, border: `1px solid ${plano.badgeColor}40` }}>
            ✦ {plano.badge}
          </span>
        </div>
        <p className="text-xs text-white/50">{plano.desc}</p>
      </div>

      {/* Preço */}
      <div className="px-6 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        {meses > 1 && (
          <p className="text-xs text-white/40 mb-0.5">{meses}x de</p>
        )}
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black" style={{ color: plano.destaque ? "#F59E0B" : "white" }}>
            R$ {fmt(mensal)}
          </span>
          <span className="text-sm text-white/50">/mês</span>
        </div>
        <p className="text-xs text-white/40 mt-0.5">
          Total {PERIODOS.find(p => p.key === periodo)!.label.toLowerCase()}: R$ {fmt(total)}
          {desconto > 0 && (
            <span className="ml-2 font-bold" style={{ color: "#22C55E" }}>ECONOMIZE {desconto}%</span>
          )}
        </p>
      </div>

      {/* Funcionalidades */}
      <div className="px-6 py-4 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Funcionalidades</p>
        <ul className="space-y-2">
          {plano.funcionalidades.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: plano.badgeColor }} />
              <span className="text-xs text-white/70 leading-snug">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Integrações (colapsável) */}
      <div className="px-6 pb-4">
        <button
          onClick={() => setInteOpen(!inteOpen)}
          className="flex items-center justify-between w-full text-xs font-semibold text-white/40 hover:text-white/70 transition-colors py-2 border-t"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <span>🔗 Integrações</span>
          {inteOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        {inteOpen && (
          <ul className="space-y-1.5 mt-2">
            {plano.integracoes.map((int) => (
              <li key={int.label} className="text-xs text-white/60">
                <span className="font-semibold text-white/80">{int.label}:</span> {int.itens}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-5 flex items-center gap-2">
        <button
          className="flex-1 h-11 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: plano.destaque ? "linear-gradient(135deg,#F59E0B,#EC4899)" : "linear-gradient(135deg,#8B5CF6,#EC4899)" }}
        >
          Ver detalhes do plano →
        </button>
        <button
          onClick={handleCopy}
          title="Copiar resumo"
          className="h-11 w-11 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 text-white/40 hover:text-white/80 shrink-0"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Componente do card de módulo ── */
function ModuloCard({ modulo, periodo }: { modulo: typeof MODULOS_INFO[0]; periodo: Periodo }) {
  const base = MODULOS_BASE[modulo.id];
  const mensal = precoModulo(base, periodo);
  const total = totalModulo(base, periodo);
  const meses = PERIODOS.find(p => p.key === periodo)!.meses;
  const desconto = PERIODOS.find(p => p.key === periodo)!.desconto;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: "#1A0A2E", border: "1px solid rgba(139,92,246,0.2)", boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}
    >
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-1">Módulo opcional</p>
        <p className="text-base font-bold text-white">{modulo.nome}</p>
        <p className="text-xs text-white/50 mt-1 leading-relaxed">{modulo.desc}</p>
        {modulo.porDispositivo && (
          <p className="text-[10px] text-purple-300 mt-1.5 font-semibold">💡 Cobrado por dispositivo</p>
        )}
      </div>
      <div className="border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        {meses > 1 && (
          <p className="text-[10px] text-white/30 mb-0.5">{meses}x de</p>
        )}
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-white">R$ {fmt(mensal)}</span>
          <span className="text-xs text-white/40">/mês{modulo.porDispositivo ? "/dispositivo" : ""}</span>
        </div>
        <p className="text-xs text-white/40 mt-0.5">
          Total {PERIODOS.find(p => p.key === periodo)!.label.toLowerCase()}: R$ {fmt(total)}
          {desconto > 0 && <span className="ml-2 font-bold text-green-400">-{desconto}%</span>}
        </p>
      </div>
    </div>
  );
}

/* ── Página principal ── */
function PlanosPage() {
  const [periodo, setPeriodo] = useState<Periodo>("anual");

  return (
    <div className="space-y-8" style={{ color: "white" }}>
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-1">Cardápio Web</p>
        <h1 className="text-2xl font-black text-white">Planos & Preços</h1>
        <p className="text-sm text-white/50 mt-1">Escolha o plano ideal para o seu negócio.</p>
      </div>

      {/* Seletor de período */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-white/40 font-semibold mr-1">Período:</span>
        {PERIODOS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriodo(p.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all",
              periodo === p.key
                ? "text-white"
                : "text-white/50 hover:text-white/80",
            )}
            style={periodo === p.key
              ? { background: "linear-gradient(135deg,#8B5CF6,#EC4899)", boxShadow: "0 2px 12px rgba(139,92,246,0.4)" }
              : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }
            }
          >
            {p.label}
            {p.badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.25)", color: "#22C55E" }}>
                {p.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 3 Planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANOS.map((plano) => (
          <PlanoCard key={plano.id} plano={plano} periodo={periodo} />
        ))}
      </div>

      {/* Módulos Extras */}
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-white">Módulos Extras</h2>
          <p className="text-sm text-white/40 mt-0.5">
            Podem ser contratados em qualquer plano. Os preços seguem o período selecionado acima.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MODULOS_INFO.map((modulo) => (
            <ModuloCard key={modulo.id} modulo={modulo} periodo={periodo} />
          ))}
        </div>
      </div>
    </div>
  );
}
