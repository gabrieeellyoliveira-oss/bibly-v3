import { useMemo, useState, type ComponentType } from "react";
import {
  Building2,
  ChevronLeft,
  Clock,
  Filter,
  IdCard,
  MessageCircleQuestion,
  Package,
  Repeat2,
  Route,
  ShieldCheck,
  TrendingUp,
  UserCheck,
} from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { MarkdownEditorDialog, RichText } from "@/components/bibly/editors";

// ---------------------------------------------------------------------------
// Playbook de Representantes — material central de consulta do time, em
// formato de grid + detalhe por tópico. Conteúdo extraído das planilhas de
// onboarding e de playbook de representantes; corpo de cada tópico editável
// pela engrenagem, persiste no navegador.
// ---------------------------------------------------------------------------

type Badge = "Novo" | "Atualizado";
export type IconType = ComponentType<{ className?: string }>;

type TopicMeta = {
  id: string;
  title: string;
  category: string;
  summary: string;
  icon: IconType;
  badge?: Badge;
};

const TOPICS: TopicMeta[] = [
  {
    id: "onboarding",
    title: "Onboarding",
    category: "Cultura & Time",
    summary: "Seu processo de entrada e adaptação — cultura, ferramentas, rotinas e o seu papel no time.",
    icon: Clock,
    badge: "Atualizado",
  },
  {
    id: "produto",
    title: "Produto",
    category: "Produto",
    summary: "Todos os aspectos mais importantes do produto: funcionalidades, planos e integrações.",
    icon: Package,
  },
  {
    id: "ipp",
    title: "IPP — Perfil Ideal de Parceiro",
    category: "Aquisição",
    summary: "Perfil ideal de parceiro (representante) para o programa.",
    icon: UserCheck,
  },
  {
    id: "objecoes-concorrentes",
    title: "Objeções & Concorrentes",
    category: "Vendas",
    summary: "As objeções mais comuns e como responder, mais o comparativo com a concorrência.",
    icon: ShieldCheck,
  },
  {
    id: "jornada-representante",
    title: "Jornada do Representante",
    category: "Processos",
    summary: "As etapas que compõem a jornada, da prospecção à passagem de bastão.",
    icon: Route,
    badge: "Novo",
  },
  {
    id: "passagem-bastao",
    title: "Passagem de Bastão",
    category: "Processos",
    summary: "Checklist de informações para conectar os setores na marcação da apresentação.",
    icon: Repeat2,
  },
  {
    id: "spin-selling",
    title: "SPIN Selling",
    category: "Vendas",
    summary: "Metodologia baseada em quatro pilares de perguntas: Situação, Problema, Implicação e Necessidade.",
    icon: MessageCircleQuestion,
  },
  {
    id: "aida",
    title: "AIDA",
    category: "Vendas",
    summary: "Modelo de hierarquia de efeitos aplicado à cold call de prospecção.",
    icon: TrendingUp,
  },
  {
    id: "funcoes",
    title: "Funções",
    category: "Cultura & Time",
    summary: "Definições dos profissionais envolvidos no processo comercial.",
    icon: IdCard,
  },
  {
    id: "funis",
    title: "Funis",
    category: "Processos",
    summary: "Etapas dos funis de prospecção, acompanhamento, clientes e motivos de perda.",
    icon: Filter,
    badge: "Novo",
  },
  {
    id: "estrutura-representantes",
    title: "Estrutura de Representantes",
    category: "Comercial",
    summary: "Perfil, funcionamento, modelo financeiro e objeções do programa.",
    icon: Building2,
  },
];

const BADGE_STYLE: Record<Badge, { bg: string; fg: string }> = {
  Novo: { bg: "var(--badge-novo-bg)", fg: "var(--badge-novo-fg)" },
  Atualizado: { bg: "var(--badge-atualizado-bg)", fg: "var(--badge-atualizado-fg)" },
};

