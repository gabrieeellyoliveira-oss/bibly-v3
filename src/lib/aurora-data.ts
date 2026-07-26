/** Central data catalog: playbook topics, objections, competitors, follow-ups, materials, career, goals */

export type PlaybookTopic = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  badge?: "Novo" | "Atualizado";
  body: string; // markdown-lite
  widget?: "objections-competitors";
};

export const PLAYBOOK: PlaybookTopic[] = [
  {
    slug: "onboarding",
    title: "Onboarding",
    category: "Cultura & Time",
    summary: "Checklist do primeiro mês na Squad Onça: cultura, ferramentas e primeiras entregas.",
    body: `## Onboarding — Semana 1
### Dia 1 — Cultura
- Boas-vindas com o time
- Apresentação Squad Onça: FOCO • GARRA • RESULTADO
- Acesso ao Notion, Kommo e portais internos
### Dia 2 — Produto
- Tour pelo Cardápio Web (Mesas, Delivery, Premium)
- Estudo dos módulos extras
### Dia 3 — Processo
- Jornada do Representante ponta a ponta
- Rituais da squad (dailies, weeklies)
### Dia 4 — Ferramentas
- Kommo: pipelines e cadências
- Playbook Aurora
### Dia 5 — Prática
- Sombra de reunião com PSM sênior
- Primeira ligação supervisionada`,
  },
  {
    slug: "produto",
    title: "Produto Cardápio Web",
    category: "Vendas",
    summary: "Funcionalidades por pilar, integrações e o que entra em cada plano.",
    body: `## Pilares do Produto
### Cardápio Digital
- Delivery próprio com taxa 0%
- Mesas com QR Code
- Chatbot integrado
- Pagamento online (Pix, cartão)
### Food Marketing
- Disparador de WhatsApp
- Programa de fidelidade
- Cupons e campanhas
### Gestão do Negócio
- Caixa e conciliação
- Cupom fiscal
- Estoque de produtos e insumos
- Gestão financeira
- Rotas de entregadores
- Totem de autoatendimento
## Integrações
| Categoria | Parceiros |
| --- | --- |
| Pagamento | Mercado Pago, Pagar.me, Cielo |
| Delivery | iFood, Uber Direct |
| Fiscal | Focus NFe, Tecnospeed |
| Chatbot | Botmaker, Wati |
## Funcionalidades por Plano
| Feature | Mesas | Delivery | Premium |
| --- | --- | --- | --- |
| Cardápio Digital | ✓ | ✓ | ✓ |
| Comandas de Mesa | ✓ | — | ✓ |
| Delivery próprio | — | ✓ | ✓ |
| Chatbot WhatsApp | — | ✓ | ✓ |
| Marketing avançado | — | — | ✓ |`,
  },
  {
    slug: "ipp",
    title: "IPP — Perfil Ideal de Parceiro",
    category: "Aquisição",
    summary: "Quem é o representante ideal para prospectarmos: características e diferenciais.",
    body: `## Características
- Já vende para o setor food service
- Base ativa de +30 restaurantes
- Time comercial estruturado
- Experiência com SaaS ou automação
## Diferenciais
- Cobertura regional
- Suporte técnico próprio
- Reputação no mercado local`,
  },
  {
    slug: "objecoes",
    title: "Objeções & Concorrentes",
    category: "Vendas",
    summary: "Arsenal para contornar objeções e a matriz completa de comparação com concorrentes.",
    widget: "objections-competitors",
    body: "",
  },
  {
    slug: "jornada",
    title: "Jornada do Representante",
    category: "Processos",
    badge: "Novo",
    summary: "As 5 etapas do ciclo: Prospecção → Confirmação → Apresentação → Passagem → Onboarding.",
    body: `## Etapas
### 1. Prospecção
- Lista qualificada + cadência outbound
- Alvo semanal: 40 novos contatos
### 2. Confirmação
- Confirmar reunião 24h antes
- Enviar contexto e agenda
### 3. Apresentação / Fechamento
- SPIN Selling na descoberta
- Demo focada na dor identificada
- Proposta objetiva com plano ideal
### 4. Passagem de Bastão
- Handoff para PSM com contexto
- Documentar objeções, promessas e dores
### 5. Onboarding / Acompanhamento
- Ativação em até 10 dias
- Follow-ups semanais nos 3 primeiros meses`,
  },
  {
    slug: "passagem-bastao",
    title: "Passagem de Bastão",
    category: "Processos",
    summary: "Como transferir o cliente do closer para o PSM sem perder contexto.",
    body: `## Checklist da passagem
- Ata da reunião final
- Plano contratado e prazo
- Objeções superadas
- Promessas feitas ao cliente
- Contatos-chave e decisores
- Data da primeira reunião de onboarding

## Formato
Use o template de handoff no Kommo. Sempre marque o PSM e envie um resumo no canal #passagem-representantes.`,
  },
  {
    slug: "spin",
    title: "SPIN Selling",
    category: "Vendas",
    summary: "As 4 famílias de perguntas para diagnosticar a dor real do cliente.",
    body: `## Estrutura
### S — Situação
Entenda o contexto operacional atual.
### P — Problema
Explore dores concretas do dia a dia.
### I — Implicação
Amplifique o custo de não resolver.
### N — Necessidade
Confirme o valor da solução com o próprio cliente.`,
  },
  {
    slug: "aida",
    title: "AIDA",
    category: "Vendas",
    summary: "Atenção, Interesse, Desejo e Ação — estrutura clássica de argumentação.",
    body: `## AIDA
- **Atenção**: abertura forte que quebra o padrão
- **Interesse**: conecte com a realidade do restaurante
- **Desejo**: mostre o resultado tangível
- **Ação**: chame para o próximo passo agora`,
  },
  {
    slug: "funcoes",
    title: "Funções",
    category: "Cultura & Time",
    summary: "Quem faz o quê na Squad Onça e como acionamos cada função.",
    body: `## Funções da Squad
- **Head**: estratégia e metas trimestrais
- **PSM Sênior**: acompanhamento consultivo de carteira
- **PSM Jr/Pleno**: execução de rituais e cadências
- **SDR de canal**: prospecção outbound de representantes
- **Ops**: dashboards, comissões e passagem de bastão`,
  },
  {
    slug: "funis",
    title: "Funis",
    category: "Processos",
    badge: "Novo",
    summary: "Como o funil de canal se conecta com o funil de venda final.",
    body: `## Funil de Canal (Representante)
- Prospecção → Diagnóstico → Ativação → Produção

## Funil de Venda (Cliente final via representante)
- Lead → Reunião → Proposta → Fechamento → Ativação`,
  },
  {
    slug: "estrutura",
    title: "Estrutura de Representantes",
    category: "Comercial",
    summary: "Como está organizado o canal de representantes na Cardápio Web.",
    body: `## Estrutura
- Regionais por macrorregião do Brasil
- Cada regional tem um PSM dedicado
- Comissão escalonada por produção mensal
- Suporte técnico centralizado`,
  },
];

