-- LearnFlow - Literature course content seed
-- Run this after supabase-content-schema.sql in the Supabase SQL Editor.
-- Idempotent for the listed Literature modules.

begin;

insert into public.subjects (slug, name, subtitle, icon, sort_order, is_active)
values ('literatura', 'Literatura', 'Obras, linguagem e contexto', 'library', 8, true)
on conflict (slug) do update set
  name = excluded.name,
  subtitle = excluded.subtitle,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

with subject as (
  select id from public.subjects where slug = 'literatura'
),
module_seed(slug, title, objective, estimated_minutes, level, sort_order) as (
  values
    ('escolas-literarias', 'Escolas Literárias', 'Entender movimentos literários como respostas estéticas, históricas e sociais, lendo marcas de linguagem em vez de apenas decorar períodos.', 300, 'medio', 1),
    ('poesia-e-eu-lirico', 'Poesia e eu lírico', 'Interpretar poemas por voz, imagem, ritmo, metáfora, oposição, silêncio e efeito de sentido.', 260, 'medio', 2),
    ('prosa-e-narrativa', 'Prosa e narrativa', 'Analisar narrador, personagens, espaço, tempo, conflito, foco narrativo e crítica social em contos e romances.', 280, 'medio', 3),
    ('literatura-brasileira-enem', 'Literatura Brasileira no ENEM', 'Relacionar obras, autores, períodos e problemas brasileiros recorrentes nas provas: identidade, desigualdade, linguagem e crítica.', 320, 'avancado', 4)
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
    ('escolas-literarias', 'barroco-arcadismo-romantismo', 'Barroco, Arcadismo e Romantismo', 'Do conflito barroco à idealização romântica: contexto histórico, linguagem e visão de mundo.', 1),
    ('escolas-literarias', 'realismo-modernismo-contemporaneo', 'Realismo, Modernismo e contemporâneo', 'Crítica social, ruptura formal, identidade nacional e literatura contemporânea.', 2),
    ('poesia-e-eu-lirico', 'voz-poetica-imagem-ritmo', 'Voz poética, imagem e ritmo', 'O poema constrói sentido por escolhas de voz, verso, repetição, imagem e sonoridade.', 1),
    ('poesia-e-eu-lirico', 'figuras-efeitos-sentido', 'Figuras e efeitos de sentido', 'Metáfora, antítese, ironia, paradoxo e metonímia como ferramentas de interpretação.', 2),
    ('prosa-e-narrativa', 'narrador-foco-conflito', 'Narrador, foco e conflito', 'Quem conta, de onde conta e o que esconde altera a interpretação da narrativa.', 1),
    ('prosa-e-narrativa', 'espaco-tempo-personagem', 'Espaço, tempo e personagem', 'Ambiente, memória, deslocamento e personagens constroem crítica e tensão narrativa.', 2),
    ('literatura-brasileira-enem', 'machado-modernistas-regionalismo', 'Machado, modernistas e regionalismo', 'Autores centrais para ler ironia, identidade nacional, desigualdade, linguagem e crítica social.', 1),
    ('literatura-brasileira-enem', 'como-resolver-questoes-literatura', 'Como resolver questões de literatura', 'Método de leitura para ENEM: texto primeiro, contexto depois, alternativa por evidência.', 2)
)
insert into public.lessons (module_id, slug, title, summary, sort_order, is_active)
select module.id, lesson_seed.lesson_slug, lesson_seed.title, lesson_seed.summary, lesson_seed.sort_order, true
from lesson_seed
join public.subjects subject on subject.slug = 'literatura'
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
  where subject.slug = 'literatura'
    and module.slug in ('escolas-literarias', 'poesia-e-eu-lirico', 'prosa-e-narrativa', 'literatura-brasileira-enem')
)
delete from public.lesson_blocks where lesson_id in (select id from seeded_lessons);

with seeded_lessons as (
  select lesson.id
  from public.lessons lesson
  join public.course_modules module on module.id = lesson.module_id
  join public.subjects subject on subject.id = module.subject_id
  where subject.slug = 'literatura'
    and module.slug in ('escolas-literarias', 'poesia-e-eu-lirico', 'prosa-e-narrativa', 'literatura-brasileira-enem')
)
delete from public.lesson_exercises where lesson_id in (select id from seeded_lessons);

