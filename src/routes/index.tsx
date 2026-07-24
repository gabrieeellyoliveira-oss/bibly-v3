import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/bibly/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bibly — Dashboard PSM Jr. TR3" },
      {
        name: "description",
        content:
          "Bibly: painel de métricas para PSM de canais — ativação, performance comercial, financeiro e retenção.",
      },
      { property: "og:title", content: "Bibly — Dashboard PSM" },
      {
        property: "og:description",
        content:
          "Acompanhe onboarding, funil, receita recorrente, churn e CLV do seu canal de parceiros.",
      },
    ],
  }),
  component: Dashboard,
});
