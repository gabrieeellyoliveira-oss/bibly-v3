import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/stub-page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/_authenticated/dados")({
  head: () => ({ meta: [{ title: "Dados — Bibly" }] }),
  component: () => (
    <StubPage breadcrumb="DADOS" title="Dados Importados" subtitle="Histórico mensal e importação de planilha.">
      <Tabs defaultValue="atual">
        <TabsList><TabsTrigger value="atual">Junho 2026</TabsTrigger><TabsTrigger value="maio">Maio 2026</TabsTrigger></TabsList>
        <TabsContent value="atual" className="space-y-3 pt-4">
          <p className="text-sm text-muted-foreground">Cole abaixo o texto da planilha para importar:</p>
          <Textarea rows={8} placeholder="Cole aqui o conteúdo da planilha..." />
          <Button className="bg-gradient-primary text-white">Processar dados</Button>
        </TabsContent>
        <TabsContent value="maio" className="pt-4">
          <p className="text-sm text-muted-foreground">Resultados finais de Maio 2026 (histórico preservado).</p>
        </TabsContent>
      </Tabs>
    </StubPage>
  ),
});