with block_seed(module_slug, lesson_slug, block_type, title, content, sort_order) as (
  values
    ('escolas-literarias', 'barroco-arcadismo-romantismo', 'intro', 'Literatura como resposta ao tempo', 'Escolas literárias não são gavetas decorativas. Elas reúnem tendências de linguagem, visão de mundo, temas e conflitos de uma época. A leitura correta parte do texto e usa o contexto como apoio.', 1),
    ('escolas-literarias', 'barroco-arcadismo-romantismo', 'theory', 'Três movimentos fundamentais', 'Barroco trabalha tensão: corpo e alma, pecado e salvação, claro e escuro. Arcadismo reage ao excesso barroco com equilíbrio, simplicidade e ideal pastoril. Romantismo valoriza subjetividade, nacionalidade, idealização amorosa e liberdade expressiva.', 2),
    ('escolas-literarias', 'barroco-arcadismo-romantismo', 'example', 'Como reconhecer no texto', 'Antíteses, paradoxos e dramaticidade sugerem Barroco. Natureza idealizada, simplicidade e equilíbrio sugerem Arcadismo. Eu lírico intenso, exaltação da pátria, amor idealizado ou sofrimento subjetivo sugerem Romantismo.', 3),
    ('escolas-literarias', 'barroco-arcadismo-romantismo', 'common_mistake', 'Erro comum', 'Não marque uma escola só por uma palavra solta. Natureza pode aparecer em muitos movimentos. O que decide é o conjunto: linguagem, tom, visão de mundo e função do elemento no texto.', 4),
    ('escolas-literarias', 'barroco-arcadismo-romantismo', 'visual_summary', 'Mapa rápido', 'Barroco: conflito e contraste. Arcadismo: equilíbrio e simplicidade. Romantismo: subjetividade e idealização. Em prova, procure marcas textuais antes de lembrar datas.', 5),

    ('escolas-literarias', 'realismo-modernismo-contemporaneo', 'intro', 'Da crítica social à ruptura', 'Realismo e Naturalismo reduzem a idealização romântica e observam a sociedade com ironia, análise psicológica ou determinismo. O Modernismo rompe modelos formais e tenta reler o Brasil sem imitar padrões europeus.', 1),
    ('escolas-literarias', 'realismo-modernismo-contemporaneo', 'theory', 'Realismo, Naturalismo e Modernismo', 'Realismo foca crítica social, ironia e análise psicológica. Naturalismo enfatiza influência do meio, hereditariedade e determinismo. Modernismo valoriza linguagem mais livre, humor, nacionalidade crítica, oralidade e experimentação.', 2),
    ('escolas-literarias', 'realismo-modernismo-contemporaneo', 'example', 'Machado e os modernistas', 'Em Machado de Assis, a ironia revela interesses, vaidade e contradições sociais. Em modernistas, a ruptura aparece na linguagem coloquial, na revisão crítica da história nacional e na liberdade formal.', 3),
    ('escolas-literarias', 'realismo-modernismo-contemporaneo', 'guided_practice', 'Roteiro de leitura', '1. Observe quem fala. 2. Identifique tom: idealização, ironia, denúncia ou experimentação. 3. Relacione linguagem e contexto. 4. Verifique se a alternativa exagera ou inventa informação.', 4),
    ('escolas-literarias', 'realismo-modernismo-contemporaneo', 'review', 'Síntese', 'Realismo critica aparências. Naturalismo destaca condicionamentos. Modernismo rompe padrões e repensa o Brasil. Literatura contemporânea mistura vozes, suportes, memórias e críticas sociais.', 5),

    ('poesia-e-eu-lirico', 'voz-poetica-imagem-ritmo', 'intro', 'Poema não é mensagem escondida', 'Poema é construção de linguagem. Ele produz sentido por voz, imagem, ritmo, som, pausa, repetição, verso e escolha lexical. Interpretar poesia exige ler forma e conteúdo juntos.', 1),
    ('poesia-e-eu-lirico', 'voz-poetica-imagem-ritmo', 'theory', 'Eu lírico e imagem', 'Eu lírico é a voz que fala no poema, não necessariamente o autor. Imagens poéticas aproximam ideias e sensações. Ritmo e repetição podem intensificar emoção, criar contraste ou organizar pensamento.', 2),
    ('poesia-e-eu-lirico', 'voz-poetica-imagem-ritmo', 'example', 'Leitura guiada', 'Se um poema repete uma palavra ligada ao tempo, a repetição pode sugerir memória, espera, perda ou permanência. Se há mudança no ritmo, pode haver mudança emocional ou argumentativa.', 3),
    ('poesia-e-eu-lirico', 'voz-poetica-imagem-ritmo', 'common_mistake', 'Erro comum', 'Confundir eu lírico com biografia do autor. A prova costuma cobrar a voz construída no texto, não a vida pessoal de quem escreveu.', 4),
    ('poesia-e-eu-lirico', 'voz-poetica-imagem-ritmo', 'review', 'Revisão', 'Pergunte: quem fala? Com que tom? Que imagens aparecem? Há repetição? O ritmo muda? Que efeito isso cria?', 5),

    ('poesia-e-eu-lirico', 'figuras-efeitos-sentido', 'intro', 'Figura é efeito, não enfeite', 'Figuras de linguagem deslocam sentidos para criar imagem, crítica, humor, intensidade, ambiguidade ou emoção. Nomear a figura ajuda, mas explicar o efeito é o principal.', 1),
    ('poesia-e-eu-lirico', 'figuras-efeitos-sentido', 'theory', 'Principais recursos', 'Metáfora aproxima ideias diretamente. Comparação usa conectivo. Metonímia troca termos relacionados. Antítese aproxima opostos. Paradoxo cria contradição expressiva. Ironia diz uma coisa para sugerir outra.', 2),
    ('poesia-e-eu-lirico', 'figuras-efeitos-sentido', 'example', 'Efeito de sentido', 'Em "a cidade é um formigueiro", a metáfora sugere movimento intenso, aglomeração e repetição. A resposta completa não diz só "metáfora"; ela explica o efeito criado.', 3),
    ('poesia-e-eu-lirico', 'figuras-efeitos-sentido', 'guided_practice', 'Como resolver', '1. Leia a expressão no contexto. 2. Veja se há aproximação, troca, exagero, oposição ou ironia. 3. Explique o efeito. 4. Elimine alternativas que só decoram nomes sem interpretar.', 4),
    ('poesia-e-eu-lirico', 'figuras-efeitos-sentido', 'review', 'Resumo', 'Figura de linguagem altera o modo de perceber uma ideia. Em prova, o foco é efeito de sentido.', 5),

    ('prosa-e-narrativa', 'narrador-foco-conflito', 'intro', 'Quem narra controla a leitura', 'Narrador não é autor. É uma voz construída no texto. O foco narrativo define o que o leitor sabe, o que ignora e como interpreta o conflito.', 1),
    ('prosa-e-narrativa', 'narrador-foco-conflito', 'theory', 'Tipos de narrador', 'Narrador em primeira pessoa participa ou testemunha os fatos e pode ser parcial. Narrador em terceira pessoa observa de fora e pode ser onisciente ou limitado. A escolha muda confiança, distância e tensão.', 2),
    ('prosa-e-narrativa', 'narrador-foco-conflito', 'example', 'Narrador não confiável', 'Um narrador pode esconder culpa, exagerar virtudes ou interpretar mal outros personagens. Nesse caso, a leitura exige perceber contradições entre o que ele diz e o que o texto mostra.', 3),
    ('prosa-e-narrativa', 'narrador-foco-conflito', 'common_mistake', 'Erro comum', 'Acreditar automaticamente no narrador. Em literatura, a voz narrativa pode ser irônica, ingênua, manipuladora ou limitada.', 4),
    ('prosa-e-narrativa', 'narrador-foco-conflito', 'review', 'Síntese', 'Pergunte: quem narra? O que sabe? O que omite? Qual é o conflito? A narração aproxima ou distancia o leitor?', 5),

    ('prosa-e-narrativa', 'espaco-tempo-personagem', 'intro', 'Cenário também fala', 'Espaço, tempo e personagem não servem apenas para situar a história. Eles podem revelar classe social, opressão, memória, decadência, desejo, deslocamento e crítica.', 1),
    ('prosa-e-narrativa', 'espaco-tempo-personagem', 'theory', 'Tempo e espaço narrativo', 'Tempo cronológico segue sequência de fatos. Tempo psicológico acompanha memória, percepção e subjetividade. Espaço físico localiza; espaço social revela relações de poder e desigualdade.', 2),
    ('prosa-e-narrativa', 'espaco-tempo-personagem', 'example', 'Personagem e sociedade', 'Uma personagem isolada em uma casa decadente pode representar solidão individual e crise de uma ordem social. A análise boa liga elemento narrativo a efeito de sentido.', 3),
    ('prosa-e-narrativa', 'espaco-tempo-personagem', 'guided_practice', 'Roteiro', '1. Identifique espaço e tempo. 2. Veja como afetam personagens. 3. Observe se há símbolo ou crítica. 4. Relacione conflito individual e contexto social.', 4),
    ('prosa-e-narrativa', 'espaco-tempo-personagem', 'review', 'Revisão', 'Espaço pode ser social. Tempo pode ser psicológico. Personagem pode representar conflito histórico, social ou simbólico.', 5),

    ('literatura-brasileira-enem', 'machado-modernistas-regionalismo', 'intro', 'Autores como entrada para problemas brasileiros', 'No ENEM, autores aparecem menos como lista biográfica e mais como caminhos para discutir linguagem, sociedade, identidade, desigualdade, memória e crítica.', 1),
    ('literatura-brasileira-enem', 'machado-modernistas-regionalismo', 'theory', 'Três eixos frequentes', 'Machado de Assis costuma aparecer por ironia, narrador e crítica social. Modernistas aparecem pela ruptura e revisão do Brasil. Regionalismo aparece por território, linguagem, seca, desigualdade e relações de poder.', 2),
    ('literatura-brasileira-enem', 'machado-modernistas-regionalismo', 'example', 'O que a questão cobra', 'Uma questão sobre Machado pode cobrar o efeito da ironia, não a data da obra. Uma questão modernista pode cobrar a valorização crítica da oralidade, não apenas a Semana de 22.', 3),
    ('literatura-brasileira-enem', 'machado-modernistas-regionalismo', 'common_mistake', 'Erro comum', 'Transformar literatura brasileira em lista de autores. A prova exige leitura do trecho e reconhecimento de problemas culturais e sociais.', 4),
    ('literatura-brasileira-enem', 'machado-modernistas-regionalismo', 'review', 'Mapa', 'Machado: ironia e sociedade. Modernismo: ruptura e identidade. Regionalismo: território e desigualdade. Contemporâneo: pluralidade de vozes.', 5),

    ('literatura-brasileira-enem', 'como-resolver-questoes-literatura', 'intro', 'Método antes de memória', 'Resolver literatura exige método. A alternativa correta precisa respeitar o texto. Contexto histórico ajuda, mas não pode substituir a leitura do trecho.', 1),
    ('literatura-brasileira-enem', 'como-resolver-questoes-literatura', 'theory', 'Protocolo de resolução', 'Leia o comando. Identifique gênero, voz e tema. Marque palavras de tom e imagens. Procure oposição, ironia ou crítica. Só depois use contexto literário. Elimine alternativas genéricas, extremas ou sem evidência textual.', 2),
    ('literatura-brasileira-enem', 'como-resolver-questoes-literatura', 'example', 'Alternativa atraente', 'Uma alternativa pode citar corretamente uma escola literária, mas errar o efeito do trecho. Outra pode parecer simples, mas ser correta porque explica exatamente o recurso usado no texto.', 3),
    ('literatura-brasileira-enem', 'como-resolver-questoes-literatura', 'guided_practice', 'Checklist', '1. O texto confirma isso? 2. A alternativa exagera? 3. Ela troca autor por narrador? 4. Ela ignora ironia? 5. Ela explica efeito ou só classifica?', 4),
    ('literatura-brasileira-enem', 'como-resolver-questoes-literatura', 'review', 'Resumo final', 'Texto primeiro. Contexto depois. Evidência sempre. Literatura no ENEM cobra interpretação, efeito de sentido e leitura crítica.', 5)
)
insert into public.lesson_blocks (lesson_id, block_type, title, content, sort_order)
select lesson.id, block_seed.block_type, block_seed.title, block_seed.content, block_seed.sort_order
from block_seed
join public.subjects subject on subject.slug = 'literatura'
join public.course_modules module on module.subject_id = subject.id and module.slug = block_seed.module_slug
join public.lessons lesson on lesson.module_id = module.id and lesson.slug = block_seed.lesson_slug;

