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
drop policy if exists "flashcard_decks_select_public" on public.flashcard_decks;
drop policy if exists "flashcard_decks_insert_public" on public.flashcard_decks;
drop policy if exists "flashcard_decks_update_public" on public.flashcard_decks;

create policy "profiles_select_public"
on public.profiles for select
using (true);

create policy "profiles_insert_public"
on public.profiles for insert
with check (true);

create policy "profiles_update_public"
on public.profiles for update
using (true)
with check (true);

create policy "flashcard_decks_select_public"
on public.flashcard_decks for select
using (true);

create policy "flashcard_decks_insert_public"
on public.flashcard_decks for insert
with check (true);

create policy "flashcard_decks_update_public"
on public.flashcard_decks for update
using (true)
with check (true);

insert into public.profiles (id, name, streak_days)
values ('local-user', 'Estudante', 0)
on conflict (id) do nothing;
