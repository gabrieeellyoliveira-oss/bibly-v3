import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    if (error) return toast.error(error.message);
    toast.success("Bem-vinda de volta!");
    navigate({ to: "/metas" });
  }

  async function signUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signUp({
      email: fd.get("email") as string,
      password: fd.get("password") as string,
      options: {
        emailRedirectTo: window.location.origin + "/metas",
        data: { display_name: (fd.get("name") as string) || "Gabi" },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Conta criada! Confira seu email.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-hero">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-primary shadow-glow flex items-center justify-center mb-3">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold">Bi<span className="text-gradient">bly</span></h1>
          <p className="text-sm text-muted-foreground mt-1">Seu dashboard, sua inteligência</p>
        </div>
        <Card className="shadow-card border-border bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Acesse sua conta</CardTitle>
            <CardDescription>Entre ou crie seu acesso</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar conta</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <form onSubmit={signIn} className="space-y-4">
                  <div><Label>Email</Label><Input name="email" type="email" required /></div>
                  <div><Label>Senha</Label><Input name="password" type="password" required /></div>
                  <Button disabled={loading} className="w-full bg-gradient-primary text-white shadow-glow">Entrar</Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={signUp} className="space-y-4">
                  <div><Label>Nome</Label><Input name="name" defaultValue="Gabi" /></div>
                  <div><Label>Email</Label><Input name="email" type="email" required /></div>
                  <div><Label>Senha (mín. 6)</Label><Input name="password" type="password" minLength={6} required /></div>
                  <Button disabled={loading} className="w-full bg-gradient-primary text-white shadow-glow">Criar conta</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
