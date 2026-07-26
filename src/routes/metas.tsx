import { createFileRoute } from "@tanstack/react-router";
import { Target, Rocket, TrendingUp, PiggyBank } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { IconChip } from "@/components/bibly/IconChip";
import { EditGear } from "@/components/bibly/EditGear";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { METAS_INIT } from "@/lib/aurora-data";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/metas")({
  head: () => ({
    meta: [
      { title: "Metas — Aurora" },
      { name: "description", content: "Ativação, performance comercial e indicadores financeiros do canal." },
      { property: "og:title", content: "Metas — Aurora" },
      { property: "og:description", content: "Painéis editáveis de metas por área." },
    ],
  }),
  component: Metas,
});

type Row = { label: string; value: string; ctx: string };
type Tone = "primary" | "magenta" | "success";

function Panel({ title, icon, tone, keyName, initial }: { title: string; icon: LucideIcon; tone: Tone; keyName: string; initial: Row[] }) {
  const [rows, setRows] = useLocalStorageState<Row[]>(`aurora.metas.${keyName}`, initial);
  return (
    <div className="bg-card rounded-2xl shadow-card p-6 flex flex-col">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <IconChip icon={icon} tone={tone} />
          <h3 className="font-bold">{title}</h3>
        </div>
        <EditGear title={`Editar ${title}`}>
          {() => (
            <div className="space-y-2">
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-[1fr,auto,auto] gap-2">
                  <Input
                    value={r.label}
                    onChange={(e) => {
                      const c = [...rows];
                      c[i] = { ...c[i], label: e.target.value };
                      setRows(c);
                    }}
                  />
                  <Input
                    className="w-32"
                    value={r.value}
                    onChange={(e) => {
                      const c = [...rows];
                      c[i] = { ...c[i], value: e.target.value };
                      setRows(c);
                    }}
                  />
                  <button type="button" className="text-destructive px-2" onClick={() => setRows(rows.filter((_, j) => j !== i))}>
                    ×
                  </button>
                </div>
              ))}
              <button type="button" className="text-sm text-primary font-semibold" onClick={() => setRows([...rows, { label: "Nova métrica", value: "0", ctx: "" }])}>
                + Adicionar
              </button>
            </div>
          )}
        </EditGear>
      </div>
      <ul className="mt-4 space-y-4 flex-1">
        {rows.map((r, i) => (
          <li key={i} className="flex items-start justify-between gap-3 pb-3 border-b last:border-b-0">
            <div className="min-w-0">
              <div className="text-sm font-medium">{r.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{r.ctx}</div>
            </div>
            <div className="text-lg font-bold text-gradient shrink-0">{r.value}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Metas() {
  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <IconChip icon={Target} tone="primary" size="xl" gradient />
        <div>
          <h1 className="text-3xl font-bold">Metas</h1>
          <p className="text-muted-foreground text-sm mt-1">Painéis de ativação, performance e finanças — editáveis por painel.</p>
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel title="Ativação e engajamento" icon={Rocket} tone="primary" keyName="ativacao" initial={METAS_INIT.ativacao} />
        <Panel title="Performance comercial" icon={TrendingUp} tone="magenta" keyName="performance" initial={METAS_INIT.performance} />
        <Panel title="Financeiro e retenção" icon={PiggyBank} tone="success" keyName="financeiro" initial={METAS_INIT.financeiro} />
      </div>
    </div>
  );
}
