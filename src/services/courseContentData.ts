import type { SubjectActivity, SubjectLessonSection, SubjectModuleContent, SubjectVisual } from "../data/subjectContent";
import { supabase } from "../supabase";

export type SubjectModuleMap = Record<string, SubjectModuleContent[]>;

type SubjectRow = {
  id: string;
  name: string;
};

type CourseModuleRow = {
  id: string;
  subject_id: string;
  title: string;
  objective: string;
  sort_order: number;
};

type LessonRow = {
  id: string;
  module_id: string;
  title: string;
  summary: string;
  sort_order: number;
};

type LessonBlockRow = {
  id: string;
  lesson_id: string;
  block_type: string;
  title: string;
  content: string;
  sort_order: number;
};

type LessonExerciseRow = {
  id: string;
  lesson_id: string;
  question: string;
  exercise_type: "open" | "multiple_choice";
  choices: unknown;
  correct_answer: string;
  explanation: string;
  difficulty: "facil" | "medio" | "dificil";
  sort_order: number;
};

type RemoteContent = {
  subjects: SubjectRow[];
  modules: CourseModuleRow[];
  lessons: LessonRow[];
  blocks: LessonBlockRow[];
  exercises: LessonExerciseRow[];
};

type CurriculumTopic = {
  title: string;
  description: string;
};

type CurriculumModuleSeed = {
  title: string;
  objective: string;
  overview: string;
  topics: CurriculumTopic[];
  activityPrompt: string;
  activityAnswer: string;
};

const BLOCK_LEVEL: Record<string, SubjectLessonSection["level"]> = {
  intro: "introducao",
  theory: "basico",
  example: "intermediario",
  guided_practice: "intermediario",
  common_mistake: "avancado",
  visual_summary: "intermediario",
  mind_map: "intermediario",
  review: "avancado",
  challenge: "avancado",
};

function bySortOrder<T extends { sort_order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.sort_order - b.sort_order);
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function splitParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function parseChoices(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const choices = value
    .map((choice) => (typeof choice === "string" ? choice.trim() : ""))
    .filter(Boolean);

  return choices.length > 0 ? choices : undefined;
}

function getCorrectChoiceIndex(choices: string[] | undefined, correctAnswer: string) {
  if (!choices) return undefined;

  const answer = normalizeText(correctAnswer);
  const letterIndex = "abcde".indexOf(answer);
  if (letterIndex >= 0 && letterIndex < choices.length) return letterIndex;

  const exactIndex = choices.findIndex((choice) => normalizeText(choice) === answer);
  return exactIndex >= 0 ? exactIndex : undefined;
}

function blockToSection(block: LessonBlockRow): SubjectLessonSection {
  const section: SubjectLessonSection = {
    title: block.title || "Conteudo",
    level: BLOCK_LEVEL[block.block_type] ?? "basico",
    paragraphs: splitParagraphs(block.content),
  };

  if (block.block_type === "common_mistake") {
    section.commonMistake = block.content;
  }

  if (block.block_type === "guided_practice" || block.block_type === "challenge") {
    section.teacherTip = "Leia a situacao, identifique os dados e explique o raciocinio antes de responder.";
  }

  return section;
}

function exerciseToActivity(exercise: LessonExerciseRow): SubjectActivity {
  const choices = parseChoices(exercise.choices);

  return {
    question: exercise.question,
    answer: exercise.correct_answer,
    choices,
    correctChoice: getCorrectChoiceIndex(choices, exercise.correct_answer),
    difficulty: exercise.difficulty,
    explanation: exercise.explanation || undefined,
  };
}

function enhancePortugueseModuleContent(content: SubjectModuleContent): SubjectModuleContent {
  const title = content.title;
  const hasInterpretationContext = normalizeText(`${title} ${content.objective}`).includes("interpret");
  const focusLabel = hasInterpretationContext ? "interpretação" : "análise textual";

  const readingSections: SubjectLessonSection[] = [
    {
      title: "Leitura estratégica para prova",
      level: "introducao",
      paragraphs: [
        `Antes de responder sobre ${title}, faça uma leitura em duas voltas: primeiro entenda o assunto geral; depois procure marcas de linguagem que sustentam a resposta.`,
        "Em questões do ENEM, a alternativa correta quase sempre depende de uma pista concreta do texto: conectivo, retomada, escolha vocabular, oposição, ironia, finalidade ou efeito de sentido.",
      ],
      teacherTip: "Não comece pelas alternativas. Leia o comando, identifique o que ele pede e só depois compare as opções.",
      whyItMatters: "Esse método reduz chute por impressão e obriga a resposta a nascer do texto.",
    },
    {
      title: "Como eliminar alternativas",
      level: "intermediario",
      paragraphs: [
        "Elimine primeiro as opções que exageram, generalizam ou trocam o foco do comando. Depois compare as duas alternativas mais fortes com o trecho que justifica cada uma.",
        "Uma alternativa pode parecer bonita e ainda assim estar errada se falar de um tema lateral, se contradizer o texto ou se transformar uma inferência em afirmação absoluta.",
      ],
      commonMistake: "Marcar a opção que combina com sua opinião sobre o tema, mas não responde ao comando da questão.",
    },
    {
      title: "Checklist de resposta",
      level: "avancado",
      paragraphs: [
        "Ao final, confirme quatro pontos: o comando foi respondido, a alternativa tem apoio textual, não houve extrapolação e as palavras-chave da opção aparecem no texto ou podem ser inferidas dele.",
        "Se duas alternativas parecerem possíveis, prefira a que explica melhor a função do trecho dentro do texto, não apenas o assunto mencionado.",
      ],
      analogy: "Resolver interpretação é como defender uma resposta com prova: cada escolha precisa de uma evidência.",
    },
  ];

  const readingExamples = [
    {
      title: "Exemplo ENEM: comando antes da opinião",
      content: `Se a questão pergunta o efeito de um conectivo, não responda sobre o tema geral do texto. Em ${focusLabel}, procure a relação criada: oposição, conclusão, causa, concessão, adição ou comparação.`,
    },
    {
      title: "Exemplo ENEM: alternativa exagerada",
      content: "Quando uma opção usa palavras como sempre, nunca, apenas, todos ou prova que, confira se o texto realmente sustenta essa força. Muitas pegadinhas nascem de exageros.",
    },
  ];

  const readingActivities: SubjectActivity[] = [
    {
      question: `Ao estudar ${title}, qual é a primeira ação mais segura antes de olhar as alternativas?`,
      choices: [
        "Escolher a alternativa com linguagem mais formal.",
        "Ler o comando e identificar exatamente o que ele pede.",
        "Procurar a opção mais parecida com sua opinião.",
        "Responder pela lembrança de uma regra gramatical isolada.",
      ],
      correctChoice: 1,
      answer: "Ler o comando e identificar exatamente o que ele pede.",
      difficulty: "facil",
      explanation: "O comando define a habilidade cobrada. Sem ele, o aluno pode interpretar o texto corretamente e ainda responder outra coisa.",
    },
    {
      question: "Uma alternativa parece correta, mas não possui apoio em nenhuma marca do texto. O que fazer?",
      choices: [
        "Marcar mesmo assim se a frase estiver bem escrita.",
        "Trocar por uma alternativa que dialogue melhor com o comando e com o texto.",
        "Ignorar o comando e responder pelo tema principal.",
        "Escolher a opção mais longa.",
      ],
      correctChoice: 1,
      answer: "Trocar por uma alternativa que dialogue melhor com o comando e com o texto.",
      difficulty: "medio",
      explanation: "Em interpretação, a resposta precisa ser defensável por evidência textual, não apenas por plausibilidade.",
    },
  ];

  return {
    ...content,
    learningPath: [
      "Ler o comando e localizar a habilidade",
      "Marcar pistas do texto",
      "Eliminar alternativas exageradas",
      "Justificar a resposta com evidência",
    ],
    sections: [...readingSections, ...(content.sections ?? [])],
    examples: [...readingExamples, ...content.examples],
    activities: [...content.activities, ...readingActivities],
    visual: {
      type: "flow",
      title: `Roteiro de leitura: ${title}`,
      description: "Fluxo prático para transformar leitura em resposta justificável.",
      nodes: ["Comando", "Tema", "Pistas", "Inferência", "Eliminação", "Resposta"],
    },
    review: {
      summary: [
        "Leia o comando antes de julgar as alternativas.",
        "Toda resposta precisa de uma evidência textual.",
        "Cuidado com exageros, generalizações e troca de foco.",
        ...(content.review?.summary ?? []).slice(0, 3),
      ],
      mentalMap: ["Comando", "Evidência", "Conectivos", "Inferência", "Efeito de sentido", "Alternativa correta"],
      flashcards: [
        {
          front: "Como evitar chute em interpretação?",
          back: "Leia o comando, marque pistas do texto e só aceite uma alternativa que tenha apoio textual.",
        },
        {
          front: "Qual é o erro mais comum em questões de Português?",
          back: "Responder pelo tema geral ou pela opinião pessoal, sem observar exatamente o que o comando pediu.",
        },
        ...(content.review?.flashcards ?? []).slice(0, 2),
      ],
    },
  };
}

function getTopicDeepDive(topic: CurriculumTopic): string[] {
  const title = normalizeText(topic.title);

  if (title.includes("leitura") && title.includes("interpretacao")) {
    return [
      "Interpretar um texto não é apenas dizer o assunto principal. O aluno precisa reconhecer quem fala, para quem fala, com qual finalidade e quais pistas linguísticas sustentam a resposta.",
      "Na prática, vale observar título, gênero textual, marcas de opinião, conectivos, escolhas de palavras e relação entre parágrafo inicial e conclusão. Esses elementos ajudam a diferenciar tema, tese, finalidade e efeito de sentido.",
      "Em provas, muitas alternativas erradas parecem corretas porque repetem palavras do texto, mas mudam o foco do comando. Por isso, a resposta deve sempre voltar ao trecho que comprova a interpretação.",
    ];
  }

  if (title.includes("denotacao") || title.includes("conotacao") || title.includes("funcoes da linguagem")) {
    return [
      "Denotação é o sentido mais direto da palavra; conotação aparece quando a linguagem cria efeito figurado, irônico, poético ou expressivo.",
      "As funções da linguagem ajudam a perceber a intenção comunicativa: informar, emocionar, convencer, explicar o código, testar o canal ou valorizar a própria forma da mensagem.",
      "Um bom estudo desse tópico compara frases parecidas em contextos diferentes, porque a mesma palavra pode mudar de sentido conforme gênero, objetivo e interlocutor.",
    ];
  }

  if (title.includes("intertextualidade")) {
    return [
      "Intertextualidade acontece quando um texto dialoga com outro texto, obra, imagem, fala histórica, meme, música, propaganda ou conhecimento cultural compartilhado.",
      "Esse diálogo pode aparecer como citação, paródia, alusão, reescrita, crítica ou homenagem. O importante é perceber que o sentido novo depende da relação com o texto anterior.",
      "Em questões, procure qual elemento foi retomado e qual efeito essa retomada cria: humor, crítica social, atualização de um tema antigo ou reforço de uma ideia.",
    ];
  }

  if (title.includes("fonetica") || title.includes("ortografia") || title.includes("acentuacao") || title.includes("crase")) {
    return [
      "Esse bloco fortalece a escrita formal e evita erros que atrapalham clareza. A regra só fica útil quando ligada a exemplos reais de leitura e produção textual.",
      "Acentuação depende de tonicidade e classificação das palavras; crase depende da fusão entre preposição e artigo ou pronome demonstrativo. Não é chute visual.",
      "O melhor treino é justificar a regra aplicada: por que há acento, por que não há crase, qual som está sendo representado e que efeito o erro causaria no texto.",
    ];
  }

  if (title.includes("coesao") || title.includes("coerencia")) {
    return [
      "Coesão liga partes do texto por conectivos, pronomes, repetições controladas e retomadas. Coerência garante que as ideias formem um sentido possível e progressivo.",
      "Um parágrafo pode ter muitas palavras bonitas e ainda ser fraco se as ideias não avançam. Por isso, cada frase deve acrescentar informação ou explicar melhor a anterior.",
      "Ao revisar, pergunte: está claro quem ou o que está sendo retomado? O conectivo combina com a relação lógica? A conclusão realmente nasce do que foi argumentado?",
    ];
  }

  if (title.includes("figuras de linguagem")) {
    return [
      "Figuras de linguagem não servem apenas para decorar nomes. Elas criam efeito de sentido: intensificam, aproximam ideias, produzem humor, sugerem crítica ou tornam a imagem mais expressiva.",
      "Metáfora, metonímia, ironia, antítese e hipérbole aparecem com frequência porque mudam a forma como o leitor interpreta uma situação.",
      "Em questões, o foco costuma ser o efeito produzido pela figura, não apenas sua classificação. Identifique a figura e explique o que ela faz no texto.",
    ];
  }

  if (title.includes("dissertacao") || title.includes("tese") || title.includes("repertorio")) {
    return [
      "A dissertação argumentativa organiza uma posição sobre um problema. A tese precisa aparecer com clareza e os argumentos devem sustentar essa posição, não apenas repetir o tema.",
      "Repertório sociocultural só funciona quando é pertinente e produtivo. Citar uma obra, autor, dado ou fato histórico sem conectar ao argumento enfraquece o texto.",
      "Uma boa estratégia é montar cada parágrafo com ideia central, explicação, exemplo ou repertório e fechamento que retome a tese.",
    ];
  }

  if (title.includes("redacao") || title.includes("enem")) {
    return [
      "Na redação modelo ENEM, o aluno precisa apresentar tese, desenvolver argumentos consistentes e propor uma intervenção detalhada para o problema.",
      "A proposta deve indicar agente, ação, meio ou modo, finalidade e detalhamento. Esses elementos mostram que a solução foi pensada de forma concreta.",
      "O texto fica mais forte quando cada repertório aparece ligado ao argumento e quando a conclusão não surge como lista solta de soluções.",
    ];
  }

  if (title.includes("conjunto") || title.includes("intervalos")) {
    return [
      "Conjuntos numéricos organizam os tipos de número que aparecem nos problemas. Essa organização evita confundir inteiro, racional, irracional e real.",
      "Intervalos são uma forma compacta de representar muitos valores ao mesmo tempo. Eles aparecem quando a resposta não é um único número, mas uma faixa de possibilidades.",
      "Antes de resolver funções e inequações, o aluno precisa ler corretamente símbolos como <, <=, colchetes, parênteses e representações na reta real.",
    ];
  }

  if (title.includes("funcao")) {
    return [
      "Função descreve uma relação entre grandezas: para cada entrada do domínio, existe uma saída correspondente.",
      "O mesmo objeto pode ser lido por lei, tabela, gráfico ou contexto verbal. Aprender funções é transitar entre essas representações sem perder o significado.",
      "Em problemas, identifique o que varia, o que depende do que e qual pergunta está sendo feita: valor da função, raiz, crescimento, máximo, mínimo ou interpretação do gráfico.",
    ];
  }

  if (title.includes("porcentagem") || title.includes("juros") || title.includes("financeira")) {
    return [
      "Matemática financeira liga cálculo a decisões reais: desconto, aumento, parcela, investimento, dívida e comparação de propostas.",
      "Porcentagem deve ser lida como taxa sobre uma base. O maior erro é aplicar a taxa ao valor errado, principalmente em aumentos e descontos sucessivos.",
      "Juros simples crescem por soma constante; juros compostos acumulam sobre o montante. Essa diferença muda completamente o comportamento ao longo do tempo.",
    ];
  }

  if (title.includes("geometria") || title.includes("triangulo") || title.includes("areas")) {
    return [
      "Geometria exige transformar desenho em informação: identificar medidas conhecidas, medidas pedidas e relações entre lados, ângulos e áreas.",
      "Muitas questões podem ser resolvidas decompondo figuras complexas em retângulos, triângulos, círculos ou sólidos mais simples.",
      "Quando houver triângulo retângulo, verifique se Pitágoras ou razões trigonométricas conectam os dados. O desenho quase sempre contém pistas essenciais.",
    ];
  }

  if (title.includes("probabilidade") || title.includes("combinatoria") || title.includes("contagem")) {
    return [
      "Contagem exige decidir se a ordem importa, se há repetição e se as escolhas são independentes. A fórmula vem depois dessa leitura.",
      "Probabilidade compara casos favoráveis com casos possíveis, mas o desafio está em definir corretamente o espaço amostral.",
      "Antes de calcular, escreva uma frase dizendo o que está sendo contado. Isso reduz confusões entre arranjo, combinação e permutação.",
    ];
  }

  return [
    `O primeiro passo é entender o papel de ${topic.title.toLowerCase()} dentro da unidade. Não basta reconhecer o nome: é preciso saber quando esse conceito aparece e que tipo de problema ele resolve.`,
    "Durante o estudo, procure exemplos, contraexemplos e palavras-chave do enunciado. Isso ajuda a transformar teoria em decisão prática na hora da atividade.",
    "Ao finalizar, explique o conceito com suas palavras e resolva uma questão curta sem consultar o resumo. Se a explicação travar, volte ao trecho principal e reescreva a ideia.",
  ];
}

