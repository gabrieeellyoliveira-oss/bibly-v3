import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/stub-page";
export const Route = createFileRoute("/_authenticated/links")({
  head: () => ({ meta: [{ title: "Links — Bibly" }] }),
  component: () => <StubPage breadcrumb="LINKS" title="Links Importantes" subtitle="Acesso rápido às ferramentas do dia a dia." />,
});