const CONCORRENTES_TABELA_COMPLETA = `Encontre a relação entre as funcionalidades do Cardápio Web e dos concorrentes. ✅ = tem · ⚠️ = parcial/limitado · ❌ = não tem.

| Concorrente | Cardápio delivery | Cardápio mesas | ChatBot WhatsApp | Pagamento online | Disparador WhatsApp | Fidelidade | Fluxo de caixa | Módulo fiscal | Estoque produtos | Estoque insumos | Gestão financeira | Rotas de entrega | Totem |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Cardápio Web | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Anota ai | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ | ❌ | ⚠️ | ❌ | ❌ |
| Brendi | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Saipos | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Instadelivery | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Consumer (Menu Dino) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Goomer | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Yooga | ✅ | ⚠️ | ✅ | ✅ | ❌ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | ❌ |
| OlaClick | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ❌ |
| WhatsMenu | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ⚠️ | ❌ | ⚠️ | ❌ |
| Multipedidos | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ❌ | ❌ | ❌ | ❌ |
| Delivery Direto | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ❌ |
| Linx | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Neemo | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Alloy | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Accon | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Takeat | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | ✅ |
| EasyAssist | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| BigDim | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ecta | ✅ | ✅ | ✅ | ✅ | ⚠️ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Suitable | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| BeeFood | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Cardápio Ai | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Omie | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| GrandChef | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Jotajá | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Sischef | ⚠️ | ⚠️ | ❌ | ⚠️ | ❌ | ❌ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ❌ |
| Deli | ✅ | ⚠️ | ⚠️ | ✅ | ❌ | ❌ | ✅ | ⚠️ | ✅ | ⚠️ | ✅ | ❌ | ❌ |

## Notas por concorrente

- **Anota ai** (https://anota.ai/) — período promocional de R$ 59,90 nos primeiros meses; depois Plano Start R$ 279,99/mês ou Gestão Avançada R$ 399,99/mês. Cardápio digital comprado pelo iFood, chatbot multi-rede (WhatsApp, Facebook, Instagram), pouco foco em gestão, cresceu com promoções agressivas do iFood; suporte terceirizado sofreu com o crescimento.
- **Brendi** (https://brendi.com.br/) — cobrança por faturamento: até R$1.500 = R$60/mês; R$1.500,01 a R$7.500 = 4% do faturado; acima de R$7.500 = R$300/mês. Foco em automação de delivery (não mesas), pouco foco em gestão, valor elevado pelo que oferece.
- **Saipos** (https://saipos.com/) — R$ 219/mês (até R$40 mil de faturamento); implantação R$600 com 75% de desconto como gatilho de urgência. Sistema de gestão usado por franquias grandes, foco forte em gestão; temos integração com eles.
- **Instadelivery** (https://instadelivery.com.br/) — grátis até R$2.000/mês faturado; R$69,90/mês até R$5.000; R$129,90/mês acima disso. Barato e completo, mas usabilidade ruim e pouco profissional; cresceu com programa de indicação agressivo, foca em preço baixo.
- **Consumer (Menu Dino)** (https://consumer.com.br/) — grátis até 200 pedidos; Consumer 1 PC R$64,90/mês (1 computador); Consumer rede R$84,90/mês; cobram à parte por várias funcionalidades, incluindo o próprio Menu Dino. É um sistema de gestão com cardápio (Menu Dino) que exige instalação local, difícil de usar, com bugs para quem faz tráfego pago.
- **Goomer** (https://goomer.com.br/) — grátis até 30 pedidos/mês via WhatsApp (R$1,39 por pedido extra); básico R$99,90/mês; automatizar R$184,90/mês; integrar R$299,90/mês + R$99,90/mês de implementação QR code/delivery. Muito conhecido, foco forte em totens de mesa, fluxo de pedido pouco fácil, falta ferramentas de marketing.
- **Yooga** (https://yooga.com.br/) — planos anuais de R$211,65 a R$296,65 (12x); mensais de R$249 a R$349; Premium sob consulta. Foco em gestão mais que automação, bem feito mas pouco relevante no mercado; funcionalidades básicas presas a planos superiores.
- **OlaClick** (https://olaclick.com/) — Advanced R$64/mês (~400 pedidos); Premium R$160/mês (~4.000 pedidos); Elite R$374/mês; Infinity R$928/mês (ilimitado). Preço acessível, mas parece incompleto e dependente do plano contratado.
- **WhatsMenu** (https://whatsmenu.com.br/) — valor padrão R$97/mês; usa montagem gratuita de cardápio (100 itens) como gatilho de urgência para implementação. Barato, sem grandes ameaças ao nosso posicionamento.
- **Multipedidos** (https://multipedidos.com.br/) — iniciante R$169,90/mês; profissional R$259,90/mês; implementação R$150. Relativamente completo e promissor, mas custo elevado ao somar módulos que já entregamos no plano (como o chatbot).
- **Delivery Direto** (https://site.deliverydireto.com.br/) — comissão de 10% sobre vendas (teto R$699/mês) no iniciante; 5% (teto R$899/mês) no profissional; possui módulos à parte. Possivelmente o cardápio digital mais antigo da lista, perdendo mercado para concorrentes mais modernos.
- **Linx** (https://www.linx.com.br/) — Essencial R$349/mês; Plus R$529/mês; Max R$779/mês. Foco em grandes empresas/franquias, dona da Neemo (posicionada como sistema de gestão); atendimento fica caro por depender da Neemo à parte.
- **Neemo** (https://www.neemo.com.br/) — Start a partir de R$189/mês; Pro a partir de R$289/mês; franquia sob consulta. Cardápio digital comprado pela Linx, interface historicamente ruim, foco em franquias com ERP.
- **Alloy** (https://www.alloy.al/) — Começar R$164,93 (até R$30 mil/mês); Crescer R$224,93 (até R$70 mil); Avançar R$284,93 (até R$110 mil); Evoluir R$359,93 (acima de R$110 mil). Pouca relevância de mercado hoje, mas ferramenta completa e bem feita.
- **Accon** (https://accon.com.br/) — mensal completo R$349/mês; trimestral completo R$299/mês. Foco em atendimento e automação de delivery, deixa a gestão de lado, integra com outros PDVs.
- **Takeat** (https://www.takeat.app/) — básico R$199/mês; inovação R$279/mês; profissional R$499/mês; enterprise sob consulta. Bom custo-benefício, cardápio com usabilidade ruim, mas sistema relativamente completo.
- **EasyAssist** (https://easyassist.com.br/) — sem dado de preço coletado. Sistema de gestão simples, focado apenas em mesas, com controles básicos de estoque e pedidos.
- **BigDim** (https://www.bigdim.com.br/) — Flex R$59,90/mês (até 150 pedidos); Basic R$89,90/mês; Pro R$159,90/mês; Prime R$189,90/mês. Preço acessível, sistema pequeno, parece ter muitas coisas mas incompletas.
- **Ecta** (https://ecta.com.br/) — 1º mês no boleto R$350; demais meses R$200; no cartão, 6x de R$189. Foco em atendimento com custo-benefício mediano; disparador de mensagem via SMS (não WhatsApp), um pouco arcaico.
- **Suitable** (https://suitable.com.br/) — Starter R$287/mês; Advanced R$386/mês; Premium R$479/mês; Ultra sob consulta. Sistema razoavelmente completo, compara-se diretamente com concorrentes no próprio site; layout de cardápio pouco atrativo.
- **BeeFood** (https://beefood.com.br/) — grátis (histórico de 7 dias); Zangão R$200/mês; Rainha R$300/mês; BeeFood R$400/mês. Bastante completo, cardápio pouco intuitivo, preços não muito competitivos.
- **Cardápio Ai** (https://cardapio.ai/) — PDV Básico R$49,90/mês; PDV + Robô R$64,90/mês; PDV Integrado R$99,90/mês. Custo baixo, focado em automação de atendimento, deixa gestão e marketing de lado.
- **Omie** (https://www.omie.com.br/) — Omie ERP R$99/mês; Omie Multivarejo R$209/mês. Foco principal é ERP para vários segmentos; cardápio digital não é o foco.
- **GrandChef** (https://www.grandchef.com.br/) — Starter 12x R$29,94; Lite 12x R$67,43 ou R$89,90/mês; Pro 12x R$97,43 ou R$129,90/mês. Relativamente completo e bem feito, bom posicionamento em gestão, cardápio digital com segurança percebida fraca.
- **Jotajá** (https://www.site.jotaja.com/) — Start R$249/mês + R$300 de implantação; Advanced R$329/mês + R$300 de implantação; Franquias sob consulta. Cardápio simples, destaque pelo evento anual "Jotajá Summit"; pouca relevância atual.
- **Sischef** (https://sischef.com/) — planos a partir de R$99,99/mês, com módulos à parte. Foco em gestão (não concorre diretamente com nosso posicionamento de cardápio digital); forte reconhecimento entre franquias; temos integração com eles.
- **Deli** (https://deli.com.br/pt-br/) — Inicial R$83,90/mês; Avançado R$125,90/mês; Pro R$178,90/mês, com módulos à parte. Relativamente completo e promissor; custo sobe ao somar módulos que já entregamos no plano (como o chatbot).`;

