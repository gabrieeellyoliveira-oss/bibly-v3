import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/stub-page";
export const Route = createFileRoute("/_authenticated/ravenna")({
  head: () => ({ meta: [{ title: "Ravenna IA — Bibly" }] }),
  component: () => <StubPage breadcrumb="RAVENNA IA" title="Scripts e Personas" subtitle="Templates de vendas e personas para roleplay." />,
});
