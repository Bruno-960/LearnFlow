-- LearnFlow - Calendar rules and reminders
-- Run this in Supabase SQL Editor after supabase-schema.sql.

create table if not exists public.calendar_reminders (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references public.profiles(id) on delete cascade,
  date date not null,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calendar_rules (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references public.profiles(id) on delete cascade,
  title text not null,
  rule_type text not null default 'outro'
    check (rule_type in ('folga', 'estudo', 'revisao', 'simulado', 'outro')),
  weekday integer not null check (weekday between 0 and 6),
  frequency text not null default 'weekly'
    check (frequency in ('weekly', 'biweekly')),
  start_date date not null,
  color text not null default 'orange'
    check (color in ('orange', 'purple', 'blue', 'green', 'rose', 'slate')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calendar_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references public.profiles(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, endpoint)
);

create table if not exists public.calendar_notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.calendar_push_subscriptions(id) on delete cascade,
  event_key text not null,
  deliver_on date not null,
  sent_at timestamptz not null default now(),
  unique (subscription_id, event_key, deliver_on)
);

alter table public.calendar_reminders enable row level security;
alter table public.calendar_rules enable row level security;
alter table public.calendar_push_subscriptions enable row level security;
alter table public.calendar_notification_deliveries enable row level security;

drop policy if exists "calendar_reminders_select_own" on public.calendar_reminders;
drop policy if exists "calendar_reminders_insert_own" on public.calendar_reminders;
drop policy if exists "calendar_reminders_update_own" on public.calendar_reminders;
drop policy if exists "calendar_reminders_delete_own" on public.calendar_reminders;
drop policy if exists "calendar_rules_select_own" on public.calendar_rules;
drop policy if exists "calendar_rules_insert_own" on public.calendar_rules;
drop policy if exists "calendar_rules_update_own" on public.calendar_rules;
drop policy if exists "calendar_rules_delete_own" on public.calendar_rules;
drop policy if exists "calendar_push_subscriptions_select_own" on public.calendar_push_subscriptions;
drop policy if exists "calendar_push_subscriptions_insert_own" on public.calendar_push_subscriptions;
drop policy if exists "calendar_push_subscriptions_update_own" on public.calendar_push_subscriptions;
drop policy if exists "calendar_push_subscriptions_delete_own" on public.calendar_push_subscriptions;
drop policy if exists "calendar_notification_deliveries_select_own" on public.calendar_notification_deliveries;

create policy "calendar_reminders_select_own"
on public.calendar_reminders for select
using (auth.uid()::text = profile_id);

create policy "calendar_reminders_insert_own"
on public.calendar_reminders for insert
with check (auth.uid()::text = profile_id);

create policy "calendar_reminders_update_own"
on public.calendar_reminders for update
using (auth.uid()::text = profile_id)
with check (auth.uid()::text = profile_id);

create policy "calendar_reminders_delete_own"
on public.calendar_reminders for delete
using (auth.uid()::text = profile_id);

create policy "calendar_rules_select_own"
on public.calendar_rules for select
using (auth.uid()::text = profile_id);

create policy "calendar_rules_insert_own"
on public.calendar_rules for insert
with check (auth.uid()::text = profile_id);

create policy "calendar_rules_update_own"
on public.calendar_rules for update
using (auth.uid()::text = profile_id)
with check (auth.uid()::text = profile_id);

create policy "calendar_rules_delete_own"
on public.calendar_rules for delete
using (auth.uid()::text = profile_id);

create policy "calendar_push_subscriptions_select_own"
on public.calendar_push_subscriptions for select
using (auth.uid()::text = profile_id);

create policy "calendar_push_subscriptions_insert_own"
on public.calendar_push_subscriptions for insert
with check (auth.uid()::text = profile_id);

create policy "calendar_push_subscriptions_update_own"
on public.calendar_push_subscriptions for update
using (auth.uid()::text = profile_id)
with check (auth.uid()::text = profile_id);

create policy "calendar_push_subscriptions_delete_own"
on public.calendar_push_subscriptions for delete
using (auth.uid()::text = profile_id);

create policy "calendar_notification_deliveries_select_own"
on public.calendar_notification_deliveries for select
using (
  exists (
    select 1
    from public.calendar_push_subscriptions
    where calendar_push_subscriptions.id = calendar_notification_deliveries.subscription_id
      and calendar_push_subscriptions.profile_id = auth.uid()::text
  )
);

create or replace function public.get_calendar_rule_occurrences(
  range_start date,
  range_end date
)
returns table (
  rule_id uuid,
  profile_id text,
  date date,
  title text,
  rule_type text,
  frequency text,
  color text
)
language sql
stable
security invoker
set search_path = public
as $$
  with active_rules as (
    select *
    from public.calendar_rules
    where profile_id = auth.uid()::text
      and is_active = true
      and start_date <= range_end
  ),
  days as (
    select generate_series(range_start, range_end, interval '1 day')::date as date
  )
  select
    active_rules.id as rule_id,
    active_rules.profile_id,
    days.date,
    active_rules.title,
    active_rules.rule_type,
    active_rules.frequency,
    active_rules.color
  from active_rules
  join days
    on ((extract(isodow from days.date)::integer + 6) % 7) = active_rules.weekday
   and days.date >= active_rules.start_date
   and (
     active_rules.frequency = 'weekly'
     or (
       active_rules.frequency = 'biweekly'
       and floor((days.date - active_rules.start_date)::numeric / 7)::integer % 2 = 0
     )
   )
  order by days.date, active_rules.created_at;
$$;
