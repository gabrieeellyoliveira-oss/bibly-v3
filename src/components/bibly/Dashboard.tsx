import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Building2,
  DollarSign,
  Flower2,
  LayoutDashboard,
  MapPin,
  Package,
  PiggyBank,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { type Column, ObjectEditorDialog, RowsEditorDialog } from "@/components/bibly/editors";

// ---------------------------------------------------------------------------
// Dados de exemplo — Programa de Representantes CardápioWeb
// Tudo aqui é editável pela engrenagem em cada painel (persiste no navegador).
// ---------------------------------------------------------------------------

type StatusLead = "novo" | "contatado" | "visitado" | "fechado" | "cancelado";

type Representante = {
  nome: string;
  cidade: string;
  regiao: string;
  leads: Record<StatusLead, number>;
  clientesAtivos: number;
  churn: number;
  vendasPorMes: number;
};

type RepresentanteRow = {
  nome: string;
  cidade: string;
  regiao: string;
  leadsNovo: number;
  leadsContatado: number;
  leadsVisitado: number;
  leadsFechado: number;
  leadsCancelado: number;
  clientesAtivos: number;
  churn: number;
  vendasPorMes: number;
};

function toRow(r: Representante): RepresentanteRow {
  return {
    nome: r.nome,
    cidade: r.cidade,
    regiao: r.regiao,
    leadsNovo: r.leads.novo,
    leadsContatado: r.leads.contatado,
    leadsVisitado: r.leads.visitado,
    leadsFechado: r.leads.fechado,
    leadsCancelado: r.leads.cancelado,
    clientesAtivos: r.clientesAtivos,
    churn: r.churn,
    vendasPorMes: r.vendasPorMes,
  };
}

function fromRow(row: RepresentanteRow): Representante {
  return {
    nome: row.nome,
    cidade: row.cidade,
    regiao: row.regiao,
    leads: {
      novo: Number(row.leadsNovo) || 0,
      contatado: Number(row.leadsContatado) || 0,
      visitado: Number(row.leadsVisitado) || 0,
      fechado: Number(row.leadsFechado) || 0,
      cancelado: Number(row.leadsCancelado) || 0,
    },
    clientesAtivos: Number(row.clientesAtivos) || 0,
    churn: Number(row.churn) || 0,
    vendasPorMes: Number(row.vendasPorMes) || 0,
  };
}

const REPRESENTANTE_COLUMNS: Column<RepresentanteRow>[] = [
  { key: "nome", label: "Nome" },
  { key: "cidade", label: "Cidade" },
  { key: "regiao", label: "Região" },
  { key: "leadsNovo", label: "Leads novo", type: "number" },
  { key: "leadsContatado", label: "Leads contatado", type: "number" },
  { key: "leadsVisitado", label: "Leads visitado", type: "number" },
  { key: "leadsFechado", label: "Leads fechado", type: "number" },
  { key: "leadsCancelado", label: "Leads cancelado", type: "number" },
  { key: "clientesAtivos", label: "Clientes ativos", type: "number" },
  { key: "churn", label: "Churn (%)", type: "number" },
  { key: "vendasPorMes", label: "Vendas fechadas / mês", type: "number" },
];

const REPRESENTANTES_PADRAO: Representante[] = [
  { nome: "Marina Alves", cidade: "São Paulo, SP", regiao: "Sudeste", leads: { novo: 18, contatado: 14, visitado: 9, fechado: 12, cancelado: 2 }, clientesAtivos: 58, churn: 3.4, vendasPorMes: 6 },
  { nome: "Diego Ferreira", cidade: "Belo Horizonte, MG", regiao: "Sudeste", leads: { novo: 15, contatado: 10, visitado: 7, fechado: 9, cancelado: 3 }, clientesAtivos: 52, churn: 5.1, vendasPorMes: 5 },
  { nome: "Camila Rocha", cidade: "Porto Alegre, RS", regiao: "Sul", leads: { novo: 11, contatado: 9, visitado: 6, fechado: 8, cancelado: 1 }, clientesAtivos: 41, churn: 2.8, vendasPorMes: 4 },
  { nome: "Thiago Nunes", cidade: "Curitiba, PR", regiao: "Sul", leads: { novo: 9, contatado: 6, visitado: 4, fechado: 5, cancelado: 2 }, clientesAtivos: 27, churn: 7.2, vendasPorMes: 3 },
  { nome: "Larissa Costa", cidade: "Recife, PE", regiao: "Nordeste", leads: { novo: 14, contatado: 11, visitado: 8, fechado: 10, cancelado: 2 }, clientesAtivos: 46, churn: 4.6, vendasPorMes: 5 },
  { nome: "Bruno Salgado", cidade: "Salvador, BA", regiao: "Nordeste", leads: { novo: 8, contatado: 5, visitado: 3, fechado: 4, cancelado: 3 }, clientesAtivos: 19, churn: 9.4, vendasPorMes: 2 },
  { nome: "Fernanda Lima", cidade: "Goiânia, GO", regiao: "Centro-Oeste", leads: { novo: 7, contatado: 5, visitado: 4, fechado: 6, cancelado: 1 }, clientesAtivos: 33, churn: 3.9, vendasPorMes: 3 },
  { nome: "Rafael Teixeira", cidade: "Manaus, AM", regiao: "Norte", leads: { novo: 5, contatado: 3, visitado: 2, fechado: 3, cancelado: 1 }, clientesAtivos: 14, churn: 6.5, vendasPorMes: 2 },
];

