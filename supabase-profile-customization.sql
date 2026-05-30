alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists frame_id text not null default 'learnflow';
