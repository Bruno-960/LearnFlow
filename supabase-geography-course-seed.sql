-- LearnFlow - Geography course content seed
-- Run this after supabase-content-schema.sql in the Supabase SQL Editor.
-- Idempotent for the listed Geography modules.

begin;

insert into public.subjects (slug, name, subtitle, icon, sort_order, is_active)
values ('geografia', 'Geografia', 'Espaço, território e ambiente', 'map', 7, true)
on conflict (slug) do update set
  name = excluded.name,
  subtitle = excluded.subtitle,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

with subject as (
  select id from public.subjects where slug = 'geografia'
),
module_seed(slug, title, objective, estimated_minutes, level, sort_order) as (
  values
    ('geopolitica', 'Geopolítica', 'Analisar território, fronteiras, recursos, conflitos, alianças e disputas de poder no espaço mundial.', 260, 'medio', 1),
    ('climatologia', 'Climatologia', 'Interpretar fatores climáticos, massas de ar, tipos de clima, eventos extremos e mudanças climáticas.', 250, 'medio', 2),
    ('cartografia', 'Cartografia', 'Ler mapas, escala, coordenadas, projeções, legendas e representações temáticas.', 230, 'medio', 3),
    ('urbanizacao', 'Urbanização', 'Compreender crescimento urbano, segregação socioespacial, mobilidade, moradia e problemas ambientais urbanos.', 250, 'medio', 4)
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
    ('geopolitica', 'territorio-poder-fronteiras', 'Território, poder e fronteiras', 'Geopolítica interpreta como território, recursos, população e infraestrutura participam das relações de poder.', 1),
    ('geopolitica', 'ordem-mundial-conflitos', 'Ordem mundial e conflitos', 'Disputas econômicas, militares, energéticas e tecnológicas reorganizam alianças e tensões no mundo contemporâneo.', 2),
    ('climatologia', 'fatores-elementos-clima', 'Fatores e elementos do clima', 'Latitude, altitude, maritimidade, massas de ar, pressão e relevo ajudam a explicar temperaturas e chuvas.', 1),
    ('climatologia', 'climas-impactos-mudancas', 'Tipos de clima e mudanças climáticas', 'A leitura climática conecta paisagem, agricultura, cidades, eventos extremos e ação humana.', 2),
    ('cartografia', 'escala-coordenadas-orientacao', 'Escala, coordenadas e orientação', 'Mapas transformam espaço real em representação, exigindo leitura de escala, latitude, longitude e orientação.', 1),
    ('cartografia', 'projecoes-mapas-tematicos', 'Projeções e mapas temáticos', 'Toda projeção distorce algo; mapas temáticos selecionam dados para revelar padrões espaciais.', 2),
    ('urbanizacao', 'processo-urbanizacao', 'Processo de urbanização', 'Urbanização envolve crescimento da população urbana, concentração de serviços e transformação do território.', 1),
    ('urbanizacao', 'segregacao-mobilidade-ambiente', 'Segregação, mobilidade e ambiente urbano', 'Cidades expressam desigualdades por moradia, transporte, saneamento, risco ambiental e acesso a serviços.', 2)
)
insert into public.lessons (module_id, slug, title, summary, sort_order, is_active)
select module.id, lesson_seed.lesson_slug, lesson_seed.title, lesson_seed.summary, lesson_seed.sort_order, true
from lesson_seed
join public.subjects subject on subject.slug = 'geografia'
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
  where subject.slug = 'geografia'
    and module.slug in ('geopolitica', 'climatologia', 'cartografia', 'urbanizacao')
)
delete from public.lesson_blocks where lesson_id in (select id from seeded_lessons);

with seeded_lessons as (
  select lesson.id
  from public.lessons lesson
  join public.course_modules module on module.id = lesson.module_id
  join public.subjects subject on subject.id = module.subject_id
  where subject.slug = 'geografia'
    and module.slug in ('geopolitica', 'climatologia', 'cartografia', 'urbanizacao')
)
delete from public.lesson_exercises where lesson_id in (select id from seeded_lessons);

