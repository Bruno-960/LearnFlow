-- LearnFlow - Biology course content seed
-- Run this after supabase-content-schema.sql in the Supabase SQL Editor.
-- Idempotent for the listed Biology modules.

begin;

insert into public.subjects (slug, name, subtitle, icon, sort_order, is_active)
values ('biologia', 'Biologia', 'Vida, sistemas e evolução', 'dna', 5, true)
on conflict (slug) do update set
  name = excluded.name,
  subtitle = excluded.subtitle,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

with subject as (
  select id from public.subjects where slug = 'biologia'
),
module_seed(slug, title, objective, estimated_minutes, level, sort_order) as (
  values
    ('evolucao', 'Evolução', 'Compreender variabilidade, seleção natural, adaptação, especiação e evidências evolutivas.', 240, 'medio', 1),
    ('citologia', 'Citologia', 'Estudar célula, membrana, organelas, metabolismo e diferenças entre procariontes e eucariontes.', 260, 'medio', 2),
    ('genetica', 'Genética', 'Relacionar DNA, genes, cromossomos, herança mendeliana, mutações e biotecnologia.', 260, 'medio', 3),
    ('ecologia', 'Ecologia', 'Analisar populações, comunidades, fluxo de energia, ciclos biogeoquímicos e impactos ambientais.', 260, 'medio', 4)
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
    ('evolucao', 'selecao-natural-adaptacao', 'Seleção natural e adaptação', 'A evolução acontece em populações quando variações hereditárias são filtradas pelo ambiente ao longo das gerações.', 1),
    ('evolucao', 'especiacao-evidencias', 'Especiação e evidências evolutivas', 'Isolamento, divergência genética e evidências como fósseis, homologia e DNA sustentam a ancestralidade comum.', 2),
    ('citologia', 'celula-membrana-organelas', 'Célula, membrana e organelas', 'A célula integra barreira seletiva, informação genética, produção de energia e síntese de moléculas.', 1),
    ('citologia', 'metabolismo-celular', 'Metabolismo celular', 'Respiração, fotossíntese e síntese proteica conectam energia, matéria e informação nos seres vivos.', 2),
    ('genetica', 'dna-gene-cromossomo', 'DNA, gene e cromossomo', 'A informação hereditária está organizada no DNA, distribuída em genes e cromossomos.', 1),
    ('genetica', 'heranca-mendeliana-mutacoes', 'Herança mendeliana e mutações', 'Cruzamentos, alelos, dominância, segregação e mutações explicam padrões hereditários e variabilidade.', 2),
    ('ecologia', 'populacoes-comunidades', 'Populações e comunidades', 'Relações ecológicas, nicho, habitat e dinâmica populacional estruturam os ecossistemas.', 1),
    ('ecologia', 'energia-ciclos-impactos', 'Energia, ciclos e impactos ambientais', 'Fluxo de energia, ciclos da matéria e ações humanas explicam equilíbrio e desequilíbrio ambiental.', 2)
)
insert into public.lessons (module_id, slug, title, summary, sort_order, is_active)
select module.id, lesson_seed.lesson_slug, lesson_seed.title, lesson_seed.summary, lesson_seed.sort_order, true
from lesson_seed
join public.subjects subject on subject.slug = 'biologia'
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
  where subject.slug = 'biologia'
    and module.slug in ('evolucao', 'citologia', 'genetica', 'ecologia')
)
delete from public.lesson_blocks where lesson_id in (select id from seeded_lessons);

with seeded_lessons as (
  select lesson.id
  from public.lessons lesson
  join public.course_modules module on module.id = lesson.module_id
  join public.subjects subject on subject.id = module.subject_id
  where subject.slug = 'biologia'
    and module.slug in ('evolucao', 'citologia', 'genetica', 'ecologia')
)
delete from public.lesson_exercises where lesson_id in (select id from seeded_lessons);

