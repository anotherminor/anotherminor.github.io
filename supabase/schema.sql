create extension if not exists pgcrypto with schema extensions;

create table if not exists public.page_views (
  slug  text    primary key,
  count integer not null default 0
);

create table if not exists public.page_likes (
  slug  text    primary key,
  count integer not null default 0
);

create table if not exists public.comments (
  id            uuid        primary key default gen_random_uuid(),
  slug          text        not null,
  name          text        not null check (char_length(name)    <= 20),
  content       text        not null check (char_length(content) <= 500),
  password_hash text        not null,
  password_salt text        not null default '',
  created_at    timestamptz not null default now()
);

create index if not exists comments_slug_created_at_idx
  on public.comments (slug, created_at);

alter table public.page_views enable row level security;
alter table public.page_likes enable row level security;
alter table public.comments  enable row level security;

drop policy if exists "public read" on public.page_views;
create policy "public read" on public.page_views for select using (true);

drop policy if exists "public read" on public.page_likes;
create policy "public read" on public.page_likes for select using (true);

drop policy if exists "public read"   on public.comments;
drop policy if exists "public insert" on public.comments;
create policy "public read"   on public.comments for select using (true);
create policy "public insert" on public.comments for insert with check (true);

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
  do update set count = public.page_views.count + 1
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
  do update set count = greatest(0, public.page_likes.count + delta)
  returning count into new_count;

  return new_count;
end;
$$;

revoke all on function public.increment_views(text) from public;
revoke all on function public.toggle_like(text, integer) from public;
grant execute on function public.increment_views(text) to anon, authenticated;
grant execute on function public.toggle_like(text, integer) to anon, authenticated;

-- ============================================================
-- Data API 권한 (Supabase 2026 정책 대비)
-- 2026-10-30 이후, 기존 프로젝트에서도 신규 public 테이블은 명시적 GRANT
-- 없이는 Data API(REST/GraphQL/supabase-js)로 접근 불가.
-- 기존 테이블의 권한은 이 변경으로 회수되지 않지만, 이 파일을 새 환경에
-- 적용하거나 새 테이블을 추가할 때를 대비해 명시한다.
-- 멱등 연산이므로 운영 DB에 재실행해도 안전.
-- ============================================================

grant select         on public.page_views to anon, authenticated;
grant select         on public.page_likes to anon, authenticated;
grant select, insert on public.comments   to anon, authenticated;

-- service_role: Edge Function(delete-comment)이 댓글 삭제 시 사용
grant all on public.page_views, public.page_likes, public.comments to service_role;

-- ============================================================
-- Keep-Alive (Supabase 무료 플랜 자동 일시정지 방지)
-- 기존 select-1 no-op(2026-06-19 최초 도입)은 2026-06-19 / 08-19 / 09-27
-- 세 차례 반복해서 Supabase의 "sufficient activity" 감지 기준을 통과하지
-- 못함이 확인되어, 실제 INSERT/UPDATE(WAL 발생)를 일으키는 방식으로 교체
-- (2026-09-27). 전용 싱글턴 테이블에만 기록하며 조회수·좋아요 등 실사용
-- 데이터와는 분리한다. Data API로는 노출하지 않는다(RLS 활성 + 정책 없음,
-- anon 테이블 GRANT 없음) — SECURITY DEFINER 함수를 통해서만 갱신된다.
-- 상세 배경: docs/decisions/004-keep-alive-real-io.md, docs/spec.md § 7.8
-- ============================================================

create table if not exists public.keep_alive_state (
  id         boolean     primary key default true,
  last_ping  timestamptz not null default now(),
  constraint keep_alive_state_singleton check (id)
);

alter table public.keep_alive_state enable row level security;
-- 의도적으로 RLS 정책 없음 + anon 테이블 GRANT 없음:
-- Data API(REST/GraphQL/supabase-js)로는 직접 접근 불가.
-- keep_alive() 함수(SECURITY DEFINER)를 통해서만 갱신된다.

create or replace function public.keep_alive()
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  pinged_at timestamptz;
begin
  insert into public.keep_alive_state (id, last_ping)
  values (true, now())
  on conflict (id) do update set last_ping = excluded.last_ping
  returning last_ping into pinged_at;

  return pinged_at;
end;
$$;

revoke all on function public.keep_alive() from public;
grant execute on function public.keep_alive() to anon;