export const CATEGORIES = ["Todas", ...Array.from(new Set(PLAYBOOK.map((p) => p.category)))];

export type Objection = { title: string; type: string; answer: string };
export const OBJECTION_TYPES = ["Todas", "Dispensa", "Confiança", "Perfil", "Compromisso", "Retorno", "Concorrência"] as const;

export const OBJECTIONS: Objection[] = [
  { title: "Dispensa direta", type: "Dispensa", answer: "Reconheça o momento, valide a agenda e proponha 10 minutos em outro horário. 'Entendo que agora não é o momento — posso reservar 10 minutos na quarta pela manhã só para você avaliar se faz sentido?'" },
  { title: "Prioridade", type: "Dispensa", answer: "Amarre a conversa em um resultado concreto que impacta o negócio dele nas próximas semanas. Foco no custo de adiar." },
  { title: "Perfil", type: "Perfil", answer: "Confirme critérios do IPP e mostre casos parecidos. Se realmente não for perfil, seja honesto e peça indicação." },
  { title: "Esforço operacional", type: "Compromisso", answer: "Mostre o onboarding em 9 dias e o suporte dedicado. Traga números de ativação para provar que o esforço é baixo." },
  { title: "Retorno financeiro", type: "Retorno", answer: "Traga o ROI médio da carteira e um cálculo rápido com o volume dele. Comissão + margem, não só ticket." },
  { title: "Confiança", type: "Confiança", answer: "Trabalhe cases da região, mostre a estrutura do time e proponha um piloto controlado." },
  { title: "Concorrência", type: "Concorrência", answer: "Use a matriz de concorrentes. Foque nos 3 diferenciais exclusivos e no que o concorrente não entrega bem." },
  { title: "Compromisso", type: "Compromisso", answer: "Formalize próximos passos com data, hora e responsável. 'Combinado: quarta, 10h, você me traz a base para o piloto.'" },
  { title: "Exclusividade", type: "Perfil", answer: "Explique o modelo: sem exclusividade rígida, mas com regras claras de conflito de carteira." },
  { title: "Deal breaker", type: "Retorno", answer: "Descubra o real motivo com pergunta aberta. Reposicione a proposta ou saia com clareza — sem enrolar." },
  { title: "Entendimento do programa", type: "Confiança", answer: "Volte um passo, use o pitch estruturado (o que é, quem participa, como comissiona, quando paga) e valide item a item." },
];