type Parametros = {
  ticketMedio: number;
  retencaoMeses: number;
  bonusClientesMin: number;
  bonusChurnMax: number;
};

const PARAMETROS_PADRAO: Parametros = {
  ticketMedio: 219,
  retencaoMeses: 14,
  bonusClientesMin: 50,
  bonusChurnMax: 8,
};

const PARAMETROS_FIELDS: Column<Parametros>[] = [
  { key: "ticketMedio", label: "Ticket médio (R$/mês por cliente)", type: "number" },
  { key: "retencaoMeses", label: "Tempo médio de retenção (meses)", type: "number" },
  { key: "bonusClientesMin", label: "Bônus performance — mínimo de clientes ativos", type: "number" },
  { key: "bonusChurnMax", label: "Bônus performance — churn máximo (%)", type: "number" },
];

type PlanoVendido = { plano: string; vendas: number };
const PLANOS_COLUMNS: Column<PlanoVendido>[] = [
  { key: "plano", label: "Plano" },
  { key: "vendas", label: "Vendas", type: "number" },
];
const PLANOS_PADRAO: PlanoVendido[] = [
  { plano: "Delivery", vendas: 34 },
  { plano: "Mesas", vendas: 21 },
  { plano: "Premium", vendas: 16 },
];

type ModuloAdicional = { modulo: string; vendas: number };
const MODULOS_COLUMNS: Column<ModuloAdicional>[] = [
  { key: "modulo", label: "Módulo" },
  { key: "vendas", label: "Vendas", type: "number" },
];
const MODULOS_PADRAO: ModuloAdicional[] = [
  { modulo: "Cardápio Digital (QR Code)", vendas: 41 },
  { modulo: "Integração iFood", vendas: 29 },
  { modulo: "Autoatendimento / Totem", vendas: 18 },
  { modulo: "Gestão de Estoque", vendas: 15 },
  { modulo: "Split de Comandas", vendas: 9 },
];

type ComissaoMes = { mes: string; base: number; implementacao: number; suporte: number; bonus: number };
const COMISSAO_COLUMNS: Column<ComissaoMes>[] = [
  { key: "mes", label: "Mês" },
  { key: "base", label: "Base (R$)", type: "number" },
  { key: "implementacao", label: "Implementação (R$)", type: "number" },
  { key: "suporte", label: "Suporte (R$)", type: "number" },
  { key: "bonus", label: "Bônus (R$)", type: "number" },
];
const COMISSAO_MENSAL_PADRAO: ComissaoMes[] = [
  { mes: "Fev", base: 3200, implementacao: 2900, suporte: 2600, bonus: 1100 },
  { mes: "Mar", base: 3400, implementacao: 3100, suporte: 2800, bonus: 1300 },
  { mes: "Abr", base: 3700, implementacao: 3300, suporte: 3000, bonus: 1500 },
  { mes: "Mai", base: 3900, implementacao: 3500, suporte: 3200, bonus: 1700 },
  { mes: "Jun", base: 4200, implementacao: 3800, suporte: 3400, bonus: 2000 },
  { mes: "Jul", base: 4500, implementacao: 4100, suporte: 3700, bonus: 2300 },
];

const chartColors = ["#2563eb", "#059669", "#d97706", "#dc2626", "#7c3aed"];

