'use strict';

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

// Adicione isto no fim do seu arquivo study-data.js
window.categoriasEstudos = categoriasEstudos;
window.conteudosModulos = conteudosModulos;
window.getModulos = getModulos;