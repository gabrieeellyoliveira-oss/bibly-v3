import { useMemo, useState } from "react";
import { BookOpen, ChevronRight, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { MarkdownEditorDialog, RichText } from "@/components/bibly/editors";

// ---------------------------------------------------------------------------
// Playbook de Representantes — material central de consulta do time.
// Conteúdo inicial extraído das planilhas de onboarding e de playbook de
// representantes; tudo editável pela engrenagem, persiste no navegador.
// ---------------------------------------------------------------------------

type PlaybookTopic = {
  id: string;
  title: string;
  summary: string;
  body: string;
};

const PLAYBOOK_TOPICS_PADRAO: PlaybookTopic[] = [
  {
    id: "onboarding",
    title: "Onboarding (PSM)",
    summary: "Roteiro de integração do Partner Success Manager nos primeiros 30 dias",
    body: `É o seu processo de entrada e adaptação aqui na empresa. Ele foi pensado para te ajudar a entender como tudo funciona: desde a cultura e os valores da empresa, até as ferramentas, rotinas e o seu papel no time.

O objetivo é que você receba treinamentos, conheça pessoas-chave, tire dúvidas e se sinta confiante e integrado(a) rapidamente.

## Dia 1 e Dia 2

**Imersão organizacional**
- Criação de conta no Sandbox
- Teste de Profile Sólides
- Envio do resultado para o líder direto

**Compra de livro e primeiro 1:1**
- Adquirir o livro "Ecossistema de Parceiros"
- Iniciar a leitura para apresentação após 30 dias
- Solicitar reembolso
- Receber feedback do processo seletivo
- Agendar o primeiro 1:1 com a liderança

**Conhecendo a jornada do cliente**
Conversas programadas com lideranças de Content, Growth, Channel, Pré-vendas, Vendas, Expansão, Implementação, Suporte e Inovação/Parcerias.

**Ponto de contato com liderança**
Reunião diária de encerramento com o gestor direto.

## Dia 3

**Métricas**
Desenvolver senso analítico com foco em KPIs e frameworks de gestão de canais.

**Cultura da Cardápio Web**
- Ler o artigo sobre cultura empresarial
- Revisar o memorando interno
- Discutir aprendizados com a liderança

## Dias 4 e 5

**Imersão técnica (parte 1)**
- Escutar 5 episódios do Partner Cast com resumos
- Estudar o CW Club
- Revisar materiais sobre: Modelos de Canais, Estruturação de Parcerias, Funções de Partner Manager e Metodologia de Programas de Canal

## Dias 6 e 7

**Imersão técnica (parte 2)**
Explorar recursos sobre: Playbook de Representantes, definições de onboarding, checklists de integração, estratégias de capacitação de parceiros, SPIN Selling e escalabilidade de programas.

## Dia 8

**Conhecimento de modelo de parcerias**
- Pesquisar 3 empresas com modelos diferentes
- Documentar a contribuição da função de PSM no setor

**Conhecendo o produto**
- Estudar a Central de Ajuda
- Realizar teste prático
- Assistir vídeos sobre sistema, cardápio digital e gestão

## Dia 9

**Teste prático do sistema**
Exercícios no Sandbox incluindo: criação de cardápio, gestão de cupons, programa de fidelização, disparos via WhatsApp, cadastro de áreas de entrega e roleplay.

## Dia 10

**Plataformas utilizadas**
- Treinamento em Pipedrive
- Portal do Representante
- Kommo

Acompanhamentos com profissionais: closer, channel acquisition, PSM, implementador e helpdesk.

## Dias 11 e 12

**Apresentação**
Demonstração cobrindo: e-commerce para restaurantes, os três pilares, jornada do representante, técnicas SPIN, métricas, planos, módulos e definição de onboarding bem-sucedido.

## Dia 13

**Treinamento de atendimento**
Treinamento supervisionado com a liderança direta.

## Dia 30

**Apresentação do livro**
Apresentar os aprendizados de "Ecossistema de Parceiros".`,
  },
  {
    id: "produto",
    title: "Produto",
    summary: "Funcionalidades, pilares, planos e integrações da plataforma",
    body: `Todos os aspectos mais importantes do produto: funcionalidades, planos e integrações disponíveis.

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
  },
  {
    id: "ipp",
    title: "IPP — Perfil Ideal de Parceiro",
    summary: "Perfil ideal de parceiro (representante) para o programa",
    body: `Esta aba documenta o perfil ideal de parceiro (representante).

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
  },
  {
    id: "matriz-objecoes",
    title: "Matriz de Objeções",
    summary: "Principais objeções na aquisição de parceiros e como contorná-las",
    body: `Esta aba reúne as principais objeções que surgem no processo de aquisição de parceiros e como contorná-las de forma estratégica, alinhada ao posicionamento do programa de representantes.

| Tipo de objeção | Explicação | Como resolver |
|---|---|---|
| Entendimento do programa | O potencial parceiro não entendeu o que é o programa ou confunde com revenda de sistema | Explicar de forma simples que não é revenda e sim representação de uma empresa de tecnologia |
| Prioridade | O parceiro diz que não é o foco dele agora ou que está cheio de demandas | Mostrar relevância da parceria e alto potencial de retorno |
| Perfil | O parceiro acredita que o público dele não combina com o produto | Explorar juntos o ICP e dar exemplos de parceiros parecidos que já indicaram |
| Esforço operacional | Acha que vai dar trabalho indicar, vender, acompanhar ou dar suporte | Informar que ele vai ganhar uma comissão gradativa de acordo com cada responsabilidade que assumir |
| Retorno financeiro | O parceiro sente que o ganho é baixo por não ser revenda ou que o esforço não compensa | Reforçar a progressão da comissão, previsibilidade por volume e rapidez de recebimento |
| Confiança | Insegurança sobre reputação, entrega ou suporte | Mostrar cases, volume de parceiros ativos e materiais de apoio |
| Concorrência | Já indica outro sistema ou tem parceria parecida | Mostrar diferenciais do programa e possibilidade de coexistência, sem exclusividade |
| Compromisso | Medo de assumir obrigações, metas, exclusividade ou mudanças no próprio processo | Deixar claro que não há metas obrigatórias nem exclusividade forçada — a parceria é flexível e no ritmo do parceiro |
| Exclusividade | Pergunta se precisa ser exclusivo | Deixar claro que não exige exclusividade |
| Deal breaker | Situação em que realmente não faz sentido a parceria | Desqualificar e deixar a porta aberta para o futuro, quando fizer sentido |
| Dispensa | O lead manda você embora de forma gentil | Pedir um tempo para já alinhar a questão, evitando ter que retornar em outro horário |

## Como registrar uma nova objeção

Ao identificar uma objeção nova em campo, documente:
- **Descritivo:** o que o lead falou
- **Momento:** em que etapa do processo de vendas ela apareceu
- **Tipo:** em qual categoria da tabela acima ela se encaixa
- **Discurso de solução:** o que poderia ser falado para transpor a objeção`,
  },
  {
    id: "jornada-representante",
    title: "Jornada do Representante",
    summary: "Etapas da jornada do representante na Cardápio Web",
    body: `A Jornada do Representante na Cardápio Web é composta pelas etapas descritas nessa documentação.

**Em construção pela liderança** — as colunas abaixo (Lead antes → Lead depois → Estágio correspondente nas vendas) ainda não têm as etapas preenchidas na planilha de origem. Use as definições de funil (Prospecção, Acompanhamento e Clientes de Representantes) enquanto essa etapa não é formalizada.

| Etapa da jornada | Lead antes | Lead depois | Estágio correspondente nas vendas |
|---|---|---|---|
| A definir | — | — | — |`,
  },
  {
    id: "mensagem-confirmacao",
    title: "Mensagem de Confirmação de Apresentação",
    summary: "Templates de WhatsApp para confirmar presença na apresentação",
    body: `A mensagem de confirmação de apresentação é uma etapa essencial no processo: reforça o compromisso assumido pelo lead e garante que ambos os lados estejam alinhados quanto ao dia, horário e formato do encontro. Além de demonstrar profissionalismo, ela reduz o risco de no-show, aumenta a taxa de comparecimento e transmite seriedade e organização por parte da empresa.

## 1ª mensagem — dia anterior à apresentação

📅 Confirmação da sua reunião

Olá, [NOME_DO_LEAD]! Tudo certo?
Passando para lembrar que amanhã você tem uma reunião com o nosso especialista [NOME_DO_CLOSER] às [DIA e HORA_DA_APRESENTAÇÃO] (horário de Brasília).

⚡️ O que você pode esperar:
- ⏱️ Duração média de 45 minutos
- 👨‍💻 O especialista ficará disponível até 15 minutos após o horário
- 🎯 Será o momento ideal para entender os benefícios da parceria com a Cardápio Web

Posso confirmar sua presença? ✅

Estou à disposição para qualquer dúvida, combinado?

## 2ª mensagem — dia da apresentação

🌟 Bom dia, [NOME_DO_LEAD]! Tudo certo?

O [NOME_DO_CLOSER] já está preparado para a nossa reunião hoje às [HORA_DA_APRESENTAÇÃO] (horário de Brasília).
Vai ser um momento rápido (45 min) e focado em como podemos ajudar no seu negócio.

Consegue me dar um ok só para confirmar a presença?

Estamos te aguardando! 🚀`,
  },
  {
    id: "passagem-bastao",
    title: "Passagem de Bastão",
    summary: "Checklist de informações para conectar os setores na marcação",
    body: `O momento de passagem de bastão é muito importante e crucial para a empresa. É quando o time ganha mais conexão com as informações passadas entre os setores no momento da marcação da apresentação.

## Checklist de perguntas para registrar antes da passagem

- Como o lead conheceu a Cardápio Web?
- **Situação:** qual o contexto atual do lead?
- **Problema:** qual dor foi identificada?
- **Implicação:** qual o impacto dessa dor no negócio do lead?
- **Necessidade:** o que o lead reconheceu que precisa?
- Os valores estão dentro do orçamento do lead?
- A pessoa com quem você falou é a tomadora de decisão?
- Qual a prioridade do lead em relação a essa solução?`,
  },
  {
    id: "spin-selling",
    title: "SPIN Selling",
    summary: "Metodologia de vendas por perguntas — roteiros por funcionalidade",
    body: `O SPIN Selling é uma metodologia de vendas criada por Neil Rackham nos anos 1980, que usa boas perguntas para estruturar uma venda com base em quatro pilares: Situação, Problema, Implicação e Necessidade.

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
  },
  {
    id: "aida",
    title: "AIDA",
    summary: "Modelo de hierarquia de efeitos aplicado à cold call",
    body: `O modelo AIDA é um modelo dentro da classe conhecida como modelos de hierarquia de efeitos, todos os quais implicam que os consumidores passam por uma série de etapas quando tomam decisões de compra.

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
  },
  {
    id: "planos-precos",
    title: "Planos e Preços",
    summary: "Valores oficiais dos planos e módulos, por fidelidade",
    body: `Valores dos planos e módulos para a contratação da Cardápio Web, bem como os descontos disponíveis para negociações nas vendas.

| Fidelidade | Plano Mesas — Valor total | Plano Mesas — Valor mensal | Plano Delivery — Valor total | Plano Delivery — Valor mensal | Plano Premium — Valor total | Plano Premium — Valor mensal | Módulo Marketplace — Valor total | Módulo Marketplace — Valor mensal | Módulo Estoque Avançado — Valor total | Módulo Estoque Avançado — Valor mensal | Módulo Cupom Fiscal — Valor total | Módulo Cupom Fiscal — Valor mensal | Módulo Entregadores — Valor total | Módulo Entregadores — Valor mensal | Entregadores — até 500 pedidos (por pedido) | Entregadores — 501 a 1500 pedidos (por pedido) | Entregadores — acima de 1500 pedidos (por pedido) | Módulo Financeiro — Valor total | Módulo Financeiro — Valor mensal | Módulo Totem — Valor total | Módulo Totem — Valor mensal |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Anual | R$ 1.679,88 | R$ 139,99 | R$ 2.159,88 | R$ 179,99 | R$ 2.879,88 | R$ 239,99 | R$ 359,88 | R$ 29,99 | R$ 359,88 | R$ 29,99 | R$ 839,88 | R$ 69,99 | R$ 659,88 | R$ 54,99 | 0% | 8% | 6% | R$ 839,88 | R$ 69,99 | R$ 1.199,88 | R$ 99,99 |
| Semestral | R$ 899,94 | R$ 149,99 | R$ 1.139,94 | R$ 189,99 | R$ 1.499,94 | R$ 249,99 | R$ 179,94 | R$ 29,99 | R$ 179,94 | R$ 29,99 | R$ 419,94 | R$ 69,99 | R$ 329,94 | R$ 54,99 | 0% | 8% | 6% | R$ 419,94 | R$ 69,99 | R$ 599,94 | R$ 99,99 |
| Trimestral | R$ 479,97 | R$ 159,99 | R$ 599,97 | R$ 199,99 | R$ 779,97 | R$ 259,99 | R$ 89,97 | R$ 29,99 | R$ 89,97 | R$ 29,99 | R$ 209,97 | R$ 69,99 | R$ 164,97 | R$ 54,99 | 0% | 8% | 6% | R$ 209,97 | R$ 69,99 | R$ 299,97 | R$ 99,99 |
| Mensal | R$ 169,99 | R$ 169,99 | R$ 209,99 | R$ 209,99 | R$ 269,99 | R$ 269,99 | R$ 29,99 | R$ 29,99 | R$ 29,99 | R$ 29,99 | R$ 69,99 | R$ 69,99 | R$ 54,99 | R$ 54,99 | 0% | 8% | 6% | R$ 69,99 | R$ 69,99 | R$ 99,99 | R$ 99,99 |

**Nota:** o módulo Entregadores combina uma mensalidade fixa com uma taxa por pedido, escalonada por volume (0% até 500 pedidos, 8% de 501 a 1500, 6% acima de 1500).`,
  },
  {
    id: "concorrentes",
    title: "Matriz de Concorrentes",
    summary: "Comparativo de funcionalidades e preços com 27 concorrentes",
    body: `Encontre a relação entre as funcionalidades do Cardápio Web e dos concorrentes. ✅ = tem · ⚠️ = parcial/limitado · ❌ = não tem.

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
- **Deli** (https://deli.com.br/pt-br/) — Inicial R$83,90/mês; Avançado R$125,90/mês; Pro R$178,90/mês, com módulos à parte. Relativamente completo e promissor; custo sobe ao somar módulos que já entregamos no plano (como o chatbot).`,
  },
  {
    id: "funcoes",
    title: "Funções",
    summary: "Definições dos profissionais envolvidos no processo",
    body: `Nessa área você encontra as definições de cada profissional envolvido no processo comercial de representantes.

| Função | Descrição |
|---|---|
| Partner Development Representative (PDR) | Descrição pendente de definição pela liderança. |
| Partner Account Executive (PAE) | Descrição pendente de definição pela liderança. |
| Supervisor de parcerias | Profissional responsável por garantir que o time siga as rotinas definidas estrategicamente pelo gerente de parcerias. |
| Coordenador de parcerias | Liderança responsável por acompanhar o trabalho dos supervisores, definindo estratégias e ajudando no desenvolvimento de lideranças e colaboradores. |
| Gerente de parcerias | Liderança responsável por acompanhar o trabalho dos coordenadores e supervisores de parcerias, com o intuito de definir estratégias e desenvolver as lideranças do time. |`,
  },
  {
    id: "funil-prospeccao",
    title: "Funil de Prospecção",
    summary: "Etapas do funil de prospecção de novos representantes",
    body: `Este documento padroniza e esclarece o significado de cada etapa do funil de representantes, garantindo que todo o time tenha o mesmo entendimento sobre o status dos leads ao longo da jornada.

## Etapas do funil

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

## Dados para cadastro de um representante

- Nome completo
- Telefone
- E-mail
- CNPJ
- Chave PIX
- Endereço
- CEP

## Próximo passo

Com os dados do representante, crie a conta dele nos seguintes sites:
- portal.cardapioweb.com/login
- https://parceiro.cardapioweb.com/users/sign_in
- https://portal.sandbox.cardapioweb.com/login`,
  },
  {
    id: "funil-acompanhamento",
    title: "Funil de Acompanhamento",
    summary: "Etapas do funil de acompanhamento de representantes ativos",
    body: `Este documento padroniza e esclarece o significado de cada etapa do funil de acompanhamento de representantes, garantindo que todo o time tenha o mesmo entendimento sobre o status ao longo da jornada.

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
| 2º Cliente | Representante realizou sua segunda venda. |`,
  },
  {
    id: "funil-clientes",
    title: "Funil de Clientes de Representantes",
    summary: "Etapas do funil de clientes trazidos por representantes",
    body: `Este documento padroniza e esclarece o significado de cada etapa do funil de clientes de representantes, garantindo que todo o time tenha o mesmo entendimento sobre o status dos clientes ao longo da jornada.

| Etapa | Critério |
|---|---|
| Dados recebidos | Representante enviou os dados do cliente (apenas clientes que seguem para implementação). |
| Proposta enviada | Card do cliente criado, com informações, plano e módulo preenchidos, categoria "Produto" adicionada no Pipedrive e modelo de proposta enviado. |
| Negócio fechado | Cliente com link de pagamento, aguardando ser dado como ganho para implementação. |

## Modelo de dados do cliente

📋 CADASTRO
- 🏪 Nome da loja
- 👤 Nome do titular
- 📄 CPF
- 📍 Endereço
- 🗺️ CEP
- 📱 WhatsApp (para implementação)
- 📧 E-mail
- ⭐ Plano escolhido`,
  },
  {
    id: "motivos-perda",
    title: "Motivos de Perda",
    summary: "Razões de perda de leads, para recuperação de oportunidades",
    body: `Os motivos de perda são as razões pelas quais os leads foram perdidos. São muito importantes para a recuperação de oportunidades e ajustes de estratégia com foco em aumentar as vendas.

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
  },
  {
    id: "estrutura-representantes",
    title: "Estrutura de Representantes",
    summary: "Perfil, funcionamento, modelo financeiro e objeções do programa",
    body: `Esta aba documenta a nova estrutura do programa de representantes da Cardápio Web: perfil ideal (IPP), benefícios, modelo de funcionamento e principais objeções com respostas.

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
  },
  {
    id: "progressao-carreira",
    title: "Progressão de Carreira",
    summary: "Evolução salarial e de comissão por nível de senioridade",
    body: `A progressão de carreira por nível trata da evolução do agente de parcerias dentro do seu mesmo nível de senioridade, seja como Channel Hunter ou Channel Account Manager. O principal critério é a performance em relação às metas estipuladas para o canal, com benefício de aumento da taxa de comissionamento e maior protagonismo na gestão e desenvolvimento das parcerias.

| Nível | Faixa | Base salarial | Comissão Meta 1 | Comissão Meta 2 | Comissão Meta 3 | Critérios de elegibilidade / desclassificação |
|---|---|---|---|---|---|---|
| JR 1 | Faixa 1 – Base | R$ 1.809,51 | 20% (OTE R$ 2.171,41) | 25% (OTE R$ 2.261,89) | 30% (OTE R$ 2.352,36) | Ramp-up concluído em caso de novato; Meta 3 nos últimos 2 meses |
| JR 1 | Faixa 2 – Estrela |  | 30% (OTE R$ 2.352,36) | 35% (OTE R$ 2.442,84) | 40% (OTE R$ 2.533,31) | Meta 3 (1 mês, no mês vigente) / se não bater Meta 3 na faixa 2, desce para o nível anterior |
| JR 2 | Faixa 1 – Base | R$ 1.988,48 | 20% (OTE R$ 2.386,18) | 25% (OTE R$ 2.485,60) | 30% (OTE R$ 2.585,02) | Ramp-up concluído em caso de novato; Meta 3 nos últimos 2 meses |
| JR 2 | Faixa 2 – Estrela |  | 30% (OTE R$ 2.585,02) | 35% (OTE R$ 2.684,45) | 40% (OTE R$ 2.783,87) | Meta 3 (1 mês, no mês vigente) / se não bater Meta 3 na faixa 2, desce para o nível anterior |
| JR 3 | Faixa 1 – Base | R$ 2.185,14 | 20% (OTE R$ 2.622,17) | 25% (OTE R$ 2.731,43) | 30% (OTE R$ 2.840,68) | Ramp-up concluído em caso de novato; Meta 3 nos últimos 2 meses |
| JR 3 | Faixa 2 – Estrela |  | 30% (OTE R$ 2.840,68) | 35% (OTE R$ 2.949,94) | 40% (OTE R$ 3.059,20) | Meta 3 (1 mês, no mês vigente) / se não bater Meta 3 na faixa 2, desce para o nível anterior |
| PL 1 | Faixa 1 – Base | R$ 2.401,25 | 25% (OTE R$ 3.001,56) | 30% (OTE R$ 3.121,62) | 45% (OTE R$ 3.481,81) | Ramp-up concluído em caso de novato; Meta 3 nos últimos 2 meses |
| PL 1 | Faixa 2 – Estrela |  | 30% (OTE R$ 3.121,62) | 35% (OTE R$ 3.241,69) | 50% (OTE R$ 3.601,88) | Meta 3 (1 mês, no mês vigente) / se não bater Meta 3 na faixa 2, desce para o nível anterior |
| PL 2 | Faixa 1 – Base | R$ 2.617,36 | 25% (OTE R$ 3.271,70) | 30% (OTE R$ 3.402,57) | 45% (OTE R$ 3.795,17) | Ramp-up concluído em caso de novato; Meta 3 nos últimos 2 meses |
| PL 2 | Faixa 2 – Estrela |  | 30% (OTE R$ 3.402,57) | 35% (OTE R$ 3.533,44) | 50% (OTE R$ 3.926,04) | Meta 3 (1 mês, no mês vigente) / se não bater Meta 3 na faixa 2, desce para o nível anterior |
| PL 3 | Faixa 1 – Base | R$ 2.852,93 | 25% (OTE R$ 3.566,16) | 30% (OTE R$ 3.708,81) | 45% (OTE R$ 4.136,75) | Ramp-up concluído em caso de novato; Meta 3 nos últimos 2 meses |
| PL 3 | Faixa 2 – Estrela |  | 30% (OTE R$ 3.708,81) | 35% (OTE R$ 3.851,46) | 50% (OTE R$ 4.279,40) | Meta 3 (1 mês, no mês vigente) / se não bater Meta 3 na faixa 2, desce para o nível anterior |
| SR 1 | Faixa 1 – Base | R$ 3.109,69 | 25% (OTE R$ 3.887,11) | 30% (OTE R$ 4.042,60) | 45% (OTE R$ 4.509,05) | Ramp-up concluído em caso de novato; Meta 3 nos últimos 2 meses |
| SR 1 | Faixa 2 – Estrela |  | 30% (OTE R$ 4.042,60) | 35% (OTE R$ 4.198,08) | 50% (OTE R$ 4.664,53) | Meta 3 (1 mês, no mês vigente) / se não bater Meta 3 na faixa 2, desce para o nível anterior |
| SR 2 | Faixa 1 – Base | R$ 3.389,56 | 25% (OTE R$ 4.236,95) | 30% (OTE R$ 4.406,43) | 45% (OTE R$ 4.914,86) | Ramp-up concluído em caso de novato; Meta 3 nos últimos 2 meses |
| SR 2 | Faixa 2 – Estrela |  | 30% (OTE R$ 4.406,43) | 35% (OTE R$ 4.575,91) | 50% (OTE R$ 5.084,34) | Meta 3 (1 mês, no mês vigente) / se não bater Meta 3 na faixa 2, desce para o nível anterior |
| SR 3 | Faixa 1 – Base | R$ 3.694,62 | 25% (OTE R$ 4.618,27) | 30% (OTE R$ 4.803,01) | 45% (OTE R$ 5.357,20) | Ramp-up concluído em caso de novato; Meta 3 nos últimos 2 meses |
| SR 3 | Faixa 2 – Estrela |  | 30% (OTE R$ 4.803,01) | 35% (OTE R$ 4.987,74) | 50% (OTE R$ 5.541,93) | Meta 3 (1 mês, no mês vigente) / se não bater Meta 3 na faixa 2, desce para o nível anterior |

**Nota:** as colunas originais "Meta de Clientes" e "Custo por Cliente (OTE)" estavam quebradas (#REF!) na planilha de origem para a maioria dos níveis e foram omitidas até serem corrigidas pela liderança.`,
  },
  {
    id: "cadencia-prospeccao",
    title: "Cadência: Prospecção de Novos Representantes",
    summary: "Fluxo de ligações, e-mails e mensagens para leads inbound",
    body: `Cadência responsável pelo time de representantes oriundos do inbound. O fluxo de ligações, mensagens e e-mails é registrado aqui para maior controle.

## 1º Dia — Ligação de diagnóstico

**Mensagem de abertura**
Olá, [nome_do_lead]! Tudo certo? Aqui é o [nome_do_especialista], especialista de representantes da Cardápio Web.

Vi que você preencheu o formulário e demonstrou interesse em conhecer melhor a oportunidade. Estou entrando em contato para entender melhor seu perfil e te explicar como funciona o modelo de parceria!

Me conta: você hoje já atua com vendas, atendimento ao setor de restaurantes ou possui alguma carteira de clientes?

**E-mail de abertura**
Olá, [nome_do_lead]! Tudo bem?

Sou [nome_do_especialista], da Cardápio Web, e vi que você demonstrou interesse em conhecer nosso Programa de Representantes. Queria aproveitar o contato para te apresentar essa oportunidade de perto.

Sabemos que muitas pessoas buscam uma forma de gerar renda, ampliar seu portfólio de soluções ou até construir um negócio próprio — e é exatamente isso que nosso programa oferece.
A Cardápio Web é uma plataforma completa de cardápio digital, gestão do negócio e food marketing para restaurantes e deliveries. São mais de 17.000 negócios ativos no Brasil e nossos representantes ganham comissões recorrentes por cada cliente que indicam.

Que tal agendarmos uma conversa rápida para eu te explicar como funciona? Me responde aqui.

[nome_do_especialista]
Cardápio Web

## 2º Dia — Ligação de diagnóstico

**Follow Up 1**
Olá, [nome_do_lead]! Tudo certo? Aqui é o [nome_do_especialista], especialista de representantes da Cardápio Web.

Como comentei, estamos lançando oficialmente o Programa de Representantes da Cardápio Web, com uma comissão bastante atrativa e modelo de receita recorrente.

Antes de avançarmos, queria te apresentar o formato e entender seu momento.
Qual melhor horário para conversarmos?

## 4º Dia — Ligação de diagnóstico

**Follow Up 2**
Olá, [nome_do_lead]! Tudo certo?

O programa de representantes é simples: você vende, oferece serviços adicionais, constrói carteira e recebe comissão recorrente todos os meses.

Estamos abrindo poucas vagas agora porque queremos gente com perfil de execução.

Se fizer sentido pra você gerar uma renda previsível com tecnologia para restaurantes, me diz que eu te explico como você pode começar ainda essa semana.

**E-mail de follow up**
Olá, [nome_do_lead]! Tudo bem?

Entrei em contato recentemente e queria compartilhar mais detalhes sobre o nosso Programa de Representantes, porque acredito que você vai se identificar com o que temos a oferecer.

Veja o que você tem acesso ao entrar para o programa:
- ✅ Onboarding estruturado
- ✅ Materiais e ativos comerciais
- ✅ Acompanhamento estratégico
- ✅ Modelo validado de vendas
- ✅ Comissão recorrente
- ✅ Mapa de oportunidades
- ✅ Mentorias semanais com especialistas

São mais de 17.000 negócios ativos na plataforma e esse mercado ainda tem muito espaço para crescer. Os representantes que entram agora estão saindo na frente.
Posso te mostrar como tudo isso funciona em uma conversa rápida de 20 minutos. Qual o melhor horário para você?

[nome_do_especialista]
Cardápio Web

## 6º Dia — Ligação de diagnóstico

**Follow Up 3**
Olá, [nome_do_lead]! Tudo certo?

Você sabia que nossos representantes recebem comissões recorrentes sobre a carteira de clientes que constroem?

A Cardápio Web possui um dos programas de representantes que mais cresce no Brasil, oferecendo suporte, treinamento e oportunidade de crescimento junto com a empresa.

Faz sentido para você conhecer melhor essa oportunidade?

## 8º Dia — Ligação de diagnóstico

**Follow Up 4**
Fala, [nome_do_lead]! Tudo certo?

Passando para te avisar que estamos encerrando as vagas do Programa de Representantes da Cardápio Web agora em [mês atual].

As próximas oportunidades só abrem na turma de [próximo_mês]. Essa é a chance de você já começar a gerar comissão recorrente, criando uma base de clientes que te paga todos os meses, além de ampliar seu portfólio com uma solução validada no mercado.

Se ainda faz sentido para você, me responde agora para garantirmos sua vaga antes do fechamento.

## 9º Dia — Break Up

**Ligação**
Fala, [nome_do_lead]! Passando para nossa última mensagem sobre o programa de representantes.

Como não tivemos retorno, vou encerrar seu acompanhamento por aqui para não ficar insistindo 😄

Mas deixo as portas abertas caso queira retomar futuramente. Acredito que sua região ainda tem bastante potencial para o projeto 🚀

Obrigado pelo tempo e sucesso por aí!

**E-mail de break up**
Olá, [nome_do_lead]!

Tentei entrar em contato algumas vezes nos últimos dias para te apresentar o Programa de Representantes da Cardápio Web, mas entendo que talvez não seja o momento certo para você.

Não tem problema! Agradecer pelo seu interesse e pelo tempo dispensado já é mais do que suficiente para nós. Fico feliz que você tenha conhecido um pouco mais sobre a Cardápio Web.

Quem sabe em uma outra oportunidade os caminhos se encontram, o programa continua aberto e o mercado de restaurantes só cresce.
Se em algum momento quiser retomar essa conversa ou tiver alguma dúvida, é só nos chamar pelo WhatsApp de Parcerias: wa.me/558599826536

Desejo muito sucesso na sua jornada. Conte com a Cardápio Web quando precisar!

[nome_do_especialista]
Cardápio Web`,
  },
  {
    id: "cadencia-pos-reuniao",
    title: "Cadência: Follow-up (Pós-reunião)",
    summary: "Fluxo de mensagens após a apresentação com o closer",
    body: `Cadência responsável pelo time de representantes. O fluxo de ligações e mensagens é registrado aqui para maior controle.

## 1º Dia — Ligação de diagnóstico

**Mensagem de abertura**
Oi, [nome_do_lead]!

Foi ótimo conversar com você hoje. Fiquei animado com as possibilidades que discutimos e acredito que pode fazer bastante sentido para o seu momento atual.

Fico no aguardo do seu retorno para entendermos os próximos passos. Qualquer dúvida que tenha surgido depois da nossa conversa, é só me chamar.

## 3º Dia — Ligação de diagnóstico

**Follow Up 1**
Olá, [nome_do_lead]!

Passando aqui porque não tive retorno sobre nossa conversa sobre o programa de representante. Sei que a rotina anda corrida, então queria saber se ainda faz sentido para você ou se ficou alguma dúvida que eu possa esclarecer.

Fico à disposição para conversarmos novamente, se precisar.

## 5º Dia — Ligação de diagnóstico

**Follow Up 2**
[nome_do_lead], essa é a minha última mensagem para encerrar a condição.

A comissão do programa é *recorrente*. Isso significa que você vende uma vez e continua recebendo todo mês enquanto o cliente ficar ativo. Te ajudamos em toda a jornada do cliente, você trabalha com quem já está na sua região.

Se não for o momento certo, tudo bem também, fica aqui o contato caso mude de ideia. 🤝`,
  },
  {
    id: "cadencia-onboarding",
    title: "Cadência: Follow-up (Onboarding)",
    summary: "Fluxo de mensagens para agendar o onboarding do novo representante",
    body: `Cadência responsável pelo time de representantes. O fluxo de ligações e mensagens é registrado aqui para maior controle.

## 1º Dia — Ligação de diagnóstico

**Mensagem de abertura**
Oi, [nome_do_rep]! Seja bem-vindo(a) ao time! 🎉

Fico muito feliz em ter você no nosso programa de representantes. A partir de agora, você passa a representar a Cardápio Web, sistema que já conta com mais de 17.000 clientes ativos em todo o Brasil.

O próximo passo é simples: fazer seu *onboarding*. É nele que você recebe todo o material, aprende o processo de vendas e já sai pronto(a) para começar a fechar contratos.

Quanto antes a gente agenda, mais rápido você começa a gerar comissão. 📅

Qual o melhor dia pra você essa semana?

## 3º Dia — Ligação de diagnóstico

**Follow Up 1**
Bom dia, [nome_do_rep]!

Passando para saber se ficou alguma dúvida sobre o programa ou os próximos passos. 😊

O onboarding é o momento em que você vai aprender a usar a plataforma na prática, entender como mapear e abordar prospects na sua região, e conhecer as estratégias que os representantes de melhor performance usam no dia a dia.
Se fizer sentido para você, me avisa que já te passo os horários disponíveis para agendarmos.

Fico à disposição para qualquer pergunta antes disso também!`,
  },
  {
    id: "cadencia-1cliente",
    title: "Cadência: Follow-up (1º Cliente)",
    summary: "Fluxo de mensagens para apoiar o representante até o 1º cliente",
    body: `Cadência responsável pelo time de representantes. O fluxo de ligações e mensagens é registrado aqui para maior controle.

## 1º Dia — Ligação de diagnóstico

**Mensagem de abertura**
Oi, [nome_do_rep]! Onboarding feito, agora começa a parte boa. 🚀

Você já tem acesso ao sistema de representante. O próximo passo é simples: abre agora o portal do representante, filtra os leads da *sua região* e veja quantos estabelecimentos estão disponíveis pra você abordar.

Isso leva menos de 5 minutos e já te dá uma visão clara do seu potencial de ganho aqui.

Me fala: quantos leads apareceram na sua região? 👇

## 3º Dia — Follow Up 1

Bom dia, [nome_do_rep]! 👋

Dica de quem já viu muitos representantes fecharem o primeiro cliente rápido:

*Não tente falar com todo mundo ao mesmo tempo.* Escolhe de 5 a 10 leads no sistema, de preferência restaurantes, lanchonetes ou bares que você já conhece ou que ficam perto de você, e foca neles primeiro.

Familiaridade gera confiança, e confiança fecha venda.

Você já abriu o sistema e deu uma olhada nos leads da sua região? Me conta como tá o cenário por aí.

## 5º Dia — Ligação de diagnóstico

**Follow Up 2**
Oi, [nome_do_rep]! Hoje vou te passar algo que acelera muito o primeiro contato. 🎯

Quando for abordar um lead, começa assim:

*Oi, [nome do dono]! Trabalho com uma solução de cardápio digital que já é usada por mais de 17 mil estabelecimentos no Brasil. Muita gente aqui da região já usa. Posso te mostrar como funciona em 10 minutos?*

Simples, direto e com prova social logo de cara. Não precisa explicar tudo no primeiro contato, o objetivo é só garantir uma conversa.

Você já abordou algum lead? Me conta como foi! 💬`,
  },
  {
    id: "cadencia-2cliente",
    title: "Cadência: Follow-up (2º Cliente)",
    summary: "Fluxo de mensagens para apoiar o representante até o 2º cliente",
    body: `Cadência responsável pelo time de representantes. O fluxo de ligações e mensagens é registrado aqui para maior controle.

## 1º Dia — Ligação de diagnóstico

**Mensagem de abertura**
Parabéns, [nome_do_rep]! 🎉 Primeira venda feita!

Sério, isso é maior do que parece. A maioria das pessoas trava antes de fechar o primeiro cliente, e você já passou dessa barreira.
Como foi todo esse processo pra você? Teve algum momento mais desafiador ou algo que fluiu melhor do que esperava? Fico curioso(a) para saber como foi essa experiência na prática.

Qualquer coisa que precisar, é só chamar!

## 3º Dia — Follow Up 1

Oi, [nome_do_rep]! Quero falar de uma coisa que derruba muita gente boa no meio do caminho: o *não*. 🚧

Depois do primeiro cliente, a tendência é achar que todo lead vai virar venda. Aí vem uma semana de recusas e o desânimo bate.

Então deixa eu te dar um novo ângulo:

*Cada não que você recebe te aproxima do próximo sim.*

Não é clichê, é matemática de vendas. Se a sua taxa de conversão é de 1 em 5, então cada *não* é 20% de um cliente fechado.

Quando ouvir um *não* hoje, anota aqui pra mim. Vamos acompanhar juntos quantos *nãos* te custou o segundo cliente. 📊

## 5º Dia — Ligação de diagnóstico

**Follow Up 2**
[nome_do_rep], passando para te falar o que importa de verdade. 🤝

Você saiu do zero, fez o onboarding, fechou o primeiro cliente e está construindo uma carteira recorrente. Isso não é pouca coisa.

O segundo cliente pode vir hoje, amanhã ou na semana que vem, mas vai vir. Desde que você não pare.

Foco, sistema e consistência.

Estou aqui pra qualquer dúvida, objeção travada ou lead que você queira trabalhar junto. Pode chamar quando quiser. 💪`,
  },
];

export function Playbook() {
  const [topics, setTopics] = useLocalStorageState<PlaybookTopic[]>(
    "bibly-playbook-topics",
    PLAYBOOK_TOPICS_PADRAO,
  );
  const [activeId, setActiveId] = useState<string>(PLAYBOOK_TOPICS_PADRAO[0].id);
  const [query, setQuery] = useState("");

  const active = topics.find((t) => t.id === activeId) ?? topics[0];

  const filtered = useMemo(() => {
    if (!query.trim()) return topics;
    const q = query.toLowerCase();
    return topics.filter(
      (t) => t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q),
    );
  }, [topics, query]);

  const updateBody = (id: string, body: string) => {
    setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, body } : t)));
  };

  return (
    <div className="flex h-screen min-w-0">
      <nav className="hidden w-[280px] shrink-0 flex-col overflow-y-auto border-r border-border bg-card/40 py-6 lg:flex">
        <div className="px-6 pb-4">
          <h1 className="text-lg font-semibold text-foreground">Playbook</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Material central de consulta do time de representantes.
          </p>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar tópico..."
              className="w-full rounded-xl border border-border bg-background py-1.5 pl-8 pr-3 text-xs outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex-1 space-y-0.5 px-3">
          {filtered.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveId(t.id)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                t.id === active?.id
                  ? "bg-secondary font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span className="truncate">{t.title}</span>
              {t.id === active?.id && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-xs text-muted-foreground">Nenhum tópico encontrado.</p>
          )}
        </div>
      </nav>

      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8 sm:px-8">
          <div className="mb-4 lg:hidden">
            <select
              value={active?.id}
              onChange={(e) => setActiveId(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          {active && (
            <>
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium text-primary">
                    <BookOpen className="h-3.5 w-3.5" /> Playbook de Representantes
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    {active.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{active.summary}</p>
                </div>
                <MarkdownEditorDialog
                  title={active.title}
                  description="Edite o conteúdo em markdown simples (##, ###, ####, listas com -, tabelas com |, **negrito**)."
                  value={active.body}
                  onSave={(body) => updateBody(active.id, body)}
                />
              </div>
              <div
                className="rounded-[20px] border border-border bg-card p-6"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <RichText text={active.body} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