export type Competitor = {
  name: string;
  price: string;
  // 13 features across the 3 pillars
  features: Record<string, "full" | "partial" | "no">;
  note?: string;
};

export const FEATURE_TABS = {
  "Cardápio Digital": ["Delivery", "Mesas", "Chatbot", "Pagamento"],
  "Food Marketing": ["WhatsApp Disparador", "Fidelidade"],
  "Gestão do Negócio": ["Caixa", "Fiscal", "Estoque Produtos", "Estoque Insumos", "Financeira", "Rotas", "Totem"],
} as const;

export const ALL_FEATURES = Object.values(FEATURE_TABS).flat();

const F = (arr: (0 | 1 | 2)[]): Record<string, "full" | "partial" | "no"> => {
  const m: Record<string, "full" | "partial" | "no"> = {};
  ALL_FEATURES.forEach((f, i) => {
    m[f] = arr[i] === 2 ? "full" : arr[i] === 1 ? "partial" : "no";
  });
  return m;
};

// Cardápio Web — reference
export const CW: Competitor = {
  name: "Cardápio Web",
  price: "A partir de R$169,99/mês",
  features: F([2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]),
};

export const COMPETITORS: Competitor[] = [
  { name: "Anota ai", price: "R$189/mês", features: F([2, 1, 1, 2, 1, 1, 0, 1, 1, 0, 0, 0, 0]), note: "Cardápio digital forte, gestão limitada." },
  { name: "Brendi", price: "R$179/mês", features: F([2, 1, 1, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0]), note: "Bom em delivery, sem estoque avançado." },
  { name: "Saipos", price: "R$249/mês", features: F([2, 2, 1, 2, 1, 1, 2, 2, 2, 2, 2, 1, 1]), note: "Concorrente completo em gestão." },
  { name: "Instadelivery", price: "R$149/mês", features: F([2, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0]), note: "Foco só em delivery via Instagram." },
  { name: "Consumer / Menu Dino", price: "R$99/mês", features: F([2, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]), note: "Cardápio simples, quase sem gestão." },
  { name: "Goomer", price: "R$219/mês", features: F([2, 2, 1, 2, 0, 1, 1, 1, 1, 0, 0, 0, 2]), note: "Forte em totem, delivery ok." },
  { name: "Yooga", price: "R$199/mês", features: F([1, 2, 0, 1, 0, 1, 2, 2, 1, 1, 1, 0, 0]), note: "Bom em PDV e mesas, delivery fraco." },
  { name: "OlaClick", price: "R$129/mês", features: F([2, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0]), note: "Focado no cardápio digital LATAM." },
  { name: "WhatsMenu", price: "R$99/mês", features: F([2, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]), note: "Cardápio via WhatsApp, sem gestão." },
  { name: "Multipedidos", price: "R$179/mês", features: F([2, 1, 1, 2, 1, 1, 1, 1, 1, 0, 0, 1, 0]), note: "Delivery multi-loja." },
  { name: "Delivery Direto", price: "R$159/mês", features: F([2, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0]) },
  { name: "Linx", price: "Sob consulta", features: F([1, 2, 0, 2, 0, 0, 2, 2, 2, 2, 2, 1, 2]), note: "Enterprise, ticket alto." },
  { name: "Neemo", price: "R$139/mês", features: F([2, 1, 1, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0]) },
  { name: "Alloy", price: "R$189/mês", features: F([1, 2, 0, 2, 0, 1, 2, 1, 1, 1, 1, 0, 0]) },
  { name: "Accon", price: "R$209/mês", features: F([1, 2, 0, 1, 0, 0, 2, 2, 2, 2, 2, 0, 1]) },
  { name: "Takeat", price: "R$169/mês", features: F([2, 2, 1, 2, 0, 1, 1, 1, 1, 0, 0, 0, 0]) },
  { name: "EasyAssist", price: "R$149/mês", features: F([1, 1, 2, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0]) },
  { name: "BigDim", price: "R$199/mês", features: F([2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0, 0]) },
  { name: "Ecta", price: "R$219/mês", features: F([1, 2, 0, 2, 0, 0, 2, 2, 2, 1, 2, 0, 1]) },
  { name: "Suitable", price: "R$189/mês", features: F([2, 1, 1, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0]) },
  { name: "BeeFood", price: "R$159/mês", features: F([2, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0]) },
  { name: "Cardápio Ai", price: "R$139/mês", features: F([2, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0]) },
  { name: "Omie", price: "R$249/mês", features: F([0, 0, 0, 1, 0, 0, 2, 2, 2, 2, 2, 0, 0]), note: "ERP forte, sem cardápio." },
  { name: "GrandChef", price: "R$179/mês", features: F([1, 2, 0, 1, 0, 1, 2, 1, 2, 1, 1, 0, 1]) },
  { name: "Jotajá", price: "R$149/mês", features: F([2, 1, 0, 2, 1, 0, 1, 0, 0, 0, 0, 0, 0]) },
  { name: "Sischef", price: "R$219/mês", features: F([1, 2, 0, 2, 0, 1, 2, 2, 2, 2, 1, 0, 1]) },
  { name: "Deli", price: "R$129/mês", features: F([2, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]) },
];

