import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, BookOpen, MessageSquare, Download, Briefcase, Users, Workflow, Calendar, Tag, Award, Target, ChevronDown, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Item = { to: string; label: string; icon: LucideIcon };
type Group = { label: string; items: Item[] };

const groups: Group[] = [
  {
    label: "Principal",
    items: [
      { to: "/", label: "Visão Geral", icon: LayoutDashboard },
      { to: "/playbook", label: "Playbook", icon: BookOpen },
      { to: "/follow-ups", label: "Follow-ups", icon: MessageSquare },
      { to: "/materiais", label: "Materiais", icon: Download },
    ],
  },
  {
    label: "Carteira",
    items: [
      { to: "/carteira", label: "Carteira", icon: Briefcase },
      { to: "/clientes", label: "Clientes", icon: Users },
      { to: "/pipeline", label: "Pipeline", icon: Workflow },
      { to: "/agenda", label: "Agenda", icon: Calendar },
    ],
  },
  {
    label: "Institucional",
    items: [
      { to: "/planos", label: "Planos e Preços", icon: Tag },
      { to: "/progressao", label: "Progressão de Carreira", icon: Award },
      { to: "/metas", label: "Metas", icon: Target },
    ],
  },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="aurora-sidebar fixed inset-y-0 left-0 z-30 w-[250px] flex-col bg-sidebar border-r border-sidebar-border">
      <div className="p-5 flex items-center gap-3">
        <div className="h-14 w-14 rounded-2xl flex items-center justify-center gradient-primary shadow-card">
          <Star size={26} className="text-white" fill="currentColor" />
        </div>
        <div className="min-w-0">
          <div className="text-lg font-bold tracking-tight text-sidebar-foreground">AURORA</div>
          <div className="text-[10px] font-semibold tracking-widest text-sidebar-muted uppercase">Clareza para agir</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-sidebar-muted uppercase">{g.label}</div>
            <ul className="space-y-1">
              {g.items.map((it) => {
                const active = pathname === it.to;
                return (
                  <li key={it.to}>
                    <Link
                      to={it.to}
                      className={[
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/85 hover:bg-white/5",
                      ].join(" ")}
                    >
                      <it.icon size={18} strokeWidth={active ? 2.4 : 2} />
                      <span>{it.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-semibold shrink-0">GO</div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#f2a6ce" }}>
            PSM JR III
          </div>
          <div className="text-sm font-semibold truncate text-sidebar-foreground">Gabrielly Oliveira</div>
          <div className="text-xs text-sidebar-muted truncate">PSM Representantes</div>
        </div>
        <ChevronDown size={16} className="text-sidebar-muted" />
      </div>
    </aside>
  );
}
