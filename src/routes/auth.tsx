import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Sparkles, Lock, Mail, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: fd.get("email") as string,
      password: fd.get("password") as string,
    });
    setLoading(false);
    if (error) return toast.error("Usuário ou senha incorretos.");
    toast.success("Bem-vinda de volta, Gabi!");
    navigate({ to: "/metas" });
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#171320" }}
    >
      {/* Background glow blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ background: "#8B5CF6" }} />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-15 pointer-events-none" style={{ background: "#EC4899" }} />

      <div className="relative w-full max-w-sm animate-fade-in">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4 shadow-glow" style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)" }}>
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "#F2ECFA" }}>
            Bi<span className="text-gradient">bly</span>
          </h1>
          <p className="text-sm mt-1.5" style={{ color: "#B7ABC8" }}>
            Seu dashboard, sua inteligência
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(36, 28, 51, 0.7)",
            border: "1px solid rgba(139, 92, 246, 0.18)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 40px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.08)",
          }}
        >
          <h2 className="text-lg font-semibold mb-1" style={{ color: "#F2ECFA" }}>Entrar</h2>
          <p className="text-sm mb-6" style={{ color: "#B7ABC8" }}>Acesse seu painel de performance</p>

          <form onSubmit={signIn} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "#B7ABC8" }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#B7ABC8" }} />
                <Input
                  name="email"
                  type="email"
                  placeholder="bibi@email.com"
                  required
                  autoComplete="email"
                  className="pl-9 h-11 rounded-xl border-0 text-sm"
                  style={{
                    background: "rgba(44, 34, 64, 0.8)",
                    color: "#F2ECFA",
                    border: "1px solid rgba(139,92,246,0.18)",
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "#B7ABC8" }}>Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#B7ABC8" }} />
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="pl-9 h-11 rounded-xl border-0 text-sm"
                  style={{
                    background: "rgba(44, 34, 64, 0.8)",
                    color: "#F2ECFA",
                    border: "1px solid rgba(139,92,246,0.18)",
                  }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 mt-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)", boxShadow: "0 0 24px -4px rgba(139,92,246,0.5)" }}
            >
              {loading ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>Entrar <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#B7ABC8" }}>
          Acesso exclusivo · Bibly Dashboard
        </p>
      </div>
    </div>
  );
}
