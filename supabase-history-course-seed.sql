-- LearnFlow - History course content seed
-- Run this after supabase-content-schema.sql in the Supabase SQL Editor.
-- Idempotent for the listed History modules.

begin;

insert into public.subjects (slug, name, subtitle, icon, sort_order, is_active)
values ('historia', 'História', 'Tempo, sociedade e poder', 'timeline', 6, true)
on conflict (slug) do update set
  name = excluded.name,
  subtitle = excluded.subtitle,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

with subject as (
  select id from public.subjects where slug = 'historia'
),
module_seed(slug, title, objective, estimated_minutes, level, sort_order) as (
  values
    ('brasil-colonia-imperio', 'Brasil Colônia e Império', 'Entender colonização, escravidão, economia, resistências, independência e construção do Estado imperial.', 320, 'medio', 1),
    ('brasil-republica', 'Brasil República', 'Analisar oligarquias, Era Vargas, democracia populista, ditadura civil-militar, redemocratização e cidadania.', 340, 'medio', 2),
    ('historia-geral-moderna', 'História Geral Moderna', 'Compreender formação do capitalismo, absolutismo, iluminismo, revoluções burguesas e industrialização.', 320, 'medio', 3),
    ('mundo-contemporaneo', 'Mundo Contemporâneo', 'Relacionar imperialismo, guerras mundiais, Guerra Fria, descolonização, globalização e conflitos atuais.', 360, 'avancado', 4)
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
    ('brasil-colonia-imperio', 'colonizacao-escravidao-resistencia', 'Colonização, escravidão e resistência', 'A colonização portuguesa combinou exploração econômica, escravização, violência e múltiplas formas de resistência.', 1),
    ('brasil-colonia-imperio', 'independencia-imperio-cidadania', 'Independência, Império e cidadania limitada', 'A independência conservou estruturas sociais profundas, e o Império construiu cidadania restrita em sociedade escravista.', 2),
    ('brasil-republica', 'primeira-republica-vargas', 'Primeira República e Era Vargas', 'Oligarquias, coronelismo, crise da República Velha, centralização varguista, trabalho e nacionalismo.', 1),
    ('brasil-republica', 'ditadura-redemocratizacao', 'Ditadura e redemocratização', 'Autoritarismo, censura, repressão, crescimento econômico desigual, lutas democráticas e Constituição de 1988.', 2),
    ('historia-geral-moderna', 'absolutismo-iluminismo-revolucoes', 'Absolutismo, Iluminismo e revoluções', 'Mudanças políticas e intelectuais que questionaram privilégios e transformaram a ideia de soberania.', 1),
    ('historia-geral-moderna', 'revolucao-industrial-capitalismo', 'Revolução Industrial e capitalismo', 'Industrialização, urbanização, trabalho assalariado, novas classes sociais e conflitos trabalhistas.', 2),
    ('mundo-contemporaneo', 'imperialismo-guerras-fascismos', 'Imperialismo, guerras e fascismos', 'Disputas imperialistas, guerras mundiais, crise liberal, totalitarismos e reorganização do poder global.', 1),
    ('mundo-contemporaneo', 'guerra-fria-globalizacao', 'Guerra Fria, descolonização e globalização', 'Bipolaridade, conflitos indiretos, independências afro-asiáticas, neoliberalismo e interdependência global.', 2)
)
insert into public.lessons (module_id, slug, title, summary, sort_order, is_active)
select module.id, lesson_seed.lesson_slug, lesson_seed.title, lesson_seed.summary, lesson_seed.sort_order, true
from lesson_seed
join public.subjects subject on subject.slug = 'historia'
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
  where subject.slug = 'historia'
    and module.slug in ('brasil-colonia-imperio', 'brasil-republica', 'historia-geral-moderna', 'mundo-contemporaneo')
)
delete from public.lesson_blocks where lesson_id in (select id from seeded_lessons);

with seeded_lessons as (
  select lesson.id
  from public.lessons lesson
  join public.course_modules module on module.id = lesson.module_id
  join public.subjects subject on subject.id = module.subject_id
  where subject.slug = 'historia'
    and module.slug in ('brasil-colonia-imperio', 'brasil-republica', 'historia-geral-moderna', 'mundo-contemporaneo')
)
delete from public.lesson_exercises where lesson_id in (select id from seeded_lessons);

