import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/stub-page";
export const Route = createFileRoute("/_authenticated/planos")({
  head: () => ({ meta: [{ title: "Planos — Bibly" }] }),
  component: () => <StubPage breadcrumb="PLANOS" title="Seus Planos" subtitle="Organize seus objetivos e iniciativas do mês." />,
});