function getTopicExampleContent(topic: CurriculumTopic, index: number) {
  const title = normalizeText(topic.title);

  if (title.includes("leitura") && title.includes("interpretacao")) {
    return "Leia uma notícia curta e separe três dados: o fato principal, quem foi afetado e qual finalidade o texto cumpre. A resposta melhora quando o aluno prova a interpretação com uma pista do próprio texto.";
  }

  if (title.includes("denotacao") || title.includes("conotacao") || title.includes("funcoes da linguagem")) {
    return "Na frase 'o preço despencou', o verbo não indica queda física: cria sentido figurado para mostrar redução brusca. Depois, observe se a intenção é informar, convencer, emocionar ou destacar a forma da mensagem.";
  }

  if (title.includes("intertextualidade")) {
    return "Quando uma propaganda recria um conto conhecido, ela usa o repertório do leitor para gerar humor ou crítica. A tarefa é identificar o texto de origem e explicar o novo efeito produzido.";
  }

  if (title.includes("fonetica") || title.includes("ortografia") || title.includes("acentuacao") || title.includes("crase")) {
    return "Compare 'a noite' e 'à noite' com 'vou à escola'. A crase só aparece quando há encontro de preposição com artigo feminino; por isso a decisão depende da estrutura da frase, não do som.";
  }

  if (title.includes("coesao") || title.includes("coerencia")) {
    return "Troque um conectivo do parágrafo por outro e veja se a relação lógica muda. 'Portanto' conclui, 'porém' opõe e 'além disso' soma informações.";
  }

  if (title.includes("figuras de linguagem")) {
    return "Em 'a cidade acordou cedo', há personificação: a cidade recebe ação humana. O ponto da questão não é apenas nomear a figura, mas explicar o efeito de aproximar lugar e pessoas.";
  }

  if (title.includes("dissertacao") || title.includes("tese") || title.includes("repertorio")) {
    return "Para defender leitura nas escolas, escreva primeiro a tese. Depois use um dado, obra ou fato histórico que realmente ajude a justificar essa posição.";
  }

  if (title.includes("redacao") || title.includes("enem")) {
    return "Uma proposta de intervenção completa pode seguir: agente, ação, meio, finalidade e detalhamento. Se faltar um desses elementos, a solução parece vaga.";
  }

  if (title.includes("conjunto") || title.includes("intervalos")) {
    return "A desigualdade -2 <= x < 4 vira o intervalo [-2, 4). O colchete inclui o -2; o parêntese mostra que o 4 não faz parte da solução.";
  }

  if (title.includes("funcao")) {
    return "Se f(x) = 2x + 3, cada entrada gera uma saída: f(0) = 3, f(2) = 7. A tabela, a fórmula e o gráfico contam a mesma relação.";
  }

  if (title.includes("porcentagem") || title.includes("juros") || title.includes("financeira")) {
    return "Um produto de R$ 120 com 10% de desconto perde R$ 12 e passa a custar R$ 108. Em descontos sucessivos, a segunda taxa incide sobre o novo valor.";
  }

  if (title.includes("equacoes") || title.includes("inequacoes")) {
    return "Em 3x + 6 = 21, subtraia 6 dos dois lados e depois divida por 3: x = 5. Na inequação, o resultado pode ser um intervalo inteiro de valores.";
  }

  if (title.includes("progressoes")) {
    return "Na sequência 2, 5, 8, 11, a razão é 3, então é uma P.A. Na sequência 3, 6, 12, 24, a razão multiplicativa é 2, então é uma P.G.";
  }

  if (title.includes("trigonometria")) {
    return "No triângulo retângulo, seno usa cateto oposto sobre hipotenusa, cosseno usa adjacente sobre hipotenusa e tangente usa oposto sobre adjacente.";
  }

  if (title.includes("matrizes") || title.includes("sistemas lineares")) {
    return "Uma matriz 2 x 3 tem 2 linhas e 3 colunas. Em sistemas, cada equação restringe os valores possíveis das incógnitas.";
  }

  if (title.includes("probabilidade") || title.includes("combinatoria") || title.includes("contagem")) {
    return "Se há 3 camisas e 2 calças, existem 6 combinações. Antes de usar fórmula, pergunte se a ordem muda o resultado.";
  }

  if (title.includes("geometria analitica")) {
    return "Entre A(0,0) e B(3,4), a distância é 5 porque os deslocamentos formam um triângulo retângulo de catetos 3 e 4.";
  }

  if (title.includes("geometria espacial")) {
    return "Em um prisma, volume é área da base vezes altura. Se a base mede 12 cm² e a altura mede 5 cm, o volume é 60 cm³.";
  }

  if (title.includes("geometria") || title.includes("triangulo") || title.includes("areas")) {
    return "Um triângulo de base 8 e altura 5 tem área 20, porque a área é base vezes altura dividida por 2.";
  }

  if (title.includes("estatistica")) {
    return "Nos dados 2, 3, 3 e 8, a moda é 3, a mediana é 3 e a média é 4. O valor 8 puxa a média para cima.";
  }

  if (title.includes("complexos") || title.includes("polinomios") || title.includes("algebra")) {
    return "Se P(2) = 0, então 2 é raiz do polinômio. Nos complexos, i² = -1 permite representar soluções fora dos reais.";
  }

  return index === 0
    ? `Use ${topic.title.toLowerCase()} para transformar a definição em uma decisão prática: identifique dados, escolha a ferramenta e justifique o resultado.`
    : `Crie um exemplo curto de ${topic.title.toLowerCase()} e explique em uma frase qual parte do problema exige esse conceito.`;
}

function enhanceGeneralModuleContent(subjectName: string, content: SubjectModuleContent): SubjectModuleContent {
  const existingSections = content.sections ?? [];
  const hasEnoughExamples = content.examples.length >= 3;
  const hasEnoughSections = existingSections.length >= 3;
  const hasUsefulReview = (content.review?.summary.length ?? 0) >= 3;

  if (hasEnoughExamples && hasEnoughSections && hasUsefulReview) {
    return content;
  }

  const explanation = content.explanation.filter(Boolean);
  const baseParagraph = explanation[0] ?? content.objective;
  const topic: CurriculumTopic = {
    title: content.title,
    description: content.objective,
  };

  const fallbackSections: SubjectLessonSection[] = hasEnoughSections
    ? existingSections
    : [
      {
        title: "Ideia central",
        level: "introducao",
        paragraphs: [
          content.objective,
          baseParagraph,
          `Em ${subjectName}, este tema deve ser estudado conectando conceito, exemplo e aplicação. A leitura fica mais forte quando o aluno entende o que o problema pede antes de tentar memorizar a resposta.`,
        ],
        teacherTip: "Depois de ler, escreva uma pergunta que esse conteúdo ajuda a responder.",
      },
      {
        title: "Como aplicar",
        level: "intermediario",
        paragraphs: explanation.slice(1, 3).length > 0
          ? explanation.slice(1, 3)
          : [
            "Procure palavras-chave, dados apresentados e relações entre as partes do problema. Depois escolha o conceito adequado e justifique a decisão.",
            "A aplicação deve mostrar quando usar o conteúdo, não apenas repetir a definição.",
          ],
        whyItMatters: "Esse passo transforma leitura em decisão prática durante exercícios e simulados.",
      },
      {
        title: "Revisão ativa",
        level: "avancado",
        paragraphs: [
          "Feche o estudo explicando o tema em voz alta, criando um exemplo próprio e resolvendo uma questão curta sem consultar o resumo.",
          "Se a explicação ficar vaga, volte ao conceito principal e compare com o exemplo guiado.",
        ],
        commonMistake: "Achar que entendeu porque reconheceu o nome do conteúdo, mas não conseguir aplicar em uma situação nova.",
      },
    ];

  const fallbackExamples = hasEnoughExamples
    ? content.examples
    : [
      ...content.examples,
      {
        title: `Exemplo guiado: ${content.title}`,
        content: getTopicExampleContent(topic, 0),
      },
      {
        title: "Aplicação rápida",
        content: `Leia uma situação curta de ${subjectName}, localize o dado principal e explique em uma frase como ${content.title.toLowerCase()} ajuda a chegar à resposta.`,
      },
    ].slice(0, 4);

  return {
    ...content,
    sections: fallbackSections,
    examples: fallbackExamples,
    review: {
      summary: hasUsefulReview
        ? content.review?.summary ?? []
        : [
          content.objective,
          "Estude o conceito com exemplo, aplicação e revisão ativa.",
          "A resposta deve ser justificada com dados do problema ou pistas do texto.",
          ...(content.review?.summary ?? []),
        ].slice(0, 6),
      mentalMap: content.review?.mentalMap.length
        ? content.review.mentalMap
        : [subjectName, content.title, "Conceito", "Exemplo", "Aplicação", "Revisão"],
      flashcards: content.review?.flashcards.length
        ? content.review.flashcards
        : [
          {
            front: `Como estudar ${content.title}?`,
            back: "Leia o conceito, acompanhe um exemplo, resolva uma aplicação e revise explicando com suas palavras.",
          },
        ],
    },
  };
}

function enhanceModuleContent(subjectName: string, content: SubjectModuleContent): SubjectModuleContent {
  if (subjectName === "Português") return enhancePortugueseModuleContent(content);
  return enhanceGeneralModuleContent(subjectName, content);
}

function createCurriculumModule(seed: CurriculumModuleSeed): SubjectModuleContent {
  const topicTitles = seed.topics.map((topic) => topic.title);
  const firstTopic = seed.topics[0] ?? { title: "conceito central", description: seed.overview };
  const secondTopic = seed.topics[1] ?? firstTopic;
  const thirdTopic = seed.topics[2] ?? secondTopic;
  const distractorTopics = seed.topics
    .slice(1, 4)
    .map((topic) => topic.title)
    .filter((title) => title !== firstTopic.title);
  const sections: SubjectLessonSection[] = [
    {
      title: "Visão geral",
      level: "introducao",
      paragraphs: [
        seed.overview,
        `A trilha está organizada em ${topicTitles.join(", ")} para facilitar estudo, revisão e prática.`,
      ],
      teacherTip: "Estude um bloco por vez, faça uma anotação curta e resolva pelo menos uma questão antes de avançar.",
    },
    ...seed.topics.map((topic, index) => ({
      title: topic.title,
      level: index === 0 ? "basico" : index < 3 ? "intermediario" : "avancado",
      paragraphs: [topic.description, ...getTopicDeepDive(topic)],
      whyItMatters: "Este conteúdo aparece em exercícios, simulados e na leitura de problemas com contexto.",
      commonMistake: "Decorar a definição sem praticar quando aplicar o conceito.",
      teacherTip: "Depois de ler, transforme o bloco em uma pergunta e tente responder sem olhar.",
    } satisfies SubjectLessonSection)),
  ];

  return {
    title: seed.title,
    objective: seed.objective,
    explanation: [seed.overview, ...seed.topics.map((topic) => `${topic.title}: ${topic.description}`)],
    examples: seed.topics.slice(0, 4).map((topic, index) => ({
      title: index === 0 ? `Exemplo guiado: ${topic.title}` : `Aplicação: ${topic.title}`,
      content: getTopicExampleContent(topic, index),
    })),
    activities: [
      {
        question: seed.activityPrompt,
        choices: [
          seed.activityAnswer,
          "Memorizar nomes sem aplicar em exercícios.",
          "Pular a etapa de revisão e ir direto para simulados.",
          "Estudar apenas o tópico mais fácil da unidade.",
        ],
        correctChoice: 0,
        answer: seed.activityAnswer,
        difficulty: "facil",
        explanation: "A resposta correta resume a finalidade real do módulo e conecta teoria com prática.",
      },
      {
        question: `Qual tópico deve ser usado primeiro quando a questão pede ${firstTopic.description.toLowerCase()}?`,
        choices: [
          firstTopic.title,
          ...distractorTopics,
          "Ignorar o enunciado e testar alternativas.",
        ].slice(0, 4),
        correctChoice: 0,
        answer: firstTopic.title,
        difficulty: "facil",
        explanation: `O primeiro passo é reconhecer que o comando está ligado a ${firstTopic.title}.`,
      },
      {
        question: `Compare ${firstTopic.title} e ${secondTopic.title}. O que muda na forma de resolver?`,
        answer: `A resposta deve mostrar a diferença entre ${firstTopic.title.toLowerCase()} e ${secondTopic.title.toLowerCase()}, usando uma situação simples.`,
        difficulty: "medio",
        explanation: "Comparar dois tópicos ajuda a evitar decorar fórmulas sem saber quando usar cada uma.",
        rubric: [
          {
            label: "Compara conceitos",
            accepted: [firstTopic.title, secondTopic.title],
            feedback: "Cite os dois tópicos para deixar a comparação clara.",
          },
          {
            label: "Aplica em contexto",
            accepted: ["exemplo", "situação", "problema", "questão"],
            feedback: "Inclua uma situação de uso, não apenas a definição.",
          },
        ],
      },
      {
        question: `Escolha um tópico de ${seed.title} e escreva um exemplo de como ele pode aparecer em uma questão.`,
        answer: "A resposta deve ligar um conceito do módulo a uma situação de prova, interpretação ou resolução.",
        difficulty: "medio",
        explanation: "Essa prática transforma lista de conteúdos em domínio aplicável.",
      },
      {
        question: `Erro comum: estudar ${thirdTopic.title} apenas decorando regra. O que fazer para evitar esse erro?`,
        answer: "Resolver um exemplo, justificar a escolha do método e revisar o erro depois da correção.",
        difficulty: "dificil",
        explanation: "O objetivo é transformar regra em decisão: saber quando, por que e como aplicar.",
      },
    ],
    learningPath: topicTitles,
    sections,
    visual: {
      type: "flow",
      title: `Roteiro de ${seed.title}`,
      description: "Sequência sugerida para estudar a unidade sem perder a visão geral.",
      nodes: topicTitles.slice(0, 6),
    },
    review: {
      summary: seed.topics.map((topic) => `${topic.title}: ${topic.description}`),
      mentalMap: topicTitles,
      flashcards: seed.topics.slice(0, 5).map((topic) => ({
        front: `O que estudar em ${topic.title}?`,
        back: topic.description,
      })),
    },
  };
}

type ModulePracticeProfile = {
  examples: SubjectModuleContent["examples"];
  activities: SubjectActivity[];
  summary: string[];
  mentalMap: string[];
  flashcards: NonNullable<SubjectModuleContent["review"]>["flashcards"];
};

function mergeActivities(baseActivities: SubjectActivity[], priorityActivities: SubjectActivity[]) {
  const seenQuestions = new Set<string>();

  return [...priorityActivities, ...baseActivities]
    .filter((activity) => {
      const key = normalizeText(activity.question);
      if (seenQuestions.has(key)) return false;
      seenQuestions.add(key);
      return true;
    })
    .slice(0, 7);
}