const DEFAULT_BODIES: Record<string, string> = {
  produto: `Todos os aspectos mais importantes do produto: funcionalidades, planos e integrações disponíveis.

Vídeo com a visão completa da plataforma: https://www.youtube.com/watch?v=rfmGEWZZUNU

## Os 3 pilares da Cardápio Web

### Cardápio Digital
- ChatBot com Inteligência Artificial
- Cardápio digital (delivery, mesa, balcão)
- Sistema PDV dentro do WhatsApp
- Cardápio rápido e com boa usabilidade
- Pagamento online
- Agendamento de pedidos

### Food Marketing
- Disparador de mensagens em massa no WhatsApp
- Integração com ferramentas de anúncio e marketing (Meta Ads, Google Ads, Facebook Pixel, Google Tag Manager, Google Analytics)
- Programa de fidelidade
- Cashback
- Matriz RFV
- Cupons e descontos
- Automações e agendamentos de mensagens no WhatsApp
- Filtros avançados de clientes

### Gestão do Negócio
- PDV, estoque, caixa e impressoras
- Emissão de nota fiscal
- Gestão de rotas de entrega
- Gestão financeira
- Relatórios avançados
- Integração com marketplaces
- Gestão de entregadores, fiado e KDS

## Integrações disponíveis

| Categoria | Integrações |
|---|---|
| Sistemas de pagamento | Cartão, Mercado Pago, Cielo, Pix, Tuna |
| Anúncios e tráfego pago | Facebook Pixel, API de conversões do Meta, Catálogo do Facebook, Google Tag Manager, Google Analytics |
| Gestão de rotas de entrega | iFood sob demanda, Bee Delivery, Foody Delivery, Pick n Go!, Mottu, Let's! Express, Husky, Machine, JAX Bus, Entregas Expressas, Moovery |
| Gestão financeira | Saipos, Eclética, Sischef, F360 Finanças, Glow, Izzy Way |
| Marketplaces | iFood, 99 Food, Keeta, Aiqfome |
| Outros | Open Delivery (padrão de mercado para integrações padronizadas), API Aberta (para outros sistemas se integrarem com a gente) |

## Funcionalidades por plano

### Plano Mesas
- Cardápio digital para mesas e balcão
- Sistema PDV dentro do WhatsApp
- Cardápio rápido e com boa usabilidade
- Disparador de mensagens em massa no WhatsApp
- Automações e agendamentos de mensagens no WhatsApp
- Cupons e descontos
- Filtros avançados de clientes
- PDV, estoque simplificado (sem ficha técnica), caixa e impressoras
- Gestão de rotas de entrega pela Foody Delivery e Pick N Go
- Gestão financeira pela F360
- Fiado e KDS
- Agendamento de pedidos

### Plano Delivery
- Disparador de mensagens em massa no WhatsApp
- Automações e agendamentos de mensagens no WhatsApp
- Integração com ferramentas de anúncio e marketing (Meta Ads e Google Ads)
- Programa de fidelidade
- Cupons e descontos
- ChatBot com Inteligência Artificial
- Cardápio digital para delivery e balcão
- Agendamento de pedidos
- Pagamento online (Mercado Pago e Cielo)
- Filtros avançados de clientes
- PDV, estoque simplificado (sem ficha técnica), caixa e impressoras
- Gestão de rotas de entrega pela Foody Delivery e Pick N Go
- Gestão financeira pela F360
- Fiado e KDS

### Plano Premium
- Integração com iFood e Entrega Fácil iFood
- Sistema PDV dentro do WhatsApp
- Cardápio rápido e com boa usabilidade
- Integração com ferramentas de anúncio e marketing (Meta Ads e Google Ads)
- Programa de fidelidade
- ChatBot com Inteligência Artificial
- Cardápio digital para delivery, mesas e balcão
- Agendamento de pedidos
- Pagamento online (Mercado Pago e Cielo)
- Disparador de mensagens em massa no WhatsApp
- Automações e agendamentos de mensagens no WhatsApp
- Cupons e descontos
- Filtros avançados de clientes
- PDV, estoque simplificado (sem ficha técnica), caixa e impressoras
- Gestão de rotas de entrega pela Foody Delivery e Pick N Go
- Gestão financeira pela F360
- Gestão de entregadores, fiado e KDS

### Módulos extras
- Cupom fiscal
- Estoque avançado (com ficha técnica)
- Financeiro
- Gestão de entregadores e rotas de entrega
- Integração com marketplaces
- Totem (dispositivos)`,
  ipp: `Esta aba documenta o perfil ideal de parceiro (representante).

## Perfil Ideal de Parceiro — Representantes

Profissionais de vendas com histórico comprovado em comercialização de soluções de software B2B, especialmente nos mercados de tecnologia, SaaS, sistemas de gestão, automação comercial e soluções para o setor de food service.

### Características esperadas
- Experiência prática em vendas B2B, especialmente de software ou soluções digitais
- Capacidade comprovada de prospecção ativa e geração de oportunidades
- Conhecimento funcional de funil de vendas e processos comerciais
- Relacionamento ativo ou potencial com clientes na região de atuação
- Mentalidade empreendedora, orientada à construção de receita recorrente
- Organização mínima para gestão de pipeline e carteira de clientes

### Diferenciais desejáveis
- CNPJ ativo (MEI, ME ou superior)
- Aceite formal do contrato, regras do programa e diretrizes de uso da marca

### Diferenciais competitivos (opcional, mas estratégico)
- Capacidade futura de escalar operação (time, parceiros, volume)`,
  "jornada-representante": `A Jornada do Representante na Cardápio Web é composta pelas etapas descritas nessa documentação.

**Em construção pela liderança** — as colunas abaixo (Lead antes → Lead depois → Estágio correspondente nas vendas) ainda não têm as etapas preenchidas na planilha de origem. Use as definições de funil (Prospecção, Acompanhamento e Clientes de Representantes) enquanto essa etapa não é formalizada.

| Etapa da jornada | Lead antes | Lead depois | Estágio correspondente nas vendas |
|---|---|---|---|
| A definir | — | — | — |`,
  "passagem-bastao": `O momento de passagem de bastão é muito importante e crucial para a empresa. É quando o time ganha mais conexão com as informações passadas entre os setores no momento da marcação da apresentação.

## Checklist de perguntas para registrar antes da passagem

- Como o lead conheceu a Cardápio Web?
- **Situação:** qual o contexto atual do lead?
- **Problema:** qual dor foi identificada?
- **Implicação:** qual o impacto dessa dor no negócio do lead?
- **Necessidade:** o que o lead reconheceu que precisa?
- Os valores estão dentro do orçamento do lead?
- A pessoa com quem você falou é a tomadora de decisão?
- Qual a prioridade do lead em relação a essa solução?`,
  "spin-selling": `O SPIN Selling é uma metodologia de vendas criada por Neil Rackham nos anos 1980, que usa boas perguntas para estruturar uma venda com base em quatro pilares: Situação, Problema, Implicação e Necessidade.

## Roteiros por funcionalidade

#### Automatização de pedidos de delivery

**Situação:** Quantos pedidos você recebe por dia? E no WhatsApp?

**Problema:** E mesmo na hora movimentada do dia, você ainda consegue me garantir que o atendimento é rápido? E que nenhum cliente passa batido?

**Implicação:** Entendi, quando seu cliente demora a ser atendido, como você acha que isso impacta nas suas vendas?

**Necessidade:** Se você tivesse um atendimento rápido e sem a necessidade de um atendente, quais vantagens você acha que isso traria?

Possibilidades:
- Corte de custo com funcionário
- Aumento de vendas, já que não tem mais demora no atendimento e nem erro ao anotar pedido..
- Escala no atendimento, por não precisar de uma pessoa para atender

**Discurso de desenvolvimento:**
Então NOME_DO_LEAD. Com relação à automação dos seus pedidos de delivery, nós temos diversas ferramentas para te auxiliar nesse quesito. Dentre elas:

- Cardápio digital
- ChatBot com Inteligência Artificial
- Extensão para o atendente fazer pedidos dentro do próprio WhatsApp Web

#### Disparador de mensagens de WhatsApp

**Situação:** Qual sua estratégia de crescimento para os próximos meses?

**Problema:** Se sua demanda começasse a cair a partir de hoje, o que você faria?

**Implicação:** Você não acha arriscado a sua empresa não ter nenhuma forma previsível de se programar para aumentar seu faturamento?

**Necessidade:** Se você tivesse o poder de mandar uma mensagem para todos os seus clientes em questão de minutos, qual estratégia você usaria para vender mais?

**Discurso de desenvolvimento:**
Perfeito, NOME_DO_LEAD! Com relação às estratégias de crescimento, a gente também consegue te ajudar.

A nossa ferramenta tem implantado um disparador de mensagens em massa no WhatsApp, que te permite alcançar milhares de clientes em questão de minutos, disparando ofertas, imagens, cupons, pesquisas de satisfação, falando o nome do cliente.. enfim, o que você quiser!

Tá me acompanhando?

E além disso, somos a ferramenta mais indicada do mercado para quem faz tráfego pago, temos mais de 200 agências de marketing e gestores de tráfego parceiros que indicam o cardápio web como o melhor cardápio digital para quem faz anúncios, primeiro porque o nosso cardápio é fácil e rápido de fazer pedido, então é mais fácil do cliente comprar, e segundo porque as nossas integrações com as ferramentas de anúncios são as mais completas do mercado atualmente.

Você entendeu o que eu falei?

E além disso, com o nosso programa de fidelidade, você ainda consegue aumentar a retenção do seu cliente dentro da sua empresa, quanto mais tempo seu cliente fica com você, mais longevidade tem o seu negócio e, obviamente, mais dinheiro no seu bolso!

Você concorda comigo?

#### Sistema de gestão com notas fiscais e iFood

**Situação:** Você já usa alguma ferramenta para gerenciar seus pedidos e emitir notas fiscais?

**Problema:** E como você faz para garantir que a sua empresa está funcionando corretamente?

**Implicação:** Se você viajasse hoje e só voltasse daqui a 1 mês, sua empresa funcionaria normalmente sem você? E como você acompanharia os resultados?

**Necessidade:** Caso você conseguisse gerenciar a sua operação de forma remota, como isso impactaria sua vida?

**Discurso de desenvolvimento:**
Legal, NOME_DO_LEAD! Então, com relação à essa parte de gestão, a gente também é muito completo!

Logo de cara, posso dizer que a sua operação vai poder ser controlada até de forma remota, porque o sistema é todo online e permite um acompanhamento em tempo real.

Isso é algo que faz sentido para você?

A gente consegue te ajudar na parte de controle de estoque, caixa, gestão de pedido na cozinha por tela, que é o nosso KDS, você tem acesso a controle de fiado, relatórios de vendas.. bastante coisa legal.

Você entendeu todos esses pontos que eu falei ou teve alguma coisa que te deixou confuso?

Bacana, mas não para por aí, nossa ferramenta também têm várias integrações legais que podem te ajudar nesse controle. Dentre elas, para gestão de rota de entrega, integramos com a Foody Delivery e a Pick N Go, para motoboys tercerizados, integramos com iFood Entregas, e para ter um controle financeiro mais complexo, integramos com a F360.

Ficou claro tudo que eu falei?

**Implicação:** Então você se sente preso na sua própria operação?

**Situação:** Hoje como estão suas vendas no iFood?

**Problema:** E como você analisa os resultados gerais da empresa? Somando iFood com ligação WhatsApp, balcão.. como você faz para reunir todos esses dados e ter o controle do negócio?

**Implicação:** Você sente que esse controle hoje fica trabalhoso?

**Necessidade:** Se você tivesse acesso a um controle que te permite analisar seus resultados de forma 100% automática, como você usaria essa ferramenta? Faria uma análise diária, acompanharia as vendas de cada pessoa do time, veria quais produtos tem mais movimentação, o que seria?

**Implicação:** O que você acha que perde ao não conseguir analisar os dados da sua empresa com facilidade?

**Necessidade:** Se você conseguisse unir todas as ferramentas que precisa num único sistema, quais seriam as vantagens disso? Corte de custos, facilidade de aprendizado, centralização dos dados, quais seriam as vantagens?

**Implicação:** Você consegue me dizer o quanto você cresceu nos últimos 6 meses? (se não souber, perguntar se ele sabe se realmente cresceu)

#### Cardápio digital para mesa

**Situação:** Hoje como funciona seu atendimento presencial?

**Problema:** Como você acha que a ausência do cardápio na mesa influencia nos pedidos do cliente? Porque a gente sabe que o cliente não gosta de ficar chamando garçom para trazer o cardápio o tempo todo

**Implicação:** Você concorda que não ter a presença do cardápio na mesa impacta diretamente na suas vendas?

**Necessidade:** Se o cardápio ficasse sempre na mesa, você acha que o seu cliente compraria mais? Por que? Explicação: já que ele não precisaria ficar chamando o garçom para ver o cardápio.

**Discurso de desenvolvimento:**
Com relação à sua gestão de mesas, temos muitas ferramentas interessantes.

A primeira é a parte de gestão das suas mesas, por onde você consegue ver quantas pessoas têm no salão, seu garçom consegue abrir e fechar mesas, trocar as pessoas de lugar, tudo que você precisa para essa parte de gestão de mesas.

Ficou claro?

Já com relação ao cardápio digital de mesa, seu cliente consegue fazer o pedido direto do celular dele e já enviar para a cozinha de forma automática, sem a necessidade de um garçom.

Isso é algo que faria sentido para você nesse momento?

**Situação:** Hoje você tem quantos cardápios para cada mesa no presencial?

**Problema:** E você sente alguma dificuldade em trabalhar com cardápios físicos? Atualização de preço, ficar rotacionando cardápio nas mesas, clientes que ficam irritados quando demoram para atualizar.

**Implicação:** Isso dificulta o teste de novos produtos ou preços?

**Necessidade:** Se você pudesse atualizar seu cardápio em questão de minutos, como você usaria isso a seu favor? Testaria produtos novos, atualizaria os preços mais rápido depois de um aumento de custos, como seria?

#### Gestão de agendamentos

**Situação:** Me responde uma coisa, hoje como os clientes fazem para agendar um pedido com vocês?

**Problema:** Entendi, e quando o cliente quer fazer um pedido e não tem ninguém disponível para falar com ele, como você faz? Porque depois do expediente, imagino que o cliente fique sem resposta.

**Implicação:** Você não acha que isso prejudica a experiência do seu cliente e pode te fazer perder, tanto vendas quanto clientes?

**Necessidade:** E se o seu cliente pudesse agendar um pedido na hora que ele quisesse, independente da sua loja estar aberta ou não, como isso impactaria nas suas vendas? E como isso impactaria a experiência do seu cliente?

**Discurso de desenvolvimento:**
A nossa gestão de agendamentos permite o controle de regras específicas para cada operação de pedidos, com o intuito de definir os dias e horários que o cliente pode selecionar para receber ou pegar seus pedidos.

Quer que eu te mostre um exemplo?

Show, vamos supor que você, como dono de um delivery, só faz entregas se o cliente fizer um pedido com 2 dias de antecedência e a entrega só pode ser realizada num período entre as 13 e as 17 horas. Através da nossa ferramenta isso é possível: a gente mostra pro cliente apenas os dias e horários que, segundo as suas próprias regras, vão estar disponíveis para ele, o que facilita muito o processo de escolha das datas e horários para recebimento, pois não precisa de ninguém para combinar o agendamento.

**Situação:** E como funciona a lógica de agendamento de vocês hoje? Me explica o passo a passo.

**Problema:** Perfeito, como você explica isso para o cliente na hora que ele tá fazendo o pedido? Você envia um áudio, um texto, uma tabela, como seria?

**Implicação:** Entendi, e esse processo não te dá trabalho?

**Necessidade:** E se o cliente já tivesse isso bem claro definido na hora que ele fosse fazer o pedido e não precisasse ficar perguntando para você, como isso impactaria no seu dia a dia?

#### Foco nos anúncios

**Situação:** Por que você está querendo investir em anúncios?

**Problema:** E se você fizer anúncios para um cardápio digital ruim, quais problemas você enxerga que podem acontecer? Um cardápio digital ruim é aquele que é complexo pro cliente pedir, é lento, passa insegurança e tem limitações nas integrações com as ferramentas de anúncios.

**Implicação:** Então se você escolher o cardápio digital errado, você concorda comigo que a sua estratégia tem grandes chances de não dar certo, né? Porque o cliente pode ficar com medo de pedir, pode querer ir só no WhatsApp, pode não saber pedir e acabar desistindo da compra.

**Necessidade:** E se você tivesse acesso a um cardápio digital integrado às principais ferramentas de anúncio, com um fluxo simples de pedido pro cliente, bonito, seguro e com carregamento super rápido, você acredita que isso faria os seus anúncios terem o máximo de performance? Você concorda comigo que quanto mais performance nos anúncios, mais vendas você tem?

**Discurso de desenvolvimento:**
Ótimo, NOME_DO_LEAD! É justamente essa visão que a gente traz para os seus anúncios, nosso objetivo quando falamos de anúncios é potencializar as campanhas de marketing para a sua empresa, trazendo uma performance de primeiro nível para garantir os melhores resultados para você e para a sua empresa.`,
  aida: `O modelo AIDA é um modelo dentro da classe conhecida como modelos de hierarquia de efeitos, todos os quais implicam que os consumidores passam por uma série de etapas quando tomam decisões de compra.

Na prospecção o AIDA é muito poderoso, pois permite que o lead progrida na jornada de compra dentro de uma única ligação. Abaixo, a forma correta de aplicar uma Cold Call usando esse modelo.

### A (Atenção)

**Introdução:** Saudações, introduzir seu nome e perguntar se está tudo bem com o lead.

**Rapport:** Explique que está fazendo um mapeamento nas empresas (fale o nicho) da região (fale a cidade), e percebeu que a empresa do lead é muito bem recomendada — inclusive mencione que tem um amigo (dê um nome para o amigo) que pede lá com frequência e sempre fala bem da comida (mencione o tipo de comida).

**Pedir 2 minutos:** Peça 2 minutos para conversar.

### I (Interesse)

**Benefícios:** Diga que trabalha com uma solução que aumenta de 10 a 30% as vendas de empresas (cite o nicho) que trabalham diretamente com WhatsApp.

**Prova social:** Mencione que esse trabalho já foi feito com empresas como Domino's, Cacau Show (ou outras a depender do nicho e da cidade, como Puro Açaí, Carol Coxinhas, DuckBill, Pizza Crec).

**Reforça prova social:** Mencione ao final da prova social que sempre aumenta de 10 a 30% as vendas.

**Perguntar se há interesse:** Pergunte se o lead teria interesse em ter esse aumento de vendas na operação dele também.

### D (Desejo)

**Contextualizar por que o lead foi escolhido:** Explique que viu a empresa dele no Instagram e percebeu que eles recebem pedidos no WhatsApp.

**Elogie o Instagram da empresa:** Mencione que gostou bastante do trabalho que o lead tem feito no Instagram.

**Aplicar SPIN:** Nessa parte, siga o SPIN associado ao produto oferecido — nesse caso, automação de atendimento:
- Quantos pedidos num dia movimentado
- Você já recebeu alguma reclamação por demora no atendimento ou por anotar pedido errado?
- Sente que isso tá te fazendo perder vendas?
- E se a gente conseguisse garantir que todos os seus clientes vão ser atendidos rapidamente e que nenhum pedido vai ser anotado errado de novo, você acredita que isso aumentaria suas vendas?

**Perguntar se o que foi dito faz sentido para o lead:** Pergunte se o que vocês conversaram até aquele momento faz sentido.

### A (Ação)

**Contornar possíveis objeções:** Nessa hora, é possível que o lead traga algumas objeções, como preço ou produto — use a matriz de objeções para contornar.

**Afirmar que o lead tem perfil para ser cliente:** Explique que, com base na conversa, é certeza que o lead é exatamente o tipo de empresa que a gente atende.

**Reforce outras funções:** Comente que, além dessa parte de automação, existem diversas outras ferramentas de aumento de vendas que trazem muito mais resultado ao lead.

**Explicar que precisa de uma vídeo chamada para apresentar a solução e dar o próximo passo:** Deixe claro que essa ligação não tem intuito de vender, porque antes é preciso apresentar a solução. Marque uma vídeo chamada com o lead, se esforçando para ser no mesmo dia (ou no máximo no dia seguinte).

**Agendar um horário:** Agende um horário e peça o e-mail do lead.

**Aplicar gatilho de compromisso:** Explique que o consultor tem uma agenda ocupada e é um dos maiores especialistas no assunto conversado, então pergunte se o lead teria algum motivo para não estar presente no horário e data acordados, diga que vai enviar uma mensagem no WhatsApp para confirmar a reunião e pergunte se o lead confirma. Com base nisso, finalize a ligação.`,
  funcoes: `Nessa área você encontra as definições de cada profissional envolvido no processo comercial de representantes.

| Função | Descrição |
|---|---|
| Partner Development Representative (PDR) | Descrição pendente de definição pela liderança. |
| Partner Account Executive (PAE) | Descrição pendente de definição pela liderança. |
| Supervisor de parcerias | Profissional responsável por garantir que o time siga as rotinas definidas estrategicamente pelo gerente de parcerias. |
| Coordenador de parcerias | Liderança responsável por acompanhar o trabalho dos supervisores, definindo estratégias e ajudando no desenvolvimento de lideranças e colaboradores. |
| Gerente de parcerias | Liderança responsável por acompanhar o trabalho dos coordenadores e supervisores de parcerias, com o intuito de definir estratégias e desenvolver as lideranças do time. |`,
  funis: `Definições padronizadas das etapas dos três funis do time de representantes, mais os motivos de perda usados para recuperação de oportunidades.

## Funil de Prospecção

Este documento padroniza e esclarece o significado de cada etapa do funil de representantes, garantindo que todo o time tenha o mesmo entendimento sobre o status dos leads ao longo da jornada.

| Etapa | Critério |
|---|---|
| Abertura | Todos os leads que entrarem no fluxo de abertura do funil [REP] Funil de Prospecção de Representantes. |
| Follow-up 1 | Leads há 2 dias no funil. |
| Follow-up 2 | Leads há 3 dias no funil. |
| Follow-up 3 | Leads há 5 dias no funil. |
| Follow-up 4 | Leads há 7 dias no funil. |
| Break Up | Leads há 9 dias no funil. |
| Reunião marcada | Leads agendados para apresentação. |
| Remarcação | Leads que deram no-show ou que precisam remarcar a apresentação. |
| Negociação | Leads em negociação de valores ou condições para entrada no programa. |
| Proposta enviada | Leads comprometidos com o pagamento, com proposta enviada e dados de cadastro entregues. |
| Finalização | Leads com link de pagamento gerado. |

**Dados para cadastro de um representante:** Nome completo, Telefone, E-mail, CNPJ, Chave PIX, Endereço, CEP.

**Próximo passo:** com os dados do representante, crie a conta dele em portal.cardapioweb.com/login, parceiro.cardapioweb.com/users/sign_in e portal.sandbox.cardapioweb.com/login.

## Funil de Acompanhamento

Este documento padroniza e esclarece o significado de cada etapa do funil de acompanhamento de representantes, garantindo que todo o time tenha o mesmo entendimento sobre o status ao longo da jornada.

| Etapa | Critério |
|---|---|
| Aguardando onboarding | Representante aprovado e cadastrado, aguardando o início ou a conclusão do treinamento de integração. |
| Onboarding agendado | Representante com treinamento de integração já agendado, com data e horário definidos. |
| Onboarding realizado | Representante que concluiu o treinamento e está apto a iniciar suas atividades comerciais. |
| 1º Follow-up (rumo à 1ª venda) | Primeiro contato de acompanhamento após o onboarding, incentivando até a primeira venda. |
| 2º Follow-up (rumo à 1ª venda) | Segundo contato de acompanhamento com o mesmo objetivo. |
| 3º Follow-up (rumo à 1ª venda) | Terceiro contato de acompanhamento com o mesmo objetivo. |
| 1º Cliente | Representante realizou sua primeira venda e foi ativado. |
| 1º Follow-up (rumo à 2ª venda) | Primeiro contato de acompanhamento incentivando até a segunda venda. |
| 2º Follow-up (rumo à 2ª venda) | Segundo contato de acompanhamento com o mesmo objetivo. |
| 3º Follow-up (rumo à 2ª venda) | Terceiro contato de acompanhamento com o mesmo objetivo. |
| 2º Cliente | Representante realizou sua segunda venda. |

## Funil de Clientes de Representantes

Este documento padroniza e esclarece o significado de cada etapa do funil de clientes de representantes, garantindo que todo o time tenha o mesmo entendimento sobre o status dos clientes ao longo da jornada.

| Etapa | Critério |
|---|---|
| Dados recebidos | Representante enviou os dados do cliente (apenas clientes que seguem para implementação). |
| Proposta enviada | Card do cliente criado, com informações, plano e módulo preenchidos, categoria "Produto" adicionada no Pipedrive e modelo de proposta enviado. |
| Negócio fechado | Cliente com link de pagamento, aguardando ser dado como ganho para implementação. |

**Modelo de dados do cliente:** Nome da loja, Nome do titular, CPF, Endereço, CEP, WhatsApp (para implementação), E-mail, Plano escolhido.

## Motivos de Perda

Os motivos de perda são as razões pelas quais os leads foram perdidos. São muito importantes para a recuperação de oportunidades e ajustes de estratégia com foco em aumentar as vendas.

| Motivo | Descrição |
|---|---|
| Sem interesse no momento | Prospect entendeu a proposta, mas declarou não ter interesse em participar do programa neste momento. |
| Falta de orçamento para taxa de ativação | Lead informou não ter orçamento disponível para investir na taxa de ativação neste momento. |
| Já representa software concorrente | Prospect já atua como representante de software concorrente, impossibilitando ou limitando a entrada no programa. |
| No-show | Prospect confirmou presença, mas não compareceu à reunião agendada. |
| Lead não correspondeu às tentativas de contato | Prospect não respondeu às tentativas de contato, sem manifestação formal de desistência. |
| Lead desqualificado | Prospect não atende aos critérios mínimos do programa. |
| Lead duplicado | Contato já existente na base do CRM, identificado como duplicado. |
| Lead é agência de marketing ou gestor de tráfego | Prospect não se enquadra no perfil de representante. |
| Lead quer contratar a plataforma | Lead solicitou atendimento para contratar a plataforma, não para representar. |
| Lead já é parceiro | Lead quer se inscrever no programa de parcerias, não no de representantes. |
| Perda de teste | Motivo para dar perdido em leads de teste. |
| Lead quer White Label | Lead quer o modelo de revenda White Label. |
| Lead com contato indisponível | Lead sem contato disponível para mensagem ou ligação. |`,
  "estrutura-representantes": `Esta aba documenta a nova estrutura do programa de representantes da Cardápio Web: perfil ideal (IPP), benefícios, modelo de funcionamento e principais objeções com respostas.

## Perfil Ideal de Representante (IPP)

Vendedores de software com experiência comprovada em vendas B2B, preferencialmente no segmento de tecnologia, SaaS, sistemas de gestão, automação comercial ou soluções para food service.

### Características esperadas
- Experiência prévia na venda de software ou soluções digitais
- Carteira ativa ou potencial de clientes na região de atuação
- Conhecimento básico de funil de vendas e processos comerciais
- Capacidade de prospecção ativa
- Perfil empreendedor, com visão de ganho recorrente
- Organização mínima para gestão de clientes

### Diferenciais desejáveis
- Time comercial próprio
- Atuação regional consolidada

## Estrutura e funcionamento do programa

### Qualificação
Processo inicial para avaliar se o parceiro faz sentido para o modelo de representantes. Critérios avaliados:
- Como conheceu a Cardápio Web
- Segmento e perfil dos clientes atendidos
- Quantidade de clientes em potencial
- Existência de time comercial
- Estratégia de venda utilizada

### Reunião de negociação
Objetivos:
- Apresentar a Cardápio Web e seu posicionamento de mercado
- Explicar o Programa de Representantes (jornada, benefícios e canais)
- Alinhar expectativas de ambas as partes
- Apresentar responsabilidades, modelo de ganhos e contrato

Caso haja alinhamento, a proposta formal é apresentada.

### Onboarding e capacitação
Jornada estruturada de ativação, com objetivos de:
- Treinamento comercial
- Conhecimento do sistema
- Cultura e ecossistema Cardápio Web
- Criação de conta e configuração do sistema
- Checklist de partida
- Primeiras vendas assistidas

### Ativação e acesso ao portal
Após o onboarding, o representante pode estar:

**Habilitado:**
- Acesso à conta administrativa
- Cadastro de conta PIX
- Personalização de perfil
- Acesso às contas dos clientes
- Criação ilimitada de contas
- Contratação de planos e módulos
- Autonomia para gestão dos pagamentos

**Não habilitado:**
- Acesso limitado até a conclusão dos critérios de ativação

## Modelo financeiro

Comissão crescente de acordo com a responsabilidade do representante. Existe uma taxa de ativação de R$ 1.799,99 para entrar no programa — em caso de negociação, pode ser isentada, mas é necessário alinhar uma meta com o representante (validar com Vanessa e Rafael).

O modelo de comissionamento pode começar em:
- 10%: representante apenas vende
- 20%: representante vende e faz implementação
- 30%: representante vende, implementa e faz suporte ao cliente
- 40%: representante vende, implementa, dá suporte e alcança 50 clientes ativos na carteira com cancelamento menor que 8% mensal

A comissão é válida enquanto o cliente estiver ativo e pagante. Cancelamentos cessam imediatamente a remuneração recorrente daquele cliente. A comissão é paga até o dia 15 de cada mês, calculada pela vigência do mês anterior.

## Preços de venda ao cliente final

O representante vende pelo mesmo valor repassado pela Cardápio Web.

**Planos principais:**
- Premium: R$ 269,99
- Delivery: R$ 209,99
- Mesas: R$ 169,99

**Módulos:**
- Integração com iFood: R$ 29,90
- Estoque Avançado: R$ 29,90
- Gestão de Entregadores: R$ 54,99
- Financeiro: R$ 69,99
- Fiscal: R$ 69,99
- Totem: R$ 99,99

## Serviços extras permitidos

O representante pode gerar receitas adicionais com visitas técnicas, mentorias e implementação do sistema, com valores definidos livremente por ele.

## Níveis e benefícios

Representante Iniciante, Representante Prata e Representante Ouro — critérios e benefícios de cada nível ainda pendentes de definição pela liderança.

## Principais objeções e respostas

### "Preciso pagar taxa de ativação"
Faz total sentido questionar isso. Ninguém quer começar algo novo sentindo que está assumindo um risco sozinho.

A taxa existe justamente para garantir que quem entra tenha estrutura, autonomia e suporte de verdade. Com o modelo de comissão recorrente, o programa foi desenhado para possibilitar retorno já no primeiro mês, sem depender de volume absurdo de vendas.

### "E se eu não vender?"
Essa é uma preocupação normal, principalmente com um novo produto ou mercado.

Por isso o programa não começa direto na venda. Você passa por treinamento, recebe materiais prontos, acompanhamento inicial e aprende exatamente como outros representantes já estão vendendo. Cada cliente ativo vira uma fonte de receita recorrente, reduzindo a pressão de recomeçar do zero todo mês.

### "Por que o programa não é gratuito?"
Muita gente associa parceria com algo sem custo, mas aqui a taxa funciona como um filtro positivo. Ela garante um ecossistema com representantes comprometidos, permitindo à Cardápio Web investir em suporte, materiais, tecnologia e oportunidades reais de ganho para quem está no programa.

### "Não conheço o mercado de food"
Isso acontece bastante, principalmente com vendedores vindos de outros segmentos de software. O treinamento cobre exatamente esse ponto: você aprende as dores do restaurante, o discurso certo, os argumentos que mais convertem e exemplos práticos de venda.`,
};

