import type { ReactNode } from "react";

export function PageHeader({
  breadcrumb, title, subtitle, action,
}: { breadcrumb?: ReactNode; title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-6 md:p-8 mb-6 animate-fade-in">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.62_0.24_295/0.3),transparent_60%)]" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          {breadcrumb && (
            <div className="text-xs font-semibold tracking-wider text-pink uppercase mb-2">{breadcrumb}</div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
