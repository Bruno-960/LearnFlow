-- LearnFlow - Portuguese course content seed
-- Run this after supabase-content-schema.sql in the Supabase SQL Editor.
-- Idempotent for the listed Portuguese modules.

begin;

insert into public.subjects (slug, name, subtitle, icon, sort_order, is_active)
values ('portugues', 'Português', 'Gramática, leitura e escrita', 'book-open', 1, true)
on conflict (slug) do update set
  name = excluded.name,
  subtitle = excluded.subtitle,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

with subject as (
  select id from public.subjects where slug = 'portugues'
),
module_seed(slug, title, objective, estimated_minutes, level, sort_order) as (
  values
    ('morfologia', 'Morfologia', 'Dominar classes de palavras, flexões, formação de palavras e o papel do contexto na classificação gramatical.', 260, 'medio', 1),
    ('sintaxe', 'Sintaxe', 'Analisar funções sintáticas, oração, período, concordância, regência, pontuação e efeitos de sentido.', 320, 'medio', 2),
    ('redacao-enem', 'Redação ENEM', 'Construir texto dissertativo-argumentativo com tese, argumentos, repertório, coesão e proposta de intervenção.', 360, 'avancado', 3),
    ('interpretacao-texto', 'Interpretação de Texto', 'Ler textos verbais e multimodais por tema, tese, inferência, conectivos, tom, intenção e efeito de sentido.', 300, 'medio', 4)
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
    ('morfologia', 'classes-palavras-contexto', 'Classes de palavras e contexto', 'A classificação gramatical depende da palavra e da função que ela assume no enunciado.', 1),
    ('morfologia', 'formacao-flexao-palavras', 'Formação e flexão de palavras', 'Prefixos, sufixos, gênero, número, tempo, modo e pessoa alteram sentido e funcionamento textual.', 2),
    ('sintaxe', 'termos-essenciais-integrantes', 'Termos essenciais e integrantes', 'Sujeito, predicado, complementos verbais e nominais organizam a estrutura da oração.', 1),
    ('sintaxe', 'concordancia-regencia-pontuacao', 'Concordância, regência e pontuação', 'Relações sintáticas orientam clareza, norma-padrão e efeitos de sentido.', 2),
    ('redacao-enem', 'tese-projeto-texto', 'Tese e projeto de texto', 'A redação começa com compreensão do tema, recorte, tese e planejamento argumentativo.', 1),
    ('redacao-enem', 'argumentacao-intervencao', 'Argumentação e intervenção', 'Argumentos precisam de evidência, explicação, repertório produtivo e proposta completa.', 2),
    ('interpretacao-texto', 'tema-tese-inferencia', 'Tema, tese e inferência', 'Interpretar é separar informação explícita, ideia central e sentidos implícitos.', 1),
    ('interpretacao-texto', 'multimodalidade-generos', 'Multimodalidade e gêneros', 'Textos atuais combinam linguagem verbal, visual, dados, suporte, público e finalidade.', 2)
)
insert into public.lessons (module_id, slug, title, summary, sort_order, is_active)
select module.id, lesson_seed.lesson_slug, lesson_seed.title, lesson_seed.summary, lesson_seed.sort_order, true
from lesson_seed
join public.subjects subject on subject.slug = 'portugues'
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
  where subject.slug = 'portugues'
    and module.slug in ('morfologia', 'sintaxe', 'redacao-enem', 'interpretacao-texto')
)
delete from public.lesson_blocks where lesson_id in (select id from seeded_lessons);

with seeded_lessons as (
  select lesson.id
  from public.lessons lesson
  join public.course_modules module on module.id = lesson.module_id
  join public.subjects subject on subject.id = module.subject_id
  where subject.slug = 'portugues'
    and module.slug in ('morfologia', 'sintaxe', 'redacao-enem', 'interpretacao-texto')
)
delete from public.lesson_exercises where lesson_id in (select id from seeded_lessons);

