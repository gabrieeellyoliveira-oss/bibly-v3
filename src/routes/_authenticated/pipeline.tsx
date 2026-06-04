import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/stub-page";
import { Input } from "@/components/ui/input";
import { useState } from "react";
function Pipeline() {
  const [u1, setU1] = useState(localStorage.getItem("pipe1") ?? "");
  const [u2, setU2] = useState(localStorage.getItem("pipe2") ?? "");
  return (
    <StubPage breadcrumb="PIPELINE" title="Pipeline Pipedrive" subtitle="Configure URLs dos seus pipelines.">
      <div className="space-y-3">
        <Input placeholder="URL Pipedrive 1" value={u1} onChange={(e) => { setU1(e.target.value); localStorage.setItem("pipe1", e.target.value); }} />
        <Input placeholder="URL Pipedrive 2" value={u2} onChange={(e) => { setU2(e.target.value); localStorage.setItem("pipe2", e.target.value); }} />
        {u1 && <iframe src={u1} className="w-full h-96 rounded-xl border border-border" />}
        {u2 && <iframe src={u2} className="w-full h-96 rounded-xl border border-border" />}
      </div>
    </StubPage>
  );
}
export const Route = createFileRoute("/_authenticated/pipeline")({
  ssr: false,
  head: () => ({ meta: [{ title: "Pipeline — Bibly" }] }),
  component: Pipeline,
});
