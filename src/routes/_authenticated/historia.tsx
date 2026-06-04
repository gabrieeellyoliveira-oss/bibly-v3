import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/stub-page";
export const Route = createFileRoute("/_authenticated/historia")({
  head: () => ({ meta: [{ title: "História de Sucesso — Bibly" }] }),
  component: () => <StubPage breadcrumb="HISTÓRIA" title="História de Sucesso" subtitle="Timeline de conquistas mensais." />,
});
