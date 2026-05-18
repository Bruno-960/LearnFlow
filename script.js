(function () {
    'use strict';

    // ========== HELPERS ==========
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => document.querySelectorAll(s);
    const saveData = (key, data) => localStorage.setItem('learnflow_' + key, JSON.stringify(data));
    const loadData = (key) => JSON.parse(localStorage.getItem('learnflow_' + key) || 'null');
    const todayStr = () => {
        const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
        return d.toISOString().split('T')[0];
    };
    const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');

    // ========== ESTADO ==========
    let currentTab = 'dashboard';
    let calYear, calMonth;
    let pomodoroInterval, pomodoroTime = 25 * 60, pomodoroRunning = false;
    let streak = loadData('streak') || 0;
    let pontos = loadData('pontos') || 0;
    let nivel = loadData('nivel') || 1;
    const hoje = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    calYear = hoje.getFullYear();
    calMonth = hoje.getMonth();

    // ========== FERIADOS ==========
    const feriados = {
        '2026-01-01': 'Confraternização', '2026-04-21': 'Tiradentes', '2026-05-01': 'Trabalho',
        '2026-06-04': 'Corpus Christi', '2026-09-07': 'Independência', '2026-10-12': 'Aparecida',
        '2026-11-02': 'Finados', '2026-11-15': 'Proclamação', '2026-12-25': 'Natal'
    };

    // ========== DADOS DOS ESTUDOS ==========
    const categoriasEstudos = {
        ensinoMedio: {
            titulo: "Ensino Médio",
            materias: [
                { nome: "Português", id: "portugues", modulos: [
                    { id: 'interpretacao', titulo: 'Interpretação de Texto', dificuldade: 'basico', desc: 'Técnicas de leitura e compreensão' },
                    { id: 'classes-gramaticais', titulo: 'Classes Gramaticais', dificuldade: 'basico', desc: 'Substantivos, adjetivos, verbos e mais' },
                    { id: 'regencia', titulo: 'Regência Verbal', dificuldade: 'intermediario', desc: 'Verbos e suas preposições' },
                    { id: 'figuras-linguagem', titulo: 'Figuras de Linguagem', dificuldade: 'intermediario', desc: 'Metáfora, metonímia e outras' },
                    { id: 'concordancia', titulo: 'Concordância Nominal e Verbal', dificuldade: 'avancado', desc: 'Regras de concordância' },
                    { id: 'redacao-dissertativa', titulo: 'Redação Dissertativa', dificuldade: 'avancado', desc: 'Estrutura e argumentação' }
                ]},
                { nome: "Matemática", id: "matematica", modulos: [
                    { id: 'porcentagem', titulo: 'Porcentagem', dificuldade: 'basico', desc: 'Cálculos percentuais' },
                    { id: 'equacao-1grau', titulo: 'Equação do 1º Grau', dificuldade: 'basico', desc: 'Resolução de equações lineares' },
                    { id: 'progressao-aritmetica', titulo: 'Progressão Aritmética', dificuldade: 'intermediario', desc: 'Sequências e razão' },
                    { id: 'funcao-2grau', titulo: 'Função do 2º Grau', dificuldade: 'avancado', desc: 'Parábolas e vértices' }
                ]},
                { nome: "Química", id: "quimica", modulos: [
                    { id: 'tabela-periodica', titulo: 'Tabela Periódica', dificuldade: 'basico', desc: 'Propriedades e organização' },
                    { id: 'ligacoes-quimicas', titulo: 'Ligações Químicas', desc: 'Iônica, covalente e metálica' }
                ]},
                { nome: "Física", id: "fisica", modulos: [
                    { id: 'cinematica', titulo: 'Cinemática', dificuldade: 'basico', desc: 'Movimento uniforme e variado' },
                    { id: 'leis-newton', titulo: 'Leis de Newton', dificuldade: 'intermediario', desc: 'Mecânica clássica' }
                ]}
            ]
        },
        enem: {
            titulo: "ENEM",
            materias: [
                { nome: "Redação ENEM", id: "redacao-enem", modulos: [] },
                { nome: "Questões ENEM", id: "questoes-enem", modulos: [] }
            ]
        }
    };

   // ========== CONTEÚDOS DOS MÓDULOS ==========
const conteudosModulos = {
    'interpretacao': {
        titulo: 'Interpretação de Texto',
        descricao: 'Aprenda a compreender, analisar e interpretar diferentes tipos de textos, desenvolvendo senso crítico e capacidade de identificar sentidos explícitos e implícitos na comunicação escrita e visual.',
        semNiveis: true,
        topicos: [
            {
                numero: '01', titulo: 'O que é Interpretar um Texto?',
                conteudo: '<p>Ler é muito mais do que simplesmente decodificar letras e palavras. A <strong>compreensão</strong> textual é a capacidade de entender aquilo que está explícito, ou seja, as informações que o autor apresenta de forma direta e clara no texto.</p><p>Já a <strong>interpretação</strong> vai além: é a habilidade de perceber o que está nas entrelinhas, captando as intenções, os pressupostos e os sentidos implícitos que o autor deixou no texto sem dizê-los abertamente.</p><p>No dia a dia, interpretamos o tempo todo: uma mensagem de texto com um "ok" seco pode significar concordância, mas também pode indicar descontentamento, dependendo do contexto e da relação entre as pessoas.</p>',
                exemplos: [{ texto: 'Um amigo te manda a mensagem: "Nossa, que legal você ter furado comigo."', interpretacao: 'Embora a frase pareça positiva, a palavra "furando" e o contexto indicam que seu amigo está sendo <strong>irônico</strong> e, na verdade, está chateado porque você não compareceu.' }],
                dicas: [{ texto: 'Sempre leia o texto mais de uma vez. Na primeira leitura, foque em entender o tema geral. Na segunda, preste atenção aos detalhes e às palavras que indicam o posicionamento do autor.' }],
                erros: [{ texto: 'Muitas pessoas confundem <strong>compreensão</strong> com <strong>interpretação</strong>. A compreensão é o que está escrito; a interpretação é o que está implícito. As questões mais difíceis sempre cobram interpretação.' }],
                exercicios: [{ pergunta: 'Qual a diferença fundamental entre compreender e interpretar um texto?', opcoes: ['Não há diferença; são sinônimos', 'Compreender é captar o explícito; interpretar é perceber o implícito', 'Interpretar é mais fácil que compreender', 'Compreender é para textos difíceis; interpretar, para fáceis'], resposta: 1, comentario: 'Exatamente! A compreensão lida com o que está dito; a interpretação vai além, captando intenções e pressupostos.' }],
                atividades: [{ titulo: 'Analisando mensagens do cotidiano', descricao: 'Pegue as últimas 5 mensagens de texto que você recebeu. Para cada uma, identifique se há algum sentido implícito além do que está escrito literalmente.' }]
            },
            {
                numero: '02', titulo: 'Estratégias de Leitura',
                conteudo: '<p>Desenvolver estratégias de leitura é essencial para aproveitar ao máximo qualquer texto. Existem diferentes abordagens, cada uma adequada a um objetivo específico:</p><p><strong>1. Leitura Global (ou scanning):</strong> consiste em passar os olhos rapidamente pelo texto para captar o tema, a estrutura geral e as principais ideias. É útil quando você precisa decidir se o texto merece uma leitura mais aprofundada. Dura de 30 segundos a 1 minuto.</p><p><strong>2. Leitura Analítica:</strong> é a leitura cuidadosa, parágrafo por parágrafo, identificando argumentos, evidências, exemplos e a linha de raciocínio do autor. É nessa etapa que você sublinha trechos importantes e faz anotações.</p><p><strong>3. Leitura Inferencial:</strong> é a etapa mais avançada, na qual você relaciona as informações do texto com seu conhecimento de mundo para tirar conclusões que não estão explicitamente escritas.</p>',
                exemplos: [],
                dicas: [{ texto: 'Ao estudar para provas, pratique as três leituras em sequência. Reserve um tempo para cada etapa. A leitura inferencial é a que mais cai nas questões mais difíceis.' }],
                erros: [{ texto: 'Um erro comum é já começar respondendo às questões antes de fazer a leitura analítica. Isso leva a respostas precipitadas baseadas apenas na primeira impressão do texto.' }],
                exercicios: [{ pergunta: 'Qual é a ordem recomendada das três estratégias de leitura para estudar um texto?', opcoes: ['Analítica → Global → Inferencial', 'Global → Analítica → Inferencial', 'Inferencial → Analítica → Global', 'A ordem não importa'], resposta: 1, comentario: 'Correto! Comece com uma leitura global rápida, depois faça a análise detalhada e, por fim, faça inferências.' }],
                atividades: [{ titulo: 'Praticando as 3 leituras', descricao: 'Escolha um artigo de opinião de um jornal ou revista. Aplique o método das 3 leituras e anote o que descobriu em cada etapa.' }]
            },
            {
                numero: '03', titulo: 'Ideia Principal e Ideias Secundárias',
                conteudo: '<p>Todo texto bem construído gira em torno de uma <strong>ideia principal</strong>, também chamada de tese. É o ponto central que o autor quer transmitir, a mensagem mais importante do texto.</p><p>A ideia principal geralmente aparece no primeiro ou no último parágrafo de textos dissertativos. No entanto, em textos narrativos ou crônicas, ela pode estar diluída ao longo da história e exigir uma inferência do leitor.</p><p>Já as <strong>ideias secundárias</strong> são aquelas que desenvolvem, explicam, exemplificam ou reforçam a ideia principal. São os argumentos, os dados estatísticos, os exemplos concretos e as citações que o autor usa para sustentar seu ponto de vista.</p><p>Saber distinguir a ideia principal das secundárias é fundamental tanto para a interpretação de texto quanto para a produção de redações.</p>',
                exemplos: [],
                dicas: [{ texto: 'Uma técnica eficaz é tentar resumir o texto em uma única frase. Essa frase provavelmente conterá a ideia principal.' }],
                erros: [{ texto: 'Não confunda o <strong>tema</strong> com a <strong>ideia principal</strong>. O tema é o assunto geral (ex: "educação"); a ideia principal é o posicionamento do autor sobre esse tema (ex: "a educação brasileira precisa de mais investimento público").' }],
                exercicios: [{ pergunta: 'Onde geralmente se encontra a ideia principal de um texto dissertativo?', opcoes: ['Em qualquer lugar aleatório', 'No primeiro ou último parágrafo', 'Apenas no título', 'Somente nos exemplos'], resposta: 1, comentario: 'Isso! A tese costuma ser apresentada na introdução e retomada na conclusão.' }],
                atividades: [{ titulo: 'Identificando a tese', descricao: 'Escolha um artigo de opinião. Sublinhe a frase que contém a ideia principal e circule três ideias secundárias que a sustentam.' }]
            }
        ]
    },
    'classes-gramaticais': {
        titulo: 'Classes Gramaticais',
        descricao: 'Conheça as 10 classes de palavras da língua portuguesa e aprenda a identificá-las e usá-las corretamente na escrita e na interpretação de textos.',
        semNiveis: true,
        topicos: [
            {
                numero: '01',
                titulo: 'Substantivo',
                conteudo: '<p>O <strong>substantivo</strong> é a classe de palavras que dá nome aos seres, objetos, lugares, sentimentos, ações e conceitos. É uma das classes mais importantes, pois funciona como núcleo do sujeito e do objeto na oração.</p><p>Os substantivos são classificados em:</p><ul><li><strong>Comum:</strong> designa seres de uma mesma espécie (cidade, livro, pessoa).</li><li><strong>Próprio:</strong> designa um ser específico (Brasil, Maria, São Paulo).</li><li><strong>Concreto:</strong> existe por si só (mesa, pedra, fantasma).</li><li><strong>Abstrato:</strong> depende de outro ser para existir — nomeiam conceitos, sentimentos, qualidades (amor, coragem, beleza).</li><li><strong>Simples:</strong> formado por um radical (flor, tempo).</li><li><strong>Composto:</strong> formado por mais de um radical (girassol, passatempo).</li></ul><p>Os substantivos também se flexionam em <strong>gênero</strong> (masculino/feminino), <strong>número</strong> (singular/plural) e <strong>grau</strong> (normal, aumentativo, diminutivo).</p>',
                exemplos: [
                    { texto: '"A <strong>beleza</strong> da paisagem encantou os turistas."', interpretacao: 'A palavra "beleza" é um substantivo <strong>abstrato</strong>, pois depende de algo belo para existir.' }
                ],
                dicas: [
                    { texto: 'Substantivos abstratos são muito cobrados em interpretação de texto. Palavras como "saudade", "coragem" e "liberdade" são sempre abstratas.' }
                ],
                erros: [
                    { texto: 'Cuidado com palavras como "Deus", "fada" e "fantasma": embora não sejam concretos no mundo físico, a gramática os classifica como substantivos <strong>concretos</strong>.' }
                ],
                exercicios: [
                    { pergunta: 'Na frase "A coragem dos soldados salvou a cidade", a palavra "coragem" é um substantivo:', opcoes: ['Concreto', 'Abstrato', 'Próprio', 'Composto'], resposta: 1, comentario: 'Exato! "Coragem" é um conceito, um sentimento — portanto, substantivo abstrato.' }
                ],
                atividades: [
                    { titulo: 'Caça aos substantivos', descricao: 'Escolha um parágrafo de um livro ou notícia e sublinhe todos os substantivos. Depois, classifique cada um como comum/próprio e concreto/abstrato.' }
                ]
            },
            {
                numero: '02',
                titulo: 'Adjetivo',
                conteudo: '<p>O <strong>adjetivo</strong> é a classe de palavras que caracteriza, modifica ou qualifica o substantivo, atribuindo-lhe uma qualidade, estado ou modo de ser.</p><p>Os adjetivos podem ser:</p><ul><li><strong>Simples:</strong> formado por um radical (carro <em>bonito</em>).</li><li><strong>Composto:</strong> formado por mais de um radical (camisa <em>azul-clara</em>).</li><li><strong>Primitivo:</strong> não deriva de outra palavra (homem <em>bom</em>).</li><li><strong>Derivado:</strong> deriva de substantivo ou verbo (homem <em>bondoso</em>).</li></ul><p>Uma característica importante dos adjetivos é o <strong>grau</strong>. Eles podem estar no grau comparativo (de igualdade, superioridade ou inferioridade) ou no grau superlativo (absoluto ou relativo).</p>',
                exemplos: [
                    { texto: '"Maria é <strong>tão inteligente quanto</strong> João." → comparativo de igualdade.', interpretacao: '"Maria é <strong>inteligentíssima</strong>." → superlativo absoluto sintético.' }
                ],
                dicas: [
                    { texto: 'O superlativo absoluto sintético é formado pelo sufixo -íssimo (ou variantes como -érrimo, -ílimo). Use com moderação na redação.' }
                ],
                erros: [
                    { texto: 'Evite o uso excessivo de "muito" antes de adjetivos na redação. Prefira o superlativo sintético: "importantíssimo" em vez de "muito importante".' }
                ],
                exercicios: [
                    { pergunta: 'Na frase "Ela é a mais dedicada da turma", o adjetivo está no grau:', opcoes: ['Comparativo de superioridade', 'Superlativo relativo de superioridade', 'Superlativo absoluto', 'Comparativo de igualdade'], resposta: 1, comentario: 'Correto! "A mais dedicada" expressa o grau máximo em relação a um grupo — é superlativo relativo.' }
                ],
                atividades: [
                    { titulo: 'Adjetivando', descricao: 'Escolha 5 objetos ao seu redor e crie 3 adjetivos diferentes para cada um. Depois, coloque cada adjetivo no grau superlativo.' }
                ]
            },
            {
                numero: '03',
                titulo: 'Verbo',
                conteudo: '<p>O <strong>verbo</strong> é a classe de palavras que expressa ação, estado, fenômeno da natureza ou mudança de estado. É a classe que mais se flexiona: varia em <strong>pessoa</strong> (1ª, 2ª, 3ª), <strong>número</strong> (singular/plural), <strong>tempo</strong> (presente, passado, futuro), <strong>modo</strong> (indicativo, subjuntivo, imperativo) e <strong>voz</strong> (ativa, passiva, reflexiva).</p><p>Os três modos verbais são:</p><ul><li><strong>Indicativo:</strong> expressa certeza (eu <em>estudo</em> todos os dias).</li><li><strong>Subjuntivo:</strong> expressa dúvida, hipótese (talvez eu <em>estude</em> amanhã).</li><li><strong>Imperativo:</strong> expressa ordem, pedido, conselho (<em>estude</em> agora!).</li></ul>',
                exemplos: [
                    { texto: 'Indicativo: "Eu <strong>li</strong> o livro ontem." — fato concreto.', interpretacao: 'Subjuntivo: "Se eu <strong>lesse</strong> mais, aprenderia mais rápido." — hipótese.' }
                ],
                dicas: [
                    { texto: 'Na redação, prefira o presente do indicativo para expressar teses e argumentos. Use o pretérito perfeito para fatos históricos.' }
                ],
                erros: [
                    { texto: 'Evite misturar tempos verbais sem necessidade. Se começar um parágrafo no presente, mantenha a coerência até o final.' }
                ],
                exercicios: [
                    { pergunta: 'Na frase "Espero que você estude bastante", o verbo "estude" está no modo:', opcoes: ['Indicativo', 'Subjuntivo', 'Imperativo', 'Infinitivo'], resposta: 1, comentario: 'Exato! O "que" antes do verbo indica uma oração subordinada, pedindo o modo subjuntivo.' }
                ],
                atividades: [
                    { titulo: 'Conjugando', descricao: 'Escolha 3 verbos e conjugue-os no presente, pretérito perfeito e futuro do presente do modo indicativo.' }
                ]
            }
        ]
    },
    'regencia': {
        titulo: 'Regência Verbal',
        descricao: 'Entenda a relação entre os verbos e seus complementos, aprendendo quando usar preposições e como a regência afeta o sentido das frases.',
        semNiveis: true,
        topicos: [
            {
                numero: '01',
                titulo: 'O que é Regência Verbal?',
                conteudo: '<p>A <strong>regência verbal</strong> estuda a relação entre o verbo e seus complementos — o objeto direto e o objeto indireto. Alguns verbos não exigem preposição (são transitivos diretos), outros exigem preposição (transitivos indiretos), e há verbos que podem ter os dois complementos (transitivos diretos e indiretos).</p><p>A escolha da preposição correta é essencial para a clareza da frase e também para a correção gramatical em provas e redações.</p>',
                exemplos: [
                    { texto: '"Eu <strong>assisti ao</strong> filme." — O verbo "assistir" (no sentido de ver) exige a preposição "a".', interpretacao: '"Eu <strong>gosto de</strong> música." — O verbo "gostar" exige a preposição "de".' }
                ],
                dicas: [
                    { texto: 'A melhor forma de aprender regência é memorizar os verbos mais cobrados com suas preposições. Monte uma lista com exemplos.' }
                ],
                erros: [
                    { texto: 'Não confunda o uso coloquial com a norma culta. Na fala, dizemos "Assisti o filme", mas na escrita formal o correto é "Assisti ao filme".' }
                ],
                exercicios: [
                    { pergunta: 'Qual a regência correta do verbo "assistir" no sentido de "ver"?', opcoes: ['Assistir o', 'Assistir ao', 'Assistir de', 'Assistir por'], resposta: 1, comentario: 'Correto! "Assistir" (ver) é transitivo indireto e exige a preposição "a".' }
                ],
                atividades: [
                    { titulo: 'Mapeando regências', descricao: 'Escolha 5 verbos que você costuma usar e pesquise sua regência correta. Crie uma frase de exemplo para cada um.' }
                ]
            },
            {
                numero: '02',
                titulo: 'Verbos com Mais de uma Regência',
                conteudo: '<p>Alguns verbos mudam de sentido dependendo da regência utilizada. São os chamados <strong>verbos de dupla regência</strong>. Os casos mais importantes são:</p><ul><li><strong>Agradar:</strong> sem preposição = fazer carinho; com preposição "a" = satisfazer. Ex: "A mãe agradou o filho." (fez carinho) / "O resultado agradou ao professor." (satisfez).</li><li><strong>Aspirar:</strong> sem preposição = respirar; com preposição "a" = desejar. Ex: "Aspirou o ar puro." / "Aspirava ao cargo de diretor."</li><li><strong>Visar:</strong> sem preposição = mirar; com preposição "a" = ter como objetivo. Ex: "O caçador visou o alvo." / "O projeto visa ao desenvolvimento."</li></ul>',
                exemplos: [
                    { texto: '"Ele <strong>aspirou</strong> a poeira." → aspirar = respirar/sugar (sem preposição).', interpretacao: '"Ele <strong>aspira ao</strong> cargo." → aspirar = desejar (com preposição "a").' }
                ],
                dicas: [
                    { texto: 'Na dúvida, troque o verbo por um sinônimo. Se "aspirar" pode ser substituído por "desejar", use a preposição "a". Se pode ser trocado por "respirar", não use preposição.' }
                ],
                erros: [
                    { texto: 'O verbo "visar" no sentido de "ter como objetivo" pede a preposição "a". A frase correta é "O projeto visa ao desenvolvimento", não "O projeto visa o desenvolvimento".' }
                ],
                exercicios: [
                    { pergunta: 'Na frase "O funcionário aspirava à promoção", o verbo "aspirar" significa:', opcoes: ['Respirar', 'Desejar', 'Sugar', 'Observar'], resposta: 1, comentario: 'Exato! Com a preposição "a", "aspirar" significa desejar, almejar.' }
                ],
                atividades: [
                    { titulo: 'Pesquisando duplas regências', descricao: 'Pesquise mais 3 verbos que mudam de sentido conforme a regência (ex: precisar, assistir, responder) e escreva uma frase para cada sentido.' }
                ]
            },
            {
                numero: '03',
                titulo: 'Crase e Regência',
                conteudo: '<p>A <strong>crase</strong> (acento grave) ocorre quando há a fusão da preposição "a" com o artigo definido "a(s)" ou com pronomes demonstrativos que começam com "a".</p><p>A crase está diretamente ligada à regência: se um verbo ou nome exige a preposição "a", e a palavra seguinte admite o artigo feminino "a", ocorre a crase.</p><p>Regra prática: troque a palavra feminina por uma masculina. Se aparecer "ao", use crase. Ex: "Fui <strong>à</strong> escola." → "Fui <strong>ao</strong> colégio." → crase confirmada.</p>',
                exemplos: [
                    { texto: '"Refiro-me <strong>à</strong> aluna." → Refiro-me a + a aluna = à.', interpretacao: '"Entreguei o livro <strong>a</strong> ela." → antes de pronome pessoal não se usa crase.' }
                ],
                dicas: [
                    { texto: 'Nunca use crase: antes de palavra masculina, antes de verbo, antes de pronome pessoal (ela, mim, você), em expressões com palavras repetidas (cara a cara).' }
                ],
                erros: [
                    { texto: 'A crase é um dos erros mais comuns em redações. Não coloque crase só porque há um "a" na frase. Verifique sempre a regência.' }
                ],
                exercicios: [
                    { pergunta: 'Em qual frase a crase está corretamente empregada?', opcoes: ['Fui à pé.', 'Entreguei à ela.', 'Dirigi-me à professora.', 'Comi à sobremesa.'], resposta: 2, comentario: 'Correto! "Dirigir-se a" pede preposição + artigo feminino = crase. As outras estão erradas.' }
                ],
                atividades: [
                    { titulo: 'Caça à crase', descricao: 'Leia um texto jornalístico e identifique todos os usos de crase. Para cada ocorrência, justifique por que o acento grave foi usado.' }
                ]
            }
        ]
    },
    'porcentagem': {
    titulo: 'Porcentagem — Guia Completo de Matemática',
    descricao: 'Aprenda porcentagem do básico ao avançado: cálculos percentuais, descontos, aumentos, juros, porcentagem acumulada, gráficos, regra de três e aplicações no cotidiano.',
    semNiveis: true,
    topicos: [
        {
            numero: '01',
            titulo: 'O que é Porcentagem?',
            conteudo: '<p>A porcentagem representa uma parte de um todo utilizando base 100. O símbolo utilizado é <strong>%</strong>.</p><p>A palavra “porcentagem” significa <strong>x/100</strong>.</p><p><strong>Exemplos:</strong></p><ul><li>50% = 50/100 = 0,5</li><li>25% = 25/100 = 0,25</li></ul><p>📌 <strong>Dicas:</strong></p><ul><li>50% significa metade.</li><li>25% significa quarta parte.</li><li>10% significa dividir por 10.</li></ul>',
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                { pergunta: 'O que significa porcentagem?', opcoes: ['Multiplicação', 'Divisão por 100', 'Soma', 'Potência'], resposta: 1, comentario: 'Porcentagem é uma fração com denominador 100.' },
                { pergunta: '50% corresponde a:', opcoes: ['0,2', '0,25', '0,5', '5'], resposta: 2, comentario: '50% = 50/100 = 0,5.' }
            ],
            atividades: [
                { titulo: 'Porcentagem no cotidiano', descricao: 'Procure 5 exemplos de porcentagem em supermercados, redes sociais ou propagandas.' }
            ]
        },
        {
            numero: '02',
            titulo: 'Transformação de Porcentagem',
            conteudo: '<p>A porcentagem pode ser transformada em fração, decimal ou número percentual.</p><p><strong>Porcentagem para Decimal:</strong> 7% = 0,07</p><p><strong>Decimal para Porcentagem:</strong> 0,32 × 100 = 32%</p><p><strong>Fração para Porcentagem:</strong> 3/4 = 0,75 = 75%</p>',
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                { pergunta: 'Transforme 0,45 em porcentagem.', opcoes: ['4,5%', '45%', '450%', '0,45%'], resposta: 1, comentario: '0,45 × 100 = 45%.' },
                { pergunta: '25% em decimal é:', opcoes: ['0,25', '2,5', '25', '0,025'], resposta: 0, comentario: '25% = 25/100 = 0,25.' }
            ],
            atividades: [
                { titulo: 'Conversões', descricao: 'Transforme 10 porcentagens diferentes em decimal e fração.' }
            ]
        },
        {
            numero: '03',
            titulo: 'Cálculo de Porcentagem',
            conteudo: '<p>Para calcular porcentagem utilizamos: <strong>P = (x/100) · V</strong></p><p>Onde: P = resultado, x = taxa percentual, V = valor total.</p><p><strong>Exemplo:</strong> 20% de 300 = 0,2 × 300 = 60.</p><p><strong>Regra de Três:</strong> 10% de 200 → 100% = 200, 10% = x → x = 20.</p>',
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                { pergunta: 'Quanto é 30% de 500?', opcoes: ['100', '120', '150', '200'], resposta: 2, comentario: '0,3 × 500 = 150.' },
                { pergunta: '12% de 250 é:', opcoes: ['20', '25', '30', '35'], resposta: 2, comentario: '0,12 × 250 = 30.' }
            ],
            atividades: [
                { titulo: 'Cálculos rápidos', descricao: 'Resolva 10 porcentagens mentalmente sem calculadora.' }
            ]
        },
        {
            numero: '04',
            titulo: 'Aumento e Desconto Percentual',
            conteudo: '<p><strong>Aumento Percentual:</strong> V<sub>f</sub> = V<sub>i</sub> × (1 + p/100)</p><p>Exemplo: Produto de R$200 com aumento de 15% → 200 × 1,15 = R$230.</p><p><strong>Desconto Percentual:</strong> V<sub>f</sub> = V<sub>i</sub> × (1 − p/100)</p><p>Exemplo: Tênis de R$400 com desconto de 25% → 400 × 0,75 = R$300.</p><p>⚠️ Aumento e desconto iguais NÃO se anulam.</p>',
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                { pergunta: 'Um produto de R$100 com desconto de 10% custa:', opcoes: ['80', '85', '90', '95'], resposta: 2, comentario: '100 × 0,9 = 90.' },
                { pergunta: 'Uma camisa de R$120 aumenta 15%. Novo preço:', opcoes: ['128', '132', '138', '145'], resposta: 2, comentario: '120 × 1,15 = 138.' }
            ],
            atividades: [
                { titulo: 'Promoções', descricao: 'Analise promoções de lojas e descubra se os descontos são reais.' }
            ]
        },
        {
            numero: '05',
            titulo: 'Porcentagem Acumulada e Sucessiva',
            conteudo: '<p>Descontos e aumentos sucessivos NÃO são somados diretamente.</p><p><strong>Exemplo de descontos sucessivos:</strong> 20% + 10% sobre R$1000 → 1000 → 800 → 720 (desconto real de 28%).</p><p><strong>Exemplo de aumentos sucessivos:</strong> 10% + 20% sobre R$2000 → 2000 → 2200 → 2640 (aumento real de 32%).</p><p>📌 Fator acumulado = multiplicação dos fatores (ex: 0,9 × 0,8 = 0,72).</p>',
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                { pergunta: 'Dois descontos de 10% e 20% geram desconto total de:', opcoes: ['20%', '25%', '28%', '30%'], resposta: 2, comentario: '0,9 × 0,8 = 0,72 → desconto de 28%.' },
                { pergunta: 'Aumentos de 10% e 15% acumulam:', opcoes: ['20%', '25%', '26,5%', '30%'], resposta: 2, comentario: '1,10 × 1,15 = 1,265 → aumento de 26,5%.' }
            ],
            atividades: [
                { titulo: 'Descontos sucessivos', descricao: 'Crie 5 exemplos de descontos sucessivos e calcule o valor final.' }
            ]
        },
        {
            numero: '06',
            titulo: 'Juros Simples e Compostos',
            conteudo: '<p><strong>Juros Simples:</strong> J = C · i · t</p><p>Exemplo: R$1000 a 5% ao mês por 3 meses → J = 1000 × 0,05 × 3 = R$150.</p><p><strong>Juros Compostos:</strong> M = C (1 + i)<sup>t</sup></p><p>Exemplo: R$1000 a 10% por 2 meses → M = 1000 × 1,1² = R$1210.</p><p>📌 Juros simples crescem linearmente; juros compostos crescem exponencialmente.</p>',
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                { pergunta: 'Montante de R$5000 a 2% ao mês por 3 meses (juros compostos):', opcoes: ['5100', '5200', '5306', '5400'], resposta: 2, comentario: '5000 × 1,02³ ≈ 5306.' },
                { pergunta: 'Juros simples de R$1000 a 5% por 3 meses:', opcoes: ['100', '120', '150', '200'], resposta: 2, comentario: '1000 × 0,05 × 3 = 150.' }
            ],
            atividades: [
                { titulo: 'Banco e investimentos', descricao: 'Pesquise taxas de juros reais de bancos e compare juros simples e compostos.' }
            ]
        },
        {
            numero: '07',
            titulo: 'Porcentagem em Gráficos e Estatística',
            conteudo: '<p>A porcentagem é usada em gráficos de pizza, pesquisas e estatísticas.</p><p><strong>Exemplo:</strong> 30 alunos de 50 gostam de futebol → (30/50)×100 = 60%.</p><p><strong>Conversão para ângulos:</strong> θ = (p/100) × 360°</p><p>Exemplo: 25% do gráfico → 0,25 × 360° = 90°.</p>',
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                { pergunta: '45 representa quantos % de 180?', opcoes: ['20%', '25%', '30%', '35%'], resposta: 1, comentario: '(45/180)×100 = 25%.' },
                { pergunta: 'Um aluno acertou 42 de 60 questões. Qual a porcentagem?', opcoes: ['60%', '65%', '70%', '75%'], resposta: 2, comentario: '(42/60)×100 = 70%.' }
            ],
            atividades: [
                { titulo: 'Pesquisa escolar', descricao: 'Faça uma pesquisa com sua turma e monte um gráfico de pizza utilizando porcentagens.' }
            ]
        },
        {
            numero: '08',
            titulo: 'Porcentagem Avançada e Aplicações',
            conteudo: '<p><strong>Porcentagem Reversa:</strong> Após desconto de 20%, produto custa R$240 → 0,8x = 240 → x = R$300.</p><p><strong>Erro Percentual:</strong> |valor real − aproximado| / valor real × 100.</p><p><strong>Aplicações:</strong> inflação, impostos, economia, comissão de vendas, crescimento populacional.</p>',
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                { pergunta: 'Após desconto de 30%, produto custa R$420. Preço original:', opcoes: ['500', '550', '600', '650'], resposta: 2, comentario: '0,7x = 420 → x = 600.' },
                { pergunta: 'Produto sobe de R$240 para R$300. Aumento percentual:', opcoes: ['20%', '22%', '25%', '30%'], resposta: 2, comentario: '(60/240)×100 = 25%.' }
            ],
            atividades: [
                { titulo: 'Economia e porcentagem', descricao: 'Pesquise inflação, juros ou impostos atuais e explique como a porcentagem aparece nesses dados.' }
            ]
        },
        {
            numero: '09',
            titulo: 'Revisão Final',
            conteudo: '<p><strong>Resumo:</strong> A porcentagem está presente em matemática financeira, descontos, estatísticas, gráficos, economia e cotidiano.</p><p><strong>Pontos importantes:</strong></p><ul><li>10% = dividir por 10</li><li>50% = metade</li><li>25% = quarta parte</li><li>Descontos sucessivos não se somam diretamente</li><li>Juros compostos usam crescimento exponencial</li></ul>',
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [],
            atividades: []
        }
    ]
},
    'equacao-1grau': {
    titulo: 'Equação do 1º Grau — Guia Completo de Matemática',
    descricao: 'Aprenda conceitos, resolução de equações, interpretação, problemas matemáticos, sistemas, gráficos e aplicações práticas das equações do primeiro grau.',
    semNiveis: true,
    topicos: [
        {
            numero: '01',
            titulo: 'Introdução às Equações',
            conteudo: '<p>A Equação do Primeiro Grau é um dos assuntos mais importantes da matemática. Ela aparece em problemas do cotidiano, física, química, economia, programação e geometria.</p><p><strong>Equação</strong> é uma igualdade matemática que possui uma incógnita (valor desconhecido).</p><p>Exemplo: <strong>x + 5 = 12</strong></p><p>A incógnita geralmente é indicada por letras como x, y ou z.</p><p>Uma equação é do <strong>primeiro grau</strong> quando o maior expoente da incógnita é 1.</p><p>✅ São do 1º grau: x + 3 = 7, 2x − 5 = 11</p><p>❌ Não são do 1º grau: x² + 2 = 0, x³ − 1 = 0</p>',
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                { pergunta: 'O que é uma equação?', opcoes: ['Uma operação de multiplicação', 'Uma igualdade matemática com incógnita', 'Uma tabela numérica', 'Um gráfico'], resposta: 1, comentario: 'Equação é uma igualdade que contém pelo menos uma incógnita.' }
            ],
            atividades: [
                { titulo: 'Exemplos no cotidiano', descricao: 'Escreva 5 exemplos de equações do primeiro grau presentes no cotidiano.' }
            ]
        },
        {
            numero: '02',
            titulo: 'Estrutura da Equação do 1º Grau',
            conteudo: '<p>A forma geral da equação do primeiro grau é:</p><p><strong>ax + b = 0</strong></p><p>Onde:</p><ul><li><strong>a</strong> = coeficiente da incógnita (deve ser diferente de zero)</li><li><strong>b</strong> = termo independente</li><li><strong>x</strong> = incógnita</li></ul><p>O objetivo principal é encontrar o valor da incógnita. Podemos somar, subtrair, multiplicar ou dividir os dois lados da equação pelo mesmo valor sem alterar a igualdade.</p><p>Exemplo: x + 3 = 10 → x = 10 − 3 → <strong>x = 7</strong></p>',
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                { pergunta: 'Na equação ax + b = 0, o que representa "a"?', opcoes: ['O termo independente', 'O expoente', 'O coeficiente da incógnita', 'O resultado final'], resposta: 2, comentario: '"a" é o coeficiente que multiplica a incógnita.' }
            ],
            atividades: [
                { titulo: 'Identificando coeficientes', descricao: 'Identifique o coeficiente e o termo independente em 10 equações diferentes.' }
            ]
        },
        {
            numero: '03',
            titulo: 'Resolução de Equações',
            conteudo: '<p>Para resolver equações do primeiro grau, siga estes passos:</p><ol><li>Separar incógnitas de um lado da igualdade</li><li>Separar números do outro lado</li><li>Resolver a equação</li></ol><p><strong>Exemplo 1:</strong> 2x + 5 = 17 → 2x = 12 → <strong>x = 6</strong></p><p><strong>Exemplo 2:</strong> 3x + 4 = 19 → 3x = 15 → <strong>x = 5</strong></p><p>📌 Quando um termo muda de lado: soma vira subtração, subtração vira soma, multiplicação vira divisão, divisão vira multiplicação.</p><p>⚠️ Sempre verifique a resposta substituindo o valor encontrado na equação original.</p>',
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                { pergunta: 'Resolva: 2x + 8 = 20', opcoes: ['x = 4', 'x = 5', 'x = 6', 'x = 7'], resposta: 2, comentario: '2x = 12 → x = 6.' },
                { pergunta: 'Resolva: 5x = 40', opcoes: ['x = 6', 'x = 7', 'x = 8', 'x = 9'], resposta: 2, comentario: 'x = 40 ÷ 5 = 8.' }
            ],
            atividades: []
        },
        {
            numero: '04',
            titulo: 'Equações com Frações e Parênteses',
            conteudo: '<p>Equações podem envolver frações e expressões com parênteses.</p><p><strong>Com frações:</strong> x/2 + 3 = 7 → x/2 = 4 → <strong>x = 8</strong></p><p><strong>Com parênteses</strong> (use a propriedade distributiva): a(b + c) = ab + ac</p><p>Exemplo: 2(x + 3) = 14 → 2x + 6 = 14 → 2x = 8 → <strong>x = 4</strong></p>',
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                { pergunta: 'Resolva: 3(x + 2) = 21', opcoes: ['x = 3', 'x = 4', 'x = 5', 'x = 6'], resposta: 2, comentario: '3x + 6 = 21 → 3x = 15 → x = 5.' },
                { pergunta: 'Resolva: x/4 = 6', opcoes: ['x = 18', 'x = 20', 'x = 22', 'x = 24'], resposta: 3, comentario: 'x = 6 × 4 = 24.' }
            ],
            atividades: []
        },
        {
            numero: '05',
            titulo: 'Equações com Incógnitas nos Dois Lados',
            conteudo: '<p>Algumas equações possuem incógnitas nos dois lados da igualdade.</p><p>Exemplo: 3x + 2 = x + 10 → 3x − x = 10 − 2 → 2x = 8 → <strong>x = 4</strong></p><p><strong>Tipos de solução:</strong></p><ul><li><strong>Possível e determinada:</strong> uma única solução (ex: x = 4)</li><li><strong>Impossível:</strong> nenhuma solução (ex: x + 2 = x + 5 → 2 = 5 ❌)</li><li><strong>Possível e indeterminada:</strong> infinitas soluções</li></ul>',
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                { pergunta: 'Resolva: 5x − 3 = 2x + 12', opcoes: ['x = 3', 'x = 4', 'x = 5', 'x = 6'], resposta: 2, comentario: '5x − 2x = 12 + 3 → 3x = 15 → x = 5.' }
            ],
            atividades: []
        },
        {
            numero: '06',
            titulo: 'Problemas Matemáticos',
            conteudo: '<p>Equações ajudam a resolver situações reais. Basta traduzir o problema para a linguagem matemática.</p><p><strong>Exemplo 1:</strong> "A soma de um número com 8 é 20." → x + 8 = 20 → <strong>x = 12</strong></p><p><strong>Exemplo 2:</strong> "Comprei 3 cadernos iguais por R$45." → 3x = 45 → <strong>x = 15</strong></p><p><strong>Exemplo 3:</strong> "A idade de Ana mais 5 anos é 18." → x + 5 = 18 → <strong>x = 13</strong></p><p><strong>Na Física:</strong> S = 20 + 5t. Para S = 50: 20 + 5t = 50 → <strong>t = 6</strong></p>',
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                { pergunta: 'A soma de um número com seu dobro é 36. Qual é o número?', opcoes: ['10', '12', '14', '16'], resposta: 1, comentario: 'x + 2x = 36 → 3x = 36 → x = 12.' },
                { pergunta: 'Pedro tem o triplo da idade de Ana. Juntos possuem 48 anos. Qual a idade de Ana?', opcoes: ['10', '12', '14', '16'], resposta: 1, comentario: 'x + 3x = 48 → 4x = 48 → x = 12.' }
            ],
            atividades: [
                { titulo: 'Criando problemas', descricao: 'Crie 5 problemas do cotidiano que possam ser resolvidos com equações do 1º grau.' }
            ]
        },
        {
            numero: '07',
            titulo: 'Sistemas de Equações',
            conteudo: '<p>Sistemas de equações possuem duas incógnitas e duas equações.</p><p>Exemplo: x + y = 10 e x − y = 2</p><p>Somando as equações: 2x = 12 → <strong>x = 6</strong> e <strong>y = 4</strong></p><p><strong>Métodos de resolução:</strong></p><ul><li>Substituição</li><li>Adição</li><li>Comparação</li></ul>',
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                { pergunta: 'Resolva: x + y = 8, x − y = 2', opcoes: ['x = 5, y = 3', 'x = 4, y = 2', 'x = 6, y = 2', 'x = 7, y = 1'], resposta: 0, comentario: 'Somando: 2x = 10 → x = 5, y = 3.' }
            ],
            atividades: []
        },
        {
            numero: '08',
            titulo: 'Relação com Funções e Gráficos',
            conteudo: '<p>Toda equação do primeiro grau pode ser representada por uma <strong>reta</strong> no plano cartesiano.</p><p><strong>y = ax + b</strong></p><p>Onde: <strong>a</strong> = coeficiente angular (inclinação), <strong>b</strong> = coeficiente linear (onde corta o eixo y).</p><p>Se <strong>a > 0</strong> → reta crescente 📈</p><p>Se <strong>a < 0</strong> → reta decrescente 📉</p>',
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                { pergunta: 'Na função y = 2x + 3, o coeficiente angular é:', opcoes: ['1', '2', '3', '5'], resposta: 1, comentario: 'O coeficiente angular é o número que multiplica x, ou seja, 2.' }
            ],
            atividades: []
        },
        {
            numero: '09',
            titulo: 'Exercícios Finais e Resumo',
            conteudo: '<p><strong>Exercícios de fixação:</strong></p><ol><li>x + 9 = 20 → <strong>x = 11</strong></li><li>3x = 27 → <strong>x = 9</strong></li><li>x − 7 = 11 → <strong>x = 18</strong></li><li>4x − 8 = 20 → <strong>x = 7</strong></li><li>2(x + 5) = 18 → <strong>x = 4</strong></li><li>5x + 2 = 3x + 18 → <strong>x = 8</strong></li><li>0,2x + 4 = 10 → <strong>x = 30</strong></li><li>3(x − 2) + 5 = 20 → <strong>x = 7</strong></li><li>7x − 4 = 3x + 20 → <strong>x = 6</strong></li></ol><p><strong>Resumo dos tipos de equações:</strong></p><ul><li>Simples: x + 3 = 7</li><li>Com fração: x/2 = 5</li><li>Com parênteses: 2(x + 1) = 8</li><li>Literal: ax + b = 0 → x = −b/a</li><li>Sistema: x + y = 10</li></ul><p><strong>Fórmulas principais:</strong> ax + b = 0 | x = −b/a | a(b + c) = ab + ac</p>',
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [],
            atividades: []
        }
    ]
},
    'cinematica': {
    titulo: 'Cinemática — Guia Completo de Física',
    descricao: 'Estude os conceitos fundamentais da Cinemática: movimento uniforme, movimento uniformemente variado, aceleração, queda livre, gráficos e exercícios práticos.',
    semNiveis: true,
    topicos: [
        {
            numero: '01',
            titulo: 'O que é Cinemática?',
            conteudo: '<p>A <strong>Cinemática</strong> é a área da Física que estuda os movimentos dos corpos sem analisar suas causas. Ela busca responder perguntas como:</p><ul><li>O corpo está parado ou em movimento?</li><li>Qual distância foi percorrida?</li><li>Qual foi a velocidade?</li><li>Houve aceleração?</li></ul><p>A Cinemática está presente em carros, bicicletas, aviões, quedas, esportes e praticamente tudo que se move.</p>',
            exemplos: [
                { texto: 'Um carro percorre uma estrada em linha reta durante 2 horas. A Cinemática analisa: velocidade, tempo e distância. Mas NÃO analisa o motor ou a força do carro.', interpretacao: 'Isso diferencia a Cinemática da Dinâmica (que estuda as causas do movimento).' }
            ],
            dicas: [
                { texto: 'Sempre se pergunte: "O que está se movendo? Em relação a quê? Qual a trajetória?" Essas três perguntas resumem a Cinemática.' }
            ],
            erros: [
                { texto: 'Não confunda Cinemática com Dinâmica. A Cinemática descreve o movimento; a Dinâmica explica por que ele ocorre (forças).' }
            ],
            exercicios: [
                { pergunta: 'O que a Cinemática estuda?', opcoes: ['As causas do movimento', 'O movimento dos corpos', 'Apenas a gravidade', 'Apenas velocidade'], resposta: 1, comentario: 'A Cinemática descreve o movimento (posição, velocidade, aceleração) sem se preocupar com as causas.' },
                { pergunta: 'A Cinemática analisa:', opcoes: ['Forças', 'Movimento', 'Energia elétrica', 'Reações químicas'], resposta: 1, comentario: 'Correto! A Cinemática estuda exclusivamente o movimento dos corpos.' },
                { pergunta: 'Um avião em voo é estudado pela:', opcoes: ['Química', 'Cinemática', 'Biologia', 'Geografia'], resposta: 1, comentario: 'O movimento do avião é descrito pela Cinemática.' }
            ],
            atividades: [
                { titulo: 'Observando movimentos', descricao: 'Observe 5 movimentos do seu cotidiano (carros, pessoas, objetos caindo) e descreva quais grandezas podem ser estudadas pela Cinemática.' },
                { titulo: 'Repouso e movimento', descricao: 'Faça uma lista de 10 objetos em sua casa, classificando-os como "em repouso" ou "em movimento" em relação ao chão.' },
                { titulo: 'Cinemática nos esportes', descricao: 'Pesquise como a Cinemática é aplicada em 3 esportes diferentes (ex: futebol, natação, Fórmula 1).' }
            ]
        },
        {
            numero: '02',
            titulo: 'Referencial, Movimento e Repouso',
            conteudo: '<p>O <strong>referencial</strong> é o ponto usado para determinar se um corpo está em movimento ou repouso.</p><p><strong>Movimento:</strong> ocorre quando a posição do corpo muda em relação ao referencial.</p><p><strong>Repouso:</strong> ocorre quando a posição do corpo não muda em relação ao referencial.</p><p>Um mesmo objeto pode estar em movimento e em repouso ao mesmo tempo, dependendo do referencial escolhido!</p>',
            exemplos: [
                { texto: 'Um passageiro sentado em um ônibus: está em repouso em relação ao banco, mas está em movimento em relação à rua.', interpretacao: 'O estado de movimento ou repouso depende sempre do referencial adotado.' }
            ],
            dicas: [
                { texto: 'Ao resolver problemas, sempre defina claramente qual é o referencial antes de começar. Isso evita confusões.' }
            ],
            erros: [
                { texto: 'Não existe movimento absoluto! Dizer que algo "está em movimento" sem especificar o referencial é uma afirmação incompleta.' }
            ],
            exercicios: [
                { pergunta: 'O que é referencial?', opcoes: ['Uma força', 'Um ponto usado para comparar posições', 'Um tipo de velocidade', 'Uma trajetória'], resposta: 1, comentario: 'Referencial é o sistema de referência a partir do qual se observa o movimento.' },
                { pergunta: 'O estado de movimento de um corpo depende:', opcoes: ['Do referencial adotado', 'Apenas da velocidade', 'Da massa do corpo', 'Do tempo'], resposta: 0, comentario: 'Exato! Movimento e repouso são conceitos relativos ao referencial.' }
            ],
            atividades: [
                { titulo: 'Múltiplos referenciais', descricao: 'Descreva 3 situações cotidianas em que um mesmo objeto está em movimento para uma pessoa e em repouso para outra.' },
                { titulo: 'Elevador em perspectiva', descricao: 'Uma pessoa está dentro de um elevador subindo. Identifique: ela está em movimento ou repouso em relação ao prédio? E em relação ao piso do elevador?' },
                { titulo: 'A Terra em movimento', descricao: 'Explique por que podemos dizer que a Terra está em movimento, mesmo que não percebamos isso no dia a dia.' }
            ]
        },
        {
            numero: '03',
            titulo: 'Trajetória, Distância e Deslocamento',
            conteudo: '<p><strong>Trajetória</strong> é o caminho percorrido por um corpo. Pode ser: retilínea (linha reta), curvilínea (curva) ou circular.</p><p><strong>Distância percorrida (d):</strong> é o total do caminho percorrido pelo corpo, sem se importar com a direção.</p><p><strong>Deslocamento (ΔS):</strong> é a diferença entre a posição final (S<sub>f</sub>) e a posição inicial (S<sub>i</sub>).</p><p><strong>Fórmula:</strong> ΔS = S<sub>f</sub> − S<sub>i</sub></p>',
            exemplos: [
                { texto: 'Uma pessoa anda 3 metros para frente e depois 3 metros para trás, voltando ao ponto inicial. Distância total = 6m. Deslocamento = 0m.', interpretacao: 'A distância considera todo o caminho; o deslocamento só considera o ponto final menos o inicial.' }
            ],
            dicas: [
                { texto: 'Deslocamento pode ser zero mesmo com muita distância percorrida. Basta voltar ao ponto de partida.' }
            ],
            erros: [
                { texto: 'Não confunda distância percorrida com deslocamento. Em trajetórias curvas, a distância é sempre maior que o módulo do deslocamento.' }
            ],
            exercicios: [
                { pergunta: 'Distância percorrida e deslocamento são sempre iguais?', opcoes: ['Sim, sempre', 'Não, apenas em trajetórias retilíneas sem inversão', 'Sim, apenas no MUV', 'Nunca são iguais'], resposta: 1, comentario: 'Correto! Só são iguais quando o corpo se move em linha reta e não inverte o sentido.' },
                { pergunta: 'Um corpo sai da posição 10m e vai para 40m. O deslocamento foi de:', opcoes: ['20m', '30m', '40m', '50m'], resposta: 1, comentario: 'ΔS = 40 − 10 = 30m.' }
            ],
            atividades: [
                { titulo: 'Desenhando trajetórias', descricao: 'Desenhe 3 exemplos de trajetórias: uma retilínea, uma curvilínea e uma circular. Identifique em cada uma a distância e o deslocamento.' },
                { titulo: 'Criando problemas', descricao: 'Crie um problema de Cinemática envolvendo deslocamento e distância percorrida. Troque com um colega para resolver.' },
                { titulo: 'Futebol e deslocamento', descricao: 'Durante um jogo de futebol, um jogador corre por todo o campo. Compare a distância total percorrida com seu deslocamento ao final do jogo.' }
            ]
        },
        {
            numero: '04',
            titulo: 'Velocidade Média',
            conteudo: '<p>A <strong>velocidade média (V<sub>m</sub>)</strong> indica quão rápido um corpo muda de posição. Quanto maior a velocidade média, mais rapidamente o corpo se move.</p><p><strong>Fórmula:</strong> V<sub>m</sub> = ΔS / Δt</p><p>Onde: ΔS é o deslocamento (m) e Δt é o intervalo de tempo (s). A unidade no SI é m/s, mas também usamos km/h.</p>',
            exemplos: [
                { texto: 'Um carro percorre 100 km em 2 horas. V<sub>m</sub> = 100 / 2 = 50 km/h.', interpretacao: 'Isso não significa que o carro andou a 50 km/h o tempo todo — é apenas a média.' }
            ],
            dicas: [
                { texto: 'Velocidade média não é a média das velocidades! É o deslocamento total dividido pelo tempo total.' }
            ],
            erros: [
                { texto: 'Cuidado ao usar km/h e m/s na mesma fórmula. Sempre converta tudo para a mesma unidade antes de calcular.' }
            ],
            exercicios: [
                { pergunta: 'Um carro percorre 150 km em 3h. Qual a velocidade média?', opcoes: ['40 km/h', '50 km/h', '60 km/h', '70 km/h'], resposta: 1, comentario: 'V<sub>m</sub> = 150 ÷ 3 = 50 km/h.' },
                { pergunta: 'Qual é a unidade padrão de velocidade no Sistema Internacional?', opcoes: ['km', 'h', 'm/s', 'N'], resposta: 2, comentario: 'No SI, a velocidade é medida em metros por segundo (m/s).' }
            ],
            atividades: [
                { titulo: 'Sua velocidade', descricao: 'Calcule sua velocidade média no trajeto de casa até a escola (ou trabalho). Meça a distância e o tempo.' },
                { titulo: 'Velocidades animais', descricao: 'Pesquise a velocidade média de 5 animais diferentes (ex: guepardo, falcão, tartaruga) e monte uma tabela comparativa.' },
                { titulo: 'Recordes de velocidade', descricao: 'Pesquise qual é o veículo terrestre mais rápido do mundo e calcule quanto tempo ele levaria para percorrer 1000 km.' }
            ]
        },
        {
            numero: '05',
            titulo: 'Conversão de Unidades',
            conteudo: '<p>Em Física, usamos frequentemente duas unidades de velocidade: <strong>km/h</strong> (quilômetros por hora) e <strong>m/s</strong> (metros por segundo).</p><p><strong>Regras de conversão:</strong></p><ul><li>De km/h para m/s: <strong>divida por 3,6</strong></li><li>De m/s para km/h: <strong>multiplique por 3,6</strong></li></ul><p>Exemplos:<br>72 km/h ÷ 3,6 = 20 m/s<br>20 m/s × 3,6 = 72 km/h</p>',
            exemplos: [
                { texto: 'Um carro a 90 km/h: 90 ÷ 3,6 = 25 m/s.', interpretacao: 'Saber converter é essencial para resolver problemas que misturam unidades diferentes.' }
            ],
            dicas: [
                { texto: 'Memorize: 3,6 é o número mágico. Divida para ir de km/h para m/s; multiplique para fazer o contrário.' }
            ],
            erros: [
                { texto: 'Nunca some ou compare velocidades em unidades diferentes sem antes convertê-las. 10 m/s é muito diferente de 10 km/h!' }
            ],
            exercicios: [
                { pergunta: '36 km/h equivalem a:', opcoes: ['5 m/s', '10 m/s', '15 m/s', '20 m/s'], resposta: 1, comentario: '36 ÷ 3,6 = 10 m/s.' },
                { pergunta: '20 m/s equivalem a:', opcoes: ['36 km/h', '54 km/h', '72 km/h', '90 km/h'], resposta: 2, comentario: '20 × 3,6 = 72 km/h.' }
            ],
            atividades: [
                { titulo: 'Tabela de conversão', descricao: 'Converta 10 valores de km/h para m/s e vice-versa. Monte uma tabela com os resultados.' },
                { titulo: 'Velocidades no trânsito', descricao: 'Pesquise os limites de velocidade em vias urbanas e rodovias no Brasil (em km/h) e converta todos para m/s.' },
                { titulo: 'Carros esportivos', descricao: 'Pesquise a velocidade máxima de 3 carros esportivos famosos e converta para m/s.' }
            ]
        },
        {
            numero: '06',
            titulo: 'Movimento Uniforme (MU)',
            conteudo: '<p>O <strong>Movimento Uniforme (MU)</strong> é aquele em que a velocidade permanece <strong>constante</strong> (não varia). O corpo percorre distâncias iguais em intervalos de tempo iguais.</p><p><strong>Equação horária do MU:</strong> S = S<sub>0</sub> + v·t</p><p>Onde: S = posição final, S<sub>0</sub> = posição inicial, v = velocidade (constante), t = tempo.</p><p>No MU, a aceleração é <strong>zero</strong>.</p>',
            exemplos: [
                { texto: 'Um carro parte da posição 20m e move-se com velocidade constante de 5 m/s durante 10 segundos. S = 20 + 5×10 = 70m.', interpretacao: 'A posição final é 70m. O gráfico S × t do MU é uma reta inclinada.' }
            ],
            dicas: [
                { texto: 'No MU, a velocidade instantânea é igual à velocidade média em qualquer instante. Isso simplifica muito os cálculos.' }
            ],
            erros: [
                { texto: 'No MU a velocidade é constante, mas isso não significa que o corpo está sempre na mesma posição. Ele se move uniformemente.' }
            ],
            exercicios: [
                { pergunta: 'No Movimento Uniforme, a aceleração é:', opcoes: ['Positiva', 'Negativa', 'Zero', 'Variável'], resposta: 2, comentario: 'Exato! Se a velocidade não muda, a aceleração é nula.' },
                { pergunta: 'Um móvel move-se a 10 m/s durante 5 segundos. Qual o deslocamento?', opcoes: ['25 m', '50 m', '75 m', '100 m'], resposta: 1, comentario: 'ΔS = v × t = 10 × 5 = 50 m.' }
            ],
            atividades: [
                { titulo: 'Observando o MU', descricao: 'Observe o movimento de uma escada rolante ou de uma esteira. Por que esses movimentos podem ser considerados uniformes?' },
                { titulo: 'Gráfico do MU', descricao: 'Desenhe o gráfico posição × tempo para um móvel em MU com velocidade de 4 m/s partindo da posição 0.' },
                { titulo: 'Trens e MU', descricao: 'Pesquise por que os trens de longa distância podem ser bons exemplos de Movimento Uniforme.' }
            ]
        },
        {
            numero: '07',
            titulo: 'Aceleração',
            conteudo: '<p>A <strong>aceleração (a)</strong> mede a rapidez com que a velocidade de um corpo varia ao longo do tempo. Se a velocidade aumenta, a aceleração é positiva. Se a velocidade diminui (frenagem), a aceleração é negativa.</p><p><strong>Fórmula:</strong> a = Δv / Δt</p><p>Unidade no SI: m/s² (metros por segundo ao quadrado).</p>',
            exemplos: [
                { texto: 'Um carro aumenta sua velocidade de 10 m/s para 30 m/s em 5 segundos. a = (30 − 10) / 5 = 4 m/s².', interpretacao: 'A cada segundo, a velocidade aumenta 4 m/s.' }
            ],
            dicas: [
                { texto: 'Aceleração negativa não significa necessariamente "ficar parado". Significa que a velocidade está diminuindo.' }
            ],
            erros: [
                { texto: 'Não confunda velocidade alta com aceleração alta. Um carro a 120 km/h constantes tem aceleração zero!' }
            ],
            exercicios: [
                { pergunta: 'Um móvel vai de 5 m/s para 25 m/s em 10 segundos. Qual a aceleração?', opcoes: ['1 m/s²', '2 m/s²', '3 m/s²', '4 m/s²'], resposta: 1, comentario: 'a = (25−5)/10 = 2 m/s².' },
                { pergunta: 'Aceleração negativa significa:', opcoes: ['Que o corpo está parado', 'Que a velocidade está diminuindo', 'Que o corpo está em MU', 'Que a velocidade é zero'], resposta: 1, comentario: 'Correto! Aceleração negativa indica frenagem ou desaceleração.' }
            ],
            atividades: [
                { titulo: 'Acelerando no trânsito', descricao: 'Quando estiver em um carro, observe o momento em que ele acelera e o momento em que freia. Descreva a sensação em cada caso.' },
                { titulo: 'Comparando grandezas', descricao: 'Explique com suas palavras a diferença entre velocidade e aceleração. Dê exemplos concretos.' },
                { titulo: 'Criando situações', descricao: 'Crie 3 problemas envolvendo aceleração positiva e 3 envolvendo aceleração negativa (frenagem).' }
            ]
        },
        {
            numero: '08',
            titulo: 'Movimento Uniformemente Variado (MUV)',
            conteudo: '<p>No <strong>Movimento Uniformemente Variado (MUV)</strong>, a aceleração é <strong>constante</strong> e diferente de zero. A velocidade muda de forma uniforme ao longo do tempo.</p><p><strong>Equações do MUV:</strong></p><ul><li>v = v<sub>0</sub> + a·t (velocidade em função do tempo)</li><li>S = S<sub>0</sub> + v<sub>0</sub>·t + (a·t²)/2 (posição em função do tempo)</li></ul>',
            exemplos: [
                { texto: 'Um carro parte com velocidade inicial de 2 m/s e aceleração constante de 3 m/s² durante 4 segundos. Velocidade final: v = 2 + 3×4 = 14 m/s.', interpretacao: 'A velocidade aumenta 3 m/s a cada segundo.' }
            ],
            dicas: [
                { texto: 'No MUV, o gráfico v × t é uma reta inclinada, e o gráfico S × t é uma parábola.' }
            ],
            erros: [
                { texto: 'Não aplique as fórmulas do MU em problemas de MUV. Se há aceleração, a velocidade muda e as equações são diferentes.' }
            ],
            exercicios: [
                { pergunta: 'Um corpo parte do repouso (v₀=0) com aceleração de 6 m/s² durante 4s. Qual a velocidade final?', opcoes: ['12 m/s', '18 m/s', '24 m/s', '30 m/s'], resposta: 2, comentario: 'v = 0 + 6×4 = 24 m/s.' },
                { pergunta: 'No MUV, o que é constante?', opcoes: ['A posição', 'A velocidade', 'A aceleração', 'O tempo'], resposta: 2, comentario: 'No MUV, a aceleração é constante (não muda).' }
            ],
            atividades: [
                { titulo: 'Gráficos do MUV', descricao: 'Desenhe os gráficos v × t e S × t para um móvel em MUV com aceleração positiva de 2 m/s² partindo do repouso.' },
                { titulo: 'MU vs MUV', descricao: 'Crie uma tabela comparando as características do MU e do MUV (aceleração, velocidade, gráficos, equações).' },
                { titulo: 'MUV no cotidiano', descricao: 'Dê 3 exemplos reais de situações que podem ser aproximadas como MUV (ex: um carro acelerando ao sair do semáforo).' }
            ]
        },
        {
            numero: '09',
            titulo: 'Equação de Torricelli',
            conteudo: '<p>A <strong>Equação de Torricelli</strong> é usada quando o problema não fornece o tempo (t). Ela relaciona velocidade, aceleração e deslocamento.</p><p><strong>Fórmula:</strong> v² = v<sub>0</sub>² + 2·a·ΔS</p><p>Onde: v = velocidade final, v<sub>0</sub> = velocidade inicial, a = aceleração, ΔS = deslocamento.</p>',
            exemplos: [
                { texto: 'Um carro parte do repouso (v₀=0) e percorre 20m com aceleração de 4 m/s². v² = 0 + 2×4×20 = 160 → v ≈ 12,6 m/s.', interpretacao: 'Conseguimos achar a velocidade final sem saber o tempo gasto.' }
            ],
            dicas: [
                { texto: 'Use Torricelli quando o enunciado não mencionar o tempo. É uma economia de passos na resolução.' }
            ],
            erros: [
                { texto: 'Não se esqueça de tirar a raiz quadrada no final! v² não é a velocidade — você precisa calcular √(v²).' }
            ],
            exercicios: [
                { pergunta: 'Quando devemos usar a Equação de Torricelli?', opcoes: ['Quando há força envolvida', 'Quando o tempo não é fornecido', 'Apenas no MU', 'Quando o corpo está em repouso'], resposta: 1, comentario: 'Exato! Torricelli é ideal para problemas sem a variável tempo.' },
                { pergunta: 'Um corpo parte do repouso com aceleração de 5 m/s² e percorre 10m. Qual a velocidade final? (Use √100 = 10)', opcoes: ['5 m/s', '10 m/s', '15 m/s', '20 m/s'], resposta: 1, comentario: 'v² = 0 + 2×5×10 = 100 → v = 10 m/s.' }
            ],
            atividades: [
                { titulo: 'Resolvendo sem tempo', descricao: 'Resolva 5 problemas de MUV usando a Equação de Torricelli. Crie você mesmo os enunciados.' },
                { titulo: 'Comparando equações', descricao: 'Compare as equações do MUV com a de Torricelli. Em quais situações cada uma é mais útil?' },
                { titulo: 'Frenagem', descricao: 'Crie um problema de frenagem (aceleração negativa) e resolva usando Torricelli.' }
            ]
        },
        {
            numero: '10',
            titulo: 'Queda Livre',
            conteudo: '<p>A <strong>queda livre</strong> é o movimento de um corpo sob ação exclusiva da gravidade, sem resistência do ar. Na Terra, a aceleração da gravidade é aproximadamente <strong>g ≈ 10 m/s²</strong>.</p><p><strong>Equações da queda livre (a partir do repouso):</strong></p><ul><li>v = g·t (velocidade)</li><li>h = (g·t²)/2 (altura)</li></ul><p>Essas equações são casos especiais do MUV com a = g.</p>',
            exemplos: [
                { texto: 'Uma pedra é solta do alto de um prédio e cai durante 3 segundos. Qual sua velocidade ao atingir o solo? v = 10 × 3 = 30 m/s.', interpretacao: 'Convertendo para km/h: 30 × 3,6 = 108 km/h. Uma velocidade impressionante!' }
            ],
            dicas: [
                { texto: 'Na queda livre, todos os corpos caem com a mesma aceleração, independentemente da massa (desprezando a resistência do ar).' }
            ],
            erros: [
                { texto: 'Não confunda massa com aceleração. Uma pena e uma bola de boliche caem com a mesma aceleração no vácuo!' }
            ],
            exercicios: [
                { pergunta: 'Qual o valor aproximado da aceleração da gravidade na Terra?', opcoes: ['5 m/s²', '10 m/s²', '20 m/s²', '30 m/s²'], resposta: 1, comentario: 'g ≈ 10 m/s² (ou 9,8 m/s² em cálculos mais precisos).' },
                { pergunta: 'Uma pedra cai por 2 segundos em queda livre. Qual sua velocidade final?', opcoes: ['10 m/s', '20 m/s', '30 m/s', '40 m/s'], resposta: 1, comentario: 'v = g×t = 10×2 = 20 m/s.' }
            ],
            atividades: [
                { titulo: 'Galileu e a gravidade', descricao: 'Pesquise sobre as experiências de Galileu Galilei com queda de corpos e escreva um parágrafo sobre suas descobertas.' },
                { titulo: 'Por que caem?', descricao: 'Explique com suas palavras por que os objetos caem quando soltos. Qual é a causa desse movimento?' },
                { titulo: 'Queda livre na Lua', descricao: 'Pesquise qual é a aceleração da gravidade na Lua e calcule quanto tempo um objeto levaria para cair de uma altura de 10m.' }
            ]
        },
        {
            numero: '11',
            titulo: 'Movimento Circular Uniforme (MCU)',
            conteudo: '<p>O <strong>Movimento Circular Uniforme (MCU)</strong> ocorre quando um corpo descreve uma trajetória circular com velocidade escalar constante. Mesmo com velocidade constante, existe uma <strong>aceleração centrípeta</strong> que aponta para o centro da trajetória.</p><p><strong>Fórmulas do MCU:</strong></p><ul><li>v = 2πR / T (velocidade)</li><li>a<sub>c</sub> = v² / R (aceleração centrípeta)</li></ul><p>Onde: R = raio da trajetória, T = período (tempo para uma volta completa).</p>',
            exemplos: [
                { texto: 'Uma roda-gigante gira com movimento circular uniforme. Mesmo com velocidade constante, os passageiros sentem uma força os empurrando para fora (é a inércia!).', interpretacao: 'A aceleração centrípeta é responsável por manter o corpo na trajetória circular.' }
            ],
            dicas: [
                { texto: 'No MCU, a velocidade escalar é constante, mas a direção do vetor velocidade muda a cada instante. Por isso há aceleração.' }
            ],
            erros: [
                { texto: 'Muitos alunos acham que no MCU a aceleração é zero porque a velocidade é constante. Isso está errado! A aceleração centrípeta existe e aponta para o centro.' }
            ],
            exercicios: [
                { pergunta: 'No MCU, a trajetória é:', opcoes: ['Retilínea', 'Circular', 'Parabólica', 'Elíptica'], resposta: 1, comentario: 'O MCU ocorre em trajetórias circulares.' },
                { pergunta: 'No MCU, mesmo com velocidade constante, existe:', opcoes: ['Aceleração zero', 'Aceleração centrípeta', 'Apenas força', 'Repouso'], resposta: 1, comentario: 'Existe aceleração centrípeta, responsável por mudar a direção do movimento.' }
            ],
            atividades: [
                { titulo: 'MCU no cotidiano', descricao: 'Liste 5 exemplos de Movimento Circular Uniforme que você observa no dia a dia.' },
                { titulo: 'A roda-gigante', descricao: 'Explique o funcionamento de uma roda-gigante usando os conceitos de MCU: raio, período, velocidade e aceleração centrípeta.' },
                { titulo: 'Pesquisando aplicações', descricao: 'Pesquise como o MCU é aplicado em motores, ventiladores e discos rígidos de computador.' }
            ]
        },
        {
            numero: '12',
            titulo: 'Revisão Geral e Exercícios Finais',
            conteudo: '<p>Neste tópico final, revisamos os principais conteúdos de Cinemática:</p><ul><li><strong>Velocidade média:</strong> V<sub>m</sub> = ΔS/Δt</li><li><strong>MU:</strong> S = S<sub>0</sub> + v·t (velocidade constante, aceleração zero)</li><li><strong>MUV:</strong> v = v<sub>0</sub> + a·t e S = S<sub>0</sub> + v<sub>0</sub>·t + (a·t²)/2</li><li><strong>Torricelli:</strong> v² = v<sub>0</sub>² + 2·a·ΔS</li><li><strong>Queda livre:</strong> v = g·t e h = (g·t²)/2</li><li><strong>MCU:</strong> v = 2πR/T e a<sub>c</sub> = v²/R</li></ul><p>Dominar esses conceitos é fundamental para avançar nos estudos de Física!</p>',
            exemplos: [],
            dicas: [
                { texto: 'Faça um resumo com todas as fórmulas da Cinemática e cole na parede do seu quarto. A memorização visual ajuda muito.' }
            ],
            erros: [
                { texto: 'O erro mais comum em Cinemática é misturar as fórmulas do MU com as do MUV. Sempre verifique se há aceleração antes de escolher a equação.' }
            ],
            exercicios: [
                { pergunta: 'Um carro percorre 120 km em 3 horas. Qual a velocidade média?', opcoes: ['30 km/h', '40 km/h', '50 km/h', '60 km/h'], resposta: 1, comentario: 'V<sub>m</sub> = 120/3 = 40 km/h.' },
                { pergunta: 'Um corpo parte do repouso com aceleração de 2 m/s² durante 5 segundos. Qual a velocidade final?', opcoes: ['5 m/s', '10 m/s', '15 m/s', '20 m/s'], resposta: 1, comentario: 'v = 0 + 2×5 = 10 m/s.' }
            ],
            atividades: [
                { titulo: 'Resumo completo', descricao: 'Crie um mapa mental ou resumo de uma página com todos os conceitos e fórmulas da Cinemática.' },
                { titulo: '20 exercícios', descricao: 'Resolva 20 exercícios de Cinemática (use livros didáticos ou sites confiáveis) e anote suas dúvidas para revisar.' },
                { titulo: 'Fórmulas na prática', descricao: 'Para cada fórmula da Cinemática, crie um exemplo prático do cotidiano onde ela seria aplicada.' }
            ]
        }
    ]
},
   'leis-newton': {
    titulo: 'Leis de Newton — Guia Completo de Física',
    descricao: 'Aprenda as Leis de Newton, força, atrito, inércia, ação e reação, força centrípeta e aplicações da dinâmica através de teoria completa, exemplos práticos e exercícios comentados.',
    semNiveis: true,
    topicos: [
        {
            numero: '01',
            titulo: 'Introdução às Leis de Newton',
            conteudo: '<p>As <strong>Leis de Newton</strong> são a base da Mecânica Clássica e explicam como os corpos se movem e como as forças atuam sobre eles. Foram formuladas por <strong>Isaac Newton</strong> no século XVII e revolucionaram a Física.</p><p>As três leis descrevem:</p><ul><li>A tendência dos corpos de manterem seu estado de movimento (Inércia)</li><li>Como as forças alteram os movimentos (Princípio Fundamental)</li><li>Como forças surgem em pares de ação e reação</li></ul><p>Essas leis são usadas até hoje em carros, foguetes, engenharia, esportes e astronomia.</p>',
            exemplos: [
                { texto: 'Quando um carro acelera, o corpo do passageiro tende a ficar para trás por causa da inércia. Isso é explicado pela Primeira Lei de Newton.', interpretacao: 'A inércia é a resistência que todo corpo oferece à mudança de seu estado de movimento.' }
            ],
            dicas: [
                { texto: 'As Leis de Newton funcionam para referenciais inerciais (que não têm aceleração). Para referenciais acelerados, é necessário fazer adaptações.' }
            ],
            erros: [
                { texto: 'Muita gente acha que a inércia é uma força, mas ela não é! Inércia é uma propriedade dos corpos, não uma força.' }
            ],
            exercicios: [
                { pergunta: 'Quem formulou as Leis de Newton?', opcoes: ['Galileu Galilei', 'Isaac Newton', 'Albert Einstein', 'Nikola Tesla'], resposta: 1, comentario: 'Isaac Newton formulou as três leis que são a base da Mecânica Clássica.' }
            ],
            atividades: [
                { titulo: 'As leis no dia a dia', descricao: 'Observe 3 situações do seu cotidiano (ex: andar de ônibus, chutar uma bola, empurrar um objeto) e identifique qual Lei de Newton está presente em cada uma.' }
            ]
        },
        {
            numero: '02',
            titulo: 'O que é Força?',
            conteudo: '<p><strong>Força</strong> é toda interação capaz de alterar o movimento ou deformar um corpo. Uma força pode: aumentar a velocidade, diminuir a velocidade, mudar a direção do movimento ou deformar objetos.</p><p>A unidade de força no Sistema Internacional é o <strong>Newton (N)</strong>. A força é uma <strong>grandeza vetorial</strong>, ou seja, possui: intensidade (módulo), direção e sentido.</p><p><strong>Fórmula fundamental:</strong> F = m · a</p>',
            exemplos: [
                { texto: 'Empurrar uma caixa faz ela sair do repouso. Isso significa que uma força foi aplicada, vencendo a inércia do objeto.', interpretacao: 'A força resultante é o que causa a aceleração do corpo.' }
            ],
            dicas: [
                { texto: 'Sempre desenhe as forças atuando em um corpo antes de começar a resolver problemas de Dinâmica. Isso ajuda a visualizar a situação.' }
            ],
            erros: [
                { texto: 'Força não é a mesma coisa que velocidade. Um corpo pode estar em movimento sem que nenhuma força esteja atuando sobre ele (MRU).' }
            ],
            exercicios: [
                { pergunta: 'Qual é a unidade de força no Sistema Internacional?', opcoes: ['Joule', 'Watt', 'Newton', 'Pascal'], resposta: 2, comentario: 'A unidade de força é o Newton (N), em homenagem a Isaac Newton.' }
            ],
            atividades: [
                { titulo: 'Identificando forças', descricao: 'Liste 5 situações em que você aplica força no dia a dia e descreva o efeito de cada força (movimento, deformação, etc.).' }
            ]
        },
        {
            numero: '03',
            titulo: 'Força Peso e Gravidade',
            conteudo: '<p>O <strong>peso</strong> é a força gravitacional exercida sobre um corpo. A gravidade atrai os corpos em direção ao centro da Terra. O peso depende da massa do corpo e da gravidade local.</p><p>Diferente da massa (que é constante), o peso pode variar de planeta para planeta, pois a gravidade muda.</p><p><strong>Fórmula:</strong> P = m · g</p><p>Na Terra: g ≈ 10 m/s² (ou 9,8 m/s² para cálculos mais precisos).</p>',
            exemplos: [
                { texto: 'Um corpo de 5 kg na Terra: P = 5 × 10 = 50 N. Na Lua (g ≈ 1,6 m/s²), o mesmo corpo pesaria P = 5 × 1,6 = 8 N.', interpretacao: 'A massa é a mesma, mas o peso muda porque a gravidade é diferente.' }
            ],
            dicas: [
                { texto: 'Não confunda massa com peso! Massa é medida em kg; peso é uma força, medida em Newtons (N).' }
            ],
            erros: [
                { texto: 'Dizer "eu peso 70 kg" é fisicamente incorreto. O correto é "minha massa é 70 kg". Seu peso seria 700 N (70 × 10).' }
            ],
            exercicios: [
                { pergunta: 'Qual o peso de um corpo de 8 kg? Use g = 10 m/s².', opcoes: ['40 N', '80 N', '100 N', '8 N'], resposta: 1, comentario: 'P = m × g = 8 × 10 = 80 N.' }
            ],
            atividades: [
                { titulo: 'Peso em outros planetas', descricao: 'Pesquise a gravidade na Lua, em Marte e em Júpiter. Calcule qual seria o seu peso em cada um desses lugares.' }
            ]
        },
        {
            numero: '04',
            titulo: 'Força Normal e Força de Atrito',
            conteudo: '<p>A <strong>força normal (N)</strong> é a força que uma superfície exerce sobre um corpo apoiado nela. Ela sempre atua <strong>perpendicularmente</strong> à superfície de contato.</p><p>A <strong>força de atrito (Fat)</strong> se opõe ao movimento (ou à tendência de movimento) entre duas superfícies em contato. Existem dois tipos:</p><ul><li><strong>Atrito Estático:</strong> impede o início do movimento.</li><li><strong>Atrito Cinético (ou Dinâmico):</strong> atua durante o movimento.</li></ul><p><strong>Fórmula:</strong> Fat = μ · N (onde μ é o coeficiente de atrito).</p>',
            exemplos: [
                { texto: 'Um bloco sobre uma mesa possui: Peso ↓ e Normal ↑. Se você empurrar o bloco, surge também a força de atrito ← (contrária ao movimento).', interpretacao: 'A normal equilibra o peso; o atrito se opõe à força aplicada.' }
            ],
            dicas: [
                { texto: 'Em superfícies horizontais com o corpo em equilíbrio vertical, a normal é igual ao peso. Mas cuidado: em planos inclinados, a normal é menor que o peso!' }
            ],
            erros: [
                { texto: 'Não ache que a normal é sempre igual ao peso. Em elevadores acelerados ou planos inclinados, a normal pode ser maior ou menor que o peso.' }
            ],
            exercicios: [
                { pergunta: 'Qual força se opõe ao movimento entre duas superfícies?', opcoes: ['Normal', 'Peso', 'Atrito', 'Tração'], resposta: 2, comentario: 'A força de atrito sempre se opõe ao movimento (ou à tendência de movimento).' }
            ],
            atividades: [
                { titulo: 'Experimento com atrito', descricao: 'Deslize um objeto sobre diferentes superfícies (madeira, carpete, vidro). Anote em qual superfície o objeto desliza mais facilmente e explique por quê.' }
            ]
        },
        {
            numero: '05',
            titulo: 'Primeira Lei de Newton — Lei da Inércia',
            conteudo: '<p>A <strong>Primeira Lei de Newton</strong> (Lei da Inércia) afirma:</p><p><em>"Todo corpo tende a manter seu estado de repouso ou de movimento retilíneo uniforme, a menos que uma força resultante atue sobre ele."</em></p><p>A <strong>inércia</strong> é a tendência dos corpos de resistirem às mudanças de movimento. Quanto maior a massa de um corpo, maior é sua inércia — ou seja, mais difícil é alterar seu estado de movimento.</p>',
            exemplos: [
                { texto: 'Quando um ônibus freia bruscamente, os passageiros são "jogados" para frente. Na verdade, eles tendem a continuar em movimento por inércia, enquanto o ônibus para.', interpretacao: 'O cinto de segurança serve para aplicar uma força que vence a inércia do passageiro.' }
            ],
            dicas: [
                { texto: 'A inércia explica por que é mais fácil empurrar um carrinho de supermercado vazio do que um cheio. Massa maior = inércia maior.' }
            ],
            erros: [
                { texto: 'A inércia NÃO é uma força! É uma propriedade da matéria. Nenhum corpo "tem força de inércia".' }
            ],
            exercicios: [
                { pergunta: 'O que é inércia?', opcoes: ['Tendência de manter o estado de movimento', 'Uma força que puxa os corpos', 'Velocidade constante', 'Mudança de direção'], resposta: 0, comentario: 'A inércia é a tendência natural dos corpos de resistirem a mudanças em seu estado de movimento.' }
            ],
            atividades: [
                { titulo: 'Inércia no cotidiano', descricao: 'Descreva 3 situações em que você observa o efeito da inércia (ex: ao andar de carro, ao correr e parar, ao sacudir uma toalha).' }
            ]
        },
        {
            numero: '06',
            titulo: 'Segunda Lei de Newton — Princípio Fundamental',
            conteudo: '<p>A <strong>Segunda Lei de Newton</strong> (Princípio Fundamental da Dinâmica) relaciona força, massa e aceleração:</p><p><strong>F = m · a</strong></p><p>Isso significa que:</p><ul><li>Quanto maior a força aplicada, maior a aceleração.</li><li>Quanto maior a massa do corpo, menor a aceleração para uma mesma força.</li></ul><p>A força resultante (FR) é a soma vetorial de todas as forças que atuam sobre o corpo.</p>',
            exemplos: [
                { texto: 'Uma força de 20 N atua em um corpo de 4 kg. a = F/m = 20/4 = 5 m/s².', interpretacao: 'A aceleração é diretamente proporcional à força e inversamente proporcional à massa.' }
            ],
            dicas: [
                { texto: 'Sempre use a força RESULTANTE na fórmula F = m·a. Se houver várias forças, some-as vetorialmente primeiro.' }
            ],
            erros: [
                { texto: 'Não use F = m·a com a força aplicada individualmente se houver atrito. Calcule a resultante primeiro!' }
            ],
            exercicios: [
                { pergunta: 'Uma força de 30 N atua em um corpo de 10 kg. Qual a aceleração?', opcoes: ['2 m/s²', '3 m/s²', '5 m/s²', '10 m/s²'], resposta: 1, comentario: 'a = F/m = 30/10 = 3 m/s².' }
            ],
            atividades: [
                { titulo: 'Calculando forças', descricao: 'Pesquise a massa de 3 veículos diferentes (ex: bicicleta, carro, caminhão) e calcule a força necessária para acelerar cada um a 2 m/s².' }
            ]
        },
        {
            numero: '07',
            titulo: 'Diagramas de Forças (Corpo Livre)',
            conteudo: '<p><strong>Diagramas de forças</strong> (ou diagramas de corpo livre) mostram todas as forças que atuam em um corpo. Eles são ferramentas essenciais para resolver problemas de Dinâmica.</p><p>As principais forças que aparecem são:</p><ul><li><strong>Peso (P):</strong> sempre para baixo (em direção ao centro da Terra).</li><li><strong>Normal (N):</strong> perpendicular à superfície de apoio.</li><li><strong>Atrito (Fat):</strong> paralelo à superfície, oposto ao movimento.</li><li><strong>Tração (T):</strong> exercida por fios ou cordas.</li><li><strong>Força aplicada (F):</strong> qualquer força externa.</li></ul>',
            exemplos: [
                { texto: 'Uma caixa sobre uma mesa sendo empurrada para a direita: Peso ↓, Normal ↑, Força aplicada →, Atrito ←.', interpretacao: 'Se a força aplicada for maior que o atrito, o corpo acelera para a direita.' }
            ],
            dicas: [
                { texto: 'Sempre comece desenhando o peso e a normal. Depois adicione as outras forças conforme o problema.' }
            ],
            erros: [
                { texto: 'Não se esqueça de nenhuma força! Se há uma corda puxando, inclua a tração. Se há contato com o chão, inclua o atrito.' }
            ],
            exercicios: [
                { pergunta: 'Qual força sempre aponta para baixo em um corpo sobre a mesa?', opcoes: ['Normal', 'Atrito', 'Peso', 'Tração'], resposta: 2, comentario: 'O peso sempre aponta para o centro da Terra (para baixo).' }
            ],
            atividades: [
                { titulo: 'Desenhando diagramas', descricao: 'Desenhe o diagrama de forças para: (a) um livro parado sobre uma mesa, (b) uma lâmpada pendurada no teto, (c) um bloco sendo puxado por uma corda.' }
            ]
        },
        {
            numero: '08',
            titulo: 'Plano Horizontal e Plano Inclinado',
            conteudo: '<p>No <strong>plano horizontal</strong>, as forças atuam na direção horizontal (força aplicada e atrito) e na direção vertical (peso e normal). Se o corpo estiver em equilíbrio vertical, N = P.</p><p>No <strong>plano inclinado</strong>, o peso é decomposto em duas componentes:</p><ul><li><strong>Px = P · senθ</strong> (paralela ao plano, responsável pelo movimento).</li><li><strong>Py = P · cosθ</strong> (perpendicular ao plano, equilibrada pela normal).</li></ul>',
            exemplos: [
                { texto: 'Em um plano inclinado de 30°, um corpo de 10 kg: Px = 100 × sen30° = 100 × 0,5 = 50 N. Essa é a força que puxa o corpo para baixo.', interpretacao: 'Se não houver atrito, o corpo desce com aceleração a = g × senθ = 10 × 0,5 = 5 m/s².' }
            ],
            dicas: [
                { texto: 'Em planos inclinados sem atrito, a aceleração é a = g·senθ. Não depende da massa do corpo!' }
            ],
            erros: [
                { texto: 'Cuidado: no plano inclinado, a normal NÃO é igual ao peso. N = Py = P·cosθ, que é menor que P.' }
            ],
            exercicios: [
                { pergunta: 'No plano inclinado, qual componente do peso causa o movimento?', opcoes: ['Componente paralela (Px)', 'Componente perpendicular (Py)', 'Força normal', 'Atrito estático'], resposta: 0, comentario: 'A componente paralela ao plano (Px = P·senθ) é a responsável pelo movimento.' }
            ],
            atividades: [
                { titulo: 'Plano inclinado caseiro', descricao: 'Use uma tábua inclinada e um objeto. Meça o ângulo e calcule a componente paralela do peso. Depois, solte o objeto e observe o movimento.' }
            ]
        },
        {
            numero: '09',
            titulo: 'Terceira Lei de Newton — Ação e Reação',
            conteudo: '<p>A <strong>Terceira Lei de Newton</strong> (Lei da Ação e Reação) afirma:</p><p><em>"Para toda força de ação, existe uma força de reação de mesma intensidade, mesma direção e sentido oposto, atuando em corpos diferentes."</em></p><p>Características do par ação-reação:</p><ul><li>Mesma intensidade (módulo).</li><li>Mesma direção.</li><li>Sentidos opostos.</li><li><strong>Atuam em corpos diferentes</strong> (por isso não se anulam!).</li></ul>',
            exemplos: [
                { texto: 'Ao caminhar, seu pé empurra o chão para trás (ação). O chão empurra você para frente (reação). É por isso que você se move!', interpretacao: 'Foguetes funcionam pelo mesmo princípio: gases são expelidos para baixo (ação) e o foguete sobe (reação).' }
            ],
            dicas: [
                { texto: 'O par ação-reação nunca atua no mesmo corpo. Por isso, ação e reação NÃO se cancelam!' }
            ],
            erros: [
                { texto: 'Confundir equilíbrio (forças no mesmo corpo) com ação-reação (forças em corpos diferentes) é um erro clássico em provas.' }
            ],
            exercicios: [
                { pergunta: 'As forças de ação e reação atuam:', opcoes: ['No mesmo corpo', 'Em corpos diferentes', 'Na mesma direção e sentido', 'Apenas em objetos parados'], resposta: 1, comentario: 'Ação e reação atuam em corpos diferentes. Por isso, não se cancelam.' }
            ],
            atividades: [
                { titulo: 'Ação e reação em ação', descricao: 'Observe 3 exemplos de ação e reação (ex: nadar, andar, foguete) e descreva o par de forças em cada caso, identificando em qual corpo cada força atua.' }
            ]
        },
        {
            numero: '10',
            titulo: 'Força Centrípeta',
            conteudo: '<p>A <strong>força centrípeta (Fc)</strong> é a força resultante que mantém um corpo em trajetória circular. Ela sempre aponta para o <strong>centro</strong> da curva.</p><p>Sem essa força, o corpo sairia pela tangente (em linha reta), como manda a Primeira Lei de Newton.</p><p><strong>Fórmula:</strong> Fc = (m · v²) / R</p><p>Onde: m = massa (kg), v = velocidade (m/s), R = raio da trajetória (m).</p>',
            exemplos: [
                { texto: 'Um carro de 1000 kg faz uma curva de raio 50 m a 20 m/s. Fc = (1000 × 400) / 50 = 8000 N.', interpretacao: 'Essa força centrípeta é fornecida pelo atrito dos pneus com o asfalto. Se o atrito for insuficiente, o carro derrapa!' }
            ],
            dicas: [
                { texto: 'A força centrípeta não é um novo tipo de força — é apenas o nome da força resultante que aponta para o centro. Pode ser atrito, tração, gravidade, etc.' }
            ],
            erros: [
                { texto: 'Não confunda força centrípeta (para dentro) com força centrífuga (sensação de ser jogado para fora). A força centrífuga é uma força fictícia, não uma força real!' }
            ],
            exercicios: [
                { pergunta: 'Para onde aponta a força centrípeta?', opcoes: ['Para fora da curva', 'Para o centro da trajetória', 'Para cima', 'Para baixo'], resposta: 1, comentario: 'A força centrípeta sempre aponta para o centro da trajetória circular.' }
            ],
            atividades: [
                { titulo: 'Curvas e velocidade', descricao: 'Pesquise por que carros precisam reduzir a velocidade em curvas fechadas. Calcule a força centrípeta necessária para um carro de 800 kg fazer uma curva de 30 m a 15 m/s.' }
            ]
        },
        {
            numero: '11',
            titulo: 'Gravitação Universal',
            conteudo: '<p>Newton também formulou a <strong>Lei da Gravitação Universal</strong>, que explica a atração gravitacional entre quaisquer corpos com massa no universo.</p><p><strong>Fórmula:</strong> F = G · (m₁ · m₂) / d²</p><p>Onde: G = constante gravitacional (6,67 × 10⁻¹¹ N·m²/kg²), m₁ e m₂ = massas dos corpos, d = distância entre seus centros.</p><p>Quanto maiores as massas, maior a força. Quanto maior a distância, menor a força (proporcional ao quadrado da distância).</p>',
            exemplos: [
                { texto: 'A Terra atrai a Lua por meio da gravidade. Essa força mantém a Lua em órbita. Se a gravidade "desligasse", a Lua sairia em linha reta pelo espaço!', interpretacao: 'A mesma lei que faz uma maçã cair também mantém os planetas em órbita.' }
            ],
            dicas: [
                { texto: 'A constante G é muito pequena. Por isso, a força gravitacional só é perceptível quando pelo menos um dos corpos tem massa enorme (como um planeta).' }
            ],
            erros: [
                { texto: 'A força gravitacional existe entre TODOS os corpos com massa. Você está atraindo gravitacionalmente o seu celular agora mesmo — só que a força é tão pequena que é imperceptível.' }
            ],
            exercicios: [
                { pergunta: 'A força gravitacional entre dois corpos aumenta quando:', opcoes: ['As massas aumentam', 'A distância aumenta', 'A massa diminui', 'O corpo para'], resposta: 0, comentario: 'Quanto maiores as massas, maior a força gravitacional entre os corpos.' }
            ],
            atividades: [
                { titulo: 'Pesquisando a gravidade', descricao: 'Pesquise o valor da constante G e explique por que não percebemos a atração gravitacional entre objetos do dia a dia (ex: dois livros sobre a mesa).' }
            ]
        },
        {
            numero: '12',
            titulo: 'Aplicações das Leis de Newton e Revisão Final',
            conteudo: '<p>As Leis de Newton são aplicadas em praticamente todas as áreas da ciência e tecnologia:</p><ul><li><strong>Transporte:</strong> carros, aviões, trens.</li><li><strong>Engenharia:</strong> pontes, edifícios, estruturas.</li><li><strong>Esportes:</strong> futebol, natação, atletismo.</li><li><strong>Astronomia:</strong> órbitas planetárias, satélites.</li><li><strong>Foguetes:</strong> propulsão por ação e reação.</li></ul><p><strong>Resumo das fórmulas:</strong></p><ul><li>P = m · g</li><li>F = m · a</li><li>Fat = μ · N</li><li>Fc = (m · v²) / R</li><li>F = G · (m₁ · m₂) / d²</li></ul>',
            exemplos: [
                { texto: 'Um foguete sobe porque os gases são expelidos para baixo (ação) e o foguete recebe uma força para cima (reação).', interpretacao: 'O foguete não precisa "empurrar" o ar para subir — ele funciona até no vácuo do espaço!' }
            ],
            dicas: [
                { texto: 'Monte um resumo com todas as fórmulas e cole na parede. Resolver muitos exercícios é a chave para dominar as Leis de Newton.' }
            ],
            erros: [
                { texto: 'O erro mais comum em Dinâmica é aplicar F = m·a usando a força errada. Sempre calcule a força RESULTANTE primeiro.' }
            ],
            exercicios: [
                { pergunta: 'Um corpo de 5 kg recebe força de 25 N. Qual a aceleração?', opcoes: ['2 m/s²', '5 m/s²', '10 m/s²', '25 m/s²'], resposta: 1, comentario: 'a = F/m = 25/5 = 5 m/s².' },
                { pergunta: 'Qual o peso de um corpo de 7 kg? Use g = 10 m/s².', opcoes: ['7 N', '17 N', '70 N', '700 N'], resposta: 2, comentario: 'P = m × g = 7 × 10 = 70 N.' },
                { pergunta: 'Um bloco recebe força de 60 N e atrito de 15 N. Massa = 9 kg. Qual a aceleração?', opcoes: ['3 m/s²', '5 m/s²', '7 m/s²', '9 m/s²'], resposta: 1, comentario: 'FR = 60 − 15 = 45 N. a = 45/9 = 5 m/s².' }
            ],
            atividades: [
                { titulo: 'Resumo completo', descricao: 'Crie um mapa mental ou resumo de uma página com as três Leis de Newton e suas aplicações.' },
                { titulo: 'Resolvendo problemas', descricao: 'Resolva 10 exercícios de aplicação das Leis de Newton (use seu livro didático ou sites confiáveis) e anote as dúvidas.' },
                { titulo: 'As leis nos esportes', descricao: 'Escolha um esporte e explique como as três Leis de Newton se aplicam a ele (ex: futebol, natação, basquete).' }
            ]
        }
    ]
},
    'tabela-periodica': {
    titulo: 'Tabela Periódica — Guia Completo de Química',
    descricao: 'Aprenda toda a estrutura da Tabela Periódica, famílias, períodos, propriedades periódicas, distribuição eletrônica, ligações químicas e classificação dos elementos através de teoria completa, exemplos e exercícios.',
    semNiveis: true,
    topicos: [
        {
            numero: '01',
            titulo: 'Introdução à Tabela Periódica',
            conteudo: '<p>A <strong>Tabela Periódica</strong> é uma ferramenta fundamental da Química. Ela organiza todos os elementos químicos conhecidos de acordo com:</p><ul><li><strong>Número atômico</strong> (crescente)</li><li><strong>Configuração eletrônica</strong></li><li><strong>Propriedades químicas</strong> semelhantes</li><li><strong>Características físicas</strong></li></ul><p>Atualmente, existem <strong>118 elementos químicos</strong> oficialmente reconhecidos pela IUPAC, organizados em 7 períodos e 18 grupos.</p>',
            dicas: [{ texto: 'A tabela periódica é como um "mapa" dos elementos. Saber navegar por ela é essencial para entender Química.' }],
            erros: [{ texto: 'Não confunda número atômico (Z) com número de massa (A). Z = prótons; A = prótons + nêutrons.' }],
            exercicios: [{ pergunta: 'Quantos elementos existem atualmente na Tabela Periódica?', opcoes: ['92', '100', '118', '120'], resposta: 2, comentario: 'São 118 elementos reconhecidos pela IUPAC.' }],
            atividades: [{ titulo: 'Explorando a tabela', descricao: 'Observe uma Tabela Periódica completa e anote: quantos períodos? Quantos grupos? Qual o elemento de maior Z?' }]
        },
        {
            numero: '02',
            titulo: 'Número Atômico (Z)',
            conteudo: '<p>O <strong>número atômico (Z)</strong> indica a quantidade de <strong>prótons</strong> no núcleo. Cada elemento tem um Z único — é sua "identidade". Em átomos neutros, Z também indica o número de elétrons.</p><p>A Tabela é organizada em ordem crescente de Z.</p>',
            exemplos: [{ texto: 'Hidrogênio (Z=1) = 1 próton. Oxigênio (Z=8) = 8 prótons.', interpretacao: 'O número atômico define qual elemento químico é.' }],
            dicas: [{ texto: 'O número atômico fica acima do símbolo na tabela periódica.' }],
            erros: [{ texto: 'Não confunda Z (prótons) com A (prótons + nêutrons).' }],
            exercicios: [{ pergunta: 'O que representa o número atômico?', opcoes: ['Prótons', 'Elétrons', 'Nêutrons', 'Camadas'], resposta: 0, comentario: 'Z = quantidade de prótons no núcleo.' }],
            atividades: [{ titulo: 'Identificando Z', descricao: 'Escolha 5 elementos e anote Z, prótons e elétrons de cada um.' }]
        },
        {
            numero: '03',
            titulo: 'Períodos',
            conteudo: '<p><strong>Períodos</strong> são as <strong>linhas horizontais</strong> (7 no total). Elementos do mesmo período têm o mesmo número de camadas eletrônicas.</p>',
            exemplos: [{ texto: 'Sódio (Na) está no 3º período → 3 camadas. Potássio (K) no 4º → 4 camadas.', interpretacao: 'O número do período = número de camadas eletrônicas.' }],
            dicas: [{ texto: 'Período = camadas. Quanto maior o período, maior o átomo (mais camadas).' }],
            erros: [{ texto: 'Não confunda período (linha) com grupo (coluna).' }],
            exercicios: [{ pergunta: 'Quantos períodos existem?', opcoes: ['5', '6', '7', '8'], resposta: 2, comentario: 'São exatamente 7 períodos.' }],
            atividades: [{ titulo: 'Mapeando períodos', descricao: 'Escolha um elemento de cada período e anote quantas camadas cada um possui.' }]
        },
        {
            numero: '04',
            titulo: 'Grupos ou Famílias',
            conteudo: '<p><strong>Grupos</strong> (ou famílias) são as <strong>colunas verticais</strong> (18 grupos). Elementos do mesmo grupo têm o mesmo número de elétrons na camada de valência → propriedades químicas semelhantes.</p>',
            exemplos: [{ texto: 'Li, Na, K (grupo 1A): todos têm 1 elétron na valência e reagem de forma parecida.', interpretacao: 'A família define o comportamento químico do elemento.' }],
            dicas: [{ texto: 'Para elementos representativos (1A-8A), o número do grupo = elétrons na valência.' }],
            erros: [{ texto: 'Metais de transição (grupos 3-12) não seguem a regra simples da valência.' }],
            exercicios: [{ pergunta: 'O que elementos do mesmo grupo têm em comum?', opcoes: ['Prótons', 'Elétrons na valência', 'Camadas', 'Massa'], resposta: 1, comentario: 'Mesmo número de elétrons na última camada.' }],
            atividades: [{ titulo: 'Famílias em ação', descricao: 'Escolha 3 famílias e liste 3 elementos de cada, pesquisando uma propriedade comum.' }]
        },
        {
            numero: '05',
            titulo: 'Metais Alcalinos e Alcalino-Terrosos',
            conteudo: '<p><strong>Alcalinos (1A):</strong> 1 elétron na valência, extremamente reativos (reagem com água), moles, baixa densidade. Ex: Li, Na, K.<br><strong>Alcalino-terrosos (2A):</strong> 2 elétrons na valência, menos reativos que os alcalinos. Ex: Be, Mg, Ca.</p>',
            exemplos: [{ texto: 'Sódio + água → reação violenta! Por isso é armazenado em querosene.', interpretacao: 'A reatividade vem da facilidade de perder elétrons da valência.' }],
            dicas: [{ texto: 'Alcalinos → +1. Alcalino-terrosos → +2 (cátions).' }],
            erros: [{ texto: 'Nem todo metal é igualmente reativo. Alcalinos são os mais reativos de todos!' }],
            exercicios: [{ pergunta: 'Qual família possui os metais alcalinos?', opcoes: ['1A', '2A', '7A', '8A'], resposta: 0, comentario: 'Grupo 1A: Li, Na, K, Rb, Cs, Fr.' }],
            atividades: [{ titulo: 'Reatividade em vídeo', descricao: 'Pesquise vídeos de reações de metais alcalinos com água e descreva o que acontece.' }]
        },
        {
            numero: '06',
            titulo: 'Halogênios e Gases Nobres',
            conteudo: '<p><strong>Halogênios (7A):</strong> 7 elétrons na valência, muito reativos, tendem a ganhar 1 elétron (ânions -1). Ex: F, Cl, Br.<br><strong>Gases nobres (8A):</strong> 8 elétrons na valência (camada completa), extremamente estáveis, praticamente não reagem. Ex: He, Ne, Ar.</p>',
            exemplos: [{ texto: 'Flúor (F): o elemento mais reativo. Neônio (Ne): tão estável que não reage com quase nada.', interpretacao: '7 elétrons (quer ganhar 1) vs. 8 elétrons (já estável).' }],
            dicas: [{ texto: 'Halogênios → -1. Gases nobres → estáveis (não formam íons).' }],
            erros: [{ texto: 'Hélio (He) tem apenas 2 elétrons na valência, mas ainda assim é estável (camada K completa).' }],
            exercicios: [{ pergunta: 'Qual família possui os gases nobres?', opcoes: ['1A', '2A', '7A', '8A'], resposta: 3, comentario: 'Grupo 8A: He, Ne, Ar, Kr, Xe, Rn.' }],
            atividades: [{ titulo: 'Onde estão os nobres?', descricao: 'Pesquise 3 aplicações dos gases nobres no dia a dia (letreiros, balões, lâmpadas).' }]
        },
        {
            numero: '07',
            titulo: 'Metais, Ametais e Semimetais',
            conteudo: '<p><strong>Metais:</strong> conduzem eletricidade e calor, brilho, maleáveis (formam lâminas), dúcteis (formam fios). Cerca de 75% dos elementos.<br><strong>Ametais:</strong> maus condutores, frágeis, sem brilho metálico.<br><strong>Semimetais:</strong> propriedades intermediárias (ex: Si, Ge — usados em chips).</p>',
            exemplos: [{ texto: 'Cobre (metal) → fios elétricos. Enxofre (ametal) → pó amarelo não condutor. Silício (semimetal) → chips.', interpretacao: 'A classificação determina as aplicações tecnológicas.' }],
            dicas: [{ texto: 'Metais à esquerda, ametais à direita, semimetais na "escada" entre eles.' }],
            erros: [{ texto: 'O hidrogênio (H) está no grupo 1A mas NÃO é metal — é um não metal.' }],
            exercicios: [{ pergunta: 'Qual característica é típica dos metais?', opcoes: ['Maus condutores', 'Conduzem eletricidade', 'Frágeis', 'Sem brilho'], resposta: 1, comentario: 'Metais são bons condutores de eletricidade e calor.' }],
            atividades: [{ titulo: 'Classificando elementos', descricao: 'Escolha 10 elementos e classifique-os como metal, ametal ou semimetal.' }]
        },
        {
            numero: '08',
            titulo: 'Blocos (s, p, d, f)',
            conteudo: '<p>A Tabela é dividida em blocos conforme o subnível mais energético:<br><strong>Bloco s:</strong> grupos 1A e 2A.<br><strong>Bloco p:</strong> grupos 3A a 8A.<br><strong>Bloco d:</strong> metais de transição (grupos 3-12).<br><strong>Bloco f:</strong> lantanídeos e actinídeos (terras raras).</p>',
            exemplos: [{ texto: 'Na (bloco s), Cl (bloco p), Fe (bloco d), U (bloco f).', interpretacao: 'O bloco indica qual subnível está sendo preenchido.' }],
            dicas: [{ texto: 'Lantanídeos e actinídeos ficam nas duas linhas separadas abaixo do corpo principal.' }],
            erros: [{ texto: 'Não confunda grupo com bloco. O grupo 3A já está no bloco p.' }],
            exercicios: [{ pergunta: 'Onde estão os metais de transição?', opcoes: ['Bloco s', 'Bloco p', 'Bloco d', 'Bloco f'], resposta: 2, comentario: 'Metais de transição ocupam o bloco d (grupos 3 a 12).' }],
            atividades: [{ titulo: 'Mapeando blocos', descricao: 'Identifique 3 elementos de cada bloco (s, p, d, f) e anote Z e símbolo.' }]
        },
        {
            numero: '09',
            titulo: 'Metais de Transição',
            conteudo: '<p>Ocupam o centro da Tabela (bloco d). Bons condutores, alta resistência, vários estados de oxidação (diferentes cargas), muitos formam compostos coloridos. Ex: Fe (ferro), Cu (cobre), Ag (prata), Au (ouro).</p>',
            exemplos: [{ texto: 'Ferro: Fe²⁺ (íon ferroso) e Fe³⁺ (íon férrico) — cada um com cores diferentes.', interpretacao: 'A variedade de estados de oxidação permite muitas reações diferentes.' }],
            dicas: [{ texto: 'Metais de transição são usados como catalisadores industriais.' }],
            erros: [{ texto: 'Nem todo metal do centro é de transição. Zn (zinco) tem subnível d completo e alguns não o consideram de transição.' }],
            exercicios: [{ pergunta: 'Qual é um metal de transição?', opcoes: ['Oxigênio', 'Cloro', 'Ferro', 'Neônio'], resposta: 2, comentario: 'Ferro (Fe) está no grupo 8, período 4.' }],
            atividades: [{ titulo: 'Cores da transição', descricao: 'Pesquise compostos de 3 metais de transição e suas cores (ex: sulfato de cobre é azul).' }]
        },
        {
            numero: '10',
            titulo: 'Raio Atômico',
            conteudo: '<p>O <strong>raio atômico</strong> é o tamanho do átomo. Tendências:<br>• Na mesma família: <strong>aumenta de cima para baixo</strong> (+ camadas).<br>• No mesmo período: <strong>aumenta da direita para a esquerda</strong> (- atração nuclear).<br>O maior: Frâncio (Fr). O menor: Hélio (He).</p>',
            exemplos: [{ texto: 'K > Li (K está abaixo no grupo 1A, mais camadas). Na > Cl (Na à esquerda no 3º período).', interpretacao: 'O raio aumenta para baixo e para a esquerda.' }],
            dicas: [{ texto: 'Pense como uma "escada": desce e vai para a esquerda → átomo maior.' }],
            erros: [{ texto: 'Raio atômico ≠ raio iônico. Quando vira íon, o tamanho muda muito.' }],
            exercicios: [{ pergunta: 'Qual tem maior raio: Li ou K?', opcoes: ['Li', 'K', 'Iguais', 'Depende'], resposta: 1, comentario: 'K está abaixo de Li no grupo 1A → mais camadas → maior raio.' }],
            atividades: [{ titulo: 'Ordenando átomos', descricao: 'Ordene do menor para o maior raio: Na, Cl, K, F. Explique.' }]
        },
        {
            numero: '11',
            titulo: 'Eletronegatividade',
            conteudo: '<p>Capacidade de <strong>atrair elétrons</strong> em uma ligação. Tendências:<br>• Na mesma família: <strong>aumenta de baixo para cima</strong>.<br>• No mesmo período: <strong>aumenta da esquerda para a direita</strong>.<br>O mais eletronegativo: <strong>Flúor (F)</strong> (4,0 na escala de Pauling). Gases nobres não têm valor definido.</p>',
            exemplos: [{ texto: 'F > O > Cl > Na. O flúor atrai elétrons com mais força que qualquer outro elemento.', interpretacao: 'A eletronegatividade explica por que em H₂O os elétrons ficam mais perto do oxigênio.' }],
            dicas: [{ texto: 'Eletronegatividade aumenta no sentido oposto ao raio atômico.' }],
            erros: [{ texto: 'Eletronegatividade ≠ afinidade eletrônica. São conceitos relacionados, mas diferentes.' }],
            exercicios: [{ pergunta: 'Qual é o elemento mais eletronegativo?', opcoes: ['Na', 'K', 'F', 'Mg'], resposta: 2, comentario: 'Flúor (F) é o mais eletronegativo (4,0).' }],
            atividades: [{ titulo: 'Comparando eletronegatividades', descricao: 'Ordene do menor para o maior: Li, O, Cs, F. Explique.' }]
        },
        {
            numero: '12',
            titulo: 'Distribuição Eletrônica',
            conteudo: '<p>Mostra como os elétrons ocupam os níveis e subníveis de energia. Segue o <strong>Diagrama de Linus Pauling</strong>:<br>1s² → 2s² → 2p⁶ → 3s² → 3p⁶ → 4s² → 3d¹⁰ → 4p⁶ → 5s² → 4d¹⁰ → 5p⁶ → 6s² → 4f¹⁴ → 5d¹⁰ → 6p⁶ → 7s² → 5f¹⁴ → 6d¹⁰ → 7p⁶</p>',
            exemplos: [{ texto: 'Sódio (Z=11): 1s² 2s² 2p⁶ 3s¹. O último elétron está no 3s¹ → grupo 1A, 3º período.', interpretacao: 'A distribuição eletrônica explica a posição do elemento na Tabela.' }],
            dicas: [{ texto: 'Siga sempre o diagrama de Pauling. 4s vem antes de 3d no preenchimento!' }],
            erros: [{ texto: 'A ordem de preenchimento (4s antes de 3d) não é a mesma da ordem geométrica das camadas.' }],
            exercicios: [{ pergunta: 'Qual a distribuição do sódio (Z=11)?', opcoes: ['1s² 2s² 2p⁵', '1s² 2s² 2p⁶ 3s¹', '1s² 2s² 2p⁶', '1s² 2s¹'], resposta: 1, comentario: '11 elétrons: 1s² 2s² 2p⁶ 3s¹.' }],
            atividades: [{ titulo: 'Distribuindo elétrons', descricao: 'Faça a distribuição de: Cl (Z=17), Ca (Z=20), Fe (Z=26), Br (Z=35).' }]
        },
        {
            numero: '13',
            titulo: 'Camada de Valência',
            conteudo: '<p>A <strong>camada de valência</strong> é a última camada eletrônica (a mais externa). Ela determina as <strong>propriedades químicas</strong> do elemento, pois seus elétrons participam das ligações.</p><p>Gases nobres têm 8 elétrons na valência (exceto He, com 2) → extremamente estáveis.</p>',
            exemplos: [{ texto: 'Na (1 elétron na valência) → perde 1. Cl (7 elétrons) → ganha 1. Juntos formam NaCl.', interpretacao: 'A valência explica como os átomos se combinam.' }],
            dicas: [{ texto: 'Elementos representativos: número do grupo = elétrons na valência.' }],
            erros: [{ texto: 'Para metais de transição, a regra "grupo = valência" não se aplica diretamente.' }],
            exercicios: [{ pergunta: 'O que a camada de valência determina?', opcoes: ['Massa', 'Propriedades químicas', 'Nêutrons', 'Período'], resposta: 1, comentario: 'Define como o elemento se comporta quimicamente.' }],
            atividades: [{ titulo: 'Elétrons de valência', descricao: 'Indique quantos elétrons de valência têm: Li, O, Al, Br, Kr.' }]
        },
        {
            numero: '14',
            titulo: 'Ligações Químicas e a Tabela',
            conteudo: '<p>A posição na Tabela prevê o tipo de ligação:<br><strong>Ligação Iônica:</strong> metal + ametal (transferência de elétrons). Ex: NaCl.<br><strong>Ligação Covalente:</strong> ametal + ametal (compartilhamento). Ex: H₂O.<br><strong>Ligação Metálica:</strong> metal + metal ("mar de elétrons"). Ex: Cu.</p>',
            exemplos: [{ texto: 'Na (metal) + Cl (ametal) → NaCl (iônico). C (ametal) + O (ametal) → CO₂ (covalente).', interpretacao: 'Metais (esquerda) + ametais (direita) = iônico.' }],
            dicas: [{ texto: 'Quanto maior a diferença de eletronegatividade, mais iônica é a ligação.' }],
            erros: [{ texto: 'Nem toda ligação metal-ametal é 100% iônica. Muitas têm caráter covalente parcial.' }],
            exercicios: [{ pergunta: 'Qual ligação ocorre entre Na e Cl?', opcoes: ['Iônica', 'Covalente', 'Metálica', 'Dupla'], resposta: 0, comentario: 'Metal + ametal = ligação iônica (transferência de elétrons).' }],
            atividades: [{ titulo: 'Prevendo ligações', descricao: 'Preveja o tipo de ligação: Mg+O, H+F, Fe+Fe, N+N.' }]
        },
        {
            numero: '15',
            titulo: 'Importância da Tabela Periódica',
            conteudo: '<p>A Tabela Periódica é uma <strong>ferramenta preditiva</strong>. Conhecendo a posição de um elemento, você prevê: reatividade, tamanho atômico, tipo de ligação, comportamento químico. É essencial para toda a Química moderna — de medicamentos a chips.</p>',
            dicas: [{ texto: 'Não precisa decorar a tabela inteira. Entenda as tendências e saiba navegar por ela.' }],
            erros: [{ texto: 'Achar que a Tabela é só uma lista de nomes. Ela é muito mais: é um mapa do comportamento químico.' }],
            exercicios: [{ pergunta: 'Por que a Tabela Periódica é importante?', opcoes: ['Decorar elementos', 'Prever propriedades', 'Apenas cálculos', 'Só laboratórios'], resposta: 1, comentario: 'Ela permite prever propriedades e comportamentos dos elementos.' }],
            atividades: [{ titulo: 'Resumo da Tabela', descricao: 'Crie um mapa mental com famílias, períodos, propriedades periódicas e tipos de elementos.' }]
        }
    ]
},
'ligacoes-quimicas': {
    titulo: 'Ligações Químicas — Guia Completo de Química',
    descricao: 'Estudo completo das ligações químicas, estabilidade dos átomos, regra do octeto, ligações iônicas, covalentes e metálicas, polaridade, forças intermoleculares e geometria molecular.',
    semNiveis: true,
    topicos: [
        {
            numero: '01',
            titulo: 'O que são Ligações Químicas?',
            conteudo: `<p>As ligações químicas são forças responsáveis por unir os átomos.</p>
<p>Os átomos realizam ligações buscando:</p>
<ul>
<li>estabilidade química</li>
<li>menor energia possível</li>
<li>completar a camada de valência</li>
</ul>
<p>A maioria dos elementos tende a adquirir uma configuração semelhante à dos gases nobres.</p>
<p>📌 <strong>Regra do Octeto:</strong><br>A maior parte dos átomos busca possuir 8 elétrons na camada de valência.</p>
<p>📌 <strong>Camada de Valência:</strong><br>É a última camada eletrônica do átomo e participa diretamente das ligações químicas.</p>
<p>📌 <strong>Elétrons de Valência:</strong><br>São os elétrons presentes na camada mais externa do átomo.</p>
<p><strong>Exemplo:</strong><br>Oxigênio: 1s² 2s² 2p⁴</p>
<p>Camada de valência: 2s² 2p⁴</p>
<p>Total: 6 elétrons de valência.</p>`,
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                {
                    pergunta: 'Qual o principal objetivo das ligações químicas?',
                    opcoes: [
                        'a) Aumentar a massa do átomo',
                        'b) Alcançar estabilidade química',
                        'c) Produzir energia nuclear',
                        'd) Diminuir o número atômico'
                    ],
                    resposta: 1,
                    comentario: 'Resposta correta: Alcançar estabilidade química.'
                }
            ],
            atividades: [
                { titulo: 'Pesquisa', descricao: 'Pesquise três substâncias do cotidiano e identifique quais átomos estão ligados em cada uma.' }
            ]
        },
        {
            numero: '02',
            titulo: 'Ligação Iônica',
            conteudo: `<p>A ligação iônica ocorre entre:</p>
<ul>
<li>metal + ametal</li>
</ul>
<p>Nesse tipo de ligação há:</p>
<ul>
<li>perda de elétrons</li>
<li>ganho de elétrons</li>
</ul>
<p>Formando:</p>
<ul>
<li>cátions (+)</li>
<li>ânions (-)</li>
</ul>
<p>📌 <strong>Cátion:</strong> Íon positivo formado pela perda de elétrons.</p>
<p>📌 <strong>Ânion:</strong> Íon negativo formado pelo ganho de elétrons.</p>
<p><strong>Exemplo — NaCl</strong></p>
<p>Sódio: Na → Na⁺ + e⁻</p>
<p>Cloro: Cl + e⁻ → Cl⁻</p>
<p>Resultado: NaCl</p>
<p><strong>Características das substâncias iônicas:</strong></p>
<ul>
<li>altos pontos de fusão</li>
<li>altos pontos de ebulição</li>
<li>conduzem eletricidade em solução</li>
<li>estrutura cristalina</li>
</ul>`,
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                {
                    pergunta: 'Qual ligação ocorre entre metal e ametal?',
                    opcoes: [
                        'a) Ligação iônica',
                        'b) Ligação metálica',
                        'c) Ligação covalente',
                        'd) Ligação dativa'
                    ],
                    resposta: 0,
                    comentario: 'Resposta correta: Ligação iônica.'
                }
            ],
            atividades: []
        },
        {
            numero: '03',
            titulo: 'Energia Reticular e Dissociação Iônica',
            conteudo: `<p>📌 <strong>Energia Reticular:</strong><br>É a força que mantém os íons unidos em um composto iônico.</p>
<p>Quanto maior a energia reticular:</p>
<ul>
<li>mais forte será a ligação.</li>
</ul>
<p>📌 <strong>Dissociação Iônica:</strong><br>Quando compostos iônicos são dissolvidos em água, seus íons se separam.</p>
<p><strong>Exemplo:</strong></p>
<p>NaCl → Na⁺ + Cl⁻</p>
<p>Isso explica por que soluções iônicas conduzem eletricidade.</p>`,
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                {
                    pergunta: 'O que acontece com os íons quando um composto iônico é dissolvido em água?',
                    opcoes: [
                        'a) São destruídos',
                        'b) Separam-se',
                        'c) Viram elétrons',
                        'd) Perdem prótons'
                    ],
                    resposta: 1,
                    comentario: 'Resposta correta: Separam-se.'
                }
            ],
            atividades: []
        },
        {
            numero: '04',
            titulo: 'Ligação Covalente',
            conteudo: `<p>A ligação covalente ocorre entre:</p>
<ul>
<li>ametais</li>
<li>ametais e hidrogênio</li>
</ul>
<p>Nesse tipo de ligação os átomos:</p>
<ul>
<li>compartilham elétrons</li>
</ul>
<p><strong>Objetivo:</strong> completar a camada de valência.</p>
<p><strong>Exemplo — Água (H₂O)</strong></p>
<p>O oxigênio necessita de 2 elétrons para completar o octeto.</p>
<p>Cada hidrogênio compartilha 1 elétron.</p>
<p>Forma-se: H₂O</p>`,
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                {
                    pergunta: 'O que caracteriza uma ligação covalente?',
                    opcoes: [
                        'a) Transferência de prótons',
                        'b) Formação de íons',
                        'c) Compartilhamento de elétrons',
                        'd) Presença obrigatória de metais'
                    ],
                    resposta: 2,
                    comentario: 'Resposta correta: Compartilhamento de elétrons.'
                }
            ],
            atividades: []
        },
        {
            numero: '05',
            titulo: 'Tipos de Ligação Covalente',
            conteudo: `<p>📌 <strong>Ligação Simples</strong><br>Compartilha: 1 par de elétrons.</p>
<p>Exemplo: H — H</p>
<p>📌 <strong>Ligação Dupla</strong><br>Compartilha: 2 pares de elétrons.</p>
<p>Exemplo: O = O</p>
<p>📌 <strong>Ligação Tripla</strong><br>Compartilha: 3 pares de elétrons.</p>
<p>Exemplo: N ≡ N</p>
<p>📌 <strong>Fórmula Estrutural</strong><br>Representa as ligações entre os átomos.</p>
<p>Exemplo: H — O — H</p>`,
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                {
                    pergunta: 'Quantos pares de elétrons são compartilhados em uma ligação dupla?',
                    opcoes: [
                        'a) 1',
                        'b) 2',
                        'c) 3',
                        'd) 4'
                    ],
                    resposta: 1,
                    comentario: 'Resposta correta: 2 pares.'
                }
            ],
            atividades: []
        },
        {
            numero: '06',
            titulo: 'Substâncias Moleculares e Redes Covalentes',
            conteudo: `<p>📌 <strong>Substâncias Moleculares</strong></p>
<p>Formadas por moléculas individuais.</p>
<p>Características:</p>
<ul>
<li>baixos pontos de fusão</li>
<li>baixos pontos de ebulição</li>
<li>geralmente não conduzem eletricidade</li>
</ul>
<p>📌 <strong>Redes Covalentes</strong></p>
<p>Algumas substâncias formam enormes redes de átomos ligados covalentemente.</p>
<p>Exemplo: Diamante.</p>
<p>Características:</p>
<ul>
<li>extrema dureza</li>
<li>altos pontos de fusão</li>
</ul>`,
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                {
                    pergunta: 'Qual substância é exemplo de rede covalente?',
                    opcoes: [
                        'a) Água',
                        'b) Sal de cozinha',
                        'c) Diamante',
                        'd) Oxigênio'
                    ],
                    resposta: 2,
                    comentario: 'Resposta correta: Diamante.'
                }
            ],
            atividades: []
        },
        {
            numero: '07',
            titulo: 'Polaridade das Ligações',
            conteudo: `<p>A polaridade depende da diferença de eletronegatividade entre os átomos.</p>
<p>📌 <strong>Ligação Covalente Polar</strong><br>O compartilhamento é desigual.</p>
<p>Exemplo: Água (H₂O)</p>
<p>📌 <strong>Ligação Covalente Apolar</strong><br>O compartilhamento é igual.</p>
<p>Exemplo: O₂</p>
<p>Quanto maior a diferença de eletronegatividade:</p>
<ul>
<li>maior será a polaridade.</li>
</ul>`,
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                {
                    pergunta: 'A molécula O₂ é:',
                    opcoes: [
                        'a) Iônica',
                        'b) Polar',
                        'c) Apolar',
                        'd) Metálica'
                    ],
                    resposta: 2,
                    comentario: 'Resposta correta: Apolar.'
                }
            ],
            atividades: [
                { titulo: 'Identificando polaridade', descricao: 'Identifique no seu cotidiano três substâncias polares e três apolares.' }
            ]
        },
        {
            numero: '08',
            titulo: 'Ligação Coordenada (Dativa)',
            conteudo: `<p>Na ligação coordenada, um único átomo fornece os dois elétrons compartilhados.</p>
<p>Exemplo: Monóxido de carbono (CO)</p>
<p>Esse tipo de ligação também é chamado de:</p>
<ul>
<li>ligação dativa</li>
</ul>`,
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                {
                    pergunta: 'Na ligação coordenada, quem fornece os elétrons compartilhados?',
                    opcoes: [
                        'a) Ambos os átomos igualmente',
                        'b) Apenas um dos átomos',
                        'c) Apenas metais',
                        'd) Apenas gases nobres'
                    ],
                    resposta: 1,
                    comentario: 'Resposta correta: Apenas um dos átomos.'
                }
            ],
            atividades: []
        },
        {
            numero: '09',
            titulo: 'Ligação Metálica',
            conteudo: `<p>A ligação metálica ocorre entre metais.</p>
<p>📌 <strong>Modelo do Mar de Elétrons</strong></p>
<p>Os elétrons ficam livres entre os átomos metálicos.</p>
<p>Isso explica propriedades como:</p>
<ul>
<li>condução elétrica</li>
<li>condução térmica</li>
<li>brilho metálico</li>
<li>maleabilidade</li>
<li>ductilidade</li>
</ul>
<p><strong>Exemplos:</strong> ferro, ouro, alumínio.</p>`,
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                {
                    pergunta: 'Por que os metais conduzem eletricidade?',
                    opcoes: [
                        'a) Porque possuem prótons livres',
                        'b) Porque possuem neutrons móveis',
                        'c) Porque possuem elétrons livres',
                        'd) Porque possuem íons negativos'
                    ],
                    resposta: 2,
                    comentario: 'Resposta correta: Porque possuem elétrons livres.'
                }
            ],
            atividades: []
        },
        {
            numero: '10',
            titulo: 'Ligas Metálicas',
            conteudo: `<p>Ligas metálicas são misturas de metais.</p>
<p><strong>Objetivo:</strong></p>
<ul>
<li>melhorar propriedades mecânicas</li>
<li>aumentar resistência</li>
<li>evitar corrosão</li>
</ul>
<p><strong>Exemplos:</strong></p>
<p>📌 <strong>Bronze:</strong> cobre + estanho</p>
<p>📌 <strong>Aço:</strong> ferro + carbono</p>`,
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                {
                    pergunta: 'Qual mistura forma o bronze?',
                    opcoes: [
                        'a) Ferro + carbono',
                        'b) Cobre + estanho',
                        'c) Ouro + prata',
                        'd) Ferro + alumínio'
                    ],
                    resposta: 1,
                    comentario: 'Resposta correta: Cobre + estanho.'
                }
            ],
            atividades: []
        },
        {
            numero: '11',
            titulo: 'Forças Intermoleculares',
            conteudo: `<p>As forças intermoleculares são atrações entre moléculas.</p>
<p>Influenciam:</p>
<ul>
<li>ponto de fusão</li>
<li>ponto de ebulição</li>
<li>solubilidade</li>
</ul>
<p><strong>Tipos:</strong></p>
<p>📌 <strong>Dipolo induzido:</strong> Força mais fraca.</p>
<p>📌 <strong>Dipolo-dipolo:</strong> Entre moléculas polares.</p>
<p>📌 <strong>Ligação de hidrogênio:</strong> Força intermolecular mais intensa.</p>
<p>Ocorre quando H liga-se a F, O ou N.</p>
<p>Exemplo: Água.</p>`,
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                {
                    pergunta: 'Qual é a força intermolecular mais intensa?',
                    opcoes: [
                        'a) Dipolo induzido',
                        'b) Dipolo instantâneo',
                        'c) Ligação de hidrogênio',
                        'd) Força nuclear'
                    ],
                    resposta: 2,
                    comentario: 'Resposta correta: Ligação de hidrogênio.'
                }
            ],
            atividades: []
        },
        {
            numero: '12',
            titulo: 'Geometria Molecular',
            conteudo: `<p>A geometria molecular estuda a forma das moléculas.</p>
<p><strong>Principais geometrias:</strong></p>
<p>📌 <strong>Linear:</strong> CO₂</p>
<p>📌 <strong>Angular:</strong> H₂O</p>
<p>📌 <strong>Trigonal Plana:</strong> BF₃</p>
<p>📌 <strong>Tetraédrica:</strong> CH₄</p>
<p>📌 <strong>Teoria da Repulsão dos Pares Eletrônicos:</strong> Os pares eletrônicos afastam-se para diminuir repulsões.</p>`,
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                {
                    pergunta: 'Qual a geometria da molécula CH₄?',
                    opcoes: [
                        'a) Linear',
                        'b) Angular',
                        'c) Trigonal plana',
                        'd) Tetraédrica'
                    ],
                    resposta: 3,
                    comentario: 'Resposta correta: Tetraédrica.'
                }
            ],
            atividades: []
        },
        {
            numero: '13',
            titulo: 'Hibridização',
            conteudo: `<p>Hibridização é a mistura de orbitais atômicos.</p>
<p><strong>Principais tipos:</strong></p>
<ul>
<li>sp</li>
<li>sp²</li>
<li>sp³</li>
</ul>
<p>A hibridização ajuda a explicar:</p>
<ul>
<li>geometria molecular</li>
<li>ângulos de ligação</li>
</ul>`,
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                {
                    pergunta: 'Qual conceito explica a mistura de orbitais?',
                    opcoes: [
                        'a) Ionização',
                        'b) Eletronegatividade',
                        'c) Hibridização',
                        'd) Radioatividade'
                    ],
                    resposta: 2,
                    comentario: 'Resposta correta: Hibridização.'
                }
            ],
            atividades: []
        },
        {
            numero: '14',
            titulo: 'Regra do Dueto e Exceções do Octeto',
            conteudo: `<p>📌 <strong>Regra do Dueto:</strong> O hidrogênio busca estabilidade com 2 elétrons.</p>
<p>📌 <strong>Exceções ao Octeto</strong></p>
<p>Nem todos os elementos seguem a regra do octeto.</p>
<p><strong>Exemplos:</strong></p>
<p>📌 <strong>Octeto incompleto:</strong> BF₃</p>
<p>📌 <strong>Octeto expandido:</strong> SF₆</p>`,
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                {
                    pergunta: 'Qual molécula possui octeto expandido?',
                    opcoes: [
                        'a) BF₃',
                        'b) H₂',
                        'c) SF₆',
                        'd) O₂'
                    ],
                    resposta: 2,
                    comentario: 'Resposta correta: SF₆.'
                }
            ],
            atividades: [
                { titulo: 'Mapa Mental', descricao: 'Monte um mapa mental mostrando os tipos de ligações químicas e exemplos de cada uma.' }
            ]
        },
        {
            numero: '15',
            titulo: 'Resumo Geral das Ligações Químicas',
            conteudo: `<p><strong>Resumo Final:</strong></p>
<p>📌 <strong>Ligação Iônica:</strong> metal + ametal → transferência de elétrons</p>
<p>📌 <strong>Ligação Covalente:</strong> ametais → compartilhamento de elétrons</p>
<p>📌 <strong>Ligação Metálica:</strong> metais → elétrons livres</p>
<p>📌 <strong>Polaridade:</strong> Depende da diferença de eletronegatividade.</p>
<p>📌 <strong>Água:</strong> Molécula polar.</p>
<p>📌 <strong>Metais:</strong> Conduzem eletricidade devido aos elétrons livres.</p>`,
            exemplos: [],
            dicas: [],
            erros: [],
            exercicios: [
                {
                    pergunta: 'Qual ligação ocorre entre metais?',
                    opcoes: [
                        'a) Iônica',
                        'b) Covalente',
                        'c) Metálica',
                        'd) Polar'
                    ],
                    resposta: 2,
                    comentario: 'Resposta correta: Metálica.'
                }
            ],
            atividades: []
        }
    ]
}
};

