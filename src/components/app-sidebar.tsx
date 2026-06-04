import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Target, BarChart2, GitBranch, Star,
  Rocket, Trophy, LogOut, BookOpen, ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const items = [
  { title: "Metas",          url: "/metas",        icon: Target },
  { title: "Plano de Ação",  url: "/plano-acao",   icon: ListChecks },
  { title: "Planos",         url: "/planos",        icon: BookOpen },
  { title: "Dados",          url: "/dados",         icon: BarChart2 },
  { title: "Pipeline",       url: "/pipeline",      icon: GitBranch },
  { title: "Estudos",        url: "/estudos",       icon: Star },
  { title: "Trilha",         url: "/carreira",      icon: Rocket },
  { title: "História",       url: "/historia",      icon: Trophy },
];

export function AppSidebar() {
  const pathname  = useRouterState({ select: (r) => r.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const navigate  = useNavigate();

  return (
    <aside
      className={cn("relative flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-300 ease-in-out")}
      style={{ width: collapsed ? 64 : 220, background: "#120D22", borderRight: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Logo */}
      <div className={cn("flex items-center px-4 py-5 gap-3", collapsed && "justify-center px-0")}>
        <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-glow overflow-hidden" style={{ background: "linear-gradient(135deg,#EC4899,#8B5CF6)" }}>
          <span className="text-white font-black text-lg leading-none">B</span>
        </div>
        {!collapsed && (
          <span className="text-xl font-bold tracking-tight text-white">
            Bi<span style={{ background: "linear-gradient(135deg,#A78BFA,#F472B6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>bly</span>
          </span>
        )}
      </div>

      <div className="mx-3 h-px mb-2" style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url));
          return (
            <Link
              key={item.url} to={item.url}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group",
                collapsed && "justify-center px-0",
                !isActive && "text-white/50 hover:text-white hover:bg-white/[0.06]",
              )}
              style={isActive ? { color: "white" } : {}}
            >
              {isActive && <span className="absolute inset-0 rounded-xl" style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.35) 0%,rgba(236,72,153,0.25) 100%)", border: "1px solid rgba(236,72,153,0.3)" }} />}
              {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{ background: "linear-gradient(135deg,#8B5CF6,#EC4899)" }} />}
              <item.icon className={cn("h-4 w-4 shrink-0 relative z-10", isActive ? "text-pink" : "text-white/40 group-hover:text-white/70")} />
              {!collapsed && <span className="relative z-10 truncate">{item.title}</span>}
              {!collapsed && isActive && <span className="ml-auto relative z-10 h-1.5 w-1.5 rounded-full bg-pink animate-pulse-dot" />}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 h-px mt-2" style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* Foco de hoje → Plano de Ação */}
      {!collapsed && (
        <div className="mx-2 my-2 rounded-xl p-3 space-y-2" style={{ background: "linear-gradient(135deg,rgba(236,72,153,0.25),rgba(139,92,246,0.2))", border: "1px solid rgba(236,72,153,0.3)" }}>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-lg flex items-center justify-center" style={{ background: "rgba(236,72,153,0.3)" }}>
              <Target className="h-3 w-3 text-pink" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-pink">Foco de hoje</span>
          </div>
          <p className="text-xs font-semibold text-white">Concluir fechamentos do dia</p>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
            <div className="h-full rounded-full" style={{ width: "57%", background: "linear-gradient(90deg,#EC4899,#A855F7)" }} />
          </div>
          <button
            onClick={() => navigate({ to: "/plano-acao" })}
            className="w-full h-7 rounded-lg text-[10px] font-semibold text-white transition-all hover:opacity-80 cursor-pointer"
            style={{ background: "linear-gradient(135deg,#8B5CF6,#EC4899)" }}
          >
            Ver plano de ação
          </button>
        </div>
      )}

      {/* Sair */}
      <div className="p-2 pb-4">
        <button
          onClick={() => { localStorage.removeItem("bibly_auth"); window.location.href = "/auth"; }}
          className={cn("flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all", collapsed && "justify-center px-0")}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] z-50 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
        style={{ background: "#FFFFFF", border: "1px solid #E5DDF7", color: "#7A6E8E", boxShadow: "0 2px 8px rgba(139,92,246,0.15)" }}
      >
        {collapsed ? "›" : "‹"}
      </button>
    </aside>
  );
}
