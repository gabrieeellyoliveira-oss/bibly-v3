import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/bibly/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurora" },
      {
        name: "description",
        content: "Aurora: PSM Command Center — carteira, funil, comissões, planos vendidos e projeções.",
      },
      { property: "og:title", content: "Aurora" },
      {
        property: "og:description",
        content: "Acompanhe leads, funil de vendas, comissões, planos vendidos, mapa de oportunidades e projeções.",
      },
    ],
  }),
  component: Dashboard,
});
