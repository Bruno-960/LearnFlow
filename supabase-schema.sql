create table if not exists public.profiles (
  id text primary key,
  name text not null default 'Estudante',
  streak_days integer not null default 0,
  last_study_date date,
  last_activity_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists last_study_date date;
alter table public.profiles add column if not exists last_activity_at timestamptz;

create table if not exists public.study_goals (
  profile_id text primary key references public.profiles(id) on delete cascade,
  weekly_active_days integer not null default 5 check (weekly_active_days between 1 and 7),
  daily_activity_target integer not null default 3 check (daily_activity_target between 1 and 50),
  updated_at timestamptz not null default now()
);

create table if not exists public.flashcard_decks (
  id uuid primary key,
  profile_id text not null references public.profiles(id) on delete cascade,
  name text not null,
  subtitle text not null default 'Deck criado pelo usuario',
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  icon text not null default 'cards',
  cards integer not null default 0 check (cards >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.flashcards (
  id uuid primary key,
  deck_id uuid not null references public.flashcard_decks(id) on delete cascade,
  profile_id text not null references public.profiles(id) on delete cascade,
  front text not null,
  back text not null,
  review_count integer not null default 0 check (review_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.flashcards add column if not exists last_reviewed_at timestamptz;
alter table public.flashcards add column if not exists next_review_at timestamptz not null default now();
alter table public.flashcards add column if not exists review_interval_days integer not null default 1 check (review_interval_days >= 1);

create index if not exists flashcards_profile_next_review_idx
on public.flashcards (profile_id, next_review_at);

create table if not exists public.study_progress (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references public.profiles(id) on delete cascade,
  subject_name text not null,
  module_title text not null,
  activity_key text not null,
  answered_at timestamptz not null default now(),
  unique (profile_id, subject_name, module_title, activity_key)
);

create table if not exists public.user_activity_log (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references public.profiles(id) on delete cascade,
  activity_type text not null check (activity_type in ('materia', 'calendario', 'flashcard', 'simulado')),
  activity_date date not null,
  subject_name text,
  module_title text,
  activity_key text,
  reference_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists user_activity_log_profile_date_idx
on public.user_activity_log (profile_id, activity_date desc, created_at desc);

create index if not exists user_activity_log_profile_type_date_idx
on public.user_activity_log (profile_id, activity_type, activity_date desc);

alter table public.profiles enable row level security;
alter table public.study_goals enable row level security;
alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;
alter table public.study_progress enable row level security;
alter table public.user_activity_log enable row level security;

drop policy if exists "profiles_select_public" on public.profiles;
drop policy if exists "profiles_insert_public" on public.profiles;
drop policy if exists "profiles_update_public" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "study_goals_select_own" on public.study_goals;
drop policy if exists "study_goals_insert_own" on public.study_goals;
drop policy if exists "study_goals_update_own" on public.study_goals;
drop policy if exists "flashcard_decks_select_public" on public.flashcard_decks;
drop policy if exists "flashcard_decks_insert_public" on public.flashcard_decks;
drop policy if exists "flashcard_decks_update_public" on public.flashcard_decks;
drop policy if exists "flashcard_decks_delete_public" on public.flashcard_decks;
drop policy if exists "flashcard_decks_select_own" on public.flashcard_decks;
drop policy if exists "flashcard_decks_insert_own" on public.flashcard_decks;
drop policy if exists "flashcard_decks_update_own" on public.flashcard_decks;
drop policy if exists "flashcard_decks_delete_own" on public.flashcard_decks;
drop policy if exists "flashcards_select_own" on public.flashcards;
drop policy if exists "flashcards_insert_own" on public.flashcards;
drop policy if exists "flashcards_update_own" on public.flashcards;
drop policy if exists "flashcards_delete_own" on public.flashcards;
drop policy if exists "study_progress_select_own" on public.study_progress;
drop policy if exists "study_progress_insert_own" on public.study_progress;
drop policy if exists "study_progress_update_own" on public.study_progress;
drop policy if exists "study_progress_delete_own" on public.study_progress;
drop policy if exists "user_activity_log_select_own" on public.user_activity_log;
drop policy if exists "user_activity_log_insert_own" on public.user_activity_log;
drop policy if exists "user_activity_log_delete_own" on public.user_activity_log;

create policy "profiles_select_own"
on public.profiles for select
using (auth.uid()::text = id);

create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid()::text = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid()::text = id)
with check (auth.uid()::text = id);

create policy "study_goals_select_own"
on public.study_goals for select
using (auth.uid()::text = profile_id);

create policy "study_goals_insert_own"
on public.study_goals for insert
with check (auth.uid()::text = profile_id);

create policy "study_goals_update_own"
on public.study_goals for update
using (auth.uid()::text = profile_id)
with check (auth.uid()::text = profile_id);

create policy "flashcard_decks_select_own"
on public.flashcard_decks for select
using (auth.uid()::text = profile_id);

create policy "flashcard_decks_insert_own"
on public.flashcard_decks for insert
with check (auth.uid()::text = profile_id);

create policy "flashcard_decks_update_own"
on public.flashcard_decks for update
using (auth.uid()::text = profile_id)
with check (auth.uid()::text = profile_id);

create policy "flashcard_decks_delete_own"
on public.flashcard_decks for delete
using (auth.uid()::text = profile_id);

create policy "flashcards_select_own"
on public.flashcards for select
using (auth.uid()::text = profile_id);

create policy "flashcards_insert_own"
on public.flashcards for insert
with check (auth.uid()::text = profile_id);

create policy "flashcards_update_own"
on public.flashcards for update
using (auth.uid()::text = profile_id)
with check (auth.uid()::text = profile_id);

create policy "flashcards_delete_own"
on public.flashcards for delete
using (auth.uid()::text = profile_id);

create policy "study_progress_select_own"
on public.study_progress for select
using (auth.uid()::text = profile_id);

create policy "study_progress_insert_own"
on public.study_progress for insert
with check (auth.uid()::text = profile_id);

create policy "study_progress_update_own"
on public.study_progress for update
using (auth.uid()::text = profile_id)
with check (auth.uid()::text = profile_id);

create policy "study_progress_delete_own"
on public.study_progress for delete
using (auth.uid()::text = profile_id);

create policy "user_activity_log_select_own"
on public.user_activity_log for select
using (auth.uid()::text = profile_id);

create policy "user_activity_log_insert_own"
on public.user_activity_log for insert
with check (auth.uid()::text = profile_id);

create policy "user_activity_log_delete_own"
on public.user_activity_log for delete
using (auth.uid()::text = profile_id);

insert into public.user_activity_log (
  profile_id,
  activity_type,
  activity_date,
  subject_name,
  module_title,
  activity_key,
  reference_id,
  metadata,
  created_at
)
select
  study_progress.profile_id,
  'materia',
  (study_progress.answered_at at time zone 'America/Bahia')::date,
  study_progress.subject_name,
  study_progress.module_title,
  study_progress.activity_key,
  study_progress.id::text,
  jsonb_build_object('source', 'study_progress_backfill'),
  study_progress.answered_at
from public.study_progress
where not exists (
  select 1
  from public.user_activity_log existing_log
  where existing_log.profile_id = study_progress.profile_id
    and existing_log.activity_type = 'materia'
    and existing_log.reference_id = study_progress.id::text
);

insert into public.user_activity_log (
  profile_id,
  activity_type,
  activity_date,
  reference_id,
  metadata,
  created_at
)
select
  flashcards.profile_id,
  'flashcard',
  (flashcards.created_at at time zone 'America/Bahia')::date,
  flashcards.id::text,
  jsonb_build_object('source', 'flashcards_backfill', 'deck_id', flashcards.deck_id),
  flashcards.created_at
from public.flashcards
where not exists (
  select 1
  from public.user_activity_log existing_log
  where existing_log.profile_id = flashcards.profile_id
    and existing_log.activity_type = 'flashcard'
    and existing_log.reference_id = flashcards.id::text
);

create or replace function public.record_study_activity(
  p_subject_name text,
  p_module_title text,
  p_activity_key text
)
returns table (
  streak_days integer,
  last_study_date date
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_profile_id text := auth.uid()::text;
  current_activity_at timestamptz := now();
  today date := (now() at time zone 'America/Bahia')::date;
  yesterday date := ((now() at time zone 'America/Bahia')::date - 1);
  previous_study_date date;
  previous_activity_at timestamptz;
  next_streak integer;
begin
  if current_profile_id is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  insert into public.profiles (id, name, streak_days, last_study_date, last_activity_at, updated_at)
  values (current_profile_id, 'Estudante', 0, null, null, now())
  on conflict (id) do nothing;

  insert into public.study_progress (
    profile_id,
    subject_name,
    module_title,
    activity_key,
    answered_at
  )
  values (
    current_profile_id,
    p_subject_name,
    p_module_title,
    p_activity_key,
    now()
  )
  on conflict (profile_id, subject_name, module_title, activity_key)
  do update set answered_at = excluded.answered_at;

  insert into public.user_activity_log (
    profile_id,
    activity_type,
    activity_date,
    subject_name,
    module_title,
    activity_key,
    metadata,
    created_at
  )
  values (
    current_profile_id,
    'materia',
    today,
    p_subject_name,
    p_module_title,
    p_activity_key,
    jsonb_build_object('source', 'record_study_activity'),
    current_activity_at
  );

  select profiles.last_study_date, profiles.last_activity_at, profiles.streak_days
  into previous_study_date, previous_activity_at, next_streak
  from public.profiles
  where profiles.id = current_profile_id
  for update;

  if previous_activity_at is null then
    next_streak := greatest(coalesce(next_streak, 0), 1);
    previous_activity_at := current_activity_at;
    previous_study_date := coalesce(previous_study_date, today);
  elsif previous_study_date = today then
    next_streak := greatest(coalesce(next_streak, 0), 1);
  elsif previous_study_date = yesterday then
    next_streak := greatest(coalesce(next_streak, 0), 1) + 1;
    previous_activity_at := current_activity_at;
    previous_study_date := today;
  else
    next_streak := 1;
    previous_activity_at := current_activity_at;
    previous_study_date := today;
  end if;

  update public.profiles
  set
    streak_days = next_streak,
    last_study_date = previous_study_date,
    last_activity_at = previous_activity_at,
    updated_at = now()
  where profiles.id = current_profile_id;

  return query select next_streak, previous_study_date;
end;
$$;

grant execute on function public.record_study_activity(text, text, text) to authenticated;

drop function if exists public.record_user_activity(text);

create or replace function public.record_user_activity(
  p_activity_type text,
  p_subject_name text default null,
  p_module_title text default null,
  p_activity_key text default null,
  p_reference_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns table (
  streak_days integer,
  last_study_date date
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_profile_id text := auth.uid()::text;
  current_activity_at timestamptz := now();
  today date := (now() at time zone 'America/Bahia')::date;
  yesterday date := ((now() at time zone 'America/Bahia')::date - 1);
  previous_study_date date;
  previous_activity_at timestamptz;
  next_streak integer;
begin
  if current_profile_id is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  if p_activity_type not in ('materia', 'calendario', 'flashcard', 'simulado') then
    raise exception 'Tipo de atividade invalido: %', p_activity_type;
  end if;

  insert into public.profiles (id, name, streak_days, last_study_date, last_activity_at, updated_at)
  values (current_profile_id, 'Estudante', 0, null, null, now())
  on conflict (id) do nothing;

  insert into public.user_activity_log (
    profile_id,
    activity_type,
    activity_date,
    subject_name,
    module_title,
    activity_key,
    reference_id,
    metadata,
    created_at
  )
  values (
    current_profile_id,
    p_activity_type,
    today,
    p_subject_name,
    p_module_title,
    p_activity_key,
    p_reference_id,
    coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object('source', 'record_user_activity'),
    current_activity_at
  );

  select profiles.last_study_date, profiles.last_activity_at, profiles.streak_days
  into previous_study_date, previous_activity_at, next_streak
  from public.profiles
  where profiles.id = current_profile_id
  for update;

  if previous_activity_at is null then
    next_streak := greatest(coalesce(next_streak, 0), 1);
    previous_activity_at := current_activity_at;
    previous_study_date := coalesce(previous_study_date, today);
  elsif previous_study_date = today then
    next_streak := greatest(coalesce(next_streak, 0), 1);
  elsif previous_study_date = yesterday then
    next_streak := greatest(coalesce(next_streak, 0), 1) + 1;
    previous_activity_at := current_activity_at;
    previous_study_date := today;
  else
    next_streak := 1;
    previous_activity_at := current_activity_at;
    previous_study_date := today;
  end if;

  update public.profiles
  set
    streak_days = next_streak,
    last_study_date = previous_study_date,
    last_activity_at = previous_activity_at,
    updated_at = now()
  where profiles.id = current_profile_id;

  return query select next_streak, previous_study_date;
end;
$$;

grant execute on function public.record_user_activity(text, text, text, text, text, jsonb) to authenticated;

-- Repara perfis afetados pela regra antiga, que registrava atividade hoje mas mantinha a sequencia em 0.
update public.profiles
set
  streak_days = 1,
  updated_at = now()
where last_study_date = (now() at time zone 'America/Bahia')::date
  and streak_days < 1;
