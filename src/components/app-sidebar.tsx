import { Link, useRouterState } from "@tanstack/react-router";
import {
  Target, BarChart2, CalendarCheck, GitBranch, Star, Sparkles,
  Rocket, Trophy, LogOut, BookOpen, Users, LayoutGrid,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useState } from "react";

const items = [
  { title: "Metas",            url: "/metas",        icon: Target },
  { title: "Dados",            url: "/dados",         icon: BarChart2 },
  { title: "Reuniões",         url: "/reunioes",      icon: CalendarCheck },
  { title: "Pipeline",         url: "/pipeline",      icon: GitBranch },
  { title: "Estudos",          url: "/estudos",       icon: Star },
  { title: "Ravenna IA",       url: "/ravenna",       icon: Sparkles },
  { title: "Trilha",           url: "/carreira",      icon: Rocket },
  { title: "História",         url: "/historia",      icon: Trophy },
  { title: "Planos",           url: "/planos",        icon: BookOpen },
  { title: "Dashboard CW",     url: "/dashboard-cw",  icon: LayoutGrid },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out shrink-0",
        "border-r border-white/[0.05]",
        collapsed ? "w-[64px]" : "w-[220px]",
      )}
      style={{ background: "rgba(16, 11, 26, 0.97)", backdropFilter: "blur(20px)" }}
    >
      {/* Logo */}
      <div className={cn("flex items-center px-4 py-5 gap-3", collapsed && "justify-center px-0")}>
        <div className="h-8 w-8 rounded-xl bg-gradient-primary shadow-glow flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-xl font-bold tracking-tight text-foreground">
            Bi<span className="text-gradient">bly</span>
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="mx-3 h-px bg-white/[0.05] mb-2" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url));
          return (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "text-white"
                  : "text-[#B7ABC8] hover:text-white hover:bg-white/[0.05]",
                collapsed && "justify-center px-0 rounded-xl",
              )}
            >
              {/* Active pill background */}
              {isActive && (
                <span
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(236,72,153,0.15) 100%)", border: "1px solid rgba(139,92,246,0.25)" }}
                />
              )}
              {/* Active left indicator */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-primary" />
              )}
              <item.icon className={cn("h-4 w-4 shrink-0 relative z-10", isActive ? "text-primary" : "text-[#B7ABC8] group-hover:text-white")} />
              {!collapsed && <span className="relative z-10 truncate">{item.title}</span>}
              {!collapsed && isActive && (
                <span className="ml-auto relative z-10 h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 h-px bg-white/[0.05] mt-2" />

      {/* Footer */}
      <div className="p-2 pb-4">
        <button
          onClick={async () => { await supabase.auth.signOut(); window.location.href = "/auth"; }}
          className={cn(
            "flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-[#B7ABC8] hover:text-white hover:bg-white/[0.05] transition-all duration-150",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] z-50 h-6 w-6 rounded-full border border-white/10 bg-[#1F182B] text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors text-xs shadow-card"
        aria-label="Toggle sidebar"
      >
        {collapsed ? "›" : "‹"}
      </button>
    </aside>
  );
}