with block_seed(module_slug, lesson_slug, block_type, title, content, sort_order) as (
  values
    ('evolucao', 'selecao-natural-adaptacao', 'intro', 'A lógica da evolução', 'Evolução é mudança nas características hereditárias de populações ao longo das gerações. Indivíduos não evoluem biologicamente durante a vida; populações mudam quando a frequência de características herdáveis se altera.', 1),
    ('evolucao', 'selecao-natural-adaptacao', 'theory', 'Variação e seleção', 'A variabilidade genética surge por mutações, recombinação e reprodução sexuada. O ambiente não cria características porque o organismo precisa; ele favorece indivíduos que já possuem variações úteis em determinada condição.', 2),
    ('evolucao', 'selecao-natural-adaptacao', 'example', 'Resistência bacteriana', 'Quando um antibiótico é usado, bactérias sensíveis morrem com maior frequência. Se algumas bactérias já possuem resistência, elas sobrevivem e deixam mais descendentes. A população passa a ter maior proporção de resistentes.', 3),
    ('evolucao', 'selecao-natural-adaptacao', 'common_mistake', 'Erro comum', 'Dizer que o ser vivo se adapta porque quer ou porque precisa. A seleção natural não tem intenção. Ela aumenta a frequência de variações hereditárias que favorecem sobrevivência ou reprodução.', 4),
    ('evolucao', 'selecao-natural-adaptacao', 'review', 'Revisão rápida', 'Variabilidade é matéria-prima. Seleção natural é filtro ambiental. Adaptação é resultado populacional. Evolução exige herança, reprodução diferencial e tempo.', 5),

    ('evolucao', 'especiacao-evidencias', 'intro', 'Como surgem espécies', 'Especiação ocorre quando populações acumulam diferenças suficientes para reduzir ou impedir cruzamentos férteis. O isolamento pode ser geográfico, ecológico, comportamental ou reprodutivo.', 1),
    ('evolucao', 'especiacao-evidencias', 'theory', 'Evidências evolutivas', 'Fósseis mostram formas antigas e transições. Estruturas homólogas indicam ancestralidade comum. Comparações de DNA mostram grau de parentesco. Biogeografia explica distribuição de grupos conforme história geológica e isolamento.', 2),
    ('evolucao', 'especiacao-evidencias', 'example', 'Homologia e analogia', 'Braço humano, asa de morcego e nadadeira de baleia são estruturas homólogas, pois têm origem comum. Asa de inseto e asa de ave são análogas, pois têm função semelhante, mas origens diferentes.', 3),
    ('evolucao', 'especiacao-evidencias', 'guided_practice', 'Roteiro de interpretação', '1. Procure se a questão fala em origem comum. 2. Separe função semelhante de ancestralidade comum. 3. Use fósseis, DNA e anatomia como evidências. 4. Evite explicações finalistas.', 4),
    ('evolucao', 'especiacao-evidencias', 'review', 'Resumo final', 'Espécies surgem por isolamento e divergência. Homologia aponta parentesco. Analogia aponta convergência. DNA é uma evidência forte de ancestralidade comum.', 5),

    ('citologia', 'celula-membrana-organelas', 'intro', 'Célula como sistema vivo', 'A célula é a unidade estrutural e funcional da vida. Ela delimita um ambiente interno, processa energia, sintetiza moléculas, guarda informação genética e responde ao meio.', 1),
    ('citologia', 'celula-membrana-organelas', 'theory', 'Membrana plasmática', 'A membrana plasmática é uma bicamada lipídica com proteínas. Ela é seletiva: controla entrada e saída de substâncias. Difusão e osmose são transportes passivos; transporte ativo exige energia.', 2),
    ('citologia', 'celula-membrana-organelas', 'example', 'Organelas e funções', 'Mitocôndrias participam da respiração celular. Ribossomos sintetizam proteínas. Retículo e complexo golgiense modificam e transportam substâncias. Cloroplastos realizam fotossíntese em plantas e algas.', 3),
    ('citologia', 'celula-membrana-organelas', 'common_mistake', 'Pegadinha', 'Não confunda célula procariótica com célula simples sem organização. Procariontes não têm núcleo delimitado, mas possuem metabolismo, ribossomos, DNA e membrana.', 4),
    ('citologia', 'celula-membrana-organelas', 'review', 'Revisão rápida', 'Membrana controla trocas. Núcleo organiza DNA em eucariontes. Mitocôndria produz ATP. Ribossomo produz proteína. Cloroplasto realiza fotossíntese.', 5),

    ('citologia', 'metabolismo-celular', 'intro', 'Energia na célula', 'Metabolismo é o conjunto de reações químicas da célula. Ele inclui síntese, degradação, transformação de energia e produção de moléculas necessárias à vida.', 1),
    ('citologia', 'metabolismo-celular', 'theory', 'Respiração e fotossíntese', 'Na respiração celular, moléculas orgânicas são degradadas para produção de ATP. Na fotossíntese, energia luminosa é usada para formar matéria orgânica a partir de CO2 e água.', 2),
    ('citologia', 'metabolismo-celular', 'example', 'ATP como moeda energética', 'ATP funciona como intermediário de energia. A célula não usa glicose diretamente em todas as tarefas; ela transfere energia para ATP e depois usa ATP em transporte ativo, movimento e síntese.', 3),
    ('citologia', 'metabolismo-celular', 'guided_practice', 'Comparação segura', 'Fotossíntese armazena energia em moléculas orgânicas. Respiração libera energia dessas moléculas para formar ATP. Os processos se conectam nos ciclos de matéria e energia dos ecossistemas.', 4),
    ('citologia', 'metabolismo-celular', 'review', 'Resumo final', 'Metabolismo integra matéria, energia e enzimas. ATP transfere energia. Mitocôndria participa da respiração. Cloroplasto participa da fotossíntese.', 5),

    ('genetica', 'dna-gene-cromossomo', 'intro', 'Informação hereditária', 'DNA é a molécula que armazena informação genética. Genes são trechos de DNA relacionados à produção de moléculas funcionais. Cromossomos são estruturas que organizam o DNA na célula.', 1),
    ('genetica', 'dna-gene-cromossomo', 'theory', 'Do DNA ao fenótipo', 'A sequência de bases no DNA pode orientar a produção de RNA e proteínas. Proteínas influenciam características observáveis, mas o fenótipo também depende do ambiente e de interações entre genes.', 2),
    ('genetica', 'dna-gene-cromossomo', 'example', 'Genótipo e fenótipo', 'Genótipo é a constituição genética. Fenótipo é a característica observável, resultante da interação entre genótipo e ambiente. Dois indivíduos com o mesmo genótipo podem ter diferenças fenotípicas por influência ambiental.', 3),
    ('genetica', 'dna-gene-cromossomo', 'common_mistake', 'Erro comum', 'Achar que um gene sempre determina sozinho uma característica complexa. Muitas características dependem de vários genes e do ambiente.', 4),
    ('genetica', 'dna-gene-cromossomo', 'review', 'Revisão rápida', 'DNA guarda informação. Gene é trecho funcional. Cromossomo organiza DNA. Proteínas executam muitas funções celulares. Fenótipo não é apenas genótipo.', 5),

    ('genetica', 'heranca-mendeliana-mutacoes', 'intro', 'Padrões de herança', 'Mendel observou padrões de transmissão de características. A segregação dos alelos ajuda a prever proporções em cruzamentos simples, mas nem toda herança segue dominância completa.', 1),
    ('genetica', 'heranca-mendeliana-mutacoes', 'theory', 'Alelos e segregação', 'Alelos são versões de um gene. Em organismos diploides, cada indivíduo possui dois alelos para muitos genes, um herdado de cada progenitor. Durante a formação de gametas, esses alelos se separam.', 2),
    ('genetica', 'heranca-mendeliana-mutacoes', 'example', 'Cruzamento simples', 'Em um cruzamento Aa x Aa, os genótipos esperados são AA, Aa, Aa e aa. Em dominância completa, a proporção fenotípica costuma ser 3:1.', 3),
    ('genetica', 'heranca-mendeliana-mutacoes', 'common_mistake', 'Pegadinha', 'Dominante não significa mais forte, melhor ou mais frequente. Significa apenas que o alelo se expressa no heterozigoto em determinado padrão de herança.', 4),
    ('genetica', 'heranca-mendeliana-mutacoes', 'review', 'Resumo final', 'Alelos segregam na formação dos gametas. Cruzamentos estimam probabilidades. Mutações criam novas variações. Herança real pode envolver codominância, genes ligados e múltiplos fatores.', 5),

    ('ecologia', 'populacoes-comunidades', 'intro', 'Níveis ecológicos', 'Ecologia estuda relações entre seres vivos e ambiente. Organismo, população, comunidade, ecossistema e biosfera são níveis de organização usados para interpretar fenômenos ambientais.', 1),
    ('ecologia', 'populacoes-comunidades', 'theory', 'Relações ecológicas', 'Relações podem ser intraespecíficas ou interespecíficas, harmônicas ou desarmônicas. Competição, predação, parasitismo, mutualismo e comensalismo afetam sobrevivência, reprodução e equilíbrio das comunidades.', 2),
    ('ecologia', 'populacoes-comunidades', 'example', 'Nicho e habitat', 'Habitat é onde a espécie vive. Nicho ecológico é seu modo de vida: alimento, papel no ecossistema, período de atividade, relações e uso de recursos.', 3),
    ('ecologia', 'populacoes-comunidades', 'common_mistake', 'Erro comum', 'Confundir habitat com nicho. Habitat é endereço. Nicho é função ecológica e estratégia de vida.', 4),
    ('ecologia', 'populacoes-comunidades', 'review', 'Revisão rápida', 'População reúne indivíduos da mesma espécie. Comunidade reúne populações. Ecossistema inclui fatores bióticos e abióticos. Nicho não é apenas lugar.', 5),

    ('ecologia', 'energia-ciclos-impactos', 'intro', 'Energia flui, matéria cicla', 'Nos ecossistemas, energia entra principalmente pela fotossíntese e flui pelas cadeias alimentares. A matéria circula em ciclos como carbono, nitrogênio e água.', 1),
    ('ecologia', 'energia-ciclos-impactos', 'theory', 'Cadeias e pirâmides', 'Produtores transformam energia luminosa em matéria orgânica. Consumidores transferem energia ao se alimentar. Decompositores reciclam matéria. A cada nível trófico, parte da energia é dissipada como calor.', 2),
    ('ecologia', 'energia-ciclos-impactos', 'example', 'Impactos humanos', 'Desmatamento, poluição, queimadas, mudanças climáticas, eutrofização e introdução de espécies invasoras alteram ciclos, cadeias e equilíbrio populacional.', 3),
    ('ecologia', 'energia-ciclos-impactos', 'guided_practice', 'Como analisar uma questão ambiental', '1. Identifique o fator alterado. 2. Veja qual ciclo ou relação ecológica foi afetado. 3. Siga consequências diretas e indiretas. 4. Relacione com saúde, economia e biodiversidade.', 4),
    ('ecologia', 'energia-ciclos-impactos', 'review', 'Resumo final', 'Energia flui em sentido único e diminui nos níveis tróficos. Matéria cicla. Decompositores fecham ciclos. Impactos humanos podem romper equilíbrios ecológicos.', 5)
)
insert into public.lesson_blocks (lesson_id, block_type, title, content, sort_order)
select lesson.id, block_seed.block_type, block_seed.title, block_seed.content, block_seed.sort_order
from block_seed
join public.subjects subject on subject.slug = 'biologia'
join public.course_modules module on module.subject_id = subject.id and module.slug = block_seed.module_slug
join public.lessons lesson on lesson.module_id = module.id and lesson.slug = block_seed.lesson_slug;

