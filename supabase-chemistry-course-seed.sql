-- LearnFlow - Chemistry course content seed
-- Run this after supabase-content-schema.sql in the Supabase SQL Editor.
-- This file is idempotent for the listed Chemistry lessons: it updates modules/lessons
-- and replaces blocks/exercises for those lessons.

begin;

insert into public.subjects (slug, name, subtitle, icon, sort_order, is_active)
values ('quimica', 'Química', 'Matéria, energia e transformações', 'flask', 3, true)
on conflict (slug) do update set
  name = excluded.name,
  subtitle = excluded.subtitle,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

with subject as (
  select id from public.subjects where slug = 'quimica'
),
module_seed(slug, title, objective, estimated_minutes, level, sort_order) as (
  values
    (
      'ligacoes-quimicas',
      'Ligações Químicas',
      'Entender por que os átomos se ligam, como surgem ligações iônicas, covalentes e metálicas, e como isso explica propriedades dos materiais.',
      180,
      'medio',
      1
    ),
    (
      'estequiometria',
      'Estequiometria',
      'Usar equações balanceadas para relacionar mol, massa, volume, quantidade de partículas, rendimento e reagente limitante.',
      210,
      'medio',
      2
    ),
    (
      'termoquimica',
      'Termoquímica',
      'Compreender calor, entalpia, reações exotérmicas e endotérmicas, Lei de Hess e energia de ligação em problemas químicos reais.',
      210,
      'medio',
      3
    ),
    (
      'eletroquimica',
      'Eletroquímica',
      'Interpretar oxidação, redução, pilhas, eletrólise, corrosão e aplicações tecnológicas envolvendo transferência de elétrons.',
      240,
      'avancado',
      4
    )
)
insert into public.course_modules (subject_id, slug, title, objective, estimated_minutes, level, sort_order, is_active)
select
  subject.id,
  module_seed.slug,
  module_seed.title,
  module_seed.objective,
  module_seed.estimated_minutes,
  module_seed.level,
  module_seed.sort_order,
  true
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
    (
      'ligacoes-quimicas',
      'por-que-atomos-se-ligam',
      'Por que átomos se ligam',
      'A estabilidade química depende de energia, distribuição eletrônica e atração entre cargas. Esta aula constrói a lógica antes das classificações.',
      1
    ),
    (
      'ligacoes-quimicas',
      'geometria-polaridade-propriedades',
      'Geometria, polaridade e propriedades',
      'A forma da molécula e a distribuição de cargas explicam solubilidade, temperaturas de fusão e ebulição, dureza e condutividade.',
      2
    ),
    (
      'estequiometria',
      'mol-equacao-balanceada',
      'Mol e equação balanceada',
      'A equação química balanceada é uma proporção entre quantidades de matéria; mol é a ponte entre mundo microscópico e medidas de laboratório.',
      1
    ),
    (
      'estequiometria',
      'limitante-rendimento-pureza',
      'Reagente limitante, rendimento e pureza',
      'Problemas reais raramente usam reagentes ideais: há excesso, perdas, impurezas e rendimento menor que 100%.',
      2
    ),
    (
      'termoquimica',
      'energia-nas-reacoes',
      'Energia nas reações químicas',
      'Calor, temperatura e entalpia ajudam a interpretar se uma transformação libera ou absorve energia.',
      1
    ),
    (
      'termoquimica',
      'hess-energia-ligacao',
      'Lei de Hess e energia de ligação',
      'A variação de entalpia pode ser calculada por caminhos equivalentes ou pela diferença entre ligações rompidas e formadas.',
      2
    ),
    (
      'eletroquimica',
      'oxidacao-reducao-pilhas',
      'Oxidação, redução e pilhas',
      'Reações redox transferem elétrons; em pilhas, essa transferência é organizada para gerar corrente elétrica.',
      1
    ),
    (
      'eletroquimica',
      'eletrolise-corrosao-aplicacoes',
      'Eletrólise, corrosão e aplicações',
      'A eletrólise força reações não espontâneas; corrosão, galvanização, baterias e reciclagem dependem dessa lógica.',
      2
    )
)
insert into public.lessons (module_id, slug, title, summary, sort_order, is_active)
select
  module.id,
  lesson_seed.lesson_slug,
  lesson_seed.title,
  lesson_seed.summary,
  lesson_seed.sort_order,
  true
from lesson_seed
join public.subjects subject on subject.slug = 'quimica'
join public.course_modules module
  on module.subject_id = subject.id
  and module.slug = lesson_seed.module_slug
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
  where subject.slug = 'quimica'
    and module.slug in ('ligacoes-quimicas', 'estequiometria', 'termoquimica', 'eletroquimica')
    and lesson.slug in (
      'por-que-atomos-se-ligam',
      'geometria-polaridade-propriedades',
      'mol-equacao-balanceada',
      'limitante-rendimento-pureza',
      'energia-nas-reacoes',
      'hess-energia-ligacao',
      'oxidacao-reducao-pilhas',
      'eletrolise-corrosao-aplicacoes'
    )
)
delete from public.lesson_blocks
where lesson_id in (select id from seeded_lessons);