function getMathPracticeProfile(title: string): ModulePracticeProfile | undefined {
  if (title.includes("conjuntos numericos")) {
    return {
      examples: [
        {
          title: "Classificando numeros",
          content: "-3 pertence aos inteiros, racionais e reais. 1/2 pertence aos racionais e reais. Raiz de 2 pertence aos irracionais e reais.",
        },
        {
          title: "Intervalo na reta real",
          content: "A desigualdade 2 <= x < 5 pode ser escrita como [2, 5). O colchete inclui o 2; o parenteses exclui o 5.",
        },
      ],
      activities: [
        {
          question: "Qual numero e irracional?",
          choices: ["Raiz de 2", "0,25", "-7", "3/4"],
          correctChoice: 0,
          answer: "Raiz de 2",
          difficulty: "facil",
          explanation: "Raiz de 2 nao pode ser escrita como fracao entre inteiros e tem representacao decimal infinita nao periodica.",
        },
        {
          question: "O intervalo [1, 4) representa quais valores?",
          choices: ["x maior ou igual a 1 e menor que 4", "x maior que 1 e menor ou igual a 4", "x entre 1 e 4, sem incluir nenhum", "apenas os numeros 1 e 4"],
          correctChoice: 0,
          answer: "x maior ou igual a 1 e menor que 4",
          difficulty: "facil",
          explanation: "O colchete inclui o limite; o parenteses exclui o limite.",
        },
      ],
      summary: [
        "Naturais, inteiros, racionais, irracionais e reais formam uma hierarquia de conjuntos.",
        "Intervalos traduzem desigualdades para uma notacao mais compacta.",
      ],
      mentalMap: ["Naturais", "Inteiros", "Racionais", "Irracionais", "Reais", "Intervalos"],
      flashcards: [
        { front: "Todo inteiro e racional?", back: "Sim. Todo inteiro n pode ser escrito como n/1." },
        { front: "O que indica [a, b)?", back: "Inclui a e exclui b." },
      ],
    };
  }

  if (title.includes("matematica financeira")) {
    return {
      examples: [
        {
          title: "Desconto percentual",
          content: "Um produto de R$ 200 com 15% de desconto perde R$ 30. O preco final fica R$ 170.",
        },
        {
          title: "Juros simples e compostos",
          content: "Nos juros simples, o crescimento soma sempre a mesma parcela. Nos compostos, a taxa incide sobre o valor acumulado.",
        },
      ],
      activities: [
        {
          question: "Um produto custa R$ 80 e recebe aumento de 25%. Qual e o novo preco?",
          choices: ["R$ 90", "R$ 95", "R$ 100", "R$ 105"],
          correctChoice: 2,
          answer: "R$ 100",
          difficulty: "facil",
          explanation: "25% de 80 e 20. Logo, 80 + 20 = 100.",
        },
        {
          question: "Em qual situacao o crescimento e composto?",
          choices: ["A taxa incide sempre sobre o capital inicial.", "A taxa incide sobre o montante acumulado.", "O valor aumenta por uma soma fixa.", "Nao existe taxa percentual."],
          correctChoice: 1,
          answer: "A taxa incide sobre o montante acumulado.",
          difficulty: "medio",
          explanation: "Juros compostos acumulam juros sobre juros.",
        },
      ],
      summary: [
        "Porcentagem compara uma parte com o todo em base 100.",
        "Juros simples crescem de forma linear; juros compostos crescem de forma acumulada.",
      ],
      mentalMap: ["Porcentagem", "Desconto", "Aumento", "Capital", "Taxa", "Montante"],
      flashcards: [
        { front: "Como calcular 20% de um valor?", back: "Multiplique o valor por 0,20." },
        { front: "Qual a diferenca entre juros simples e compostos?", back: "Simples incidem sobre o capital inicial; compostos incidem sobre o montante acumulado." },
      ],
    };
  }

  if (title.includes("equacoes") || title.includes("inequacoes")) {
    return {
      examples: [
        {
          title: "Equacao de primeiro grau",
          content: "Em 2x + 6 = 18, subtraia 6 dos dois lados: 2x = 12. Depois divida por 2: x = 6.",
        },
        {
          title: "Inequacao na reta",
          content: "Em x - 3 > 2, somamos 3 nos dois lados e obtemos x > 5. A solucao e todo numero maior que 5.",
        },
      ],
      activities: [
        {
          question: "Resolva: 3x - 4 = 11.",
          choices: ["3", "5", "7", "15"],
          correctChoice: 1,
          answer: "5",
          difficulty: "facil",
          explanation: "3x = 15, entao x = 5.",
        },
        {
          question: "A solucao de x + 2 <= 9 e:",
          choices: ["x <= 7", "x >= 7", "x < 11", "x > 11"],
          correctChoice: 0,
          answer: "x <= 7",
          difficulty: "facil",
          explanation: "Subtraindo 2 dos dois lados: x <= 7.",
        },
      ],
      summary: [
        "Equacoes buscam valores que tornam uma igualdade verdadeira.",
        "Inequacoes geram comparacoes e muitas vezes intervalos de solucao.",
      ],
      mentalMap: ["Igualdade", "Incognita", "Operacao inversa", "Desigualdade", "Intervalo"],
      flashcards: [
        { front: "Qual e a regra central para resolver equacoes?", back: "Aplicar a mesma operacao nos dois lados da igualdade." },
        { front: "O que uma inequacao pode gerar?", back: "Um intervalo de valores, nao apenas um numero." },
      ],
    };
  }

  if (title.includes("progressoes")) {
    return {
      examples: [
        {
          title: "Progressao aritmetica",
          content: "Na sequencia 4, 7, 10, 13, a razao e 3. Cada termo nasce somando 3 ao anterior.",
        },
        {
          title: "Progressao geometrica",
          content: "Na sequencia 2, 6, 18, 54, a razao e 3. Cada termo nasce multiplicando o anterior por 3.",
        },
      ],
      activities: [
        {
          question: "Qual e o proximo termo da P.A. 5, 9, 13, 17?",
          choices: ["19", "20", "21", "22"],
          correctChoice: 2,
          answer: "21",
          difficulty: "facil",
          explanation: "A razao e 4, entao 17 + 4 = 21.",
        },
        {
          question: "Na P.G. 3, 6, 12, 24, qual e a razao?",
          choices: ["2", "3", "6", "12"],
          correctChoice: 0,
          answer: "2",
          difficulty: "facil",
          explanation: "Cada termo e o anterior multiplicado por 2.",
        },
      ],
      summary: [
        "P.A. cresce ou decresce por soma constante.",
        "P.G. cresce ou decresce por multiplicacao constante.",
      ],
      mentalMap: ["Sequencia", "Razao", "P.A.", "P.G.", "Termo geral", "Soma"],
      flashcards: [
        { front: "Como reconhecer uma P.A.?", back: "A diferenca entre termos consecutivos e constante." },
        { front: "Como reconhecer uma P.G.?", back: "A divisao entre termos consecutivos e constante." },
      ],
    };
  }

  if (title.includes("geometria analitica")) {
    return {
      examples: [
        {
          title: "Distancia entre pontos",
          content: "Entre A(1, 2) e B(4, 6), as diferencas sao 3 e 4. Pelo teorema de Pitagoras, a distancia e 5.",
        },
        {
          title: "Coeficiente angular",
          content: "A inclinacao da reta pode ser lida por m = variacao de y / variacao de x.",
        },
      ],
      activities: [
        {
          question: "Qual a distancia entre A(0, 0) e B(3, 4)?",
          choices: ["3", "4", "5", "7"],
          correctChoice: 2,
          answer: "5",
          difficulty: "facil",
          explanation: "Forma-se um triangulo retangulo de catetos 3 e 4, entao a distancia e 5.",
        },
        {
          question: "Uma reta com m > 0 e:",
          choices: ["crescente", "decrescente", "horizontal obrigatoriamente", "vertical obrigatoriamente"],
          correctChoice: 0,
          answer: "crescente",
          difficulty: "facil",
          explanation: "Coeficiente angular positivo indica crescimento da esquerda para a direita.",
        },
      ],
      summary: [
        "Geometria analitica traduz figuras para coordenadas e equacoes.",
        "Distancia, ponto medio e inclinacao conectam plano cartesiano e algebra.",
      ],
      mentalMap: ["Ponto", "Distancia", "Ponto medio", "Reta", "Coeficiente angular", "Circunferencia"],
      flashcards: [
        { front: "O que mede o coeficiente angular?", back: "A inclinacao da reta." },
        { front: "Como interpretar uma circunferencia?", back: "Como o conjunto de pontos a uma mesma distancia do centro." },
      ],
    };
  }

  if (title.includes("geometria espacial")) {
    return {
      examples: [
        {
          title: "Volume do prisma",
          content: "O volume de um prisma e area da base vezes altura. Se a base tem area 12 e a altura e 5, o volume e 60.",
        },
        {
          title: "Relacao de Euler",
          content: "Em poliedros convexos, vale V - A + F = 2, relacionando vertices, arestas e faces.",
        },
      ],
      activities: [
        {
          question: "Um prisma tem area da base 8 cm² e altura 6 cm. Qual e o volume?",
          choices: ["14 cm³", "24 cm³", "48 cm³", "64 cm³"],
          correctChoice: 2,
          answer: "48 cm³",
          difficulty: "facil",
          explanation: "Volume = area da base x altura = 8 x 6 = 48.",
        },
        {
          question: "Na relacao de Euler, V - A + F e igual a:",
          choices: ["0", "1", "2", "3"],
          correctChoice: 2,
          answer: "2",
          difficulty: "facil",
          explanation: "Para poliedros convexos, V - A + F = 2.",
        },
      ],
      summary: [
        "Solidos geometricos exigem leitura de bases, alturas, faces e volumes.",
        "Poliedros e corpos redondos aparecem em problemas de embalagem, construcao e medida.",
      ],
      mentalMap: ["Poliedros", "Faces", "Arestas", "Vertices", "Prismas", "Volume"],
      flashcards: [
        { front: "Como calcular volume de prisma?", back: "Area da base multiplicada pela altura." },
        { front: "Qual e a relacao de Euler?", back: "V - A + F = 2." },
      ],
    };
  }

  if (title.includes("estatistica")) {
    return {
      examples: [
        {
          title: "Media, mediana e moda",
          content: "Nos dados 2, 3, 3, 8, a media e 4, a mediana e 3 e a moda e 3.",
        },
        {
          title: "Efeito de valor extremo",
          content: "Um valor muito alto pode puxar a media para cima, enquanto a mediana costuma ser mais estavel.",
        },
      ],
      activities: [
        {
          question: "Qual e a media dos valores 4, 6 e 8?",
          choices: ["5", "6", "7", "8"],
          correctChoice: 1,
          answer: "6",
          difficulty: "facil",
          explanation: "(4 + 6 + 8) / 3 = 6.",
        },
        {
          question: "Qual medida representa o valor central de uma lista ordenada?",
          choices: ["Media", "Mediana", "Moda", "Amplitude"],
          correctChoice: 1,
          answer: "Mediana",
          difficulty: "facil",
          explanation: "A mediana ocupa a posicao central dos dados ordenados.",
        },
      ],
      summary: [
        "Media, mediana e moda resumem tendencias de um conjunto de dados.",
        "Dispersao mostra o quanto os dados variam em torno de uma referencia.",
      ],
      mentalMap: ["Media", "Mediana", "Moda", "Amplitude", "Variancia", "Grafico"],
      flashcards: [
        { front: "Quando a mediana e mais segura que a media?", back: "Quando ha valores extremos distorcendo a media." },
        { front: "O que e moda?", back: "O valor que mais se repete." },
      ],
    };
  }

  if (title.includes("combinatoria") || title.includes("probabilidade")) {
    return {
      examples: [
        {
          title: "Principio Fundamental da Contagem",
          content: "Se ha 3 camisetas e 2 calcas, ha 3 x 2 = 6 combinacoes de roupa.",
        },
        {
          title: "Probabilidade simples",
          content: "Ao lancar um dado justo, a chance de sair numero par e 3/6 = 1/2.",
        },
      ],
      activities: [
        {
          question: "Uma senha tem 2 letras e 3 numeros. Se ha 4 opcoes de letra e 5 de numero para cada posicao, quantas senhas existem?",
          choices: ["20", "100", "500", "2500"],
          correctChoice: 3,
          answer: "2500",
          difficulty: "medio",
          explanation: "4 x 4 x 5 x 5 x 5 = 2500.",
        },
        {
          question: "Quando a ordem nao importa, o agrupamento e tratado como:",
          choices: ["permutacao", "arranjo", "combinacao", "fatorial"],
          correctChoice: 2,
          answer: "combinacao",
          difficulty: "facil",
          explanation: "Combinacoes contam escolhas em que a ordem dos elementos nao muda o grupo.",
        },
      ],
      summary: [
        "Contagem exige decidir se escolhas sao independentes e se a ordem importa.",
        "Probabilidade compara eventos favoraveis com o espaco amostral.",
      ],
      mentalMap: ["PFC", "Fatorial", "Permutacao", "Arranjo", "Combinacao", "Probabilidade"],
      flashcards: [
        { front: "Quando usar combinacao?", back: "Quando a ordem dos escolhidos nao importa." },
        { front: "Probabilidade simples e calculada como?", back: "Casos favoraveis divididos pelo total de casos possiveis." },
      ],
    };
  }

  if (title.includes("trigonometria")) {
    return {
      examples: [
        {
          title: "Razoes no triangulo retangulo",
          content: "Seno usa oposto/hipotenusa, cosseno usa adjacente/hipotenusa e tangente usa oposto/adjacente.",
        },
        {
          title: "Ciclo trigonometrico",
          content: "No ciclo, os sinais de seno e cosseno mudam conforme o quadrante do arco.",
        },
      ],
      activities: [
        {
          question: "Em um triangulo retangulo, tangente de um angulo e:",
          choices: ["oposto/hipotenusa", "adjacente/hipotenusa", "oposto/adjacente", "hipotenusa/oposto"],
          correctChoice: 2,
          answer: "oposto/adjacente",
          difficulty: "facil",
          explanation: "Tangente relaciona cateto oposto e cateto adjacente.",
        },
        {
          question: "180 graus correspondem a quantos radianos?",
          choices: ["pi/2", "pi", "2pi", "3pi"],
          correctChoice: 1,
          answer: "pi",
          difficulty: "facil",
          explanation: "Meia volta no ciclo trigonometrico equivale a pi radianos.",
        },
      ],
      summary: [
        "Trigonometria relaciona angulos, lados e comportamento periodico.",
        "O ciclo trigonometrico amplia seno, cosseno e tangente para qualquer arco.",
      ],
      mentalMap: ["Seno", "Cosseno", "Tangente", "Hipotenusa", "Radianos", "Ciclo"],
      flashcards: [
        { front: "Qual e a razao da tangente?", back: "Cateto oposto dividido pelo cateto adjacente." },
        { front: "Quanto vale 180 graus em radianos?", back: "pi radianos." },
      ],
    };
  }

  if (title.includes("matrizes") || title.includes("sistemas lineares")) {
    return {
      examples: [
        {
          title: "Ordem de uma matriz",
          content: "Uma matriz com 2 linhas e 3 colunas tem ordem 2 x 3.",
        },
        {
          title: "Sistema por substituicao",
          content: "Se x + y = 10 e x = 4, entao y = 6.",
        },
      ],
      activities: [
        {
          question: "Uma matriz com 3 linhas e 2 colunas tem ordem:",
          choices: ["2 x 3", "3 x 2", "3 x 3", "2 x 2"],
          correctChoice: 1,
          answer: "3 x 2",
          difficulty: "facil",
          explanation: "A ordem sempre vem como linhas x colunas.",
        },
        {
          question: "No sistema x + y = 12 e x = 5, quanto vale y?",
          choices: ["5", "6", "7", "12"],
          correctChoice: 2,
          answer: "7",
          difficulty: "facil",
          explanation: "Substituindo x por 5: 5 + y = 12, logo y = 7.",
        },
      ],
      summary: [
        "Matrizes organizam informacoes em linhas e colunas.",
        "Sistemas lineares resolvem varias relacoes ao mesmo tempo.",
      ],
      mentalMap: ["Matriz", "Linha", "Coluna", "Determinante", "Sistema", "Incognitas"],
      flashcards: [
        { front: "Como ler a ordem de uma matriz?", back: "Numero de linhas por numero de colunas." },
        { front: "Para que serve um sistema linear?", back: "Para encontrar valores que satisfazem varias equacoes simultaneamente." },
      ],
    };
  }

  if (title.includes("algebra") || title.includes("polinomios")) {
    return {
      examples: [
        {
          title: "Unidade imaginaria",
          content: "Nos numeros complexos, i representa a raiz de -1. Portanto, i² = -1.",
        },
        {
          title: "Raiz de polinomio",
          content: "Se P(2) = 0, entao 2 e raiz do polinomio P(x).",
        },
      ],
      activities: [
        {
          question: "Quanto vale i²?",
          choices: ["-1", "0", "1", "2"],
          correctChoice: 0,
          answer: "-1",
          difficulty: "facil",
          explanation: "A unidade imaginaria e definida por i² = -1.",
        },
        {
          question: "Se P(3) = 0, o numero 3 e:",
          choices: ["coeficiente", "grau", "raiz do polinomio", "termo independente"],
          correctChoice: 2,
          answer: "raiz do polinomio",
          difficulty: "facil",
          explanation: "Um valor que zera o polinomio e chamado de raiz.",
        },
      ],
      summary: [
        "Numeros complexos ampliam a algebra para alem dos reais.",
        "Polinomios sao estudados por grau, coeficientes, operacoes e raizes.",
      ],
      mentalMap: ["Complexos", "i² = -1", "Polinomios", "Grau", "Raizes", "Briot-Ruffini"],
      flashcards: [
        { front: "O que significa P(a) = 0?", back: "Que a e raiz do polinomio P." },
        { front: "Por que usar numeros complexos?", back: "Para representar solucoes que nao existem nos reais." },
      ],
    };
  }

  if (title.includes("funcoes")) {
    return {
      examples: [
        {
          title: "Tabela de valores",
          content: "Para f(x) = 2x + 1, temos f(0) = 1, f(2) = 5 e f(4) = 9. A tabela mostra a relacao entre entrada e saida.",
        },
        {
          title: "Raizes da quadratica",
          content: "Em f(x) = x² - 4, as raizes sao -2 e 2, porque nesses valores a funcao vale zero.",
        },
      ],
      activities: [
        {
          question: "Se f(x) = 3x - 2, quanto vale f(4)?",
          choices: ["8", "10", "12", "14"],
          correctChoice: 1,
          answer: "10",
          difficulty: "facil",
          explanation: "f(4) = 3 x 4 - 2 = 12 - 2 = 10.",
        },
        {
          question: "Na funcao f(x) = 2x + 5, o coeficiente angular e:",
          choices: ["2", "5", "7", "x"],
          correctChoice: 0,
          answer: "2",
          difficulty: "facil",
          explanation: "Na funcao afim f(x) = ax + b, o coeficiente angular e a.",
        },
      ],
      summary: [
        "Funcao relaciona cada entrada do dominio a uma saida.",
        "Graficos ajudam a visualizar crescimento, raizes e comportamento.",
      ],
      mentalMap: ["Dominio", "Imagem", "Lei", "Tabela", "Grafico", "Raiz"],
      flashcards: [
        { front: "O que e dominio?", back: "O conjunto de valores que podem entrar na funcao." },
        { front: "O que e raiz de uma funcao?", back: "O valor de x que faz f(x) = 0." },
      ],
    };
  }

  if (title.includes("geometria")) {
    return {
      examples: [
        {
          title: "Area de figuras planas",
          content: "Retangulo usa base x altura. Triangulo usa base x altura dividido por 2.",
        },
        {
          title: "Teorema de Pitagoras",
          content: "Em um triangulo retangulo com catetos 3 e 4, a hipotenusa vale 5, pois 3² + 4² = 5².",
        },
      ],
      activities: [
        {
          question: "Qual e a area de um retangulo de base 6 e altura 4?",
          choices: ["10", "20", "24", "48"],
          correctChoice: 2,
          answer: "24",
          difficulty: "facil",
          explanation: "Area do retangulo = base x altura = 6 x 4 = 24.",
        },
        {
          question: "Em um triangulo retangulo com catetos 5 e 12, a hipotenusa e:",
          choices: ["13", "15", "17", "25"],
          correctChoice: 0,
          answer: "13",
          difficulty: "medio",
          explanation: "5² + 12² = 25 + 144 = 169, e raiz de 169 e 13.",
        },
      ],
      summary: [
        "Geometria plana usa medidas como area, perimetro, angulo e distancia.",
        "Pitagoras conecta catetos e hipotenusa em triangulos retangulos.",
      ],
      mentalMap: ["Area", "Perimetro", "Triangulo", "Retangulo", "Circulo", "Pitagoras"],
      flashcards: [
        { front: "Area do triangulo?", back: "Base vezes altura dividido por 2." },
        { front: "Quando usar Pitagoras?", back: "Em triangulos retangulos, relacionando catetos e hipotenusa." },
      ],
    };
  }

  return undefined;
}

function enhanceMathModuleContent(content: SubjectModuleContent): SubjectModuleContent {
  const profile = getMathPracticeProfile(normalizeText(content.title));
  if (!profile) return content;

  return {
    ...content,
    examples: [...profile.examples, ...content.examples].slice(0, 6),
    activities: mergeActivities(content.activities, profile.activities),
    review: {
      summary: [...profile.summary, ...(content.review?.summary ?? [])].slice(0, 8),
      mentalMap: Array.from(new Set([...(content.review?.mentalMap ?? []), ...profile.mentalMap])).slice(0, 8),
      flashcards: [...profile.flashcards, ...(content.review?.flashcards ?? [])].slice(0, 8),
    },
  };
}

