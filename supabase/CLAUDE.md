# CLAUDE.md — supabase/ (위험 구역)

이 디렉터리는 **프로덕션 데이터베이스**와 직접 연결된 코드를 포함한다.  
잘못된 변경은 실제 사용자 데이터(조회수, 좋아요, 댓글)에 영구적 영향을 준다.

## 포함 파일

| 파일 | 역할 | 위험도 |
|---|---|---|
| `schema.sql` | DB 테이블, RLS 정책, RPC 함수 정의 | 높음 — 프로덕션 DB에 직접 적용 |
| `functions/delete-comment/index.ts` | 댓글 삭제 Edge Function (Deno) | 중간 |

## 핵심 구조

### 테이블

```sql
page_views       -- 포스트별 조회수 (slug PK)
page_likes       -- 포스트별 좋아요 (slug PK)
comments         -- 댓글 (id, slug, name, content, password_hash, created_at)
keep_alive_state -- keep-alive 전용 싱글턴 테이블 (id=true 고정, last_ping timestamptz)
```

### RPC 함수

```sql
increment_views(page_slug text)               -- 조회수 원자적 증가
toggle_like(page_slug text, delta integer)    -- 좋아요 토글 (반환: 현재 count)
keep_alive()                                  -- 활성 신호 (GitHub Actions가 주 2회 호출)
```

`keep_alive()`는 `keep_alive_state`에 `(id: true, last_ping: now())`를 upsert하는 SECURITY DEFINER 함수다(2026-09-27부터, 이전엔 `select 1`만 반환하는 no-op이었으나 3차례 반복된 자동 일시정지 경고로 실제 I/O 발생 방식으로 교체됨 — 경위는 `docs/decisions/004-keep-alive-real-io.md`). `.github/workflows/keep-alive.yml`이 호출 주체. `keep_alive_state` 외의 실사용 데이터 테이블(`page_views`/`page_likes`/`comments`)에 쓰거나 활성 신호 외 목적으로 재활용하지 않는다. 상세 명세: `docs/spec.md` § 7.8.

### RLS 정책 요약

- `anon` 역할: SELECT, INSERT 허용 (조회수 읽기, 좋아요, 댓글 작성)
- `anon` 역할: DELETE 불허 (댓글은 Edge Function을 통해서만 삭제)
- `service_role`: 모든 권한 (Edge Function에서 사용)

## 작업 전 필독 규칙

1. **schema.sql 변경 = 프로덕션 마이그레이션**  
   변경 후 반드시 Supabase 대시보드 SQL 에디터에서 직접 실행해야 함.  
   파일만 수정해도 DB에 자동 반영되지 않는다.

2. **RLS 정책 수정 주의**  
   RLS를 `DISABLE`하거나 `service_role` 권한을 확장하면 데이터 노출 위험.  
   변경 전 현재 정책을 반드시 확인: `SELECT * FROM pg_policies;`

3. **anon 키 vs service_role 키**  
   - `anon` 키: `hugo.yaml`에 포함, 클라이언트에 노출됨 (의도적, RLS로 보호)
   - `service_role` 키: Edge Function 환경변수에만 존재, 절대 코드에 하드코딩 금지

4. **Edge Function 배포**  
   `functions/delete-comment/index.ts` 변경 후 Supabase CLI로 배포:
   ```bash
   supabase functions deploy delete-comment
   ```
   로컬 파일 변경만으로는 배포되지 않음.

5. **데이터 삭제 불가역성**  
   댓글, 좋아요, 조회수 데이터를 SQL로 삭제하면 복구 불가.  
   테스트는 반드시 로컬/스테이징 환경에서 진행.

6. **새 테이블 추가 시 명시적 GRANT 필수 (2026-10-30~)**  
   Supabase 정책 변경으로, 기존 프로젝트에서도 2026년 10월 30일 이후 새로 만드는 `public` 테이블은 명시적 `GRANT` 없이는 Data API(REST/GraphQL/supabase-js)에서 접근 불가.  
   기존 테이블(`page_views`/`page_likes`/`comments`)은 영향받지 않지만, `schema.sql`에 새 테이블을 추가할 때는 `create table` 인근에 GRANT를 함께 작성한다.
   ```sql
   grant select on public.<table> to anon, authenticated;          -- 읽기 전용
   grant select, insert on public.<table> to anon, authenticated;  -- 익명 쓰기 허용 시
   grant all on public.<table> to service_role;                    -- Edge Function용
   ```
   상세 운영 규칙: `docs/spec.md` § 7.7.
   예외: `keep_alive_state`는 의도적으로 anon GRANT를 전혀 주지 않는다 — Data API로 노출할 필요가 없는 내부 전용 테이블이며, `keep_alive()`(SECURITY DEFINER)를 통해서만 갱신된다.

## 연결 설정 위치

`hugo.yaml`:
```yaml
params:
  supabase:
    url: "https://xxxx.supabase.co"
    key: "eyJ..."   # anon public key만 여기에
```

`functions/delete-comment/index.ts` 내에서 `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` 사용.

## 트러블슈팅

조회수/좋아요/댓글 작동 안 할 때:
1. 브라우저 네트워크 탭 → Supabase API 응답 코드 확인
2. `hugo.yaml`의 URL/키 값 확인
3. Supabase 대시보드 → Logs → API 로그 확인
4. RLS 정책이 `anon` 역할을 허용하는지 확인
5. 응답이 `42501`이면 테이블 GRANT 누락 — 오류 메시지에 포함된 GRANT 문을 SQL Editor에서 실행
