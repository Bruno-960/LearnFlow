create table if not exists public.profiles (
  id text primary key,
  name text not null default 'Estudante',
  streak_days integer not null default 0,
  last_study_date date,
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists last_study_date date;

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

create table if not exists public.study_progress (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references public.profiles(id) on delete cascade,
  subject_name text not null,
  module_title text not null,
  activity_key text not null,
  answered_at timestamptz not null default now(),
  unique (profile_id, subject_name, module_title, activity_key)
);

alter table public.profiles enable row level security;
alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;
alter table public.study_progress enable row level security;

drop policy if exists "profiles_select_public" on public.profiles;
drop policy if exists "profiles_insert_public" on public.profiles;
drop policy if exists "profiles_update_public" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
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
  today date := (now() at time zone 'America/Bahia')::date;
  yesterday date := ((now() at time zone 'America/Bahia')::date - 1);
  previous_study_date date;
  next_streak integer;
begin
  if current_profile_id is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  insert into public.profiles (id, name, streak_days, last_study_date, updated_at)
  values (current_profile_id, 'Estudante', 0, null, now())
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

  select profiles.last_study_date, profiles.streak_days
  into previous_study_date, next_streak
  from public.profiles
  where profiles.id = current_profile_id
  for update;

  if previous_study_date = today then
    next_streak := next_streak;
  elsif previous_study_date = yesterday then
    next_streak := next_streak + 1;
  else
    next_streak := 1;
  end if;

  update public.profiles
  set
    streak_days = next_streak,
    last_study_date = today,
    updated_at = now()
  where profiles.id = current_profile_id;

  return query select next_streak, today;
end;
$$;

grant execute on function public.record_study_activity(text, text, text) to authenticated;

create or replace function public.record_user_activity(
  p_activity_type text
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
  today date := (now() at time zone 'America/Bahia')::date;
  yesterday date := ((now() at time zone 'America/Bahia')::date - 1);
  previous_study_date date;
  next_streak integer;
begin
  if current_profile_id is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  if p_activity_type not in ('materia', 'calendario', 'flashcard', 'simulado') then
    raise exception 'Tipo de atividade invalido: %', p_activity_type;
  end if;

  insert into public.profiles (id, name, streak_days, last_study_date, updated_at)
  values (current_profile_id, 'Estudante', 0, null, now())
  on conflict (id) do nothing;

  select profiles.last_study_date, profiles.streak_days
  into previous_study_date, next_streak
  from public.profiles
  where profiles.id = current_profile_id
  for update;

  if previous_study_date = today then
    next_streak := next_streak;
  elsif previous_study_date = yesterday then
    next_streak := next_streak + 1;
  else
    next_streak := 1;
  end if;

  update public.profiles
  set
    streak_days = next_streak,
    last_study_date = today,
    updated_at = now()
  where profiles.id = current_profile_id;

  return query select next_streak, today;
end;
$$;

grant execute on function public.record_user_activity(text) to authenticated;
