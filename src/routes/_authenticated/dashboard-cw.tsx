import { createFileRoute } from "@tanstack/react-router";
import type { CSSProperties, ElementType, ReactNode } from "react";
import { Pencil, Save, X, Target, TrendingUp, Users, BarChart2, Calendar, Zap, Star, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditMode, type CardConfigs } from "@/hooks/useEditMode";
import { EditableCard } from "@/components/dashboard/EditableCard";
import { PageHeader } from "@/components/page-header";
import { historico, abrilFallback } from "@/data/dashboard";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard-cw")({
  head: () => ({ meta: [{ title: "Dashboard CW — Bibly" }] }),
  component: DashboardCW,
});

/* ─── Layout padrão dos cards ─────────────────────────────── */
const DEFAULT_CONFIGS: CardConfigs = {
  "metas-mes":      { name: "Metas do Mês",      size: "M", visible: true, position: 0 },
  "clientes":       { name: "Clientes",           size: "P", visible: true, position: 1 },
  "leads":          { name: "Novos Leads",        size: "P", visible: true, position: 2 },
  "conversao":      { name: "Conversão",          size: "P", visible: true, position: 3 },
  "opps":           { name: "OPPs",               size: "P", visible: true, position: 4 },
  "historico":      { name: "Histórico Mensal",   size: "G", visible: true, position: 5 },
  "pipeline":       { name: "Pipeline",           size: "M", visible: true, position: 6 },
  "calendario":     { name: "Calendário",         size: "P", visible: true, position: 7 },
};

/* ─── Estilos reutilizáveis ───────────────────────────────── */
const CARD: CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E5DDF7",
  borderRadius: 16,
  boxShadow: "0 2px 16px -2px rgba(139,92,246,0.1), 0 1px 4px -1px rgba(0,0,0,0.04)",
};

/* ─── Helpers ─────────────────────────────────────────────── */
function Pill({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ background: color ?? "rgba(139,92,246,0.12)", color: color ? "#fff" : "#8B5CF6" }}
    >
      {children}
    </span>
  );
}