function getPortugueseCurriculumPracticeProfile(title: string): ModulePracticeProfile | undefined {
  if (title.includes("base") || title.includes("compreensao textual")) {
    return {
      examples: [
        {
          title: "Leitura em duas camadas",
          content: "Primeiro identifique genero, tema e finalidade. Depois volte ao texto para marcar conectivos, palavras-chave e efeitos de sentido.",
        },
        {
          title: "Sentido literal e figurado",
          content: "Em 'a noticia correu pela cidade', a noticia nao corre de verdade: o verbo cria sentido figurado para indicar circulacao rapida da informacao.",
        },
      ],
      activities: [
        {
          question: "Em uma noticia, a finalidade principal costuma ser:",
          choices: [
            "Defender uma tese pessoal com argumentos.",
            "Informar um fato de interesse publico com clareza.",
            "Criar versos com musicalidade.",
            "Narrar uma historia ficticia com conflito.",
          ],
          correctChoice: 1,
          answer: "Informar um fato de interesse publico com clareza.",
          difficulty: "facil",
          explanation: "A noticia prioriza informacao, contexto, dados essenciais e linguagem direta.",
        },
        {
          question: "Qual frase apresenta sentido conotativo?",
          choices: [
            "A porta da sala esta aberta.",
            "O aluno entregou o resumo.",
            "A noticia correu pela escola.",
            "O livro ficou sobre a mesa.",
          ],
          correctChoice: 2,
          answer: "A noticia correu pela escola.",
          difficulty: "facil",
          explanation: "O verbo 'correu' foi usado em sentido figurado, indicando que a noticia se espalhou rapidamente.",
        },
        {
          question: "Escreva um resumo de 3 linhas para um texto informativo. O que nao pode faltar?",
          answer: "Tema central, informacoes principais e ausencia de opiniao pessoal nao sustentada pelo texto.",
          difficulty: "medio",
          explanation: "Resumo eficiente preserva o essencial e corta exemplos, repeticoes e comentarios pessoais.",
          rubric: [
            {
              label: "Identifica o tema",
              accepted: ["tema", "assunto", "ideia principal"],
              feedback: "Mostre qual e o assunto central do texto.",
            },
            {
              label: "Evita opiniao pessoal",
              accepted: ["sem opiniao", "objetivo", "texto"],
              feedback: "Resumo nao deve trocar a ideia do autor pela sua opiniao.",
            },
          ],
        },
      ],
      summary: [
        "Gêneros textuais possuem finalidade, estrutura e linguagem próprias.",
        "Denotação é sentido literal; conotação é sentido figurado.",
        "Resumo exige seleção das ideias centrais, sem opinião solta.",
      ],
      mentalMap: ["Genero", "Finalidade", "Tema", "Pistas", "Sentido", "Resumo"],
      flashcards: [
        { front: "O que observar primeiro em um texto?", back: "Genero, finalidade, tema e comando da questao." },
        { front: "Qual a diferenca entre denotacao e conotacao?", back: "Denotacao e sentido literal; conotacao e sentido figurado." },
      ],
    };
  }

  if (title.includes("argumentacao") || title.includes("aprofundamento")) {
    return {
      examples: [
        {
          title: "Tese e argumento",
          content: "Tese e a posicao defendida. Argumento e a justificativa que sustenta essa posicao com dados, exemplos, causa, consequencia ou autoridade.",
        },
        {
          title: "Coesao entre ideias",
          content: "Conectivos como 'portanto', 'alem disso' e 'por outro lado' orientam o leitor e deixam clara a relacao entre as partes do texto.",
        },
      ],
      activities: [
        {
          question: "Em um texto dissertativo-argumentativo, a tese e:",
          choices: [
            "A frase que apresenta a posicao defendida.",
            "A conclusao sem relacao com o tema.",
            "Uma citacao decorativa.",
            "A lista de palavras dificeis do texto.",
          ],
          correctChoice: 0,
          answer: "A frase que apresenta a posicao defendida.",
          difficulty: "facil",
          explanation: "A tese orienta os argumentos e define o ponto de vista que sera defendido.",
        },
        {
          question: "Qual conectivo indica conclusao?",
          choices: ["alem disso", "por exemplo", "portanto", "embora"],
          correctChoice: 2,
          answer: "portanto",
          difficulty: "facil",
          explanation: "'Portanto' sinaliza fechamento logico ou consequencia da ideia anterior.",
        },
        {
          question: "Monte um argumento curto para defender mais leitura nas escolas.",
          answer: "A resposta deve conter uma tese clara e uma justificativa conectada a aprendizagem, repertorio ou cidadania.",
          difficulty: "medio",
          explanation: "Argumentar nao e apenas opinar; e justificar a posicao com relacao logica.",
          rubric: [
            {
              label: "Apresenta tese",
              accepted: ["defendo", "e importante", "deve", "precisa"],
              feedback: "Deixe clara a posicao defendida.",
            },
            {
              label: "Justifica a tese",
              accepted: ["porque", "pois", "ja que", "uma vez que"],
              feedback: "Inclua uma justificativa, nao apenas uma frase opinativa.",
            },
          ],
        },
      ],
      summary: [
        "Argumentacao combina tese, justificativa e progressao logica.",
        "Coesao liga frases e paragrafos; coerencia garante sentido global.",
        "Concordancia, regencia e colocacao ajudam a manter clareza formal.",
      ],
      mentalMap: ["Tese", "Argumento", "Conectivos", "Coesao", "Coerencia", "Repertorio"],
      flashcards: [
        { front: "O que e tese?", back: "A posicao que o texto defende." },
        { front: "Para que servem conectivos?", back: "Para mostrar relacoes de adicao, oposicao, causa, conclusao e exemplo." },
      ],
    };
  }

  if (title.includes("literatura") || title.includes("revisao")) {
    return {
      examples: [
        {
          title: "Variação linguística sem preconceito",
          content: "Uma fala regional pode fugir da norma-padrao e ainda assim ser adequada ao contexto, ao grupo social e a finalidade comunicativa.",
        },
        {
          title: "Proposta de intervenção no ENEM",
          content: "Uma boa proposta indica agente, acao, meio, finalidade e detalhamento, sempre respeitando direitos humanos.",
        },
      ],
      activities: [
        {
          question: "Em questoes de variacao linguistica, a postura adequada e:",
          choices: [
            "Tratar toda fala popular como erro absoluto.",
            "Reconhecer variedades e adequacao ao contexto.",
            "Eliminar marcas regionais de qualquer texto.",
            "Substituir literatura por gramatica normativa.",
          ],
          correctChoice: 1,
          answer: "Reconhecer variedades e adequacao ao contexto.",
          difficulty: "facil",
          explanation: "A variacao linguistica deve ser analisada sem preconceito, observando contexto, finalidade e interlocutores.",
        },
        {
          question: "Qual item nao pode faltar em uma proposta de intervencao completa?",
          choices: ["Agente", "Acao", "Finalidade", "Titulo rimado"],
          correctChoice: 3,
          answer: "Titulo rimado",
          difficulty: "facil",
          explanation: "Titulo rimado nao e exigencia. Agente, acao, meio, finalidade e detalhamento sao elementos relevantes.",
        },
        {
          question: "Explique como repertorio sociocultural pode fortalecer uma redacao.",
          answer: "O repertorio fortalece a argumentacao quando e pertinente ao tema e conectado ao ponto defendido.",
          difficulty: "medio",
          explanation: "Repertorio nao deve aparecer como enfeite: precisa sustentar o argumento.",
          rubric: [
            {
              label: "Relaciona repertorio ao tema",
              accepted: ["tema", "pertinente", "relacao", "conecta"],
              feedback: "Explique a conexao entre repertorio e tema.",
            },
            {
              label: "Mostra funcao argumentativa",
              accepted: ["argumento", "defende", "justifica", "tese"],
              feedback: "Mostre como o repertorio ajuda a defender a tese.",
            },
          ],
        },
      ],
      summary: [
        "Literatura deve ser lida por contexto historico, linguagem e projeto estetico.",
        "Variacao linguistica exige adequacao, nao preconceito.",
        "Redacao ENEM combina tese, argumentos e proposta de intervencao detalhada.",
      ],
      mentalMap: ["Literatura", "Contexto", "Variação", "Redação", "Repertório", "Intervenção"],
      flashcards: [
        { front: "O que torna um repertorio produtivo?", back: "Pertinencia ao tema e conexao clara com a tese." },
        { front: "O que analisar em movimentos literarios?", back: "Contexto, linguagem, temas, autores e ruptura estetica." },
      ],
    };
  }

  return undefined;
}

function enhancePortugueseCurriculumModuleContent(content: SubjectModuleContent): SubjectModuleContent {
  const profile = getPortugueseCurriculumPracticeProfile(normalizeText(content.title));
  if (!profile) return content;

  return {
    ...content,
    examples: [...profile.examples, ...content.examples].slice(0, 6),
    activities: mergeActivities(content.activities, profile.activities),
    review: {
      summary: [...profile.summary, ...(content.review?.summary ?? [])].slice(0, 8),
      mentalMap: Array.from(new Set([...(content.review?.mentalMap ?? []), ...profile.mentalMap])).slice(0, 8),
      flashcards: [...profile.flashcards, ...(content.review?.flashcards ?? [])].slice(0, 8),
    },
  };
}

function buildPortugueseCurriculumModules(): SubjectModuleContent[] {
  return [
    createCurriculumModule({
      title: "1ª Série: Leitura, Gêneros e Interpretação",
      objective: "Construir base de leitura crítica em diferentes gêneros textuais.",
      overview: "A 1ª série começa pela leitura interpretativa, pela finalidade dos gêneros e pela relação entre linguagem, público e efeito de sentido.",
      topics: [
        {
          title: "Leitura e interpretação",
          description: "Identificação de tema, finalidade, público, ponto de vista, informações explícitas e inferências.",
        },
        {
          title: "Gêneros textuais",
          description: "Contos, crônicas, notícias, reportagens, artigos, poemas, tirinhas e textos digitais, com atenção à função social de cada gênero.",
        },
        {
          title: "Denotação, conotação e efeitos de sentido",
          description: "Diferença entre sentido literal e figurado, escolha vocabular, ironia, humor e ambiguidade inicial.",
        },
        {
          title: "Intertextualidade",
          description: "Relações entre textos, repertórios culturais, citações, paródias e referências usadas para construir novos sentidos.",
        },
      ],
      activityPrompt: "Qual é a primeira habilidade de leitura a desenvolver na 1ª série?",
      activityAnswer: "Reconhecer gênero, finalidade, tema e pistas textuais antes de responder.",
    }),
    createCurriculumModule({
      title: "1ª Série: Textualidade e Funções da Linguagem",
      objective: "Entender como textos produzem sentido por organização, intenção e contexto.",
      overview: "Esta unidade aprofunda fatores de textualidade, funções da linguagem e elementos que tornam um texto compreensível e adequado.",
      topics: [
        {
          title: "Funções da linguagem",
          description: "Funções referencial, emotiva, conativa, fática, metalinguística e poética em textos verbais e multissemióticos.",
        },
        {
          title: "Fatores de textualidade",
          description: "Coerência, coesão, informatividade, intencionalidade, aceitabilidade, situacionalidade e intertextualidade.",
        },
        {
          title: "Coesão referencial e sequencial",
          description: "Retomadas por pronomes, sinônimos, elipses, repetições controladas e conectivos.",
        },
        {
          title: "Variação linguística",
          description: "Variedades regionais, sociais e situacionais, adequação ao contexto e combate ao preconceito linguístico.",
        },
      ],
      activityPrompt: "Para que servem as funções da linguagem?",
      activityAnswer: "Para reconhecer a intenção comunicativa predominante e o efeito criado no texto.",
    }),
    createCurriculumModule({
      title: "1ª Série: Morfologia, Léxico e Semântica",
      objective: "Dominar a estrutura das palavras e os sentidos produzidos pelas escolhas vocabulares.",
      overview: "A unidade trabalha fonética, ortografia, formação de palavras, classes gramaticais e relações semânticas usadas na leitura e na escrita.",
      topics: [
        {
          title: "Fonética, ortografia, acentuação e crase",
          description: "Sons da fala, escrita formal, regras de acentuação, emprego da crase e dúvidas recorrentes.",
        },
        {
          title: "Estrutura e formação de palavras",
          description: "Radical, afixos, vogal temática, composição, derivação e neologismos.",
        },
        {
          title: "Classes de palavras",
          description: "Substantivo, adjetivo, verbo, advérbio, pronome, artigo, numeral, preposição, conjunção e interjeição em uso.",
        },
        {
          title: "Relações semânticas",
          description: "Sinonímia, antonímia, polissemia, homonímia, campo lexical e seleção vocabular.",
        },
      ],
      activityPrompt: "Por que estudar morfologia junto com leitura?",
      activityAnswer: "Porque a forma das palavras ajuda a interpretar sentidos, relações e efeitos no texto.",
    }),
    createCurriculumModule({
      title: "1ª Série: Sintaxe e Produção Textual Inicial",
      objective: "Relacionar estrutura da frase, clareza e produção de textos curtos.",
      overview: "A unidade apresenta sintaxe inicial, período composto e técnicas de resumo, narração e descrição.",
      topics: [
        {
          title: "Termos da oração",
          description: "Sujeito, predicado, complementos verbais, adjuntos, predicativo, aposto e vocativo.",
        },
        {
          title: "Orações coordenadas e subordinadas",
          description: "Relações entre orações, conectivos, coordenação, subordinação substantiva, adjetiva e adverbial.",
        },
        {
          title: "Pontuação e organização do período",
          description: "Uso de vírgula, ponto, dois-pontos, travessão e pontuação como recurso de clareza.",
        },
        {
          title: "Resumo, narração e descrição",
          description: "Técnicas para sintetizar ideias, organizar fatos, construir personagens, espaços e cenas.",
        },
      ],
      activityPrompt: "Qual é a função da sintaxe na produção textual?",
      activityAnswer: "Organizar relações entre termos e orações para dar clareza ao texto.",
    }),
    createCurriculumModule({
      title: "1ª Série: Literatura - Origens ao Arcadismo",
      objective: "Compreender a formação da literatura em língua portuguesa e seus primeiros movimentos.",
      overview: "A unidade organiza o percurso literário inicial, relacionando contexto histórico, estética e temas recorrentes.",
      topics: [
        {
          title: "Trovadorismo e Humanismo",
          description: "Cantigas, teatro vicentino, visão medieval, transição cultural e marcas da oralidade.",
        },
        {
          title: "Classicismo e Quinhentismo",
          description: "Humanismo renascentista, medida nova, literatura de informação e literatura de catequese no Brasil.",
        },
        {
          title: "Barroco",
          description: "Conflito, contrastes, conceptismo, cultismo, religiosidade e crítica social.",
        },
        {
          title: "Arcadismo",
          description: "Ideal de simplicidade, bucolismo, razão, pastoralismo e contexto do Brasil colonial.",
        },
      ],
      activityPrompt: "Como estudar literatura sem decorar movimentos?",
      activityAnswer: "Relacionando contexto histórico, linguagem, temas e efeitos estéticos de cada período.",
    }),
    createCurriculumModule({
      title: "2ª Série: Argumentação e Textos de Opinião",
      objective: "Aprofundar leitura crítica e construção de posicionamento argumentativo.",
      overview: "A 2ª série intensifica análise de opinião, estratégias de persuasão, tese e repertório.",
      topics: [
        {
          title: "Artigo de opinião, editorial e carta aberta",
          description: "Tese, argumentos, contra-argumentos, público-alvo, autoria e circulação social.",
        },
        {
          title: "Coesão e coerência",
          description: "Progressão temática, conectores argumentativos, retomadas e encadeamento lógico.",
        },
        {
          title: "Figuras de linguagem",
          description: "Metáfora, metonímia, ironia, antítese, hipérbole e efeitos na argumentação.",
        },
        {
          title: "Dissertação, tese e repertório",
          description: "Estrutura do texto argumentativo, seleção de repertório e desenvolvimento de parágrafos.",
        },
      ],
      activityPrompt: "Qual é o centro de um texto argumentativo?",
      activityAnswer: "A tese defendida e os argumentos usados para sustentá-la.",
    }),
    createCurriculumModule({
      title: "2ª Série: Mídias, Publicidade e Multissemiose",
      objective: "Ler textos que combinam palavra, imagem, som, layout e recursos digitais.",
      overview: "A unidade trabalha campanhas, anúncios, memes, infográficos, charges e outros textos de circulação social.",
      topics: [
        {
          title: "Textos publicitários e campanhas",
          description: "Persuasão, slogan, imagem, público-alvo, valores sociais e estratégias de convencimento.",
        },
        {
          title: "Textos multissemióticos",
          description: "Relação entre linguagem verbal, imagem, cor, diagramação, ícones, gráficos e efeitos de sentido.",
        },
        {
          title: "Charge, cartum, meme e tirinha",
          description: "Humor, crítica social, intertextualidade, contexto histórico e inferência.",
        },
        {
          title: "Leitura de dados e infográficos",
          description: "Interpretação de tabelas, gráficos, legendas, fontes e escolhas visuais.",
        },
      ],
      activityPrompt: "O que muda ao ler um texto multissemiótico?",
      activityAnswer: "A resposta precisa considerar palavra, imagem, layout e contexto juntos.",
    }),
    createCurriculumModule({
      title: "2ª Série: Análise Linguística e Norma-Padrão",
      objective: "Aprofundar recursos gramaticais usados para clareza, adequação e estilo.",
      overview: "A unidade organiza concordância, regência, pronomes e pontuação em situações reais de leitura e escrita.",
      topics: [
        {
          title: "Concordância verbal e nominal",
          description: "Relações entre sujeito, verbo, nomes e determinantes em contextos simples e complexos.",
        },
        {
          title: "Regência verbal e nominal",
          description: "Complementos, preposições exigidas, transitividade e efeitos de sentido.",
        },
        {
          title: "Colocação pronominal",
          description: "Próclise, mesóclise, ênclise, adequação formal e uso em textos literários.",
        },
        {
          title: "Pontuação e paralelismo",
          description: "Pontuação como organização sintática, paralelismo, clareza e estilo.",
        },
      ],
      activityPrompt: "Por que norma-padrão deve ser estudada em contexto?",
      activityAnswer: "Porque a regra faz sentido quando melhora clareza, adequação e efeito do texto.",
    }),
    createCurriculumModule({
      title: "2ª Série: Textos Oficiais, Normativos e Vida Pública",
      objective: "Compreender gêneros usados em participação social, cidadania e comunicação institucional.",
      overview: "A unidade trabalha textos de circulação pública e sua relação com direitos, deveres e linguagem formal.",
      topics: [
        {
          title: "Textos legais e normativos",
          description: "Leitura de leis, estatutos, regulamentos, editais e documentos orientadores.",
        },
        {
          title: "Requerimento, ofício e e-mail formal",
          description: "Estrutura, vocativo, objetividade, adequação linguística e finalidade institucional.",
        },
        {
          title: "Debate, seminário e apresentação oral",
          description: "Argumentação oral, escuta ativa, organização de fala e uso de evidências.",
        },
        {
          title: "Pesquisa e citação",
          description: "Seleção de fontes, paráfrase, citação, autoria e ética no uso da informação.",
        },
      ],
      activityPrompt: "Qual é a marca principal de textos oficiais?",
      activityAnswer: "Clareza, objetividade, finalidade definida e adequação à situação institucional.",
    }),
    createCurriculumModule({
      title: "2ª Série: Literatura - Romantismo ao Simbolismo",
      objective: "Aprofundar literatura brasileira e portuguesa dos séculos XIX e início do XX.",
      overview: "A unidade relaciona movimentos literários a contexto histórico, estética, autoria e temas sociais.",
      topics: [
        {
          title: "Romantismo",
          description: "Nacionalismo, subjetividade, idealização, indianismo, romance urbano e poesia romântica.",
        },
        {
          title: "Realismo e Naturalismo",
          description: "Crítica social, objetividade, determinismo, análise psicológica e denúncia de problemas sociais.",
        },
        {
          title: "Parnasianismo",
          description: "Formalismo, rigor métrico, impessoalidade, culto à forma e linguagem trabalhada.",
        },
        {
          title: "Simbolismo",
          description: "Musicalidade, sugestão, subjetividade, espiritualidade, sinestesia e imagens simbólicas.",
        },
      ],
      activityPrompt: "Como diferenciar Realismo e Romantismo?",
      activityAnswer: "Romantismo tende à idealização; Realismo analisa a sociedade de forma crítica e menos idealizada.",
    }),
    createCurriculumModule({
      title: "3ª Série: Revisão de Leitura e Análise Linguística",
      objective: "Consolidar leitura crítica e análise linguística para ENEM, vestibulares e vida social.",
      overview: "A 3ª série retoma habilidades centrais com foco em autonomia, resolução de questões e escrita formal.",
      topics: [
        {
          title: "Ambiguidade e semântica",
          description: "Polissemia, pressupostos, subentendidos, modalização, implícitos e efeitos de sentido.",
        },
        {
          title: "Sintaxe do período composto",
          description: "Coordenação, subordinação e relações lógico-discursivas entre orações.",
        },
        {
          title: "Variação linguística",
          description: "Variedades regionais, sociais, históricas e situacionais, adequação e preconceito linguístico.",
        },
        {
          title: "Revisão gramatical aplicada",
          description: "Concordância, regência, crase, colocação pronominal e pontuação em situações de prova.",
        },
      ],
      activityPrompt: "Qual é a melhor forma de revisar gramática no 3º ano?",
      activityAnswer: "Aplicando regras em leitura, produção textual e questões contextualizadas.",
    }),
    createCurriculumModule({
      title: "3ª Série: Redação Modelo ENEM",
      objective: "Construir redações dissertativo-argumentativas completas e bem avaliadas.",
      overview: "A unidade trabalha competências da redação ENEM, repertório, argumentação e proposta de intervenção.",
      topics: [
        {
          title: "Introdução e tese",
          description: "Contextualização do tema, recorte do problema e apresentação clara do ponto de vista.",
        },
        {
          title: "Desenvolvimento argumentativo",
          description: "Tópico frasal, explicação, repertório produtivo, análise crítica e progressão lógica.",
        },
        {
          title: "Coesão e projeto de texto",
          description: "Conectivos, retomadas, organização de parágrafos e articulação entre ideias.",
        },
        {
          title: "Proposta de intervenção",
          description: "Agente, ação, meio, finalidade, detalhamento e respeito aos direitos humanos.",
        },
      ],
      activityPrompt: "O que torna uma proposta de intervenção completa?",
      activityAnswer: "Apresentar agente, ação, meio, finalidade e detalhamento de forma concreta.",
    }),
    createCurriculumModule({
      title: "3ª Série: Literatura - Modernismo e Contemporaneidade",
      objective: "Revisar literatura brasileira moderna e contemporânea com foco interpretativo.",
      overview: "A unidade trabalha Pré-Modernismo, Modernismo, produção contemporânea e análise de obras.",
      topics: [
        {
          title: "Pré-Modernismo",
          description: "Contradições sociais, regionalismo, crítica ao Brasil oficial e transição estética.",
        },
        {
          title: "Modernismo",
          description: "Ruptura estética, Semana de 1922, nacionalismo crítico, linguagem coloquial e experimentação.",
        },
        {
          title: "Literatura contemporânea",
          description: "Pluralidade de vozes, periferias, identidades, memória, oralidade e novas formas de publicação.",
        },
        {
          title: "Análise de obras e poemas",
          description: "Narrador, eu lírico, tempo, espaço, personagens, imagens poéticas e contexto de produção.",
        },
      ],
      activityPrompt: "Qual é uma marca forte do Modernismo?",
      activityAnswer: "Ruptura estética e busca por uma linguagem brasileira mais livre e crítica.",
    }),
    createCurriculumModule({
      title: "3ª Série: Gêneros Digitais, Pesquisa e Mundo do Trabalho",
      objective: "Usar a linguagem em contextos digitais, acadêmicos e profissionais.",
      overview: "A unidade aproxima leitura, escrita, tecnologia, autoria e comunicação no mundo do trabalho.",
      topics: [
        {
          title: "Gêneros digitais",
          description: "Post, comentário, thread, podcast, roteiro, vídeo curto, newsletter e curadoria de conteúdo.",
        },
        {
          title: "Comunicação profissional",
          description: "Currículo, carta de apresentação, e-mail formal, portfólio, entrevista e clareza objetiva.",
        },
        {
          title: "Pesquisa, autoria e fontes",
          description: "Busca, seleção, confiabilidade, citação, paráfrase, plágio e uso ético de informações.",
        },
        {
          title: "Apresentação oral e projeto de vida",
          description: "Organização de fala, síntese, argumentação, postura e adequação ao público.",
        },
      ],
      activityPrompt: "Por que gêneros digitais entram no estudo de Português?",
      activityAnswer: "Porque hoje leitura, escrita, autoria e circulação de textos também acontecem em ambientes digitais.",
    }),
    createCurriculumModule({
      title: "3ª Série: Revisão ENEM e Repertório Sociocultural",
      objective: "Consolidar estratégias de prova, repertório e resolução de questões de Linguagens.",
      overview: "A unidade fecha o ciclo com revisão ativa, leitura de comandos, repertórios e treino de habilidades cobradas no ENEM.",
      topics: [
        {
          title: "Comandos de questão",
          description: "Identificação do que a questão pede: função, efeito, crítica, comparação, inferência ou finalidade.",
        },
        {
          title: "Estratégias de eliminação",
          description: "Reconhecimento de alternativas exageradas, deslocadas, contraditórias ou sem apoio textual.",
        },
        {
          title: "Repertório sociocultural",
          description: "Uso produtivo de história, literatura, cinema, dados, filosofia, sociologia e atualidades.",
        },
        {
          title: "Simulados e revisão de erros",
          description: "Correção ativa, registro de padrões de erro e retomada dos conteúdos mais frágeis.",
        },
      ],
      activityPrompt: "Qual é o erro mais comum em questões de Linguagens?",
      activityAnswer: "Responder pelo tema geral ou opinião pessoal sem observar exatamente o comando e o texto.",
    }),
  ].map(enhancePortugueseCurriculumModuleContent);
}

