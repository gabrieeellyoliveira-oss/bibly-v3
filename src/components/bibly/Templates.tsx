import { useState } from "react";
import { Check, Copy, MessageSquareText } from "lucide-react";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Templates — mensagens prontas para copiar e colar no WhatsApp/Kommo,
// extraídas das cadências e da mensagem de confirmação do playbook de
// representantes.
// ---------------------------------------------------------------------------

type Template = {
  id: string;
  title: string;
  category: string;
  message: string;
};

const CATEGORIES = ["Confirmação", "Prospecção", "Pós-reunião", "Onboarding", "1º Cliente", "2º Cliente"];

const TEMPLATES: Template[] = [
  // Confirmação de apresentação
  {
    id: "confirmacao-1",
    title: "Confirmação — dia anterior",
    category: "Confirmação",
    message: `📅 Confirmação da sua reunião

Olá, [NOME_DO_LEAD]! Tudo certo?
Passando para lembrar que amanhã você tem uma reunião com o nosso especialista [NOME_DO_CLOSER] às [DIA e HORA_DA_APRESENTAÇÃO] (horário de Brasília).

⚡️ O que você pode esperar:
• ⏱️ Duração média de 45 minutos
• 👨‍💻 O especialista ficará disponível até 15 minutos após o horário
• 🎯 Será o momento ideal para entender os benefícios da parceria com a Cardápio Web

Posso confirmar sua presença? ✅

Estou à disposição para qualquer dúvida, combinado?`,
  },
  {
    id: "confirmacao-2",
    title: "Confirmação — dia da apresentação",
    category: "Confirmação",
    message: `🌟 Bom dia, [NOME_DO_LEAD]! Tudo certo?

O [NOME_DO_CLOSER] já está preparado para a nossa reunião hoje às [HORA_DA_APRESENTAÇÃO] (horário de Brasília).
Vai ser um momento rápido (45 min) e focado em como podemos ajudar no seu negócio.

Consegue me dar um ok só para confirmar a presença?

Estamos te aguardando! 🚀`,
  },
  // Cadência de Prospecção de Novos Representantes (Inbound)
  {
    id: "prospeccao-abertura",
    title: "Abertura (1º Dia)",
    category: "Prospecção",
    message: `Olá, [nome_do_lead]! Tudo certo? Aqui é o [nome_do_especialista], especialista de representantes da Cardápio Web.

Vi que você preencheu o formulário e demonstrou interesse em conhecer melhor a oportunidade. Estou entrando em contato para entender melhor seu perfil e te explicar como funciona o modelo de parceria!

Me conta: você hoje já atua com vendas, atendimento ao setor de restaurantes ou possui alguma carteira de clientes?`,
  },
  {
    id: "prospeccao-email-abertura",
    title: "E-mail de abertura (1º Dia)",
    category: "Prospecção",
    message: `Olá, [nome_do_lead]! Tudo bem?

Sou [nome_do_especialista], da Cardápio Web, e vi que você demonstrou interesse em conhecer nosso Programa de Representantes. Queria aproveitar o contato para te apresentar essa oportunidade de perto.

Sabemos que muitas pessoas buscam uma forma de gerar renda, ampliar seu portfólio de soluções ou até construir um negócio próprio — e é exatamente isso que nosso programa oferece.
A Cardápio Web é uma plataforma completa de cardápio digital, gestão do negócio e food marketing para restaurantes e deliveries. São mais de 17.000 negócios ativos no Brasil e nossos representantes ganham comissões recorrentes por cada cliente que indicam.

Que tal agendarmos uma conversa rápida para eu te explicar como funciona? Me responde aqui.

[nome_do_especialista]
Cardápio Web`,
  },
  {
    id: "prospeccao-followup-1",
    title: "Follow Up 1 (2º Dia)",
    category: "Prospecção",
    message: `Olá, [nome_do_lead]! Tudo certo? Aqui é o [nome_do_especialista], especialista de representantes da Cardápio Web.

Como comentei, estamos lançando oficialmente o Programa de Representantes da Cardápio Web, com uma comissão bastante atrativa e modelo de receita recorrente.

Antes de avançarmos, queria te apresentar o formato e entender seu momento.
Qual melhor horário para conversarmos?`,
  },
  {
    id: "prospeccao-followup-2",
    title: "Follow Up 2 (4º Dia)",
    category: "Prospecção",
    message: `Olá, [nome_do_lead]! Tudo certo?

O programa de representantes é simples: você vende, oferece serviços adicionais, constrói carteira e recebe comissão recorrente todos os meses.

Estamos abrindo poucas vagas agora porque queremos gente com perfil de execução.

Se fizer sentido pra você gerar uma renda previsível com tecnologia para restaurantes, me diz que eu te explico como você pode começar ainda essa semana.`,
  },
  {
    id: "prospeccao-email-followup",
    title: "E-mail de follow up (4º Dia)",
    category: "Prospecção",
    message: `Olá, [nome_do_lead]! Tudo bem?

Entrei em contato recentemente e queria compartilhar mais detalhes sobre o nosso Programa de Representantes, porque acredito que você vai se identificar com o que temos a oferecer.

Veja o que você tem acesso ao entrar para o programa:
✅ Onboarding estruturado;
✅ Materiais e ativos comerciais;
✅ Acompanhamento estratégico;
✅ Modelo validado de vendas;
✅ Comissão recorrente;
✅ Mapa de oportunidades;
✅ Mentorias semanais com especialistas.

São mais de 17.000 negócios ativos na plataforma e esse mercado ainda tem muito espaço para crescer. Os representantes que entram agora estão saindo na frente.
Posso te mostrar como tudo isso funciona em uma conversa rápida de 20 minutos. Qual o melhor horário para você?

[nome_do_especialista]
Cardápio Web`,
  },
  {
    id: "prospeccao-followup-3",
    title: "Follow Up 3 (6º Dia)",
    category: "Prospecção",
    message: `Olá, [nome_do_lead]! Tudo certo?

Você sabia que nossos representantes recebem comissões recorrentes sobre a carteira de clientes que constroem?

A Cardápio Web possui um dos programas de representantes que mais cresce no Brasil, oferecendo suporte, treinamento e oportunidade de crescimento junto com a empresa.

Faz sentido para você conhecer melhor essa oportunidade?`,
  },
  {
    id: "prospeccao-followup-4",
    title: "Follow Up 4 (8º Dia)",
    category: "Prospecção",
    message: `Fala, [nome_do_lead]! Tudo certo?

Passando para te avisar, que estamos encerrando as vagas do Programa de Representantes da Cardápio Web agora em [mês atual].

As próximas oportunidades só abrem na turma de [próximo_mês]. Essa é a chance de você já começar a gerar comissão recorrente, criando uma base de clientes que te paga todos os meses, além de ampliar seu portfólio com uma solução validada no mercado.

Se ainda faz sentido para você, me responde agora para garantirmos sua vaga antes do fechamento.`,
  },
  {
    id: "prospeccao-breakup",
    title: "Break-up (9º Dia)",
    category: "Prospecção",
    message: `Fala, [nome_do_lead]! Passando para nossa última mensagem sobre o programa de representantes.

Como não tivemos retorno, vou encerrar seu acompanhamento por aqui para não ficar insistindo 😄

Mas deixo as portas abertas caso queira retomar futuramente. Acredito que sua região ainda tem bastante potencial para o projeto 🚀

Obrigado pelo tempo e sucesso por aí!`,
  },
  {
    id: "prospeccao-email-breakup",
    title: "E-mail de break-up (9º Dia)",
    category: "Prospecção",
    message: `Olá, [nome_do_lead]!

Tentei entrar em contato algumas vezes nos últimos dias para te apresentar o Programa de Representantes da Cardápio Web, mas entendo que talvez não seja o momento certo para você.

Não tem problema! Agradecer pelo seu interesse e pelo tempo dispensado já é mais do que suficiente para nós. Fico feliz que você tenha conhecido um pouco mais sobre a Cardápio Web.

Quem sabe em uma outra oportunidade os caminhos se encontram, o programa continua aberto e o mercado de restaurantes só cresce.
Se em algum momento quiser retomar essa conversa ou tiver alguma dúvida, é só nos chamar pelo WhatsApp de Parcerias: wa.me/558599826536

Desejo muito sucesso na sua jornada. Conte com a Cardápio Web quando precisar!

[nome_do_especialista]
Cardápio Web`,
  },
  // Cadência de Follow-up (Pós-reunião)
  {
    id: "posreuniao-abertura",
    title: "Abertura (1º Dia)",
    category: "Pós-reunião",
    message: `Oi, [nome_do_lead]!

Foi ótimo conversar com você hoje. Fiquei animado com as possibilidades que discutimos e acredito que pode fazer bastante sentido para o seu momento atual.

Fico no aguardo do seu retorno para entendermos os próximos passos. Qualquer dúvida que tenha surgido depois da nossa conversa, é só me chamar.`,
  },
  {
    id: "posreuniao-followup-1",
    title: "Follow Up 1 (3º Dia)",
    category: "Pós-reunião",
    message: `Olá, [nome_do_lead]!

Passando aqui porque não tive retorno sobre nossa conversa sobre o programa de representante. Sei que a rotina anda corrida, então queria saber se ainda faz sentido para você ou se ficou alguma dúvida que eu possa esclarecer.

Fico à disposição para conversarmos novamente, se precisar.`,
  },
  {
    id: "posreuniao-followup-2",
    title: "Follow Up 2 (5º Dia)",
    category: "Pós-reunião",
    message: `[nome_do_lead], essa é a minha útilma mensagem para encerrar a condição.

A comissão do programa é *recorrente*. Isso significa que você vende uma vez e continua recebendo todo mês enquanto o cliente ficar ativo. Te ajudamos em toda a jornada do cliente, você trabalha com quem já está na sua região.

Se não for o momento certo, tudo bem também, fica aqui o contato caso mude de ideia. 🤝`,
  },
  // Cadência de Follow-up (Onboarding)
  {
    id: "onboarding-abertura",
    title: "Abertura (1º Dia)",
    category: "Onboarding",
    message: `Oi, [nome_do_rep]! Seja bem-vindo(a) ao time!🎉

Fico muito feliz em ter você no nosso programa de representantes. A partir de agora, você passa a representar a Cardápio Web, sistema que já conta com mais de 17.000 clientes ativos em todo o Brasil.

O próximo passo é simples: fazer seu *onboarding*. É nele que você recebe todo o material, aprende o processo de vendas e já sai pronto(a) para começar a fechar contratos.

Quanto antes a gente agenda, mais rápido você começa a gerar comissão. 📅

Qual o melhor dia pra você essa semana?`,
  },
  {
    id: "onboarding-followup-1",
    title: "Follow Up 1 (3º Dia)",
    category: "Onboarding",
    message: `Bom dia, [nome_do_rep]!

Passando para saber se ficou alguma dúvida sobre o programa ou os próximos passos. 😊

O onboarding é o momento em que você vai aprender a usar a plataforma na prática, entender como mapear e abordar prospects na sua região, e conhecer as estratégias que os representantes de melhor performance usam no dia a dia.
Se fizer sentido para você, me avisa que já te passo os horários disponíveis para agendarmos.

Fico à disposição para qualquer pergunta antes disso também!`,
  },
  // Cadência de Follow-up (1º Cliente)
  {
    id: "1cliente-abertura",
    title: "Abertura (1º Dia)",
    category: "1º Cliente",
    message: `Oi, [nome_do_rep]! Onboarding feito, agora começa a parte boa. 🚀

Você já tem acesso ao sistema de representante. O próximo passo é simples: abre agora o portal do representante, filtra os leads da *sua região* e veja quantos estabelecimentos estão disponíveis pra você abordar.

Isso leva menos de 5 minutos e já te dá uma visão clara do seu potencial de ganho aqui.

Me fala: quantos leads apareceram na sua região? 👇`,
  },
  {
    id: "1cliente-followup-1",
    title: "Follow Up 1 (3º Dia)",
    category: "1º Cliente",
    message: `Bom dia, [nome_do_rep]! 👋

Dica de quem já viu muitos representantes fecharem o primeiro cliente rápido:

*Não tente falar com todo mundo ao mesmo tempo.* Escolhe de 5 a 10 leads no sistema, de preferência restaurantes, lanchonetes ou bares que você já conhece ou que ficam perto de você e foca neles primeiro.

Familiaridade gera confiança, e confiança fecha venda.

Você já abriu o sistema e deu uma olhada nos leads da sua região? Me conta como tá o cenário por aí.`,
  },
  {
    id: "1cliente-followup-2",
    title: "Follow Up 2 (5º Dia)",
    category: "1º Cliente",
    message: `Oi, [nome_do_rep]! Hoje vou te passar algo que acelera muito o primeiro contato. 🎯

Quando for abordar um lead, começa assim:

*Oi, [nome do dono]! Trabalho com uma solução de cardápio digital que já é usada por mais de 17 mil estabelecimentos no Brasil. Muita gente aqui da região já usa. Posso te mostrar como funciona em 10 minutos?*

Simples, direto e com prova social logo de cara. Não precisa explicar tudo no primeiro contato, o objetivo é só garantir uma conversa.

Você já abordou algum lead? Me conta como foi! 💬`,
  },
  // Cadência de Follow-up (2º Cliente)
  {
    id: "2cliente-abertura",
    title: "Abertura (1º Dia)",
    category: "2º Cliente",
    message: `Parabéns, [nome_do_rep]! 🎉 Primeira venda feita!

Sério, isso é maior do que parece. A maioria das pessoas trava antes de fechar o primeiro cliente, e você já passou dessa barreira.
Como foi todo esse processo pra você? Teve algum momento mais desafiador ou algo que fluiu melhor do que esperava? Fico curioso(a) para saber como foi essa experiência na prática.

Qualquer coisa que precisar, é só chamar!`,
  },
  {
    id: "2cliente-followup-1",
    title: "Follow Up 1 (3º Dia)",
    category: "2º Cliente",
    message: `Oi, [nome_do_rep]! Quero falar de uma coisa que derruba muita gente boa no meio do caminho: o *não*. 🚧

Depois do primeiro cliente, a tendência é achar que todo lead vai virar venda. Aí vem uma semana de recusas e o desânimo bate.

Então deixa eu te dar um novo ângulo:

*Cada não que você recebe te aproxima do próximo sim.*

Não é clichê, é matemática de vendas. Se a sua taxa de conversão é de 1 em 5, então cada *não* é 20% de um cliente fechado.

Quando ouvir um *não* hoje, anota aqui pra mim. Vamos acompanhar juntos quantos *nãos* te custou o segundo cliente. 📊`,
  },
  {
    id: "2cliente-followup-2",
    title: "Follow Up 2 (5º Dia)",
    category: "2º Cliente",
    message: `[nome_do_rep], passando para te falar o que importa de verdade. 🤝

Você saiu do zero, fez o onboarding, fechou o primeiro cliente e está construindo uma carteira recorrente. Isso não é pouca coisa.

O segundo cliente pode vir hoje, amanhã ou na semana que vem, mas vai vir. Desde que você não pare.

Foco, sistema e consistência.

Estou aqui pra qualquer dúvida, objeção travada ou lead que você queira trabalhar junto. Pode chamar quando quiser. 💪`,
  },
];