function comissaoDoRepresentante(r: Representante, p: Parametros) {
  const base = 10;
  const implementacao = 10;
  const suporte = 10;
  const bonusPerformance = r.clientesAtivos >= p.bonusClientesMin && r.churn < p.bonusChurnMax ? 10 : 0;
  const total = Math.min(base + implementacao + suporte + bonusPerformance, 40);
  return { base, implementacao, suporte, bonusPerformance, total };
}

// ---------------------------------------------------------------------------

export function Dashboard() {
  const [tab, setTab] = useState("visao");

  const [representantes, setRepresentantes] = useLocalStorageState<Representante[]>(
    "bibly-representantes",
    REPRESENTANTES_PADRAO,
  );
  const [parametros, setParametros] = useLocalStorageState<Parametros>("bibly-parametros", PARAMETROS_PADRAO);
  const [planosVendidos, setPlanosVendidos] = useLocalStorageState<PlanoVendido[]>("bibly-planos", PLANOS_PADRAO);
  const [modulosAdicionais, setModulosAdicionais] = useLocalStorageState<ModuloAdicional[]>(
    "bibly-modulos",
    MODULOS_PADRAO,
  );
  const [comissaoMensal, setComissaoMensal] = useLocalStorageState<ComissaoMes[]>(
    "bibly-comissao-mensal",
    COMISSAO_MENSAL_PADRAO,
  );

  const representantesEditor = (
    <RowsEditorDialog
      title="representantes"
      description="Ajuste leads, clientes ativos, churn e ritmo de vendas de cada representante."
      columns={REPRESENTANTE_COLUMNS}
      rows={representantes.map(toRow)}
      emptyRow={() =>
        toRow({
          nome: "Novo representante",
          cidade: "",
          regiao: "Sudeste",
          leads: { novo: 0, contatado: 0, visitado: 0, fechado: 0, cancelado: 0 },
          clientesAtivos: 0,
          churn: 0,
          vendasPorMes: 0,
        })
      }
      onSave={(rows) => setRepresentantes(rows.map(fromRow))}
    />
  );

  const parametrosEditor = (
    <ObjectEditorDialog
      title="parâmetros gerais"
      description="Ticket médio, retenção e regra do bônus de performance."
      fields={PARAMETROS_FIELDS}
      value={parametros}
      onSave={setParametros}
    />
  );

  const planosEditor = (
    <RowsEditorDialog
      title="planos vendidos"
      columns={PLANOS_COLUMNS}
      rows={planosVendidos}
      emptyRow={() => ({ plano: "Novo plano", vendas: 0 })}
      onSave={setPlanosVendidos}
    />
  );

  const modulosEditor = (
    <RowsEditorDialog
      title="módulos adicionais"
      columns={MODULOS_COLUMNS}
      rows={modulosAdicionais}
      emptyRow={() => ({ modulo: "Novo módulo", vendas: 0 })}
      onSave={setModulosAdicionais}
    />
  );

  const comissaoEditor = (
    <RowsEditorDialog
      title="comissão mensal"
      columns={COMISSAO_COLUMNS}
      rows={comissaoMensal}
      emptyRow={() => ({ mes: "Novo mês", base: 0, implementacao: 0, suporte: 0, bonus: 0 })}
      onSave={setComissaoMensal}
    />
  );

  const totalRepresentantes = representantes.length;
  const totalLeads = useMemo(
    () => representantes.reduce((acc, r) => acc + Object.values(r.leads).reduce((a, b) => a + b, 0), 0),
    [representantes],
  );
  const totalClientesFechados = useMemo(
    () => representantes.reduce((acc, r) => acc + r.leads.fechado, 0),
    [representantes],
  );
  const faturamentoMensal = useMemo(
    () => representantes.reduce((acc, r) => acc + r.clientesAtivos * parametros.ticketMedio, 0),
    [representantes, parametros.ticketMedio],
  );
  const comissaoTotalMes = useMemo(
    () =>
      representantes.reduce((acc, r) => {
        const { total } = comissaoDoRepresentante(r, parametros);
        return acc + r.clientesAtivos * parametros.ticketMedio * (total / 100);
      }, 0),
    [representantes, parametros],
  );

  const funilData = useMemo(() => {
    const soma = (status: StatusLead) => representantes.reduce((acc, r) => acc + r.leads[status], 0);
    return [
      { etapa: "Novo", valor: soma("novo") + soma("contatado") + soma("visitado") + soma("fechado") },
      { etapa: "Contatado", valor: soma("contatado") + soma("visitado") + soma("fechado") },
      { etapa: "Visitado", valor: soma("visitado") + soma("fechado") },
      { etapa: "Cliente fechado", valor: soma("fechado") },
    ];
  }, [representantes]);
  const totalCancelados = useMemo(
    () => representantes.reduce((acc, r) => acc + r.leads.cancelado, 0),
    [representantes],
  );

  const porRegiao = useMemo(() => {
    const map = new Map<string, { regiao: string; leads: number; clientes: number }>();
    for (const r of representantes) {
      const leadsTotal = Object.values(r.leads).reduce((a, b) => a + b, 0);
      const atual = map.get(r.regiao) ?? { regiao: r.regiao, leads: 0, clientes: 0 };
      atual.leads += leadsTotal;
      atual.clientes += r.clientesAtivos;
      map.set(r.regiao, atual);
    }
    return Array.from(map.values()).sort((a, b) => b.leads - a.leads);
  }, [representantes]);

  const porCidade = useMemo(
    () =>
      [...representantes]
        .map((r) => ({
          cidade: r.cidade,
          regiao: r.regiao,
          leads: Object.values(r.leads).reduce((a, b) => a + b, 0),
          clientes: r.clientesAtivos,
        }))
        .sort((a, b) => b.leads - a.leads),
    [representantes],
  );

  const projecao = useMemo(() => {
    let acumulado = 0;
    return Array.from({ length: 6 }, (_, i) => {
      const mesIndex = i + 1;
      const novosClientesMes = representantes.reduce((acc, r) => acc + r.vendasPorMes, 0);
      const receitaNovaMes = novosClientesMes * parametros.ticketMedio * mesIndex;
      acumulado = faturamentoMensal * mesIndex + receitaNovaMes * (mesIndex / 2);
      const ganhoEstimado = acumulado * 0.18; // comissão média ponderada ~18%
      return {
        mes: `M+${mesIndex}`,
        ganhoProjetado: Math.round(ganhoEstimado / 1000),
      };
    });
  }, [representantes, parametros.ticketMedio, faturamentoMensal]);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="hidden md:flex w-60 flex-col gap-1 border-r border-sidebar-border bg-sidebar px-4 py-6 sticky top-0 h-screen">
          <div className="flex items-center gap-2 px-2 pb-6">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/70 text-primary-foreground shadow-[var(--shadow-soft)]">
              <Flower2 className="h-5 w-5" />
            </div>
            <div className="text-lg font-semibold tracking-tight text-sidebar-foreground">Bibly</div>
          </div>
          {[
            { icon: LayoutDashboard, label: "Visão geral", active: true },
            { icon: Users, label: "Representantes" },
            { icon: TrendingUp, label: "Funil de vendas" },
            { icon: PiggyBank, label: "Comissões" },
            { icon: Settings, label: "Configurações" },
          ].map((item) => (
            <button
              key={item.label}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                item.active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 min-w-0">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/80 px-6 py-5 backdrop-blur">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Dashboard</div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Bibly</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                {totalRepresentantes} representantes ativos
              </Badge>
              <Badge className="bg-primary/80 text-primary-foreground hover:bg-primary/80">Q3 · 2026</Badge>
            </div>
          </header>

          <div className="px-6 py-6 space-y-6">
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <HeroCard icon={Users} title="Representantes ativos" value={String(totalRepresentantes)} caption="No programa" edit={representantesEditor} />
              <HeroCard icon={BadgeCheck} title="Leads cadastrados" value={String(totalLeads)} caption="Todas as etapas" edit={representantesEditor} />
              <HeroCard icon={Building2} title="Clientes fechados" value={String(totalClientesFechados)} caption="Total acumulado" edit={representantesEditor} />
              <HeroCard
                icon={DollarSign}
                title="Faturamento mensal"
                value={faturamentoMensal.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                caption="Carteira ativa"
                edit={parametrosEditor}
              />
              <HeroCard
                icon={PiggyBank}
                title="Comissão do mês"
                value={comissaoTotalMes.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                caption="Total pago aos reps"
                edit={parametrosEditor}
              />
            </section>

            <Tabs value={tab} onValueChange={setTab} className="space-y-6">
              <TabsList className="w-full flex-wrap justify-start gap-1 bg-secondary/70 h-auto">
                <TabsTrigger value="visao">Visão geral</TabsTrigger>
                <TabsTrigger value="representantes">Por representante</TabsTrigger>
                <TabsTrigger value="funil">Funil de vendas</TabsTrigger>
                <TabsTrigger value="comissoes">Comissões</TabsTrigger>
                <TabsTrigger value="planos">Planos vendidos</TabsTrigger>
                <TabsTrigger value="mapa">Mapa de oportunidades</TabsTrigger>
                <TabsTrigger value="projecoes">Projeções</TabsTrigger>
              </TabsList>

              {/* VISÃO GERAL */}
              <TabsContent value="visao" className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-3">
                  <Panel title="Funil comercial" subtitle="Leads → clientes fechados" className="lg:col-span-2" actions={representantesEditor}>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={funilData} margin={{ left: -10, right: 8, top: 8 }}>
                        <CartesianGrid stroke="#e5e7eb" vertical={false} />
                        <XAxis dataKey="etapa" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip content={<PrettyTooltip />} />
                        <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                          {funilData.map((_, i) => (
                            <Cell key={i} fill={chartColors[i % chartColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Panel>
                  <Panel title="Planos vendidos" subtitle="Distribuição por tipo" actions={planosEditor}>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={planosVendidos} dataKey="vendas" nameKey="plano" innerRadius={50} outerRadius={80} paddingAngle={4}>
                          {planosVendidos.map((_, i) => (
                            <Cell key={i} fill={chartColors[i % chartColors.length]} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip content={<PrettyTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {planosVendidos.map((p, i) => (
                        <li key={p.plano} className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartColors[i % chartColors.length] }} />
                            {p.plano}
                          </span>
                          <span className="font-medium text-foreground">{p.vendas}</span>
                        </li>
                      ))}
                    </ul>
                  </Panel>
                </div>
                <RepresentantesTable representantes={representantes} parametros={parametros} actions={representantesEditor} />
              </TabsContent>

              {/* POR REPRESENTANTE */}
              <TabsContent value="representantes">
                <RepresentantesTable representantes={representantes} parametros={parametros} detalhado actions={representantesEditor} />
              </TabsContent>

              {/* FUNIL DE VENDAS */}
              <TabsContent value="funil" className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Panel title="Funil de vendas" subtitle="Novo → contatado → visitado → cliente fechado" actions={representantesEditor}>
                    <ResponsiveContainer width="100%" height={280}>
                      <FunnelChart>
                        <Tooltip content={<PrettyTooltip />} />
                        <Funnel dataKey="valor" data={funilData} isAnimationActive={false}>
                          <LabelList position="right" dataKey="etapa" fill="#374151" stroke="none" />
                          {funilData.map((_, i) => (
                            <Cell key={i} fill={chartColors[i % chartColors.length]} />
                          ))}
                        </Funnel>
                      </FunnelChart>
                    </ResponsiveContainer>
                  </Panel>
                  <Panel title="Taxa de conversão por etapa" subtitle={`${totalCancelados} leads cancelados no período`} actions={representantesEditor}>
                    <ul className="space-y-3 text-sm">
                      {funilData.slice(1).map((etapa, i) => {
                        const anterior = funilData[i].valor;
                        const taxa = anterior > 0 ? (etapa.valor / anterior) * 100 : 0;
                        return (
                          <li key={etapa.etapa} className="flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-2">
                            <span className="text-foreground">
                              {funilData[i].etapa} → {etapa.etapa}
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                                taxa >= 60 ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-700",
                              )}
                            >
                              {taxa.toFixed(0)}%
                            </span>
                          </li>
                        );
                      })}
                      <li className="flex items-center justify-between rounded-lg bg-red-500/10 px-3 py-2">
                        <span className="text-foreground">Total cancelados</span>
                        <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-700">
                          {totalCancelados}
                        </span>
                      </li>
                    </ul>
                  </Panel>
                </div>
              </TabsContent>

              {/* COMISSÕES */}
              <TabsContent value="comissoes" className="space-y-6">
                <Panel
                  title="Evolução mensal de comissões"
                  subtitle="Composição por faixa — base 10% + implementação 10% + suporte 10% + bônus até 10% (teto 40%)"
                  actions={comissaoEditor}
                >
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={comissaoMensal} margin={{ left: -10, right: 8, top: 8 }}>
                      <CartesianGrid stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="mes" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip content={<PrettyTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="base" stackId="1" name="Base (10%)" stroke="#2563eb" fill="#2563eb" fillOpacity={0.7} />
                      <Area type="monotone" dataKey="implementacao" stackId="1" name="Implementação (10%)" stroke="#059669" fill="#059669" fillOpacity={0.7} />
                      <Area type="monotone" dataKey="suporte" stackId="1" name="Suporte (10%)" stroke="#d97706" fill="#d97706" fillOpacity={0.7} />
                      <Area type="monotone" dataKey="bonus" stackId="1" name="Bônus performance (10%)" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.7} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Panel>
                <Panel
                  title="Comissão atual por representante"
                  subtitle="Bônus de performance: clientes ativos e churn definidos nos parâmetros gerais"
                  actions={parametrosEditor}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                          <th className="pb-3 font-medium">Representante</th>
                          <th className="pb-3 font-medium">Base</th>
                          <th className="pb-3 font-medium">Implementação</th>
                          <th className="pb-3 font-medium">Suporte</th>
                          <th className="pb-3 font-medium">Bônus</th>
                          <th className="pb-3 font-medium">Total</th>
                          <th className="pb-3 font-medium">A receber</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {representantes.map((r) => {
                          const c = comissaoDoRepresentante(r, parametros);
                          const aReceber = r.clientesAtivos * parametros.ticketMedio * (c.total / 100);
                          return (
                            <tr key={r.nome} className="text-foreground">
                              <td className="py-3 font-medium">{r.nome}</td>
                              <td className="py-3 text-muted-foreground">{c.base}%</td>
                              <td className="py-3 text-muted-foreground">{c.implementacao}%</td>
                              <td className="py-3 text-muted-foreground">{c.suporte}%</td>
                              <td className="py-3">
                                {c.bonusPerformance > 0 ? (
                                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                    +{c.bonusPerformance}%
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                              <td className="py-3 font-semibold">{c.total}%</td>
                              <td className="py-3">
                                {aReceber.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              </TabsContent>

              {/* PLANOS VENDIDOS */}
              <TabsContent value="planos" className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Panel title="Vendas por plano" subtitle="Mesas · Delivery · Premium" actions={planosEditor}>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={planosVendidos} margin={{ left: -10, right: 8, top: 8 }}>
                        <CartesianGrid stroke="#e5e7eb" vertical={false} />
                        <XAxis dataKey="plano" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip content={<PrettyTooltip />} />
                        <Bar dataKey="vendas" radius={[8, 8, 0, 0]}>
                          {planosVendidos.map((_, i) => (
                            <Cell key={i} fill={chartColors[i % chartColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Panel>
                  <Panel title="Módulos adicionais contratados" subtitle="Total de vendas por módulo" actions={modulosEditor}>
                    <div className="space-y-3">
                      {modulosAdicionais.map((m) => {
                        const max = Math.max(...modulosAdicionais.map((x) => x.vendas), 1);
                        return (
                          <div key={m.modulo} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2 font-medium text-foreground">
                                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                                {m.modulo}
                              </span>
                              <span className="text-muted-foreground">{m.vendas}</span>
                            </div>
                            <Progress value={(m.vendas / max) * 100} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </Panel>
                </div>
              </TabsContent>

              {/* MAPA DE OPORTUNIDADES */}
              <TabsContent value="mapa" className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Panel title="Concentração por região" subtitle="Leads e clientes ativos" actions={representantesEditor}>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={porRegiao} layout="vertical" margin={{ left: 10, right: 20 }}>
                        <CartesianGrid stroke="#e5e7eb" horizontal={false} />
                        <XAxis type="number" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="regiao" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} width={100} />
                        <Tooltip content={<PrettyTooltip />} />
                        <Bar dataKey="leads" name="Leads" radius={[0, 8, 8, 0]}>
                          {porRegiao.map((_, i) => (
                            <Cell key={i} fill={chartColors[i % chartColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Panel>
                  <Panel title="Ranking por cidade" subtitle="Leads e clientes por praça" actions={representantesEditor}>
                    <div className="space-y-2.5">
                      {porCidade.map((c) => {
                        const max = Math.max(...porCidade.map((x) => x.leads), 1);
                        return (
                          <div key={c.cidade} className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="truncate font-medium text-foreground">{c.cidade}</span>
                                <span className="shrink-0 text-xs text-muted-foreground">
                                  {c.leads} leads · {c.clientes} clientes
                                </span>
                              </div>
                              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${(c.leads / max) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Panel>
                </div>
              </TabsContent>

              {/* PROJEÇÕES */}
              <TabsContent value="projecoes" className="space-y-6">
                <Panel
                  title="Projeção de ganhos"
                  subtitle="Baseada no ritmo atual: vendas/mês × ticket médio × tempo de retenção"
                  actions={parametrosEditor}
                >
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={projecao} margin={{ left: -10, right: 8, top: 8 }}>
                      <defs>
                        <linearGradient id="proj" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#059669" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#059669" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="mes" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} unit="k" />
                      <Tooltip content={<PrettyTooltip unit=" mil" />} />
                      <Area type="monotone" dataKey="ganhoProjetado" name="Ganho projetado (R$ mil)" stroke="#059669" strokeWidth={2} fill="url(#proj)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Panel>
                <Panel title="Top 3 representantes — ritmo atual" subtitle="Vendas fechadas por mês" actions={representantesEditor}>
                  <ul className="space-y-3 text-sm">
                    {[...representantes]
                      .sort((a, b) => b.vendasPorMes - a.vendasPorMes)
                      .slice(0, 3)
                      .map((r) => (
                        <li key={r.nome} className="flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-2">
                          <span className="text-foreground">{r.nome}</span>
                          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            {r.vendasPorMes} vendas/mês
                          </span>
                        </li>
                      ))}
                  </ul>
                </Panel>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

function HeroCard({
  icon: Icon,
  title,
  value,
  caption,
  edit,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  caption: string;
  edit?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-secondary-foreground">
          <Icon className="h-4 w-4" />
        </div>
        {edit}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</div>
      <div className="text-xs font-medium text-foreground/80">{title}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{caption}</div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
  className,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]", className)}>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

function RepresentantesTable({
  representantes,
  parametros,
  detalhado = false,
  actions,
}: {
  representantes: Representante[];
  parametros: Parametros;
  detalhado?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <Panel title="Representantes" subtitle="Leads por status, clientes ativos e churn" actions={actions}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="pb-3 font-medium">Representante</th>
              {detalhado && (
                <>
                  <th className="pb-3 font-medium">Novo</th>
                  <th className="pb-3 font-medium">Contatado</th>
                  <th className="pb-3 font-medium">Visitado</th>
                  <th className="pb-3 font-medium">Cancelado</th>
                </>
              )}
              <th className="pb-3 font-medium">Fechado</th>
              <th className="pb-3 font-medium">Clientes ativos</th>
              <th className="pb-3 font-medium">Churn</th>
              <th className="pb-3 font-medium">Comissão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {representantes.map((r) => {
              const c = comissaoDoRepresentante(r, parametros);
              return (
                <tr key={r.nome} className="text-foreground">
                  <td className="py-3">
                    <div className="font-medium">{r.nome}</div>
                    <div className="text-xs text-muted-foreground">{r.cidade}</div>
                  </td>
                  {detalhado && (
                    <>
                      <td className="py-3 text-muted-foreground">{r.leads.novo}</td>
                      <td className="py-3 text-muted-foreground">{r.leads.contatado}</td>
                      <td className="py-3 text-muted-foreground">{r.leads.visitado}</td>
                      <td className="py-3 text-muted-foreground">{r.leads.cancelado}</td>
                    </>
                  )}
                  <td className="py-3 font-medium">{r.leads.fechado}</td>
                  <td className="py-3">{r.clientesAtivos}</td>
                  <td className="py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        r.churn >= parametros.bonusChurnMax ? "bg-red-500/15 text-red-700" : "bg-emerald-500/15 text-emerald-700",
                      )}
                    >
                      {r.churn.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 font-semibold">{c.total}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function PrettyTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-[var(--shadow-soft)]">
      {label !== undefined && <div className="text-xs font-medium text-foreground">{label}</div>}
      <div className="mt-1 space-y-0.5">
        {payload.map((p: any) => (
          <div key={p.dataKey ?? p.name} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color ?? p.payload?.fill }} />
            <span className="text-foreground">{p.name ?? p.payload?.etapa}:</span>
            <span className="font-medium text-foreground">
              {p.value}
              {unit ?? ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
