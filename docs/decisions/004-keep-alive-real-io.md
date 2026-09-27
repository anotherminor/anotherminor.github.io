# ADR 004: keep_alive() select-1 no-op → 실제 I/O 방식으로 교체

**상태:** 채택됨
**날짜:** 2026-09-27

## 맥락

Supabase 무료 플랜은 7일간 DB 활동이 없으면 프로젝트를 자동 일시정지한다. 이를 막기 위해 `.github/workflows/keep-alive.yml`이 매주 월·목 `public.keep_alive()` RPC를 호출해왔고, 이 함수는 최초 도입 시점부터 `select 1;`만 반환하는 순수 no-op이었다(§ 7.8).

그런데 다음 세 시점에 "프로젝트가 곧 일시정지될 예정"이라는 경고 메일이 반복 수신되었다.

- 2026-06-19
- 2026-08-19
- 2026-09-27

세 번째 발생 시점에 GitHub 저장소의 `last-run.txt` 커밋 히스토리를 4월 25일부터 전수 조사했다. 결과: 월·목 스케줄대로 4일 이상 간격이 벌어진 적이 단 한 번도 없었다. 워크플로우 구조상 `curl --fail`이 실패하면 다음 스텝(커밋·푸시)이 실행되지 않으므로, 이 커밋들이 존재한다는 것 자체가 매번 RPC 호출이 200으로 성공했다는 증거다.

즉 **워크플로우도 RPC 호출도 한 번도 끊기지 않았다.** 그런데도 경고가 반복된다는 것은, Supabase의 "sufficient activity" 판정 로직이 `select 1`처럼 실제 테이블 I/O가 없는 상수 반환 호출을 활동으로 인정하지 않는다는 뜻으로 해석할 수밖에 없다.

## 결정

`keep_alive()`를 전용 싱글턴 테이블에 대한 실제 `INSERT ... ON CONFLICT DO UPDATE`(WAL 발생)를 일으키는 함수로 교체한다.

```sql
create table if not exists public.keep_alive_state (
  id         boolean     primary key default true,
  last_ping  timestamptz not null default now(),
  constraint keep_alive_state_singleton check (id)
);

alter table public.keep_alive_state enable row level security;
-- 의도적으로 정책 없음 + anon 테이블 GRANT 없음: Data API 직접 접근 불가.

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
```

## 이유

- **기존 방식의 실증적 실패**: 3개월간 3회 반복 발생. 워크플로우 자체는 완벽히 정상 동작했으므로, 문제는 스케줄링이 아니라 RPC의 내용물이었다.
- **실사용 데이터와 분리**: `page_views`/`page_likes`에 인위적인 값을 흘려보내는 대안(예: `increment_views`를 keep-alive가 직접 호출)은 조회수·좋아요 통계를 오염시킨다. 전용 싱글턴 테이블은 이 부작용이 없다.
- **기존 보안 패턴 재사용**: `increment_views`/`toggle_like`와 동일하게 SECURITY DEFINER + RLS 활성화(정책 없음) 조합을 사용해, 이 프로젝트에 이미 확립된 "쓰기는 함수를 통해서만, 테이블 직접 노출 없음" 컨벤션을 그대로 따른다.
- **워크플로우 인터페이스 불변**: `POST /rest/v1/rpc/keep_alive` 호출 형태와 `{}` 바디는 그대로이며, `.github/workflows/keep-alive.yml`은 응답 바디를 검사하지 않으므로 워크플로우 파일 자체는 수정하지 않았다.

## 구현

```sql
-- supabase/schema.sql 참조 (Keep-Alive 섹션)
```

Supabase 프로덕션 프로젝트(`tcfrrkwmnpwsatpxvlbx`)에 마이그레이션으로 직접 적용 완료(2026-09-27). `select public.keep_alive();` 테스트 호출로 `keep_alive_state.last_ping`이 갱신됨을 확인.

## 트레이드오프

- 검증 항목이 하나 늘었다: 워크플로우 성공 여부(그린 체크)만으로는 부족하고, `keep_alive_state.last_ping`이 실제로 갱신되는지까지 확인해야 한다(§ 12.10 갱신).
- 그럼에도 불구하고 Supabase가 이 방식조차 활동으로 인정하지 않을 가능성은 완전히 배제할 수 없다. 재발 시 이 ADR을 갱신하고, Pro 플랜 전환(§ 11.5)을 재고한다.

## 이전에 검토했던 대안

- **Supabase Pro 업그레이드**: 일시정지 정책 자체를 회피할 수 있으나, 운영자가 비용 문제로 배제함.
- **`increment_views`/`toggle_like`를 keep-alive가 직접 호출**: 실사용 통계 오염 우려로 기각.
- **사람이 주기적으로 대시보드 방문**: 자동화 원칙에 어긋나고 재발 방지가 되지 않아 최후 수단으로만 남겨둠.

## 금지 사항

- `keep_alive()`는 `keep_alive_state` 외의 테이블에 쓰지 않는다.
- `keep_alive_state`에 anon용 SELECT/INSERT GRANT를 추가하지 않는다 (Data API로 노출할 이유가 없음).
