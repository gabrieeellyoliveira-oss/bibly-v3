import { Link, useRouterState } from "@tanstack/react-router";
import {
  Target, BarChart2, CalendarCheck, GitBranch, Star, Sparkles,
  Rocket, Link as LinkIcon, Trophy, LayoutDashboard, LogOut, BookOpen,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";

const items = [
  { title: "Metas", url: "/", icon: Target },
  { title: "Planos", url: "/planos", icon: BookOpen },
  { title: "Dados", url: "/dados", icon: BarChart2 },
  { title: "Reuniões", url: "/reunioes", icon: CalendarCheck },
  { title: "Pipeline", url: "/pipeline", icon: GitBranch },
  { title: "Estudos", url: "/estudos", icon: Star },
  { title: "Ravenna IA", url: "/ravenna", icon: Sparkles },
  { title: "Trilha de Carreira", url: "/carreira", icon: Rocket },
  { title: "Links Importantes", url: "/links", icon: LinkIcon },
  { title: "História de Sucesso", url: "/historia", icon: Trophy },
  { title: "Dashboard CW", url: "/dashboard-cw", icon: LayoutDashboard },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary shadow-glow flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-2xl font-bold tracking-tight">
              Bi<span className="text-gradient">bly</span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-xs font-semibold tracking-wider text-muted-foreground">NAVEGAÇÃO</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active} className="h-10">
                      <Link
                        to={item.url}
                        className={
                          active
                            ? "bg-gradient-primary text-primary-foreground shadow-glow font-medium"
                            : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
                        }
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                        {!collapsed && active && (
                          <span className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/auth";
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
