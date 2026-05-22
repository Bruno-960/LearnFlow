-- LearnFlow - Mathematics course content seed
-- Run this after supabase-content-schema.sql in the Supabase SQL Editor.
-- Idempotent for the listed Mathematics modules.

begin;

insert into public.subjects (slug, name, subtitle, icon, sort_order, is_active)
values ('matematica', 'Matemática', 'Álgebra, geometria e dados', 'chart', 2, true)
on conflict (slug) do update set
  name = excluded.name,
  subtitle = excluded.subtitle,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

with subject as (
  select id from public.subjects where slug = 'matematica'
),
module_seed(slug, title, objective, estimated_minutes, level, sort_order) as (
  values
    ('funcoes', 'Funções', 'Interpretar relações entre grandezas, função afim, função quadrática, gráficos, tabelas e problemas de variação.', 260, 'medio', 1),
    ('geometria-plana', 'Geometria Plana', 'Resolver problemas com áreas, perímetros, semelhança, Pitágoras, polígonos e circunferência.', 260, 'medio', 2),
    ('estatistica', 'Estatística', 'Ler dados, tabelas e gráficos; calcular média, mediana, moda, amplitude e interpretar dispersão.', 230, 'medio', 3),
    ('trigonometria', 'Trigonometria', 'Usar seno, cosseno, tangente, triângulo retângulo e ciclo trigonométrico em problemas contextualizados.', 240, 'medio', 4)
)
insert into public.course_modules (subject_id, slug, title, objective, estimated_minutes, level, sort_order, is_active)
select subject.id, module_seed.slug, module_seed.title, module_seed.objective, module_seed.estimated_minutes, module_seed.level, module_seed.sort_order, true
from subject
cross join module_seed
on conflict (subject_id, slug) do update set
  title = excluded.title,
  objective = excluded.objective,
  estimated_minutes = excluded.estimated_minutes,
  level = excluded.level,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