const ONBOARDING_DAYS: { tag: string; title: string; items: string[] }[] = [
  {
    tag: "Dia 1-2",
    title: "Imersão organizacional",
    items: [
      "Criar conta no Sandbox",
      "Fazer o teste de Profile da Sólides e enviar resultado ao líder direto",
      'Adquirir o livro "Ecossistema de Parceiros" e iniciar a leitura (apresentação em 30 dias)',
      "Solicitar reembolso da compra do livro",
      "Receber feedback do processo seletivo",
      "Agendar o primeiro 1:1 com a liderança",
      "Conversar com as lideranças de Content, Growth, Channel, Pré-vendas, Vendas, Expansão, Implementação, Suporte e Inovação/Parcerias",
      "Reunião diária de encerramento com o gestor direto",
    ],
  },
  {
    tag: "Dia 3",
    title: "Métricas e cultura",
    items: [
      "Desenvolver senso analítico com foco em KPIs e frameworks de gestão de canais",
      "Ler o artigo sobre cultura empresarial",
      "Revisar o memorando interno",
      "Discutir os aprendizados do dia com a liderança",
    ],
  },
  {
    tag: "Dia 4-5",
    title: "Imersão técnica (parte 1)",
    items: [
      "Escutar 5 episódios do Partner Cast com resumos",
      "Estudar o CW Club",
      "Revisar materiais sobre Modelos de Canais, Estruturação de Parcerias, Funções de Partner Manager e Metodologia de Programas de Canal",
    ],
  },
  {
    tag: "Dia 6-7",
    title: "Imersão técnica (parte 2)",
    items: [
      "Estudar o Playbook de Representantes",
      "Revisar definições de onboarding e checklists de integração",
      "Estudar estratégias de capacitação de parceiros (partner enablement)",
      "Estudar SPIN Selling e escalabilidade de programas",
    ],
  },
  {
    tag: "Dia 8",
    title: "Modelo de parcerias e produto",
    items: [
      "Pesquisar 3 empresas com modelos de parceria diferentes",
      "Documentar a contribuição da função de PSM no setor",
      "Estudar a Central de Ajuda e realizar teste prático",
      "Assistir vídeos sobre sistema, cardápio digital e gestão",
    ],
  },
  {
    tag: "Dia 9",
    title: "Teste prático do sistema",
    items: [
      "Criar um cardápio no Sandbox",
      "Configurar gestão de cupons e programa de fidelização",
      "Simular disparos via WhatsApp e cadastrar áreas de entrega",
      "Fazer roleplay sobre as funcionalidades do sistema",
    ],
  },
  {
    tag: "Dia 10",
    title: "Plataformas utilizadas",
    items: [
      "Treinamento em Pipedrive",
      "Acessar o Portal do Representante",
      "Treinamento em Kommo",
      "Acompanhar closer, channel acquisition, PSM, implementador e helpdesk por um dia",
    ],
  },
  {
    tag: "Dia 11-12",
    title: "Apresentação final",
    items: [
      "Preparar apresentação: e-commerce para restaurantes, três pilares, jornada do representante",
      "Incluir técnicas SPIN, métricas, planos e módulos",
      "Incluir a definição de onboarding bem-sucedido",
      "Apresentar para a liderança direta",
    ],
  },
  {
    tag: "Dia 13",
    title: "Treinamento de atendimento",
    items: ["Treinamento de atendimento supervisionado pela liderança direta"],
  },
  {
    tag: "Dia 30",
    title: "Apresentação do livro",
    items: ['Apresentar os aprendizados de "Ecossistema de Parceiros"'],
  },
];

