import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/stub-page";
export const Route = createFileRoute("/_authenticated/dashboard-cw")({
  head: () => ({ meta: [{ title: "Dashboard CW — Bibly" }] }),
  component: () => <StubPage breadcrumb="DASHBOARD CW" title="Dashboard CW" subtitle="Layout customizado para visão executiva." />,
});
