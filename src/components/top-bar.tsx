import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, X } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { Link } from "@tanstack/react-router";
import { getSaudacao } from "@/lib/dashboardUtils";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function TopBar() {
  const { data: profile } = useProfile();
  const initials = (profile?.display_name ?? "G").slice(0, 1).toUpperCase();
  const name = profile?.display_name ?? "Gabi";
  const saudacao = getSaudacao();

  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl+K / Cmd+K abre a busca
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Foca o input quando abre
  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [searchOpen]);

  const handleBell = () => {
    toast("Nenhuma notificação nova", {
      description: "Você está em dia com tudo! 🎉",
      duration: 3000,
    });
  };

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
      {searchOpen ? (
        <div
          className="hidden md:flex items-center gap-2 rounded-xl px-3 py-2 text-sm w-64 transition-all"
          style={{ background: "#FFFFFF", border: "1px solid #8B5CF6", boxShadow: "0 0 0 3px rgba(139,92,246,0.12)" }}
        >
          <Search className="h-3.5 w-3.5 shrink-0 text-primary" />
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar..."
            className="flex-1 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
          <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex items-center gap-2 rounded-xl px-3 py-2 text-sm cursor-pointer w-48 transition-all hover:border-primary/40 hover:shadow-md"
          style={{ background: "#FFFFFF", border: "1px solid #E5DDF7", color: "#7A6E8E", boxShadow: "0 1px 4px rgba(139,92,246,0.08)" }}
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs">Buscar...</span>
          <span className="ml-auto text-[10px] rounded px-1 py-0.5" style={{ border: "1px solid #E5DDF7", color: "#7A6E8E" }}>⌘K</span>
        </div>
      )}

      {/* Notifications */}
      <button
        onClick={handleBell}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:border-primary/30 hover:bg-primary/5 active:scale-95"
        style={{ background: "#FFFFFF", border: "1px solid #E5DDF7", color: "#7A6E8E", boxShadow: "0 1px 4px rgba(139,92,246,0.08)" }}
      >
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-pink" />
      </button>

      {/* Avatar → perfil */}
      <Link to="/perfil">
        <Avatar className="h-9 w-9 cursor-pointer transition-all hover:ring-2 hover:ring-primary/40 active:scale-95" style={{ ring: "2px solid rgba(139,92,246,0.3)" }}>
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback className="text-white text-sm font-semibold" style={{ background: "linear-gradient(135deg,#8B5CF6,#EC4899)" }}>{initials}</AvatarFallback>
        </Avatar>
      </Link>
    </header>
  );
}
