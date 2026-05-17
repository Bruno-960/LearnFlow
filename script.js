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

    // ========== DADOS DOS ESTUDOS (CATEGORIAS INDEPENDENTES) ==========
    const categoriasEstudos = {
        ensinoMedio: {
            titulo: "Ensino Médio",
            materias: [
                {
                    nome: "Português", id: "portugues", modulos: [
                        { id: 'interpretacao', titulo: 'Interpretação de Texto', dificuldade: 'basico', desc: 'Técnicas de leitura e compreensão' },
                        { id: 'classes-gramaticais', titulo: 'Classes Gramaticais', dificuldade: 'basico', desc: 'Substantivos, adjetivos, verbos e mais' },
                        { id: 'regencia', titulo: 'Regência Verbal', dificuldade: 'intermediario', desc: 'Verbos e suas preposições' },
                        { id: 'figuras-linguagem', titulo: 'Figuras de Linguagem', dificuldade: 'intermediario', desc: 'Metáfora, metonímia e outras' },
                        { id: 'concordancia', titulo: 'Concordância Nominal e Verbal', dificuldade: 'avancado', desc: 'Regras de concordância' },
                        { id: 'redacao-dissertativa', titulo: 'Redação Dissertativa', dificuldade: 'avancado', desc: 'Estrutura e argumentação' }
                    ]
                },
                {
                    nome: "Matemática", id: "matematica", modulos: [
                        { id: 'porcentagem', titulo: 'Porcentagem', dificuldade: 'basico', desc: 'Cálculos percentuais' },
                        { id: 'equacao-1grau', titulo: 'Equação do 1º Grau', dificuldade: 'basico', desc: 'Resolução de equações lineares' },
                        { id: 'progressao-aritmetica', titulo: 'Progressão Aritmética', dificuldade: 'intermediario', desc: 'Sequências e razão' },
                        { id: 'funcao-2grau', titulo: 'Função do 2º Grau', dificuldade: 'avancado', desc: 'Parábolas e vértices' }
                    ]
                },
                {
                    nome: "Química", id: "quimica", modulos: [
                        { id: 'tabela-periodica', titulo: 'Tabela Periódica', dificuldade: 'basico', desc: 'Propriedades e organização' },
                        { id: 'ligacoes-quimicas', titulo: 'Ligações Químicas', dificuldade: 'intermediario', desc: 'Iônica, covalente e metálica' }
                    ]
                },
                {
                    nome: "Física", id: "fisica", modulos: [
                        { id: 'cinematica', titulo: 'Cinemática', dificuldade: 'basico', desc: 'Movimento uniforme e variado' },
                        { id: 'leis-newton', titulo: 'Leis de Newton', dificuldade: 'intermediario', desc: 'Mecânica clássica' }
                    ]
                }
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
            cards: [
                {
                    titulo: 'O que é interpretar?',
                    texto: '<p>Interpretar um texto vai além de simplesmente decodificar palavras. É compreender as <strong>intenções do autor</strong>, o <strong>contexto</strong> em que o texto foi produzido e as <strong>entrelinhas</strong> da mensagem.</p><p>A interpretação textual é uma habilidade fundamental não apenas para provas como o ENEM, mas para a vida cotidiana.</p>',
                    destaque: '📌 Dica: Leia o texto pelo menos duas vezes. Na primeira, entenda o tema geral. Na segunda, mergulhe nos detalhes.'
                },
                {
                    titulo: 'Tipos de leitura',
                    texto: '<ul><li><strong>Leitura superficial (scanning):</strong> passar os olhos rapidamente para captar a ideia central.</li><li><strong>Leitura detalhada:</strong> ler com atenção cada parágrafo, identificando argumentos e evidências.</li><li><strong>Leitura crítica:</strong> questionar o texto, identificar vieses e comparar com outras fontes.</li></ul>',
                    destaque: '💡 Para o ENEM: pratique a leitura crítica. As questões cobram exatamente essa habilidade.'
                },
                {
                    titulo: 'Identificando a ideia principal',
                    texto: '<p>A ideia principal de um texto é o <strong>núcleo da mensagem</strong> que o autor quer transmitir. Para encontrá-la:</p><ol><li>Identifique o tema (sobre o que o texto fala).</li><li>Pergunte-se: qual a opinião do autor sobre esse tema?</li><li>Localize a tese (frase que resume o posicionamento).</li></ol>',
                    destaque: '🔍 A ideia principal geralmente aparece no primeiro ou último parágrafo de textos dissertativos.'
                }
            ]
        },
        'classes-gramaticais': {
            titulo: 'Classes Gramaticais',
            cards: [
                {
                    titulo: 'As 10 classes de palavras',
                    texto: '<p>A gramática da língua portuguesa classifica as palavras em <strong>10 classes gramaticais</strong>:</p><ol><li>Substantivo</li><li>Adjetivo</li><li>Artigo</li><li>Numeral</li><li>Pronome</li><li>Verbo</li><li>Advérbio</li><li>Preposição</li><li>Conjunção</li><li>Interjeição</li></ol>',
                    destaque: '📝 Decorar a lista não basta: é preciso entender a função de cada classe na frase.'
                },
                {
                    titulo: 'Substantivo e Adjetivo',
                    texto: '<p><strong>Substantivo:</strong> nomeia seres, objetos, lugares, sentimentos e conceitos. Ex: <em>casa, amor, Brasil, liberdade</em>.</p><p><strong>Adjetivo:</strong> caracteriza ou qualifica o substantivo. Ex: <em>casa <strong>bonita</strong>, amor <strong>verdadeiro</strong></em>.</p>',
                    destaque: '🎯 Substantivos abstratos (amor, saudade, coragem) são muito cobrados em interpretação de texto.'
                },
                {
                    titulo: 'Verbo e Advérbio',
                    texto: '<p><strong>Verbo:</strong> expressa ação, estado ou fenômeno da natureza. Ex: <em>correr, estar, chover</em>.</p><p><strong>Advérbio:</strong> modifica o verbo, o adjetivo ou outro advérbio, indicando circunstâncias. Ex: <em>correr <strong>rapidamente</strong>, <strong>muito</strong> bonito</em>.</p>',
                    destaque: '⚠️ Advérbios terminados em -mente são muito usados na redação: principalmente, certamente, evidentemente.'
                }
            ]
        },
        'porcentagem': {
            titulo: 'Porcentagem',
            cards: [
                {
                    titulo: 'O que é porcentagem?',
                    texto: '<p>Porcentagem é uma forma de expressar uma proporção em relação a 100. O símbolo <strong>%</strong> significa "por cento", ou seja, "dividido por 100".</p><p>Exemplo: 25% = 25/100 = 0,25</p>',
                    destaque: '🧮 Para calcular x% de um valor, multiplique o valor por x/100.'
                },
                {
                    titulo: 'Cálculos básicos',
                    texto: '<p><strong>Exemplo 1:</strong> 20% de 150 = 150 × 20/100 = 150 × 0,20 = <strong>30</strong></p><p><strong>Exemplo 2:</strong> Um produto de R$ 80,00 com desconto de 15%: 80 × 15/100 = 12 → R$ 80 - R$ 12 = <strong>R$ 68,00</strong></p>',
                    destaque: '💡 No ENEM, questões de porcentagem aparecem misturadas com gráficos e tabelas.'
                },
                {
                    titulo: 'Aumentos e descontos sucessivos',
                    texto: '<p>Para aumentos sucessivos, multiplique os fatores. Ex: aumento de 10% seguido de 20% → fator 1,10 × 1,20 = 1,32 → <strong>aumento de 32%</strong> (não 30%!).</p>',
                    destaque: '⚠️ Cuidado: aumentos e descontos sucessivos não se somam diretamente!'
                }
            ]
        },
        'equacao-1grau': {
            titulo: 'Equação do 1º Grau',
            cards: [
                {
                    titulo: 'Definição',
                    texto: '<p>Uma equação do 1º grau é toda sentença matemática que pode ser escrita na forma <strong>ax + b = 0</strong>, onde <em>a</em> e <em>b</em> são números reais e <em>a ≠ 0</em>.</p><p>Exemplo: 2x - 6 = 0</p>',
                    destaque: '🎯 O objetivo é isolar a incógnita (x) em um dos lados da igualdade.'
                },
                {
                    titulo: 'Resolução passo a passo',
                    texto: '<p><strong>Exemplo:</strong> 3x + 5 = 20</p><ol><li>Subtraia 5 de ambos os lados: 3x = 15</li><li>Divida ambos os lados por 3: x = 5</li></ol><p><strong>Verificação:</strong> 3(5) + 5 = 15 + 5 = 20 ✅</p>',
                    destaque: '📝 Sempre verifique sua resposta substituindo o valor encontrado na equação original.'
                }
            ]
        },
        'cinematica': {
            titulo: 'Cinemática',
            cards: [
                {
                    titulo: 'Conceitos básicos',
                    texto: '<p>A <strong>cinemática</strong> estuda o movimento dos corpos sem se preocupar com suas causas. Os conceitos fundamentais são:</p><ul><li><strong>Posição (s):</strong> localização do corpo em relação a um referencial.</li><li><strong>Deslocamento (Δs):</strong> variação da posição.</li><li><strong>Velocidade (v):</strong> taxa de variação da posição.</li></ul>',
                    destaque: '🚗 A cinemática está presente no cotidiano: ao dirigir, ao caminhar, ao ver um objeto cair.'
                },
                {
                    titulo: 'Movimento Uniforme (MU)',
                    texto: '<p>No <strong>Movimento Uniforme</strong>, a velocidade é constante. A equação horária é: <strong>s = s₀ + v·t</strong></p><p>Onde: s = posição final, s₀ = posição inicial, v = velocidade, t = tempo.</p>',
                    destaque: '📐 O gráfico s × t do MU é uma reta inclinada. A inclinação representa a velocidade.'
                },
                {
                    titulo: 'Movimento Uniformemente Variado (MUV)',
                    texto: '<p>No <strong>MUV</strong>, a aceleração é constante. Equações:</p><ul><li>v = v₀ + a·t</li><li>s = s₀ + v₀·t + (a·t²)/2</li><li>v² = v₀² + 2a·Δs</li></ul>',
                    destaque: '⚠️ A aceleração da gravidade na Terra é aproximadamente 9,8 m/s² (use 10 m/s² no ENEM).'
                }
            ]
        },
        'leis-newton': {
            titulo: 'Leis de Newton',
            cards: [
                {
                    titulo: '1ª Lei — Inércia',
                    texto: '<p>Todo corpo permanece em repouso ou em movimento retilíneo uniforme, a menos que uma força externa atue sobre ele.</p><p><strong>Exemplo:</strong> quando um ônibus freia bruscamente, os passageiros são lançados para frente por inércia.</p>',
                    destaque: '🪐 A inércia explica por que os planetas continuam em órbita sem parar.'
                },
                {
                    titulo: '2ª Lei — Princípio Fundamental',
                    texto: '<p>A força resultante sobre um corpo é igual ao produto de sua massa pela aceleração: <strong>F = m·a</strong></p><p>Unidades: Força (N), Massa (kg), Aceleração (m/s²).</p>',
                    destaque: '💪 Quanto maior a massa, maior a força necessária para acelerar o corpo.'
                },
                {
                    titulo: '3ª Lei — Ação e Reação',
                    texto: '<p>Para toda força de ação, existe uma força de reação de mesma intensidade, mesma direção e sentido oposto, aplicada em corpos diferentes.</p><p><strong>Exemplo:</strong> ao empurrar uma parede, a parede empurra você de volta com a mesma força.</p>',
                    destaque: '🚀 Foguetes funcionam por ação e reação: gases são expelidos para baixo, o foguete sobe.'
                }
            ]
        },
        'ligacoes-quimicas': {
            titulo: 'Ligações Químicas',
            cards: [
                {
                    titulo: 'Ligação Iônica',
                    texto: '<p>Ocorre entre <strong>metais e não metais</strong>. Há transferência de elétrons. O metal doa elétrons (cátion) e o não metal recebe (ânion).</p><p><strong>Exemplo:</strong> NaCl (cloreto de sódio): Na⁺ + Cl⁻</p>',
                    destaque: '🧂 O sal de cozinha é o exemplo mais comum de composto iônico.'
                },
                {
                    titulo: 'Ligação Covalente',
                    texto: '<p>Ocorre entre <strong>não metais</strong>. Há compartilhamento de elétrons. Os átomos compartilham pares de elétrons para completar o octeto.</p><p><strong>Exemplo:</strong> H₂O (água), CO₂ (gás carbônico).</p>',
                    destaque: '💧 A molécula de água tem geometria angular devido aos pares de elétrons livres.'
                },
                {
                    titulo: 'Ligação Metálica',
                    texto: '<p>Ocorre entre <strong>metais</strong>. Os elétrons formam um "mar de elétrons" que mantém os átomos unidos. Isso explica a condutividade elétrica e o brilho dos metais.</p>',
                    destaque: '⚡ O "mar de elétrons" explica por que os metais conduzem eletricidade tão bem.'
                }
            ]
        },
        'tabela-periodica': {
            titulo: 'Tabela Periódica',
            cards: [
                {
                    titulo: 'Organização da Tabela Periódica',
                    texto: '<p>A Tabela Periódica organiza os 118 elementos químicos conhecidos por <strong>número atômico (Z) crescente</strong>. Os elementos são dispostos em:</p><ul><li><strong>Períodos:</strong> linhas horizontais (7 períodos).</li><li><strong>Grupos ou Famílias:</strong> colunas verticais (18 grupos).</li></ul><p>Elementos do mesmo grupo possuem propriedades químicas semelhantes.</p>',
                    destaque: '📊 A tabela abaixo é interativa: passe o mouse para ver detalhes e clique para mais informações.'
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
        return [
            { id: 'modulo-1', titulo: 'Introdução', desc: 'Conceitos iniciais', dificuldade: 'basico', tempo: '15min', exercicios: 5 },
            { id: 'modulo-2', titulo: 'Avançado', desc: 'Tópicos avançados', dificuldade: 'avancado', tempo: '40min', exercicios: 15 }
        ];
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
            else { const c = el.grupo - 1, r = el.periodo - 1; if (r < maxPeriodo && c < maxGrupo) grid[r][c] = el; }
        });
        let html = '<div class="tabela-periodica__grid">';
        for (let r = 0; r < maxPeriodo; r++)
            for (let c = 0; c < maxGrupo; c++) {
                const el = grid[r][c];
                html += el ? `<div class="tabela-periodica__elemento tp-${el.tipo}" data-num="${el.num}" data-simb="${el.simb}" data-nome="${el.nome}" data-massa="${el.massa}" data-familia="${el.familia}" data-grupo="${el.grupo}" data-periodo="${el.periodo}"><span class="tabela-periodica__numero">${el.num}</span><span class="tabela-periodica__simbolo">${el.simb}</span><div class="tabela-periodica__tooltip"><strong>${el.nome}</strong> (${el.simb})<br>Nº atômico: ${el.num}<br>Massa: ${el.massa}<br>Família: ${el.familia}</div></div>` : '<div class="tabela-periodica__elemento tabela-periodica__elemento--vazio"></div>';
            }
        html += '</div>';
        html += '<div style="display:flex;align-items:center;gap:4px;margin-top:2px;min-width:1400px;"><span class="tabela-periodica__rotulo-linha">Lant.</span><div class="tabela-periodica__linha-especial" style="flex:1;">';
        lantanideos.forEach(el => html += `<div class="tabela-periodica__elemento tp-${el.tipo}" data-num="${el.num}" data-simb="${el.simb}" data-nome="${el.nome}" data-massa="${el.massa}" data-familia="${el.familia}"><span class="tabela-periodica__numero">${el.num}</span><span class="tabela-periodica__simbolo">${el.simb}</span><div class="tabela-periodica__tooltip"><strong>${el.nome}</strong><br>Nº atômico: ${el.num}<br>Massa: ${el.massa}</div></div>`);
        html += '</div></div>';
        html += '<div style="display:flex;align-items:center;gap:4px;margin-top:2px;min-width:1400px;"><span class="tabela-periodica__rotulo-linha">Act.</span><div class="tabela-periodica__linha-especial" style="flex:1;">';
        actinideos.forEach(el => html += `<div class="tabela-periodica__elemento tp-${el.tipo}" data-num="${el.num}" data-simb="${el.simb}" data-nome="${el.nome}" data-massa="${el.massa}" data-familia="${el.familia}"><span class="tabela-periodica__numero">${el.num}</span><span class="tabela-periodica__simbolo">${el.simb}</span><div class="tabela-periodica__tooltip"><strong>${el.nome}</strong><br>Nº atômico: ${el.num}<br>Massa: ${el.massa}</div></div>`);
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
        $('#headerAvatar').textContent = foto ? '' : avatar;
        if (foto) { $('#headerAvatar').style.backgroundImage = `url(${foto})`; $('#headerAvatar').style.backgroundSize = 'cover'; }
        else { $('#headerAvatar').style.backgroundImage = ''; $('#headerAvatar').style.backgroundSize = ''; }
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
    function setupFlashcards() { $('#criarDeck').addEventListener('click',()=>{ const nome=prompt('Nome do deck:'); if(!nome)return; const decks=loadData('flashcardDecks')||[]; decks.push({id:Date.now(),nome,icone:'🃏',cards:[],criadoEm:new Date().toISOString()}); saveData('flashcardDecks',decks); renderFlashcards(); mostrarToast('Deck criado!','sucesso'); }); }
    function renderFlashcards() { const decks=loadData('flashcardDecks')||[]; const container=$('#flashcardsGrid'); if(!container)return; if(!decks.length){container.innerHTML='<p class="text-muted">Nenhum deck criado ainda.</p>';return;} container.innerHTML=decks.map(d=>`<div class="flashcard-deck"><div class="flashcard-deck__icone">${d.icone}</div><div class="flashcard-deck__titulo">${d.nome}</div><div class="flashcard-deck__cards">${d.cards.length} cartões</div><div class="flashcard-deck__progresso"><div class="flashcard-deck__progresso-bar" style="width:${d.cards.length>0?50:0}%;"></div></div></div>`).join(''); }

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
        container.innerHTML = `
            <h2 style="margin-bottom:16px;">Escolha uma categoria</h2>
            <div class="categorias-grid">
                ${Object.entries(categoriasEstudos).map(([key, data]) => `
                    <div class="categoria-card" data-categoria="${key}">
                        <div class="categoria-card__titulo">${data.titulo}</div>
                        <div class="categoria-card__desc">${data.materias.length} matérias disponíveis</div>
                    </div>
                `).join('')}
            </div>
        `;
        $$('.categoria-card').forEach(card => card.addEventListener('click', () => abrirCategoria(card.dataset.categoria)));
    }

    function abrirCategoria(categoria) {
        const data = categoriasEstudos[categoria];
        if (!data) return;
        estudoNavegacao = { nivel: 'materias', categoria, materia: null };
        const container = $('#estudoContainer');
        const progressos = loadData('progressosMaterias') || {};
        container.innerHTML = `
            <button class="btn btn--secondary btn--sm" style="margin-bottom:16px;" id="voltarCategorias">← Voltar</button>
            <h2 style="margin-bottom:16px;">${data.titulo}</h2>
            <div class="materias-grid">
                ${data.materias.map(mat => {
                    const prog = progressos[mat.id] || 0;
                    return `
                        <div class="materia-card" data-materia="${mat.id}" data-categoria="${categoria}">
                            <div class="materia-card__titulo">${mat.nome}</div>
                            <div class="materia-card__modulos">${mat.modulos ? mat.modulos.length : 0} módulos</div>
                            <div class="materia-card__progress">${prog}%</div>
                            <div style="background:var(--bg-input);height:5px;border-radius:3px;margin-top:6px;"><div style="width:${prog}%;height:100%;background:var(--accent);border-radius:3px;"></div></div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
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
        container.innerHTML = `
            <button class="btn btn--secondary btn--sm" style="margin-bottom:16px;" id="voltarMaterias">← Voltar</button>
            <h2 style="margin-bottom:16px;">${matNome}</h2>
            <div class="modulos-grid">
                ${modulos.map(m => {
                    const prog = progressos[m.id] || 0;
                    return `
                        <div class="modulo-card">
                            <div class="modulo-card__header">
                                <span class="modulo-card__titulo">${m.titulo}</span>
                                <span class="modulo-card__badge badge-${m.dificuldade}">${m.dificuldade}</span>
                            </div>
                            <p class="modulo-card__desc">${m.desc || ''}</p>
                            <div class="modulo-card__info"><span>⏱ ${m.tempo || '20min'}</span><span>📝 ${m.exercicios || 10} exercícios</span></div>
                            <div class="modulo-card__progresso"><div class="modulo-card__progresso-bar" style="width:${prog}%;"></div></div>
                            <div class="modulo-card__acoes">
                                <button class="btn btn--primary btn--sm btn-estudar-modulo" data-modulo="${m.id}" data-materia="${materiaId}">Estudar</button>
                                ${prog >= 100 ? '<span style="color:#10b981;">✅</span>' : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
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
        $('#modalModuloConteudo').innerHTML = `
            <div class="modulo-conteudo">
                <span class="modulo-card__badge badge-${modulo.dificuldade}">${modulo.dificuldade}</span><span style="margin-left:8px;">⏱ ${modulo.tempo || '20min'}</span>
                <h4>Resumo Teórico</h4><p>Conteúdo detalhado sobre <strong>${modulo.titulo}</strong> será exibido aqui.</p>
                <h4>Exemplos</h4><p>Exemplos práticos e aplicações do conteúdo.</p>
                <h4>Exercícios</h4><p>${modulo.exercicios || 10} exercícios para praticar.</p>
                <ul><li>Exercício 1</li><li>Exercício 2</li><li>Exercício 3</li></ul>
                <button class="btn btn--primary" id="concluirModulo">Marcar como Concluído</button>
            </div>
        `;
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

    // ========== PÁGINA DE ESTUDO COMPLETA (CONTEÚDO REAL) ==========
    function abrirPaginaEstudo(moduloId, materiaId) {
        const conteudo = conteudosModulos[moduloId];
        if (!conteudo) { abrirModalModulo(moduloId, materiaId, (getModulos(materiaId)||[]).find(m=>m.id===moduloId) || {titulo:moduloId,dificuldade:'basico'}); return; }
        const modulos = getModulos(materiaId); const modulo = modulos.find(m => m.id === moduloId) || {titulo:conteudo.titulo, dificuldade:'basico', desc:'', tempo:'20min'};
        const matNome = Object.values(categoriasEstudos).flatMap(c=>c.materias).find(m=>m.id===materiaId)?.nome || materiaId;
        const progressos = loadData('progressoModulos') || {}; const prog = progressos[moduloId] || 0;
        const estadoAnterior = { ...estudoNavegacao }; const container = $('#estudoContainer');

        const cardsHTML = conteudo.cards.map((card, i) => `
            <div class="study-card" id="secao-${i}">
                <div class="study-card__numero">${String(i+1).padStart(2,'0')}</div>
                <h2 class="study-card__titulo">${card.titulo}</h2>
                <div class="study-card__texto">${card.texto}</div>
                ${card.destaque ? `<div class="study-card__destaque">${card.destaque}</div>` : ''}
            </div>
        `).join('');

        const navHTML = conteudo.cards.map((card, i) => `
            <a href="#secao-${i}" class="study-sidebar__link ${i===0?'study-sidebar__link--ativo':''}" data-secao="${i}">${String(i+1).padStart(2,'0')}. ${card.titulo}</a>
        `).join('');

        container.innerHTML = `
            <div class="study-hero"><div class="study-hero__content"><div class="study-hero__breadcrumb"><button class="btn btn--text btn--sm" id="studyVoltar">← Voltar para módulos</button><span class="bread-sep">›</span><span>${matNome}</span></div><h1 class="study-hero__title">${conteudo.titulo}</h1><p class="study-hero__subtitle">${modulo.desc || 'Conteúdo completo do módulo'}</p><div class="study-hero__meta"><span class="study-hero__badge badge-${modulo.dificuldade || 'basico'}">${modulo.dificuldade || 'Básico'}</span><span>⏱ ${modulo.tempo || '20min'}</span></div></div><div class="study-hero__progress"><div class="study-progresso-circular"><svg viewBox="0 0 100 100"><circle class="study-progresso-circular__fundo" cx="50" cy="50" r="42"/><circle class="study-progresso-circular__barra" cx="50" cy="50" r="42" stroke-dasharray="${prog * 2.64} 264"/></svg><span class="study-progresso-circular__texto">${prog}%</span></div><button class="btn btn--primary" id="studyContinuar">Continuar</button></div></div>
            <div class="study-layout"><div class="study-content">
                ${cardsHTML}
                ${moduloId === 'tabela-periodica' ? `<div class="study-card" id="secao-tabela"><div class="study-card__numero">04</div><h2 class="study-card__titulo">Tabela Periódica Interativa</h2><p class="study-card__desc">Passe o mouse sobre os elementos para ver detalhes. Todos os 118 elementos.</p><div class="tabela-periodica">${gerarTabelaPeriodicaHTML()}</div></div>` : ''}
            </div>
            <aside class="study-sidebar"><div class="study-sidebar__card"><h4 class="study-sidebar__titulo">Navegação</h4><nav class="study-sidebar__nav">${navHTML}${moduloId === 'tabela-periodica' ? '<a href="#secao-tabela" class="study-sidebar__link" data-secao="tabela">04. Tabela Periódica</a>' : ''}</nav></div><div class="study-sidebar__card"><h4 class="study-sidebar__titulo">Desempenho</h4><div class="study-sidebar__stats"><div class="study-sidebar__stat"><span class="study-sidebar__stat-valor">🔥 ${streak}</span><span class="study-sidebar__stat-label">Dias seguidos</span></div><div class="study-sidebar__stat"><span class="study-sidebar__stat-valor">${Object.values(loadData('progressoModulos')||{}).filter(v=>v>=100).length}</span><span class="study-sidebar__stat-label">Módulos concluídos</span></div></div></div></aside></div>
        `;
        $('#studyVoltar').addEventListener('click', () => { estudoNavegacao = estadoAnterior; renderModulos(materiaId); });
        $('#studyContinuar').addEventListener('click', () => document.getElementById('secao-0')?.scrollIntoView({ behavior: 'smooth' }));
        // Sidebar scroll
        $$('.study-sidebar__link').forEach(link => link.addEventListener('click', function(e){ e.preventDefault(); const t=document.querySelector(this.getAttribute('href')); if(t) t.scrollIntoView({behavior:'smooth',block:'start'}); }));
        // Scroll spy
        const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if(entry.isIntersecting){ $$('.study-sidebar__link').forEach(l=>l.classList.remove('study-sidebar__link--ativo')); const link=document.querySelector(`.study-sidebar__link[data-secao="${entry.target.id.replace('secao-','')}"]`); if(link) link.classList.add('study-sidebar__link--ativo'); } }); }, {threshold:0.5});
        document.querySelectorAll('.study-card[id]').forEach(card => observer.observe(card));
        // Modal da tabela periódica ao clicar
        $$('.tabela-periodica__elemento[data-num]').forEach(el => {
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                const num = this.dataset.num, simb = this.dataset.simb, nome = this.dataset.nome, massa = this.dataset.massa, familia = this.dataset.familia, grupo = this.dataset.grupo, periodo = this.dataset.periodo;
                $('#modalElementoTitulo').textContent = `${nome} (${simb})`;
                $('#modalElementoConteudo').innerHTML = `<p><strong>Número atômico:</strong> ${num}</p><p><strong>Massa atômica:</strong> ${massa}</p><p><strong>Família:</strong> ${familia}</p><p><strong>Grupo:</strong> ${grupo} | <strong>Período:</strong> ${periodo}</p>`;
                $('#modalElementoOverlay').classList.add('modal-overlay--visible');
            });
        });
        $('#modalElementoFechar').addEventListener('click', () => $('#modalElementoOverlay').classList.remove('modal-overlay--visible'));
        $('#modalElementoOverlay').addEventListener('click', e => { if (e.target === $('#modalElementoOverlay')) $('#modalElementoOverlay').classList.remove('modal-overlay--visible'); });
    }

    // ========== CALENDÁRIO ==========
    function setupCalendario() { $('#calPrev').addEventListener('click',()=>{calMonth--;if(calMonth<0){calYear--;calMonth=11;}renderCalendario();}); $('#calNext').addEventListener('click',()=>{calMonth++;if(calMonth>11){calYear++;calMonth=0;}renderCalendario();}); $('#calHoje').addEventListener('click',()=>{const t=new Date(new Date().toLocaleString("en-US",{timeZone:"America/Sao_Paulo"}));calYear=t.getFullYear();calMonth=t.getMonth();renderCalendario();}); renderCalendario(); }
    function renderCalendario() {
        const grid=$('#calendarioGrid'); if(!grid)return; $('#calTitulo').textContent=new Date(calYear,calMonth).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
        const primeiro=new Date(calYear,calMonth,1).getDay(), ultimo=new Date(calYear,calMonth+1,0).getDate();
        grid.innerHTML=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d=>`<div class="calendario-dia-semana">${d}</div>`).join('');
        for(let i=0;i<primeiro;i++) grid.innerHTML+='<div></div>';
        const hojeStr=todayStr(), eventos=loadData('eventosCalendario')||[];
        for(let d=1;d<=ultimo;d++){ const ds=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; let cls='calendario-dia'; if(ds===hojeStr) cls+=' calendario-dia--hoje'; if(feriados[ds]) cls+=' calendario-dia--feriado'; if(eventos.some(ev=>ev.data===ds)) cls+=' calendario-dia--tarefa'; grid.innerHTML+=`<div class="${cls}" data-data="${ds}">${d}</div>`; }
        $$('.calendario-dia[data-data]').forEach(el=>el.addEventListener('click',e=>abrirModalDia(e.currentTarget.dataset.data)));
    }
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
        $('#headerAvatar').addEventListener('click', () => { switchTab('perfil'); });
        $('#sidebarPerfil').addEventListener('click', () => { switchTab('perfil'); });
        $('#perfilEditarNome').addEventListener('click', () => { const nome = prompt('Seu nome:', loadData('nomePerfil') || 'Estudante'); if (nome) { saveData('nomePerfil', nome); abrirPerfilPainel(); atualizarDashboard(); } });
        $('#trocarFotoBtn').addEventListener('click', () => $('#perfilFotoInput').click());
        $('#perfilFotoInput').addEventListener('change', e => {
            const file = e.target.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = function(event) {
                const dataUrl = event.target.result;
                $('#perfilAvatarPainel').style.backgroundImage = `url(${dataUrl})`; $('#perfilAvatarPainel').style.backgroundSize = 'cover'; $('#perfilAvatarPainel').textContent = '';
                saveData('fotoPerfil', dataUrl); atualizarSidebarPerfil();
            };
            reader.readAsDataURL(file);
        });
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