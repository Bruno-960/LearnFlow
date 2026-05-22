-- LearnFlow content schema
-- Run this file in Supabase SQL Editor.
-- Goal: move course content out of the frontend code and into Supabase.

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  subtitle text not null default '',
  icon text not null default 'book',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  slug text not null,
  title text not null,
  objective text not null default '',
  estimated_minutes integer not null default 30 check (estimated_minutes > 0),
  level text not null default 'medio' check (level in ('basico', 'medio', 'avancado')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subject_id, slug)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  slug text not null,
  title text not null,
  summary text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, slug)
);

create table if not exists public.lesson_blocks (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  block_type text not null check (
    block_type in (
      'intro',
      'theory',
      'example',
      'guided_practice',
      'common_mistake',
      'visual_summary',
      'mind_map',
      'review',
      'challenge'
    )
  ),
  title text not null default '',
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  question text not null,
  exercise_type text not null default 'open' check (exercise_type in ('open', 'multiple_choice')),
  choices jsonb not null default '[]'::jsonb,
  correct_answer text not null,
  explanation text not null default '',
  difficulty text not null default 'medio' check (difficulty in ('facil', 'medio', 'dificil')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_sources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  title text not null,
  url text,
  license text not null default '',
  attribution text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

alter table public.subjects enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_blocks enable row level security;
alter table public.lesson_exercises enable row level security;
alter table public.lesson_sources enable row level security;

drop policy if exists "subjects_select_active" on public.subjects;
drop policy if exists "course_modules_select_active" on public.course_modules;
drop policy if exists "lessons_select_active" on public.lessons;
drop policy if exists "lesson_blocks_select_public" on public.lesson_blocks;
drop policy if exists "lesson_exercises_select_public" on public.lesson_exercises;
drop policy if exists "lesson_sources_select_public" on public.lesson_sources;

create policy "subjects_select_active"
on public.subjects for select
using (is_active = true);

create policy "course_modules_select_active"
on public.course_modules for select
using (
  is_active = true
  and exists (
    select 1 from public.subjects s
    where s.id = course_modules.subject_id
    and s.is_active = true
  )
);

create policy "lessons_select_active"
on public.lessons for select
using (
  is_active = true
  and exists (
    select 1
    from public.course_modules m
    join public.subjects s on s.id = m.subject_id
    where m.id = lessons.module_id
    and m.is_active = true
    and s.is_active = true
  )
);

create policy "lesson_blocks_select_public"
on public.lesson_blocks for select
using (
  exists (
    select 1
    from public.lessons l
    join public.course_modules m on m.id = l.module_id
    join public.subjects s on s.id = m.subject_id
    where l.id = lesson_blocks.lesson_id
    and l.is_active = true
    and m.is_active = true
    and s.is_active = true
  )
);

create policy "lesson_exercises_select_public"
on public.lesson_exercises for select
using (
  exists (
    select 1
    from public.lessons l
    join public.course_modules m on m.id = l.module_id
    join public.subjects s on s.id = m.subject_id
    where l.id = lesson_exercises.lesson_id
    and l.is_active = true
    and m.is_active = true
    and s.is_active = true
  )
);

create policy "lesson_sources_select_public"
on public.lesson_sources for select
using (
  lesson_id is null
  or exists (
    select 1
    from public.lessons l
    join public.course_modules m on m.id = l.module_id
    join public.subjects s on s.id = m.subject_id
    where l.id = lesson_sources.lesson_id
    and l.is_active = true
    and m.is_active = true
    and s.is_active = true
  )
);

create index if not exists subjects_sort_idx
on public.subjects (sort_order, name);

create index if not exists course_modules_subject_sort_idx
on public.course_modules (subject_id, sort_order, title);

create index if not exists lessons_module_sort_idx
on public.lessons (module_id, sort_order, title);

create index if not exists lesson_blocks_lesson_sort_idx
on public.lesson_blocks (lesson_id, sort_order);

create index if not exists lesson_exercises_lesson_sort_idx
on public.lesson_exercises (lesson_id, sort_order);

-- Minimal seed so you can test the structure immediately.
insert into public.subjects (slug, name, subtitle, icon, sort_order)
values
  ('portugues', 'Português', 'Gramática, leitura e escrita', 'book-open', 1),
  ('matematica', 'Matemática', 'Álgebra, geometria e dados', 'chart', 2),
  ('quimica', 'Química', 'Matéria, energia e transformações', 'flask', 3),
  ('fisica', 'Física', 'Movimento, energia e fenômenos', 'atom', 4),
  ('biologia', 'Biologia', 'Vida, sistemas e evolução', 'dna', 5),
  ('historia', 'História', 'Tempo, sociedade e poder', 'timeline', 6),
  ('geografia', 'Geografia', 'Espaço, território e ambiente', 'map', 7),
  ('literatura', 'Literatura', 'Obras, linguagem e contexto', 'library', 8)
on conflict (slug) do update set
  name = excluded.name,
  subtitle = excluded.subtitle,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  updated_at = now();

with subject as (
  select id from public.subjects where slug = 'quimica'
),
module as (
  insert into public.course_modules (subject_id, slug, title, objective, estimated_minutes, level, sort_order)
  select
    id,
    'termoquimica',
    'Termoquímica',
    'Compreender trocas de calor, entalpia, reações exotérmicas e endotérmicas.',
    90,
    'medio',
    1
  from subject
  on conflict (subject_id, slug) do update set
    title = excluded.title,
    objective = excluded.objective,
    estimated_minutes = excluded.estimated_minutes,
    level = excluded.level,
    sort_order = excluded.sort_order,
    updated_at = now()
  returning id
),
lesson as (
  insert into public.lessons (module_id, slug, title, summary, sort_order)
  select
    id,
    'energia-nas-reacoes',
    'Energia nas reações químicas',
    'Aula base sobre sistema, vizinhança, calor, temperatura e variação de entalpia.',
    1
  from module
  on conflict (module_id, slug) do update set
    title = excluded.title,
    summary = excluded.summary,
    sort_order = excluded.sort_order,
    updated_at = now()
  returning id
)
insert into public.lesson_blocks (lesson_id, block_type, title, content, sort_order)
select id, 'intro', 'Comece por aqui', 'Termoquímica estuda a energia envolvida nas transformações químicas. Em cada reação, ligações são quebradas e novas ligações são formadas, o que pode liberar ou absorver calor.', 1 from lesson
union all
select id, 'theory', 'Ideia central', 'Uma reação exotérmica libera energia para a vizinhança e possui ΔH negativo. Uma reação endotérmica absorve energia e possui ΔH positivo. A leitura correta depende de comparar a energia dos reagentes com a energia dos produtos.', 2 from lesson
union all
select id, 'example', 'Exemplo resolvido', 'Se os reagentes têm entalpia de 120 kJ e os produtos têm entalpia de 70 kJ, então ΔH = 70 - 120 = -50 kJ. A reação é exotérmica.', 3 from lesson
on conflict do nothing;
