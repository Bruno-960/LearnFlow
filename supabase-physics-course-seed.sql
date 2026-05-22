-- LearnFlow - Physics course content seed
-- Run this after supabase-content-schema.sql in the Supabase SQL Editor.
-- Idempotent for the listed Physics modules: updates modules/lessons and replaces
-- blocks/exercises/sources for these lessons.

begin;

insert into public.subjects (slug, name, subtitle, icon, sort_order, is_active)
values ('fisica', 'Física', 'Movimento, energia e fenômenos', 'atom', 4, true)
on conflict (slug) do update set
  name = excluded.name,
  subtitle = excluded.subtitle,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

with subject as (
  select id from public.subjects where slug = 'fisica'
),
module_seed(slug, title, objective, estimated_minutes, level, sort_order) as (
  values
    ('leis-de-newton', 'Leis de Newton', 'Interpretar movimento a partir de força resultante, inércia, aceleração, atrito e pares de ação e reação.', 220, 'medio', 1),
    ('energia-mecanica', 'Energia Mecânica', 'Relacionar energia cinética, potencial, trabalho, potência e conservação de energia em situações do ENEM.', 220, 'medio', 2),
    ('eletrostatica', 'Eletrostática', 'Compreender carga elétrica, eletrização, campo, força elétrica, potencial e aplicações em materiais e tecnologia.', 240, 'medio', 3),
    ('optica-geometrica', 'Óptica Geométrica', 'Analisar reflexão, refração, espelhos, lentes, formação de imagens e fenômenos ópticos do cotidiano.', 240, 'medio', 4)
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
    ('leis-de-newton', 'forca-resultante-inercia', 'Força resultante e inércia', 'A força resultante explica mudanças de movimento; inércia explica por que corpos resistem a mudanças de estado.', 1),
    ('leis-de-newton', 'acao-reacao-atrito-planos', 'Ação, reação, atrito e planos', 'Pares de interação, forças de contato e decomposição em planos inclinados aparecem em problemas de transporte, esportes e máquinas.', 2),
    ('energia-mecanica', 'energia-cinetica-potencial', 'Energia cinética e potencial', 'Energia mecânica organiza movimento, altura, deformação e velocidade por uma linguagem de transformação.', 1),
    ('energia-mecanica', 'conservacao-trabalho-potencia', 'Conservação, trabalho e potência', 'Sistemas conservativos, perdas por atrito e taxa de transferência de energia resolvem muitos problemas sem equações de movimento.', 2),
    ('eletrostatica', 'cargas-campo-eletrico', 'Cargas e campo elétrico', 'Cargas criam campos; campos explicam forças à distância, eletrização, blindagem e descargas elétricas.', 1),
    ('eletrostatica', 'lei-coulomb-potencial', 'Lei de Coulomb e potencial', 'Força elétrica, energia potencial e diferença de potencial conectam cargas, distância e movimento de portadores.', 2),
    ('optica-geometrica', 'reflexao-espelhos', 'Reflexão e espelhos', 'A reflexão organiza raios, ângulos, espelhos planos e esféricos, com formação de imagens reais e virtuais.', 1),
    ('optica-geometrica', 'refracao-lentes-imagens', 'Refração, lentes e imagens', 'A mudança de meio altera a velocidade da luz e permite lentes, instrumentos ópticos e correção visual.', 2)
)
insert into public.lessons (module_id, slug, title, summary, sort_order, is_active)
select module.id, lesson_seed.lesson_slug, lesson_seed.title, lesson_seed.summary, lesson_seed.sort_order, true
from lesson_seed
join public.subjects subject on subject.slug = 'fisica'
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
  where subject.slug = 'fisica'
    and module.slug in ('leis-de-newton', 'energia-mecanica', 'eletrostatica', 'optica-geometrica')
)
delete from public.lesson_blocks where lesson_id in (select id from seeded_lessons);

with seeded_lessons as (
  select lesson.id
  from public.lessons lesson
  join public.course_modules module on module.id = lesson.module_id
  join public.subjects subject on subject.id = module.subject_id
  where subject.slug = 'fisica'
    and module.slug in ('leis-de-newton', 'energia-mecanica', 'eletrostatica', 'optica-geometrica')
)
delete from public.lesson_exercises where lesson_id in (select id from seeded_lessons);