with block_seed(module_slug, lesson_slug, block_type, title, content, sort_order) as (
  values
    ('geopolitica', 'territorio-poder-fronteiras', 'intro', 'Poder visto no mapa', 'Geopolítica estuda como o espaço geográfico participa das relações de poder. Território, fronteiras, rotas, recursos naturais, tecnologia, população e infraestrutura influenciam decisões de Estados e empresas.', 1),
    ('geopolitica', 'territorio-poder-fronteiras', 'theory', 'Território não é só área', 'Território é espaço apropriado por relações de poder. Ele envolve controle, identidade, leis, segurança, recursos e circulação. Uma fronteira pode separar países, mas também organizar fluxos comerciais, migrações e conflitos.', 2),
    ('geopolitica', 'territorio-poder-fronteiras', 'example', 'Recursos estratégicos', 'Petróleo, água, terras raras, alimentos, portos e corredores logísticos podem aumentar a importância de uma região. A disputa por recursos não depende só da existência do recurso, mas da capacidade de controlar e transportar.', 3),
    ('geopolitica', 'territorio-poder-fronteiras', 'common_mistake', 'Erro comum', 'Achar que geopolítica é apenas guerra. Ela também inclui comércio, energia, tecnologia, diplomacia, sanções, infraestrutura, empresas e organismos internacionais.', 4),
    ('geopolitica', 'territorio-poder-fronteiras', 'review', 'Revisão rápida', 'Território é poder organizado no espaço. Fronteiras controlam fluxos. Recursos podem ser estratégicos. Rotas conectam economia e política.', 5),

    ('geopolitica', 'ordem-mundial-conflitos', 'intro', 'Ordem mundial', 'Ordem mundial é a forma como poder econômico, militar, tecnológico e político se distribui entre países e blocos. Ela muda conforme guerras, crises, inovação e reorganização produtiva.', 1),
    ('geopolitica', 'ordem-mundial-conflitos', 'theory', 'Multipolaridade e dependência', 'No mundo atual, poder se expressa por blocos econômicos, cadeias produtivas, tecnologia, energia, finanças e capacidade militar. Países podem ser politicamente independentes e economicamente dependentes.', 2),
    ('geopolitica', 'ordem-mundial-conflitos', 'example', 'Cadeias globais', 'Um produto pode ser projetado em um país, montado em outro, usar matéria-prima de outro continente e ser vendido globalmente. Isso cria interdependência e vulnerabilidade em crises.', 3),
    ('geopolitica', 'ordem-mundial-conflitos', 'guided_practice', 'Como ler conflito geopolítico', '1. Identifique atores. 2. Localize território e recursos. 3. Observe alianças. 4. Veja interesses econômicos e militares. 5. Analise impactos regionais e globais.', 4),
    ('geopolitica', 'ordem-mundial-conflitos', 'review', 'Resumo final', 'Conflitos têm causas múltiplas. Ordem mundial envolve economia, tecnologia, energia e força militar. Interdependência não elimina disputas.', 5),

    ('climatologia', 'fatores-elementos-clima', 'intro', 'Tempo e clima', 'Tempo atmosférico é condição momentânea. Clima é padrão observado ao longo de anos. Climatologia analisa elementos como temperatura, chuva, umidade, pressão e ventos, além de fatores como latitude, altitude e relevo.', 1),
    ('climatologia', 'fatores-elementos-clima', 'theory', 'Fatores climáticos', 'Latitude influencia radiação solar. Altitude reduz temperatura média. Maritimidade suaviza amplitudes térmicas. Continentalidade aumenta extremos. Massas de ar transportam calor e umidade.', 2),
    ('climatologia', 'fatores-elementos-clima', 'example', 'Litoral e interior', 'Cidades litorâneas tendem a ter menor amplitude térmica por influência do oceano. Áreas interiores costumam aquecer e resfriar mais rapidamente.', 3),
    ('climatologia', 'fatores-elementos-clima', 'common_mistake', 'Erro comum', 'Confundir clima com tempo. Chuva hoje é tempo. Padrão de chuva de uma região ao longo de décadas é clima.', 4),
    ('climatologia', 'fatores-elementos-clima', 'review', 'Revisão rápida', 'Tempo é momentâneo. Clima é padrão. Latitude, altitude, massas de ar, relevo e maritimidade ajudam a explicar diferenças climáticas.', 5),

    ('climatologia', 'climas-impactos-mudancas', 'intro', 'Clima e sociedade', 'Climas condicionam agricultura, vegetação, recursos hídricos, riscos naturais e formas de ocupação. Mas impactos dependem também de infraestrutura, renda, planejamento e políticas públicas.', 1),
    ('climatologia', 'climas-impactos-mudancas', 'theory', 'Mudanças climáticas', 'Mudanças climáticas envolvem alteração de padrões médios e extremos. A intensificação do efeito estufa por atividades humanas aumenta temperatura média, altera chuvas e eleva riscos de eventos extremos.', 2),
    ('climatologia', 'climas-impactos-mudancas', 'example', 'Ilhas de calor', 'Áreas urbanas com muito asfalto, concreto, pouca vegetação e alta circulação de veículos tendem a registrar temperaturas maiores que áreas rurais próximas.', 3),
    ('climatologia', 'climas-impactos-mudancas', 'guided_practice', 'Como analisar questão climática', '1. Separe fator natural e ação humana. 2. Observe escala local, regional ou global. 3. Leia dados de chuva e temperatura. 4. Relacione impacto social e ambiental.', 4),
    ('climatologia', 'climas-impactos-mudancas', 'review', 'Resumo final', 'Clima influencia paisagens e atividades humanas. Vulnerabilidade social amplifica impactos. Mudanças climáticas alteram médias e extremos.', 5),

    ('cartografia', 'escala-coordenadas-orientacao', 'intro', 'Mapa é representação', 'Mapa não é cópia neutra do mundo. Ele seleciona informações, reduz distâncias, usa símbolos e depende de escala. Ler mapa exige entender o que foi representado e o que ficou de fora.', 1),
    ('cartografia', 'escala-coordenadas-orientacao', 'theory', 'Escala e coordenadas', 'Escala indica relação entre distância no mapa e distância real. Latitude mede distância em graus ao norte ou sul do Equador. Longitude mede distância a leste ou oeste de Greenwich.', 2),
    ('cartografia', 'escala-coordenadas-orientacao', 'example', 'Escala numérica', 'Em escala 1:100.000, 1 cm no mapa representa 100.000 cm na realidade, ou 1 km. Converter unidades é parte essencial da leitura cartográfica.', 3),
    ('cartografia', 'escala-coordenadas-orientacao', 'common_mistake', 'Erro comum', 'Achar que escala grande mostra área maior. Escala grande mostra mais detalhes em área menor. Escala pequena mostra área maior com menos detalhes.', 4),
    ('cartografia', 'escala-coordenadas-orientacao', 'review', 'Revisão rápida', 'Escala relaciona mapa e realidade. Latitude vem do Equador. Longitude vem de Greenwich. Legenda traduz símbolos.', 5),

    ('cartografia', 'projecoes-mapas-tematicos', 'intro', 'Toda projeção distorce', 'A Terra é aproximadamente esférica, mas o mapa é plano. Projeções cartográficas transformam superfície curva em plano e sempre distorcem área, forma, distância ou direção.', 1),
    ('cartografia', 'projecoes-mapas-tematicos', 'theory', 'Mapas temáticos', 'Mapas temáticos representam fenômenos específicos: população, clima, renda, vegetação, fluxos, indústria, risco ambiental. A escolha de cores, classes e legenda influencia a interpretação.', 2),
    ('cartografia', 'projecoes-mapas-tematicos', 'example', 'Mercator e Peters', 'Mercator preserva formas locais e favorece navegação, mas amplia áreas de altas latitudes. Peters busca preservar proporção de áreas, mas altera formas.', 3),
    ('cartografia', 'projecoes-mapas-tematicos', 'guided_practice', 'Roteiro de mapa temático', '1. Leia título. 2. Confira legenda. 3. Observe escala. 4. Identifique padrão espacial. 5. Veja exceções e concentração.', 4),
    ('cartografia', 'projecoes-mapas-tematicos', 'review', 'Resumo final', 'Projeções têm distorções. Mapas temáticos mostram fenômenos. Legenda e escala são parte da informação, não detalhe decorativo.', 5),

    ('urbanizacao', 'processo-urbanizacao', 'intro', 'Cidade como processo', 'Urbanização é o aumento da população urbana em relação à rural e a expansão do modo de vida urbano. Ela envolve indústria, serviços, infraestrutura, mercado de trabalho e redes de transporte.', 1),
    ('urbanizacao', 'processo-urbanizacao', 'theory', 'Urbanização brasileira', 'No Brasil, a urbanização acelerou no século XX com industrialização, êxodo rural e concentração de serviços. O crescimento rápido sem planejamento ampliou desigualdades urbanas.', 2),
    ('urbanizacao', 'processo-urbanizacao', 'example', 'Rede urbana', 'Cidades se conectam por fluxos de pessoas, mercadorias, informações e capitais. Metrópoles exercem influência sobre cidades menores por serviços especializados e infraestrutura.', 3),
    ('urbanizacao', 'processo-urbanizacao', 'common_mistake', 'Erro comum', 'Confundir crescimento urbano com qualidade urbana. Uma cidade pode crescer muito e ainda ter moradia precária, transporte ruim e saneamento insuficiente.', 4),
    ('urbanizacao', 'processo-urbanizacao', 'review', 'Revisão rápida', 'Urbanização é processo demográfico e espacial. Rede urbana organiza fluxos. Crescimento sem planejamento amplia desigualdades.', 5),

    ('urbanizacao', 'segregacao-mobilidade-ambiente', 'intro', 'Desigualdade no espaço urbano', 'Segregação socioespacial ocorre quando grupos sociais têm acesso desigual a moradia, transporte, saneamento, lazer, trabalho e serviços. A cidade revela desigualdades no próprio território.', 1),
    ('urbanizacao', 'segregacao-mobilidade-ambiente', 'theory', 'Mobilidade e ambiente', 'Mobilidade urbana depende de transporte coletivo, distância entre casa e trabalho, renda, infraestrutura e segurança. Problemas ambientais urbanos incluem enchentes, ilhas de calor, poluição e impermeabilização do solo.', 2),
    ('urbanizacao', 'segregacao-mobilidade-ambiente', 'example', 'Enchentes urbanas', 'Impermeabilização do solo reduz infiltração. Córregos canalizados, lixo, ocupação de áreas de risco e falta de drenagem aumentam enchentes.', 3),
    ('urbanizacao', 'segregacao-mobilidade-ambiente', 'guided_practice', 'Como analisar problema urbano', '1. Identifique quem é afetado. 2. Veja infraestrutura disponível. 3. Relacione renda e localização. 4. Separe causa imediata e causa estrutural.', 4),
    ('urbanizacao', 'segregacao-mobilidade-ambiente', 'review', 'Resumo final', 'Cidade é rede de fluxos e desigualdades. Mobilidade ruim limita acesso. Problemas ambientais urbanos são sociais e físicos ao mesmo tempo.', 5)
)
insert into public.lesson_blocks (lesson_id, block_type, title, content, sort_order)
select lesson.id, block_seed.block_type, block_seed.title, block_seed.content, block_seed.sort_order
from block_seed
join public.subjects subject on subject.slug = 'geografia'
join public.course_modules module on module.subject_id = subject.id and module.slug = block_seed.module_slug
join public.lessons lesson on lesson.module_id = module.id and lesson.slug = block_seed.lesson_slug;