function buildMathCurriculumModules(): SubjectModuleContent[] {
  return [
    createCurriculumModule({
      title: "1º Ano: Conjuntos Numéricos",
      objective: "Compreender os conjuntos numéricos e representar intervalos na reta real.",
      overview: "Este módulo faz a transição da aritmética para a álgebra, consolidando Naturais, Inteiros, Racionais, Irracionais e Reais.",
      topics: [
        { title: "Naturais, Inteiros e Racionais", description: "Classificação dos números, operações e leitura de situações envolvendo contagem, saldo e frações." },
        { title: "Irracionais e Reais", description: "Reconhecimento de números não periódicos, raízes não exatas e organização do conjunto dos reais." },
        { title: "Intervalos numéricos", description: "Representação por desigualdades, notação de intervalo e leitura na reta real." },
      ],
      activityPrompt: "O que este módulo precisa garantir antes do estudo de funções?",
      activityAnswer: "Domínio dos conjuntos numéricos e da representação de intervalos reais.",
    }),
    createCurriculumModule({
      title: "1º Ano: Funções",
      objective: "Estudar domínio, contradomínio, imagem e funções afins e quadráticas.",
      overview: "Funções são o tema central do 1º ano e conectam álgebra, gráficos e interpretação de problemas.",
      topics: [
        { title: "Conceito de função", description: "Relação entre variáveis, domínio, contradomínio, imagem e representação por tabela, lei e gráfico." },
        { title: "Função afim", description: "Estudo da função do 1º grau, coeficientes, raiz, crescimento, decrescimento e gráfico." },
        { title: "Função quadrática", description: "Parábola, raízes, vértice, concavidade, valor máximo ou mínimo e aplicações." },
      ],
      activityPrompt: "Qual é o principal objetivo do estudo de funções no 1º ano?",
      activityAnswer: "Interpretar relações entre grandezas por leis, tabelas e gráficos.",
    }),
    createCurriculumModule({
      title: "1º Ano: Matemática Financeira",
      objective: "Aplicar porcentagem, razão, proporção e juros simples e compostos.",
      overview: "A matemática financeira aproxima cálculo algébrico de situações reais de consumo, desconto, investimento e dívida.",
      topics: [
        { title: "Porcentagem", description: "Cálculo de aumentos, descontos, taxas e comparação entre valores." },
        { title: "Razão e proporção", description: "Relações proporcionais, escalas, regra de três e leitura de grandezas." },
        { title: "Juros simples e compostos", description: "Diferença entre crescimento linear e exponencial, montante, capital, taxa e tempo." },
      ],
      activityPrompt: "Por que juros compostos exigem atenção especial?",
      activityAnswer: "Porque representam crescimento acumulado e podem aparecer em gráficos e problemas contextualizados.",
    }),
    createCurriculumModule({
      title: "1º Ano: Equações e Inequações",
      objective: "Resolver e representar equações, inequações e modelos modulares, exponenciais e logarítmicos.",
      overview: "Este módulo consolida técnicas algébricas para encontrar valores, comparar expressões e interpretar restrições.",
      topics: [
        { title: "Equações e inequações", description: "Resolução algébrica e representação de soluções na reta ou no plano." },
        { title: "Função modular", description: "Módulo como distância, análise por casos e interpretação gráfica." },
        { title: "Exponenciais e logaritmos", description: "Crescimento, decaimento, propriedades e leitura de situações envolvendo potência e escala." },
      ],
      activityPrompt: "O que diferencia uma inequação de uma equação?",
      activityAnswer: "A inequação compara expressões e pode gerar intervalos de solução.",
    }),
    createCurriculumModule({
      title: "1º Ano: Progressões",
      objective: "Reconhecer sequências, Progressão Aritmética e Progressão Geométrica.",
      overview: "Progressões treinam percepção de padrões e servem para problemas de crescimento linear e multiplicativo.",
      topics: [
        { title: "Sequências", description: "Identificação de padrões, termo geral e relações entre termos." },
        { title: "Progressão Aritmética", description: "Razão constante, termo geral, soma dos termos e aplicações." },
        { title: "Progressão Geométrica", description: "Razão multiplicativa, termo geral, soma e crescimento exponencial." },
      ],
      activityPrompt: "Qual é a diferença central entre P.A. e P.G.?",
      activityAnswer: "Na P.A. a variação é por soma constante; na P.G. é por multiplicação constante.",
    }),
    createCurriculumModule({
      title: "1º Ano: Geometria e Trigonometria",
      objective: "Revisar áreas, perímetros e razões trigonométricas no triângulo retângulo.",
      overview: "O módulo conecta medidas geométricas e trigonometria básica para resolver problemas espaciais.",
      topics: [
        { title: "Áreas e perímetros", description: "Revisão de figuras planas, decomposição e comparação de medidas." },
        { title: "Triângulo retângulo", description: "Relações métricas, Teorema de Pitágoras e interpretação de catetos e hipotenusa." },
        { title: "Seno, cosseno e tangente", description: "Razões trigonométricas básicas e aplicação em problemas de altura, distância e inclinação." },
      ],
      activityPrompt: "Quando usar seno, cosseno ou tangente?",
      activityAnswer: "Quando o problema envolve ângulo e lados de um triângulo retângulo.",
    }),
    createCurriculumModule({
      title: "2º Ano: Trigonometria",
      objective: "Aprofundar ângulos, ciclo trigonométrico, funções e leis trigonométricas.",
      overview: "A trigonometria do 2º ano amplia o triângulo retângulo para arcos, funções, gráficos e relações gerais.",
      topics: [
        { title: "Razões trigonométricas e Pitágoras", description: "Revisão aplicada de seno, cosseno, tangente e triângulo retângulo." },
        { title: "Ciclo trigonométrico", description: "Graus, radianos, quadrantes, sinais e redução ao primeiro quadrante." },
        { title: "Funções trigonométricas", description: "Gráficos de seno, cosseno e tangente, período, amplitude e comportamento." },
        { title: "Leis dos senos e cossenos", description: "Resolução de triângulos quaisquer e problemas de medida indireta." },
      ],
      activityPrompt: "O que o ciclo trigonométrico permite estudar?",
      activityAnswer: "Ângulos, sinais, arcos e funções trigonométricas além do triângulo retângulo.",
    }),
    createCurriculumModule({
      title: "2º Ano: Matrizes e Sistemas Lineares",
      objective: "Operar matrizes, calcular determinantes e resolver sistemas lineares.",
      overview: "Matrizes organizam dados e sistemas lineares modelam problemas com várias incógnitas.",
      topics: [
        { title: "Matrizes", description: "Definição, ordem, tipos e operações de adição, subtração e multiplicação." },
        { title: "Determinantes", description: "Cálculo de determinantes 2x2 e 3x3, propriedades e interpretação." },
        { title: "Sistemas lineares", description: "Classificação e resolução por Cramer, substituição, adição e escalonamento." },
      ],
      activityPrompt: "Para que servem sistemas lineares?",
      activityAnswer: "Para resolver situações com várias relações e incógnitas ao mesmo tempo.",
    }),
    createCurriculumModule({
      title: "2º Ano: Análise Combinatória e Probabilidade",
      objective: "Desenvolver contagem, agrupamentos e cálculo de chances.",
      overview: "O módulo treina raciocínio lógico para contar possibilidades e interpretar eventos.",
      topics: [
        { title: "Princípio Fundamental da Contagem", description: "Multiplicação de escolhas independentes e construção de árvores de possibilidades." },
        { title: "Fatorial, permutação, arranjo e combinação", description: "Diferença entre ordenar todos, ordenar parte e escolher sem importar a ordem." },
        { title: "Binômio de Newton", description: "Números binomiais e desenvolvimento de potências de binômios." },
        { title: "Probabilidade", description: "Espaço amostral, eventos, complementares, união, interseção e probabilidade condicional." },
      ],
      activityPrompt: "Quando usar combinação em vez de arranjo?",
      activityAnswer: "Quando a ordem dos elementos escolhidos não muda o resultado.",
    }),
    createCurriculumModule({
      title: "2º Ano: Geometria Espacial",
      objective: "Estudar sólidos geométricos, áreas de superfície e volumes.",
      overview: "Geometria espacial passa das figuras planas para prismas, pirâmides, cilindros, cones, esferas e poliedros.",
      topics: [
        { title: "Poliedros e Relação de Euler", description: "Faces, arestas, vértices e aplicação de V - A + F = 2." },
        { title: "Prismas e pirâmides", description: "Área lateral, área total, volume e leitura de planificações." },
        { title: "Cilindros, cones e esferas", description: "Corpos redondos, seções, áreas e volumes em problemas práticos." },
      ],
      activityPrompt: "Qual é a mudança principal da geometria plana para a espacial?",
      activityAnswer: "A análise passa a considerar profundidade, superfície e volume.",
    }),
    createCurriculumModule({
      title: "3º Ano: Geometria Analítica",
      objective: "Estudar ponto, reta e circunferência no plano cartesiano.",
      overview: "Geometria analítica une álgebra e geometria para representar figuras por equações.",
      topics: [
        { title: "Estudo do ponto", description: "Coordenadas cartesianas, distância entre dois pontos e ponto médio." },
        { title: "Estudo da reta", description: "Equações geral, reduzida e fundamental, paralelismo, perpendicularismo e área de triângulos." },
        { title: "Circunferência", description: "Equação reduzida, equação geral, centro, raio e interpretação gráfica." },
      ],
      activityPrompt: "Qual é a ideia central da geometria analítica?",
      activityAnswer: "Representar objetos geométricos por coordenadas e equações.",
    }),
    createCurriculumModule({
      title: "3º Ano: Matemática Financeira",
      objective: "Revisar razões, porcentagens, juros simples e compostos em contexto de prova.",
      overview: "No 3º ano, matemática financeira volta com foco em leitura crítica, tabelas, gráficos e problemas do ENEM.",
      topics: [
        { title: "Razões e proporções", description: "Escalas, densidade demográfica, velocidade média e relações entre grandezas." },
        { title: "Porcentagem", description: "Aumentos, descontos sucessivos, taxa percentual e comparação de valores." },
        { title: "Juros simples e compostos", description: "Montante, capital, taxa, tempo e diferença entre crescimento linear e exponencial." },
      ],
      activityPrompt: "Por que revisar matemática financeira no 3º ano?",
      activityAnswer: "Porque ela aparece em situações reais, gráficos e problemas contextualizados de prova.",
    }),
    createCurriculumModule({
      title: "3º Ano: Estatística",
      objective: "Interpretar dados, medidas de tendência central e dispersão.",
      overview: "Estatística prepara o aluno para ler dados com criticidade e resolver questões de tabelas e gráficos.",
      topics: [
        { title: "Média, mediana e moda", description: "Medidas de tendência central e escolha da medida adequada ao contexto." },
        { title: "Dispersão", description: "Desvio médio, variância, desvio padrão e comparação de regularidade entre conjuntos." },
        { title: "Gráficos e tabelas", description: "Frequência absoluta, frequência relativa, histogramas e análise crítica de dados." },
      ],
      activityPrompt: "O que a mediana ajuda a perceber?",
      activityAnswer: "O valor central dos dados, especialmente quando há valores extremos.",
    }),
    createCurriculumModule({
      title: "3º Ano: Análise Combinatória e Probabilidade",
      objective: "Revisar contagem e probabilidade com foco em vestibulares e ENEM.",
      overview: "Este módulo retoma técnicas de contagem e aprofunda eventos condicionais e compostos.",
      topics: [
        { title: "PFC e fatorial", description: "Noções essenciais para construir o raciocínio de contagem." },
        { title: "Permutações, arranjos e combinações", description: "Escolha da ferramenta correta conforme a ordem importe ou não." },
        { title: "Probabilidade", description: "Espaço amostral, eventos, união, interseção e probabilidade condicional." },
      ],
      activityPrompt: "Qual é o maior erro em análise combinatória?",
      activityAnswer: "Usar fórmula antes de entender se a ordem importa no agrupamento.",
    }),
    createCurriculumModule({
      title: "3º Ano: Funções e Trigonometria",
      objective: "Aprofundar domínio, imagem, raízes, sinais e funções trigonométricas.",
      overview: "O módulo revisa ferramentas essenciais para leitura de gráficos, modelagem e análise de sinais.",
      topics: [
        { title: "Funções e gráficos", description: "Domínio, imagem, raízes, crescimento, decrescimento e análise de sinais." },
        { title: "Trigonometria no ciclo", description: "Radianos, círculo trigonométrico, sinais e redução ao primeiro quadrante." },
        { title: "Funções seno, cosseno e tangente", description: "Gráficos, período, amplitude, assíntotas e aplicações." },
      ],
      activityPrompt: "Por que domínio e imagem são importantes?",
      activityAnswer: "Porque indicam quais valores podem entrar e quais resultados a função pode produzir.",
    }),
    createCurriculumModule({
      title: "3º Ano: Álgebra e Polinômios",
      objective: "Estudar números complexos, polinômios e equações algébricas.",
      overview: "O fechamento de álgebra aprofunda operações, raízes e representação de números além dos reais.",
      topics: [
        { title: "Números complexos", description: "Operações, plano de Argand-Gauss e forma trigonométrica." },
        { title: "Polinômios", description: "Grau, operações, valor numérico, divisão e dispositivo de Briot-Ruffini." },
        { title: "Equações algébricas", description: "Teorema fundamental da álgebra, relações de Girard e raízes reais ou complexas." },
      ],
      activityPrompt: "O que os números complexos acrescentam à álgebra?",
      activityAnswer: "Permitem representar e operar raízes que não pertencem ao conjunto dos reais.",
    }),
  ].map(enhanceMathModuleContent);
}

