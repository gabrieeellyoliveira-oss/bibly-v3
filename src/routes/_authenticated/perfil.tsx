import { createFileRoute } from "@tanstack/react-router";
import { useProfile } from "@/hooks/use-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/perfil")({
  ssr: false,
  head: () => ({ meta: [{ title: "Meu Perfil — Bibly" }] }),
  component: Perfil,
});

function Perfil() {
  const { data: profile } = useProfile();
  const qc = useQueryClient();

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    const path = `${profile.id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) return toast.error(upErr.message);
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await (supabase as any).from("profiles").update({ avatar_url: data.publicUrl }).eq("id", profile.id);
    toast.success("Avatar atualizado!");
    qc.invalidateQueries({ queryKey: ["profile"] });
  }

  async function salvarNome(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;
    const fd = new FormData(e.currentTarget);
    await (supabase as any).from("profiles").update({
      display_name: fd.get("name"),
      subtitle: fd.get("subtitle"),
    }).eq("id", profile.id);
    toast.success("Perfil salvo!");
    qc.invalidateQueries({ queryKey: ["profile"] });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader breadcrumb="PERFIL" title="Meu Perfil" subtitle="Personalize sua experiência." />
      <Card className="shadow-card animate-fade-in">
        <CardHeader><CardTitle>Informações</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 ring-2 ring-primary">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-gradient-primary text-white text-2xl">{(profile?.display_name ?? "G")[0]}</AvatarFallback>
            </Avatar>
            <Input type="file" accept="image/*" onChange={uploadAvatar} />
          </div>
          <form onSubmit={salvarNome} className="space-y-3">
            <div><Label>Nome</Label><Input name="name" defaultValue={profile?.display_name} /></div>
            <div><Label>Subtítulo</Label><Input name="subtitle" defaultValue={profile?.subtitle ?? ""} /></div>
            <Button className="bg-gradient-primary text-white">Salvar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