function TemplateCard({ template }: { template: Template }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(template.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard indisponível — segue sem feedback
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--category-label)" }}>
          {template.category}
        </div>
        <div className="mt-0.5 text-[15px] font-bold text-foreground">{template.title}</div>
      </div>

      <div className="max-h-32 overflow-y-auto rounded-xl border border-border bg-muted/50 p-3 text-[12.5px] leading-relaxed whitespace-pre-line text-foreground/80">
        {template.message}
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold transition-colors",
          copied ? "bg-emerald-100 text-emerald-700" : "text-white hover:opacity-90",
        )}
        style={copied ? undefined : { backgroundImage: "var(--gradient-primary)" }}
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" /> Copiado!
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" /> Copiar mensagem
          </>
        )}
      </button>
    </div>
  );
}

export function Templates() {
  const [category, setCategory] = useState("Todas");

  const filtered = category === "Todas" ? TEMPLATES : TEMPLATES.filter((t) => t.category === category);

  return (
    <div className="h-screen overflow-y-auto">
      <header className="px-6 pb-2 pt-8 sm:px-10">
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-primary">
          <MessageSquareText className="h-3.5 w-3.5" /> Atalhos do Kommo
        </div>
        <h1 className="text-[26px] font-bold tracking-tight text-foreground">Follow-ups</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Copie a mensagem e cole direto no chat do Kommo pra disparar o atendimento.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 px-6 pb-1 pt-4 sm:px-10">
        {["Todas", ...CATEGORIES].map((c) => {
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
        {filtered.map((t) => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>
    </div>
  );
}
