create table if not exists public.profiles (
  id text primary key,
  name text not null default 'Estudante',
  streak_days integer not null default 0,
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

alter table public.profiles enable row level security;
alter table public.flashcard_decks enable row level security;

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