with seeded_lessons as (
  select lesson.id
  from public.lessons lesson
  join public.course_modules module on module.id = lesson.module_id
  join public.subjects subject on subject.id = module.subject_id
  where subject.slug = 'quimica'
    and module.slug in ('ligacoes-quimicas', 'estequiometria', 'termoquimica', 'eletroquimica')
    and lesson.slug in (
      'por-que-atomos-se-ligam',
      'geometria-polaridade-propriedades',
      'mol-equacao-balanceada',
      'limitante-rendimento-pureza',
      'energia-nas-reacoes',
      'hess-energia-ligacao',
      'oxidacao-reducao-pilhas',
      'eletrolise-corrosao-aplicacoes'
    )
)
delete from public.lesson_exercises
where lesson_id in (select id from seeded_lessons);

with block_seed(module_slug, lesson_slug, block_type, title, content, sort_order) as (
  values
    (
      'ligacoes-quimicas',
      'por-que-atomos-se-ligam',
      'intro',
      'O problema central',
      'Átomos não se ligam porque querem completar uma regra decorada. Eles se ligam quando o conjunto formado tem menor energia e maior estabilidade do que os átomos separados.

A regra do octeto é uma aproximação útil para muitos elementos representativos, mas não explica todos os casos. A lógica mais segura é observar energia, atração entre cargas e configuração eletrônica.',
      1
    ),
    (
      'ligacoes-quimicas',
      'por-que-atomos-se-ligam',
      'theory',
      'Ligações iônicas, covalentes e metálicas',
      'Na ligação iônica, ocorre forte atração entre íons de cargas opostas. Em geral, metal perde elétrons e ametal ganha elétrons, formando um retículo cristalino.

Na ligação covalente, átomos compartilham pares de elétrons. Ela aparece principalmente entre ametais e explica moléculas como água, gás oxigênio e dióxido de carbono.

Na ligação metálica, cátions metálicos ficam organizados em rede e elétrons se movem com relativa liberdade. Essa mobilidade explica brilho, maleabilidade, ductilidade e condução elétrica.',
      2
    ),
    (
      'ligacoes-quimicas',
      'por-que-atomos-se-ligam',
      'example',
      'Exemplo guiado: NaCl e H2O',
      'No NaCl, o sódio tende a formar Na+ e o cloro tende a formar Cl-. A atração eletrostática entre os íons cria um sólido iônico de alto ponto de fusão.

Na água, oxigênio e hidrogênio compartilham elétrons. Como o oxigênio atrai mais fortemente esses elétrons, a ligação O-H é polar e a molécula apresenta distribuição desigual de cargas.',
      3
    ),
    (
      'ligacoes-quimicas',
      'por-que-atomos-se-ligam',
      'common_mistake',
      'Erro comum',
      'Não confunda ligação iônica com transferência permanente em molécula isolada. Compostos iônicos formam retículos, não pares isolados simples. Também não use a regra do octeto como lei absoluta: Be, B, P, S e elementos de transição podem fugir da previsão simples.',
      4
    ),
    (
      'ligacoes-quimicas',
      'por-que-atomos-se-ligam',
      'visual_summary',
      'Mapa visual',
      'Energia menor -> sistema mais estável -> ligação química.

Metal + ametal -> tendência iônica.
Ametal + ametal -> tendência covalente.
Metal + metal -> ligação metálica.

Propriedades observáveis confirmam a hipótese: condução, ponto de fusão, solubilidade e estado físico.',
      5
    ),
    (
      'ligacoes-quimicas',
      'por-que-atomos-se-ligam',
      'review',
      'Revisão rápida',
      'Pergunte sempre: quais partículas interagem? Há íons? Há compartilhamento? Há elétrons livres? A resposta explica a ligação e antecipa propriedades macroscópicas.',
      6
    ),

    (
      'ligacoes-quimicas',
      'geometria-polaridade-propriedades',
      'intro',
      'Da ligação para a forma',
      'Depois de identificar o tipo de ligação, o próximo passo é entender a forma da molécula. Geometria molecular depende da repulsão entre pares de elétrons na camada de valência.

A forma não é detalhe estético: ela decide se os dipolos se anulam, se a molécula é polar e como ela interage com outras substâncias.',
      1
    ),
    (
      'ligacoes-quimicas',
      'geometria-polaridade-propriedades',
      'theory',
      'Polaridade molecular',
      'Uma ligação polar ocorre quando há diferença de eletronegatividade entre os átomos. Porém, uma molécula com ligações polares pode ser apolar se a geometria fizer os dipolos se cancelarem.

CO2 é linear: os dipolos C=O se anulam. H2O é angular: os dipolos O-H não se anulam. Por isso, água é polar e interage bem com íons e moléculas polares.',
      2
    ),
    (
      'ligacoes-quimicas',
      'geometria-polaridade-propriedades',
      'example',
      'Solubilidade como evidência',
      'Óleo não se mistura bem com água porque suas moléculas são majoritariamente apolares, enquanto a água é polar. Já sal de cozinha dissolve em água porque a água estabiliza íons Na+ e Cl- por interações íon-dipolo.',
      3
    ),
    (
      'ligacoes-quimicas',
      'geometria-polaridade-propriedades',
      'guided_practice',
      'Roteiro de resolução',
      '1. Desenhe ou imagine a estrutura.
2. Identifique ligações polares.
3. Analise a geometria.
4. Verifique se os dipolos se cancelam.
5. Relacione a polaridade com solubilidade, ebulição ou interação intermolecular.',
      4
    ),
    (
      'ligacoes-quimicas',
      'geometria-polaridade-propriedades',
      'common_mistake',
      'Pegadinha recorrente',
      'Dizer que toda molécula com ligação polar é polar é erro clássico. A molécula inteira depende da soma vetorial dos dipolos, não apenas da existência de ligações polares.',
      5
    ),
    (
      'ligacoes-quimicas',
      'geometria-polaridade-propriedades',
      'review',
      'Resumo de prova',
      'Tipo de ligação explica a natureza da interação. Geometria explica forma. Polaridade explica interação com outras substâncias. Juntas, essas três camadas explicam propriedades.',
      6
    ),

    (
      'estequiometria',
      'mol-equacao-balanceada',
      'intro',
      'A receita da reação',
      'Uma equação química balanceada funciona como receita proporcional. Se a equação diz 2 H2 + O2 -> 2 H2O, ela afirma que 2 mol de H2 reagem com 1 mol de O2 para formar 2 mol de H2O.

O aluno erra estequiometria quando tenta decorar regra. O caminho seguro é sempre converter o dado para mol, usar a proporção da equação e converter para a unidade pedida.',
      1
    ),
    (
      'estequiometria',
      'mol-equacao-balanceada',
      'theory',
      'Mol, massa e partículas',
      'Mol é quantidade de matéria. Um mol contém aproximadamente 6,02 x 10^23 entidades. A massa molar, em g/mol, permite converter massa em mol.

Fórmula essencial: n = m / M. Depois de encontrar n, use os coeficientes da equação balanceada para descobrir a quantidade de outra substância.',
      2
    ),
    (
      'estequiometria',
      'mol-equacao-balanceada',
      'example',
      'Exemplo resolvido',
      'Na reação N2 + 3 H2 -> 2 NH3, quantos mol de NH3 são produzidos a partir de 6 mol de H2?

Pela equação, 3 mol de H2 produzem 2 mol de NH3. Se há 6 mol de H2, o dobro, serão formados 4 mol de NH3.',
      3
    ),
    (
      'estequiometria',
      'mol-equacao-balanceada',
      'guided_practice',
      'Algoritmo seguro',
      '1. Balanceie a equação.
2. Circule o dado e o pedido.
3. Converta o dado para mol.
4. Use a proporção dos coeficientes.
5. Converta o resultado para a unidade final.
6. Confira se a ordem de grandeza faz sentido.',
      4
    ),
    (
      'estequiometria',
      'mol-equacao-balanceada',
      'common_mistake',
      'Erro comum',
      'Usar massa diretamente na proporção dos coeficientes. Os coeficientes comparam mol, não gramas. Se o problema fornece massa, primeiro converta para mol.',
      5
    ),
    (
      'estequiometria',
      'mol-equacao-balanceada',
      'review',
      'Revisão rápida',
      'Balanceamento define proporção. Mol conecta quantidade microscópica e medida macroscópica. Massa molar converte gramas em mol. A estequiometria é uma cadeia de conversões.',
      6
    ),

    (
      'estequiometria',
      'limitante-rendimento-pureza',
      'intro',
      'Quando a reação não é ideal',
      'Em laboratório e indústria, raramente os reagentes aparecem em proporção perfeita. Um reagente acaba primeiro e limita a quantidade de produto. Outros podem estar em excesso.

Além disso, nem todo processo rende 100%. Perdas, reações paralelas e impurezas reduzem a quantidade final.',
      1
    ),
    (
      'estequiometria',
      'limitante-rendimento-pureza',
      'theory',
      'Reagente limitante',
      'Para descobrir o limitante, calcule quanto produto cada reagente conseguiria formar separadamente. O reagente que produz menor quantidade de produto é o limitante.

O excesso não decide o produto final. Ele sobra. A reação para quando o limitante acaba.',
      2
    ),
    (
      'estequiometria',
      'limitante-rendimento-pureza',
      'example',
      'Rendimento percentual',
      'Se a previsão teórica é produzir 80 g de produto, mas o experimento produz 60 g, o rendimento é:

rendimento = massa real / massa teórica x 100
rendimento = 60 / 80 x 100 = 75%.',
      3
    ),
    (
      'estequiometria',
      'limitante-rendimento-pureza',
      'guided_practice',
      'Pureza em problemas',
      'Se uma amostra tem 70% de pureza, apenas 70% da massa participa da reação. Em 100 g de amostra, há 70 g de substância útil e 30 g de impurezas.',
      4
    ),
    (
      'estequiometria',
      'limitante-rendimento-pureza',
      'common_mistake',
      'Armadilha de prova',
      'Não aplique rendimento antes de calcular a produção teórica. Primeiro descubra o produto esperado pela estequiometria; depois corrija pelo rendimento ou pela pureza.',
      5
    ),
    (
      'estequiometria',
      'limitante-rendimento-pureza',
      'review',
      'Resumo operacional',
      'Limitante define o máximo possível. Rendimento compara real com teórico. Pureza corrige a massa inicial. Esses três temas tornam a estequiometria mais realista.',
      6
    ),

    (
      'termoquimica',
      'energia-nas-reacoes',
      'intro',
      'Calor não é temperatura',
      'Temperatura mede o grau de agitação média das partículas. Calor é energia transferida entre corpos ou sistemas devido a uma diferença de temperatura.

Em termoquímica, interessa saber se a reação libera energia para a vizinhança ou absorve energia dela.',
      1
    ),
    (
      'termoquimica',
      'energia-nas-reacoes',
      'theory',
      'Entalpia e sinal de ΔH',
      'A variação de entalpia é representada por ΔH = Hprodutos - Hreagentes.

Se ΔH < 0, a reação é exotérmica: libera calor. Os produtos ficam em nível energético menor que os reagentes.

Se ΔH > 0, a reação é endotérmica: absorve calor. Os produtos ficam em nível energético maior que os reagentes.',
      2
    ),
    (
      'termoquimica',
      'energia-nas-reacoes',
      'example',
      'Exemplo resolvido',
      'Se os reagentes têm entalpia total de 150 kJ e os produtos têm entalpia de 90 kJ:

ΔH = 90 - 150 = -60 kJ.

O sinal negativo indica reação exotérmica.',
      3
    ),
    (
      'termoquimica',
      'energia-nas-reacoes',
      'visual_summary',
      'Gráfico de energia',
      'Exotérmica: reagentes em cima, produtos embaixo, ΔH negativo.

Endotérmica: reagentes embaixo, produtos em cima, ΔH positivo.

A energia de ativação é a barreira inicial que precisa ser vencida para a reação ocorrer.',
      4
    ),
    (
      'termoquimica',
      'energia-nas-reacoes',
      'common_mistake',
      'Erro comum',
      'Confundir reação exotérmica com reação espontânea. Uma reação pode liberar energia e ainda precisar de energia de ativação. Espontaneidade envolve outros fatores, como entropia e energia livre.',
      5
    ),
    (
      'termoquimica',
      'energia-nas-reacoes',
      'review',
      'Revisão rápida',
      'Calor é energia em trânsito. Temperatura é medida de agitação. ΔH compara produtos e reagentes. Sinal negativo libera calor; sinal positivo absorve calor.',
      6
    ),

    (
      'termoquimica',
      'hess-energia-ligacao',
      'intro',
      'O caminho não muda o saldo',
      'A Lei de Hess afirma que a variação de entalpia de uma reação depende apenas dos estados inicial e final, não do caminho percorrido.

Isso permite somar equações intermediárias para obter a reação desejada.',
      1
    ),
    (
      'termoquimica',
      'hess-energia-ligacao',
      'theory',
      'Como manipular equações',
      'Se inverter uma equação, inverta o sinal de ΔH. Se multiplicar uma equação por um número, multiplique também o ΔH.

Depois, some as equações e cancele espécies que aparecem dos dois lados. O ΔH final será a soma dos ΔH ajustados.',
      2
    ),
    (
      'termoquimica',
      'hess-energia-ligacao',
      'example',
      'Energia de ligação',
      'Quebrar ligações consome energia. Formar ligações libera energia.

Estimativa: ΔH = energia das ligações rompidas - energia das ligações formadas.

Se formar ligações libera mais energia do que foi gasta para romper, ΔH será negativo.',
      3
    ),
    (
      'termoquimica',
      'hess-energia-ligacao',
      'guided_practice',
      'Roteiro de Hess',
      '1. Escreva a reação alvo.
2. Ajuste as equações fornecidas para que as espécies coincidam.
3. Inverta ou multiplique equações quando necessário.
4. Ajuste os ΔH junto com as equações.
5. Some e cancele termos.
6. Some os ΔH finais.',
      4
    ),
    (
      'termoquimica',
      'hess-energia-ligacao',
      'common_mistake',
      'Pegadinha',
      'Mudar a equação e esquecer de mudar o ΔH. Toda operação feita na equação precisa ser repetida no valor da entalpia.',
      5
    ),
    (
      'termoquimica',
      'hess-energia-ligacao',
      'review',
      'Resumo',
      'Lei de Hess soma caminhos. Energia de ligação estima saldo energético. Romper ligações absorve energia; formar ligações libera energia.',
      6
    ),

    (
      'eletroquimica',
      'oxidacao-reducao-pilhas',
      'intro',
      'Elétrons em movimento',
      'Eletroquímica estuda reações com transferência de elétrons. Oxidação é perda de elétrons; redução é ganho de elétrons.

Uma pilha transforma energia química em energia elétrica ao separar fisicamente as semirreações e forçar os elétrons a passarem por um circuito externo.',
      1
    ),
    (
      'eletroquimica',
      'oxidacao-reducao-pilhas',
      'theory',
      'Ânodo, cátodo e ponte salina',
      'Em pilhas, oxidação ocorre no ânodo e redução ocorre no cátodo. Os elétrons saem do ânodo e vão para o cátodo pelo fio.

A ponte salina fecha o circuito internamente, permitindo migração de íons e mantendo a neutralidade elétrica das soluções.',
      2
    ),
    (
      'eletroquimica',
      'oxidacao-reducao-pilhas',
      'example',
      'Pilha de Daniell',
      'Na pilha Zn/Cu, o zinco oxida:
Zn -> Zn2+ + 2e-

O cobre reduz:
Cu2+ + 2e- -> Cu

O zinco é ânodo e perde massa. O cobre é cátodo e ganha depósito metálico.',
      3
    ),
    (
      'eletroquimica',
      'oxidacao-reducao-pilhas',
      'guided_practice',
      'Como interpretar uma pilha',
      '1. Identifique quem perde elétrons.
2. Identifique quem ganha elétrons.
3. Marque ânodo e cátodo.
4. Indique o sentido dos elétrons.
5. Confira a função da ponte salina.
6. Relacione com diferença de potencial.',
      4
    ),
    (
      'eletroquimica',
      'oxidacao-reducao-pilhas',
      'common_mistake',
      'Erro comum',
      'Decorar que ânodo é positivo ou negativo sem considerar o processo. Em pilhas, o ânodo é negativo. Em eletrólise, o ânodo é positivo. O que nunca muda: oxidação ocorre no ânodo e redução no cátodo.',
      5
    ),
    (
      'eletroquimica',
      'oxidacao-reducao-pilhas',
      'review',
      'Revisão rápida',
      'Oxidação perde elétrons. Redução ganha elétrons. Ânodo oxida. Cátodo reduz. Em pilhas, a reação espontânea gera corrente elétrica.',
      6
    ),

    (
      'eletroquimica',
      'eletrolise-corrosao-aplicacoes',
      'intro',
      'Forçando reações',
      'Eletrólise usa energia elétrica para provocar uma reação não espontânea. É o processo oposto ao funcionamento de uma pilha espontânea.

Ela aparece na obtenção de metais, galvanização, produção de substâncias industriais e recarga de alguns sistemas eletroquímicos.',
      1
    ),
    (
      'eletroquimica',
      'eletrolise-corrosao-aplicacoes',
      'theory',
      'Eletrólise ígnea e aquosa',
      'Na eletrólise ígnea, o composto iônico está fundido, sem água. Os íons do próprio composto sofrem descarga.

Na eletrólise aquosa, a água compete com os íons. Por isso, prever produtos exige observar facilidade de descarga e potenciais envolvidos.',
      2
    ),
    (
      'eletroquimica',
      'eletrolise-corrosao-aplicacoes',
      'example',
      'Corrosão como redox',
      'A corrosão do ferro envolve oxidação do metal. Regiões do material funcionam como pequenas pilhas locais na presença de água e oxigênio.

Proteções possíveis: pintura, galvanização com zinco, uso de metal de sacrifício e ligas mais resistentes.',
      3
    ),
    (
      'eletroquimica',
      'eletrolise-corrosao-aplicacoes',
      'visual_summary',
      'Aplicações',
      'Pilhas e baterias: geram energia elétrica.
Eletrólise: consome energia elétrica.
Galvanização: deposita metal protetor.
Corrosão: oxidação indesejada.
Reciclagem e indústria: usam processos redox para separar e transformar materiais.',
      4
    ),
    (
      'eletroquimica',
      'eletrolise-corrosao-aplicacoes',
      'common_mistake',
      'Pegadinha',
      'Achar que toda eletrólise usa solução aquosa. Na eletrólise ígnea, não há água competindo. Isso muda completamente os produtos.',
      5
    ),
    (
      'eletroquimica',
      'eletrolise-corrosao-aplicacoes',
      'review',
      'Resumo final',
      'Pilha gera corrente com reação espontânea. Eletrólise consome corrente para forçar reação. Corrosão é redox indesejada. Proteção anticorrosiva controla a oxidação.',
      6
    )
)
insert into public.lesson_blocks (lesson_id, block_type, title, content, sort_order)
select
  lesson.id,
  block_seed.block_type,
  block_seed.title,
  block_seed.content,
  block_seed.sort_order