with block_seed(module_slug, lesson_slug, block_type, title, content, sort_order) as (
  values
    ('morfologia', 'classes-palavras-contexto', 'intro', 'Morfologia não é lista decorada', 'Morfologia estuda a estrutura, a formação, a flexão e a classificação das palavras. Mas a classificação não deve ser feita isoladamente: a mesma palavra pode mudar de classe conforme o uso no texto.', 1),
    ('morfologia', 'classes-palavras-contexto', 'theory', 'Classes variáveis e invariáveis', 'Substantivos, adjetivos, artigos, numerais, pronomes e verbos costumam variar em gênero, número, pessoa, tempo ou modo. Advérbios, preposições, conjunções e interjeições geralmente não variam.', 2),
    ('morfologia', 'classes-palavras-contexto', 'example', 'Exemplo contextual', 'Em "o jantar estava pronto", jantar funciona como substantivo. Em "vamos jantar cedo", jantar funciona como verbo. A forma é parecida, mas o papel sintático e o contexto mudam a classificação.', 3),
    ('morfologia', 'classes-palavras-contexto', 'common_mistake', 'Erro comum', 'Classificar palavra por aparência. "Alto" pode ser adjetivo em "homem alto" e advérbio em "falou alto". A pergunta correta é: que função essa palavra exerce aqui?', 4),
    ('morfologia', 'classes-palavras-contexto', 'review', 'Revisão rápida', 'Classe gramatical depende de forma, sentido e contexto. Não classifique palavra solta quando a questão oferece frase ou texto.', 5),

    ('morfologia', 'formacao-flexao-palavras', 'intro', 'Palavras carregam partes de sentido', 'Muitas palavras são formadas por radical, prefixos, sufixos, vogais temáticas e desinências. Entender essas partes ajuda a inferir sentidos e reconhecer famílias de palavras.', 1),
    ('morfologia', 'formacao-flexao-palavras', 'theory', 'Derivação, composição e flexão', 'Derivação cria palavras por acréscimo de prefixos ou sufixos, como "reler" e "felizmente". Composição une radicais, como "guarda-chuva". Flexão ajusta a palavra à frase: número, gênero, pessoa, tempo e modo.', 2),
    ('morfologia', 'formacao-flexao-palavras', 'example', 'Sentido do prefixo', 'Em "desfazer", o prefixo "des-" indica negação ou reversão. Em "reorganizar", "re-" pode indicar repetição ou retomada. O valor depende do uso.', 3),
    ('morfologia', 'formacao-flexao-palavras', 'guided_practice', 'Roteiro', '1. Localize o radical. 2. Veja prefixo ou sufixo. 3. Observe se houve mudança de classe. 4. Relacione flexão à concordância da frase.', 4),
    ('morfologia', 'formacao-flexao-palavras', 'review', 'Síntese', 'Formação cria palavras novas. Flexão adapta palavras à frase. Prefixos e sufixos ajudam a inferir significado.', 5),

    ('sintaxe', 'termos-essenciais-integrantes', 'intro', 'Sintaxe é função', 'Sintaxe estuda como palavras e expressões se organizam na oração. Ela pergunta qual função cada termo exerce: sujeito, predicado, objeto, complemento, adjunto, predicativo e outros.', 1),
    ('sintaxe', 'termos-essenciais-integrantes', 'theory', 'Sujeito e predicado', 'Sujeito é o termo sobre o qual se declara algo. Predicado é aquilo que se declara sobre o sujeito, organizado em torno do verbo. Em "A leitura diária melhora a escrita", o sujeito é "A leitura diária" e o predicado é "melhora a escrita".', 2),
    ('sintaxe', 'termos-essenciais-integrantes', 'example', 'Complementos verbais', 'Objeto direto completa verbo sem preposição exigida: "li o livro". Objeto indireto completa verbo com preposição exigida: "preciso de orientação".', 3),
    ('sintaxe', 'termos-essenciais-integrantes', 'common_mistake', 'Erro comum', 'Cortar o sujeito antes da hora. Em "A leitura diária melhora a escrita", "diária" pertence ao sujeito, pois caracteriza "leitura".', 4),
    ('sintaxe', 'termos-essenciais-integrantes', 'review', 'Revisão', 'Ache o verbo. Pergunte quem ou o que pratica/sofre/é caracterizado. Depois separe complementos e termos acessórios.', 5),

    ('sintaxe', 'concordancia-regencia-pontuacao', 'intro', 'Relações dentro da frase', 'Concordância, regência e pontuação dependem das relações sintáticas. Quando essas relações ficam claras, a frase ganha precisão e evita ambiguidades.', 1),
    ('sintaxe', 'concordancia-regencia-pontuacao', 'theory', 'Concordância e regência', 'Concordância nominal ajusta artigo, adjetivo e substantivo. Concordância verbal ajusta verbo e sujeito. Regência trata da relação entre termo regente e complemento, muitas vezes por preposição.', 2),
    ('sintaxe', 'concordancia-regencia-pontuacao', 'example', 'Pontuação muda sentido', 'Em "Não, espere" e "Não espere", a vírgula altera completamente o comando. Pontuação não é enfeite: organiza relações e efeitos de sentido.', 3),
    ('sintaxe', 'concordancia-regencia-pontuacao', 'guided_practice', 'Checklist', '1. Localize sujeito e verbo. 2. Confira concordância. 3. Veja se o verbo exige preposição. 4. Use pontuação para separar termos, não para quebrar pensamento aleatoriamente.', 4),
    ('sintaxe', 'concordancia-regencia-pontuacao', 'review', 'Resumo final', 'Concordância liga termos. Regência governa complementos. Pontuação mostra relações e pode mudar sentido.', 5),

    ('redacao-enem', 'tese-projeto-texto', 'intro', 'Redação começa antes de escrever', 'Uma boa redação nasce de leitura correta do tema. Antes de escrever, é preciso entender recorte temático, problema central, tese e caminho argumentativo.', 1),
    ('redacao-enem', 'tese-projeto-texto', 'theory', 'Tema, tese e projeto', 'Tema é o assunto delimitado pela proposta. Tese é o ponto de vista defendido. Projeto de texto é o plano de desenvolvimento: quais causas, consequências, exemplos e argumentos serão usados.', 2),
    ('redacao-enem', 'tese-projeto-texto', 'example', 'Exemplo de tese', 'Tema: desafios para combater a evasão escolar. Tese possível: a evasão persiste pela combinação entre desigualdade social, fragilidade de políticas de permanência e baixa conexão entre escola e realidade do aluno.', 3),
    ('redacao-enem', 'tese-projeto-texto', 'common_mistake', 'Erro comum', 'Começar com frase bonita sem tese clara. Introdução precisa apresentar tema e direção argumentativa, não apenas enfeitar.', 4),
    ('redacao-enem', 'tese-projeto-texto', 'review', 'Revisão', 'Leia o tema. Defina problema. Escolha tese. Planeje dois argumentos. Só então escreva.', 5),

    ('redacao-enem', 'argumentacao-intervencao', 'intro', 'Argumentar é provar e explicar', 'Argumento não é opinião repetida. Ele precisa afirmar uma ideia, apresentar evidência, explicar a relação com o tema e conduzir o leitor à tese.', 1),
    ('redacao-enem', 'argumentacao-intervencao', 'theory', 'Repertório e coesão', 'Repertório produtivo é conhecimento usado para sustentar o argumento, não citação decorativa. Coesão liga partes do texto por conectivos, retomadas e progressão lógica.', 2),
    ('redacao-enem', 'argumentacao-intervencao', 'example', 'Proposta completa', 'Uma intervenção forte apresenta agente, ação, meio/modo, finalidade e detalhamento. Exemplo: Ministério da Educação deve ampliar bolsas de permanência por meio de repasse a estudantes vulneráveis, para reduzir evasão escolar.', 3),
    ('redacao-enem', 'argumentacao-intervencao', 'guided_practice', 'Roteiro de parágrafo', '1. Tópico frasal. 2. Explicação. 3. Repertório ou dado. 4. Relação com a tese. 5. Fechamento do raciocínio.', 4),
    ('redacao-enem', 'argumentacao-intervencao', 'review', 'Resumo', 'Argumento precisa de prova e explicação. Intervenção precisa de agente, ação, meio, finalidade e detalhe.', 5),

    ('interpretacao-texto', 'tema-tese-inferencia', 'intro', 'Interpretar é controlar evidências', 'Interpretação de texto não é opinião pessoal. É leitura baseada em pistas: tema, tese, palavras-chave, conectivos, tom, pressupostos, implícitos e contexto.', 1),
    ('interpretacao-texto', 'tema-tese-inferencia', 'theory', 'Explícito e implícito', 'Informação explícita está diretamente no texto. Inferência é conclusão baseada em pistas. Tese é a posição defendida. Tema é o assunto tratado.', 2),
    ('interpretacao-texto', 'tema-tese-inferencia', 'example', 'Conectivos orientam leitura', 'Palavras como "porém", "portanto", "embora" e "além disso" mostram oposição, conclusão, concessão e acréscimo. Elas ajudam a entender a progressão do raciocínio.', 3),
    ('interpretacao-texto', 'tema-tese-inferencia', 'common_mistake', 'Erro comum', 'Marcar alternativa que parece verdadeira no mundo, mas não é sustentada pelo texto. A resposta precisa caber no enunciado.', 4),
    ('interpretacao-texto', 'tema-tese-inferencia', 'review', 'Revisão rápida', 'Tema é assunto. Tese é posição. Inferência nasce de pistas. Conectivos mostram relações lógicas.', 5),

    ('interpretacao-texto', 'multimodalidade-generos', 'intro', 'Texto também é imagem, suporte e circulação', 'Textos multimodais combinam linguagem verbal, imagem, gráfico, layout, cor, fonte, ícones e suporte. Gêneros textuais organizam a comunicação conforme finalidade e público.', 1),
    ('interpretacao-texto', 'multimodalidade-generos', 'theory', 'Gênero e finalidade', 'Notícia informa, artigo opina, campanha persuade, charge critica, infográfico organiza dados, crônica reflete sobre o cotidiano. O mesmo tema pode aparecer em gêneros diferentes.', 2),
    ('interpretacao-texto', 'multimodalidade-generos', 'example', 'Campanha publicitária', 'Uma campanha pode usar imagem de impacto, slogan curto e chamada direta para convencer o leitor a agir. A leitura depende da relação entre texto verbal e visual.', 3),
    ('interpretacao-texto', 'multimodalidade-generos', 'guided_practice', 'Como ler', '1. Identifique gênero. 2. Veja público-alvo. 3. Leia texto e imagem juntos. 4. Pergunte qual ação ou interpretação o texto tenta provocar.', 4),
    ('interpretacao-texto', 'multimodalidade-generos', 'review', 'Resumo', 'Gênero depende de finalidade, público, suporte e linguagem. Multimodalidade exige ler palavra e imagem em conjunto.', 5)
)
insert into public.lesson_blocks (lesson_id, block_type, title, content, sort_order)
select lesson.id, block_seed.block_type, block_seed.title, block_seed.content, block_seed.sort_order
from block_seed
join public.subjects subject on subject.slug = 'portugues'
join public.course_modules module on module.subject_id = subject.id and module.slug = block_seed.module_slug
join public.lessons lesson on lesson.module_id = module.id and lesson.slug = block_seed.lesson_slug;

