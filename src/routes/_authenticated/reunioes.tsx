import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/stub-page";
export const Route = createFileRoute("/_authenticated/reunioes")({
  head: () => ({ meta: [{ title: "Reuniões — Bibly" }] }),
  component: () => <StubPage breadcrumb="REUNIÕES" title="Histórico de Reuniões" subtitle="Taxa de comparecimento e no-shows por dia." />,
});
