import { Target } from "lucide-react";

import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { type Column, Panel, RowsEditorDialog } from "@/components/bibly/editors";
import { IconChip } from "@/components/bibly/Playbook";

// ---------------------------------------------------------------------------
// Metas — as metas do PSM organizadas em 3 frentes: ativação/engajamento,
// performance comercial e indicadores financeiros/retenção. Editável pela
// engrenagem de cada painel, persiste no navegador.
// ---------------------------------------------------------------------------

type MetaItem = { metrica: string; valor: string; contexto: string };

const METAS_COLUMNS: Column<MetaItem>[] = [
  { key: "metrica", label: "Métrica" },
  { key: "valor", label: "Valor atual" },
  { key: "contexto", label: "Contexto / meta" },
];

const METAS_ATIVACAO_PADRAO: MetaItem[] = [
  { metrica: "Tempo médio de onboarding", valor: "9 dias", contexto: "meta: até 10 dias" },
  { metrica: "% do canal treinado", valor: "78%", contexto: "meta: 90%" },
  { metrica: "Taxa de acesso ao portal", valor: "64%", contexto: "dos representantes ativos" },
  { metrica: "Consumo de materiais de capacitação", valor: "52%", contexto: "dos módulos concluídos" },
  { metrica: "Ações de co-marketing realizadas", valor: "3", contexto: "no período" },
];

const METAS_COMERCIAL_PADRAO: MetaItem[] = [
  { metrica: "Volume de leads indicados", valor: "27", contexto: "no período" },
  { metrica: "Taxa de conversão por etapa", valor: "18%", contexto: "lead → cliente" },
  { metrica: "Valor total de vendas", valor: "R$ 42.300", contexto: "no período" },
  { metrica: "Ticket médio das oportunidades", valor: "R$ 1.567", contexto: "por venda fechada" },
  { metrica: "Ciclo de vendas no canal", valor: "14 dias", contexto: "média do funil" },
];

const METAS_FINANCEIRO_PADRAO: MetaItem[] = [
  { metrica: "Receita recorrente gerada", valor: "R$ 63.510", contexto: "MRR da carteira" },
  { metrica: "Comissões pagas", valor: "R$ 8.240", contexto: "no período" },
  { metrica: "Margem gerada por canal", valor: "34%", contexto: "sobre a receita" },
  { metrica: "Taxa de churn dos clientes do parceiro", valor: "3,2%", contexto: "mensal" },
  { metrica: "CLV por canal", valor: "R$ 4.980", contexto: "médio por cliente" },
];

function MetaLista({ itens }: { itens: MetaItem[] }) {
  return (
    <ul className="space-y-3">
      {itens.map((m) => (
        <li key={m.metrica} className="flex items-start justify-between gap-3 text-sm">
          <div>
            <div className="font-medium text-foreground">{m.metrica}</div>
            {m.contexto && <div className="text-xs text-muted-foreground">{m.contexto}</div>}
          </div>
          <span className="shrink-0 font-semibold text-foreground">{m.valor}</span>
        </li>
      ))}
    </ul>
  );
}

export function Metas() {
  const [metasAtivacao, setMetasAtivacao] = useLocalStorageState<MetaItem[]>(
    "bibly-metas-ativacao",
    METAS_ATIVACAO_PADRAO,
  );
  const [metasComercial, setMetasComercial] = useLocalStorageState<MetaItem[]>(
    "bibly-metas-comercial",
    METAS_COMERCIAL_PADRAO,
  );
  const [metasFinanceiro, setMetasFinanceiro] = useLocalStorageState<MetaItem[]>(
    "bibly-metas-financeiro",
    METAS_FINANCEIRO_PADRAO,
  );

  return (
    <div className="h-screen overflow-y-auto">
      <div className="px-8 py-8">
        <div className="mb-1.5 flex items-center gap-3.5">
          <IconChip icon={Target} size={48} radius={14} />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Metas</h1>
        </div>
        <p className="mb-7 mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          As três frentes que orientam o trabalho do PSM no canal de representantes.
        </p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel
            title="Ativação e engajamento"
            actions={
              <RowsEditorDialog
                title="ativação e engajamento"
                columns={METAS_COLUMNS}
                rows={metasAtivacao}
                emptyRow={() => ({ metrica: "Nova métrica", valor: "—", contexto: "" })}
                onSave={setMetasAtivacao}
              />
            }
          >
            <MetaLista itens={metasAtivacao} />
          </Panel>

          <Panel
            title="Performance comercial"
            actions={
              <RowsEditorDialog
                title="performance comercial"
                columns={METAS_COLUMNS}
                rows={metasComercial}
                emptyRow={() => ({ metrica: "Nova métrica", valor: "—", contexto: "" })}
                onSave={setMetasComercial}
              />
            }
          >
            <MetaLista itens={metasComercial} />
          </Panel>

          <Panel
            title="Indicadores financeiros e de retenção"
            actions={
              <RowsEditorDialog
                title="indicadores financeiros e de retenção"
                columns={METAS_COLUMNS}
                rows={metasFinanceiro}
                emptyRow={() => ({ metrica: "Nova métrica", valor: "—", contexto: "" })}
                onSave={setMetasFinanceiro}
              />
            }
          >
            <MetaLista itens={metasFinanceiro} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