with block_seed(module_slug, lesson_slug, block_type, title, content, sort_order) as (
  values
    ('leis-de-newton', 'forca-resultante-inercia', 'intro', 'O problema central', 'A dinâmica responde uma pergunta prática: por que um corpo acelera, freia, muda de direção ou permanece em repouso? A resposta não está em uma força isolada, mas na força resultante. Se as forças se equilibram, o estado de movimento não muda. Se há resultante, há aceleração.', 1),
    ('leis-de-newton', 'forca-resultante-inercia', 'theory', 'As três ideias essenciais', 'Primeira lei: sem força resultante, o corpo mantém repouso ou movimento retilíneo uniforme. Segunda lei: a resultante é proporcional à aceleração, F = m.a. Terceira lei: interações acontecem em pares de mesma intensidade e sentidos opostos, em corpos diferentes.', 2),
    ('leis-de-newton', 'forca-resultante-inercia', 'example', 'Exemplo guiado', 'Um carrinho de 4 kg recebe força horizontal de 20 N e atrito de 4 N contrário ao movimento. A resultante é 16 N. Pela segunda lei, a = F/m = 16/4 = 4 m/s². O erro comum seria usar 20 N sem descontar o atrito.', 3),
    ('leis-de-newton', 'forca-resultante-inercia', 'guided_practice', 'Algoritmo seguro', '1. Desenhe o corpo analisado. 2. Liste apenas as forças que atuam nele. 3. Escolha eixos. 4. Some forças em cada eixo. 5. Use F = m.a. 6. Confira unidade e sentido da aceleração.', 4),
    ('leis-de-newton', 'forca-resultante-inercia', 'common_mistake', 'Erro comum', 'Achar que movimento exige força constante. Um corpo pode continuar em movimento sem força resultante, desde que não haja mudança de velocidade. Força resultante explica aceleração, não simplesmente movimento.', 5),
    ('leis-de-newton', 'forca-resultante-inercia', 'review', 'Revisão rápida', 'Sem resultante: velocidade constante. Com resultante: aceleração. Massa mede resistência à aceleração. Ação e reação nunca se anulam no mesmo corpo, pois atuam em corpos diferentes.', 6),

    ('leis-de-newton', 'acao-reacao-atrito-planos', 'intro', 'Forças reais em situações reais', 'Problemas do ENEM raramente mostram corpos ideais. Eles envolvem atrito, normal, tração, peso, rampas, freios, elevadores e contato entre superfícies. O segredo é transformar a cena em forças bem separadas.', 1),
    ('leis-de-newton', 'acao-reacao-atrito-planos', 'theory', 'Atrito, normal e plano inclinado', 'Atrito se opõe à tendência de deslizamento relativo. A normal é perpendicular à superfície. Em plano inclinado, o peso costuma ser decomposto em componente paralela ao plano, que puxa o corpo ladeira abaixo, e componente perpendicular, que influencia a normal.', 2),
    ('leis-de-newton', 'acao-reacao-atrito-planos', 'example', 'Exemplo de ação e reação', 'Quando uma pessoa empurra a parede, a pessoa aplica força na parede e a parede aplica força na pessoa. As forças têm mesma intensidade e sentidos opostos, mas atuam em corpos diferentes. Por isso não se anulam entre si.', 3),
    ('leis-de-newton', 'acao-reacao-atrito-planos', 'guided_practice', 'Roteiro de plano inclinado', '1. Separe o peso em componentes. 2. Identifique sentido provável do movimento. 3. Coloque o atrito contrário à tendência. 4. Some forças paralelas ao plano. 5. Use a normal para calcular atrito quando necessário.', 4),
    ('leis-de-newton', 'acao-reacao-atrito-planos', 'review', 'Resumo operacional', 'Forças de contato dependem da superfície. Atrito não aponta sempre para trás; ele se opõe ao deslizamento relativo. Em rampas, decompor o peso evita decorar fórmulas isoladas.', 5),

    ('energia-mecanica', 'energia-cinetica-potencial', 'intro', 'Energia como contabilidade', 'Energia mecânica permite resolver problemas acompanhando transformações. Em vez de descrever cada instante do movimento, você compara estados: antes, depois e o que foi perdido ou transferido.', 1),
    ('energia-mecanica', 'energia-cinetica-potencial', 'theory', 'Cinética, potencial gravitacional e elástica', 'Energia cinética depende da massa e do quadrado da velocidade. Energia potencial gravitacional depende de massa, gravidade e altura. Energia potencial elástica depende da deformação de molas. A unidade é joule.', 2),
    ('energia-mecanica', 'energia-cinetica-potencial', 'example', 'Queda sem resistência do ar', 'Se um objeto cai sem perdas relevantes, energia potencial gravitacional se transforma em energia cinética. Quanto menor a altura, maior a velocidade. A energia total permanece constante se o sistema for conservativo.', 3),
    ('energia-mecanica', 'energia-cinetica-potencial', 'common_mistake', 'Pegadinha de velocidade', 'Dobrar a velocidade quadruplica a energia cinética, porque v aparece ao quadrado. Essa é uma causa física do aumento grande de danos em colisões em alta velocidade.', 4),
    ('energia-mecanica', 'energia-cinetica-potencial', 'review', 'Revisão rápida', 'Movimento rápido: energia cinética. Altura: energia potencial gravitacional. Mola deformada: energia potencial elástica. Sem perdas, energia mecânica se conserva.', 5),

    ('energia-mecanica', 'conservacao-trabalho-potencia', 'intro', 'Quando a energia muda', 'Trabalho mede transferência de energia por força ao longo de deslocamento. Potência mede a rapidez dessa transferência. Conservação de energia só vale para energia mecânica quando não há forças dissipativas relevantes.', 1),
    ('energia-mecanica', 'conservacao-trabalho-potencia', 'theory', 'Trabalho e potência', 'Trabalho positivo aumenta energia do sistema; trabalho negativo retira energia mecânica. Potência é trabalho por tempo ou energia por tempo. No cotidiano, motores mais potentes realizam a mesma tarefa em menos tempo ou sustentam maior taxa de energia.', 2),
    ('energia-mecanica', 'conservacao-trabalho-potencia', 'example', 'Atrito como dissipação', 'Um bloco deslizando para até parar porque o atrito realiza trabalho negativo. A energia cinética não desaparece: transforma-se principalmente em energia térmica e som.', 3),
    ('energia-mecanica', 'conservacao-trabalho-potencia', 'guided_practice', 'Como escolher o método', 'Se o problema pede força, aceleração e tempo, pense em dinâmica. Se compara alturas, velocidades, molas, perdas e rendimento, energia costuma ser mais direta. Se aparece tempo de funcionamento, inclua potência.', 4),
    ('energia-mecanica', 'conservacao-trabalho-potencia', 'review', 'Resumo final', 'Trabalho transfere energia. Potência é taxa. Atrito dissipa energia mecânica. Conservação é uma comparação entre estados com controle de perdas.', 5),

    ('eletrostatica', 'cargas-campo-eletrico', 'intro', 'Interações sem contato', 'Cargas elétricas interagem à distância. O campo elétrico é a forma de representar a influência que uma carga cria no espaço ao redor. Uma carga colocada nesse campo sofre força.', 1),
    ('eletrostatica', 'cargas-campo-eletrico', 'theory', 'Carga, eletrização e conservação', 'Cargas positivas e negativas se atraem; cargas de mesmo sinal se repelem. Eletrizar não cria carga do nada: redistribui elétrons. Em condutores, cargas se movimentam com facilidade; em isolantes, ficam mais presas.', 2),
    ('eletrostatica', 'cargas-campo-eletrico', 'example', 'Blindagem eletrostática', 'Em equilíbrio eletrostático, o campo elétrico no interior de um condutor é nulo. Por isso, estruturas metálicas podem proteger equipamentos e pessoas de campos externos em certas condições.', 3),
    ('eletrostatica', 'cargas-campo-eletrico', 'common_mistake', 'Erro comum', 'Confundir campo com força. Campo é propriedade do espaço criada por cargas. Força depende do campo e da carga de prova colocada nele.', 4),
    ('eletrostatica', 'cargas-campo-eletrico', 'review', 'Revisão rápida', 'Carga cria campo. Campo age sobre carga. Condutores permitem movimento de elétrons. Eletrização é redistribuição, não criação livre de carga.', 5),

    ('eletrostatica', 'lei-coulomb-potencial', 'intro', 'Quantidade importa', 'A Lei de Coulomb mede a intensidade da força elétrica entre cargas puntiformes. A força cresce com o produto das cargas e diminui com o quadrado da distância.', 1),
    ('eletrostatica', 'lei-coulomb-potencial', 'theory', 'Força, potencial e energia', 'Força elétrica é vetorial e depende do sinal das cargas. Potencial elétrico é uma grandeza escalar associada à energia por unidade de carga. Diferença de potencial move cargas em circuitos e descargas.', 2),
    ('eletrostatica', 'lei-coulomb-potencial', 'example', 'Distância ao quadrado', 'Se a distância entre duas cargas dobra, a força elétrica fica quatro vezes menor. Se a distância cai pela metade, a força fica quatro vezes maior.', 3),
    ('eletrostatica', 'lei-coulomb-potencial', 'guided_practice', 'Roteiro de resolução', '1. Identifique sinais e módulos das cargas. 2. Converta unidades. 3. Aplique a dependência com distância. 4. Defina se a interação é atração ou repulsão. 5. Em sistemas com várias cargas, some vetorialmente.', 4),
    ('eletrostatica', 'lei-coulomb-potencial', 'review', 'Resumo final', 'Coulomb dá força. Campo dá força por carga. Potencial dá energia por carga. Distância aparece ao quadrado na força entre cargas puntiformes.', 5),

    ('optica-geometrica', 'reflexao-espelhos', 'intro', 'Luz como raio', 'Na óptica geométrica, representamos a luz por raios para prever trajetórias, sombras e imagens. Essa aproximação funciona bem quando os objetos são muito maiores que o comprimento de onda da luz.', 1),
    ('optica-geometrica', 'reflexao-espelhos', 'theory', 'Lei da reflexão', 'O raio incidente, o raio refletido e a normal ficam no mesmo plano. O ângulo de incidência é igual ao ângulo de reflexão. Espelhos planos formam imagem virtual, direita e de mesmo tamanho.', 2),
    ('optica-geometrica', 'reflexao-espelhos', 'example', 'Espelhos esféricos', 'Espelhos côncavos podem formar imagens reais ou virtuais dependendo da posição do objeto. Espelhos convexos formam imagens virtuais, direitas e menores, úteis em retrovisores por ampliar o campo de visão.', 3),
    ('optica-geometrica', 'reflexao-espelhos', 'common_mistake', 'Erro comum', 'Confundir imagem real com imagem que parece verdadeira. Imagem real pode ser projetada em anteparo. Imagem virtual é percebida pelo prolongamento dos raios e não se projeta diretamente.', 4),
    ('optica-geometrica', 'reflexao-espelhos', 'review', 'Revisão rápida', 'Reflexão preserva ângulos em relação à normal. Espelho plano gera imagem virtual simétrica. Côncavo pode concentrar raios. Convexo aumenta campo de visão.', 5),

    ('optica-geometrica', 'refracao-lentes-imagens', 'intro', 'Quando a luz muda de meio', 'Refração acontece quando a luz passa de um meio para outro e muda sua velocidade. Essa mudança pode alterar a direção do raio, permitindo lentes, prismas e fenômenos como miragens.', 1),
    ('optica-geometrica', 'refracao-lentes-imagens', 'theory', 'Índice de refração e lentes', 'O índice de refração indica quanto a luz reduz sua velocidade em um meio. Lentes convergentes podem concentrar raios; lentes divergentes espalham raios. A formação da imagem depende da posição do objeto e do foco.', 2),
    ('optica-geometrica', 'refracao-lentes-imagens', 'example', 'Correção visual', 'Miopia costuma ser corrigida com lente divergente, que ajusta o foco para a retina. Hipermetropia costuma usar lente convergente. A óptica conecta geometria de raios com saúde visual.', 3),
    ('optica-geometrica', 'refracao-lentes-imagens', 'guided_practice', 'Roteiro de lentes', '1. Identifique se a lente é convergente ou divergente. 2. Localize objeto, foco e centro óptico. 3. Trace raios principais. 4. Veja se os raios se cruzam ou se seus prolongamentos se cruzam. 5. Classifique a imagem.', 4),
    ('optica-geometrica', 'refracao-lentes-imagens', 'review', 'Resumo final', 'Refração muda velocidade e pode mudar direção. Lentes convergentes juntam raios. Lentes divergentes espalham raios. Imagens reais projetam; virtuais são vistas por prolongamento.', 5)
)
insert into public.lesson_blocks (lesson_id, block_type, title, content, sort_order)
select lesson.id, block_seed.block_type, block_seed.title, block_seed.content, block_seed.sort_order
from block_seed
join public.subjects subject on subject.slug = 'fisica'
join public.course_modules module on module.subject_id = subject.id and module.slug = block_seed.module_slug
join public.lessons lesson on lesson.module_id = module.id and lesson.slug = block_seed.lesson_slug;

