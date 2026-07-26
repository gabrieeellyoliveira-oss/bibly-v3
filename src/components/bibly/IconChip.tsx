import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "magenta" | "danger" | "success" | "gold" | "info" | "muted";

const tones: Record<Tone, { bg: string; fg: string }> = {
  primary: { bg: "#f0ebff", fg: "#6d4cff" },
  magenta: { bg: "#fdeaf3", fg: "#d9468f" },
  danger: { bg: "#fdeceb", fg: "#d0453f" },
  success: { bg: "#e7f8ef", fg: "#0f9d58" },
  gold: { bg: "#fef4d6", fg: "#c68a1a" },
  info: { bg: "#dbeafe", fg: "#1d4ed8" },
  muted: { bg: "#eceef5", fg: "#4c5266" },
};

export function IconChip({
  icon: Icon,
  tone = "primary",
  size = "md",
  gradient = false,
  className,
}: {
  icon: LucideIcon;
  tone?: Tone;
  size?: "sm" | "md" | "lg" | "xl";
  gradient?: boolean;
  className?: string;
}) {
  const t = tones[tone];
  const sizes = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-12 w-12", xl: "h-14 w-14" };
  const iconSizes = { sm: 16, md: 18, lg: 22, xl: 26 };
  const style = gradient ? { backgroundImage: "var(--gradient-primary)", color: "#fff" } : { backgroundColor: t.bg, color: t.fg };
  return (
    <div style={style} className={cn("rounded-xl flex items-center justify-center shrink-0", sizes[size], className)}>
      <Icon size={iconSizes[size]} strokeWidth={2.2} />
    </div>
  );
}