function StatRow({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: "#F0ECF9" }}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="text-right">
        <span className="text-sm font-bold text-foreground">{value}</span>
        {sub && <span className="ml-1.5 text-[10px] text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}

/* ─── Conteúdo dos cards ──────────────────────────────────── */
function CardMetasMes() {
  const atual = abrilFallback;
  const { m1, m2, m3 } = { m1: 60, m2: 70, m3: 80 };
  const pct = (v: number, t: number) => Math.min(100, Math.round((v / t) * 100));
  return (
    <div style={CARD} className="p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-4 w-4 text-pink" />
        <p className="text-sm font-semibold text-foreground">Metas do Mês</p>
      </div>
      <div className="space-y-3">
        {[{ label: "Meta 1", alvo: m1 }, { label: "Meta 2", alvo: m2 }, { label: "Meta 3", alvo: m3 }].map(({ label, alvo }) => (
          <div key={label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground font-medium">{label}</span>
              <span className="font-bold text-foreground">{atual.clientes} / {alvo}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "#F0ECF9" }}>
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{ width: `${pct(atual.clientes, alvo)}%`, background: "linear-gradient(135deg,#8B5CF6,#EC4899)" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardMetrica({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: ElementType; color?: string }) {
  return (
    <div style={CARD} className="p-5 h-full flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="h-8 w-8 flex items-center justify-center rounded-lg" style={{ background: "rgba(139,92,246,0.1)" }}>
          <Icon className={cn("h-4 w-4", color ?? "text-primary")} />
        </div>
      </div>
      <p className="text-3xl font-bold" style={{ background: "linear-gradient(135deg,#8B5CF6,#EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function CardHistorico() {
  const ultimos = historico.slice(-4);
  const COR: Record<string, string> = {
    fail: "#EF4444",
    meta1: "#F59E0B",
    meta2: "#22C55E",
    mega: "#8B5CF6",
  };
  return (
    <div style={CARD} className="p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-pink" />
        <p className="text-sm font-semibold text-foreground">Histórico Mensal</p>
      </div>
      <div className="space-y-2">
        {ultimos.map((m) => (
          <div key={`${m.mes}-${m.ano}`} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2" style={{ background: "#F9F6FE" }}>
            <div className="flex items-center gap-2 min-w-0">
              <Pill color={COR[m.conclusao.tipo]}>{m.mes.slice(0, 3)}</Pill>
              <span className="text-xs font-semibold text-foreground truncate">{m.conclusao.texto}</span>
            </div>
            <span className="shrink-0 text-sm font-bold" style={{ color: COR[m.conclusao.tipo] }}>{m.clientes}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardPipeline() {
  const stages = [
    { label: "Leads", value: abrilFallback.leads },
    { label: "OPPs", value: abrilFallback.opps },
    { label: "Oportunidades", value: abrilFallback.oportunidades },
    { label: "Clientes", value: abrilFallback.clientes },
  ];
  return (
    <div style={CARD} className="p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="h-4 w-4 text-pink" />
        <p className="text-sm font-semibold text-foreground">Pipeline</p>
      </div>
      <div className="space-y-1">
        {stages.map(({ label, value }) => (
          <StatRow key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  );
}

function CardCalendario() {
  const hoje = new Date();
  const dia = hoje.getDate();
  const mes = hoje.toLocaleDateString("pt-BR", { month: "long" });
  const dow = hoje.toLocaleDateString("pt-BR", { weekday: "long" });
  return (
    <div style={CARD} className="p-5 h-full flex flex-col items-center justify-center gap-2">
      <Calendar className="h-6 w-6 text-pink" />
      <p className="text-5xl font-extrabold text-gradient">{dia}</p>
      <p className="text-sm font-semibold text-foreground capitalize">{dow}</p>
      <p className="text-xs text-muted-foreground capitalize">{mes}</p>
    </div>
  );
}

/* ─── Componente principal ────────────────────────────────── */
function DashboardCW() {
  const { editMode, toggleEditMode, cardConfigs, updateCard, saveLayout, saving } = useEditMode(DEFAULT_CONFIGS);

  async function handleSave() {
    await saveLayout();
    toast.success("Layout salvo com sucesso!");
  }

  // Ordena os cards por position
  const orderedCards = Object.entries(cardConfigs).sort(([, a], [, b]) => a.position - b.position);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <PageHeader
        breadcrumb="DASHBOARD CW"
        title="Dashboard CW"
        subtitle="Layout customizado para visão executiva."
        action={
          <div className="flex items-center gap-2">
            {editMode && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#22C55E,#16A34A)", boxShadow: "0 2px 8px rgba(34,197,94,0.3)" }}
              >
                <Save className="h-4 w-4" />
                {saving ? "Salvando..." : "Salvar"}
              </button>
            )}
            <button
              onClick={toggleEditMode}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-90",
                editMode
                  ? "text-white"
                  : "text-white",
              )}
              style={
                editMode
                  ? { background: "linear-gradient(135deg,#EF4444,#DC2626)", boxShadow: "0 2px 8px rgba(239,68,68,0.3)" }
                  : { background: "linear-gradient(135deg,#8B5CF6,#EC4899)", boxShadow: "0 2px 8px rgba(139,92,246,0.3)" }
              }
            >
              {editMode ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              {editMode ? "Cancelar" : "Editar"}
            </button>
          </div>
        }
      />

      {editMode && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium animate-fade-in"
          style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", color: "#8B5CF6" }}
        >
          ✏️ Modo editor ativo — arraste para reordenar, clique no título do card para renomear, use P/M/G para redimensionar, ou ✕ para ocultar.
        </div>
      )}

      {/* Grid de cards */}
      <div className={cn("grid gap-4", "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}>
        {orderedCards.map(([cardId, config]) => {
          const cardContent = getCardContent(cardId);
          if (!cardContent) return null;
          return (
            <EditableCard
              key={cardId}
              cardId={cardId}
              config={config}
              editMode={editMode}
              onUpdate={updateCard}
            >
              {cardContent}
            </EditableCard>
          );
        })}
      </div>
    </div>
  );
}

function getCardContent(cardId: string): ReactNode | null {
  switch (cardId) {
    case "metas-mes":
      return <CardMetasMes />;
    case "clientes":
      return <CardMetrica label="Clientes" value={abrilFallback.clientes} sub="no mês atual" icon={Users} />;
    case "leads":
      return <CardMetrica label="Novos Leads" value={abrilFallback.leads} sub="gerados no mês" icon={Zap} color="text-pink" />;
    case "conversao":
      return <CardMetrica label="Conversão" value={`${abrilFallback.conversao}%`} sub="taxa de conversão" icon={Star} color="text-warning" />;
    case "opps":
      return <CardMetrica label="OPPs" value={abrilFallback.opps} sub="oportunidades abertas" icon={BarChart2} />;
    case "historico":
      return <CardHistorico />;
    case "pipeline":
      return <CardPipeline />;
    case "calendario":
      return <CardCalendario />;
    default:
      return null;
  }
}