with exercise_seed(module_slug, lesson_slug, question, exercise_type, choices, correct_answer, explanation, difficulty, sort_order) as (
  values
    ('morfologia', 'classes-palavras-contexto', 'Na frase "Ele falou alto", a palavra "alto" funciona como:', 'multiple_choice', '["substantivo", "advérbio", "artigo", "preposição", "pronome"]'::jsonb, 'B', 'Nesse contexto, "alto" modifica o verbo "falou", indicando modo/intensidade.', 'facil', 1),
    ('morfologia', 'classes-palavras-contexto', 'Explique por que uma palavra não deve ser classificada sempre fora do contexto.', 'open', '[]'::jsonb, 'Porque a classe pode mudar conforme a função e o sentido que a palavra assume na frase.', 'A resposta deve citar função/contexto.', 'medio', 2),
    ('morfologia', 'formacao-flexao-palavras', 'O prefixo em "reorganizar" sugere, em geral:', 'multiple_choice', '["negação", "repetição ou retomada", "diminuição", "plural", "feminino"]'::jsonb, 'B', 'O prefixo "re-" frequentemente indica repetição, retorno ou retomada.', 'facil', 1),
    ('morfologia', 'formacao-flexao-palavras', 'Diferencie formação de palavra e flexão.', 'open', '[]'::jsonb, 'Formação cria novas palavras; flexão adapta a palavra à frase, como número, gênero, pessoa, tempo ou modo.', 'A resposta deve comparar criação lexical e adaptação gramatical.', 'medio', 2),

    ('sintaxe', 'termos-essenciais-integrantes', 'Separe sujeito e predicado: "A leitura diária melhora a escrita."', 'open', '[]'::jsonb, 'Sujeito: A leitura diária. Predicado: melhora a escrita.', 'O sujeito completo inclui "diária", pois caracteriza "leitura".', 'facil', 1),
    ('sintaxe', 'termos-essenciais-integrantes', 'Em "Os alunos precisam de orientação", "de orientação" é:', 'multiple_choice', '["objeto direto", "objeto indireto", "predicativo do sujeito", "adjunto adnominal", "vocativo"]'::jsonb, 'B', 'O verbo "precisar" exige complemento com preposição: precisar de algo.', 'facil', 2),
    ('sintaxe', 'concordancia-regencia-pontuacao', 'Explique a diferença de sentido entre "Não espere" e "Não, espere".', 'open', '[]'::jsonb, 'Em "Não espere", a ordem é para não esperar. Em "Não, espere", a vírgula separa a negativa de uma ordem para esperar.', 'A pontuação altera a relação entre negação e verbo.', 'medio', 1),
    ('sintaxe', 'concordancia-regencia-pontuacao', 'Concordância verbal relaciona principalmente:', 'multiple_choice', '["verbo e sujeito", "substantivo e artigo apenas", "preposição e objeto", "vírgula e ponto", "radical e prefixo"]'::jsonb, 'A', 'Concordância verbal ajusta o verbo ao sujeito.', 'facil', 2),

    ('redacao-enem', 'tese-projeto-texto', 'Tese é:', 'multiple_choice', '["o título obrigatório", "o ponto de vista defendido", "qualquer citação", "a proposta de intervenção", "a conclusão sem argumento"]'::jsonb, 'B', 'Tese é a posição central que o texto defende.', 'facil', 1),
    ('redacao-enem', 'tese-projeto-texto', 'Crie uma tese para o tema "desafios da educação digital no Brasil".', 'open', '[]'::jsonb, 'Uma tese possível: a educação digital enfrenta desigualdade de acesso, falta de formação docente e ausência de infraestrutura adequada.', 'A tese deve apresentar posição clara e recorte argumentativo.', 'medio', 2),
    ('redacao-enem', 'argumentacao-intervencao', 'Qual elemento não pode faltar em proposta de intervenção completa?', 'multiple_choice', '["agente e ação", "apenas título", "apenas opinião pessoal", "rima", "narrador"]'::jsonb, 'A', 'A proposta deve indicar agente, ação, meio/modo, finalidade e detalhamento.', 'facil', 1),
    ('redacao-enem', 'argumentacao-intervencao', 'Explique o que é repertório produtivo.', 'open', '[]'::jsonb, 'É conhecimento externo usado de forma pertinente para sustentar e explicar o argumento.', 'Repertório produtivo precisa estar conectado à tese, não apenas citado.', 'medio', 2),

    ('interpretacao-texto', 'tema-tese-inferencia', 'Inferência é:', 'multiple_choice', '["cópia literal de uma frase", "conclusão baseada em pistas do texto", "opinião sem base", "erro de gramática", "título do texto"]'::jsonb, 'B', 'Inferir é concluir algo a partir de evidências textuais.', 'facil', 1),
    ('interpretacao-texto', 'tema-tese-inferencia', 'Diferencie tema e tese.', 'open', '[]'::jsonb, 'Tema é o assunto tratado; tese é a posição defendida sobre esse assunto.', 'A resposta deve separar assunto e ponto de vista.', 'medio', 2),
    ('interpretacao-texto', 'multimodalidade-generos', 'Em um infográfico, a interpretação depende de:', 'multiple_choice', '["apenas do título", "texto, dados, imagem, legenda e organização visual", "somente do autor", "número de páginas", "classe gramatical isolada"]'::jsonb, 'B', 'Texto multimodal exige leitura integrada dos elementos verbais e visuais.', 'facil', 1),
    ('interpretacao-texto', 'multimodalidade-generos', 'Explique por que o mesmo tema pode aparecer em gêneros diferentes.', 'open', '[]'::jsonb, 'Porque gênero depende da finalidade, público, suporte, estrutura e linguagem, não apenas do assunto.', 'A resposta deve citar finalidade e situação comunicativa.', 'medio', 2)
)
insert into public.lesson_exercises (
  lesson_id,
  question,
  exercise_type,
  choices,
  correct_answer,
  explanation,
  difficulty,
  sort_order
)
select
  lesson.id,
  exercise_seed.question,
  exercise_seed.exercise_type,
  exercise_seed.choices,
  exercise_seed.correct_answer,
  exercise_seed.explanation,
  exercise_seed.difficulty,
  exercise_seed.sort_order