/* Follow-ups */
export const FOLLOWUP_CATEGORIES = ["Todas", "Confirmação", "Prospecção", "Pós-reunião", "Onboarding", "1º Cliente", "2º Cliente", "Favoritos"] as const;

export type Template = { id: string; category: string; title: string; message: string };
export const TEMPLATES: Template[] = [
  { id: "c1", category: "Confirmação", title: "Confirmação D-1", message: "Olá {NOME}! Passando para confirmar nossa reunião amanhã às {HORA}. Vou te mostrar como estamos ajudando representantes a rentabilizar suas carteiras com a Cardápio Web. Podemos manter?" },
  { id: "c2", category: "Confirmação", title: "Confirmação 2h antes", message: "Oi {NOME}, tudo certo por aí? Só reforçando nosso papo daqui a pouco às {HORA}. Já te envio o link do meet 15 minutos antes." },
  { id: "c3", category: "Confirmação", title: "Reagendamento gentil", message: "Oi {NOME}, sem crise! Consegue quinta às 10h ou sexta às 14h? Reservo aqui e te confirmo." },
  { id: "p1", category: "Prospecção", title: "Prospecção D+0 — abertura", message: "Oi {NOME}, aqui é a Gabi da Cardápio Web. Vi que você trabalha com representação para restaurantes na região — temos um programa de canais pagando comissão recorrente. Faz sentido a gente conversar 15 min?" },
  { id: "p2", category: "Prospecção", title: "Prospecção D+2 — reforço", message: "Oi {NOME}, retomando o contato de segunda. Nossos representantes atuais estão gerando entre R$3k e R$8k de comissão recorrente por mês. Consigo te mostrar como em uma call rápida esta semana?" },
  { id: "p3", category: "Prospecção", title: "Prospecção D+4 — caso", message: "{NOME}, um representante em situação parecida com a sua ativou 12 clientes no 1º trimestre. Posso te contar como ele estruturou?" },
  { id: "p4", category: "Prospecção", title: "Prospecção D+6 — permissão", message: "Oi {NOME}, ainda faz sentido conversarmos? Se preferir, mando um resumo por texto e você me diz se quer avançar." },
  { id: "p5", category: "Prospecção", title: "Prospecção D+7 — última tentativa", message: "{NOME}, entendo se não for prioridade agora. Deixo aqui meu contato para quando quiser explorar o canal — sem pressão." },
  { id: "p6", category: "Prospecção", title: "Break-up D+9", message: "Oi {NOME}, vou encerrar meu follow por aqui. Se um dia fizer sentido voltar, me chama que retomo com você. Sucesso!" },
  { id: "pr1", category: "Pós-reunião", title: "Pós-reunião — resumo", message: "Oi {NOME}, obrigada pelo papo hoje! Segue resumo:\n\n• Modelo do programa\n• Comissão de {%}\n• Próximos passos: {AÇÃO}\n\nQualquer dúvida, chama." },
  { id: "pr2", category: "Pós-reunião", title: "Pós-reunião — proposta", message: "{NOME}, conforme combinado, envio a proposta anexa. Fico à disposição para revisar juntos amanhã." },
  { id: "pr3", category: "Pós-reunião", title: "Pós-reunião — silêncio", message: "Oi {NOME}, seguimos com o próximo passo? Se precisar de mais algum material para decidir, me fala." },
  { id: "o1", category: "Onboarding", title: "Onboarding D+0", message: "{NOME}, bem-vindo(a) à Cardápio Web! Vamos ativar seu primeiro cliente juntos. Nossa primeira reunião está agendada para {DATA}." },
  { id: "o2", category: "Onboarding", title: "Onboarding D+3", message: "Como estão os primeiros passos, {NOME}? Precisa de ajuda com algum material ou apresentação?" },
  { id: "o3", category: "Onboarding", title: "Onboarding D+7", message: "{NOME}, chegando na primeira semana! Já mapeou os 5 primeiros clientes que quer prospectar?" },
  { id: "o4", category: "Onboarding", title: "Onboarding D+10 — ativação", message: "Parabéns pelo primeiro cliente, {NOME}! 🎉 Bora garantir o segundo essa semana?" },
  { id: "cl1", category: "1º Cliente", title: "Comemoração 1º cliente", message: "{NOME}, é oficial: seu 1º cliente foi ativado! Isso destrava sua comissão recorrente. Vamos para o próximo?" },
  { id: "cl2", category: "1º Cliente", title: "Reforço pós 1º cliente", message: "{NOME}, agora que você já ativou o 1º, o padrão da nossa base é o 2º sair em até 15 dias. Vamos combinar 3 alvos para essa semana?" },
  { id: "cl3", category: "2º Cliente", title: "Aceleração 2º cliente", message: "{NOME}, você está a 1 cliente de virar rep produtivo oficial. Posso te ajudar a fechar o próximo hoje?" },
  { id: "cl4", category: "2º Cliente", title: "Pós 2º cliente", message: "{NOME}, dois ativos! Isso te coloca no ranking mensal. Vamos revisar a cadência para escalar?" },
  { id: "g1", category: "Prospecção", title: "Follow-up curto — ainda ativo?", message: "Oi {NOME}, ainda faz sentido conversarmos essa semana?" },
  { id: "g2", category: "Pós-reunião", title: "Recado por áudio", message: "Oi {NOME}, gravei um áudio rápido explicando os próximos passos. Consegue ouvir agora?" },
  { id: "g3", category: "Onboarding", title: "Checkin quinzenal", message: "{NOME}, checkin quinzenal: quais clientes estão no seu pipeline agora? Bora revisar juntos." },
];