with exercise_seed(module_slug, lesson_slug, question, exercise_type, choices, correct_answer, explanation, difficulty, sort_order) as (
  values
    ('leis-de-newton', 'forca-resultante-inercia', 'Um corpo de 5 kg sofre força resultante de 20 N. Qual é sua aceleração?', 'multiple_choice', '["2 m/s²", "4 m/s²", "10 m/s²", "15 m/s²", "25 m/s²"]'::jsonb, 'B', 'Pela segunda lei de Newton, a = F/m = 20/5 = 4 m/s².', 'facil', 1),
    ('leis-de-newton', 'forca-resultante-inercia', 'Explique por que um corpo pode continuar em movimento mesmo sem força resultante.', 'open', '[]'::jsonb, 'Porque, pela inércia, sem força resultante o corpo mantém seu estado de movimento, inclusive movimento retilíneo uniforme.', 'A resposta deve mencionar inércia e ausência de aceleração quando a resultante é nula.', 'medio', 2),

    ('leis-de-newton', 'acao-reacao-atrito-planos', 'Em um par ação e reação, as forças:', 'multiple_choice', '["atuam no mesmo corpo e se anulam.", "atuam em corpos diferentes e têm mesma intensidade.", "sempre apontam para cima.", "existem apenas quando há movimento.", "dependem da massa do corpo menor."]'::jsonb, 'B', 'Ação e reação têm mesma intensidade, sentidos opostos e atuam em corpos diferentes.', 'facil', 1),
    ('leis-de-newton', 'acao-reacao-atrito-planos', 'Por que o atrito não aponta sempre no sentido contrário ao movimento absoluto?', 'open', '[]'::jsonb, 'Porque o atrito se opõe à tendência de deslizamento relativo entre superfícies, não necessariamente ao movimento em relação ao solo.', 'O ponto central é a tendência de movimento relativo entre as superfícies em contato.', 'dificil', 2),

    ('energia-mecanica', 'energia-cinetica-potencial', 'Se a velocidade de um carro dobra, sua energia cinética:', 'multiple_choice', '["dobra.", "fica quatro vezes maior.", "fica pela metade.", "não muda.", "fica oito vezes maior."]'::jsonb, 'B', 'Energia cinética depende de v², então dobrar v multiplica a energia por 4.', 'facil', 1),
    ('energia-mecanica', 'energia-cinetica-potencial', 'Em uma queda sem resistência do ar, que transformação de energia ocorre?', 'open', '[]'::jsonb, 'Energia potencial gravitacional se transforma em energia cinética, mantendo a energia mecânica total constante.', 'A resposta deve mencionar transformação entre potencial gravitacional e cinética.', 'medio', 2),

    ('energia-mecanica', 'conservacao-trabalho-potencia', 'Potência mede:', 'multiple_choice', '["energia total armazenada.", "força dividida pela massa.", "taxa de transferência de energia.", "altura por unidade de massa.", "velocidade ao quadrado."]'::jsonb, 'C', 'Potência é energia ou trabalho por unidade de tempo.', 'facil', 1),
    ('energia-mecanica', 'conservacao-trabalho-potencia', 'Explique por que o atrito pode reduzir a energia mecânica de um sistema.', 'open', '[]'::jsonb, 'Porque o atrito realiza trabalho negativo e transforma parte da energia mecânica em energia térmica e som.', 'A explicação deve envolver dissipação e transformação de energia.', 'medio', 2),

    ('eletrostatica', 'cargas-campo-eletrico', 'Cargas de mesmo sinal:', 'multiple_choice', '["atraem-se.", "repelem-se.", "não interagem.", "viram neutras automaticamente.", "sempre entram em curto-circuito."]'::jsonb, 'B', 'Cargas de mesmo sinal se repelem; cargas de sinais opostos se atraem.', 'facil', 1),
    ('eletrostatica', 'cargas-campo-eletrico', 'Diferencie campo elétrico e força elétrica.', 'open', '[]'::jsonb, 'Campo elétrico é a influência no espaço criada por cargas; força elétrica é a ação sofrida por uma carga colocada nesse campo.', 'A resposta deve separar propriedade do espaço e força sobre uma carga.', 'medio', 2),

    ('eletrostatica', 'lei-coulomb-potencial', 'Se a distância entre duas cargas dobra, a força elétrica fica:', 'multiple_choice', '["duas vezes maior.", "duas vezes menor.", "quatro vezes menor.", "quatro vezes maior.", "igual."]'::jsonb, 'C', 'Pela Lei de Coulomb, a força é inversamente proporcional ao quadrado da distância.', 'facil', 1),
    ('eletrostatica', 'lei-coulomb-potencial', 'O que significa dizer que a diferença de potencial move cargas?', 'open', '[]'::jsonb, 'Significa que há energia por unidade de carga disponível para orientar o movimento de cargas entre dois pontos.', 'A resposta deve relacionar potencial elétrico com energia por carga.', 'dificil', 2),

    ('optica-geometrica', 'reflexao-espelhos', 'Na reflexão regular, o ângulo de incidência é:', 'multiple_choice', '["maior que o de reflexão.", "menor que o de reflexão.", "igual ao de reflexão.", "sempre zero.", "igual ao dobro do de reflexão."]'::jsonb, 'C', 'A lei da reflexão afirma que os ângulos de incidência e reflexão são iguais em relação à normal.', 'facil', 1),
    ('optica-geometrica', 'reflexao-espelhos', 'Explique a diferença entre imagem real e imagem virtual.', 'open', '[]'::jsonb, 'Imagem real pode ser projetada em anteparo; imagem virtual é formada pelo prolongamento dos raios e não se projeta diretamente.', 'A resposta deve mencionar projeção em anteparo.', 'medio', 2),

    ('optica-geometrica', 'refracao-lentes-imagens', 'Refração ocorre quando a luz:', 'multiple_choice', '["volta ao mesmo meio sem mudar velocidade.", "muda de meio e altera sua velocidade.", "é sempre absorvida.", "deixa de ser onda.", "vira carga elétrica."]'::jsonb, 'B', 'Refração envolve mudança de meio e mudança de velocidade da luz.', 'facil', 1),
    ('optica-geometrica', 'refracao-lentes-imagens', 'Por que lentes são úteis para corrigir problemas de visão?', 'open', '[]'::jsonb, 'Porque desviam os raios de luz para ajustar a formação da imagem na retina.', 'A resposta deve ligar refração, desvio de raios e foco na retina.', 'medio', 2)
)
insert into public.lesson_exercises (lesson_id, question, exercise_type, choices, correct_answer, explanation, difficulty, sort_order)
select lesson.id, exercise_seed.question, exercise_seed.exercise_type, exercise_seed.choices, exercise_seed.correct_answer, exercise_seed.explanation, exercise_seed.difficulty, exercise_seed.sort_order
from exercise_seed
join public.subjects subject on subject.slug = 'fisica'
join public.course_modules module on module.subject_id = subject.id and module.slug = exercise_seed.module_slug
join public.lessons lesson on lesson.module_id = module.id and lesson.slug = exercise_seed.lesson_slug;

