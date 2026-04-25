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
post_views    -- 포스트별 조회수 (slug PK)
post_likes    -- 포스트별 좋아요 (slug PK)
post_comments -- 댓글 (id, slug, author, body, password_hash, created_at)
```

### RPC 함수

```sql
increment_view(post_slug text)   -- 조회수 원자적 증가
toggle_like(post_slug text)      -- 좋아요 토글 (반환: 현재 상태)
keep_alive()                     -- 활성 신호용 no-op (GitHub Actions가 주 2회 호출)
```

`keep_alive()`는 `select 1;`만 반환하는 stable 함수다. Supabase 무료 플랜의 7일 무활동 자동 일시정지를 차단하기 위한 신호이며, `.github/workflows/keep-alive.yml`이 호출 주체. 정의를 무거운 쿼리로 바꾸거나 다른 목적으로 재활용하지 않는다. 상세 명세: `docs/spec.md` § 7.8.

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