with exercise_seed(module_slug, lesson_slug, question, exercise_type, choices, correct_answer, explanation, difficulty, sort_order) as (
  values
    ('evolucao', 'selecao-natural-adaptacao', 'A seleção natural atua principalmente sobre:', 'multiple_choice', '["necessidades individuais", "variações hereditárias", "órgãos isolados", "vontade do organismo", "características adquiridas sempre herdáveis"]'::jsonb, 'B', 'A seleção natural favorece variações hereditárias que aumentam sobrevivência ou reprodução em determinado ambiente.', 'facil', 1),
    ('evolucao', 'selecao-natural-adaptacao', 'Explique resistência bacteriana usando seleção natural.', 'open', '[]'::jsonb, 'Bactérias resistentes já existem por variação genética. O antibiótico elimina mais sensíveis, e resistentes sobrevivem e se reproduzem.', 'A resposta precisa mencionar variação prévia, sobrevivência diferencial e reprodução.', 'medio', 2),
    ('evolucao', 'especiacao-evidencias', 'Estruturas homólogas indicam:', 'multiple_choice', '["mesma função sempre", "ancestralidade comum", "ausência de evolução", "mesmo ambiente atual", "criação de órgãos por necessidade"]'::jsonb, 'B', 'Homologia indica origem evolutiva comum, mesmo quando a função atual é diferente.', 'facil', 1),
    ('evolucao', 'especiacao-evidencias', 'Diferencie homologia e analogia.', 'open', '[]'::jsonb, 'Homologia envolve origem comum; analogia envolve função semelhante com origem evolutiva diferente.', 'Essa distinção é central em evidências evolutivas.', 'medio', 2),

    ('citologia', 'celula-membrana-organelas', 'Transporte ativo pela membrana:', 'multiple_choice', '["não gasta energia", "ocorre sempre a favor do gradiente", "pode ocorrer contra o gradiente com gasto de energia", "só acontece em vírus", "dispensa proteínas"]'::jsonb, 'C', 'Transporte ativo pode mover substâncias contra o gradiente e exige energia.', 'facil', 1),
    ('citologia', 'celula-membrana-organelas', 'Relacione mitocôndria, ribossomo e cloroplasto às suas funções.', 'open', '[]'::jsonb, 'Mitocôndria participa da produção de ATP; ribossomo sintetiza proteínas; cloroplasto realiza fotossíntese.', 'A resposta deve associar cada organela à função correta.', 'medio', 2),
    ('citologia', 'metabolismo-celular', 'ATP é importante porque:', 'multiple_choice', '["é a única molécula com carbono", "atua como intermediário de energia celular", "substitui o DNA", "forma a membrana sozinho", "impede toda reação química"]'::jsonb, 'B', 'ATP transfere energia para processos celulares.', 'facil', 1),
    ('citologia', 'metabolismo-celular', 'Compare respiração celular e fotossíntese.', 'open', '[]'::jsonb, 'Fotossíntese armazena energia em matéria orgânica; respiração libera energia da matéria orgânica para formar ATP.', 'A comparação deve envolver energia, matéria orgânica e ATP.', 'medio', 2),

    ('genetica', 'dna-gene-cromossomo', 'Gene é melhor definido como:', 'multiple_choice', '["qualquer proteína pronta", "um trecho funcional de DNA", "uma célula inteira", "um órgão hereditário", "uma característica adquirida"]'::jsonb, 'B', 'Gene é um trecho de DNA relacionado a produto funcional.', 'facil', 1),
    ('genetica', 'dna-gene-cromossomo', 'Explique por que fenótipo não é apenas genótipo.', 'open', '[]'::jsonb, 'Porque o fenótipo resulta da interação entre genótipo, ambiente e outros fatores biológicos.', 'A resposta deve mencionar interação com ambiente.', 'medio', 2),
    ('genetica', 'heranca-mendeliana-mutacoes', 'Em dominância completa, cruzamento Aa x Aa tende a gerar proporção fenotípica:', 'multiple_choice', '["1:1", "2:1", "3:1", "4:0 sempre recessiva", "1:2:1 fenotípica sempre"]'::jsonb, 'C', 'Em dominância completa, Aa expressa o fenótipo dominante, gerando 3 dominantes para 1 recessivo.', 'medio', 1),
    ('genetica', 'heranca-mendeliana-mutacoes', 'Por que dominante não significa mais frequente?', 'open', '[]'::jsonb, 'Porque dominância descreve expressão no heterozigoto, não frequência do alelo na população.', 'A resposta deve separar expressão genética de frequência populacional.', 'dificil', 2),

    ('ecologia', 'populacoes-comunidades', 'Habitat é:', 'multiple_choice', '["a função ecológica de uma espécie", "o local onde a espécie vive", "uma relação de predação", "um ciclo químico", "um nível trófico sempre final"]'::jsonb, 'B', 'Habitat é o local de vida; nicho é o modo de vida e função ecológica.', 'facil', 1),
    ('ecologia', 'populacoes-comunidades', 'Diferencie população e comunidade.', 'open', '[]'::jsonb, 'População reúne indivíduos da mesma espécie em uma área; comunidade reúne populações de diferentes espécies.', 'A resposta deve destacar mesma espécie versus várias espécies.', 'medio', 2),
    ('ecologia', 'energia-ciclos-impactos', 'Em uma cadeia alimentar, a energia:', 'multiple_choice', '["cicla completamente sem perdas", "flui e diminui nos níveis tróficos", "aumenta sempre no topo", "não depende de produtores", "é criada pelos decompositores"]'::jsonb, 'B', 'A energia flui em sentido único e parte é dissipada como calor em cada transferência.', 'facil', 1),
    ('ecologia', 'energia-ciclos-impactos', 'Explique a importância dos decompositores.', 'open', '[]'::jsonb, 'Decompositores reciclam matéria, devolvendo nutrientes ao ambiente e fechando ciclos biogeoquímicos.', 'A resposta deve mencionar reciclagem de nutrientes e ciclos da matéria.', 'medio', 2)
)
insert into public.lesson_exercises (lesson_id, question, exercise_type, choices, correct_answer, explanation, difficulty, sort_order)
select lesson.id, exercise_seed.question, exercise_seed.exercise_type, exercise_seed.choices, exercise_seed.correct_answer, exercise_seed.explanation, exercise_seed.difficulty, exercise_seed.sort_order
from exercise_seed
join public.subjects subject on subject.slug = 'biologia'
join public.course_modules module on module.subject_id = subject.id and module.slug = exercise_seed.module_slug
join public.lessons lesson on lesson.module_id = module.id and lesson.slug = exercise_seed.lesson_slug;