with seeded_lessons as (
  select lesson.id
  from public.lessons lesson
  join public.course_modules module on module.id = lesson.module_id
  join public.subjects subject on subject.id = module.subject_id
  where subject.slug = 'fisica'
    and module.slug in ('leis-de-newton', 'energia-mecanica', 'eletrostatica', 'optica-geometrica')
)
delete from public.lesson_sources where lesson_id in (select id from seeded_lessons);

with source_seed(module_slug, lesson_slug, title, url, license, attribution, notes) as (
  values
    ('leis-de-newton', 'forca-resultante-inercia', 'OpenStax College Physics 2e - Dynamics', 'https://openstax.org/details/books/college-physics-2e', 'CC BY', 'OpenStax', 'Referência aberta para leis de Newton, força, atrito e dinâmica.'),
    ('energia-mecanica', 'energia-cinetica-potencial', 'OpenStax College Physics 2e - Work, Energy, and Energy Resources', 'https://openstax.org/details/books/college-physics-2e', 'CC BY', 'OpenStax', 'Referência aberta para energia, trabalho e potência.'),
    ('eletrostatica', 'cargas-campo-eletrico', 'OpenStax College Physics 2e - Electric Charge and Electric Field', 'https://openstax.org/details/books/college-physics-2e', 'CC BY', 'OpenStax', 'Referência aberta para carga, campo elétrico e eletrostática.'),
    ('optica-geometrica', 'reflexao-espelhos', 'OpenStax College Physics 2e - Geometric Optics', 'https://openstax.org/details/books/college-physics-2e', 'CC BY', 'OpenStax', 'Referência aberta para reflexão, refração, espelhos e lentes.')
)
insert into public.lesson_sources (lesson_id, title, url, license, attribution, notes)
select lesson.id, source_seed.title, source_seed.url, source_seed.license, source_seed.attribution, source_seed.notes
from source_seed
join public.subjects subject on subject.slug = 'fisica'
join public.course_modules module on module.subject_id = subject.id and module.slug = source_seed.module_slug
join public.lessons lesson on lesson.module_id = module.id and lesson.slug = source_seed.lesson_slug;

commit;
