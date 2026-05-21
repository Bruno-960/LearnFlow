export type SubjectActivity = {
  question: string;
  answer: string;
  choices?: string[];
  correctChoice?: number;
};

export type SubjectExample = {
  title: string;
  content: string;
};

export type SubjectModuleContent = {
  title: string;
  objective: string;
  explanation: string[];
  examples: SubjectExample[];
  activities: SubjectActivity[];
};

export const SUBJECT_MODULES: Record<string, SubjectModuleContent[]> = {
  "Português": [
    {
      title: "Morfologia",
      objective: "Reconhecer classes de palavras, flexões e processos de formação para interpretar efeitos de sentido.",
      explanation: [
        "Morfologia é o estudo da estrutura, da formação e da classificação das palavras. Ela responde a perguntas como: que tipo de palavra é esta? Ela varia? Como foi formada? Que papel geral ela costuma exercer no texto?",
        "As classes variáveis são substantivo, artigo, adjetivo, numeral, pronome e verbo. Elas podem sofrer flexão de gênero, número, pessoa, tempo, modo ou grau. As classes invariáveis são advérbio, preposição, conjunção e interjeição; em regra, não mudam de forma para concordar com outras palavras.",
        "Substantivos nomeiam seres, lugares, ideias, sentimentos e fenômenos. Adjetivos caracterizam substantivos. Verbos indicam ação, estado, fenômeno ou processo. Advérbios modificam verbos, adjetivos ou outros advérbios, acrescentando circunstâncias como tempo, lugar, modo, intensidade, afirmação, negação ou dúvida.",
        "Pronomes são fundamentais para coesão textual. Eles podem retomar termos já mencionados, antecipar informações ou indicar pessoas do discurso. Em interpretação, o referente de um pronome muitas vezes decide a alternativa correta.",
        "Preposições ligam termos e estabelecem relações de sentido: causa, finalidade, posse, origem, assunto, modo, instrumento. Conjunções ligam orações ou termos e indicam relações lógicas como oposição, conclusão, explicação, condição, causa e consequência.",
        "Em prova, o erro mais comum é tentar classificar a palavra isoladamente. A classe depende do contexto. 'Claro' pode ser adjetivo em 'dia claro', advérbio em 'fale claro' e marcador discursivo em 'claro, eu aceito'.",
      ],
      examples: [
        {
          title: "Substantivo e adjetivo",
          content: "Em 'A resposta rápida evitou o problema', 'resposta' é substantivo, pois nomeia algo; 'rápida' é adjetivo, pois caracteriza a resposta. Se a frase fosse 'Ela respondeu rápido', 'rápido' passaria a funcionar como advérbio de modo.",
        },
        {
          title: "Pronome e coesão",
          content: "Em 'Ana entregou o trabalho porque ela queria revisar antes da aula', o pronome 'ela' retoma Ana. Se houvesse outro referente feminino no período, poderia surgir ambiguidade.",
        },
        {
          title: "Conjunção com valor semântico",
          content: "Em 'Estudou muito, mas errou questões fáceis', 'mas' introduz oposição. Trocar por 'portanto' mudaria a relação lógica e deixaria a frase incoerente.",
        },
        {
          title: "Formação de palavras",
          content: "Em 'infelizmente', há derivação por prefixo e sufixo: in- + feliz + -mente. Perceber a formação ajuda a compreender sentido e tom avaliativo.",
        },
      ],
      activities: [
        {
          question: "Identifique a classe da palavra destacada em: 'Os alunos chegaram cedo'. Palavra: 'cedo'.",
          answer: "Advérbio de tempo, pois modifica o verbo 'chegaram' e indica quando a ação ocorreu.",
          choices: ["Substantivo", "Adjetivo", "Advérbio", "Preposição"],
          correctChoice: 2,
        },
        {
          question: "Na frase 'A cidade silenciosa amanheceu fria', quais palavras são adjetivos?",
          answer: "'silenciosa' e 'fria'. Ambas caracterizam o substantivo 'cidade'.",
        },
        {
          question: "Explique a diferença de função da palavra 'muito' em 'muito estudo' e 'estudou muito'.",
          answer: "Em 'muito estudo', 'muito' acompanha o substantivo 'estudo' e funciona como pronome indefinido. Em 'estudou muito', modifica o verbo 'estudou' e funciona como advérbio de intensidade.",
        },
        {
          question: "Em 'Ele não veio porque estava doente', qual é a relação expressa por 'porque'?",
          answer: "'porque' introduz causa ou explicação: o motivo de ele não ter vindo foi estar doente.",
          choices: ["Oposição", "Causa", "Conclusão", "Comparação"],
          correctChoice: 1,
        },
        {
          question: "Classifique 'alegre' em: 'A criança alegre brincava' e 'A criança brincava alegre'.",
          answer: "Na primeira frase, 'alegre' é adjetivo, pois caracteriza 'criança'. Na segunda, pode ter valor adverbial, indicando o modo como a criança brincava.",
        },
      ],
    },
    {
      title: "Sintaxe",
      objective: "Analisar termos da oração, relações de dependência e efeitos de organização sintática.",
      explanation: [
        "Sintaxe estuda como as palavras se organizam dentro da oração e qual função cada termo exerce. Enquanto a morfologia classifica a palavra, a sintaxe analisa o papel dela em uma estrutura.",
        "O primeiro passo de uma análise sintática é localizar o verbo. A partir dele, é possível perguntar: quem pratica ou sofre a ação? O verbo exige complemento? Há informação de tempo, lugar, modo, causa ou finalidade?",
        "Sujeito é o termo sobre o qual se declara algo. Pode ser simples, composto, oculto, indeterminado ou inexistente. Predicado é aquilo que se declara sobre o sujeito e pode ter núcleo verbal, nominal ou verbo-nominal.",
        "Complementos verbais completam o sentido de verbos transitivos. Objeto direto não exige preposição obrigatória; objeto indireto exige. Complemento nominal completa o sentido de nomes, como substantivos abstratos, adjetivos ou advérbios.",
        "Adjuntos são termos acessórios, mas importantes para o sentido. Adjunto adnominal acompanha um substantivo, caracterizando ou determinando-o. Adjunto adverbial indica circunstâncias da ação, como tempo, lugar, modo, causa e intensidade.",
        "A sintaxe também ajuda a evitar ambiguidade. Em 'Vi o homem com o binóculo', não fica claro se eu usei o binóculo ou se o homem estava com ele. A organização da frase interfere diretamente na clareza.",
      ],
      examples: [
        {
          title: "Sujeito e predicado",
          content: "Em 'A leitura diária melhora a escrita', o sujeito é 'A leitura diária' e o predicado é 'melhora a escrita'. O núcleo do sujeito é 'leitura'.",
        },
        {
          title: "Objeto direto e indireto",
          content: "Em 'A turma resolveu o exercício', 'o exercício' é objeto direto. Em 'A turma precisou de ajuda', 'de ajuda' é objeto indireto.",
        },
        {
          title: "Complemento nominal",
          content: "Em 'Ele tinha medo de altura', 'de altura' completa o sentido do substantivo abstrato 'medo', portanto é complemento nominal.",
        },
        {
          title: "Adjunto adverbial",
          content: "Em 'Durante a tarde, os alunos revisaram sintaxe com atenção', 'Durante a tarde' indica tempo e 'com atenção' indica modo.",
        },
      ],
      activities: [
        {
          question: "Separe sujeito e predicado: 'A leitura diária melhora a escrita'.",
          answer: "Sujeito: 'A leitura diária'. Predicado: 'melhora a escrita'.",
        },
        {
          question: "Classifique o complemento verbal em: 'Os alunos precisam de orientação'.",
          answer: "'de orientação' é objeto indireto, pois completa o verbo 'precisar', que exige preposição.",
          choices: ["Objeto direto", "Objeto indireto", "Predicativo do sujeito", "Adjunto adnominal"],
          correctChoice: 1,
        },
        {
          question: "Identifique o adjunto adverbial em: 'Durante a prova, mantenha a calma'.",
          answer: "'Durante a prova' é adjunto adverbial de tempo.",
        },
        {
          question: "Em 'Os estudantes estavam confiantes', qual é o predicativo do sujeito?",
          answer: "'confiantes', pois atribui uma característica ao sujeito 'Os estudantes' por meio do verbo de ligação 'estavam'.",
          choices: ["Os estudantes", "estavam", "confiantes", "Não há predicativo"],
          correctChoice: 2,
        },
        {
          question: "Explique a ambiguidade em: 'O professor viu o aluno com o telescópio'.",
          answer: "A frase permite duas leituras: o professor usou o telescópio para ver o aluno, ou o aluno estava com o telescópio. A posição do termo 'com o telescópio' causa a ambiguidade.",
        },
      ],
    },
    {
      title: "Redação",
      objective: "Planejar e escrever texto dissertativo-argumentativo com tese, repertório, desenvolvimento e intervenção.",
      explanation: [
        "A redação do ENEM cobra um texto dissertativo-argumentativo em norma-padrão. Isso significa defender uma tese sobre um problema social brasileiro, usando argumentos organizados e proposta de intervenção.",
        "A introdução precisa cumprir duas funções: contextualizar o tema e apresentar a tese. Contextualizar é situar o problema; tese é a posição que será defendida. Uma tese forte geralmente antecipa dois eixos argumentativos.",
        "O desenvolvimento deve explicar causas, consequências, obstáculos ou responsabilidades. Um bom parágrafo argumentativo apresenta tópico frasal, repertório ou dado, análise e fechamento conectado à tese.",
        "Repertório sociocultural só funciona quando é pertinente e produtivo. Citar uma obra, lei, conceito ou autor sem explicar a relação com o tema enfraquece o texto. O repertório deve ajudar a provar o argumento.",
        "A conclusão precisa apresentar proposta de intervenção completa: agente, ação, meio ou modo, finalidade e detalhamento. A proposta deve respeitar direitos humanos e atacar um problema discutido no desenvolvimento.",
        "Coesão é decisiva. Use conectivos para guiar o leitor: 'nesse sentido', 'além disso', 'contudo', 'portanto', 'desse modo'. Eles não substituem argumento, mas deixam a progressão lógica mais clara.",
      ],
      examples: [
        {
          title: "Tese com dois eixos",
          content: "Tema: evasão escolar. Tese: 'A evasão escolar persiste devido à desigualdade socioeconômica e à baixa integração entre escola e realidade do estudante'. Os dois eixos já indicam os parágrafos de desenvolvimento.",
        },
        {
          title: "Tópico frasal",
          content: "Em primeiro lugar, a vulnerabilidade econômica força muitos jovens a priorizarem trabalho e renda imediata em vez da permanência escolar.",
        },
        {
          title: "Uso produtivo de repertório",
          content: "Ao citar a Constituição Federal, explique o vínculo: se a educação é direito social, a evasão revela falha na garantia prática desse direito.",
        },
        {
          title: "Intervenção completa",
          content: "O Ministério da Educação deve ampliar bolsas de permanência, por meio de repasses mensais a estudantes vulneráveis, para reduzir a evasão no ensino médio, com prioridade a regiões de maior abandono escolar.",
        },
      ],
      activities: [
        {
          question: "Crie uma tese para o tema: 'Desafios para combater a desinformação nas redes sociais'.",
          answer: "Uma boa tese deve apresentar posição clara e dois eixos, por exemplo: 'O combate à desinformação é dificultado pela baixa educação midiática da população e pela responsabilização insuficiente das plataformas digitais'.",
        },
        {
          question: "Transforme a opinião 'as pessoas leem pouco' em argumento.",
          answer: "Exemplo: 'A baixa frequência de leitura limita o vocabulário e dificulta a interpretação de textos complexos, o que prejudica o desempenho escolar e a participação cidadã'.",
        },
        {
          question: "Quais são os cinco elementos esperados em uma proposta de intervenção completa?",
          answer: "Agente, ação, meio ou modo, finalidade e detalhamento.",
          choices: ["Tema, título, resumo, tese e conclusão", "Agente, ação, meio, finalidade e detalhamento", "Causa, consequência, oposição, exemplo e título", "Introdução, desenvolvimento, conclusão, imagem e fonte"],
          correctChoice: 1,
        },
        {
          question: "Escreva um tópico frasal para um parágrafo sobre cyberbullying.",
          answer: "Resposta esperada: uma frase inicial que apresente o argumento do parágrafo, como 'O cyberbullying se intensifica pela falsa sensação de anonimato nas redes sociais'.",
        },
        {
          question: "Explique por que repertório sem análise não fortalece a redação.",
          answer: "Porque citar uma referência não prova o argumento sozinho. É necessário explicar como essa referência se relaciona ao tema e sustenta a tese.",
        },
      ],
    },
    {
      title: "Interpretação de Texto",
      objective: "Identificar tema, tese, inferências, intenção comunicativa e efeitos de linguagem em diferentes gêneros.",
      explanation: [
        "Interpretar texto é construir sentido a partir de pistas. Isso envolve informações explícitas, inferências, contexto, gênero textual, escolhas linguísticas e intenção comunicativa.",
        "O tema é o assunto geral do texto. A tese é a posição defendida sobre esse assunto. Em textos argumentativos, localizar tese e argumentos ajuda a eliminar alternativas que citam detalhes, mas não captam a ideia central.",
        "Inferência é uma conclusão baseada em evidências textuais. Ela não deve contradizer o texto nem depender apenas de conhecimento externo. Uma boa inferência nasce de marcas linguísticas, relações entre ideias e contexto.",
        "O gênero textual orienta a leitura. Uma notícia prioriza informação; um artigo de opinião defende ponto de vista; uma charge costuma usar humor, ironia e imagem; uma campanha tenta persuadir o público a agir.",
        "A intenção comunicativa pode ser informar, criticar, convencer, denunciar, ironizar, instruir, emocionar ou advertir. Verbos do comando da questão indicam o caminho: 'sugere', 'critica', 'evidencia', 'denuncia'.",
        "Em textos multimodais, não leia apenas a legenda. Observe imagem, cor, posição dos elementos, expressões faciais, contraste, símbolos e relação entre linguagem verbal e não verbal.",
      ],
      examples: [
        {
          title: "Tema e tese",
          content: "Tema: uso de celulares na escola. Tese: 'O celular pode prejudicar a concentração quando usado sem finalidade pedagógica'. O tema é amplo; a tese é uma posição específica.",
        },
        {
          title: "Inferência válida",
          content: "Se uma personagem evita olhar nos olhos e muda de assunto, pode-se inferir desconforto, desde que o contexto mostre tensão na conversa.",
        },
        {
          title: "Ironia",
          content: "Dizer 'que ótimo' diante de uma notícia ruim pode criar ironia, porque há contraste entre a expressão positiva e a situação negativa.",
        },
        {
          title: "Charge",
          content: "Numa charge sobre desperdício de água, uma torneira aberta e uma pessoa indiferente podem criticar comportamento social sem precisar explicar tudo em palavras.",
        },
      ],
      activities: [
        {
          question: "Qual é a diferença entre tema e tese?",
          answer: "Tema é o assunto tratado. Tese é a posição defendida sobre esse assunto.",
        },
        {
          question: "Explique por que uma inferência precisa estar apoiada no texto.",
          answer: "Porque interpretação válida depende de pistas textuais. Sem evidência, a resposta vira opinião externa ao texto.",
        },
        {
          question: "Ao ler uma charge, que elementos devem ser observados além das palavras?",
          answer: "Imagem, expressões, cenário, símbolos, exageros visuais, contraste e relação com o contexto social.",
        },
        {
          question: "Se o comando pergunta 'o texto critica', que tipo de alternativa tende a ser correta?",
          answer: "A alternativa que identifica o alvo da crítica e o sentido avaliativo do texto, não apenas uma informação literal.",
          choices: ["Uma descrição neutra", "Uma informação isolada", "O alvo da crítica", "Uma opinião sem base no texto"],
          correctChoice: 2,
        },
        {
          question: "Crie uma inferência possível para: 'Ao receber a notícia, ele sorriu, mas suas mãos tremiam'.",
          answer: "Pode-se inferir nervosismo, medo ou tensão, porque o sorriso contrasta com a reação física das mãos trêmulas.",
        },
      ],
    },
  ],
  "Matemática": [
    {
      title: "Funções",
      objective: "Compreender relações entre grandezas, lei de formação, tabelas, gráficos e interpretação de situações.",
      explanation: [
        "Função é uma relação em que cada valor de entrada está associado a exatamente um valor de saída. A entrada costuma ser chamada de x, e a saída, de f(x) ou y.",
        "O mais importante em problemas contextualizados é entender o que cada variável representa. Em uma função de custo, x pode ser quantidade de produtos; em uma função de distância, x pode ser tempo.",
        "Função afim tem forma f(x) = ax + b. O coeficiente a indica taxa de variação: se é positivo, a função cresce; se é negativo, decresce. O coeficiente b indica o valor inicial, isto é, f(0).",
        "Função quadrática tem forma f(x) = ax² + bx + c. Seu gráfico é uma parábola. Quando a > 0, a parábola tem mínimo; quando a < 0, tem máximo. Isso aparece em lucro, área, lançamento e otimização.",
        "Gráficos de funções devem ser lidos com atenção aos eixos. Um mesmo desenho pode representar crescimento rápido, queda lenta, estabilidade ou mudança de tendência. A unidade de medida altera a interpretação.",
        "No ENEM, muitas questões de função não pedem 'resolva a equação', mas sim 'qual modelo representa a situação', 'qual intervalo apresenta maior crescimento' ou 'qual valor satisfaz a condição'.",
      ],
      examples: [
        {
          title: "Função afim de custo",
          content: "Uma corrida custa R$ 8,00 fixos mais R$ 2,50 por quilômetro. Se x é a distância, C(x) = 8 + 2,5x. Para 10 km, C(10) = 8 + 25 = 33 reais.",
        },
        {
          title: "Taxa de variação",
          content: "Em P(t) = 100 + 20t, o valor 20 indica aumento de 20 unidades a cada período. O valor 100 é a quantidade inicial.",
        },
        {
          title: "Raiz da função",
          content: "Se f(x) = 2x - 10, a raiz ocorre quando f(x) = 0. Então 2x - 10 = 0, logo x = 5.",
        },
        {
          title: "Modelo quadrático",
          content: "Se a área de um retângulo depende de x e aparece termo x², provavelmente há uma função quadrática. Isso é comum quando os dois lados variam ao mesmo tempo.",
        },
      ],
      activities: [
        {
          question: "Uma assinatura custa R$ 30,00 mais R$ 5,00 por aula. Escreva a função do custo para x aulas.",
          answer: "C(x) = 30 + 5x. O 30 é fixo e o 5 multiplica a quantidade de aulas.",
        },
        {
          question: "Calcule f(6) para f(x) = 2x - 7.",
          answer: "f(6) = 2 · 6 - 7 = 12 - 7 = 5.",
        },
        {
          question: "Na função f(x) = -4x + 20, a função é crescente ou decrescente?",
          answer: "Decrescente, pois o coeficiente angular é negativo.",
          choices: ["Crescente", "Decrescente", "Constante", "Não é função"],
          correctChoice: 1,
        },
        {
          question: "Qual é a raiz da função f(x) = 3x - 12?",
          answer: "A raiz ocorre quando f(x) = 0. Então 3x - 12 = 0, logo x = 4.",
          choices: ["3", "4", "9", "12"],
          correctChoice: 1,
        },
        {
          question: "Explique o significado de f(0) em uma função de custo.",
          answer: "f(0) representa o custo quando a quantidade variável é zero. Em muitos problemas, é a taxa fixa ou valor inicial.",
        },
      ],
    },
    {
      title: "Geometria Plana",
      objective: "Resolver problemas com perímetro, área, ângulos e propriedades de figuras planas.",
      explanation: [
        "Geometria plana estuda figuras bidimensionais, como triângulos, quadriláteros, círculos e polígonos. Ela aparece em problemas de terrenos, plantas, embalagens, mosaicos, mapas e escalas.",
        "Perímetro é a medida do contorno. Área é a medida da superfície. Em uma situação prática, cercar um terreno envolve perímetro; pintar uma parede ou plantar grama envolve área.",
        "Triângulos têm soma dos ângulos internos igual a 180°. A área é calculada por base vezes altura dividido por 2. Em triângulos retângulos, o Teorema de Pitágoras relaciona catetos e hipotenusa.",
        "Quadriláteros exigem atenção ao tipo de figura. Retângulo tem lados opostos paralelos e ângulos retos. Quadrado é um retângulo com todos os lados iguais. Trapézio possui um par de lados paralelos.",
        "No círculo, raio é a distância do centro até a borda; diâmetro é o dobro do raio. O comprimento da circunferência é 2πr, e a área do círculo é πr².",
        "Em provas, desenhos podem não estar em escala. Por isso, não confie apenas na aparência. Use as medidas fornecidas, relações geométricas e unidades corretas.",
      ],
      examples: [
        {
          title: "Área do retângulo",
          content: "Um retângulo de base 8 m e altura 3 m tem área A = 8 · 3 = 24 m². Seu perímetro é P = 2 · (8 + 3) = 22 m.",
        },
        {
          title: "Área do triângulo",
          content: "Um triângulo com base 10 cm e altura 6 cm tem área A = (10 · 6) / 2 = 30 cm².",
        },
        {
          title: "Pitágoras",
          content: "Em um triângulo retângulo com catetos 3 e 4, a hipotenusa h satisfaz h² = 3² + 4² = 25. Logo, h = 5.",
        },
        {
          title: "Circunferência",
          content: "Se o raio é 5 cm, o comprimento é C = 2πr = 10π cm. Usando π = 3,14, C = 31,4 cm.",
        },
      ],
      activities: [
        {
          question: "Calcule o perímetro de um quadrado de lado 7 cm.",
          answer: "P = 4 · 7 = 28 cm.",
        },
        {
          question: "Calcule a área de um círculo de raio 3 cm usando π = 3,14.",
          answer: "A = πr² = 3,14 · 9 = 28,26 cm².",
        },
        {
          question: "Um triângulo tem ângulos 50° e 60°. Qual é o terceiro ângulo?",
          answer: "70°, pois a soma dos ângulos internos de um triângulo é 180°.",
          choices: ["60°", "70°", "80°", "90°"],
          correctChoice: 1,
        },
        {
          question: "Um retângulo tem área 48 m² e base 12 m. Qual é a altura?",
          answer: "A = base · altura. Então 48 = 12 · h, logo h = 4 m.",
          choices: ["3 m", "4 m", "6 m", "12 m"],
          correctChoice: 1,
        },
        {
          question: "Explique a diferença entre raio e diâmetro.",
          answer: "Raio é a distância do centro até a circunferência. Diâmetro é o segmento que passa pelo centro e liga dois pontos da circunferência; ele mede o dobro do raio.",
        },
      ],
    },
    {
      title: "Estatística",
      objective: "Interpretar dados, gráficos e medidas como média, mediana, moda, amplitude e dispersão.",
      explanation: [
        "Estatística é a área da Matemática que coleta, organiza, resume e interpreta dados. Ela é central em pesquisas, economia, saúde, educação, eleições e análise de desempenho.",
        "Média aritmética é a soma dos valores dividida pela quantidade de dados. Ela é útil para resumir um conjunto, mas pode ser distorcida por valores extremos.",
        "Mediana é o valor central após ordenar os dados. Quando há quantidade par de valores, a mediana é a média dos dois valores centrais. Ela costuma representar melhor conjuntos com extremos muito altos ou baixos.",
        "Moda é o valor que mais aparece. Um conjunto pode não ter moda, ter uma moda ou ter mais de uma moda. Em pesquisas de preferência, a moda pode ser mais informativa que a média.",
        "Amplitude é a diferença entre o maior e o menor valor. Ela dá uma noção simples de dispersão, mas não mostra como os dados se distribuem internamente.",
        "Em gráficos, leia título, legenda, eixos, escala e unidade. Muitas questões usam escalas quebradas, porcentagens ou valores acumulados para testar atenção interpretativa.",
      ],
      examples: [
        {
          title: "Média",
          content: "Notas 6, 7, 8 e 9 têm média (6 + 7 + 8 + 9) / 4 = 7,5.",
        },
        {
          title: "Mediana ímpar",
          content: "Dados 2, 4, 5, 9, 12 têm mediana 5, pois é o valor central após ordenação.",
        },
        {
          title: "Mediana par",
          content: "Dados 3, 5, 8, 10 têm mediana (5 + 8) / 2 = 6,5.",
        },
        {
          title: "Valor extremo",
          content: "Em salários 1500, 1600, 1700, 1800 e 20000, a média sobe muito por causa de 20000. A mediana pode representar melhor a realidade do grupo.",
        },
      ],
      activities: [
        {
          question: "Calcule a média dos valores 10, 12, 14 e 20.",
          answer: "Média = (10 + 12 + 14 + 20) / 4 = 56 / 4 = 14.",
        },
        {
          question: "Encontre a mediana de 3, 8, 10, 11, 20.",
          answer: "10, pois é o valor central na lista ordenada.",
          choices: ["8", "10", "11", "20"],
          correctChoice: 1,
        },
        {
          question: "Explique por que um valor muito alto pode distorcer a média.",
          answer: "Porque a média usa todos os valores na soma. Um valor extremo aumenta o resultado e pode fazer a média deixar de representar a maioria dos dados.",
        },
        {
          question: "Qual é a amplitude dos valores 4, 7, 9, 15 e 20?",
          answer: "Amplitude = maior valor - menor valor = 20 - 4 = 16.",
          choices: ["11", "13", "16", "20"],
          correctChoice: 2,
        },
        {
          question: "Em uma pesquisa de sabores preferidos, por que a moda pode ser útil?",
          answer: "Porque a moda indica o valor mais frequente, ou seja, o sabor mais escolhido pelos participantes.",
        },
      ],
    },
    {
      title: "Trigonometria",
      objective: "Usar seno, cosseno, tangente e relações em triângulos retângulos para resolver problemas.",
      explanation: [
        "Trigonometria relaciona ângulos e lados. No estudo inicial, o foco é o triângulo retângulo, formado por um ângulo de 90° e dois ângulos agudos.",
        "A hipotenusa é o maior lado e fica oposta ao ângulo de 90°. Em relação a um ângulo agudo, o cateto oposto fica em frente a ele; o cateto adjacente encosta nele.",
        "Seno é cateto oposto dividido pela hipotenusa. Cosseno é cateto adjacente dividido pela hipotenusa. Tangente é cateto oposto dividido pelo cateto adjacente.",
        "Antes de escolher a razão trigonométrica, identifique o ângulo de referência e os lados conhecidos. Se o problema envolve altura e rampa, geralmente aparece seno. Se envolve distância horizontal e altura, pode aparecer tangente.",
        "Ângulos notáveis ajudam em cálculos frequentes: sen 30° = 1/2, cos 60° = 1/2, sen 45° = cos 45° = √2/2, tg 45° = 1.",
        "No ENEM, trigonometria costuma aparecer em situações de sombra, inclinação, altura de prédios, rampas, escadas, observação de objetos e deslocamentos.",
      ],
      examples: [
        {
          title: "Seno",
          content: "Se o cateto oposto mede 6 e a hipotenusa mede 10, então sen(θ) = 6/10 = 0,6.",
        },
        {
          title: "Cosseno",
          content: "Se o cateto adjacente mede 8 e a hipotenusa mede 10, então cos(θ) = 8/10 = 0,8.",
        },
        {
          title: "Tangente",
          content: "Se o cateto oposto mede 3 e o adjacente mede 4, então tg(θ) = 3/4 = 0,75.",
        },
        {
          title: "Rampa",
          content: "Uma rampa de 10 m faz ângulo com o chão, e a altura é 5 m. Como altura é cateto oposto e rampa é hipotenusa, usa-se seno: sen(θ) = 5/10 = 0,5.",
        },
      ],
      activities: [
        {
          question: "Em um triângulo retângulo, o cateto oposto mede 5 e a hipotenusa mede 13. Qual é o seno do ângulo?",
          answer: "sen(θ) = cateto oposto / hipotenusa = 5/13.",
        },
        {
          question: "Uma rampa forma um triângulo retângulo. Qual razão trigonométrica relaciona altura e comprimento da rampa?",
          answer: "Seno, pois relaciona cateto oposto à hipotenusa.",
          choices: ["Seno", "Cosseno", "Tangente", "Moda"],
          correctChoice: 0,
        },
        {
          question: "Se tg(θ) = 1, o que isso indica sobre os catetos oposto e adjacente?",
          answer: "Indica que os catetos têm a mesma medida, pois tg(θ) = oposto / adjacente = 1.",
        },
        {
          question: "Qual razão relaciona cateto adjacente e hipotenusa?",
          answer: "Cosseno.",
          choices: ["Seno", "Cosseno", "Tangente", "Amplitude"],
          correctChoice: 1,
        },
        {
          question: "Explique por que é importante definir o ângulo de referência antes de usar seno, cosseno ou tangente.",
          answer: "Porque os catetos oposto e adjacente dependem do ângulo escolhido. Se o ângulo muda, a identificação dos lados também pode mudar.",
        },
      ],
    },
  ],
};