const PRODUTO_PILLS = [
  "Cardápio Digital",
  "Food Marketing",
  "Gestão do Negócio",
  "ChatBot com IA",
  "Programa de Fidelidade",
  "Disparo via WhatsApp",
  "Gestão de Entregas",
  "Central de Ajuda",
];

const IPP_PILLS = [
  "Experiência em vendas B2B",
  "Prospecção ativa",
  "Conhecimento de funil de vendas",
  "Carteira na região",
  "Mentalidade empreendedora",
  "Organização de pipeline",
  "CNPJ ativo (MEI+)",
];

const OBJECOES_SIMPLES = [
  { titulo: "Entendimento do programa", resposta: "Explique que não é revenda — é representação de uma empresa de tecnologia." },
  { titulo: "Prioridade", resposta: "Mostre a relevância da parceria e o potencial de retorno." },
  { titulo: "Perfil", resposta: "Explore o ICP junto com o parceiro e cite exemplos parecidos que já indicaram." },
  { titulo: "Esforço operacional", resposta: "A comissão cresce conforme a responsabilidade assumida — não precisa fazer tudo sozinho." },
  { titulo: "Retorno financeiro", resposta: "Reforce a progressão da comissão e a rapidez de recebimento." },
  { titulo: "Confiança", resposta: "Mostre cases, volume de parceiros ativos e materiais de apoio." },
  { titulo: "Concorrência", resposta: "Destaque os diferenciais do programa — não exige exclusividade." },
  { titulo: "Compromisso", resposta: "Não há metas obrigatórias nem exclusividade forçada; o ritmo é do parceiro." },
  { titulo: "Exclusividade", resposta: "Deixe claro que não exige exclusividade." },
  { titulo: "Deal breaker", resposta: "Desqualifique com respeito e deixe a porta aberta para o futuro." },
  { titulo: "Dispensa", resposta: "Peça um tempo para alinhar, evitando ter que retomar em outro horário." },
];

