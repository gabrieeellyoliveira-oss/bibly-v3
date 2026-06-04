import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/stub-page";
export const Route = createFileRoute("/_authenticated/estudos")({
  head: () => ({ meta: [{ title: "Estudos — Bibly" }] }),
  component: () => <StubPage breadcrumb="ESTUDOS" title="Livros e Cursos" subtitle="Acompanhe seu progresso em estudos." />,
});