with exercise_seed(module_slug, lesson_slug, question, exercise_type, choices, correct_answer, explanation, difficulty, sort_order) as (
  values
    ('geopolitica', 'territorio-poder-fronteiras', 'Geopolítica analisa principalmente:', 'multiple_choice', '["apenas relevo", "relações de poder no espaço", "somente clima", "cálculo de escalas", "classes gramaticais"]'::jsonb, 'B', 'Geopolítica conecta poder, território, recursos, fronteiras e fluxos.', 'facil', 1),
    ('geopolitica', 'territorio-poder-fronteiras', 'Explique por que um recurso natural pode se tornar estratégico.', 'open', '[]'::jsonb, 'Porque pode influenciar economia, energia, tecnologia, segurança e disputas territoriais quando é escasso ou essencial.', 'A resposta deve ligar recurso a poder e controle territorial.', 'medio', 2),
    ('geopolitica', 'ordem-mundial-conflitos', 'Ordem mundial envolve:', 'multiple_choice', '["somente mapas físicos", "distribuição de poder econômico, político, militar e tecnológico", "apenas vegetação", "só população rural", "somente coordenadas"]'::jsonb, 'B', 'Ordem mundial expressa a distribuição de poder entre países e blocos.', 'facil', 1),
    ('geopolitica', 'ordem-mundial-conflitos', 'Por que cadeias globais criam interdependência?', 'open', '[]'::jsonb, 'Porque produção, matéria-prima, tecnologia, transporte e consumo ficam distribuídos entre diferentes países.', 'A resposta deve mencionar etapas produtivas em diferentes lugares.', 'medio', 2),

    ('climatologia', 'fatores-elementos-clima', 'Clima é:', 'multiple_choice', '["condição atmosférica de um único dia", "padrão atmosférico observado por longo período", "sinônimo de relevo", "apenas temperatura máxima", "mapa político"]'::jsonb, 'B', 'Clima é padrão de longo prazo; tempo é condição momentânea.', 'facil', 1),
    ('climatologia', 'fatores-elementos-clima', 'Diferencie maritimidade e continentalidade.', 'open', '[]'::jsonb, 'Maritimidade suaviza amplitudes térmicas pela influência oceânica; continentalidade tende a ampliar extremos térmicos no interior.', 'A resposta deve relacionar distância do mar e variação térmica.', 'medio', 2),
    ('climatologia', 'climas-impactos-mudancas', 'Ilhas de calor são associadas a:', 'multiple_choice', '["mais vegetação e menos concreto", "concreto, asfalto, pouca vegetação e intensa atividade urbana", "somente latitude", "rotação da Terra", "projeções cartográficas"]'::jsonb, 'B', 'Superfícies urbanas retêm calor e reduzem evapotranspiração.', 'facil', 1),
    ('climatologia', 'climas-impactos-mudancas', 'Explique por que vulnerabilidade social aumenta impactos climáticos.', 'open', '[]'::jsonb, 'Porque populações com menos infraestrutura, renda e serviços têm menor capacidade de prevenção, adaptação e recuperação.', 'A resposta deve ligar risco climático e desigualdade social.', 'medio', 2),

    ('cartografia', 'escala-coordenadas-orientacao', 'Em escala 1:100.000, 1 cm representa:', 'multiple_choice', '["1 m", "10 m", "100 m", "1 km", "100 km"]'::jsonb, 'D', '100.000 cm equivalem a 1.000 m, ou 1 km.', 'facil', 1),
    ('cartografia', 'escala-coordenadas-orientacao', 'Explique a diferença entre latitude e longitude.', 'open', '[]'::jsonb, 'Latitude mede distância em graus ao norte ou sul do Equador; longitude mede distância a leste ou oeste de Greenwich.', 'A resposta deve citar Equador e Greenwich.', 'medio', 2),
    ('cartografia', 'projecoes-mapas-tematicos', 'Toda projeção cartográfica:', 'multiple_choice', '["elimina qualquer distorção", "distorce alguma propriedade", "serve apenas para clima", "não usa escala", "dispensa legenda"]'::jsonb, 'B', 'Transformar superfície curva em plano gera distorções.', 'facil', 1),
    ('cartografia', 'projecoes-mapas-tematicos', 'Por que a legenda é essencial em mapas temáticos?', 'open', '[]'::jsonb, 'Porque traduz símbolos, cores e classes usados para representar o fenômeno espacial.', 'A resposta deve mencionar símbolos ou cores e interpretação.', 'medio', 2),

    ('urbanizacao', 'processo-urbanizacao', 'Urbanização é:', 'multiple_choice', '["aumento relativo da população urbana", "apenas construção de prédios altos", "redução de serviços", "somente migração internacional", "sinônimo de clima urbano"]'::jsonb, 'A', 'Urbanização envolve crescimento da população urbana em relação à rural e expansão do modo de vida urbano.', 'facil', 1),
    ('urbanizacao', 'processo-urbanizacao', 'Por que crescimento urbano não significa qualidade urbana?', 'open', '[]'::jsonb, 'Porque a cidade pode crescer sem moradia adequada, saneamento, transporte, planejamento e acesso a serviços.', 'A resposta deve separar crescimento quantitativo e qualidade de infraestrutura.', 'medio', 2),
    ('urbanizacao', 'segregacao-mobilidade-ambiente', 'Segregação socioespacial significa:', 'multiple_choice', '["distribuição igual de serviços", "acesso desigual ao espaço urbano e seus serviços", "apenas chuva intensa", "escala cartográfica", "variação de latitude"]'::jsonb, 'B', 'Segregação expressa desigualdade territorial de renda, moradia, transporte e serviços.', 'facil', 1),
    ('urbanizacao', 'segregacao-mobilidade-ambiente', 'Explique uma causa urbana de enchentes.', 'open', '[]'::jsonb, 'Impermeabilização do solo, ocupação de áreas de risco, lixo, canalização inadequada ou falta de drenagem reduzem infiltração e aumentam escoamento.', 'A resposta deve apontar causa urbana e efeito sobre água.', 'medio', 2)
)
insert into public.lesson_exercises (lesson_id, question, exercise_type, choices, correct_answer, explanation, difficulty, sort_order)
select lesson.id, exercise_seed.question, exercise_seed.exercise_type, exercise_seed.choices, exercise_seed.correct_answer, exercise_seed.explanation, exercise_seed.difficulty, exercise_seed.sort_order
from exercise_seed
join public.subjects subject on subject.slug = 'geografia'
join public.course_modules module on module.subject_id = subject.id and module.slug = exercise_seed.module_slug
join public.lessons lesson on lesson.module_id = module.id and lesson.slug = exercise_seed.lesson_slug;