function buildChemistryCurriculumModules(): SubjectModuleContent[] {
  return [
    createCurriculumModule({
      title: "1ª Série: Matéria, Substâncias e Modelos Atômicos",
      objective: "Compreender a composição da matéria, suas propriedades e os modelos que explicam átomos e substâncias.",
      overview: "A 1ª série começa pela linguagem básica da Química: matéria, energia, propriedades, substâncias, misturas e modelos atômicos.",
      topics: [
        { title: "Matéria e energia", description: "Conceitos de matéria, corpo, objeto, energia, massa, volume e estados físicos." },
        { title: "Propriedades da matéria", description: "Propriedades gerais e específicas, densidade, solubilidade, temperatura de fusão e ebulição." },
        { title: "Substâncias e misturas", description: "Substâncias simples e compostas, misturas homogêneas e heterogêneas e métodos de separação." },
        { title: "Modelos atômicos", description: "Evolução dos modelos de Dalton, Thomson, Rutherford, Bohr e noções de estrutura atômica." },
      ],
      activityPrompt: "Por que modelos atômicos são importantes em Química?",
      activityAnswer: "Porque ajudam a explicar propriedades e transformações da matéria em escala microscópica.",
    }),
    createCurriculumModule({
      title: "1ª Série: Tabela Periódica e Ligações Químicas",
      objective: "Relacionar estrutura atômica, organização periódica e formação de substâncias.",
      overview: "Esta unidade conecta a posição dos elementos na tabela periódica às ligações e propriedades dos compostos.",
      topics: [
        { title: "Tabela periódica", description: "Famílias, períodos, metais, ametais, gases nobres e propriedades periódicas." },
        { title: "Íons e estabilidade", description: "Formação de cátions e ânions, camada de valência e tendência à estabilidade." },
        { title: "Ligações iônicas e covalentes", description: "Transferência e compartilhamento de elétrons, fórmulas e propriedades." },
        { title: "Ligações metálicas e propriedades", description: "Modelo de elétrons livres, condutividade, maleabilidade e ligas metálicas." },
      ],
      activityPrompt: "O que diferencia ligação iônica de ligação covalente?",
      activityAnswer: "Na iônica há transferência de elétrons; na covalente há compartilhamento.",
    }),
    createCurriculumModule({
      title: "1ª Série: Funções Inorgânicas e Reações",
      objective: "Identificar substâncias inorgânicas, nomenclatura e transformações químicas.",
      overview: "A unidade trabalha linguagem simbólica, funções inorgânicas e leitura de equações químicas.",
      topics: [
        { title: "Ácidos, bases, sais e óxidos", description: "Características, nomenclatura, exemplos do cotidiano e uso social." },
        { title: "Indicadores e pH", description: "Escala de pH, acidez, basicidade, neutralização e aplicações ambientais." },
        { title: "Reações químicas", description: "Evidências de reação, equações, reagentes, produtos e conservação da massa." },
        { title: "Balanceamento", description: "Ajuste de coeficientes para respeitar a conservação dos átomos." },
      ],
      activityPrompt: "Por que balancear uma equação química?",
      activityAnswer: "Para representar a conservação dos átomos durante a transformação.",
    }),
    createCurriculumModule({
      title: "2ª Série: Cálculos Químicos e Estequiometria",
      objective: "Aplicar mol, massa molar e proporções em reações químicas.",
      overview: "A 2ª série aprofunda a relação quantitativa entre partículas, massas, volumes e rendimento de reações.",
      topics: [
        { title: "Mol e massa molar", description: "Quantidade de matéria, constante de Avogadro e conversão entre mol, massa e partículas." },
        { title: "Fórmulas químicas", description: "Fórmula molecular, percentual, mínima e relações de composição." },
        { title: "Estequiometria", description: "Proporção entre reagentes e produtos em equações balanceadas." },
        { title: "Rendimento e pureza", description: "Reagente limitante, excesso, rendimento percentual e grau de pureza." },
      ],
      activityPrompt: "Qual é a base de um cálculo estequiométrico?",
      activityAnswer: "A proporção da equação química balanceada.",
    }),
    createCurriculumModule({
      title: "2ª Série: Soluções, Termoquímica e Cinética",
      objective: "Estudar concentração, energia envolvida nas reações e velocidade de transformação.",
      overview: "A unidade conecta propriedades de soluções a processos energéticos e fatores que alteram a rapidez das reações.",
      topics: [
        { title: "Soluções e concentração", description: "Soluto, solvente, concentração comum, molaridade, diluição e mistura." },
        { title: "Termoquímica", description: "Calor, entalpia, reações endotérmicas e exotérmicas." },
        { title: "Cinética química", description: "Velocidade de reação, temperatura, superfície de contato, concentração e catalisadores." },
        { title: "Aplicações tecnológicas", description: "Alimentos, medicamentos, combustíveis, indústria e impactos ambientais." },
      ],
      activityPrompt: "Como um catalisador atua em uma reação?",
      activityAnswer: "Aumenta a velocidade da reação sem ser consumido no processo.",
    }),
    createCurriculumModule({
      title: "2ª Série: Equilíbrio Químico, Ácidos e Bases",
      objective: "Compreender sistemas reversíveis, equilíbrio e controle de pH.",
      overview: "Esta unidade explica como sistemas químicos se ajustam e como ácidos e bases atuam em ambientes naturais e tecnológicos.",
      topics: [
        { title: "Equilíbrio químico", description: "Reações reversíveis, constante de equilíbrio e deslocamento." },
        { title: "Princípio de Le Chatelier", description: "Efeito de concentração, pressão e temperatura sobre sistemas em equilíbrio." },
        { title: "Equilíbrio ácido-base", description: "pH, pOH, neutralização, hidrólise e soluções tampão." },
        { title: "Equilíbrio ambiental", description: "Chuva ácida, oceanos, solos, tratamento de água e controle de poluição." },
      ],
      activityPrompt: "O que acontece quando um equilíbrio sofre perturbação?",
      activityAnswer: "O sistema se desloca para reduzir o efeito da perturbação.",
    }),
    createCurriculumModule({
      title: "3ª Série: Eletroquímica e Energia",
      objective: "Relacionar reações de oxirredução, pilhas, baterias e eletrólise.",
      overview: "A 3ª série conecta transformações químicas, eletricidade, energia e impactos sociais do consumo tecnológico.",
      topics: [
        { title: "Oxidação e redução", description: "Número de oxidação, transferência de elétrons, agente oxidante e redutor." },
        { title: "Pilhas e baterias", description: "Geração de corrente elétrica por reação espontânea e potenciais eletroquímicos." },
        { title: "Eletrólise", description: "Transformações não espontâneas provocadas por corrente elétrica." },
        { title: "Energia e sustentabilidade", description: "Baterias, descarte, mineração, combustíveis e impactos ambientais." },
      ],
      activityPrompt: "Qual é a relação entre eletroquímica e tecnologia?",
      activityAnswer: "Pilhas, baterias e eletrólise dependem de reações com transferência de elétrons.",
    }),
    createCurriculumModule({
      title: "3ª Série: Química Orgânica",
      objective: "Estudar compostos de carbono, funções orgânicas e aplicações no cotidiano.",
      overview: "A unidade organiza hidrocarbonetos, funções orgânicas, nomenclatura e propriedades de substâncias presentes em combustíveis, alimentos e medicamentos.",
      topics: [
        { title: "Carbono e cadeias carbônicas", description: "Tetravalência, tipos de cadeia, saturação, ramificação e aromaticidade." },
        { title: "Hidrocarbonetos", description: "Alcanos, alcenos, alcinos, aromáticos e relação com combustíveis." },
        { title: "Funções orgânicas oxigenadas e nitrogenadas", description: "Álcoois, aldeídos, cetonas, ácidos, ésteres, aminas e amidas." },
        { title: "Isomeria", description: "Isomeria plana e espacial, propriedades e implicações biológicas." },
      ],
      activityPrompt: "Por que a Química Orgânica é central no Ensino Médio?",
      activityAnswer: "Porque explica muitas substâncias ligadas à vida, aos combustíveis, aos alimentos e aos medicamentos.",
    }),
    createCurriculumModule({
      title: "3ª Série: Química Ambiental e Materiais",
      objective: "Analisar materiais, recursos naturais, poluição e soluções sustentáveis.",
      overview: "A unidade fecha Química conectando conhecimento científico a problemas sociais, ambientais e econômicos.",
      topics: [
        { title: "Polímeros e materiais", description: "Plásticos, borrachas, fibras, reciclagem, propriedades e usos." },
        { title: "Combustíveis e recursos minerais", description: "Petróleo, biocombustíveis, mineração, energia e impactos." },
        { title: "Água, ar e solo", description: "Ciclos, poluentes, tratamento, qualidade ambiental e saúde." },
        { title: "Química verde", description: "Prevenção de resíduos, eficiência energética, reaproveitamento e consumo consciente." },
      ],
      activityPrompt: "Como a Química ajuda em problemas ambientais?",
      activityAnswer: "Identificando substâncias, processos, riscos e alternativas de menor impacto.",
    }),
  ].map((module) => enhanceModuleContent("Química", module));
}

function buildPhysicsCurriculumModules(): SubjectModuleContent[] {
  return [
    createCurriculumModule({
      title: "1ª Série: Grandezas, Medidas e Cinemática",
      objective: "Interpretar movimentos por meio de grandezas, unidades, gráficos e equações.",
      overview: "A Física começa pela descrição do movimento e pela leitura de medidas em diferentes representações.",
      topics: [
        { title: "Grandezas e unidades", description: "Sistema Internacional, conversões, ordem de grandeza e notação científica." },
        { title: "Movimento uniforme", description: "Posição, deslocamento, velocidade média, função horária e gráficos." },
        { title: "Movimento uniformemente variado", description: "Aceleração, velocidade, queda livre e interpretação gráfica." },
        { title: "Vetores", description: "Direção, sentido, módulo, decomposição e aplicação em deslocamentos e forças." },
      ],
      activityPrompt: "O que um gráfico posição-tempo permite analisar?",
      activityAnswer: "Permite identificar posição, deslocamento e velocidade do movimento.",
    }),
    createCurriculumModule({
      title: "1ª Série: Dinâmica e Leis de Newton",
      objective: "Explicar movimentos a partir de forças, interações e equilíbrio.",
      overview: "A unidade apresenta as leis de Newton e a relação entre força resultante, massa e aceleração.",
      topics: [
        { title: "Forças e interações", description: "Peso, normal, tração, atrito, força elástica e força resultante." },
        { title: "Leis de Newton", description: "Inércia, princípio fundamental da dinâmica e ação e reação." },
        { title: "Equilíbrio e aplicações", description: "Corpos em repouso, movimento retilíneo uniforme e sistemas com forças equilibradas." },
        { title: "Atrito e segurança", description: "Atrito estático e cinético, frenagem, transporte e uso tecnológico." },
      ],
      activityPrompt: "O que causa aceleração em um corpo?",
      activityAnswer: "Uma força resultante diferente de zero.",
    }),
    createCurriculumModule({
      title: "1ª Série: Energia, Trabalho e Potência",
      objective: "Relacionar trabalho, energia, potência e conservação em sistemas físicos.",
      overview: "A unidade conecta fenômenos mecânicos com transformações e conservação de energia.",
      topics: [
        { title: "Trabalho de uma força", description: "Trabalho, deslocamento, ângulo e unidades de energia." },
        { title: "Energia cinética e potencial", description: "Energia de movimento, energia gravitacional e elástica." },
        { title: "Conservação da energia", description: "Transformações, dissipação, rendimento e sistemas conservativos." },
        { title: "Potência e rendimento", description: "Taxa de transformação de energia, máquinas e eficiência." },
      ],
      activityPrompt: "Qual é a ideia central da conservação de energia?",
      activityAnswer: "A energia não desaparece; ela se transforma ou se transfere.",
    }),
    createCurriculumModule({
      title: "2ª Série: Termologia e Calorimetria",
      objective: "Interpretar temperatura, calor, mudanças de estado e equilíbrio térmico.",
      overview: "A 2ª série aprofunda fenômenos térmicos presentes em clima, máquinas, alimentos e tecnologia.",
      topics: [
        { title: "Temperatura e escalas", description: "Celsius, Kelvin, Fahrenheit, equilíbrio térmico e agitação molecular." },
        { title: "Calor e capacidade térmica", description: "Calor sensível, calor específico e trocas de energia térmica." },
        { title: "Mudanças de estado", description: "Calor latente, fusão, vaporização, condensação e solidificação." },
        { title: "Dilatação térmica", description: "Dilatação linear, superficial, volumétrica e aplicações em materiais." },
      ],
      activityPrompt: "Qual é a diferença entre calor e temperatura?",
      activityAnswer: "Temperatura mede estado térmico; calor é energia transferida por diferença de temperatura.",
    }),
    createCurriculumModule({
      title: "2ª Série: Termodinâmica, Fluidos e Gases",
      objective: "Analisar pressão, densidade, gases e máquinas térmicas.",
      overview: "A unidade conecta trocas de calor, trabalho, pressão, densidade e rendimento de sistemas.",
      topics: [
        { title: "Pressão e densidade", description: "Grandezas em fluidos, pressão atmosférica, empuxo e princípio de Arquimedes." },
        { title: "Gases", description: "Transformações isotérmica, isobárica, isovolumétrica e equação geral dos gases." },
        { title: "Leis da Termodinâmica", description: "Energia interna, trabalho, calor, entropia e sentido dos processos." },
        { title: "Máquinas térmicas", description: "Motores, refrigeradores, rendimento e impactos energéticos." },
      ],
      activityPrompt: "Por que nenhuma máquina térmica tem rendimento de 100%?",
      activityAnswer: "Porque parte da energia é dissipada e os processos reais são irreversíveis.",
    }),
    createCurriculumModule({
      title: "2ª Série: Ondulatória e Óptica",
      objective: "Compreender ondas sonoras, eletromagnéticas, luz e formação de imagens.",
      overview: "A unidade trabalha fenômenos de propagação, comunicação, visão, instrumentos ópticos e tecnologias.",
      topics: [
        { title: "Ondas", description: "Frequência, período, comprimento de onda, velocidade, amplitude e energia." },
        { title: "Som", description: "Ondas sonoras, eco, ressonância, intensidade, altura e timbre." },
        { title: "Luz e óptica geométrica", description: "Reflexão, refração, espelhos, lentes e formação de imagens." },
        { title: "Ondas eletromagnéticas", description: "Espectro eletromagnético, comunicação, radiação e aplicações tecnológicas." },
      ],
      activityPrompt: "O que diferencia som e luz quanto à propagação?",
      activityAnswer: "O som precisa de meio material; a luz pode se propagar no vácuo.",
    }),
    createCurriculumModule({
      title: "3ª Série: Eletricidade e Circuitos",
      objective: "Dimensionar e interpretar circuitos elétricos em contextos domésticos e tecnológicos.",
      overview: "A unidade relaciona corrente, tensão, resistência, potência e segurança elétrica.",
      topics: [
        { title: "Carga, corrente e tensão", description: "Conceitos elétricos básicos, diferença de potencial e movimento de cargas." },
        { title: "Resistência e Lei de Ohm", description: "Relação entre tensão, corrente e resistência elétrica." },
        { title: "Circuitos elétricos", description: "Associação em série e paralelo, medição e análise de componentes." },
        { title: "Potência e consumo", description: "Energia elétrica, potência, contas de luz, segurança e eficiência." },
      ],
      activityPrompt: "Como calcular a potência elétrica de um aparelho?",
      activityAnswer: "Multiplicando tensão pela corrente elétrica.",
    }),
    createCurriculumModule({
      title: "3ª Série: Magnetismo e Eletromagnetismo",
      objective: "Relacionar eletricidade, magnetismo, indução e tecnologias de geração de energia.",
      overview: "A unidade mostra como correntes e campos magnéticos se relacionam em motores, geradores e transformadores.",
      topics: [
        { title: "Campo magnético", description: "Ímãs, polos magnéticos, linhas de campo e campo terrestre." },
        { title: "Força magnética", description: "Ação sobre cargas em movimento e fios percorridos por corrente." },
        { title: "Indução eletromagnética", description: "Variação de fluxo magnético, corrente induzida e Lei de Faraday." },
        { title: "Motores e geradores", description: "Transformação entre energia elétrica e mecânica em tecnologias reais." },
      ],
      activityPrompt: "Qual fenômeno permite gerar eletricidade em usinas?",
      activityAnswer: "A indução eletromagnética.",
    }),
    createCurriculumModule({
      title: "3ª Série: Física Moderna e Astronomia",
      objective: "Introduzir ideias de Física Moderna, radiação, tecnologia e universo.",
      overview: "A unidade fecha Física com temas contemporâneos: relatividade, quântica, radiação, partículas e cosmologia básica.",
      topics: [
        { title: "Relatividade", description: "Noções de velocidade da luz, espaço-tempo, energia e massa." },
        { title: "Física quântica", description: "Quantização, fótons, efeito fotoelétrico e aplicações tecnológicas." },
        { title: "Radioatividade", description: "Radiações alfa, beta, gama, meia-vida, medicina, energia e riscos." },
        { title: "Astronomia", description: "Sistema Solar, estrelas, gravitação, galáxias e expansão do universo." },
      ],
      activityPrompt: "Por que estudar Física Moderna no Ensino Médio?",
      activityAnswer: "Porque ela explica tecnologias, radiações e fenômenos que a Física clássica não descreve sozinha.",
    }),
  ].map((module) => enhanceModuleContent("Física", module));
}