const CONCORRENTES_DESTAQUE = [
  { nome: "Anota ai", preco: "a partir de R$ 279,99/mês", nota: "Comprado pelo iFood; pouco foco em gestão." },
  { nome: "Saipos", preco: "R$ 219/mês", nota: "Foco em gestão para franquias grandes; temos integração com eles." },
  { nome: "Goomer", preco: "grátis a R$ 299,90/mês", nota: "Forte em totens de mesa; falta ferramentas de marketing." },
  { nome: "WhatsMenu", preco: "R$ 97/mês", nota: "Barato; sem grandes ameaças ao nosso posicionamento." },
  { nome: "Consumer (Menu Dino)", preco: "grátis a R$ 84,90/mês", nota: "Exige instalação local; difícil de usar." },
  { nome: "Sischef", preco: "a partir de R$ 99,99/mês", nota: "Foco em gestão para franquias; temos integração com eles." },
];

const JORNADA_STEPS = [
  { title: "Prospecção", desc: "Identificação e primeiro contato com potenciais representantes, seguindo o funil de prospecção." },
  {
    title: "Mensagem de Confirmação de Apresentação",
    desc: "Reforça o compromisso do lead e alinha dia, horário e formato — reduz o risco de no-show. Templates disponíveis na aba Templates.",
  },
  { title: "Apresentação e fechamento", desc: "Reunião de apresentação do programa e negociação com o lead." },
  {
    title: "Passagem de Bastão",
    desc: "Momento crucial de conexão entre setores na transição do representante fechado para o acompanhamento.",
  },
  {
    title: "Onboarding e acompanhamento",
    desc: "Ativação do representante e acompanhamento contínuo pelo funil de acompanhamento.",
  },
];

