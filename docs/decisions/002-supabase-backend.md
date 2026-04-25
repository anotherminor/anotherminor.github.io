# ADR 002: Supabase로 동적 인터랙션 구현

**상태:** 채택됨  
**날짜:** 소셜 기능 추가 시점

## 맥락

정적 사이트임에도 조회수, 좋아요, 댓글 기능이 필요했다.  
서버 없이 운영 가능한 BaaS(Backend as a Service)가 필요했다.

## 결정

**Supabase**를 동적 데이터 레이어로 선택.

## 이유

- **PostgreSQL**: 강력한 RLS(Row Level Security)로 클라이언트 직접 접근 시에도 보안 유지
- **Edge Functions**: 댓글 삭제 같은 서버 사이드 로직을 Deno 기반으로 실행
- **익명 API 키 노출 안전**: RLS 덕분에 anon 키를 클라이언트에 노출해도 허용된 작업만 가능
- **무료 티어**: 개인 블로그 트래픽 수준에서 비용 없이 운영 가능

## 구현

```sql
-- 조회수: post_views 테이블, increment_view() RPC
-- 좋아요: post_likes 테이블, toggle_like() RPC
-- 댓글: post_comments 테이블, RLS로 삭제는 Edge Function만 허용
```

자세한 내용 → `supabase/schema.sql`, `supabase/CLAUDE.md`

## 트레이드오프

- Supabase 서비스 다운 시 인터랙션 기능 전체 불가 (글 읽기는 정상)
- 댓글은 비밀번호 기반 → 계정 없는 익명 참여 가능하지만 비밀번호 분실 시 삭제 불가
- `hugo.yaml`에 Supabase URL/anon 키 포함 → 공개 저장소에서 의도적 노출 (RLS로 보호)

## 금지 사항

- `service_role` 키는 절대 클라이언트에 노출 금지
- `schema.sql` 변경 시 프로덕션 DB에 직접 영향 → `supabase/CLAUDE.md` 필독
