import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/top-bar";
import { EditModeProvider } from "@/hooks/useEditModeContext";

const BIBLY_AUTH_KEY = "bibly_auth";

function AuthenticatedLayout() {
  return (
    <EditModeProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto px-5 py-3 animate-fade-in w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </EditModeProvider>
  );
}

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem(BIBLY_AUTH_KEY);
      if (auth !== "true") throw redirect({ to: "/auth" });
    }
  },
  component: AuthenticatedLayout,
});
