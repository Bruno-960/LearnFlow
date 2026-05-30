alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists avatar_position_x integer not null default 0;
alter table public.profiles add column if not exists avatar_position_y integer not null default 0;
alter table public.profiles add column if not exists frame_id text not null default 'learnflow';
alter table public.profiles add column if not exists user_number bigint;
create sequence if not exists public.profile_user_number_seq start with 2 increment by 1;
alter table public.profiles alter column user_number set default nextval('public.profile_user_number_seq');

create unique index if not exists profiles_user_number_key
on public.profiles (user_number)
where user_number is not null;

with founder_profile as (
  select id
  from public.profiles
  where lower(name) = 'zecxs'
    and id <> 'usuário local'
    and id not like 'guest-%'
  order by updated_at desc
  limit 1
)
update public.profiles
set user_number = 1
where id in (select id from founder_profile)
  and (user_number is null or user_number = 1);

with numbered_profiles as (
  select
    id,
    row_number() over (order by updated_at asc, id asc) + 1 as next_number
  from public.profiles
  where user_number is null
)
update public.profiles
set user_number = numbered_profiles.next_number
from numbered_profiles
where public.profiles.id = numbered_profiles.id;

select setval(
  'public.profile_user_number_seq',
  greatest(2, coalesce((select max(user_number) from public.profiles), 1) + 1),
  false
);
