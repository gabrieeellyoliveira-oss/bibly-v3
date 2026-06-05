import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { Link } from "@tanstack/react-router";
import { getSaudacao } from "@/lib/dashboardUtils";
import { toast } from "sonner";

export function TopBar() {
  const { data: profile } = useProfile();
  const initials = (profile?.display_name ?? "G").slice(0, 1).toUpperCase();
  const name     = profile?.display_name ?? "Gabi";
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
      <div className="flex items-center gap-3 mr-auto min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-md shrink-0">
          <span className="text-white font-bold text-lg">B</span>
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight truncate">
            {saudacao}, {name} 👋
          </p>
          <p className="text-xs text-muted-foreground capitalize truncate">{hoje}</p>
        </div>
      </div>

      {/* Notifications */}
      <button
        onClick={() => toast("Nenhuma notificação nova", { description: "Você está em dia! 🎉", duration: 3000 })}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:bg-primary/10 active:scale-95"
        style={{ background: "#FFFFFF", border: "1px solid #E5DDF7", color: "#7A6E8E", boxShadow: "0 1px 4px rgba(139,92,246,0.08)" }}
      >
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-pink" />
      </button>

      {/* Avatar → perfil */}
      <Link to="/perfil">
        <Avatar className="h-9 w-9 cursor-pointer transition-all hover:ring-2 hover:ring-primary/40 active:scale-95">
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback className="text-white text-sm font-semibold" style={{ background: "linear-gradient(135deg,#8B5CF6,#EC4899)" }}>
            {initials}
          </AvatarFallback>
        </Avatar>
      </Link>
    </header>
  );
}
