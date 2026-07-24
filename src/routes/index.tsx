import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/bibly/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bibly — Programa de Representantes CardápioWeb" },
      {
        name: "description",
        content:
          "Bibly: painel de métricas do Programa de Representantes da CardápioWeb — leads, funil, comissões, planos vendidos e projeções.",
      },
      { property: "og:title", content: "Bibly — Programa de Representantes" },
      {
        property: "og:description",
        content:
          "Acompanhe leads, funil de vendas, comissões, planos vendidos, mapa de oportunidades e projeções de ganhos.",
      },
    ],
  }),
  component: Dashboard,
});