with block_seed(module_slug, lesson_slug, block_type, title, content, sort_order) as (
  values
    ('brasil-colonia-imperio', 'colonizacao-escravidao-resistencia', 'intro', 'Colonização como sistema', 'A colonização portuguesa na América foi um sistema de exploração territorial, controle político, extração de riquezas e organização do trabalho. Ela não pode ser entendida apenas como chegada europeia: envolveu violência, negociação, adaptação e resistência.', 1),
    ('brasil-colonia-imperio', 'colonizacao-escravidao-resistencia', 'theory', 'Economia, terra e trabalho', 'A plantation açucareira combinou grande propriedade, monocultura, exportação e trabalho escravizado. O tráfico atlântico integrou economia colonial, elites locais, comerciantes europeus e violência contra povos africanos.', 2),
    ('brasil-colonia-imperio', 'colonizacao-escravidao-resistencia', 'example', 'Resistências', 'Resistência não foi apenas revolta aberta. Incluiu fugas, quilombos, preservação cultural, negociação cotidiana, sabotagem, irmandades, compra de alforria e revoltas urbanas.', 3),
    ('brasil-colonia-imperio', 'colonizacao-escravidao-resistencia', 'common_mistake', 'Erro comum', 'Tratar pessoas escravizadas como passivas. A história social mostra ação, estratégia e resistência mesmo em condições extremas de violência.', 4),
    ('brasil-colonia-imperio', 'colonizacao-escravidao-resistencia', 'review', 'Revisão rápida', 'Colonização envolveu território, economia exportadora, escravidão, hierarquia social e resistências. Em prova, conecte estrutura econômica e relações de poder.', 5),

    ('brasil-colonia-imperio', 'independencia-imperio-cidadania', 'intro', 'Independência sem ruptura social profunda', 'A independência brasileira rompeu o vínculo político com Portugal, mas preservou muitas estruturas: escravidão, latifúndio, concentração de poder e exclusão popular.', 1),
    ('brasil-colonia-imperio', 'independencia-imperio-cidadania', 'theory', 'Estado imperial', 'O Império buscou construir unidade territorial e estabilidade política em sociedade profundamente desigual. Cidadania era restrita por renda, gênero, condição jurídica e posição social.', 2),
    ('brasil-colonia-imperio', 'independencia-imperio-cidadania', 'example', 'Abolição tardia', 'A Lei Áurea extinguiu juridicamente a escravidão em 1888, mas não garantiu terra, renda, educação ou reparação. Por isso, desigualdades permaneceram após a abolição.', 3),
    ('brasil-colonia-imperio', 'independencia-imperio-cidadania', 'guided_practice', 'Como analisar', '1. Separe ruptura política e continuidade social. 2. Observe quem participou. 3. Identifique grupos excluídos. 4. Relacione abolição, cidadania e permanências.', 4),
    ('brasil-colonia-imperio', 'independencia-imperio-cidadania', 'review', 'Síntese', 'Independência não significou democracia ampla. Império preservou hierarquias e cidadania limitada. Abolição sem inclusão social gerou permanências.', 5),

    ('brasil-republica', 'primeira-republica-vargas', 'intro', 'República para poucos', 'A Primeira República proclamou novo regime, mas manteve exclusões. O poder político ficou associado a elites regionais, voto restrito, coronelismo e controle social no campo.', 1),
    ('brasil-republica', 'primeira-republica-vargas', 'theory', 'Coronelismo e crise', 'Coronelismo articulava poder local, dependência econômica, voto de cabresto e influência sobre instituições. A crise de 1929, tensões urbanas e disputas entre elites enfraqueceram a República Velha.', 2),
    ('brasil-republica', 'primeira-republica-vargas', 'example', 'Era Vargas', 'Vargas centralizou o Estado, promoveu legislação trabalhista, nacionalismo econômico e controle político. Ao mesmo tempo, combinou direitos sociais com autoritarismo, especialmente no Estado Novo.', 3),
    ('brasil-republica', 'primeira-republica-vargas', 'common_mistake', 'Pegadinha', 'Ver Vargas apenas como protetor dos trabalhadores ou apenas como ditador. A análise correta observa contradições: direitos, propaganda, controle sindical e autoritarismo.', 4),
    ('brasil-republica', 'primeira-republica-vargas', 'review', 'Revisão', 'Primeira República: oligarquias e coronelismo. Vargas: centralização, trabalho, nacionalismo e autoritarismo.', 5),

    ('brasil-republica', 'ditadura-redemocratizacao', 'intro', 'Autoritarismo e sociedade', 'A ditadura civil-militar brasileira restringiu direitos políticos, censurou, perseguiu opositores e organizou projeto de modernização econômica desigual.', 1),
    ('brasil-republica', 'ditadura-redemocratizacao', 'theory', 'Repressão e milagre econômico', 'O regime usou atos institucionais, censura, propaganda, vigilância e repressão. O chamado milagre econômico elevou crescimento em certo período, mas ampliou concentração de renda e dependência externa.', 2),
    ('brasil-republica', 'ditadura-redemocratizacao', 'example', 'Redemocratização', 'Movimentos sociais, sindicatos, estudantes, artistas, imprensa alternativa e campanhas como Diretas Já pressionaram pela abertura. A Constituição de 1988 ampliou direitos e participação.', 3),
    ('brasil-republica', 'ditadura-redemocratizacao', 'guided_practice', 'Roteiro de prova', '1. Identifique mecanismo autoritário. 2. Veja quem foi afetado. 3. Relacione economia e desigualdade. 4. Observe resistência social e reconstrução democrática.', 4),
    ('brasil-republica', 'ditadura-redemocratizacao', 'review', 'Resumo final', 'Ditadura: censura, repressão e autoritarismo. Redemocratização: participação social, Constituição de 1988 e disputa por cidadania.', 5),

    ('historia-geral-moderna', 'absolutismo-iluminismo-revolucoes', 'intro', 'Crise do Antigo Regime', 'A História Moderna europeia envolve centralização monárquica, expansão mercantil, colonialismo e questionamentos intelectuais que abriram espaço para revoluções políticas.', 1),
    ('historia-geral-moderna', 'absolutismo-iluminismo-revolucoes', 'theory', 'Absolutismo e Iluminismo', 'Absolutismo concentrou poder no monarca, apoiado por burocracia, exército e alianças com elites. Iluminismo criticou privilégios, defendeu razão, direitos, liberdade econômica e novas formas de legitimidade política.', 2),
    ('historia-geral-moderna', 'absolutismo-iluminismo-revolucoes', 'example', 'Revolução Francesa', 'A Revolução Francesa expressou crise fiscal, desigualdade social, ideias iluministas e conflito entre ordens sociais. Ela questionou privilégios e transformou a linguagem política moderna.', 3),
    ('historia-geral-moderna', 'absolutismo-iluminismo-revolucoes', 'common_mistake', 'Erro comum', 'Achar que revolução nasce de uma única causa. Revoluções combinam crise econômica, conflito social, ideias políticas e disputa por poder.', 4),
    ('historia-geral-moderna', 'absolutismo-iluminismo-revolucoes', 'review', 'Síntese', 'Absolutismo centraliza. Iluminismo critica privilégios. Revoluções burguesas transformam Estado, cidadania e economia.', 5),

    ('historia-geral-moderna', 'revolucao-industrial-capitalismo', 'intro', 'Máquina, fábrica e sociedade', 'A Revolução Industrial transformou produção, trabalho, cidades, tempo e relações sociais. Não foi apenas invenção técnica: reorganizou economia e vida cotidiana.', 1),
    ('historia-geral-moderna', 'revolucao-industrial-capitalismo', 'theory', 'Capitalismo industrial', 'A fábrica separou trabalhador dos meios de produção e intensificou disciplina do tempo. Cresceram burguesia industrial e proletariado urbano. Jornadas longas e exploração geraram organização operária.', 2),
    ('historia-geral-moderna', 'revolucao-industrial-capitalismo', 'example', 'Urbanização e trabalho', 'Cidades industriais cresceram rapidamente, muitas vezes sem saneamento e moradia adequada. Movimentos trabalhistas lutaram por direitos, redução de jornada e melhores condições.', 3),
    ('historia-geral-moderna', 'revolucao-industrial-capitalismo', 'guided_practice', 'Como interpretar', '1. Veja tecnologia. 2. Relacione com produção. 3. Analise classes sociais. 4. Observe condições de trabalho. 5. Conecte conflito e direitos.', 4),
    ('historia-geral-moderna', 'revolucao-industrial-capitalismo', 'review', 'Revisão', 'Industrialização criou fábrica, proletariado, burguesia industrial, urbanização acelerada e conflitos trabalhistas.', 5),

    ('mundo-contemporaneo', 'imperialismo-guerras-fascismos', 'intro', 'Disputas globais', 'Imperialismo do século XIX e início do XX envolveu expansão econômica, militar e política de potências sobre África, Ásia e outras regiões, gerando exploração e rivalidades.', 1),
    ('mundo-contemporaneo', 'imperialismo-guerras-fascismos', 'theory', 'Guerras e fascismos', 'A Primeira Guerra resultou de rivalidades imperialistas, nacionalismos, alianças e corrida armamentista. A crise do liberalismo, o pós-guerra e a crise de 1929 favoreceram regimes fascistas em alguns países.', 2),
    ('mundo-contemporaneo', 'imperialismo-guerras-fascismos', 'example', 'Totalitarismos', 'Fascismo e nazismo combinaram nacionalismo extremo, autoritarismo, militarismo, propaganda, perseguição a opositores e controle social.', 3),
    ('mundo-contemporaneo', 'imperialismo-guerras-fascismos', 'common_mistake', 'Erro comum', 'Reduzir guerras a assassinatos ou líderes individuais. Eventos pontuais importam, mas conflitos mundiais têm causas estruturais.', 4),
    ('mundo-contemporaneo', 'imperialismo-guerras-fascismos', 'review', 'Resumo', 'Imperialismo amplia rivalidades. Guerras reorganizam poder global. Fascismos respondem a crises com autoritarismo e violência.', 5),

    ('mundo-contemporaneo', 'guerra-fria-globalizacao', 'intro', 'Mundo bipolar e disputas indiretas', 'A Guerra Fria foi marcada por rivalidade entre Estados Unidos e União Soviética, envolvendo ideologia, armas, tecnologia, propaganda, economia e conflitos indiretos.', 1),
    ('mundo-contemporaneo', 'guerra-fria-globalizacao', 'theory', 'Descolonização e Terceiro Mundo', 'Após a Segunda Guerra, movimentos anticoloniais na África e Ásia questionaram dominação europeia. Muitos novos Estados enfrentaram dependência econômica, fronteiras artificiais e disputas internas.', 2),
    ('mundo-contemporaneo', 'guerra-fria-globalizacao', 'example', 'Globalização', 'A globalização ampliou circulação de capitais, mercadorias, informações e pessoas. Também intensificou desigualdades, dependência tecnológica e vulnerabilidade a crises globais.', 3),
    ('mundo-contemporaneo', 'guerra-fria-globalizacao', 'guided_practice', 'Leitura contemporânea', '1. Identifique atores globais. 2. Observe economia e tecnologia. 3. Analise desigualdade. 4. Relacione conflito local a sistema internacional.', 4),
    ('mundo-contemporaneo', 'guerra-fria-globalizacao', 'review', 'Síntese final', 'Guerra Fria: bipolaridade. Descolonização: autonomia e novos desafios. Globalização: integração e desigualdade.', 5)
)
insert into public.lesson_blocks (lesson_id, block_type, title, content, sort_order)
select lesson.id, block_seed.block_type, block_seed.title, block_seed.content, block_seed.sort_order
from block_seed
join public.subjects subject on subject.slug = 'historia'
join public.course_modules module on module.subject_id = subject.id and module.slug = block_seed.module_slug
join public.lessons lesson on lesson.module_id = module.id and lesson.slug = block_seed.lesson_slug;