/* Materials */
export const MATERIALS = [
  { id: "m1", type: "Infográfico", title: "Planos e Módulos", desc: "Comparativo visual dos planos Mesas, Delivery e Premium com módulos extras.", href: "/materiais-planos-modulos.png" },
  { id: "m2", type: "PDF", title: "Pitch de Apresentação", desc: "Deck de 8 slides para apresentar o programa em reuniões.", href: "#" },
  { id: "m3", type: "PDF", title: "Contrato do Representante", desc: "Modelo padrão para envio após fechamento.", href: "#" },
  { id: "m4", type: "Imagem", title: "Card de Divulgação", desc: "Imagem quadrada pronta para stories e status de WhatsApp.", href: "#" },
  { id: "m5", type: "PDF", title: "Cases da Squad Onça", desc: "Histórias de representantes que passaram de R$5k de comissão/mês.", href: "#" },
  { id: "m6", type: "Imagem", title: "Comparativo com Concorrentes", desc: "Print pronto da matriz de concorrentes para enviar em WhatsApp.", href: "#" },
];

/* Plans */
export const PLANS = [
  {
    id: "mesas",
    label: "Plano Mesas",
    badge: "IDEAL PARA MESAS",
    prices: { mensal: 169.99, tri: 159.99, sem: 149.99, anual: 139.99 },
    features: ["Comandas de mesa com QR Code", "Cardápio digital", "Gestão de pedidos", "Relatórios básicos", "Suporte via chat"],
    full: ["Comandas por QR Code", "Cardápio digital ilimitado", "Impressão de pedidos", "Gestão de mesas em tempo real", "Relatórios de vendas", "Multi-usuário", "Integrações básicas"],
  },
  {
    id: "delivery",
    label: "Plano Delivery",
    badge: "IDEAL PARA DELIVERY",
    prices: { mensal: 209.99, tri: 199.99, sem: 189.99, anual: 179.99 },
    features: ["Delivery próprio taxa 0%", "Cardápio digital", "Chatbot WhatsApp", "Pagamento online", "Suporte prioritário"],
    full: ["Delivery próprio com taxa 0%", "Chatbot WhatsApp", "Pagamento online (Pix, cartão)", "Cupons e promoções", "Integração iFood", "Rastreio de pedidos", "Relatórios de delivery"],
  },
  {
    id: "premium",
    label: "Plano Premium",
    badge: "MAIS COMPLETO",
    highlighted: true,
    prices: { mensal: 269.99, tri: 259.99, sem: 249.99, anual: 239.99 },
    features: ["Tudo dos planos Mesas + Delivery", "Marketing avançado", "Fidelidade e cupons", "Multi-loja", "Suporte VIP"],
    full: ["Tudo do plano Mesas", "Tudo do plano Delivery", "Programa de fidelidade", "Disparador WhatsApp", "Marketing avançado", "Multi-loja", "Suporte VIP dedicado", "Relatórios avançados"],
  },
] as const;