with seeded_lessons as (
  select lesson.id
  from public.lessons lesson
  join public.course_modules module on module.id = lesson.module_id
  join public.subjects subject on subject.id = module.subject_id
  where subject.slug = 'geografia'
    and module.slug in ('geopolitica', 'climatologia', 'cartografia', 'urbanizacao')
)
delete from public.lesson_sources where lesson_id in (select id from seeded_lessons);

with source_seed(module_slug, lesson_slug, title, url, license, attribution, notes) as (
  values
    ('geopolitica', 'territorio-poder-fronteiras', 'OpenStax World Regional Geography', 'https://openstax.org/details/books/world-regional-geography', 'CC BY', 'OpenStax', 'Referência aberta para território, regiões, recursos e relações espaciais.'),
    ('climatologia', 'fatores-elementos-clima', 'OpenStax World Regional Geography - Climate and Environment', 'https://openstax.org/details/books/world-regional-geography', 'CC BY', 'OpenStax', 'Referência aberta para clima, ambientes e impactos regionais.'),
    ('cartografia', 'escala-coordenadas-orientacao', 'OpenStax World Regional Geography - Maps and Spatial Thinking', 'https://openstax.org/details/books/world-regional-geography', 'CC BY', 'OpenStax', 'Referência aberta para mapas, escala e leitura espacial.'),
    ('urbanizacao', 'processo-urbanizacao', 'OpenStax World Regional Geography - Urbanization', 'https://openstax.org/details/books/world-regional-geography', 'CC BY', 'OpenStax', 'Referência aberta para urbanização e geografia urbana.')
)
insert into public.lesson_sources (lesson_id, title, url, license, attribution, notes)
select lesson.id, source_seed.title, source_seed.url, source_seed.license, source_seed.attribution, source_seed.notes
from source_seed
join public.subjects subject on subject.slug = 'geografia'
join public.course_modules module on module.subject_id = subject.id and module.slug = source_seed.module_slug
join public.lessons lesson on lesson.module_id = module.id and lesson.slug = source_seed.lesson_slug;

commit;