const SPIN_LETTERS = [
  { letter: "S", title: "Situação", desc: "Perguntas para entender o contexto atual do parceiro." },
  { letter: "P", title: "Problema", desc: "Perguntas para identificar dificuldades e dores." },
  { letter: "I", title: "Implicação", desc: "Perguntas que exploram o impacto dessas dificuldades." },
  { letter: "N", title: "Necessidade", desc: "Perguntas que conduzem o parceiro a enxergar valor na solução." },
];

const SPECIAL_WIDGET_IDS = new Set([
  "onboarding",
  "produto",
  "ipp",
  "objecoes-concorrentes",
  "jornada-representante",
  "spin-selling",
]);

export function IconChip({ icon: Icon, size = 44, radius = 14 }: { icon: IconType; size?: number; radius?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center text-white"
      style={{ width: size, height: size, borderRadius: radius, backgroundImage: "var(--gradient-primary)" }}
    >
      <Icon className="h-[46%] w-[46%]" />
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="rounded-full border px-3.5 py-1.5 text-[13px] font-semibold"
      style={{ borderColor: "var(--border)", background: "#faf3f9", color: "var(--secondary-foreground)" }}
    >
      {children}
    </span>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border px-4.5 py-4 text-[13.5px] leading-relaxed"
      style={{ borderColor: "var(--border)", backgroundImage: "var(--gradient-soft)", color: "var(--accent-foreground)" }}
    >
      {children}
    </div>
  );
}

function TopicCard({ topic, onClick }: { topic: TopicMeta; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-3 rounded-[22px] border border-border bg-card p-5 text-left"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-start justify-between">
        <IconChip icon={topic.icon} />
        {topic.badge && (
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{ background: BADGE_STYLE[topic.badge].bg, color: BADGE_STYLE[topic.badge].fg }}
          >
            {topic.badge}
          </span>
        )}
      </div>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--category-label)" }}>
          {topic.category}
        </div>
        <div className="mt-0.5 text-base font-bold text-foreground">{topic.title}</div>
        <div className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{topic.summary}</div>
      </div>
    </button>
  );
}