from block_seed
join public.subjects subject on subject.slug = 'quimica'
join public.course_modules module
  on module.subject_id = subject.id
  and module.slug = block_seed.module_slug
join public.lessons lesson
  on lesson.module_id = module.id
  and lesson.slug = block_seed.lesson_slug;

with exercise_seed(module_slug, lesson_slug, question, exercise_type, choices, correct_answer, explanation, difficulty, sort_order) as (
  values
    (
      'ligacoes-quimicas',
      'por-que-atomos-se-ligam',
      'Qual alternativa melhor explica por que átomos formam ligações químicas?',
      'multiple_choice',
      '["Porque todos os átomos obedecem obrigatoriamente ao octeto.", "Porque o sistema formado pode atingir menor energia e maior estabilidade.", "Porque metais sempre compartilham elétrons com ametais.", "Porque toda ligação cria moléculas isoladas.", "Porque elétrons deixam de existir na ligação."]'::jsonb,
      'B',
      'A ligação ocorre quando a interação reduz a energia do sistema. O octeto é uma regra útil, mas não absoluta.',
      'facil',
      1
    ),
    (
      'ligacoes-quimicas',
      'por-que-atomos-se-ligam',
      'Explique a diferença entre ligação iônica e ligação covalente usando as partículas envolvidas.',
      'open',
      '[]'::jsonb,
      'Na ligação iônica há atração entre íons de cargas opostas; na covalente há compartilhamento de pares de elétrons entre átomos.',
      'A resposta deve mencionar íons na ligação iônica e compartilhamento de elétrons na covalente.',
      'medio',
      2
    ),
    (
      'ligacoes-quimicas',
      'por-que-atomos-se-ligam',
      'Por que metais conduzem eletricidade no estado sólido?',
      'open',
      '[]'::jsonb,
      'Porque possuem elétrons relativamente livres/deslocalizados que se movem pela estrutura metálica.',
      'A condução metálica depende da mobilidade eletrônica no retículo metálico.',
      'dificil',
      3
    ),

    (
      'ligacoes-quimicas',
      'geometria-polaridade-propriedades',
      'Uma molécula com ligações polares será sempre polar?',
      'multiple_choice',
      '["Sim, porque toda ligação polar torna a molécula polar.", "Não, porque a geometria pode fazer os dipolos se anularem.", "Sim, desde que tenha ametais.", "Não, porque polaridade depende apenas da massa molar.", "Sim, se for gás em temperatura ambiente."]'::jsonb,
      'B',
      'A polaridade molecular depende da soma vetorial dos dipolos e da geometria.',
      'facil',
      1
    ),
    (
      'ligacoes-quimicas',
      'geometria-polaridade-propriedades',
      'Compare CO2 e H2O quanto à geometria e polaridade.',
      'open',
      '[]'::jsonb,
      'CO2 é linear e apolar porque seus dipolos se anulam; H2O é angular e polar porque seus dipolos não se anulam.',
      'A resposta precisa relacionar geometria com cancelamento ou não dos dipolos.',
      'medio',
      2
    ),
    (
      'ligacoes-quimicas',
      'geometria-polaridade-propriedades',
      'Por que água dissolve bem muitos sais?',
      'open',
      '[]'::jsonb,
      'Porque a água é polar e estabiliza íons por interações íon-dipolo.',
      'O ponto central é a interação entre moléculas polares de água e íons.',
      'dificil',
      3
    ),

    (
      'estequiometria',
      'mol-equacao-balanceada',
      'Na reação N2 + 3 H2 -> 2 NH3, quantos mol de NH3 se formam a partir de 9 mol de H2?',
      'multiple_choice',
      '["3 mol", "4 mol", "6 mol", "9 mol", "18 mol"]'::jsonb,
      'C',
      'A proporção é 3 mol de H2 para 2 mol de NH3. Com 9 mol de H2, forma-se 6 mol de NH3.',
      'facil',
      1
    ),
    (
      'estequiometria',
      'mol-equacao-balanceada',
      'Explique por que os coeficientes da equação balanceada não devem ser usados diretamente com massas em gramas.',
      'open',
      '[]'::jsonb,
      'Porque os coeficientes indicam proporções em mol; massas devem ser convertidas para mol antes da proporção.',
      'Coeficientes estequiométricos comparam quantidade de matéria, não massa direta.',
      'medio',
      2
    ),
    (
      'estequiometria',
      'mol-equacao-balanceada',
      'Quantos mol existem em 36 g de água? Considere massa molar da água igual a 18 g/mol.',
      'multiple_choice',
      '["0,5 mol", "1 mol", "2 mol", "18 mol", "36 mol"]'::jsonb,
      'C',
      'n = m/M = 36/18 = 2 mol.',
      'facil',
      3
    ),

    (
      'estequiometria',
      'limitante-rendimento-pureza',
      'O que é reagente limitante?',
      'multiple_choice',
      '["O reagente de maior massa.", "O reagente que sobra ao final.", "O reagente que acaba primeiro e limita a formação de produto.", "O produto formado em menor quantidade.", "O catalisador da reação."]'::jsonb,
      'C',
      'O limitante define a quantidade máxima de produto porque é consumido primeiro.',
      'facil',
      1
    ),
    (
      'estequiometria',
      'limitante-rendimento-pureza',
      'Uma reação deveria produzir 50 g de produto, mas produziu 40 g. Qual foi o rendimento percentual?',
      'multiple_choice',
      '["20%", "40%", "50%", "80%", "90%"]'::jsonb,
      'D',
      'Rendimento = 40/50 x 100 = 80%.',
      'medio',
      2
    ),
    (
      'estequiometria',
      'limitante-rendimento-pureza',
      'Em uma amostra de 200 g com 75% de pureza, qual massa realmente reage?',
      'multiple_choice',
      '["50 g", "75 g", "100 g", "150 g", "200 g"]'::jsonb,
      'D',
      'Massa útil = 200 x 0,75 = 150 g.',
      'medio',
      3
    ),

    (
      'termoquimica',
      'energia-nas-reacoes',
      'Se ΔH de uma reação é negativo, a reação é:',
      'multiple_choice',
      '["endotérmica, pois absorve calor.", "exotérmica, pois libera calor.", "neutra, pois não troca energia.", "sempre espontânea.", "sempre lenta."]'::jsonb,
      'B',
      'ΔH negativo indica produtos com menor entalpia que reagentes e liberação de energia.',
      'facil',
      1
    ),
    (
      'termoquimica',
      'energia-nas-reacoes',
      'Diferencie calor e temperatura.',
      'open',
      '[]'::jsonb,
      'Temperatura mede agitação média das partículas; calor é energia transferida por diferença de temperatura.',
      'A resposta deve separar grandeza de estado e energia em transferência.',
      'medio',
      2
    ),
    (
      'termoquimica',
      'energia-nas-reacoes',
      'Reagentes têm 200 kJ e produtos 260 kJ de entalpia. Calcule ΔH e classifique.',
      'open',
      '[]'::jsonb,
      'ΔH = 260 - 200 = +60 kJ; reação endotérmica.',
      'Produtos têm maior entalpia, então houve absorção de energia.',
      'medio',
      3
    ),

    (
      'termoquimica',
      'hess-energia-ligacao',
      'Ao inverter uma equação termoquímica, o que acontece com o ΔH?',
      'multiple_choice',
      '["Permanece igual.", "Vira zero.", "Troca de sinal.", "É multiplicado por 2.", "É dividido pela massa molar."]'::jsonb,
      'C',
      'Inverter a equação inverte o sentido energético, portanto o sinal de ΔH muda.',
      'facil',
      1
    ),
    (
      'termoquimica',
      'hess-energia-ligacao',
      'Por que a Lei de Hess permite somar equações intermediárias?',
      'open',
      '[]'::jsonb,
      'Porque a variação de entalpia depende apenas dos estados inicial e final, não do caminho percorrido.',
      'O princípio é a independência do caminho para a variação de entalpia.',
      'medio',
      2
    ),
    (
      'termoquimica',
      'hess-energia-ligacao',
      'Na estimativa por energia de ligação, romper ligações e formar ligações têm quais efeitos energéticos?',
      'open',
      '[]'::jsonb,
      'Romper ligações absorve energia; formar ligações libera energia.',
      'Essa lógica explica o cálculo ΔH = energia rompida - energia formada.',
      'medio',
      3
    ),

    (
      'eletroquimica',
      'oxidacao-reducao-pilhas',
      'Oxidação é:',
      'multiple_choice',
      '["ganho de elétrons.", "perda de elétrons.", "ganho de prótons.", "perda de massa apenas.", "neutralização ácido-base."]'::jsonb,
      'B',
      'Oxidação é perda de elétrons; redução é ganho de elétrons.',
      'facil',
      1
    ),
    (
      'eletroquimica',
      'oxidacao-reducao-pilhas',
      'Em uma pilha, onde ocorrem oxidação e redução?',
      'open',
      '[]'::jsonb,
      'Oxidação ocorre no ânodo e redução ocorre no cátodo.',
      'Essa regra vale tanto para pilhas quanto para eletrólise; o sinal dos eletrodos é que pode mudar.',
      'medio',
      2
    ),
    (
      'eletroquimica',
      'oxidacao-reducao-pilhas',
      'Na pilha Zn/Cu, por que o eletrodo de zinco perde massa?',
      'open',
      '[]'::jsonb,
      'Porque o zinco oxida, formando Zn2+ em solução e liberando elétrons.',
      'A perda de massa ocorre quando átomos de Zn deixam o metal e passam para a solução como íons.',
      'dificil',
      3
    ),

    (
      'eletroquimica',
      'eletrolise-corrosao-aplicacoes',
      'A eletrólise transforma:',
      'multiple_choice',
      '["energia química em energia elétrica por reação espontânea.", "energia elétrica em transformação química não espontânea.", "calor em temperatura.", "massa em mol diretamente.", "ácido em base sem corrente elétrica."]'::jsonb,
      'B',
      'Eletrólise usa corrente elétrica para forçar uma reação não espontânea.',
      'facil',
      1
    ),
    (
      'eletroquimica',
      'eletrolise-corrosao-aplicacoes',
      'Explique por que a corrosão do ferro é um processo eletroquímico.',
      'open',
      '[]'::jsonb,
      'Porque envolve oxidação do ferro e transferência de elétrons, geralmente com participação de água e oxigênio.',
      'Corrosão é uma reação redox distribuída em regiões da superfície metálica.',
      'medio',
      2
    ),
    (
      'eletroquimica',
      'eletrolise-corrosao-aplicacoes',
      'Qual é a diferença prática entre pilha e eletrólise?',
      'open',
      '[]'::jsonb,
      'A pilha gera corrente elétrica a partir de reação espontânea; a eletrólise consome corrente para forçar reação não espontânea.',
      'A comparação deve envolver espontaneidade e sentido de conversão de energia.',
      'dificil',
      3
    )
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
join public.subjects subject on subject.slug = 'quimica'
join public.course_modules module
  on module.subject_id = subject.id
  and module.slug = exercise_seed.module_slug
join public.lessons lesson
  on lesson.module_id = module.id
  and lesson.slug = exercise_seed.lesson_slug;

with seeded_lessons as (
  select lesson.id
  from public.lessons lesson
  join public.course_modules module on module.id = lesson.module_id
  join public.subjects subject on subject.id = module.subject_id
  where subject.slug = 'quimica'
    and module.slug in ('ligacoes-quimicas', 'estequiometria', 'termoquimica', 'eletroquimica')
    and lesson.slug in (
      'por-que-atomos-se-ligam',
      'geometria-polaridade-propriedades',
      'mol-equacao-balanceada',
      'limitante-rendimento-pureza',
      'energia-nas-reacoes',
      'hess-energia-ligacao',
      'oxidacao-reducao-pilhas',
      'eletrolise-corrosao-aplicacoes'
    )
)
delete from public.lesson_sources
where lesson_id in (select id from seeded_lessons);

with source_seed(module_slug, lesson_slug, title, url, license, attribution, notes) as (
  values
    (
      'ligacoes-quimicas',
      'por-que-atomos-se-ligam',
      'Chem LibreTexts - Chemical Bonding',
      'https://chem.libretexts.org/Bookshelves/General_Chemistry',
      'CC BY-NC-SA',
      'Chemistry LibreTexts',
      'Fonte aberta para consulta e aprofundamento conceitual.'
    ),
    (
      'estequiometria',
      'mol-equacao-balanceada',
      'OpenStax Chemistry 2e - Stoichiometry',
      'https://openstax.org/details/books/chemistry-2e',
      'CC BY',
      'OpenStax',
      'Referência aberta para proporções químicas, mol e cálculos estequiométricos.'
    ),
    (
      'termoquimica',
      'energia-nas-reacoes',
      'OpenStax Chemistry 2e - Thermochemistry',
      'https://openstax.org/details/books/chemistry-2e',
      'CC BY',
      'OpenStax',
      'Referência aberta sobre calor, entalpia e termoquímica.'
    ),
    (
      'eletroquimica',
      'oxidacao-reducao-pilhas',
      'OpenStax Chemistry 2e - Electrochemistry',
      'https://openstax.org/details/books/chemistry-2e',
      'CC BY',
      'OpenStax',
      'Referência aberta sobre reações redox, pilhas e eletrólise.'
    )
)
insert into public.lesson_sources (lesson_id, title, url, license, attribution, notes)
select
  lesson.id,
  source_seed.title,
  source_seed.url,
  source_seed.license,
  source_seed.attribution,
  source_seed.notes
from source_seed
join public.subjects subject on subject.slug = 'quimica'
join public.course_modules module
  on module.subject_id = subject.id
  and module.slug = source_seed.module_slug
join public.lessons lesson
  on lesson.module_id = module.id
  and lesson.slug = source_seed.lesson_slug;

commit;