with exercise_seed(module_slug, lesson_slug, question, exercise_type, choices, correct_answer, explanation, difficulty, sort_order) as (
  values
    ('brasil-colonia-imperio', 'colonizacao-escravidao-resistencia', 'Qual estrutura marcou a economia açucareira colonial?', 'multiple_choice', '["Pequena propriedade policultora para mercado interno", "Grande propriedade, monocultura, exportação e trabalho escravizado", "Indústria urbana assalariada", "Cooperativas indígenas livres", "Economia socialista planejada"]'::jsonb, 'B', 'A plantation colonial articulou latifúndio, monocultura, exportação e escravidão.', 'facil', 1),
    ('brasil-colonia-imperio', 'colonizacao-escravidao-resistencia', 'Explique duas formas de resistência à escravidão.', 'open', '[]'::jsonb, 'Fugas, quilombos, revoltas, preservação cultural, negociação cotidiana, sabotagem, irmandades e compra de alforria são exemplos possíveis.', 'A resposta deve mostrar que resistência foi múltipla, não apenas revolta armada.', 'medio', 2),
    ('brasil-colonia-imperio', 'independencia-imperio-cidadania', 'Por que a independência brasileira não significou ampla democratização?', 'open', '[]'::jsonb, 'Porque preservou escravidão, latifúndio, concentração de poder e exclusão política de grande parte da população.', 'A ruptura foi política, mas muitas estruturas sociais permaneceram.', 'medio', 1),
    ('brasil-colonia-imperio', 'independencia-imperio-cidadania', 'A abolição de 1888 resolveu plenamente a desigualdade racial?', 'multiple_choice', '["Sim, porque garantiu terra e renda", "Não, porque extinguiu a escravidão sem inclusão social ampla", "Sim, porque criou cidadania universal imediata", "Não, porque manteve legalmente a escravidão", "Sim, porque eliminou todo racismo"]'::jsonb, 'B', 'A abolição não veio acompanhada de políticas robustas de inclusão e reparação.', 'facil', 2),

    ('brasil-republica', 'primeira-republica-vargas', 'O coronelismo está associado a:', 'multiple_choice', '["voto livre universal pleno", "controle local, dependência e voto de cabresto", "industrialização socialista", "fim das oligarquias regionais", "democracia direta nacional"]'::jsonb, 'B', 'Coronelismo articulava poder local e controle político em relações de dependência.', 'facil', 1),
    ('brasil-republica', 'primeira-republica-vargas', 'Explique uma contradição da Era Vargas.', 'open', '[]'::jsonb, 'Vargas ampliou legislação trabalhista e centralizou o Estado, mas também controlou sindicatos, usou propaganda e governou de forma autoritária no Estado Novo.', 'A resposta deve reconhecer direitos sociais e autoritarismo.', 'medio', 2),
    ('brasil-republica', 'ditadura-redemocratizacao', 'Qual alternativa caracteriza a ditadura civil-militar brasileira?', 'multiple_choice', '["Pluralismo sem censura", "Censura, repressão e restrição de direitos políticos", "Abolição do Estado", "Federalismo democrático pleno", "Fim da propaganda estatal"]'::jsonb, 'B', 'O regime restringiu liberdades, censurou e reprimiu opositores.', 'facil', 1),
    ('brasil-republica', 'ditadura-redemocratizacao', 'Relacione redemocratização e Constituição de 1988.', 'open', '[]'::jsonb, 'A redemocratização ampliou participação social e culminou na Constituição de 1988, que consolidou direitos civis, políticos e sociais.', 'A resposta deve conectar mobilização social e ampliação de direitos.', 'medio', 2),

    ('historia-geral-moderna', 'absolutismo-iluminismo-revolucoes', 'O Iluminismo criticava principalmente:', 'multiple_choice', '["razão e ciência", "privilégios, absolutismo e autoridade sem crítica", "liberdade de pensamento", "direitos naturais", "educação pública"]'::jsonb, 'B', 'Pensadores iluministas criticaram privilégios e defenderam razão, direitos e novas formas de legitimidade.', 'facil', 1),
    ('historia-geral-moderna', 'absolutismo-iluminismo-revolucoes', 'Por que revoluções não devem ser explicadas por causa única?', 'open', '[]'::jsonb, 'Porque combinam crise econômica, disputas políticas, conflitos sociais, ideias e interesses de grupos diferentes.', 'A resposta deve reconhecer multicausalidade histórica.', 'medio', 2),
    ('historia-geral-moderna', 'revolucao-industrial-capitalismo', 'A Revolução Industrial transformou:', 'multiple_choice', '["apenas técnicas agrícolas", "produção, trabalho, cidades e relações sociais", "somente a religião", "apenas fronteiras nacionais", "exclusivamente a arte"]'::jsonb, 'B', 'Industrialização reorganizou produção, urbanização, classes e conflitos trabalhistas.', 'facil', 1),
    ('historia-geral-moderna', 'revolucao-industrial-capitalismo', 'Explique a relação entre fábrica e proletariado.', 'open', '[]'::jsonb, 'A fábrica concentrou produção e trabalhadores assalariados sem controle dos meios de produção, formando o proletariado urbano industrial.', 'A resposta deve relacionar trabalho assalariado, fábrica e classe social.', 'medio', 2),

    ('mundo-contemporaneo', 'imperialismo-guerras-fascismos', 'O imperialismo europeu esteve ligado a:', 'multiple_choice', '["expansão econômica, domínio político e disputa por mercados", "fim das rivalidades entre potências", "igualdade entre colônias e metrópoles", "ausência de exploração", "isolamento comercial"]'::jsonb, 'A', 'Imperialismo envolveu expansão econômica, política, militar e territorial.', 'facil', 1),
    ('mundo-contemporaneo', 'imperialismo-guerras-fascismos', 'Cite duas características dos fascismos.', 'open', '[]'::jsonb, 'Nacionalismo extremo, autoritarismo, militarismo, propaganda, perseguição a opositores e controle social são características possíveis.', 'A resposta deve indicar elementos políticos e sociais do fascismo.', 'medio', 2),
    ('mundo-contemporaneo', 'guerra-fria-globalizacao', 'A Guerra Fria foi marcada por:', 'multiple_choice', '["rivalidade bipolar entre EUA e URSS", "ausência de propaganda", "fim de todos os conflitos indiretos", "união política mundial", "isolamento tecnológico"]'::jsonb, 'A', 'A Guerra Fria organizou disputas globais em torno de EUA e URSS.', 'facil', 1),
    ('mundo-contemporaneo', 'guerra-fria-globalizacao', 'Explique por que globalização pode integrar e desigualar ao mesmo tempo.', 'open', '[]'::jsonb, 'Porque amplia fluxos de capital, mercadorias e informação, mas países e grupos participam em posições desiguais de poder, tecnologia e renda.', 'A resposta deve reconhecer conexão e hierarquia.', 'medio', 2)
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
join public.subjects subject on subject.slug = 'historia'
join public.course_modules module on module.subject_id = subject.id and module.slug = exercise_seed.module_slug
join public.lessons lesson on lesson.module_id = module.id and lesson.slug = exercise_seed.lesson_slug;

with seeded_lessons as (
  select lesson.id
  from public.lessons lesson
  join public.course_modules module on module.id = lesson.module_id
  join public.subjects subject on subject.id = module.subject_id
  where subject.slug = 'historia'
    and module.slug in ('brasil-colonia-imperio', 'brasil-republica', 'historia-geral-moderna', 'mundo-contemporaneo')
)
delete from public.lesson_sources where lesson_id in (select id from seeded_lessons);

with source_seed(module_slug, lesson_slug, title, url, license, attribution, notes) as (
  values
    ('brasil-colonia-imperio', 'colonizacao-escravidao-resistencia', 'Biblioteca Nacional Digital', 'https://bndigital.bn.gov.br/', 'Consulta pública', 'Fundação Biblioteca Nacional', 'Acervo histórico para documentos, mapas e periódicos.'),
    ('brasil-colonia-imperio', 'independencia-imperio-cidadania', 'Brasiliana Fotográfica', 'https://brasilianafotografica.bn.gov.br/', 'Consulta pública', 'Fundação Biblioteca Nacional / Instituto Moreira Salles', 'Imagens históricas para estudo de sociedade brasileira.'),
    ('brasil-republica', 'ditadura-redemocratizacao', 'Memórias da Ditadura', 'https://memoriasdaditadura.org.br/', 'Uso educacional', 'Instituto Vladimir Herzog', 'Material educativo sobre ditadura, resistência e democracia.'),
    ('historia-geral-moderna', 'revolucao-industrial-capitalismo', 'OpenStax World History Volume 2', 'https://openstax.org/details/books/world-history-volume-2', 'CC BY', 'OpenStax', 'Referência aberta de História Mundial Moderna e Contemporânea.'),
    ('mundo-contemporaneo', 'guerra-fria-globalizacao', 'OpenStax World History Volume 2', 'https://openstax.org/details/books/world-history-volume-2', 'CC BY', 'OpenStax', 'Referência aberta para Guerra Fria, descolonização e globalização.')
)
insert into public.lesson_sources (lesson_id, title, url, license, attribution, notes)
select lesson.id, source_seed.title, source_seed.url, source_seed.license, source_seed.attribution, source_seed.notes
from source_seed
join public.subjects subject on subject.slug = 'historia'
join public.course_modules module on module.subject_id = subject.id and module.slug = source_seed.module_slug
join public.lessons lesson on lesson.module_id = module.id and lesson.slug = source_seed.lesson_slug;

commit;