export const MODULES = [
  { id: "marketplace", label: "Marketplace", desc: "Ative venda em marketplaces integrados.", price: 29.99 },
  { id: "estoque", label: "Estoque Avançado", desc: "Controle de insumos, fichas técnicas e alertas.", price: 29.99 },
  { id: "fiscal", label: "Cupom Fiscal", desc: "Emissão de NFC-e e SAT integrado ao caixa.", price: 69.99 },
  { id: "entregadores", label: "Entregadores", desc: "Gestão de rotas, motoboys e taxas escalonadas.", price: 54.99, note: "Taxa por pedido: 0% até 500, 8% de 501–1.500, 6% acima." },
  { id: "financeiro", label: "Financeiro", desc: "Contas a pagar/receber, DRE e conciliação bancária.", price: 69.99 },
  { id: "totem", label: "Totem", desc: "Autoatendimento em totem para restaurantes e food courts.", price: 99.99 },
];

/* Career levels — dados reais de base salarial e comissão (planilha oficial),
   não os valores fictícios de exemplo. */
export type Level = {
  id: string;
  tier: "jr" | "pl" | "sr";
  base: number;
  base_meta: { m1: { pct: number; ote: number }; m2: { pct: number; ote: number }; m3: { pct: number; ote: number } };
  estrela: { m1: { pct: number; ote: number }; m2: { pct: number; ote: number }; m3: { pct: number; ote: number } };
  criterio: string;
  desclassificacao: string;
};

const CRIT = "Ramp-up concluído em caso de novato; Meta 3 nos últimos 2 meses.";
const DESCLAS = "Não bater Meta 3 na faixa Estrela — desce para o nível anterior.";