function buildBiologyCurriculumModules(): SubjectModuleContent[] {
  return [
    createCurriculumModule({
      title: "1ª Série: Citologia e Bioquímica Celular",
      objective: "Compreender a célula como unidade básica da vida.",
      overview: "A Biologia começa pela organização celular, pelas moléculas da vida e pelos processos que mantêm os seres vivos.",
      topics: [
        { title: "Moléculas da vida", description: "Água, sais minerais, carboidratos, lipídios, proteínas e ácidos nucleicos." },
        { title: "Tipos celulares", description: "Células procarióticas, eucarióticas, animais, vegetais e organização básica." },
        { title: "Organelas", description: "Núcleo, ribossomos, mitocôndrias, cloroplastos, retículo, Golgi e lisossomos." },
        { title: "Metabolismo celular", description: "Respiração celular, fermentação, fotossíntese e fluxo de energia." },
      ],
      activityPrompt: "Por que a célula é considerada unidade da vida?",
      activityAnswer: "Porque realiza funções essenciais e compõe todos os seres vivos.",
    }),
    createCurriculumModule({
      title: "1ª Série: Genética e Divisão Celular",
      objective: "Relacionar DNA, hereditariedade, mitose, meiose e transmissão de características.",
      overview: "A unidade explica como informações hereditárias são armazenadas, copiadas e transmitidas.",
      topics: [
        { title: "DNA, RNA e genes", description: "Material genético, síntese de proteínas e expressão gênica inicial." },
        { title: "Mitose e meiose", description: "Divisão celular, crescimento, reprodução, gametas e variabilidade genética." },
        { title: "Leis de Mendel", description: "Herança dominante, recessiva, segregação e combinação de alelos." },
        { title: "Genética humana", description: "Heredogramas, grupos sanguíneos, doenças hereditárias e aconselhamento genético." },
      ],
      activityPrompt: "Qual é a diferença entre mitose e meiose?",
      activityAnswer: "Mitose mantém o número de cromossomos; meiose reduz pela metade e forma gametas.",
    }),
    createCurriculumModule({
      title: "1ª Série: Origem da Vida e Evolução",
      objective: "Analisar hipóteses sobre a origem da vida e mecanismos evolutivos.",
      overview: "A unidade conecta evidências, seleção natural, adaptação e diversidade dos seres vivos.",
      topics: [
        { title: "Origem da vida", description: "Hipóteses, abiogênese, biogênese, experimentos históricos e evolução química." },
        { title: "Evidências evolutivas", description: "Fósseis, anatomia comparada, embriologia, biogeografia e biologia molecular." },
        { title: "Seleção natural", description: "Variabilidade, adaptação, sobrevivência diferencial e reprodução." },
        { title: "Especiação", description: "Isolamento reprodutivo, divergência populacional e formação de novas espécies." },
      ],
      activityPrompt: "O que a seleção natural favorece?",
      activityAnswer: "Características hereditárias que aumentam sobrevivência e reprodução em certo ambiente.",
    }),
    createCurriculumModule({
      title: "2ª Série: Zoologia e Fisiologia Animal",
      objective: "Estudar grupos animais, adaptações e sistemas fisiológicos.",
      overview: "A unidade relaciona formas de vida animal, evolução, ambiente e funcionamento dos organismos.",
      topics: [
        { title: "Invertebrados", description: "Principais filos, características, importância ecológica e econômica." },
        { title: "Vertebrados", description: "Peixes, anfíbios, répteis, aves, mamíferos e adaptações." },
        { title: "Sistemas fisiológicos", description: "Digestão, respiração, circulação, excreção, locomoção e integração." },
        { title: "Reprodução e desenvolvimento", description: "Reprodução sexuada, assexuada, fecundação e desenvolvimento embrionário." },
      ],
      activityPrompt: "Como comparar grupos animais de forma eficiente?",
      activityAnswer: "Relacionando características, ambiente, adaptação e modo de vida.",
    }),
    createCurriculumModule({
      title: "2ª Série: Botânica e Fisiologia Vegetal",
      objective: "Compreender plantas, tecidos, reprodução e processos fisiológicos.",
      overview: "A unidade trabalha diversidade vegetal, estrutura, transporte, fotossíntese e importância ecológica.",
      topics: [
        { title: "Grupos vegetais", description: "Briófitas, pteridófitas, gimnospermas e angiospermas." },
        { title: "Tecidos e órgãos vegetais", description: "Raiz, caule, folha, flor, fruto, semente e tecidos de condução." },
        { title: "Fotossíntese e transpiração", description: "Produção de matéria orgânica, trocas gasosas, estômatos e água." },
        { title: "Reprodução vegetal", description: "Ciclos, polinização, fecundação, dispersão e importância dos polinizadores." },
      ],
      activityPrompt: "Por que angiospermas são tão abundantes?",
      activityAnswer: "Porque flores e frutos favorecem reprodução, proteção e dispersão das sementes.",
    }),
    createCurriculumModule({
      title: "2ª Série: Microbiologia, Vírus e Saúde",
      objective: "Relacionar microrganismos, doenças, imunidade, biotecnologia e saúde coletiva.",
      overview: "A unidade conecta vírus, bactérias, protozoários e fungos a saúde, ambiente e produção de alimentos.",
      topics: [
        { title: "Vírus", description: "Estrutura, reprodução, vacinas, epidemias e prevenção." },
        { title: "Bactérias", description: "Estrutura, metabolismo, doenças, antibióticos, decomposição e biotecnologia." },
        { title: "Protozoários, algas e fungos", description: "Diversidade, ciclos, doenças, alimentos e equilíbrio ambiental." },
        { title: "Imunidade e saúde pública", description: "Defesas do organismo, vacinação, saneamento e indicadores de saúde." },
      ],
      activityPrompt: "Por que vacinação é uma ação coletiva?",
      activityAnswer: "Porque reduz circulação de doenças e protege também pessoas vulneráveis.",
    }),
    createCurriculumModule({
      title: "3ª Série: Ecologia e Ciclos Biogeoquímicos",
      objective: "Analisar relações ecológicas, fluxos de energia e ciclos da matéria.",
      overview: "A 3ª série retoma ecologia com foco em sistemas, equilíbrio, impacto humano e sustentabilidade.",
      topics: [
        { title: "Níveis ecológicos", description: "População, comunidade, ecossistema, biosfera e nicho ecológico." },
        { title: "Cadeias e teias alimentares", description: "Produtores, consumidores, decompositores, fluxo de energia e pirâmides." },
        { title: "Ciclos biogeoquímicos", description: "Ciclos da água, carbono, nitrogênio, fósforo e impactos humanos." },
        { title: "Relações ecológicas", description: "Predação, competição, mutualismo, parasitismo, comensalismo e sucessão ecológica." },
      ],
      activityPrompt: "Por que a energia diminui ao longo da cadeia alimentar?",
      activityAnswer: "Porque parte da energia é dissipada em cada nível trófico.",
    }),
    createCurriculumModule({
      title: "3ª Série: Biotecnologia e Genética Aplicada",
      objective: "Avaliar aplicações, riscos e benefícios da biotecnologia.",
      overview: "A unidade conecta genética a transgênicos, clonagem, terapia, diagnóstico e debates éticos.",
      topics: [
        { title: "DNA recombinante", description: "Técnicas de manipulação genética e produção de organismos modificados." },
        { title: "Transgênicos e melhoramento", description: "Agricultura, produtividade, riscos, benefícios e regulação." },
        { title: "Clonagem e células-tronco", description: "Conceitos, aplicações médicas, limites técnicos e debates éticos." },
        { title: "Bioética", description: "Decisões responsáveis sobre ciência, saúde, ambiente e sociedade." },
      ],
      activityPrompt: "Como avaliar uma tecnologia genética?",
      activityAnswer: "Comparando benefícios, riscos, evidências científicas e impactos sociais.",
    }),
    createCurriculumModule({
      title: "3ª Série: Ambiente, Sustentabilidade e Saúde",
      objective: "Relacionar impactos ambientais, saúde humana e conservação da biodiversidade.",
      overview: "A unidade fecha Biologia com problemas ambientais, indicadores de saúde e propostas de intervenção.",
      topics: [
        { title: "Biodiversidade brasileira", description: "Biomas, espécies, serviços ecossistêmicos e conservação." },
        { title: "Impactos ambientais", description: "Desmatamento, queimadas, poluição, mudanças climáticas e perda de habitat." },
        { title: "Saúde e ambiente", description: "Saneamento, indicadores de saúde, nutrição, mortalidade e qualidade de vida." },
        { title: "Sustentabilidade", description: "Conservação, recuperação ambiental, consumo consciente e políticas públicas." },
      ],
      activityPrompt: "Por que saúde e ambiente devem ser estudados juntos?",
      activityAnswer: "Porque qualidade ambiental afeta diretamente doenças, alimentação, saneamento e bem-estar.",
    }),
  ].map((module) => enhanceModuleContent("Biologia", module));
}

function buildHistoryCurriculumModules(): SubjectModuleContent[] {
  return [
    createCurriculumModule({
      title: "1ª Série: Fontes, Memória e História Antiga",
      objective: "Ler fontes históricas e compreender sociedades antigas.",
      overview: "História começa pela análise de fontes, memória, cultura e formação das primeiras sociedades.",
      topics: [
        { title: "Tempo histórico e fontes", description: "Fontes materiais, escritas, orais, visuais, memória e interpretação histórica." },
        { title: "Primeiras sociedades", description: "Nomadismo, sedentarização, agricultura, cidades e organização social." },
        { title: "Antiguidade Oriental", description: "Egito, Mesopotâmia, povos hebreus, fenícios, persas e relações de poder." },
        { title: "Grécia e Roma", description: "Democracia, cidadania, escravidão, república, império e legado cultural." },
      ],
      activityPrompt: "Por que uma fonte histórica precisa ser interpretada?",
      activityAnswer: "Porque ela expressa contexto, interesses, autoria e limites de uma época.",
    }),
    createCurriculumModule({
      title: "1ª Série: Idade Média e Mundo Feudal",
      objective: "Compreender relações sociais, cultura, religião e poder na Idade Média.",
      overview: "A unidade analisa feudalismo, cristandade, mundo islâmico, cidades e transformações medievais.",
      topics: [
        { title: "Feudalismo", description: "Servidão, senhorio, vassalagem, economia agrária e relações de dependência." },
        { title: "Igreja e cultura medieval", description: "Cristandade, educação, poder simbólico, arte e visões de mundo." },
        { title: "Mundo islâmico", description: "Expansão, ciência, comércio, cultura e trocas com outros povos." },
        { title: "Renascimento comercial e urbano", description: "Cidades, burguesia, rotas comerciais e crise do feudalismo." },
      ],
      activityPrompt: "Qual é uma característica central do feudalismo?",
      activityAnswer: "Relações de dependência em torno da terra e do trabalho servil.",
    }),
    createCurriculumModule({
      title: "1ª Série: Modernidade, Colonização e África",
      objective: "Analisar formação do mundo moderno, colonialismo e sociedades africanas e americanas.",
      overview: "A unidade conecta expansão marítima, Estados modernos, colonialismo, África e povos originários.",
      topics: [
        { title: "Renascimento e Reforma", description: "Humanismo, ciência, arte, Reforma religiosa e mudanças culturais." },
        { title: "Estados modernos e absolutismo", description: "Centralização política, mercantilismo, monarquias e conflitos." },
        { title: "Expansão marítima e colonização", description: "Conquista, exploração, escravidão, resistências e impactos." },
        { title: "África e povos originários", description: "Diversidade africana e indígena, cultura, política, trabalho e resistência." },
      ],
      activityPrompt: "Por que estudar África e povos originários junto com colonização?",
      activityAnswer: "Porque eles foram sujeitos históricos centrais, com culturas, resistências e projetos próprios.",
    }),
    createCurriculumModule({
      title: "2ª Série: Brasil Colônia e Independências",
      objective: "Compreender colonização portuguesa, escravidão, economia e processos de independência.",
      overview: "A unidade trabalha a formação colonial, conflitos, circulação de riquezas e ruptura política no Atlântico.",
      topics: [
        { title: "Economia colonial", description: "Açúcar, mineração, pecuária, comércio, trabalho escravizado e mercado interno." },
        { title: "Escravidão e resistências", description: "Tráfico atlântico, quilombos, revoltas, cultura afro-brasileira e legislação." },
        { title: "Crise colonial", description: "Inconfidências, ideias iluministas, Revolução Haitiana e tensões metropolitanas." },
        { title: "Independências americanas", description: "Independência do Brasil, América espanhola, continuidades e rupturas." },
      ],
      activityPrompt: "Por que a independência não eliminou todas as estruturas coloniais?",
      activityAnswer: "Porque manteve elites, escravidão e muitas desigualdades sociais.",
    }),
    createCurriculumModule({
      title: "2ª Série: Revoluções, Capitalismo e Século XIX",
      objective: "Analisar revoluções políticas, industriais e transformações sociais do mundo contemporâneo.",
      overview: "A unidade conecta iluminismo, revoluções, industrialização, trabalho e conflitos sociais.",
      topics: [
        { title: "Iluminismo e Revolução Francesa", description: "Direitos, cidadania, soberania popular, conflitos e limites." },
        { title: "Revolução Industrial", description: "Máquinas, fábricas, urbanização, trabalho e organização operária." },
        { title: "Liberalismo, socialismo e nacionalismo", description: "Ideologias, movimentos políticos e disputas sociais." },
        { title: "Imperialismo", description: "Neocolonialismo, África, Ásia, racismo científico e disputas econômicas." },
      ],
      activityPrompt: "Qual relação existe entre indústria e mundo do trabalho?",
      activityAnswer: "A industrialização reorganizou produção, cidades, classe trabalhadora e conflitos sociais.",
    }),
    createCurriculumModule({
      title: "2ª Série: Brasil Império e Primeira República",
      objective: "Estudar Estado nacional brasileiro, escravidão, cidadania e república oligárquica.",
      overview: "A unidade analisa formação do Brasil independente, Segundo Reinado, abolição e República Velha.",
      topics: [
        { title: "Primeiro Reinado e Regências", description: "Constituição, centralização, revoltas regenciais e disputas políticas." },
        { title: "Segundo Reinado", description: "Café, escravidão, parlamentarismo, Guerra do Paraguai e crise imperial." },
        { title: "Abolição e pós-abolição", description: "Movimento abolicionista, Lei Áurea, exclusão social e racismo estrutural." },
        { title: "Primeira República", description: "Coronelismo, política dos governadores, movimentos sociais e urbanização." },
      ],
      activityPrompt: "Por que a abolição deve ser estudada além da Lei Áurea?",
      activityAnswer: "Porque envolve lutas, resistências, exclusões e permanências do racismo.",
    }),
    createCurriculumModule({
      title: "3ª Série: Guerras Mundiais e Totalitarismos",
      objective: "Compreender guerras, crises, regimes totalitários e seus impactos globais.",
      overview: "A unidade trabalha os conflitos do século XX, crise econômica, fascismos e reorganização mundial.",
      topics: [
        { title: "Primeira Guerra Mundial", description: "Imperialismo, nacionalismos, alianças, trincheiras e consequências." },
        { title: "Crise de 1929", description: "Superprodução, colapso financeiro, desemprego e respostas estatais." },
        { title: "Fascismo, nazismo e stalinismo", description: "Totalitarismo, propaganda, violência, controle social e perseguições." },
        { title: "Segunda Guerra Mundial", description: "Expansionismo, genocídio, resistência, tecnologia e nova ordem mundial." },
      ],
      activityPrompt: "Qual é o risco político dos regimes totalitários?",
      activityAnswer: "Concentram poder, controlam a sociedade e perseguem grupos considerados inimigos.",
    }),
    createCurriculumModule({
      title: "3ª Série: Brasil República, Democracia e Ditadura",
      objective: "Analisar transformações políticas e sociais do Brasil no século XX e XXI.",
      overview: "A unidade conecta Era Vargas, populismo, ditadura civil-militar, redemocratização e cidadania.",
      topics: [
        { title: "Era Vargas", description: "Trabalho, indústria, Estado, nacionalismo, autoritarismo e legislação social." },
        { title: "República populista", description: "Democracia, desenvolvimento, conflitos sociais e crise política." },
        { title: "Ditadura civil-militar", description: "Golpe de 1964, censura, repressão, resistência e milagre econômico." },
        { title: "Redemocratização", description: "Constituição de 1988, cidadania, movimentos sociais e desafios democráticos." },
      ],
      activityPrompt: "Por que a Constituição de 1988 é chamada de cidadã?",
      activityAnswer: "Porque ampliou direitos sociais, políticos e garantias democráticas.",
    }),
    createCurriculumModule({
      title: "3ª Série: Mundo Contemporâneo e Cidadania",
      objective: "Relacionar globalização, conflitos, direitos humanos, memória e participação social.",
      overview: "A unidade fecha História com debates contemporâneos e leitura crítica do presente.",
      topics: [
        { title: "Guerra Fria e nova ordem mundial", description: "Bipolaridade, corrida tecnológica, descolonização e reorganização geopolítica." },
        { title: "Globalização e neoliberalismo", description: "Economia, trabalho, cultura, tecnologia e desigualdades." },
        { title: "Movimentos sociais", description: "Lutas por direitos, mulheres, negros, indígenas, trabalhadores e juventudes." },
        { title: "Memória e direitos humanos", description: "Justiça, reparação, patrimônio, democracia e combate a exclusões." },
      ],
      activityPrompt: "Como História ajuda a entender o presente?",
      activityAnswer: "Relacionando processos, permanências, rupturas, disputas de memória e conflitos sociais.",
    }),
  ].map((module) => enhanceModuleContent("História", module));
}

function buildGeographyCurriculumModules(): SubjectModuleContent[] {
  return [
    createCurriculumModule({
      title: "1ª Série: Espaço Geográfico e Cartografia",
      objective: "Compreender espaço geográfico, paisagem, lugar, território e representações cartográficas.",
      overview: "A Geografia começa pela leitura do espaço e pelas ferramentas de representação e localização.",
      topics: [
        { title: "Espaço geográfico", description: "Relação sociedade-natureza, paisagem, lugar, território, região e escala." },
        { title: "Cartografia", description: "Mapas, escala, legenda, orientação, coordenadas e projeções." },
        { title: "Geotecnologias", description: "Sensoriamento remoto, GPS, imagens de satélite e sistemas de informação geográfica." },
        { title: "Leitura de gráficos e mapas", description: "Interpretação de dados espaciais, tabelas, mapas temáticos e anamorfoses." },
      ],
      activityPrompt: "Por que escala é importante em Geografia?",
      activityAnswer: "Porque o fenômeno muda de sentido conforme a análise local, regional, nacional ou global.",
    }),
    createCurriculumModule({
      title: "1ª Série: Natureza, Relevo, Clima e Biomas",
      objective: "Analisar sistemas naturais e sua relação com ocupação humana.",
      overview: "A unidade trabalha estrutura da Terra, relevo, clima, hidrografia, vegetação e biomas.",
      topics: [
        { title: "Estrutura geológica e relevo", description: "Placas tectônicas, rochas, agentes internos e externos e formas de relevo." },
        { title: "Clima e atmosfera", description: "Tempo, clima, massas de ar, fatores climáticos e problemas climáticos." },
        { title: "Hidrografia", description: "Bacias hidrográficas, rios, águas subterrâneas, usos da água e conflitos." },
        { title: "Biomas do Brasil e do mundo", description: "Características, distribuição, biodiversidade e impactos humanos." },
      ],
      activityPrompt: "Qual é a diferença entre tempo e clima?",
      activityAnswer: "Tempo é condição momentânea; clima é padrão observado por longo período.",
    }),
    createCurriculumModule({
      title: "1ª Série: População, Cultura e Território",
      objective: "Interpretar distribuição populacional, migrações, diversidade cultural e organização territorial.",
      overview: "A unidade conecta população, identidade, fluxos migratórios e desigualdades territoriais.",
      topics: [
        { title: "Dinâmica populacional", description: "Crescimento, natalidade, mortalidade, envelhecimento e transição demográfica." },
        { title: "Migrações", description: "Fluxos internos e externos, refúgio, trabalho, urbanização e conflitos." },
        { title: "Cultura e território", description: "Identidades, territorialidades, patrimônio e diversidade." },
        { title: "Desigualdades socioespaciais", description: "Renda, acesso a serviços, segregação e indicadores sociais." },
      ],
      activityPrompt: "O que uma pirâmide etária permite analisar?",
      activityAnswer: "A estrutura por idade e sexo de uma população e suas tendências demográficas.",
    }),
    createCurriculumModule({
      title: "2ª Série: Urbanização e Rede Urbana",
      objective: "Analisar cidades, metropolização, problemas urbanos e hierarquia urbana.",
      overview: "A unidade trabalha crescimento urbano, rede de cidades, planejamento e desigualdades.",
      topics: [
        { title: "Urbanização", description: "Industrialização, êxodo rural, crescimento urbano e metropolização." },
        { title: "Rede e hierarquia urbana", description: "Metrópoles, cidades globais, regiões metropolitanas e fluxos." },
        { title: "Problemas urbanos", description: "Habitação, transporte, saneamento, violência, segregação e mobilidade." },
        { title: "Planejamento urbano", description: "Direito à cidade, políticas públicas, sustentabilidade e participação social." },
      ],
      activityPrompt: "O que diferencia urbanização de crescimento urbano?",
      activityAnswer: "Urbanização é aumento da participação urbana na população; crescimento urbano é expansão da cidade.",
    }),
    createCurriculumModule({
      title: "2ª Série: Campo, Agricultura e Questão Agrária",
      objective: "Compreender espaço agrário, produção agropecuária, conflitos e tecnologia.",
      overview: "A unidade analisa uso da terra, agricultura, agroindústria, reforma agrária e impactos ambientais.",
      topics: [
        { title: "Estrutura fundiária", description: "Concentração de terras, latifúndio, minifúndio, reforma agrária e conflitos." },
        { title: "Agricultura brasileira", description: "Agronegócio, agricultura familiar, produção de alimentos e exportações." },
        { title: "Tecnologia no campo", description: "Mecanização, biotecnologia, produtividade, desemprego e concentração." },
        { title: "Impactos ambientais no campo", description: "Desmatamento, queimadas, agrotóxicos, água e conservação do solo." },
      ],
      activityPrompt: "Por que a questão agrária envolve política e economia?",
      activityAnswer: "Porque trata de acesso à terra, produção, trabalho, renda e poder territorial.",
    }),
    createCurriculumModule({
      title: "2ª Série: Indústria, Energia e Circulação",
      objective: "Relacionar produção industrial, transportes, energia e organização do espaço.",
      overview: "A unidade conecta desenvolvimento técnico, redes, logística e impactos socioambientais.",
      topics: [
        { title: "Industrialização", description: "Fatores locacionais, fases da indústria, desconcentração e reestruturação produtiva." },
        { title: "Transportes e logística", description: "Rodovias, ferrovias, hidrovias, portos, custos e integração territorial." },
        { title: "Fontes de energia", description: "Matriz energética, fontes renováveis e não renováveis, riscos e impactos." },
        { title: "Tecnologia e trabalho", description: "Automação, redes produtivas, desterritorialização e novas relações de trabalho." },
      ],
      activityPrompt: "Como a tecnologia altera a produção industrial?",
      activityAnswer: "Aumenta produtividade, reorganiza o trabalho e muda a localização das atividades.",
    }),
    createCurriculumModule({
      title: "3ª Série: Globalização e Geopolítica",
      objective: "Analisar relações de poder, blocos econômicos, conflitos e fluxos globais.",
      overview: "A unidade trabalha mundo globalizado, redes, desigualdades e disputas territoriais.",
      topics: [
        { title: "Globalização", description: "Fluxos de capital, mercadorias, informações, pessoas e cultura." },
        { title: "Blocos econômicos", description: "Integração regional, comércio, acordos e disputas comerciais." },
        { title: "Geopolítica mundial", description: "Estados, fronteiras, conflitos, poder militar, recursos e diplomacia." },
        { title: "Organizações internacionais", description: "ONU, OMC, FMI, Banco Mundial e governança global." },
      ],
      activityPrompt: "O que caracteriza a globalização?",
      activityAnswer: "A intensificação de fluxos econômicos, culturais, tecnológicos e informacionais em escala mundial.",
    }),
    createCurriculumModule({
      title: "3ª Série: Brasil, Região e Desenvolvimento",
      objective: "Interpretar formação territorial brasileira, regionalização e desigualdades.",
      overview: "A unidade aprofunda território brasileiro, população, economia, redes e desigualdades regionais.",
      topics: [
        { title: "Formação territorial do Brasil", description: "Ocupação, fronteiras, ciclos econômicos e integração nacional." },
        { title: "Regionalização", description: "Regiões do IBGE, complexos regionais, critérios econômicos, naturais e culturais." },
        { title: "Economia brasileira", description: "Indústria, agropecuária, serviços, comércio externo e infraestrutura." },
        { title: "Desigualdades regionais", description: "Indicadores sociais, concentração econômica, políticas públicas e território." },
      ],
      activityPrompt: "Por que existem várias formas de regionalizar o Brasil?",
      activityAnswer: "Porque cada regionalização usa critérios diferentes para explicar o território.",
    }),
    createCurriculumModule({
      title: "3ª Série: Meio Ambiente e Sustentabilidade",
      objective: "Avaliar problemas ambientais e propostas de desenvolvimento sustentável.",
      overview: "A unidade fecha Geografia com impactos socioambientais, conservação e políticas ambientais.",
      topics: [
        { title: "Problemas ambientais", description: "Desmatamento, queimadas, poluição, desertificação, ilhas de calor e enchentes." },
        { title: "Mudanças climáticas", description: "Efeito estufa, aquecimento global, eventos extremos e adaptação." },
        { title: "Recursos naturais", description: "Água, solo, florestas, minérios, energia e conflitos de uso." },
        { title: "Sustentabilidade", description: "Conservação, recuperação, justiça ambiental, consumo e políticas públicas." },
      ],
      activityPrompt: "Por que sustentabilidade envolve sociedade e natureza?",
      activityAnswer: "Porque depende de uso responsável dos recursos e redução de desigualdades socioambientais.",
    }),
  ].map((module) => enhanceModuleContent("Geografia", module));
}