with exercise_seed(module_slug, lesson_slug, question, exercise_type, choices, correct_answer, explanation, difficulty, sort_order) as (
  values
    ('escolas-literarias', 'barroco-arcadismo-romantismo', 'Qual característica é mais associada ao Barroco?', 'multiple_choice', '["Equilíbrio pastoril", "Conflito entre opostos e tensão espiritual", "Linguagem jornalística objetiva", "Ruptura modernista", "Determinismo científico"]'::jsonb, 'B', 'O Barroco trabalha contrastes, tensão religiosa, antíteses e dramaticidade.', 'facil', 1),
    ('escolas-literarias', 'barroco-arcadismo-romantismo', 'Explique uma diferença entre Arcadismo e Romantismo.', 'open', '[]'::jsonb, 'Arcadismo busca equilíbrio, simplicidade e ideal pastoril; Romantismo valoriza subjetividade, emoção, nacionalidade e idealização.', 'A resposta deve comparar visão de mundo e linguagem, não apenas datas.', 'medio', 2),
    ('escolas-literarias', 'realismo-modernismo-contemporaneo', 'O Realismo tende a:', 'multiple_choice', '["idealizar o amor de forma sentimental", "criticar aparências sociais e analisar psicologicamente personagens", "negar qualquer crítica social", "imitar rigidamente modelos clássicos", "eliminar ironia e ambiguidade"]'::jsonb, 'B', 'O Realismo observa a sociedade com crítica, ironia e análise psicológica.', 'facil', 1),
    ('escolas-literarias', 'realismo-modernismo-contemporaneo', 'Por que o Modernismo brasileiro é associado à ruptura?', 'open', '[]'::jsonb, 'Porque rompe modelos formais tradicionais, valoriza experimentação, oralidade e revisão crítica da identidade brasileira.', 'A resposta deve citar forma e projeto cultural.', 'medio', 2),

    ('poesia-e-eu-lirico', 'voz-poetica-imagem-ritmo', 'Eu lírico é:', 'multiple_choice', '["sempre o autor real", "a voz construída que fala no poema", "o editor do livro", "um personagem obrigatório de romance", "a moral explícita do texto"]'::jsonb, 'B', 'Eu lírico é a voz textual do poema, não necessariamente o autor.', 'facil', 1),
    ('poesia-e-eu-lirico', 'voz-poetica-imagem-ritmo', 'Explique como repetição pode produzir sentido em um poema.', 'open', '[]'::jsonb, 'A repetição pode intensificar emoção, criar ritmo, destacar uma ideia ou mostrar insistência, memória ou conflito.', 'A resposta deve ligar recurso formal a efeito de sentido.', 'medio', 2),
    ('poesia-e-eu-lirico', 'figuras-efeitos-sentido', 'Em "a cidade é um formigueiro", há principalmente:', 'multiple_choice', '["metáfora", "eufemismo", "pleonasmo", "onomatopeia", "paráfrase"]'::jsonb, 'A', 'A expressão aproxima cidade e formigueiro para sugerir movimento e aglomeração.', 'facil', 1),
    ('poesia-e-eu-lirico', 'figuras-efeitos-sentido', 'Por que apenas nomear uma figura de linguagem não basta?', 'open', '[]'::jsonb, 'Porque é preciso explicar o efeito de sentido produzido pela figura no contexto.', 'A interpretação literária cobra função do recurso, não só nomenclatura.', 'medio', 2),

    ('prosa-e-narrativa', 'narrador-foco-conflito', 'Narrador e autor são sempre a mesma pessoa?', 'multiple_choice', '["Sim", "Não; narrador é uma voz construída no texto", "Sim, quando o texto é antigo", "Não existe narrador em prosa", "Apenas em poemas"]'::jsonb, 'B', 'Narrador é uma construção textual; autor é a pessoa histórica que escreveu.', 'facil', 1),
    ('prosa-e-narrativa', 'narrador-foco-conflito', 'Explique por que um narrador em primeira pessoa pode ser parcial.', 'open', '[]'::jsonb, 'Porque ele narra a partir de sua experiência, interesses, memória e limites de conhecimento.', 'A primeira pessoa aproxima o leitor, mas pode restringir ou distorcer os fatos.', 'medio', 2),
    ('prosa-e-narrativa', 'espaco-tempo-personagem', 'Tempo psicológico está ligado a:', 'multiple_choice', '["ordem objetiva do calendário", "memória, percepção e subjetividade", "distância geográfica", "tamanho do livro", "número de capítulos"]'::jsonb, 'B', 'Tempo psicológico acompanha experiência interna, memória e percepção.', 'facil', 1),
    ('prosa-e-narrativa', 'espaco-tempo-personagem', 'Como o espaço pode produzir crítica social em uma narrativa?', 'open', '[]'::jsonb, 'O espaço pode revelar desigualdade, isolamento, poder, decadência, pertencimento ou exclusão dos personagens.', 'A resposta deve ligar ambiente a sentido social ou simbólico.', 'medio', 2),

    ('literatura-brasileira-enem', 'machado-modernistas-regionalismo', 'Uma marca frequente em Machado de Assis é:', 'multiple_choice', '["ausência de ironia", "crítica social por ironia e análise psicológica", "idealização romântica pura", "linguagem científica naturalista apenas", "recusa de ambiguidade"]'::jsonb, 'B', 'Machado frequentemente usa ironia e análise de contradições sociais.', 'facil', 1),
    ('literatura-brasileira-enem', 'machado-modernistas-regionalismo', 'Explique por que regionalismo não é apenas descrição de paisagem.', 'open', '[]'::jsonb, 'Porque pode tratar de desigualdade, poder, linguagem, seca, trabalho, cultura e conflitos sociais de uma região.', 'A paisagem costuma funcionar junto com problemas históricos e sociais.', 'medio', 2),
    ('literatura-brasileira-enem', 'como-resolver-questoes-literatura', 'Qual é a melhor ordem de resolução?', 'multiple_choice', '["Decorar autor, ignorar texto, marcar escola", "Ler comando, analisar trecho, observar efeitos e só depois usar contexto", "Escolher a alternativa mais longa", "Procurar datas", "Marcar o movimento mais famoso"]'::jsonb, 'B', 'A leitura do trecho deve comandar a resolução; contexto é apoio.', 'facil', 1),
    ('literatura-brasileira-enem', 'como-resolver-questoes-literatura', 'Explique o que significa usar evidência textual.', 'open', '[]'::jsonb, 'Significa justificar a interpretação com palavras, imagens, tom, narrador, estrutura ou recursos presentes no trecho.', 'Sem evidência textual, a interpretação vira chute genérico.', 'medio', 2)
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
join public.subjects subject on subject.slug = 'literatura'
join public.course_modules module on module.subject_id = subject.id and module.slug = exercise_seed.module_slug
join public.lessons lesson on lesson.module_id = module.id and lesson.slug = exercise_seed.lesson_slug;

with seeded_lessons as (
  select lesson.id
  from public.lessons lesson
  join public.course_modules module on module.id = lesson.module_id
  join public.subjects subject on subject.id = module.subject_id
  where subject.slug = 'literatura'
    and module.slug in ('escolas-literarias', 'poesia-e-eu-lirico', 'prosa-e-narrativa', 'literatura-brasileira-enem')
)
delete from public.lesson_sources where lesson_id in (select id from seeded_lessons);

with source_seed(module_slug, lesson_slug, title, url, license, attribution, notes) as (
  values
    ('escolas-literarias', 'barroco-arcadismo-romantismo', 'Domínio Público - Literatura brasileira', 'https://www.dominiopublico.gov.br/', 'Domínio público / consulta pública', 'Portal Domínio Público', 'Acervo para leitura de obras literárias em domínio público.'),
    ('escolas-literarias', 'realismo-modernismo-contemporaneo', 'Academia Brasileira de Letras - autores', 'https://www.academia.org.br/', 'Consulta pública', 'Academia Brasileira de Letras', 'Referência institucional sobre autores e obras.'),
    ('poesia-e-eu-lirico', 'voz-poetica-imagem-ritmo', 'Biblioteca Brasiliana Guita e José Mindlin', 'https://digital.bbm.usp.br/', 'Consulta pública', 'BBM Digital USP', 'Acervo digital para consulta de textos e edições.'),
    ('literatura-brasileira-enem', 'como-resolver-questoes-literatura', 'INEP - Provas e gabaritos do ENEM', 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos', 'Uso educacional / governo federal', 'INEP', 'Referência para análise do padrão de cobrança do ENEM.')
)
insert into public.lesson_sources (lesson_id, title, url, license, attribution, notes)
select lesson.id, source_seed.title, source_seed.url, source_seed.license, source_seed.attribution, source_seed.notes
from source_seed
join public.subjects subject on subject.slug = 'literatura'
join public.course_modules module on module.subject_id = subject.id and module.slug = source_seed.module_slug
join public.lessons lesson on lesson.module_id = module.id and lesson.slug = source_seed.lesson_slug;

commit;
