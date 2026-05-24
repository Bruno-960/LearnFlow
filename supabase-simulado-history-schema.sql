-- LearnFlow - Simulado attempt history
-- Run this in the Supabase SQL Editor after the base profile schema.

create table if not exists public.simulado_attempts (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references public.profiles(id) on delete cascade,
  exam_id text not null,
  exam_title text not null,
  exam_year integer not null,
  exam_day integer not null,
  language_choice text not null default 'english',
  question_count integer not null default 0 check (question_count >= 0),
  answered_count integer not null default 0 check (answered_count >= 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  wrong_count integer not null default 0 check (wrong_count >= 0),
  unanswered_count integer not null default 0 check (unanswered_count >= 0),
  percent integer not null default 0 check (percent >= 0 and percent <= 100),
  by_area jsonb not null default '{}'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  recommendation_area text,
  finished_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists simulado_attempts_profile_finished_idx
on public.simulado_attempts (profile_id, finished_at desc);

alter table public.simulado_attempts enable row level security;

drop policy if exists "simulado_attempts_select_own" on public.simulado_attempts;
drop policy if exists "simulado_attempts_insert_own" on public.simulado_attempts;
drop policy if exists "simulado_attempts_delete_own" on public.simulado_attempts;

create policy "simulado_attempts_select_own"
on public.simulado_attempts for select
using (auth.uid()::text = profile_id);

create policy "simulado_attempts_insert_own"
on public.simulado_attempts for insert
with check (auth.uid()::text = profile_id);

create policy "simulado_attempts_delete_own"
on public.simulado_attempts for delete
using (auth.uid()::text = profile_id);


create table if not exists public.simulado_attempt_questions (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.simulado_attempts(id) on delete cascade,
  profile_id text not null references public.profiles(id) on delete cascade,
  question_id text not null,
  question_number integer not null check (question_number > 0),
  area text not null,
  language_choice text not null default 'english',
  prompt text not null,
  student_answer text,
  student_answer_text text not null default 'Sem resposta',
  official_answer text,
  official_answer_text text not null default 'Gabarito indisponivel',
  is_correct boolean not null default false,
  status text not null default 'unanswered' check (status in ('correct', 'wrong', 'unanswered')),
  created_at timestamptz not null default now()
);

create index if not exists simulado_attempt_questions_attempt_idx
on public.simulado_attempt_questions (attempt_id, question_number);

create index if not exists simulado_attempt_questions_profile_idx
on public.simulado_attempt_questions (profile_id, created_at desc);

alter table public.simulado_attempt_questions enable row level security;

drop policy if exists "simulado_attempt_questions_select_own" on public.simulado_attempt_questions;
drop policy if exists "simulado_attempt_questions_insert_own" on public.simulado_attempt_questions;
drop policy if exists "simulado_attempt_questions_delete_own" on public.simulado_attempt_questions;

create policy "simulado_attempt_questions_select_own"
on public.simulado_attempt_questions for select
using (auth.uid()::text = profile_id);

create policy "simulado_attempt_questions_insert_own"
on public.simulado_attempt_questions for insert
with check (auth.uid()::text = profile_id);

create policy "simulado_attempt_questions_delete_own"
on public.simulado_attempt_questions for delete
using (auth.uid()::text = profile_id);