function buildLiteratureCurriculumModules(): SubjectModuleContent[] {
  return [
    createCurriculumModule({
      title: "1ª Série: Leitura Literária e Gêneros",
      objective: "Desenvolver leitura literária com atenção à forma, linguagem e contexto.",
      overview: "Literatura começa pela leitura de gêneros, recursos expressivos e relação entre texto e sociedade.",
      topics: [
        { title: "Texto literário e não literário", description: "Linguagem conotativa, ficcionalidade, plurissignificação e função estética." },
        { title: "Gêneros literários", description: "Épico, lírico, dramático, narrativo moderno e formas híbridas." },
        { title: "Elementos da narrativa", description: "Narrador, personagem, tempo, espaço, enredo, foco narrativo e conflito." },
        { title: "Poema e eu lírico", description: "Verso, estrofe, ritmo, rima, imagem poética e voz lírica." },
      ],
      activityPrompt: "O que diferencia leitura literária de leitura informativa?",
      activityAnswer: "A leitura literária observa forma, linguagem, imagens, ambiguidades e contexto estético.",
    }),
    createCurriculumModule({
      title: "1ª Série: Literatura Medieval, Classicismo e Quinhentismo",
      objective: "Compreender a formação da literatura em língua portuguesa.",
      overview: "A unidade apresenta os primeiros movimentos e suas relações com religião, oralidade, humanismo e colonização.",
      topics: [
        { title: "Trovadorismo", description: "Cantigas líricas e satíricas, oralidade, amor cortês e sociedade medieval." },
        { title: "Humanismo", description: "Teatro de Gil Vicente, transição cultural e crítica de costumes." },
        { title: "Classicismo", description: "Racionalidade, equilíbrio, medida nova, Camões e ideal renascentista." },
        { title: "Quinhentismo", description: "Literatura de informação, catequese, colonização e representação do território." },
      ],
      activityPrompt: "Por que Quinhentismo tem relação com colonização?",
      activityAnswer: "Porque registra o olhar europeu sobre o território e os povos encontrados.",
    }),
    createCurriculumModule({
      title: "1ª Série: Barroco e Arcadismo",
      objective: "Analisar contrastes barrocos e o ideal clássico do Arcadismo.",
      overview: "A unidade relaciona formas poéticas, contexto colonial e tensões entre fé, razão, corpo e natureza.",
      topics: [
        { title: "Barroco", description: "Contrastes, religiosidade, conflito, cultismo e conceptismo." },
        { title: "Gregório de Matos e Padre Vieira", description: "Sátira, crítica social, sermão, argumentação e linguagem barroca." },
        { title: "Arcadismo", description: "Bucolismo, simplicidade, razão, pastoralismo e referências clássicas." },
        { title: "Arcadismo no Brasil", description: "Inconfidência Mineira, poesia lírica, épica e contexto colonial." },
      ],
      activityPrompt: "Qual contraste marca o Barroco?",
      activityAnswer: "O conflito entre fé e razão, corpo e alma, vida terrena e salvação.",
    }),
    createCurriculumModule({
      title: "2ª Série: Romantismo",
      objective: "Estudar o Romantismo e suas relações com nação, subjetividade e sociedade.",
      overview: "A unidade trabalha poesia, romance, indianismo, urbanidade e crítica social no século XIX.",
      topics: [
        { title: "Primeira geração romântica", description: "Nacionalismo, indianismo, natureza, identidade e idealização." },
        { title: "Segunda geração romântica", description: "Subjetividade, ultrarromantismo, pessimismo, morte e evasão." },
        { title: "Terceira geração romântica", description: "Condoreirismo, crítica social, abolicionismo e poesia pública." },
        { title: "Romance romântico", description: "Romance urbano, regionalista, indianista, histórico e formação do público leitor." },
      ],
      activityPrompt: "O que o Romantismo ajudou a construir no Brasil?",
      activityAnswer: "Uma ideia de identidade nacional, ainda marcada por idealizações e exclusões.",
    }),
    createCurriculumModule({
      title: "2ª Série: Realismo, Naturalismo e Parnasianismo",
      objective: "Comparar tendências literárias do fim do século XIX.",
      overview: "A unidade apresenta crítica social, análise psicológica, determinismo e culto à forma.",
      topics: [
        { title: "Realismo", description: "Crítica à sociedade burguesa, análise psicológica, ironia e objetividade." },
        { title: "Machado de Assis", description: "Narrador, ironia, ambiguidade, crítica social e ruptura com idealizações." },
        { title: "Naturalismo", description: "Determinismo, cientificismo, meio, raça, hereditariedade e denúncia social." },
        { title: "Parnasianismo", description: "Formalismo, impessoalidade, rigor métrico e culto à forma." },
      ],
      activityPrompt: "Como o Realismo se distancia do Romantismo?",
      activityAnswer: "Critica idealizações e observa a sociedade de forma mais irônica e analítica.",
    }),
    createCurriculumModule({
      title: "2ª Série: Simbolismo e Pré-Modernismo",
      objective: "Entender transições estéticas rumo ao Modernismo.",
      overview: "A unidade trabalha musicalidade simbolista e crítica social pré-modernista.",
      topics: [
        { title: "Simbolismo", description: "Sugestão, musicalidade, sinestesia, espiritualidade e subjetividade." },
        { title: "Cruz e Sousa e Alphonsus de Guimaraens", description: "Imagens poéticas, dor, transcendência e linguagem simbólica." },
        { title: "Pré-Modernismo", description: "Crítica ao Brasil oficial, regionalismo, denúncia social e transição estética." },
        { title: "Euclides, Lima Barreto e Monteiro Lobato", description: "Conflitos sociais, linguagem crítica, sertão, cidade e exclusões." },
      ],
      activityPrompt: "Por que o Pré-Modernismo é uma transição?",
      activityAnswer: "Porque ainda mantém formas antigas, mas já denuncia problemas sociais do Brasil moderno.",
    }),
    createCurriculumModule({
      title: "3ª Série: Modernismo Brasileiro",
      objective: "Analisar a ruptura modernista e suas fases no Brasil.",
      overview: "A unidade trabalha Semana de 1922, experimentação, identidade nacional e crítica social.",
      topics: [
        { title: "Semana de 1922", description: "Ruptura estética, vanguarda, polêmica, liberdade formal e projeto moderno." },
        { title: "Primeira fase modernista", description: "Experimentação, humor, linguagem coloquial e nacionalismo crítico." },
        { title: "Segunda fase modernista", description: "Romance de 30, regionalismo, crítica social e poesia madura." },
        { title: "Terceira fase modernista", description: "Geração de 45, Guimarães Rosa, Clarice Lispector e aprofundamento formal." },
      ],
      activityPrompt: "Qual foi a principal ruptura modernista?",
      activityAnswer: "A busca por liberdade formal e por uma linguagem brasileira mais crítica e cotidiana.",
    }),
    createCurriculumModule({
      title: "3ª Série: Literatura Contemporânea e Vozes Plurais",
      objective: "Ler produções contemporâneas considerando diversidade de vozes e suportes.",
      overview: "A unidade trabalha literatura pós-1960, periferias, autoria feminina, negra, indígena e novas mídias.",
      topics: [
        { title: "Poesia e prosa contemporâneas", description: "Fragmentação, memória, identidade, metalinguagem e experimentação." },
        { title: "Literatura negra e indígena", description: "Ancestralidade, território, denúncia, autoria e disputa de memória." },
        { title: "Literatura feminina e periférica", description: "Vozes sociais, corpo, trabalho, violência, pertencimento e resistência." },
        { title: "Literatura digital", description: "Blogs, redes sociais, slam, fanfic, hipertexto e circulação cultural." },
      ],
      activityPrompt: "O que muda ao ler literatura contemporânea?",
      activityAnswer: "É preciso considerar pluralidade de vozes, suportes, identidades e disputas sociais.",
    }),
    createCurriculumModule({
      title: "3ª Série: Obras, ENEM e Revisão Literária",
      objective: "Revisar literatura para provas com foco em análise, contexto e comparação.",
      overview: "A unidade fecha Literatura com estratégias de leitura de obras, poemas e questões de vestibular/ENEM.",
      topics: [
        { title: "Contexto de produção", description: "Autor, época, movimento, circulação, público e projeto estético." },
        { title: "Análise de poema", description: "Eu lírico, imagens, ritmo, recursos sonoros, figuras e efeitos de sentido." },
        { title: "Análise de narrativa", description: "Narrador, personagens, tempo, espaço, enredo, conflito e crítica social." },
        { title: "Comparação entre textos", description: "Intertextualidade, permanências, rupturas e diálogo entre obras." },
      ],
      activityPrompt: "O que uma boa análise literária precisa unir?",
      activityAnswer: "Forma, linguagem, contexto histórico e efeito de sentido.",
    }),
  ].map((module) => enhanceModuleContent("Literatura", module));
}

function applyCuratedCurriculum(contentMap: SubjectModuleMap): SubjectModuleMap {
  const nextMap = { ...contentMap };
  const subjectNames = Object.keys(nextMap);
  const portugueseKey = subjectNames.find((name) => normalizeText(name) === "portugues") ?? "Português";
  const mathKey = subjectNames.find((name) => normalizeText(name) === "matematica") ?? "Matemática";
  const chemistryKey = subjectNames.find((name) => normalizeText(name) === "quimica") ?? "Química";
  const physicsKey = subjectNames.find((name) => normalizeText(name) === "fisica") ?? "Física";
  const biologyKey = subjectNames.find((name) => normalizeText(name) === "biologia") ?? "Biologia";
  const historyKey = subjectNames.find((name) => normalizeText(name) === "historia") ?? "História";
  const geographyKey = subjectNames.find((name) => normalizeText(name) === "geografia") ?? "Geografia";
  const literatureKey = subjectNames.find((name) => normalizeText(name) === "literatura") ?? "Literatura";

  nextMap[portugueseKey] = buildPortugueseCurriculumModules();
  nextMap[mathKey] = buildMathCurriculumModules();
  nextMap[chemistryKey] = buildChemistryCurriculumModules();
  nextMap[physicsKey] = buildPhysicsCurriculumModules();
  nextMap[biologyKey] = buildBiologyCurriculumModules();
  nextMap[historyKey] = buildHistoryCurriculumModules();
  nextMap[geographyKey] = buildGeographyCurriculumModules();
  nextMap[literatureKey] = buildLiteratureCurriculumModules();

  return nextMap;
}

function buildModuleContent(
  subjectName: string,
  module: CourseModuleRow,
  lessons: LessonRow[],
  blocksByLesson: Map<string, LessonBlockRow[]>,
  exercisesByLesson: Map<string, LessonExerciseRow[]>,
): SubjectModuleContent {
  const moduleLessons = bySortOrder(lessons.filter((lesson) => lesson.module_id === module.id));
  const moduleBlocks = moduleLessons.flatMap((lesson) => bySortOrder(blocksByLesson.get(lesson.id) ?? []));
  const moduleExercises = moduleLessons.flatMap((lesson) => bySortOrder(exercisesByLesson.get(lesson.id) ?? []));
  const exampleBlocks = moduleBlocks.filter((block) => block.block_type === "example");
  const reviewBlocks = moduleBlocks.filter((block) => ["visual_summary", "mind_map", "review"].includes(block.block_type));
  const explanation = moduleBlocks.length > 0
    ? moduleBlocks.map((block) => block.content)
    : moduleLessons.map((lesson) => lesson.summary).filter(Boolean);
  const lessonTitles = moduleLessons.map((lesson) => lesson.title).filter(Boolean);
  const nodes = moduleBlocks.map((block) => block.title).filter(Boolean).slice(0, 6);

  const visual: SubjectVisual | undefined = nodes.length > 0
    ? {
      type: "concept-map",
      title: `Mapa de ${module.title}`,
      description: "Sequencia dos principais conceitos desta aula.",
      nodes,
    }
    : undefined;

  const difficultExercise = moduleExercises.find((exercise) => exercise.difficulty === "dificil");

  return enhanceModuleContent(subjectName, {
    title: module.title,
    objective: module.objective || moduleLessons[0]?.summary || "Estudar este modulo com explicacao, exemplos e pratica.",
    explanation: explanation.length > 0 ? explanation : [module.objective],
    examples: exampleBlocks.map((block) => ({
      title: block.title || "Exemplo",
      content: block.content,
    })),
    activities: moduleExercises.map(exerciseToActivity),
    learningPath: lessonTitles.length > 0 ? lessonTitles : undefined,
    sections: moduleBlocks.map(blockToSection),
    visual,
    review: {
      summary: reviewBlocks.length > 0 ? reviewBlocks.map((block) => block.content) : explanation.slice(0, 4),
      mentalMap: nodes.length > 0 ? nodes : lessonTitles.slice(0, 6),
      flashcards: moduleBlocks.slice(0, 3).map((block) => ({
        front: block.title || `Conceito de ${module.title}`,
        back: block.content,
      })),
    },
    miniChallenge: difficultExercise ? exerciseToActivity(difficultExercise) : undefined,
  });
}

function buildContentMap(remote: RemoteContent): SubjectModuleMap {
  const subjectsById = new Map(remote.subjects.map((subject) => [subject.id, subject]));
  const lessonsByModule = new Map<string, LessonRow[]>();
  const blocksByLesson = new Map<string, LessonBlockRow[]>();
  const exercisesByLesson = new Map<string, LessonExerciseRow[]>();
  const modulesBySubject = new Map<string, CourseModuleRow[]>();

  remote.modules.forEach((module) => {
    const current = modulesBySubject.get(module.subject_id) ?? [];
    modulesBySubject.set(module.subject_id, [...current, module]);
  });

  remote.lessons.forEach((lesson) => {
    const current = lessonsByModule.get(lesson.module_id) ?? [];
    lessonsByModule.set(lesson.module_id, [...current, lesson]);
  });

  remote.blocks.forEach((block) => {
    const current = blocksByLesson.get(block.lesson_id) ?? [];
    blocksByLesson.set(block.lesson_id, [...current, block]);
  });

  remote.exercises.forEach((exercise) => {
    const current = exercisesByLesson.get(exercise.lesson_id) ?? [];
    exercisesByLesson.set(exercise.lesson_id, [...current, exercise]);
  });

  const contentMap: SubjectModuleMap = {};

  modulesBySubject.forEach((modules, subjectId) => {
    const subject = subjectsById.get(subjectId);
    if (!subject) return;

    contentMap[subject.name] = bySortOrder(modules).map((module) =>
      buildModuleContent(
        subject.name,
        module,
        lessonsByModule.get(module.id) ?? [],
        blocksByLesson,
        exercisesByLesson,
      )
    );
  });

  return applyCuratedCurriculum(contentMap);
}

async function loadRemoteCourseContent(): Promise<SubjectModuleMap> {
  if (!supabase) {
    throw new Error("Nao foi possivel carregar o conteudo. Tente novamente.");
  }

  const [
    subjectsResult,
    modulesResult,
    lessonsResult,
    blocksResult,
    exercisesResult,
  ] = await Promise.all([
    supabase.from("subjects").select("id,name").eq("is_active", true).order("sort_order"),
    supabase
      .from("course_modules")
      .select("id,subject_id,title,objective,sort_order")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("lessons")
      .select("id,module_id,title,summary,sort_order")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("lesson_blocks")
      .select("id,lesson_id,block_type,title,content,sort_order")
      .order("sort_order"),
    supabase
      .from("lesson_exercises")
      .select("id,lesson_id,question,exercise_type,choices,correct_answer,explanation,difficulty,sort_order")
      .order("sort_order"),
  ]);

  const error = subjectsResult.error || modulesResult.error || lessonsResult.error || blocksResult.error || exercisesResult.error;
  if (error) throw error;

  return buildContentMap({
    subjects: (subjectsResult.data ?? []) as SubjectRow[],
    modules: (modulesResult.data ?? []) as CourseModuleRow[],
    lessons: (lessonsResult.data ?? []) as LessonRow[],
    blocks: (blocksResult.data ?? []) as LessonBlockRow[],
    exercises: (exercisesResult.data ?? []) as LessonExerciseRow[],
  });
}

export async function loadCourseContent(): Promise<SubjectModuleMap> {
  return loadRemoteCourseContent();
}