function getModulos(materiaId) {
    for (const cat of Object.values(categoriasEstudos)) {
        for (const mat of cat.materias) {
            if (mat.id === materiaId && mat.modulos) return mat.modulos;
        }
    }
    return [];
}

    // ========== TABELA PERIÓDICA (118 ELEMENTOS) ==========
    const elementosTP = [
        { num: 1, simb: 'H', nome: 'Hidrogênio', massa: '1.008', grupo: 1, periodo: 1, tipo: 'nao-metal', familia: 'Não metal' },
        { num: 2, simb: 'He', nome: 'Hélio', massa: '4.0026', grupo: 18, periodo: 1, tipo: 'gas-nobre', familia: 'Gás nobre' },
        { num: 3, simb: 'Li', nome: 'Lítio', massa: '6.94', grupo: 1, periodo: 2, tipo: 'metal-alcalino', familia: 'Metal alcalino' },
        { num: 4, simb: 'Be', nome: 'Berílio', massa: '9.0122', grupo: 2, periodo: 2, tipo: 'metal-alcalino-terroso', familia: 'Metal alcalino-terroso' },
        { num: 5, simb: 'B', nome: 'Boro', massa: '10.81', grupo: 13, periodo: 2, tipo: 'semi-metal', familia: 'Semimetal' },
        { num: 6, simb: 'C', nome: 'Carbono', massa: '12.011', grupo: 14, periodo: 2, tipo: 'nao-metal', familia: 'Não metal' },
        { num: 7, simb: 'N', nome: 'Nitrogênio', massa: '14.007', grupo: 15, periodo: 2, tipo: 'nao-metal', familia: 'Não metal' },
        { num: 8, simb: 'O', nome: 'Oxigênio', massa: '15.999', grupo: 16, periodo: 2, tipo: 'nao-metal', familia: 'Não metal' },
        { num: 9, simb: 'F', nome: 'Flúor', massa: '18.998', grupo: 17, periodo: 2, tipo: 'halogenio', familia: 'Halogênio' },
        { num: 10, simb: 'Ne', nome: 'Neônio', massa: '20.180', grupo: 18, periodo: 2, tipo: 'gas-nobre', familia: 'Gás nobre' },
        { num: 11, simb: 'Na', nome: 'Sódio', massa: '22.990', grupo: 1, periodo: 3, tipo: 'metal-alcalino', familia: 'Metal alcalino' },
        { num: 12, simb: 'Mg', nome: 'Magnésio', massa: '24.305', grupo: 2, periodo: 3, tipo: 'metal-alcalino-terroso', familia: 'Metal alcalino-terroso' },
        { num: 13, simb: 'Al', nome: 'Alumínio', massa: '26.982', grupo: 13, periodo: 3, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 14, simb: 'Si', nome: 'Silício', massa: '28.085', grupo: 14, periodo: 3, tipo: 'semi-metal', familia: 'Semimetal' },
        { num: 15, simb: 'P', nome: 'Fósforo', massa: '30.974', grupo: 15, periodo: 3, tipo: 'nao-metal', familia: 'Não metal' },
        { num: 16, simb: 'S', nome: 'Enxofre', massa: '32.06', grupo: 16, periodo: 3, tipo: 'nao-metal', familia: 'Não metal' },
        { num: 17, simb: 'Cl', nome: 'Cloro', massa: '35.45', grupo: 17, periodo: 3, tipo: 'halogenio', familia: 'Halogênio' },
        { num: 18, simb: 'Ar', nome: 'Argônio', massa: '39.948', grupo: 18, periodo: 3, tipo: 'gas-nobre', familia: 'Gás nobre' },
        { num: 19, simb: 'K', nome: 'Potássio', massa: '39.098', grupo: 1, periodo: 4, tipo: 'metal-alcalino', familia: 'Metal alcalino' },
        { num: 20, simb: 'Ca', nome: 'Cálcio', massa: '40.078', grupo: 2, periodo: 4, tipo: 'metal-alcalino-terroso', familia: 'Metal alcalino-terroso' },
        { num: 21, simb: 'Sc', nome: 'Escândio', massa: '44.956', grupo: 3, periodo: 4, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 22, simb: 'Ti', nome: 'Titânio', massa: '47.867', grupo: 4, periodo: 4, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 23, simb: 'V', nome: 'Vanádio', massa: '50.942', grupo: 5, periodo: 4, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 24, simb: 'Cr', nome: 'Cromo', massa: '51.996', grupo: 6, periodo: 4, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 25, simb: 'Mn', nome: 'Manganês', massa: '54.938', grupo: 7, periodo: 4, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 26, simb: 'Fe', nome: 'Ferro', massa: '55.845', grupo: 8, periodo: 4, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 27, simb: 'Co', nome: 'Cobalto', massa: '58.933', grupo: 9, periodo: 4, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 28, simb: 'Ni', nome: 'Níquel', massa: '58.693', grupo: 10, periodo: 4, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 29, simb: 'Cu', nome: 'Cobre', massa: '63.546', grupo: 11, periodo: 4, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 30, simb: 'Zn', nome: 'Zinco', massa: '65.38', grupo: 12, periodo: 4, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 31, simb: 'Ga', nome: 'Gálio', massa: '69.723', grupo: 13, periodo: 4, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 32, simb: 'Ge', nome: 'Germânio', massa: '72.630', grupo: 14, periodo: 4, tipo: 'semi-metal', familia: 'Semimetal' },
        { num: 33, simb: 'As', nome: 'Arsênio', massa: '74.922', grupo: 15, periodo: 4, tipo: 'semi-metal', familia: 'Semimetal' },
        { num: 34, simb: 'Se', nome: 'Selênio', massa: '78.971', grupo: 16, periodo: 4, tipo: 'nao-metal', familia: 'Não metal' },
        { num: 35, simb: 'Br', nome: 'Bromo', massa: '79.904', grupo: 17, periodo: 4, tipo: 'halogenio', familia: 'Halogênio' },
        { num: 36, simb: 'Kr', nome: 'Criptônio', massa: '83.798', grupo: 18, periodo: 4, tipo: 'gas-nobre', familia: 'Gás nobre' },
        { num: 37, simb: 'Rb', nome: 'Rubídio', massa: '85.468', grupo: 1, periodo: 5, tipo: 'metal-alcalino', familia: 'Metal alcalino' },
        { num: 38, simb: 'Sr', nome: 'Estrôncio', massa: '87.62', grupo: 2, periodo: 5, tipo: 'metal-alcalino-terroso', familia: 'Metal alcalino-terroso' },
        { num: 39, simb: 'Y', nome: 'Ítrio', massa: '88.906', grupo: 3, periodo: 5, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 40, simb: 'Zr', nome: 'Zircônio', massa: '91.224', grupo: 4, periodo: 5, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 41, simb: 'Nb', nome: 'Nióbio', massa: '92.906', grupo: 5, periodo: 5, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 42, simb: 'Mo', nome: 'Molibdênio', massa: '95.95', grupo: 6, periodo: 5, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 43, simb: 'Tc', nome: 'Tecnécio', massa: '98', grupo: 7, periodo: 5, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 44, simb: 'Ru', nome: 'Rutênio', massa: '101.07', grupo: 8, periodo: 5, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 45, simb: 'Rh', nome: 'Ródio', massa: '102.91', grupo: 9, periodo: 5, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 46, simb: 'Pd', nome: 'Paládio', massa: '106.42', grupo: 10, periodo: 5, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 47, simb: 'Ag', nome: 'Prata', massa: '107.87', grupo: 11, periodo: 5, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 48, simb: 'Cd', nome: 'Cádmio', massa: '112.41', grupo: 12, periodo: 5, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 49, simb: 'In', nome: 'Índio', massa: '114.82', grupo: 13, periodo: 5, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 50, simb: 'Sn', nome: 'Estanho', massa: '118.71', grupo: 14, periodo: 5, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 51, simb: 'Sb', nome: 'Antimônio', massa: '121.76', grupo: 15, periodo: 5, tipo: 'semi-metal', familia: 'Semimetal' },
        { num: 52, simb: 'Te', nome: 'Telúrio', massa: '127.60', grupo: 16, periodo: 5, tipo: 'semi-metal', familia: 'Semimetal' },
        { num: 53, simb: 'I', nome: 'Iodo', massa: '126.90', grupo: 17, periodo: 5, tipo: 'halogenio', familia: 'Halogênio' },
        { num: 54, simb: 'Xe', nome: 'Xenônio', massa: '131.29', grupo: 18, periodo: 5, tipo: 'gas-nobre', familia: 'Gás nobre' },
        { num: 55, simb: 'Cs', nome: 'Césio', massa: '132.91', grupo: 1, periodo: 6, tipo: 'metal-alcalino', familia: 'Metal alcalino' },
        { num: 56, simb: 'Ba', nome: 'Bário', massa: '137.33', grupo: 2, periodo: 6, tipo: 'metal-alcalino-terroso', familia: 'Metal alcalino-terroso' },
        { num: 57, simb: 'La', nome: 'Lantânio', massa: '138.91', grupo: 3, periodo: 6, tipo: 'lantanideo', familia: 'Lantanídeo' },
        { num: 58, simb: 'Ce', nome: 'Cério', massa: '140.12', grupo: 101, periodo: 8, tipo: 'lantanideo', familia: 'Lantanídeo' },
        { num: 59, simb: 'Pr', nome: 'Praseodímio', massa: '140.91', grupo: 101, periodo: 8, tipo: 'lantanideo', familia: 'Lantanídeo' },
        { num: 60, simb: 'Nd', nome: 'Neodímio', massa: '144.24', grupo: 101, periodo: 8, tipo: 'lantanideo', familia: 'Lantanídeo' },
        { num: 61, simb: 'Pm', nome: 'Promécio', massa: '145', grupo: 101, periodo: 8, tipo: 'lantanideo', familia: 'Lantanídeo' },
        { num: 62, simb: 'Sm', nome: 'Samário', massa: '150.36', grupo: 101, periodo: 8, tipo: 'lantanideo', familia: 'Lantanídeo' },
        { num: 63, simb: 'Eu', nome: 'Európio', massa: '151.96', grupo: 101, periodo: 8, tipo: 'lantanideo', familia: 'Lantanídeo' },
        { num: 64, simb: 'Gd', nome: 'Gadolínio', massa: '157.25', grupo: 101, periodo: 8, tipo: 'lantanideo', familia: 'Lantanídeo' },
        { num: 65, simb: 'Tb', nome: 'Térbio', massa: '158.93', grupo: 101, periodo: 8, tipo: 'lantanideo', familia: 'Lantanídeo' },
        { num: 66, simb: 'Dy', nome: 'Disprósio', massa: '162.50', grupo: 101, periodo: 8, tipo: 'lantanideo', familia: 'Lantanídeo' },
        { num: 67, simb: 'Ho', nome: 'Hólmio', massa: '164.93', grupo: 101, periodo: 8, tipo: 'lantanideo', familia: 'Lantanídeo' },
        { num: 68, simb: 'Er', nome: 'Érbio', massa: '167.26', grupo: 101, periodo: 8, tipo: 'lantanideo', familia: 'Lantanídeo' },
        { num: 69, simb: 'Tm', nome: 'Túlio', massa: '168.93', grupo: 101, periodo: 8, tipo: 'lantanideo', familia: 'Lantanídeo' },
        { num: 70, simb: 'Yb', nome: 'Itérbio', massa: '173.05', grupo: 101, periodo: 8, tipo: 'lantanideo', familia: 'Lantanídeo' },
        { num: 71, simb: 'Lu', nome: 'Lutécio', massa: '174.97', grupo: 101, periodo: 8, tipo: 'lantanideo', familia: 'Lantanídeo' },
        { num: 72, simb: 'Hf', nome: 'Háfnio', massa: '178.49', grupo: 4, periodo: 6, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 73, simb: 'Ta', nome: 'Tântalo', massa: '180.95', grupo: 5, periodo: 6, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 74, simb: 'W', nome: 'Tungstênio', massa: '183.84', grupo: 6, periodo: 6, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 75, simb: 'Re', nome: 'Rênio', massa: '186.21', grupo: 7, periodo: 6, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 76, simb: 'Os', nome: 'Ósmio', massa: '190.23', grupo: 8, periodo: 6, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 77, simb: 'Ir', nome: 'Irídio', massa: '192.22', grupo: 9, periodo: 6, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 78, simb: 'Pt', nome: 'Platina', massa: '195.08', grupo: 10, periodo: 6, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 79, simb: 'Au', nome: 'Ouro', massa: '196.97', grupo: 11, periodo: 6, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 80, simb: 'Hg', nome: 'Mercúrio', massa: '200.59', grupo: 12, periodo: 6, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 81, simb: 'Tl', nome: 'Tálio', massa: '204.38', grupo: 13, periodo: 6, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 82, simb: 'Pb', nome: 'Chumbo', massa: '207.2', grupo: 14, periodo: 6, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 83, simb: 'Bi', nome: 'Bismuto', massa: '208.98', grupo: 15, periodo: 6, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 84, simb: 'Po', nome: 'Polônio', massa: '209', grupo: 16, periodo: 6, tipo: 'semi-metal', familia: 'Semimetal' },
        { num: 85, simb: 'At', nome: 'Astato', massa: '210', grupo: 17, periodo: 6, tipo: 'halogenio', familia: 'Halogênio' },
        { num: 86, simb: 'Rn', nome: 'Radônio', massa: '222', grupo: 18, periodo: 6, tipo: 'gas-nobre', familia: 'Gás nobre' },
        { num: 87, simb: 'Fr', nome: 'Frâncio', massa: '223', grupo: 1, periodo: 7, tipo: 'metal-alcalino', familia: 'Metal alcalino' },
        { num: 88, simb: 'Ra', nome: 'Rádio', massa: '226', grupo: 2, periodo: 7, tipo: 'metal-alcalino-terroso', familia: 'Metal alcalino-terroso' },
        { num: 89, simb: 'Ac', nome: 'Actínio', massa: '227', grupo: 3, periodo: 7, tipo: 'actinideo', familia: 'Actinídeo' },
        { num: 90, simb: 'Th', nome: 'Tório', massa: '232.04', grupo: 102, periodo: 9, tipo: 'actinideo', familia: 'Actinídeo' },
        { num: 91, simb: 'Pa', nome: 'Protactínio', massa: '231.04', grupo: 102, periodo: 9, tipo: 'actinideo', familia: 'Actinídeo' },
        { num: 92, simb: 'U', nome: 'Urânio', massa: '238.03', grupo: 102, periodo: 9, tipo: 'actinideo', familia: 'Actinídeo' },
        { num: 93, simb: 'Np', nome: 'Netúnio', massa: '237', grupo: 102, periodo: 9, tipo: 'actinideo', familia: 'Actinídeo' },
        { num: 94, simb: 'Pu', nome: 'Plutônio', massa: '244', grupo: 102, periodo: 9, tipo: 'actinideo', familia: 'Actinídeo' },
        { num: 95, simb: 'Am', nome: 'Amerício', massa: '243', grupo: 102, periodo: 9, tipo: 'actinideo', familia: 'Actinídeo' },
        { num: 96, simb: 'Cm', nome: 'Cúrio', massa: '247', grupo: 102, periodo: 9, tipo: 'actinideo', familia: 'Actinídeo' },
        { num: 97, simb: 'Bk', nome: 'Berquélio', massa: '247', grupo: 102, periodo: 9, tipo: 'actinideo', familia: 'Actinídeo' },
        { num: 98, simb: 'Cf', nome: 'Califórnio', massa: '251', grupo: 102, periodo: 9, tipo: 'actinideo', familia: 'Actinídeo' },
        { num: 99, simb: 'Es', nome: 'Einstênio', massa: '252', grupo: 102, periodo: 9, tipo: 'actinideo', familia: 'Actinídeo' },
        { num: 100, simb: 'Fm', nome: 'Férmio', massa: '257', grupo: 102, periodo: 9, tipo: 'actinideo', familia: 'Actinídeo' },
        { num: 101, simb: 'Md', nome: 'Mendelévio', massa: '258', grupo: 102, periodo: 9, tipo: 'actinideo', familia: 'Actinídeo' },
        { num: 102, simb: 'No', nome: 'Nobélio', massa: '259', grupo: 102, periodo: 9, tipo: 'actinideo', familia: 'Actinídeo' },
        { num: 103, simb: 'Lr', nome: 'Laurêncio', massa: '266', grupo: 102, periodo: 9, tipo: 'actinideo', familia: 'Actinídeo' },
        { num: 104, simb: 'Rf', nome: 'Rutherfórdio', massa: '267', grupo: 4, periodo: 7, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 105, simb: 'Db', nome: 'Dúbnio', massa: '268', grupo: 5, periodo: 7, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 106, simb: 'Sg', nome: 'Seabórgio', massa: '269', grupo: 6, periodo: 7, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 107, simb: 'Bh', nome: 'Bóhrio', massa: '270', grupo: 7, periodo: 7, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 108, simb: 'Hs', nome: 'Hássio', massa: '269', grupo: 8, periodo: 7, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 109, simb: 'Mt', nome: 'Meitnério', massa: '278', grupo: 9, periodo: 7, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 110, simb: 'Ds', nome: 'Darmstádio', massa: '281', grupo: 10, periodo: 7, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 111, simb: 'Rg', nome: 'Roentgênio', massa: '282', grupo: 11, periodo: 7, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 112, simb: 'Cn', nome: 'Copernício', massa: '285', grupo: 12, periodo: 7, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 113, simb: 'Nh', nome: 'Nihônio', massa: '286', grupo: 13, periodo: 7, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 114, simb: 'Fl', nome: 'Fleróvio', massa: '289', grupo: 14, periodo: 7, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 115, simb: 'Mc', nome: 'Moscóvio', massa: '290', grupo: 15, periodo: 7, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 116, simb: 'Lv', nome: 'Livermório', massa: '293', grupo: 16, periodo: 7, tipo: 'metal-transicao', familia: 'Metal de transição' },
        { num: 117, simb: 'Ts', nome: 'Tenesso', massa: '294', grupo: 17, periodo: 7, tipo: 'halogenio', familia: 'Halogênio' },
        { num: 118, simb: 'Og', nome: 'Oganessônio', massa: '(294)', grupo: 18, periodo: 7, tipo: 'gas-nobre', familia: 'Gás nobre' }
    ];
    

    function gerarTabelaPeriodicaHTML() {
    const maxGrupo = 18, maxPeriodo = 7;
    const grid = Array(maxPeriodo).fill().map(() => Array(maxGrupo).fill(null));
    const lantanideos = [], actinideos = [];

    elementosTP.forEach(el => {
        if (el.grupo === 101) lantanideos.push(el);
        else if (el.grupo === 102) actinideos.push(el);
        else {
            const c = el.grupo - 1, r = el.periodo - 1;
            if (r < maxPeriodo && c < maxGrupo) grid[r][c] = el;
        }
    });

    let html = '<div class="tabela-periodica__grid">';
    for (let r = 0; r < maxPeriodo; r++) {
        for (let c = 0; c < maxGrupo; c++) {
            const el = grid[r][c];
            html += el
                ? `<div class="tabela-periodica__elemento tp-${el.tipo}" data-num="${el.num}" data-simb="${el.simb}" data-nome="${el.nome}" data-massa="${el.massa}" data-familia="${el.familia}" data-grupo="${el.grupo}" data-periodo="${el.periodo}"><span class="tabela-periodica__numero">${el.num}</span><span class="tabela-periodica__simbolo">${el.simb}</span><div class="tabela-periodica__tooltip"><strong>${el.nome}</strong> (${el.simb})<br>Nº atômico: ${el.num}<br>Massa: ${el.massa}<br>Família: ${el.familia}</div></div>`
                : '<div class="tabela-periodica__elemento tabela-periodica__elemento--vazio"></div>';
        }
    }
    html += '</div>';

    // Linha dos lantanídeos
    html += '<div style="display:flex;align-items:center;gap:4px;margin-top:2px;min-width:1200px;">';
    html += '<span class="tabela-periodica__rotulo-linha">Lant.</span>';
    html += '<div class="tabela-periodica__linha-especial" style="flex:1;">';
    lantanideos.forEach(el => {
        html += `<div class="tabela-periodica__elemento tp-${el.tipo}" data-num="${el.num}" data-simb="${el.simb}" data-nome="${el.nome}" data-massa="${el.massa}" data-familia="${el.familia}"><span class="tabela-periodica__numero">${el.num}</span><span class="tabela-periodica__simbolo">${el.simb}</span><div class="tabela-periodica__tooltip"><strong>${el.nome}</strong><br>Nº atômico: ${el.num}<br>Massa: ${el.massa}</div></div>`;
    });
    html += '</div></div>';

    // Linha dos actinídeos
    html += '<div style="display:flex;align-items:center;gap:4px;margin-top:2px;min-width:1200px;">';
    html += '<span class="tabela-periodica__rotulo-linha">Act.</span>';
    html += '<div class="tabela-periodica__linha-especial" style="flex:1;">';
    actinideos.forEach(el => {
        html += `<div class="tabela-periodica__elemento tp-${el.tipo}" data-num="${el.num}" data-simb="${el.simb}" data-nome="${el.nome}" data-massa="${el.massa}" data-familia="${el.familia}"><span class="tabela-periodica__numero">${el.num}</span><span class="tabela-periodica__simbolo">${el.simb}</span><div class="tabela-periodica__tooltip"><strong>${el.nome}</strong><br>Nº atômico: ${el.num}<br>Massa: ${el.massa}</div></div>`;
    });
    html += '</div></div>';

    return html;
}
    
    

    // ========== INICIALIZAÇÃO ==========
    function init() {
        carregarTema();
        setupNavegacao();
        setupCalendario();
        setupTarefas();
        setupMetas();
        setupPomodoro();
        setupConfiguracoes();
        setupPerfil();
        setupEstudos();
        setupFlashcards();
        setupPerformance();
        setupDashboard();
        setupLogoNavigation();
        switchTab('dashboard');
        verificarNotificacoes();
        setInterval(verificarNotificacoes, 30000);
        setInterval(verificarPrazosTarefas, 60000);
    }

    function carregarTema() {
        if (loadData('tema') === 'dark') { document.documentElement.setAttribute('data-theme', 'dark'); $('#themeToggle').textContent = '☀️'; }
        $('#themeToggle').addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
            saveData('tema', isDark ? 'light' : 'dark');
            $('#themeToggle').textContent = isDark ? '🌙' : '☀️';
        });
    }

    // ========== LOGO NAVIGATION ==========
    function setupLogoNavigation() {
        $('#logoHome').addEventListener('click', (e) => { e.preventDefault(); switchTab('dashboard'); });
    }

    // ========== NAVEGAÇÃO ==========
    function setupNavegacao() {
        $('#sidebar').addEventListener('click', e => {
            const link = e.target.closest('.sidebar__link');
            if (!link) return;
            if (link.dataset.tab) { switchTab(link.dataset.tab); if (window.innerWidth <= 900) closeSidebar(); }
        });
        $('#menuToggle').addEventListener('click', toggleSidebar);
        $('#sidebarOverlay').addEventListener('click', closeSidebar);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSidebar(); });
    }

    function switchTab(tab) {
        currentTab = tab;
        $$('.tab-panel').forEach(p => p.classList.toggle('tab-panel--active', p.id === `panel-${tab}`));
        $$('.sidebar__link').forEach(l => l.classList.toggle('sidebar__link--active', l.dataset.tab === tab));
        if (tab === 'dashboard') atualizarDashboard();
        if (tab === 'calendario') renderCalendario();
        if (tab === 'tarefas') renderTarefas();
        if (tab === 'metas') renderMetas();
        if (tab === 'estudos') renderCategorias();
        if (tab === 'flashcards') renderFlashcards();
        if (tab === 'performance') renderPerformance();
        if (tab === 'perfil') abrirPerfilPainel();
    }

    function toggleSidebar() { $('#sidebar').classList.toggle('sidebar--open'); $('#sidebarOverlay').classList.toggle('sidebar-overlay--visible'); }
    function closeSidebar() { $('#sidebar').classList.remove('sidebar--open'); $('#sidebarOverlay').classList.remove('sidebar-overlay--visible'); }

    function atualizarSidebarPerfil() {
        const nome = loadData('nomePerfil') || 'Estudante';
        const foto = loadData('fotoPerfil');
        const avatar = loadData('avatar') || '👤';
        $('#sidebarNome').textContent = nome;
        $('#sidebarAvatar').textContent = foto ? '' : avatar;
        if (foto) { $('#sidebarAvatar').style.backgroundImage = `url(${foto})`; $('#sidebarAvatar').style.backgroundSize = 'cover'; }
        else { $('#sidebarAvatar').style.backgroundImage = ''; $('#sidebarAvatar').style.backgroundSize = ''; }
        $('#sidebarNivel').textContent = `Nível ${nivel}`;
        $('#sidebarStreak').textContent = `🔥 ${streak}`;
    }

    // ========== DASHBOARD ==========
    function setupDashboard() { $('#iniciarSessao').addEventListener('click', () => { switchTab('pomodoro'); iniciarPomodoro(); }); atualizarDashboard(); }
    function atualizarDashboard() {
        const tarefas = (loadData('tarefas') || []).filter(t => !t.concluida);
        const horas = loadData('horasEstudadas') || 0;
        const progressoModulos = loadData('progressoModulos') || {};
        const totalModulos = Object.keys(progressoModulos).length;
        const concluidos = Object.values(progressoModulos).filter(v => v >= 100).length;
        const aproveitamento = totalModulos > 0 ? Math.round((concluidos / totalModulos) * 100) : 0;
        $('#streakDias').textContent = streak; $('#streakHoras').textContent = horas.toFixed(1)+'h'; $('#streakPontos').textContent = pontos; $('#streakNivel').textContent = nivel;
        $('#dashboardNome').textContent = loadData('nomePerfil') || 'Estudante';
        const modulosConcluidos = Object.entries(progressoModulos).filter(([id,v]) => v < 100).slice(0,3);
        const cont = $('#continuarEstudos');
        if (!modulosConcluidos.length) cont.innerHTML = '<p class="text-muted">Nenhum módulo em andamento.</p>';
        else {
            cont.innerHTML = modulosConcluidos.map(([id,prog]) => {
                for (const cat of Object.values(categoriasEstudos)) {
                    for (const mat of cat.materias) {
                        if (mat.modulos) {
                            const enc = mat.modulos.find(m => m.id === id);
                            if (enc) return `<div class="card" style="cursor:pointer;" data-modulo-id="${id}" data-materia="${mat.id}"><div class="card__icon">📖</div><h3 class="card__title">${enc.titulo}</h3><p class="card__text">${enc.desc}</p><div style="background:var(--bg-input);height:5px;border-radius:3px;margin-top:8px;"><div style="width:${prog}%;height:100%;background:var(--accent);border-radius:3px;"></div></div><small>${prog}%</small></div>`;
                        }
                    }
                }
                return '';
            }).join('');
            $$('.card[data-modulo-id]').forEach(card => card.addEventListener('click', () => abrirModuloDireto(card.dataset.moduloId, card.dataset.materia)));
        }
        const eventos = (loadData('eventosCalendario')||[]).filter(ev=>ev.data===todayStr());
        $('#agendaHoje').innerHTML = eventos.length ? eventos.map(e=>`<div>${e.hora||''} ${e.titulo}</div>`).join('') : '<p class="text-muted">Nenhum evento para hoje.</p>';
        const metas = loadData('metas')||[];
        $('#metasResumo').innerHTML = metas.length ? metas.map(m=>`<div>🎯 ${m.titulo}: ${m.progresso}/${m.alvo}</div>`).join('') : '<p class="text-muted">Nenhuma meta ativa.</p>';
        const grafico = $('#graficoBarras');
        if(grafico) { const dados=[horas,tarefas.length,streak,aproveitamento]; const max=Math.max(...dados,1); grafico.innerHTML = dados.map(v=>`<div class="grafico-barra" style="height:${(v/max)*60}px;" title="${v}"></div>`).join(''); }
        $('#recomendacaoDia').textContent = ['Explore os módulos de Estudos.','Pratique exercícios.','Use o Pomodoro.','Crie metas realistas.'][Math.floor(Math.random()*4)];
        $('#headerStreak').textContent = `🔥 ${streak} dias`;
        atualizarSidebarPerfil();
    }
    function abrirModuloDireto(moduloId, materiaId) {
        const conteudo = conteudosModulos[moduloId];
        if (conteudo) { estudoNavegacao = { nivel:'modulos', categoria:'ensinoMedio', materia:materiaId }; switchTab('estudos'); abrirPaginaEstudo(moduloId, materiaId); return; }
        const modulos = getModulos(materiaId); const modulo = modulos.find(m=>m.id===moduloId); if (!modulo) return;
        abrirModalModulo(moduloId, materiaId, modulo);
    }

    // ========== FLASHCARDS ==========
    function setupFlashcards() {
        const modalDeckOverlay = $('#modalDeckOverlay');
        const criarDeckBtn = $('#criarDeck');
        const salvarDeckBtn = $('#salvarDeckBtn');
        const cancelarDeckBtn = $('#cancelarDeckBtn');
        const fecharDeckModal = $('#fecharDeckModal');
        const novoDeckInput = $('#novoDeckInput');
        criarDeckBtn.addEventListener('click', () => { modalDeckOverlay.classList.add('modal-overlay--visible'); novoDeckInput.value = ''; setTimeout(() => novoDeckInput.focus(), 100); });
        function fecharModalDeck() { modalDeckOverlay.classList.remove('modal-overlay--visible'); }
        cancelarDeckBtn.addEventListener('click', fecharModalDeck);
        fecharDeckModal.addEventListener('click', fecharModalDeck);
        modalDeckOverlay.addEventListener('click', (e) => { if(e.target === modalDeckOverlay) fecharModalDeck(); });
        salvarDeckBtn.addEventListener('click', () => { const nome = novoDeckInput.value.trim(); if (!nome) return; criarNovoDeck(nome); fecharModalDeck(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && modalDeckOverlay.classList.contains('modal-overlay--visible')) { salvarDeckBtn.click(); } });
    }
    function criarNovoDeck(nome) { const decks = loadData('flashcardDecks') || []; decks.push({ id: Date.now(), nome, icone: '🃏', cards: [], criadoEm: new Date().toISOString() }); saveData('flashcardDecks', decks); renderFlashcards(); mostrarToast('Deck criado!', 'sucesso'); }
    function renderFlashcards() { const decks = loadData('flashcardDecks') || []; const container = $('#flashcardsGrid'); if (!container) return; if (!decks.length) { container.innerHTML = '<p class="text-muted">Nenhum deck criado ainda.</p>'; return; } container.innerHTML = decks.map(d => `<div class="flashcard-deck"><div class="flashcard-deck__icone">${d.icone}</div><div class="flashcard-deck__titulo">${d.nome}</div><div class="flashcard-deck__cards">${d.cards.length} cartões</div><div class="flashcard-deck__progresso"><div class="flashcard-deck__progresso-bar" style="width:${d.cards.length>0?50:0}%;"></div></div></div>`).join(''); }

    // ========== PERFORMANCE ==========
    function setupPerformance(){}
    function renderPerformance(){
        const horas=loadData('horasEstudadas')||0; const progressoModulos=loadData('progressoModulos')||{}; const totalModulos=Object.keys(progressoModulos).length; const concluidos=Object.values(progressoModulos).filter(v=>v>=100).length;
        $('#perfAproveitamento').textContent=(totalModulos>0?Math.round((concluidos/totalModulos)*100):0)+'%';
        $('#perfModulos').textContent=concluidos; $('#perfHoras').textContent=horas.toFixed(1)+'h'; $('#perfStreak').textContent=(loadData('maiorStreak')||streak)+' dias';
        const progressosMat=loadData('progressosMaterias')||{}; const lista=$('#progressoMaterias');
        if(lista){ const mats=Object.entries(progressosMat).filter(([id])=>Object.values(categoriasEstudos).some(c=>c.materias.some(m=>m.id===id))); lista.innerHTML=mats.length?mats.map(([id,prog])=>{ const matNome = Object.values(categoriasEstudos).flatMap(c=>c.materias).find(m=>m.id===id)?.nome || id; return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><span>${matNome}</span><div style="flex:1;margin:0 12px;background:var(--bg-input);height:6px;border-radius:3px;"><div style="width:${prog}%;height:100%;background:var(--accent);border-radius:3px;"></div></div><span style="font-size:0.8rem;">${prog}%</span></div>`; }).join(''):'<p class="text-muted">Nenhuma matéria iniciada ainda.</p>'; }
    }

    // ========== ESTUDOS ==========
    let estudoNavegacao = { nivel: 'categorias', categoria: null, materia: null };
    function setupEstudos() {}

    function renderCategorias() {
        estudoNavegacao = { nivel: 'categorias', categoria: null, materia: null };
        const container = $('#estudoContainer');
        container.innerHTML = `<h2 style="margin-bottom:16px;">Escolha uma categoria</h2><div class="categorias-grid">${Object.entries(categoriasEstudos).map(([key, data]) => `<div class="categoria-card" data-categoria="${key}"><div class="categoria-card__titulo">${data.titulo}</div><div class="categoria-card__desc">${data.materias.length} matérias disponíveis</div></div>`).join('')}</div>`;
        $$('.categoria-card').forEach(card => card.addEventListener('click', () => abrirCategoria(card.dataset.categoria)));
    }

    function abrirCategoria(categoria) {
        const data = categoriasEstudos[categoria];
        if (!data) return;
        estudoNavegacao = { nivel: 'materias', categoria, materia: null };
        const container = $('#estudoContainer');
        const progressos = loadData('progressosMaterias') || {};
        container.innerHTML = `<button class="btn btn--secondary btn--sm" style="margin-bottom:16px;" id="voltarCategorias">← Voltar</button><h2 style="margin-bottom:16px;">${data.titulo}</h2><div class="materias-grid">${data.materias.map(mat => { const prog = progressos[mat.id] || 0; return `<div class="materia-card" data-materia="${mat.id}" data-categoria="${categoria}"><div class="materia-card__titulo">${mat.nome}</div><div class="materia-card__modulos">${mat.modulos ? mat.modulos.length : 0} módulos</div><div class="materia-card__progress">${prog}%</div><div style="background:var(--bg-input);height:5px;border-radius:3px;margin-top:6px;"><div style="width:${prog}%;height:100%;background:var(--accent);border-radius:3px;"></div></div></div>`; }).join('')}</div>`;
        $('#voltarCategorias').addEventListener('click', renderCategorias);
        $$('.materia-card').forEach(card => card.addEventListener('click', () => renderModulos(card.dataset.materia)));
    }

    function renderModulos(materiaId) {
        const mat = Object.values(categoriasEstudos).flatMap(c=>c.materias).find(m=>m.id===materiaId);
        const matNome = mat ? mat.nome : materiaId;
        estudoNavegacao = { nivel: 'modulos', categoria: estudoNavegacao.categoria, materia: materiaId };
        const container = $('#estudoContainer');
        const modulos = getModulos(materiaId);
        const progressos = loadData('progressoModulos') || {};
        container.innerHTML = `<button class="btn btn--secondary btn--sm" style="margin-bottom:16px;" id="voltarMaterias">← Voltar</button><h2 style="margin-bottom:16px;">${matNome}</h2><div class="modulos-grid">${modulos.map(m => { const prog = progressos[m.id] || 0; return `<div class="modulo-card"><div class="modulo-card__header"><span class="modulo-card__titulo">${m.titulo}</span><span class="modulo-card__badge badge-${m.dificuldade}">${m.dificuldade}</span></div><p class="modulo-card__desc">${m.desc || ''}</p><div class="modulo-card__info"><span>⏱ ${m.tempo || '20min'}</span><span>📝 ${m.exercicios || 10} exercícios</span></div><div class="modulo-card__progresso"><div class="modulo-card__progresso-bar" style="width:${prog}%;"></div></div><div class="modulo-card__acoes"><button class="btn btn--primary btn--sm btn-estudar-modulo" data-modulo="${m.id}" data-materia="${materiaId}">Estudar</button>${prog >= 100 ? '<span style="color:#10b981;">✅</span>' : ''}</div></div>`; }).join('')}</div>`;
        $('#voltarMaterias').addEventListener('click', () => abrirCategoria(estudoNavegacao.categoria));
        $$('.btn-estudar-modulo').forEach(btn => btn.addEventListener('click', () => abrirModulo(btn.dataset.modulo, btn.dataset.materia)));
    }

    function abrirModulo(moduloId, materiaId) {
        const modulos = getModulos(materiaId); const modulo = modulos.find(m => m.id === moduloId); if (!modulo) return;
        const conteudo = conteudosModulos[moduloId];
        if (conteudo) { abrirPaginaEstudo(moduloId, materiaId); return; }
        abrirModalModulo(moduloId, materiaId, modulo);
    }

    function abrirModalModulo(moduloId, materiaId, modulo) {
        const matNome = Object.values(categoriasEstudos).flatMap(c=>c.materias).find(m=>m.id===materiaId)?.nome || materiaId;
        $('#modalModuloTitulo').textContent = `${matNome} - ${modulo.titulo}`;
        $('#modalModuloConteudo').innerHTML = `<div class="modulo-conteudo"><span class="modulo-card__badge badge-${modulo.dificuldade}">${modulo.dificuldade}</span><span style="margin-left:8px;">⏱ ${modulo.tempo || '20min'}</span><h4>Resumo Teórico</h4><p>Conteúdo detalhado sobre <strong>${modulo.titulo}</strong> será exibido aqui.</p><h4>Exemplos</h4><p>Exemplos práticos e aplicações do conteúdo.</p><h4>Exercícios</h4><p>${modulo.exercicios || 10} exercícios para praticar.</p><ul><li>Exercício 1</li><li>Exercício 2</li><li>Exercício 3</li></ul><button class="btn btn--primary" id="concluirModulo">Marcar como Concluído</button></div>`;
        $('#modalModuloOverlay').classList.add('modal-overlay--visible');
        $('#concluirModulo').addEventListener('click', () => {
            const progressos = loadData('progressoModulos') || {}; progressos[moduloId] = 100; saveData('progressoModulos', progressos);
            const progressosMat = loadData('progressosMaterias') || {}; const modulos = getModulos(materiaId);
            const concluidos = modulos.filter(m => (progressos[m.id] || 0) >= 100).length + 1;
            progressosMat[materiaId] = Math.round((concluidos / modulos.length) * 100); saveData('progressosMaterias', progressosMat);
            mostrarToast('Módulo concluído!', 'sucesso'); atualizarStreak(); atualizarDashboard();
            $('#modalModuloOverlay').classList.remove('modal-overlay--visible');
            if (estudoNavegacao.nivel === 'modulos') renderModulos(materiaId);
        });
    }

    // ========== PÁGINA DE ESTUDO COMPLETA ==========
    function abrirPaginaEstudo(moduloId, materiaId) {
        const conteudo = conteudosModulos[moduloId];
        if (!conteudo) { abrirModalModulo(moduloId, materiaId, (getModulos(materiaId)||[]).find(m=>m.id===moduloId) || {titulo:moduloId,dificuldade:'basico'}); return; }
        const modulos = getModulos(materiaId); const modulo = modulos.find(m => m.id === moduloId) || {titulo:conteudo.titulo, dificuldade:'basico', desc:'', tempo:'20min'};
        const matNome = Object.values(categoriasEstudos).flatMap(c=>c.materias).find(m=>m.id===materiaId)?.nome || materiaId;
        const progressos = loadData('progressoModulos') || {}; const prog = progressos[moduloId] || 0;
        const estadoAnterior = { ...estudoNavegacao }; const container = $('#estudoContainer');
        let cardsHTML = ''; let navHTML = '';
        if (conteudo.topicos) {
            cardsHTML = conteudo.topicos.map((topico, i) => `
                <div class="study-card" id="secao-${i}">
                    <div class="study-card__numero">${topico.numero}</div>
                    <h2 class="study-card__titulo">${topico.titulo}</h2>
                    <div class="study-card__texto">${topico.conteudo}</div>
                    ${topico.exemplos && topico.exemplos.length > 0 ? topico.exemplos.map(ex => `<div class="study-exemplo"><div class="study-exemplo__titulo">📌 Exemplo</div><p>${ex.texto}</p><p><em>${ex.interpretacao}</em></p></div>`).join('') : ''}
                    ${topico.dicas && topico.dicas.length > 0 ? topico.dicas.map(d => `<div class="study-dica"><span class="study-dica__icone">📌</span><span class="study-dica__texto">${d.texto}</span></div>`).join('') : ''}
                    ${topico.erros && topico.erros.length > 0 ? topico.erros.map(e => `<div class="study-erro"><span class="study-erro__icone">⚠️</span><span class="study-erro__texto">${e.texto}</span></div>`).join('') : ''}
                    ${topico.exercicios && topico.exercicios.length > 0 ? `<h4 style="margin-top:20px;">📝 Exercícios</h4>${topico.exercicios.map((ex, j) => `<div class="study-exercicio"><p class="study-exercicio__pergunta"><strong>${j+1}.</strong> ${ex.pergunta}</p><div class="study-exercicio__opcoes">${ex.opcoes.map((op, k) => `<label class="study-exercicio__opcao"><input type="radio" name="q${i}_${j}" value="${k}"> ${String.fromCharCode(97 + k)}) ${op}</label>`).join('')}</div><button class="btn btn--primary btn--sm study-verificar" data-resposta="${ex.resposta}" data-pergunta="q${i}_${j}">Verificar</button><div class="study-exercicio__feedback" id="feedback-q${i}_${j}"></div></div>`).join('')}` : ''}
                    ${topico.atividades && topico.atividades.length > 0 ? topico.atividades.map((atv, idx) => {
    const chaveAtividade = `${moduloId}_atividade_${topico.numero}_${idx}`;
    return `
    <div class="study-atividade" id="atv-${chaveAtividade}">
        <div class="study-atividade__titulo">✏️ Atividade: ${atv.titulo}</div>
        <p>${atv.descricao}</p>
        <textarea class="prompt-form__textarea" id="resp-${chaveAtividade}" rows="3" placeholder="Escreva sua resposta aqui...">${loadData(chaveAtividade) || ''}</textarea>
        <button class="btn btn--primary btn--sm salvar-atividade" data-chave="${chaveAtividade}">💾 Salvar resposta</button>
        <span class="text-muted" style="font-size:0.8rem;margin-left:8px;" id="status-${chaveAtividade}"></span>
    </div>
    `;
}).join('') : ''}
                </div>
            `).join('');

            navHTML = conteudo.topicos.map((topico, i) => `<a href="#secao-${i}" class="study-sidebar__link ${i===0?'study-sidebar__link--ativo':''}" data-secao="${i}">${topico.numero}. ${topico.titulo}</a>`).join('');
        } else if (conteudo.cards) {
            cardsHTML = conteudo.cards.map((card, i) => `<div class="study-card" id="secao-${i}"><div class="study-card__numero">${String(i+1).padStart(2,'0')}</div><h2 class="study-card__titulo">${card.titulo}</h2><div class="study-card__texto">${card.texto}</div>${card.destaque ? `<div class="study-card__destaque">${card.destaque}</div>` : ''}</div>`).join('');
            navHTML = conteudo.cards.map((card, i) => `<a href="#secao-${i}" class="study-sidebar__link ${i===0?'study-sidebar__link--ativo':''}" data-secao="${i}">${String(i+1).padStart(2,'0')}. ${card.titulo}</a>`).join('');
        }
        container.innerHTML = `<div class="study-hero"><div class="study-hero__content"><div class="study-hero__breadcrumb"><button class="btn btn--text btn--sm" id="studyVoltar">← Voltar para módulos</button><span class="bread-sep">›</span><span>${matNome}</span></div><h1 class="study-hero__title">${conteudo.titulo}</h1><p class="study-hero__subtitle">${conteudo.descricao || modulo.desc || 'Conteúdo completo do módulo'}</p><div class="study-hero__meta">${!conteudo.semNiveis ? `<span class="study-hero__badge badge-${modulo.dificuldade || 'basico'}">${modulo.dificuldade || 'Básico'}</span>` : ''}<span>⏱ ${modulo.tempo || '30min'}</span><span>📚 ${conteudo.topicos ? conteudo.topicos.length : (conteudo.cards ? conteudo.cards.length : '3')} tópicos</span></div></div><div class="study-hero__progress"><div class="study-progresso-circular"><svg viewBox="0 0 100 100"><circle class="study-progresso-circular__fundo" cx="50" cy="50" r="42"/><circle class="study-progresso-circular__barra" cx="50" cy="50" r="42" stroke-dasharray="${prog * 2.64} 264"/></svg><span class="study-progresso-circular__texto">${prog}%</span></div><button class="btn btn--primary" id="studyContinuar">Continuar</button></div></div><div class="study-layout"><div class="study-content">${cardsHTML}${moduloId === 'tabela-periodica' ? `<div class="study-card" id="secao-tabela"><div class="study-card__numero">04</div><h2 class="study-card__titulo">Tabela Periódica Interativa</h2><p class="study-card__desc">Passe o mouse sobre os elementos para ver detalhes.</p><div class="tabela-periodica">${gerarTabelaPeriodicaHTML()}</div></div>` : ''}</div><aside class="study-sidebar"><div class="study-sidebar__card"><h4 class="study-sidebar__titulo">Navegação</h4><nav class="study-sidebar__nav">${navHTML}${moduloId === 'tabela-periodica' ? '<a href="#secao-tabela" class="study-sidebar__link" data-secao="tabela">04. Tabela Periódica</a>' : ''}</nav></div><div class="study-sidebar__card"><h4 class="study-sidebar__titulo">Desempenho</h4><div class="study-sidebar__stats"><div class="study-sidebar__stat"><span class="study-sidebar__stat-valor">🔥 ${streak}</span><span class="study-sidebar__stat-label">Dias seguidos</span></div><div class="study-sidebar__stat"><span class="study-sidebar__stat-valor">${Object.values(loadData('progressoModulos')||{}).filter(v=>v>=100).length}</span><span class="study-sidebar__stat-label">Módulos concluídos</span></div></div></div></aside></div>`;
        $('#studyVoltar').addEventListener('click', () => { estudoNavegacao = estadoAnterior; renderModulos(materiaId); });
        $('#studyContinuar').addEventListener('click', () => document.getElementById('secao-0')?.scrollIntoView({ behavior: 'smooth' }));
        $$('.study-sidebar__link').forEach(link => link.addEventListener('click', function(e){ e.preventDefault(); const t=document.querySelector(this.getAttribute('href')); if(t) t.scrollIntoView({behavior:'smooth',block:'start'}); }));
        const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if(entry.isIntersecting){ $$('.study-sidebar__link').forEach(l=>l.classList.remove('study-sidebar__link--ativo')); const link=document.querySelector(`.study-sidebar__link[data-secao="${entry.target.id.replace('secao-','')}"]`); if(link) link.classList.add('study-sidebar__link--ativo'); } }); }, {threshold:0.5});
        document.querySelectorAll('.study-card[id]').forEach(card => observer.observe(card));
        $$('.study-verificar').forEach(btn => { btn.addEventListener('click', function() { const respostaCorreta = this.dataset.resposta; const pergunta = this.dataset.pergunta; const selecionado = document.querySelector(`input[name="${pergunta}"]:checked`); const feedback = document.getElementById(`feedback-${pergunta}`); if (!selecionado) { feedback.className = 'study-exercicio__feedback study-exercicio__feedback--incorreto'; feedback.innerHTML = '⚠️ Selecione uma opção.'; return; } if (parseInt(selecionado.value) === parseInt(respostaCorreta)) { feedback.className = 'study-exercicio__feedback study-exercicio__feedback--correto'; feedback.innerHTML = '✅ Correto! Muito bem!'; this.disabled = true; this.style.opacity = '0.6'; pontos += 5; verificarNivel(); } else { const opcaoCorreta = document.querySelector(`input[name="${pergunta}"][value="${respostaCorreta}"]`); const textoCorreto = opcaoCorreta ? opcaoCorreta.parentElement.textContent.trim() : ''; feedback.className = 'study-exercicio__feedback study-exercicio__feedback--incorreto'; feedback.innerHTML = `❌ Incorreto. Resposta certa: ${textoCorreto}`; } }); });
        $$('.tabela-periodica__elemento[data-num]').forEach(el => { el.addEventListener('click', function(e) { e.stopPropagation(); const num = this.dataset.num, simb = this.dataset.simb, nome = this.dataset.nome, massa = this.dataset.massa, familia = this.dataset.familia, grupo = this.dataset.grupo, periodo = this.dataset.periodo; $('#modalElementoTitulo').textContent = `${nome} (${simb})`; $('#modalElementoConteudo').innerHTML = `<p><strong>Número atômico:</strong> ${num}</p><p><strong>Massa atômica:</strong> ${massa}</p><p><strong>Família:</strong> ${familia}</p><p><strong>Grupo:</strong> ${grupo} | <strong>Período:</strong> ${periodo}</p>`; $('#modalElementoOverlay').classList.add('modal-overlay--visible'); }); });
        $('#modalElementoFechar').addEventListener('click', () => $('#modalElementoOverlay').classList.remove('modal-overlay--visible'));
                $('#modalElementoFechar').addEventListener('click', () => $('#modalElementoOverlay').classList.remove('modal-overlay--visible'));
        $('#modalElementoOverlay').addEventListener('click', e => { if (e.target === $('#modalElementoOverlay')) $('#modalElementoOverlay').classList.remove('modal-overlay--visible'); });

        // Salvar respostas das atividades
        $$('.salvar-atividade').forEach(btn => {
            btn.addEventListener('click', function() {
                const chave = this.dataset.chave;
                const textarea = document.getElementById(`resp-${chave}`);
                const resposta = textarea.value.trim();
                if (!resposta) {
                    mostrarToast('Escreva algo antes de salvar.', 'aviso');
                    return;
                }
                saveData(chave, resposta);
                const statusEl = document.getElementById(`status-${chave}`);
                if (statusEl) {
                    statusEl.textContent = '✅ Salvo!';
                    setTimeout(() => statusEl.textContent = '', 2000);
                }
                mostrarToast('Resposta salva!', 'sucesso');
            });
        });
    }  // fecha a função abrirPaginaEstudo

    // ========== CALENDÁRIO ==========
    function setupCalendario() { $('#calPrev').addEventListener('click',()=>{calMonth--;if(calMonth<0){calYear--;calMonth=11;}renderCalendario();}); $('#calNext').addEventListener('click',()=>{calMonth++;if(calMonth>11){calYear++;calMonth=0;}renderCalendario();}); $('#calHoje').addEventListener('click',()=>{const t=new Date(new Date().toLocaleString("en-US",{timeZone:"America/Sao_Paulo"}));calYear=t.getFullYear();calMonth=t.getMonth();renderCalendario();}); renderCalendario(); }
    function renderCalendario() { const grid=$('#calendarioGrid'); if(!grid)return; $('#calTitulo').textContent=new Date(calYear,calMonth).toLocaleDateString('pt-BR',{month:'long',year:'numeric'}); const primeiro=new Date(calYear,calMonth,1).getDay(), ultimo=new Date(calYear,calMonth+1,0).getDate(); grid.innerHTML=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d=>`<div class="calendario-dia-semana">${d}</div>`).join(''); for(let i=0;i<primeiro;i++) grid.innerHTML+='<div></div>'; const hojeStr=todayStr(), eventos=loadData('eventosCalendario')||[]; for(let d=1;d<=ultimo;d++){ const ds=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; let cls='calendario-dia'; if(ds===hojeStr) cls+=' calendario-dia--hoje'; if(feriados[ds]) cls+=' calendario-dia--feriado'; if(eventos.some(ev=>ev.data===ds)) cls+=' calendario-dia--tarefa'; grid.innerHTML+=`<div class="${cls}" data-data="${ds}">${d}</div>`; } $$('.calendario-dia[data-data]').forEach(el=>el.addEventListener('click',e=>abrirModalDia(e.currentTarget.dataset.data))); }
    function abrirModalDia(dataStr){ $('#modalDiaTitulo').textContent=formatDate(dataStr); $('#modalDia').dataset.data=dataStr; $('#modalDiaOverlay').classList.add('modal-overlay--visible'); renderEventosDia(dataStr); }
    $('#modalDiaFechar').addEventListener('click',()=>$('#modalDiaOverlay').classList.remove('modal-overlay--visible'));
    $('#modalDiaOverlay').addEventListener('click',e=>{if(e.target===$('#modalDiaOverlay'))$('#modalDiaOverlay').classList.remove('modal-overlay--visible');});
    function renderEventosDia(dataStr){ const eventos=(loadData('eventosCalendario')||[]).filter(ev=>ev.data===dataStr); const lista=$('#modalEventosLista'); if(!lista)return; lista.innerHTML='<h4>📌 Eventos neste dia</h4>'; if(!eventos.length){lista.innerHTML+='<p class="text-muted">Nenhum.</p>';return;} eventos.forEach((ev,idx)=>{ const div=document.createElement('div'); div.className='card'; div.style.cssText='margin:4px 0;display:flex;justify-content:space-between;align-items:center;padding:12px;'; div.innerHTML=`<div><strong>${ev.titulo}</strong> (${ev.tipo}) ${ev.hora||''}</div><div><button class="btn btn--secondary btn--sm editar-evento" data-idx="${idx}">✏️</button><button class="btn btn--danger btn--sm excluir-evento" data-idx="${idx}">🗑️</button></div>`; lista.appendChild(div); }); lista.querySelectorAll('.excluir-evento').forEach(btn=>btn.addEventListener('click',(e)=>{ const idx=parseInt(e.target.dataset.idx); if(confirm('Excluir este evento?')){ const eventos=loadData('eventosCalendario')||[]; const dataStr=$('#modalDia').dataset.data; const evtsDoDia=eventos.filter(ev=>ev.data===dataStr); const ev=evtsDoDia[idx]; const globalIdx=eventos.findIndex(e=>e===ev); if(globalIdx>=0){eventos.splice(globalIdx,1);saveData('eventosCalendario',eventos);} renderEventosDia(dataStr); renderCalendario(); mostrarToast('Evento removido','erro'); } })); lista.querySelectorAll('.editar-evento').forEach(btn=>btn.addEventListener('click',(e)=>{ const idx=parseInt(e.target.dataset.idx); const eventos=loadData('eventosCalendario')||[]; const dataStr=$('#modalDia').dataset.data; const evtsDoDia=eventos.filter(ev=>ev.data===dataStr); const ev=evtsDoDia[idx]; const novoTitulo=prompt('Editar título:',ev.titulo); if(novoTitulo){ev.titulo=novoTitulo;saveData('eventosCalendario',eventos);renderEventosDia(dataStr);renderCalendario();mostrarToast('Evento atualizado!','sucesso');} })); }
    $('#modalSalvarEvento').addEventListener('click',()=>{ const data=$('#modalDia').dataset.data; const titulo=$('#modalEventoTitulo').value.trim(); if(!titulo)return mostrarToast('Preencha o título!','erro'); const eventos=loadData('eventosCalendario')||[]; eventos.push({data,titulo,tipo:$('#modalEventoTipo').value,hora:$('#modalEventoHora').value}); saveData('eventosCalendario',eventos); renderEventosDia(data); renderCalendario(); mostrarToast('Evento salvo!','sucesso'); $('#modalEventoTitulo').value=''; });

    // ========== NOTIFICAÇÕES ==========
    function verificarNotificacoes(){ const agora=new Date(new Date().toLocaleString("en-US",{timeZone:"America/Sao_Paulo"})); const horaAtual=`${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')}`; const hojeStr=todayStr(); const eventos=loadData('eventosCalendario')||[]; const disparadas=loadData('notificacoesDisparadas')||[]; eventos.forEach(ev=>{ if(ev.data===hojeStr&&ev.hora===horaAtual&&!disparadas.includes(ev.titulo+ev.hora+ev.data)){ mostrarToast(`⏰ ${ev.titulo} agora!`,'lembrete'); tocarSom(); disparadas.push(ev.titulo+ev.hora+ev.data); saveData('notificacoesDisparadas',disparadas); } }); }
    function verificarPrazosTarefas(){ const agora=new Date(new Date().toLocaleString("en-US",{timeZone:"America/Sao_Paulo"})); const tarefas=(loadData('tarefas')||[]).filter(t=>!t.concluida&&t.prazo&&t.hora); const alertadas=loadData('tarefasAlertadas')||[]; tarefas.forEach(t=>{ const dataHora=new Date(`${t.prazo}T${t.hora}`); const diff=dataHora-agora; const key=t.id+t.prazo+t.hora; if(diff>0&&diff<=3600000&&!alertadas.includes(key)){ const minutos=Math.ceil(diff/60000); mostrarToast(`⏰ "${t.titulo}" em ${minutos} min!`,'aviso'); tocarSom(); alertadas.push(key); saveData('tarefasAlertadas',alertadas); } if(diff<=0&&!alertadas.includes(key+'_vencida')){ mostrarToast(`⚠️ "${t.titulo}" venceu!`,'erro'); alertadas.push(key+'_vencida'); saveData('tarefasAlertadas',alertadas); } }); }

    // ========== TAREFAS ==========
    function setupTarefas() { $('#btnAddTarefa').addEventListener('click', adicionarTarefa); renderTarefas(); }
    function adicionarTarefa(){ const titulo=$('#tarefaTitulo').value.trim(); if(!titulo)return mostrarToast('Título obrigatório','erro'); const tarefas=loadData('tarefas')||[]; tarefas.push({id:Date.now(),titulo,descricao:$('#tarefaDescricao').value,prazo:$('#tarefaPrazo').value,prioridade:$('#tarefaPrioridade').value,hora:$('#tarefaHora').value,concluida:false}); saveData('tarefas',tarefas); renderTarefas(); atualizarDashboard(); mostrarToast('Tarefa adicionada!','sucesso'); $('#tarefaTitulo').value='';$('#tarefaDescricao').value='';$('#tarefaPrazo').value='';$('#tarefaHora').value=''; }
    function renderTarefas(){ const tarefas=(loadData('tarefas')||[]).filter(t=>!t.concluida); const lista=$('#tarefasLista'); if(!lista)return; if(!tarefas.length){lista.innerHTML='<p class="text-muted">Nenhuma tarefa.</p>';return;} lista.innerHTML=tarefas.map(t=>`<div class="card" style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;padding:12px;"><div><strong>${t.titulo}</strong> <span class="badge-${t.prioridade}">${t.prioridade}</span><br><small>${t.prazo?formatDate(t.prazo):''} ${t.hora||''}</small></div><div><button class="btn btn--primary btn--sm" data-concluir="${t.id}">✅</button><button class="btn btn--danger btn--sm" data-remover="${t.id}">🗑️</button></div></div>`).join(''); lista.querySelectorAll('[data-concluir]').forEach(b=>b.addEventListener('click',()=>concluirTarefa(parseInt(b.dataset.concluir)))); lista.querySelectorAll('[data-remover]').forEach(b=>b.addEventListener('click',()=>removerTarefa(parseInt(b.dataset.remover)))); }
    function concluirTarefa(id){ const tarefas=loadData('tarefas')||[]; const idx=tarefas.findIndex(t=>t.id===id); if(idx>=0){tarefas[idx].concluida=true;saveData('tarefas',tarefas);pontos+=10;verificarNivel();atualizarStreak();renderTarefas();atualizarDashboard();mostrarToast('Tarefa concluída! +10 pontos','sucesso');} }
    function removerTarefa(id){ saveData('tarefas',(loadData('tarefas')||[]).filter(t=>t.id!==id)); renderTarefas(); atualizarDashboard(); }

    // ========== METAS ==========
    function setupMetas() { $('#btnAddMeta').addEventListener('click', adicionarMeta); renderMetas(); }
    function adicionarMeta(){ const titulo=$('#metaTitulo').value.trim(); if(!titulo)return; const metas=loadData('metas')||[]; metas.push({id:Date.now(),titulo,alvo:parseInt($('#metaAlvo').value)||100,unidade:$('#metaUnidade').value,progresso:0}); saveData('metas',metas); renderMetas(); atualizarDashboard(); mostrarToast('Meta criada!','sucesso'); $('#metaTitulo').value=''; }
    function renderMetas(){ const metas=loadData('metas')||[]; const lista=$('#metasLista'); if(!lista)return; if(!metas.length){lista.innerHTML='<p class="text-muted">Nenhuma meta.</p>';return;} lista.innerHTML=metas.map(m=>{const pct=Math.min(100,Math.round((m.progresso/m.alvo)*100));return`<div class="card" style="margin-bottom:8px;padding:14px;"><strong>${m.titulo}</strong> (${m.progresso}/${m.alvo} ${m.unidade})<div style="background:var(--bg-input);height:6px;border-radius:3px;margin:6px 0;"><div style="width:${pct}%;height:100%;background:var(--accent);border-radius:3px;"></div></div><button class="btn btn--primary btn--sm" data-avancar="${m.id}">+1</button></div>`;}).join(''); lista.querySelectorAll('[data-avancar]').forEach(b=>b.addEventListener('click',()=>{const metas=loadData('metas')||[];const idx=metas.findIndex(m=>m.id===parseInt(b.dataset.avancar));if(idx>=0&&metas[idx].progresso<metas[idx].alvo){metas[idx].progresso++;saveData('metas',metas);renderMetas();atualizarDashboard();}})); }

    // ========== POMODORO ==========
    function setupPomodoro(){ $('#pomodoroIniciar').addEventListener('click',iniciarPomodoro); $('#pomodoroPausar').addEventListener('click',pausarPomodoro); $('#pomodoroResetar').addEventListener('click',resetarPomodoro); }
    function atualizarDisplayPomodoro(){ const m=Math.floor(pomodoroTime/60),s=pomodoroTime%60; $('#pomodoroDisplay').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
    function iniciarPomodoro(){ if(pomodoroRunning)return; pomodoroRunning=true;$('#pomodoroIniciar').disabled=true;$('#pomodoroPausar').disabled=false;pomodoroInterval=setInterval(()=>{if(pomodoroTime>0){pomodoroTime--;atualizarDisplayPomodoro();}else{clearInterval(pomodoroInterval);pomodoroRunning=false;$('#pomodoroIniciar').disabled=false;$('#pomodoroPausar').disabled=true;tocarSom();mostrarToast('Pomodoro concluído!','sucesso');saveData('horasEstudadas',(loadData('horasEstudadas')||0)+25/60);atualizarDashboard();}},1000); }
    function pausarPomodoro(){ clearInterval(pomodoroInterval); pomodoroRunning=false; $('#pomodoroIniciar').disabled=false; $('#pomodoroPausar').disabled=true; }
    function resetarPomodoro(){ pausarPomodoro(); pomodoroTime=25*60; atualizarDisplayPomodoro(); }

    // ========== CONFIGURAÇÕES ==========
    function setupConfiguracoes(){ $('#configTema').addEventListener('click',()=>$('#themeToggle').click()); $('#exportarDados').addEventListener('click',()=>{const dados={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('learnflow_'))dados[k]=localStorage.getItem(k);}const blob=new Blob([JSON.stringify(dados,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='learnflow_backup.json';a.click();URL.revokeObjectURL(url);}); $('#limparDados').addEventListener('click',()=>{if(confirm('Limpar todos os dados?')){Object.keys(localStorage).filter(k=>k.startsWith('learnflow_')).forEach(k=>localStorage.removeItem(k));location.reload();}}); }

    // ========== PERFIL ==========
    function setupPerfil() {
        $('#sidebarPerfil').addEventListener('click', () => { switchTab('perfil'); });
        $('#perfilEditarNome').addEventListener('click', () => { const nome = prompt('Seu nome:', loadData('nomePerfil') || 'Estudante'); if (nome) { saveData('nomePerfil', nome); abrirPerfilPainel(); atualizarDashboard(); } });
        $('#trocarFotoBtn').addEventListener('click', () => $('#perfilFotoInput').click());
        $('#perfilFotoInput').addEventListener('change', e => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = function(event) { const dataUrl = event.target.result; $('#perfilAvatarPainel').style.backgroundImage = `url(${dataUrl})`; $('#perfilAvatarPainel').style.backgroundSize = 'cover'; $('#perfilAvatarPainel').textContent = ''; saveData('fotoPerfil', dataUrl); atualizarSidebarPerfil(); }; reader.readAsDataURL(file); });
    }
    function abrirPerfilPainel() {
        $('#perfilNomePainel').textContent = loadData('nomePerfil') || 'Estudante';
        $('#perfilStreakPainel').textContent = `${streak} dias`;
        $('#perfilHorasPainel').textContent = `${(loadData('horasEstudadas')||0).toFixed(1)}h`;
        $('#perfilMetasPainel').textContent = (loadData('metas')||[]).length;
        $('#perfilNivelPainel').textContent = nivel;
        const foto = loadData('fotoPerfil');
        if (foto) { $('#perfilAvatarPainel').style.backgroundImage = `url(${foto})`; $('#perfilAvatarPainel').style.backgroundSize = 'cover'; $('#perfilAvatarPainel').textContent = ''; }
        else { $('#perfilAvatarPainel').style.backgroundImage = ''; $('#perfilAvatarPainel').style.backgroundSize = ''; $('#perfilAvatarPainel').textContent = loadData('avatar') || '👤'; }
    }

    // ========== ATUALIZAÇÕES GLOBAIS ==========
    function atualizarStreak(){ const hojeStr=todayStr(); const ultimo=loadData('ultimoEstudo'); if(ultimo===hojeStr)return; const ontem=new Date(new Date().toLocaleString("en-US",{timeZone:"America/Sao_Paulo"})); ontem.setDate(ontem.getDate()-1); streak=(ultimo===ontem.toISOString().split('T')[0])?streak+1:1; saveData('ultimoEstudo',hojeStr); saveData('streak',streak); const maiorStreak=loadData('maiorStreak')||0; if(streak>maiorStreak)saveData('maiorStreak',streak); atualizarDashboard(); }
    function verificarNivel(){ const novoNivel=Math.floor(pontos/50)+1; if(novoNivel>nivel){nivel=novoNivel;mostrarToast(`🎉 Subiu para o nível ${nivel}!`,'sucesso');} saveData('pontos',pontos); saveData('nivel',nivel); }
    function mostrarToast(msg, tipo='sucesso'){ const toast=document.createElement('div'); toast.className=`toast toast--${tipo}`; toast.textContent=msg; const container=$('#toastContainer'); if(container){container.appendChild(toast);setTimeout(()=>toast.remove(),3500);} }
    function tocarSom(){ try{ const ctx=new(window.AudioContext||window.webkitAudioContext)(); const osc=ctx.createOscillator(); osc.type='sine'; osc.frequency.setValueAtTime(800,ctx.currentTime); osc.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+0.25); }catch(e){} }

    init();
})();

