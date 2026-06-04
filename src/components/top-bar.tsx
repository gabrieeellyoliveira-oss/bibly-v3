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
      className="sticky top-0 z-30 flex h-16 items-center gap-4 px-6 border-b border-white/[0.05]"
      style={{ background: "rgba(23, 19, 32, 0.9)", backdropFilter: "blur(20px)" }}
    >
      {/* Greeting */}
      <div className="flex flex-col min-w-0 mr-auto">
        <p className="text-sm font-semibold text-foreground leading-tight truncate">
          {saudacao}, {name} 👋
        </p>
        <p className="text-xs text-muted-foreground capitalize truncate">{hoje}</p>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05] transition-colors cursor-pointer w-48">
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="text-xs">Buscar...</span>
        <span className="ml-auto text-[10px] border border-white/10 rounded px-1 py-0.5">⌘K</span>
      </div>

      {/* Notifications */}
      <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-muted-foreground hover:text-foreground hover:bg-white/[0.07] transition-all">
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-pink" />
      </button>

      {/* Avatar */}
      <Link to="/perfil">
        <Avatar className="h-9 w-9 ring-2 ring-primary/30 hover:ring-primary/60 transition-all cursor-pointer">
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback className="bg-gradient-primary text-white text-sm font-semibold">{initials}</AvatarFallback>
        </Avatar>
      </Link>
    </header>
  );
}