with seeded_lessons as (
  select lesson.id
  from public.lessons lesson
  join public.course_modules module on module.id = lesson.module_id
  join public.subjects subject on subject.id = module.subject_id
  where subject.slug = 'biologia'
    and module.slug in ('evolucao', 'citologia', 'genetica', 'ecologia')
)
delete from public.lesson_sources where lesson_id in (select id from seeded_lessons);

with source_seed(module_slug, lesson_slug, title, url, license, attribution, notes) as (
  values
    ('evolucao', 'selecao-natural-adaptacao', 'OpenStax Biology 2e - Evolution and the Origin of Species', 'https://openstax.org/details/books/biology-2e', 'CC BY', 'OpenStax', 'Referência aberta para evolução, seleção natural e especiação.'),
    ('citologia', 'celula-membrana-organelas', 'OpenStax Biology 2e - Cell Structure', 'https://openstax.org/details/books/biology-2e', 'CC BY', 'OpenStax', 'Referência aberta para estrutura celular, membrana e organelas.'),
    ('genetica', 'dna-gene-cromossomo', 'OpenStax Biology 2e - Genetics', 'https://openstax.org/details/books/biology-2e', 'CC BY', 'OpenStax', 'Referência aberta para genética, DNA e herança.'),
    ('ecologia', 'energia-ciclos-impactos', 'OpenStax Biology 2e - Ecology', 'https://openstax.org/details/books/biology-2e', 'CC BY', 'OpenStax', 'Referência aberta para ecologia, energia e ciclos da matéria.')
)
insert into public.lesson_sources (lesson_id, title, url, license, attribution, notes)
select lesson.id, source_seed.title, source_seed.url, source_seed.license, source_seed.attribution, source_seed.notes
from source_seed
join public.subjects subject on subject.slug = 'biologia'
join public.course_modules module on module.subject_id = subject.id and module.slug = source_seed.module_slug
join public.lessons lesson on lesson.module_id = module.id and lesson.slug = source_seed.lesson_slug;

commit;