export const LEVELS: Level[] = [
  { id: "JR1", tier: "jr", base: 1809.51, base_meta: { m1: { pct: 20, ote: 2171.41 }, m2: { pct: 25, ote: 2261.89 }, m3: { pct: 30, ote: 2352.36 } }, estrela: { m1: { pct: 30, ote: 2352.36 }, m2: { pct: 35, ote: 2442.84 }, m3: { pct: 40, ote: 2533.31 } }, criterio: CRIT, desclassificacao: DESCLAS },
  { id: "JR2", tier: "jr", base: 1988.48, base_meta: { m1: { pct: 20, ote: 2386.18 }, m2: { pct: 25, ote: 2485.6 }, m3: { pct: 30, ote: 2585.02 } }, estrela: { m1: { pct: 30, ote: 2585.02 }, m2: { pct: 35, ote: 2684.45 }, m3: { pct: 40, ote: 2783.87 } }, criterio: CRIT, desclassificacao: DESCLAS },
  { id: "JR3", tier: "jr", base: 2185.14, base_meta: { m1: { pct: 20, ote: 2622.17 }, m2: { pct: 25, ote: 2731.43 }, m3: { pct: 30, ote: 2840.68 } }, estrela: { m1: { pct: 30, ote: 2840.68 }, m2: { pct: 35, ote: 2949.94 }, m3: { pct: 40, ote: 3059.2 } }, criterio: CRIT, desclassificacao: DESCLAS },
  { id: "PL1", tier: "pl", base: 2401.25, base_meta: { m1: { pct: 25, ote: 3001.56 }, m2: { pct: 30, ote: 3121.62 }, m3: { pct: 45, ote: 3481.81 } }, estrela: { m1: { pct: 30, ote: 3121.62 }, m2: { pct: 35, ote: 3241.69 }, m3: { pct: 50, ote: 3601.88 } }, criterio: CRIT, desclassificacao: DESCLAS },
  { id: "PL2", tier: "pl", base: 2617.36, base_meta: { m1: { pct: 25, ote: 3271.7 }, m2: { pct: 30, ote: 3402.57 }, m3: { pct: 45, ote: 3795.17 } }, estrela: { m1: { pct: 30, ote: 3402.57 }, m2: { pct: 35, ote: 3533.44 }, m3: { pct: 50, ote: 3926.04 } }, criterio: CRIT, desclassificacao: DESCLAS },
  { id: "PL3", tier: "pl", base: 2852.93, base_meta: { m1: { pct: 25, ote: 3566.16 }, m2: { pct: 30, ote: 3708.81 }, m3: { pct: 45, ote: 4136.75 } }, estrela: { m1: { pct: 30, ote: 3708.81 }, m2: { pct: 35, ote: 3851.46 }, m3: { pct: 50, ote: 4279.4 } }, criterio: CRIT, desclassificacao: DESCLAS },
  { id: "SR1", tier: "sr", base: 3109.69, base_meta: { m1: { pct: 25, ote: 3887.11 }, m2: { pct: 30, ote: 4042.6 }, m3: { pct: 45, ote: 4509.05 } }, estrela: { m1: { pct: 30, ote: 4042.6 }, m2: { pct: 35, ote: 4198.08 }, m3: { pct: 50, ote: 4664.53 } }, criterio: CRIT, desclassificacao: DESCLAS },
  { id: "SR2", tier: "sr", base: 3389.56, base_meta: { m1: { pct: 25, ote: 4236.95 }, m2: { pct: 30, ote: 4406.43 }, m3: { pct: 45, ote: 4914.86 } }, estrela: { m1: { pct: 30, ote: 4406.43 }, m2: { pct: 35, ote: 4575.91 }, m3: { pct: 50, ote: 5084.34 } }, criterio: CRIT, desclassificacao: DESCLAS },
  { id: "SR3", tier: "sr", base: 3694.62, base_meta: { m1: { pct: 25, ote: 4618.27 }, m2: { pct: 30, ote: 4803.01 }, m3: { pct: 45, ote: 5357.2 } }, estrela: { m1: { pct: 30, ote: 4803.01 }, m2: { pct: 35, ote: 4987.74 }, m3: { pct: 50, ote: 5541.93 } }, criterio: CRIT, desclassificacao: DESCLAS },
];

/* Metas */
export const METAS_INIT = {
  ativacao: [
    { label: "Tempo médio de onboarding", value: "9 dias", ctx: "meta até 10" },
    { label: "% do canal treinado", value: "78%", ctx: "meta 90%" },
    { label: "Taxa de acesso ao portal", value: "64%", ctx: "meta 75%" },
    { label: "Consumo de materiais de capacitação", value: "52%", ctx: "meta 70%" },
    { label: "Ações de co-marketing realizadas", value: "3", ctx: "meta 5" },
  ],
  performance: [
    { label: "Volume de leads indicados", value: "27", ctx: "meta 35" },
    { label: "Taxa de conversão por etapa", value: "18%", ctx: "lead → cliente" },
    { label: "Valor total de vendas", value: "R$ 42.300", ctx: "no mês" },
    { label: "Ticket médio das oportunidades", value: "R$ 1.567", ctx: "média mensal" },
    { label: "Ciclo de vendas no canal", value: "14 dias", ctx: "meta ≤ 18" },
  ],
  financeiro: [
    { label: "Receita recorrente gerada (MRR)", value: "R$ 63.510", ctx: "meta R$ 70k" },
    { label: "Comissões pagas", value: "R$ 8.240", ctx: "no mês" },
    { label: "Margem gerada por canal", value: "34%", ctx: "meta 30%" },
    { label: "Taxa de churn dos clientes do parceiro", value: "3,2%", ctx: "meta ≤ 5%" },
    { label: "CLV por canal", value: "R$ 4.980", ctx: "média" },
  ],
};
