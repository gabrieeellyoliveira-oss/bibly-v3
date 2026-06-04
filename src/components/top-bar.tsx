import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserCircle2 } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { Link } from "@tanstack/react-router";

export function TopBar() {
  const { data: profile } = useProfile();
  const initials = (profile?.display_name ?? "G").slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 backdrop-blur px-4">
      <SidebarTrigger />
      <div className="flex-1" />
      <Button asChild variant="outline" size="sm" className="rounded-full">
        <Link to="/perfil">
          <UserCircle2 className="h-4 w-4" /> Meu Perfil
        </Link>
      </Button>
      <Link to="/perfil">
        <Avatar className="h-9 w-9 ring-2 ring-primary/50 hover:ring-primary transition">
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback className="bg-gradient-primary text-white font-semibold">{initials}</AvatarFallback>
        </Avatar>
      </Link>
    </header>
  );
}
