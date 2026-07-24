import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/bibly/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bibly" },
      {
        name: "description",
        content: "Bibly: painel de métricas — leads, funil, comissões, planos vendidos e projeções.",
      },
      { property: "og:title", content: "Bibly" },
      {
        property: "og:description",
        content: "Acompanhe leads, funil de vendas, comissões, planos vendidos, mapa de oportunidades e projeções.",
      },
    ],
  }),
  component: Dashboard,
});
