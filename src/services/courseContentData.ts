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

function enhanceModuleContent(subjectName: string, content: SubjectModuleContent): SubjectModuleContent {
  if (subjectName === "Português") return enhancePortugueseModuleContent(content);
  return content;
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
      paragraphs: [topic.description],
      whyItMatters: "Este conteúdo aparece em exercícios, simulados e na leitura de problemas com contexto.",
    } satisfies SubjectLessonSection)),
  ];

  return {
    title: seed.title,
    objective: seed.objective,
    explanation: [seed.overview, ...seed.topics.map((topic) => `${topic.title}: ${topic.description}`)],
    examples: seed.topics.slice(0, 4).map((topic, index) => ({
      title: index === 0 ? `Exemplo guiado: ${topic.title}` : `Aplicação: ${topic.title}`,
      content: `Observe a definição, identifique os dados do problema e explique em uma frase como ${topic.title.toLowerCase()} ajuda a resolver a situação. ${topic.description}`,
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
      title: "1ª Série: Base e Compreensão Textual",
      objective: "Nivelar conhecimentos de língua portuguesa e desenvolver leitura crítica.",
      overview: "A 1ª série organiza a base de leitura, gramática aplicada, sintaxe inicial e produção textual curta.",
      topics: [
        {
          title: "Leitura e interpretação",
          description: "Gêneros textuais como contos, crônicas, notícias e artigos, com foco em finalidade, público, linguagem e efeito de sentido.",
        },
        {
          title: "Denotação, conotação e funções da linguagem",
          description: "Diferença entre sentido literal e figurado, intenção comunicativa e reconhecimento das funções presentes no texto.",
        },
        {
          title: "Intertextualidade",
          description: "Relações entre textos, repertórios culturais, citações, paródias e referências usadas para construir sentido.",
        },
        {
          title: "Fonética, ortografia, acentuação e crase",
          description: "Revisão das regras que sustentam escrita formal, leitura correta e segurança em questões gramaticais.",
        },
        {
          title: "Estrutura e formação de palavras",
          description: "Radical, prefixos, sufixos, composição, derivação e efeitos de sentido criados pela escolha vocabular.",
        },
        {
          title: "Orações coordenadas e subordinadas",
          description: "Introdução às relações sintáticas entre orações substantivas, adjetivas e adverbiais.",
        },
        {
          title: "Resumo, narração e descrição",
          description: "Técnicas para sintetizar ideias, organizar fatos e construir cenas com clareza.",
        },
      ],
      activityPrompt: "Qual é a função principal da 1ª série em Português?",
      activityAnswer: "Construir base de leitura crítica, gramática aplicada e produção textual inicial.",
    }),
    createCurriculumModule({
      title: "2ª Série: Aprofundamento e Argumentação",
      objective: "Aprofundar análise textual e construir textos dissertativo-argumentativos.",
      overview: "A 2ª série aproxima leitura crítica, sintaxe e escrita argumentativa para preparar o aluno para redações e questões interpretativas.",
      topics: [
        {
          title: "Coesão e coerência",
          description: "Uso de conectivos, retomadas, progressão temática e organização lógica entre frases e parágrafos.",
        },
        {
          title: "Figuras de linguagem",
          description: "Identificação de metáfora, metonímia, ironia, antítese, hipérbole e seus efeitos de sentido.",
        },
        {
          title: "Textos publicitários e de opinião",
          description: "Leitura de anúncios, campanhas, artigos e editoriais, observando persuasão, tese e público-alvo.",
        },
        {
          title: "Concordância verbal e nominal",
          description: "Relações entre sujeito, verbo, nomes e determinantes para garantir clareza e norma-padrão.",
        },
        {
          title: "Regência verbal e nominal",
          description: "Estudo das relações entre termos regentes e complementos, incluindo preposições exigidas.",
        },
        {
          title: "Colocação pronominal",
          description: "Próclise, mesóclise e ênclise em contextos formais, literários e de prova.",
        },
        {
          title: "Dissertação, tese e repertório",
          description: "Estrutura do texto argumentativo, construção de tese, seleção de repertório sociocultural e desenvolvimento de argumentos.",
        },
      ],
      activityPrompt: "Qual habilidade deve ficar mais forte na 2ª série?",
      activityAnswer: "Construir argumentos claros com coesão, repertório e domínio gramatical.",
    }),
    createCurriculumModule({
      title: "3ª Série: Revisão, Literatura e Mundo do Trabalho",
      objective: "Consolidar leitura, literatura e redação para ENEM, vestibulares e vida profissional.",
      overview: "A 3ª série revisa pontos avançados, organiza literatura brasileira e intensifica a escrita no modelo ENEM e em gêneros digitais.",
      topics: [
        {
          title: "Ambiguidade e semântica",
          description: "Estudo de múltiplos sentidos, polissemia, sinonímia, antonímia e efeitos criados pela escolha das palavras.",
        },
        {
          title: "Sintaxe do período composto",
          description: "Revisão integrada de coordenação, subordinação e relações lógico-discursivas entre orações.",
        },
        {
          title: "Variação linguística",
          description: "Reconhecimento de variedades regionais, sociais, históricas e situacionais, sem preconceito linguístico.",
        },
        {
          title: "Literatura brasileira",
          description: "Movimentos do Quinhentismo ao Modernismo e à contemporaneidade, com análise de contexto, estética e obras obrigatórias.",
        },
        {
          title: "Redação modelo ENEM",
          description: "Introdução, desenvolvimento, repertório, argumentação e proposta de intervenção detalhada.",
        },
        {
          title: "Gêneros digitais e mundo do trabalho",
          description: "Leitura e produção de textos digitais, comunicação profissional, clareza, adequação e autoria.",
        },
      ],
      activityPrompt: "Qual é o foco principal da 3ª série em Português?",
      activityAnswer: "Revisar conteúdos avançados e aplicar leitura, literatura e redação em provas e contextos reais.",
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

function applyCuratedCurriculum(contentMap: SubjectModuleMap): SubjectModuleMap {
  const nextMap = { ...contentMap };
  const subjectNames = Object.keys(nextMap);
  const portugueseKey = subjectNames.find((name) => normalizeText(name) === "portugues") ?? "Português";
  const mathKey = subjectNames.find((name) => normalizeText(name) === "matematica") ?? "Matemática";

  nextMap[portugueseKey] = buildPortugueseCurriculumModules();
  nextMap[mathKey] = buildMathCurriculumModules();

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
