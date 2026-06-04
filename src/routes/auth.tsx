import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-hero">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-primary shadow-glow flex items-center justify-center mb-3">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Bi<span className="bg-gradient-hero bg-clip-text text-transparent">bly</span></h1>
          <p className="text-sm text-muted-foreground mt-1">Seu dashboard, sua inteligência</p>
        </div>
        <Card className="shadow-card border-border bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>Acesse seu dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={signIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input name="email" type="email" placeholder="bibi@email.com" required autoComplete="email" />
              </div>
              <div className="space-y-1.5">
                <Label>Senha</Label>
                <Input name="password" type="password" placeholder="••••••••" required autoComplete="current-password" />
              </div>
              <Button disabled={loading} className="w-full bg-gradient-primary text-white shadow-glow hover:opacity-90">
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
