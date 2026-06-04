import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { Link } from "@tanstack/react-router";
import { getSaudacao } from "@/lib/dashboardUtils";

export function TopBar() {
  const { data: profile } = useProfile();
  const initials = (profile?.display_name ?? "G").slice(0, 1).toUpperCase();
  const name = profile?.display_name ?? "Gabi";
  const saudacao = getSaudacao();

  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center gap-4 px-6 border-b"
      style={{ background: "rgba(244,240,251,0.85)", backdropFilter: "blur(16px)", borderColor: "#E5DDF7" }}
    >
      {/* Greeting */}
      <div className="flex flex-col min-w-0 mr-auto">
        <p className="text-sm font-semibold text-foreground leading-tight truncate">
          {saudacao}, {name} 👋
        </p>
        <p className="text-xs text-muted-foreground capitalize truncate">{hoje}</p>
      </div>

      {/* Search */}
      <div
        className="hidden md:flex items-center gap-2 rounded-xl px-3 py-2 text-sm cursor-pointer w-48 transition-all hover:border-primary/40"
        style={{ background: "#FFFFFF", border: "1px solid #E5DDF7", color: "#7A6E8E", boxShadow: "0 1px 4px rgba(139,92,246,0.08)" }}
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="text-xs">Buscar...</span>
        <span className="ml-auto text-[10px] rounded px-1 py-0.5" style={{ border: "1px solid #E5DDF7", color: "#7A6E8E" }}>⌘K</span>
      </div>

      {/* Notifications */}
      <button
        className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:border-primary/30"
        style={{ background: "#FFFFFF", border: "1px solid #E5DDF7", color: "#7A6E8E", boxShadow: "0 1px 4px rgba(139,92,246,0.08)" }}
      >
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-pink" />
      </button>

      {/* Avatar */}
      <Link to="/perfil">
        <Avatar className="h-9 w-9 cursor-pointer" style={{ ring: "2px solid rgba(139,92,246,0.3)" }}>
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback className="text-white text-sm font-semibold" style={{ background: "linear-gradient(135deg,#8B5CF6,#EC4899)" }}>{initials}</AvatarFallback>
        </Avatar>
      </Link>
    </header>
  );
}
