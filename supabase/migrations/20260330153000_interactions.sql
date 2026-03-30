create extension if not exists pgcrypto with schema extensions;

create table if not exists public.page_views (
  slug text primary key,
  count integer not null default 0
);

create table if not exists public.page_likes (
  slug text primary key,
  count integer not null default 0
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  content text not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_slug_created_at_idx
  on public.comments (slug, created_at);

alter table public.page_views enable row level security;
alter table public.page_likes enable row level security;
alter table public.comments enable row level security;

drop policy if exists "public read" on public.page_views;
drop policy if exists "public update" on public.page_views;
drop policy if exists "public insert" on public.page_views;
create policy "public read" on public.page_views
  for select
  using (true);

drop policy if exists "public read" on public.page_likes;
drop policy if exists "public update" on public.page_likes;
drop policy if exists "public insert" on public.page_likes;
create policy "public read" on public.page_likes
  for select
  using (true);

drop policy if exists "public read" on public.comments;
drop policy if exists "public insert" on public.comments;
create policy "public read" on public.comments
  for select
  using (true);
create policy "public insert" on public.comments
  for insert
  with check (true);

create or replace function public.increment_views(page_slug text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  insert into public.page_views (slug, count)
  values (page_slug, 1)
  on conflict (slug)
  do update
    set count = public.page_views.count + 1
  returning count into new_count;

  return new_count;
end;
$$;

create or replace function public.toggle_like(page_slug text, delta integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  insert into public.page_likes (slug, count)
  values (page_slug, greatest(0, delta))
  on conflict (slug)
  do update
    set count = greatest(0, public.page_likes.count + delta)
  returning count into new_count;

  return new_count;
end;
$$;

revoke all on function public.increment_views(text) from public;
revoke all on function public.toggle_like(text, integer) from public;
grant execute on function public.increment_views(text) to anon, authenticated;
grant execute on function public.toggle_like(text, integer) to anon, authenticated;