function OnboardingChecklist() {
  const [checks, setChecks] = useLocalStorageState<Record<string, boolean>>("bibly-onboarding-checks", {});

  const toggle = (key: string) => setChecks((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="flex flex-col gap-3.5">
      {ONBOARDING_DAYS.map((group, gi) => (
        <div
          key={group.tag}
          className="rounded-[20px] border border-border bg-card px-5 py-4.5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="mb-2.5 flex items-center gap-2.5">
            <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}>
              {group.tag}
            </span>
            <span className="text-sm font-bold text-foreground">{group.title}</span>
          </div>
          <div className="flex flex-col">
            {group.items.map((text, ii) => {
              const key = `${gi}-${ii}`;
              const checked = !!checks[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggle(key)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-1 py-1.5 text-left transition-colors hover:bg-muted/60"
                >
                  {checked ? (
                    <span
                      className="grid h-[19px] w-[19px] shrink-0 place-items-center rounded-full text-white"
                      style={{ backgroundImage: "var(--gradient-primary)" }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    </span>
                  ) : (
                    <span className="h-[19px] w-[19px] shrink-0 rounded-full border-2" style={{ borderColor: "#e8b4cf" }} />
                  )}
                  <span className={cn("text-[13.5px]", checked ? "text-muted-foreground line-through" : "text-foreground")}>
                    {text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function SpinOverview() {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
      {SPIN_LETTERS.map((s) => (
        <div key={s.letter} className="rounded-[18px] border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
          <div
            className="mb-2.5 grid h-9 w-9 place-items-center rounded-[11px] font-bold text-white"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            {s.letter}
          </div>
          <div className="text-sm font-bold text-foreground">{s.title}</div>
          <div className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</div>
        </div>
      ))}
    </div>
  );
}

function NumberedSteps({ steps }: { steps: { title: string; desc: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      {steps.map((s, i) => (
        <div
          key={s.title}
          className="flex gap-3 rounded-2xl border border-border bg-card px-4.5 py-4"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <span
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold"
            style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}
          >
            {i + 1}
          </span>
          <div>
            <div className="text-sm font-bold text-foreground">{s.title}</div>
            <div className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ObjecoesConcorrentes() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-2.5 text-sm font-bold text-foreground">Objeções mais comuns</div>
        <p className="mb-3 text-[13px] text-muted-foreground">Toque em cada uma para ver a resposta rápida.</p>
        <Accordion
          type="single"
          collapsible
          className="rounded-[20px] border border-border bg-card px-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {OBJECOES_SIMPLES.map((o, i) => (
            <AccordionItem key={o.titulo} value={o.titulo} className={i === OBJECOES_SIMPLES.length - 1 ? "border-b-0" : undefined}>
              <AccordionTrigger className="text-[13.5px] font-semibold text-foreground hover:no-underline">
                {o.titulo}
              </AccordionTrigger>
              <AccordionContent className="text-[13px] leading-relaxed text-muted-foreground">{o.resposta}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div>
        <div className="mb-2.5 text-sm font-bold text-foreground">Principais concorrentes</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CONCORRENTES_DESTAQUE.map((c) => (
            <div key={c.nome} className="rounded-2xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="text-sm font-bold text-foreground">{c.nome}</div>
              <div className="mt-0.5 text-xs font-semibold" style={{ color: "var(--category-label)" }}>
                {c.preco}
              </div>
              <div className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{c.nota}</div>
            </div>
          ))}
        </div>
        <Accordion
          type="single"
          collapsible
          className="mt-3 rounded-[20px] border border-border bg-card px-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <AccordionItem value="tabela-completa" className="border-b-0">
            <AccordionTrigger className="text-[13.5px] font-semibold text-foreground hover:no-underline">
              Ver comparativo completo (28 concorrentes)
            </AccordionTrigger>
            <AccordionContent>
              <RichText text={CONCORRENTES_TABELA_COMPLETA} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

export function Playbook() {
  const [bodies, setBodies] = useLocalStorageState<Record<string, string>>("bibly-playbook-bodies", DEFAULT_BODIES);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [category, setCategory] = useState("Todos");

  const categories = useMemo(() => ["Todos", ...Array.from(new Set(TOPICS.map((t) => t.category)))], []);
  const filtered = category === "Todos" ? TOPICS : TOPICS.filter((t) => t.category === category);
  const active = activeId ? TOPICS.find((t) => t.id === activeId) ?? null : null;

  const updateBody = (id: string, body: string) => setBodies((prev) => ({ ...prev, [id]: body }));

  if (active) {
    const showBody = active.id !== "onboarding" && active.id !== "objecoes-concorrentes";
    return (
      <div className="h-screen overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8 sm:px-10">
          <button
            type="button"
            onClick={() => setActiveId(null)}
            className="mb-4.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Voltar ao Playbook
          </button>

          <div className="mb-1.5 flex items-center gap-3.5">
            <IconChip icon={active.icon} size={48} radius={14} />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--category-label)" }}>
                {active.category}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{active.title}</h1>
            </div>
          </div>
          <p className="mb-7 mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{active.summary}</p>

          <div className="flex flex-col gap-4">
            {active.id === "onboarding" && <OnboardingChecklist />}

            {active.id === "produto" && (
              <div className="rounded-[20px] border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="mb-3 text-sm font-bold text-foreground">Principais frentes do produto</div>
                <div className="flex flex-wrap gap-2">
                  {PRODUTO_PILLS.map((p) => (
                    <Pill key={p}>{p}</Pill>
                  ))}
                </div>
              </div>
            )}

            {active.id === "ipp" && (
              <div className="rounded-[20px] border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="mb-3 text-sm font-bold text-foreground">Critérios do perfil ideal</div>
                <div className="flex flex-wrap gap-2">
                  {IPP_PILLS.map((p) => (
                    <Pill key={p}>{p}</Pill>
                  ))}
                </div>
              </div>
            )}

            {active.id === "objecoes-concorrentes" && <ObjecoesConcorrentes />}

            {active.id === "jornada-representante" && <NumberedSteps steps={JORNADA_STEPS} />}

            {active.id === "spin-selling" && <SpinOverview />}

            {showBody && (
              <div className="rounded-[20px] border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-bold text-foreground">
                    {SPECIAL_WIDGET_IDS.has(active.id) ? "Conteúdo completo" : "Detalhes"}
                  </div>
                  <MarkdownEditorDialog
                    title={active.title}
                    description="Edite o conteúdo em markdown simples (##, ###, ####, listas com -, tabelas com |, **negrito**)."
                    value={bodies[active.id] ?? ""}
                    onSave={(body) => updateBody(active.id, body)}
                  />
                </div>
                <RichText text={bodies[active.id] ?? ""} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto">
      <header className="px-6 pb-2 pt-8 sm:px-10">
        <h1 className="text-[26px] font-bold tracking-tight text-foreground">Playbook</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nesse playbook você encontra os pontos centrais do time de representantes — consulte sempre que precisar.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 px-6 pb-1 pt-4 sm:px-10">
        {categories.map((c) => {
          const isActive = category === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn("rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors", isActive ? "text-white" : "border text-muted-foreground hover:text-foreground")}
              style={isActive ? { backgroundImage: "var(--gradient-primary)" } : { borderColor: "var(--border)", background: "var(--card)" }}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-2 sm:px-10 xl:grid-cols-3">
        {filtered.map((topic) => (
          <TopicCard key={topic.id} topic={topic} onClick={() => setActiveId(topic.id)} />
        ))}
      </div>
    </div>
  );
}