from exercise_seed
join public.subjects subject on subject.slug = 'portugues'
join public.course_modules module on module.subject_id = subject.id and module.slug = exercise_seed.module_slug
join public.lessons lesson on lesson.module_id = module.id and lesson.slug = exercise_seed.lesson_slug;

with seeded_lessons as (
  select lesson.id
  from public.lessons lesson
  join public.course_modules module on module.id = lesson.module_id
  join public.subjects subject on subject.id = module.subject_id
  where subject.slug = 'portugues'
    and module.slug in ('morfologia', 'sintaxe', 'redacao-enem', 'interpretacao-texto')
)
delete from public.lesson_sources where lesson_id in (select id from seeded_lessons);

with source_seed(module_slug, lesson_slug, title, url, license, attribution, notes) as (
  values
    ('morfologia', 'classes-palavras-contexto', 'Gramática do português culto falado no Brasil', 'https://www.museudalinguaportuguesa.org.br/', 'Consulta pública', 'Museu da Língua Portuguesa', 'Referência cultural e linguística para estudo do português.'),
    ('sintaxe', 'termos-essenciais-integrantes', 'Portal da Língua Portuguesa', 'http://www.portaldalinguaportuguesa.org/', 'Consulta pública', 'Portal da Língua Portuguesa', 'Consulta lexical e gramatical.'),
    ('redacao-enem', 'tese-projeto-texto', 'INEP - Redação do ENEM', 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem', 'Uso educacional / governo federal', 'INEP', 'Referência oficial para competências e estrutura da redação do ENEM.'),
    ('interpretacao-texto', 'tema-tese-inferencia', 'INEP - Provas e gabaritos do ENEM', 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos', 'Uso educacional / governo federal', 'INEP', 'Base oficial para analisar padrões de cobrança em interpretação.')
)
insert into public.lesson_sources (lesson_id, title, url, license, attribution, notes)
select lesson.id, source_seed.title, source_seed.url, source_seed.license, source_seed.attribution, source_seed.notes
from source_seed
join public.subjects subject on subject.slug = 'portugues'
join public.course_modules module on module.subject_id = subject.id and module.slug = source_seed.module_slug
join public.lessons lesson on lesson.module_id = module.id and lesson.slug = source_seed.lesson_slug;

commit;
