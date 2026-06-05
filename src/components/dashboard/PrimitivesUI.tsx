import { cn } from "@/lib/utils";
import { pct } from "@/lib/dashboardUtils";
import type { LucideIcon } from "lucide-react";

const GRAD = "linear-gradient(135deg,#8B5CF6,#EC4899)";
const CARD_STYLE = {
  background: "#FFFFFF",
  border: "1px solid #E5DDF7",
  boxShadow: "0 2px 16px -2px rgba(139,92,246,0.1), 0 1px 4px -1px rgba(0,0,0,0.04)",
} as const;

interface BarProps { value: number; max: number; className?: string; }

export function Bar({ value, max, className }: BarProps) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "#F0ECF9" }}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-700", className)}
        style={{ width: `${pct(value, max)}%`, background: GRAD }}
      />
    </div>
  );
}

interface MetricCardProps {
  title: string; value: string | number; sub?: string;
  icon: LucideIcon; iconClassName?: string; trend?: "up" | "down";
}

export function MetricCard({ title, value, sub, icon: Icon, iconClassName, trend }: MetricCardProps) {
  const trendClass = trend === "down" ? "text-destructive" : trend === "up" ? "text-success" : "text-muted-foreground";
  return (
    <div className="flex flex-col gap-3 rounded-xl p-5 transition-all duration-200 hover:shadow-purple" style={CARD_STYLE}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(139,92,246,0.1)" }}>
          <Icon className={cn("h-4 w-4 text-primary", iconClassName)} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gradient">{value}</p>
      {sub && <p className={cn("text-xs", trendClass)}>{sub}</p>}
    </div>
  );
}

interface MiniMetricCardProps {
  label: string; valor: string | number;
  prev?: string | number | null;
  delta?: { val: number; arrow: string; positive: boolean } | null;
}

export function MiniMetricCard({ label, valor, prev, delta }: MiniMetricCardProps) {
  return (
    <div className="space-y-1 rounded-xl p-3" style={{ background: "#FFFFFF", border: "1px solid #E5DDF7", boxShadow: "0 1px 4px rgba(139,92,246,0.06)" }}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground">{valor}</p>
      {delta && (
        <p className={cn("text-xs font-semibold", delta.positive ? "text-success" : "text-destructive")}>
          {delta.arrow} {delta.val}%
        </p>
      )}
      {prev != null && prev !== "" && <p className="text-xs text-muted-foreground/70">antes: {prev}</p>}
    </div>
  );
}

export function SectionHeader({ icon: Icon, title, right }: { icon: LucideIcon; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-pink" />
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      {right}
    </div>
  );
}