with lesson_seed(module_slug, lesson_slug, title, summary, sort_order) as (
  values
    ('funcoes', 'linguagem-das-funcoes', 'Linguagem das funções', 'Função descreve como uma grandeza de saída depende de uma entrada por meio de regra, tabela, gráfico ou contexto.', 1),
    ('funcoes', 'funcao-afim-quadratica', 'Função afim e quadrática', 'Taxa de variação, valor inicial, raiz, vértice e concavidade explicam muitos problemas do ENEM.', 2),
    ('geometria-plana', 'areas-perimetros', 'Áreas e perímetros', 'Área mede superfície, perímetro mede contorno, e a escolha correta depende da pergunta do problema.', 1),
    ('geometria-plana', 'pitagoras-semelhanca', 'Pitágoras e semelhança', 'Triângulos retângulos e figuras semelhantes permitem descobrir medidas inacessíveis por proporção.', 2),
    ('estatistica', 'medidas-tendencia-central', 'Média, mediana e moda', 'Medidas de tendência central resumem conjuntos de dados, mas cada uma responde uma pergunta diferente.', 1),
    ('estatistica', 'graficos-dispersao', 'Gráficos e dispersão', 'Leitura de gráfico exige escala, unidade, comparação e atenção à variabilidade dos dados.', 2),
    ('trigonometria', 'razoes-trigonometricas', 'Razões trigonométricas', 'Seno, cosseno e tangente relacionam ângulos e lados no triângulo retângulo.', 1),
    ('trigonometria', 'ciclo-aplicacoes', 'Ciclo trigonométrico e aplicações', 'O ciclo organiza periodicidade, sinais, arcos e fenômenos como ondas, rotação e movimento repetitivo.', 2)
)
insert into public.lessons (module_id, slug, title, summary, sort_order, is_active)
select module.id, lesson_seed.lesson_slug, lesson_seed.title, lesson_seed.summary, lesson_seed.sort_order, true
from lesson_seed
join public.subjects subject on subject.slug = 'matematica'
join public.course_modules module on module.subject_id = subject.id and module.slug = lesson_seed.module_slug
on conflict (module_id, slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

with seeded_lessons as (
  select lesson.id
  from public.lessons lesson
  join public.course_modules module on module.id = lesson.module_id
  join public.subjects subject on subject.id = module.subject_id
  where subject.slug = 'matematica'
    and module.slug in ('funcoes', 'geometria-plana', 'estatistica', 'trigonometria')
)
delete from public.lesson_blocks where lesson_id in (select id from seeded_lessons);

with seeded_lessons as (
  select lesson.id
  from public.lessons lesson
  join public.course_modules module on module.id = lesson.module_id
  join public.subjects subject on subject.id = module.subject_id
  where subject.slug = 'matematica'
    and module.slug in ('funcoes', 'geometria-plana', 'estatistica', 'trigonometria')
)
delete from public.lesson_exercises where lesson_id in (select id from seeded_lessons);

with block_seed(module_slug, lesson_slug, block_type, title, content, sort_order) as (
  values
    ('funcoes', 'linguagem-das-funcoes', 'intro', 'O que uma função realmente diz', 'Uma função é uma regra que liga cada entrada a uma única saída. A entrada costuma ser x. A saída pode aparecer como y ou f(x). Em problemas reais, x pode ser tempo, quantidade, distância, temperatura ou custo.', 1),
    ('funcoes', 'linguagem-das-funcoes', 'theory', 'Representações equivalentes', 'A mesma função pode aparecer como texto, fórmula, tabela ou gráfico. O aluno precisa mudar de linguagem: ler o texto, montar a regra, calcular valores, interpretar o gráfico e responder ao contexto.', 2),
    ('funcoes', 'linguagem-das-funcoes', 'example', 'Exemplo de custo', 'Uma assinatura custa R$ 20 fixos mais R$ 3 por uso. A função é C(x)=20+3x. O 20 é valor inicial. O 3 é taxa de variação. Para 10 usos, C(10)=50.', 3),
    ('funcoes', 'linguagem-das-funcoes', 'common_mistake', 'Erro comum', 'Confundir entrada com saída. Se a questão pergunta quantos usos cabem em R$ 80, você não substitui x por 80. Você resolve 20+3x=80.', 4),
    ('funcoes', 'linguagem-das-funcoes', 'review', 'Revisão rápida', 'Entrada é o que você escolhe. Saída é o resultado. Taxa de variação mostra quanto a saída muda por unidade de entrada. Valor inicial é f(0).', 5),

    ('funcoes', 'funcao-afim-quadratica', 'intro', 'Dois modelos frequentes', 'Função afim modela crescimento ou queda constante. Função quadrática aparece em áreas, trajetórias, lucro máximo, mínimo e situações com produto entre grandezas variáveis.', 1),
    ('funcoes', 'funcao-afim-quadratica', 'theory', 'Afim e quadrática', 'Na função afim f(x)=ax+b, a é taxa de variação e b é valor inicial. Na quadrática f(x)=ax²+bx+c, o gráfico é parábola. O sinal de a decide se a parábola abre para cima ou para baixo.', 2),
    ('funcoes', 'funcao-afim-quadratica', 'example', 'Vértice como ponto de decisão', 'Se um lucro é dado por função quadrática com a negativo, o vértice representa lucro máximo. Em problemas de área, o vértice pode indicar a melhor dimensão possível.', 3),
    ('funcoes', 'funcao-afim-quadratica', 'guided_practice', 'Roteiro de leitura', '1. Identifique as grandezas. 2. Veja se a variação é constante. 3. Procure termo ao quadrado. 4. Leia raiz, intercepto, crescimento e vértice conforme a pergunta.', 4),
    ('funcoes', 'funcao-afim-quadratica', 'review', 'Resumo final', 'Afim: reta. Quadrática: parábola. Raiz é onde f(x)=0. Intercepto em y é f(0). Vértice indica máximo ou mínimo.', 5),

    ('geometria-plana', 'areas-perimetros', 'intro', 'Medir superfície ou contorno', 'Geometria plana exige saber o que está sendo medido. Área mede região interna. Perímetro mede o contorno. Muitos erros acontecem quando o aluno usa fórmula certa para pergunta errada.', 1),
    ('geometria-plana', 'areas-perimetros', 'theory', 'Fórmulas com sentido', 'Retângulo: área base vezes altura. Triângulo: metade do produto base vezes altura. Círculo: área πr² e comprimento 2πr. Fórmulas funcionam melhor quando você entende o desenho.', 2),
    ('geometria-plana', 'areas-perimetros', 'example', 'Piso e rodapé', 'Para comprar piso, calcule área do cômodo. Para comprar rodapé, calcule perímetro. A figura pode ser a mesma, mas a pergunta muda a grandeza.', 3),
    ('geometria-plana', 'areas-perimetros', 'common_mistake', 'Pegadinha de unidade', 'Área aparece em unidade quadrada, como m². Perímetro aparece em unidade linear, como m. Se a unidade da resposta não combina, a estratégia provavelmente está errada.', 4),
    ('geometria-plana', 'areas-perimetros', 'review', 'Revisão rápida', 'Área: dentro. Perímetro: volta. Base e altura precisam ser perpendiculares no triângulo. Raio é metade do diâmetro.', 5),

    ('geometria-plana', 'pitagoras-semelhanca', 'intro', 'Quando a figura revela proporções', 'Pitágoras resolve triângulos retângulos. Semelhança resolve figuras com mesmo formato e tamanhos diferentes. Os dois temas aparecem em sombras, mapas, rampas, telas e escalas.', 1),
    ('geometria-plana', 'pitagoras-semelhanca', 'theory', 'Pitágoras e razão de semelhança', 'No triângulo retângulo, a²=b²+c², onde a é hipotenusa. Em figuras semelhantes, lados correspondentes mantêm a mesma razão. Área cresce pelo quadrado da razão linear.', 2),
    ('geometria-plana', 'pitagoras-semelhanca', 'example', 'Escala em planta', 'Se a escala é 1:100, cada 1 cm no desenho representa 100 cm reais. Medidas lineares usam a razão diretamente. Áreas usam a razão ao quadrado.', 3),
    ('geometria-plana', 'pitagoras-semelhanca', 'guided_practice', 'Roteiro seguro', '1. Verifique se há ângulo reto. 2. Identifique hipotenusa. 3. Se forem figuras semelhantes, alinhe lados correspondentes. 4. Só depois monte a proporção.', 4),
    ('geometria-plana', 'pitagoras-semelhanca', 'review', 'Resumo final', 'Pitágoras depende de triângulo retângulo. Semelhança depende de forma igual. Escala linear não é a mesma coisa que escala de área.', 5),

    ('estatistica', 'medidas-tendencia-central', 'intro', 'Resumir sem distorcer', 'Estatística resume dados, mas resumo não é neutralidade automática. Média, mediana e moda destacam aspectos diferentes de um conjunto.', 1),
    ('estatistica', 'medidas-tendencia-central', 'theory', 'Média, mediana e moda', 'Média é soma dividida pela quantidade. Mediana é o valor central com dados ordenados. Moda é o valor mais frequente. Outliers afetam muito a média, mas afetam menos a mediana.', 2),
    ('estatistica', 'medidas-tendencia-central', 'example', 'Salários e outliers', 'Em uma empresa com muitos salários baixos e poucos salários muito altos, a média pode parecer maior que a realidade da maioria. A mediana costuma representar melhor o centro nesse caso.', 3),
    ('estatistica', 'medidas-tendencia-central', 'common_mistake', 'Erro comum', 'Calcular mediana sem ordenar os dados. A mediana só faz sentido depois que a lista está em ordem crescente ou decrescente.', 4),
    ('estatistica', 'medidas-tendencia-central', 'review', 'Revisão rápida', 'Média equilibra soma. Mediana divide a lista ordenada. Moda repete mais. Outlier puxa média.', 5),

    ('estatistica', 'graficos-dispersao', 'intro', 'Gráfico é argumento visual', 'Gráficos condensam dados. Antes de calcular, leia título, eixos, escala, unidade, legenda e fonte. Muitas questões testam leitura cuidadosa, não conta difícil.', 1),
    ('estatistica', 'graficos-dispersao', 'theory', 'Escala e dispersão', 'Amplitude mede diferença entre maior e menor valor. Dispersão indica quanto os dados se espalham. Dois conjuntos podem ter mesma média e comportamentos muito diferentes.', 2),
    ('estatistica', 'graficos-dispersao', 'example', 'Mesma média, risco diferente', 'Notas 5,5,5,5 têm média 5 e dispersão zero. Notas 1,3,7,9 também têm média 5, mas dispersão alta. A interpretação muda completamente.', 3),
    ('estatistica', 'graficos-dispersao', 'guided_practice', 'Roteiro de gráfico', '1. Leia título. 2. Confira eixos e unidades. 3. Veja escala. 4. Compare tendências. 5. Procure variações bruscas e exceções.', 4),
    ('estatistica', 'graficos-dispersao', 'review', 'Resumo final', 'Gráfico exige escala. Média não mostra tudo. Amplitude mostra espalhamento básico. Interpretação depende do contexto.', 5),

    ('trigonometria', 'razoes-trigonometricas', 'intro', 'Ângulo como medida de inclinação', 'Trigonometria relaciona ângulos e lados. No triângulo retângulo, seno, cosseno e tangente permitem descobrir alturas, distâncias, rampas e inclinações.', 1),
    ('trigonometria', 'razoes-trigonometricas', 'theory', 'Seno, cosseno e tangente', 'Seno é cateto oposto dividido pela hipotenusa. Cosseno é cateto adjacente dividido pela hipotenusa. Tangente é cateto oposto dividido pelo cateto adjacente.', 2),
    ('trigonometria', 'razoes-trigonometricas', 'example', 'Altura inacessível', 'Se você conhece a distância até um prédio e o ângulo de elevação, pode usar tangente para estimar a altura: tg(ângulo)=altura/distância.', 3),
    ('trigonometria', 'razoes-trigonometricas', 'common_mistake', 'Erro comum', 'Definir oposto e adjacente sem olhar o ângulo de referência. O cateto oposto muda quando o ângulo escolhido muda.', 4),
    ('trigonometria', 'razoes-trigonometricas', 'review', 'Revisão rápida', 'Seno usa oposto e hipotenusa. Cosseno usa adjacente e hipotenusa. Tangente usa oposto e adjacente.', 5),

    ('trigonometria', 'ciclo-aplicacoes', 'intro', 'Além do triângulo', 'O ciclo trigonométrico amplia seno e cosseno para qualquer ângulo. Ele explica periodicidade, sinais nos quadrantes e fenômenos que se repetem.', 1),
    ('trigonometria', 'ciclo-aplicacoes', 'theory', 'Sinais e periodicidade', 'No ciclo, cosseno está ligado à coordenada x e seno à coordenada y. Os sinais mudam por quadrante. Funções trigonométricas repetem valores em períodos regulares.', 2),
    ('trigonometria', 'ciclo-aplicacoes', 'example', 'Ondas e rotação', 'Movimento circular, corrente alternada, marés, som e luz podem ser modelados por funções periódicas. O importante é identificar amplitude, período e deslocamento.', 3),
    ('trigonometria', 'ciclo-aplicacoes', 'guided_practice', 'Roteiro de aplicação', '1. Veja se o fenômeno se repete. 2. Identifique máximo e mínimo. 3. Ache o período. 4. Relacione fase ou deslocamento com o contexto.', 4),
    ('trigonometria', 'ciclo-aplicacoes', 'review', 'Resumo final', 'Ciclo organiza sinais. Seno é coordenada y. Cosseno é coordenada x. Periodicidade descreve repetição.', 5)
)
insert into public.lesson_blocks (lesson_id, block_type, title, content, sort_order)
select lesson.id, block_seed.block_type, block_seed.title, block_seed.content, block_seed.sort_order
from block_seed
join public.subjects subject on subject.slug = 'matematica'
join public.course_modules module on module.subject_id = subject.id and module.slug = block_seed.module_slug
join public.lessons lesson on lesson.module_id = module.id and lesson.slug = block_seed.lesson_slug;

with exercise_seed(module_slug, lesson_slug, question, exercise_type, choices, correct_answer, explanation, difficulty, sort_order) as (
  values
    ('funcoes', 'linguagem-das-funcoes', 'Em C(x)=20+3x, o número 3 representa:', 'multiple_choice', '["valor inicial", "taxa de variação", "raiz da função", "valor máximo", "quantidade final"]'::jsonb, 'B', 'O 3 multiplica x e indica quanto o custo cresce a cada uso.', 'facil', 1),
    ('funcoes', 'linguagem-das-funcoes', 'Explique como descobrir x quando C(x)=80 em C(x)=20+3x.', 'open', '[]'::jsonb, 'Resolver 20+3x=80, então 3x=60 e x=20.', 'A resposta precisa tratar 80 como saída, não como entrada.', 'medio', 2),
    ('funcoes', 'funcao-afim-quadratica', 'O gráfico de uma função quadrática é:', 'multiple_choice', '["reta", "parábola", "circunferência", "barra", "setor circular"]'::jsonb, 'B', 'Função quadrática tem gráfico em forma de parábola.', 'facil', 1),
    ('funcoes', 'funcao-afim-quadratica', 'O que o vértice representa em uma parábola com a negativo em problema de lucro?', 'open', '[]'::jsonb, 'Representa o ponto de lucro máximo.', 'Quando a parábola abre para baixo, o vértice é máximo.', 'medio', 2),

    ('geometria-plana', 'areas-perimetros', 'Para comprar rodapé de um quarto, a medida principal é:', 'multiple_choice', '["área", "perímetro", "volume", "média", "ângulo central"]'::jsonb, 'B', 'Rodapé acompanha o contorno do quarto, portanto usa perímetro.', 'facil', 1),
    ('geometria-plana', 'areas-perimetros', 'Diferencie área e perímetro.', 'open', '[]'::jsonb, 'Área mede superfície interna; perímetro mede contorno.', 'A resposta deve separar região interna e volta da figura.', 'facil', 2),
    ('geometria-plana', 'pitagoras-semelhanca', 'O Teorema de Pitágoras vale para:', 'multiple_choice', '["qualquer triângulo", "triângulo retângulo", "apenas quadrados", "circunferências", "gráficos de barra"]'::jsonb, 'B', 'Pitágoras relaciona lados em triângulo retângulo.', 'facil', 1),
    ('geometria-plana', 'pitagoras-semelhanca', 'Se uma escala linear dobra, como fica a área de uma figura semelhante?', 'open', '[]'::jsonb, 'A área fica quatro vezes maior, pois área varia com o quadrado da razão linear.', 'A resposta deve mencionar razão ao quadrado.', 'dificil', 2),

    ('estatistica', 'medidas-tendencia-central', 'Antes de calcular a mediana, é necessário:', 'multiple_choice', '["multiplicar todos os dados", "ordenar os dados", "apagar os extremos", "calcular área", "trocar unidades por graus"]'::jsonb, 'B', 'Mediana é o valor central de uma lista ordenada.', 'facil', 1),
    ('estatistica', 'medidas-tendencia-central', 'Por que a média pode enganar quando há outliers?', 'open', '[]'::jsonb, 'Porque valores extremos puxam a média para cima ou para baixo e podem não representar a maioria dos dados.', 'A resposta deve mencionar valores extremos e distorção.', 'medio', 2),
    ('estatistica', 'graficos-dispersao', 'Amplitude é:', 'multiple_choice', '["maior valor menos menor valor", "soma de todos os valores", "valor que mais se repete", "área do gráfico", "metade da mediana"]'::jsonb, 'A', 'Amplitude mede a diferença entre valor máximo e mínimo.', 'facil', 1),
    ('estatistica', 'graficos-dispersao', 'Dois conjuntos com mesma média sempre têm a mesma dispersão?', 'open', '[]'::jsonb, 'Não. Eles podem ter a mesma média e espalhamentos muito diferentes.', 'A resposta deve separar centro e dispersão.', 'medio', 2),

    ('trigonometria', 'razoes-trigonometricas', 'Tangente é:', 'multiple_choice', '["oposto sobre adjacente", "adjacente sobre hipotenusa", "oposto sobre hipotenusa", "hipotenusa sobre área", "perímetro sobre raio"]'::jsonb, 'A', 'Tangente relaciona cateto oposto e cateto adjacente.', 'facil', 1),
    ('trigonometria', 'razoes-trigonometricas', 'Por que é importante escolher o ângulo de referência?', 'open', '[]'::jsonb, 'Porque os catetos oposto e adjacente são definidos em relação ao ângulo escolhido.', 'A resposta deve mencionar que oposto e adjacente dependem do ângulo.', 'medio', 2),
    ('trigonometria', 'ciclo-aplicacoes', 'No ciclo trigonométrico, o seno está associado à coordenada:', 'multiple_choice', '["x", "y", "raio ao quadrado", "área", "perímetro"]'::jsonb, 'B', 'No ciclo trigonométrico, seno corresponde à coordenada y.', 'facil', 1),
    ('trigonometria', 'ciclo-aplicacoes', 'Cite uma situação real que pode ser modelada por função periódica.', 'open', '[]'::jsonb, 'Ondas, marés, corrente alternada, som, luz ou movimento circular.', 'A resposta deve indicar fenômeno repetitivo.', 'medio', 2)
)
insert into public.lesson_exercises (lesson_id, question, exercise_type, choices, correct_answer, explanation, difficulty, sort_order)
select lesson.id, exercise_seed.question, exercise_seed.exercise_type, exercise_seed.choices, exercise_seed.correct_answer, exercise_seed.explanation, exercise_seed.difficulty, exercise_seed.sort_order
from exercise_seed
join public.subjects subject on subject.slug = 'matematica'
join public.course_modules module on module.subject_id = subject.id and module.slug = exercise_seed.module_slug
join public.lessons lesson on lesson.module_id = module.id and lesson.slug = exercise_seed.lesson_slug;

with seeded_lessons as (
  select lesson.id
  from public.lessons lesson
  join public.course_modules module on module.id = lesson.module_id
  join public.subjects subject on subject.id = module.subject_id
  where subject.slug = 'matematica'
    and module.slug in ('funcoes', 'geometria-plana', 'estatistica', 'trigonometria')
)
delete from public.lesson_sources where lesson_id in (select id from seeded_lessons);

with source_seed(module_slug, lesson_slug, title, url, license, attribution, notes) as (
  values
    ('funcoes', 'linguagem-das-funcoes', 'OpenStax Algebra and Trigonometry 2e', 'https://openstax.org/details/books/algebra-and-trigonometry-2e', 'CC BY', 'OpenStax', 'Referência aberta para funções, gráficos e modelagem algébrica.'),
    ('geometria-plana', 'areas-perimetros', 'OpenStax Prealgebra 2e - Geometry', 'https://openstax.org/details/books/prealgebra-2e', 'CC BY', 'OpenStax', 'Referência aberta para geometria plana, área e perímetro.'),
    ('estatistica', 'medidas-tendencia-central', 'OpenStax Introductory Statistics', 'https://openstax.org/details/books/introductory-statistics', 'CC BY', 'OpenStax', 'Referência aberta para estatística descritiva e gráficos.'),
    ('trigonometria', 'razoes-trigonometricas', 'OpenStax Algebra and Trigonometry 2e - Trigonometry', 'https://openstax.org/details/books/algebra-and-trigonometry-2e', 'CC BY', 'OpenStax', 'Referência aberta para razões trigonométricas e ciclo.')
)
insert into public.lesson_sources (lesson_id, title, url, license, attribution, notes)
select lesson.id, source_seed.title, source_seed.url, source_seed.license, source_seed.attribution, source_seed.notes
from source_seed
join public.subjects subject on subject.slug = 'matematica'
join public.course_modules module on module.subject_id = subject.id and module.slug = source_seed.module_slug
join public.lessons lesson on lesson.module_id = module.id and lesson.slug = source_seed.lesson_slug;

commit;
