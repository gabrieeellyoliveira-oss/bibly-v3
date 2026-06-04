import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/stub-page";
export const Route = createFileRoute("/_authenticated/carreira")({
  head: () => ({ meta: [{ title: "Trilha de Carreira — Bibly" }] }),
  component: () => <StubPage breadcrumb="CARREIRA" title="Trilha de Carreira" subtitle="9 níveis de progressão e faixas salariais." />,
});
