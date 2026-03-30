# minorupdates.com

Hugo 기반의 정적 저널링 블로그입니다.

- 콘텐츠: Markdown + YAML front matter
- 배포: GitHub Pages (GitHub Actions)
- 검색: Pagefind
- 상호작용: Supabase 기반 조회수·좋아요·댓글

## Project Goals

- 저널링/아카이빙 중심 운영
- 단순한 정적 사이트 유지
- 장기 이주 가능성 확보 (콘텐츠 규격 우선)

## Stack

- SSG: Hugo
- Hosting: GitHub Pages
- CI/CD: GitHub Actions
- Search: Pagefind
- Interactions: Supabase (views, likes, comments, delete Edge Function)

## Content Workflow

새 글 작성:

```bash
hugo new content posts/<entry_id>/index.md
```

- `entry_id` 형식: `YYYYMMDD-NNNN` (예: `20260327-0001`)
- `index.md` 작성 후 `draft: true` → `draft: false`로 변경해 발행
- 이미지는 `content/posts/<entry_id>/images/`에 저장 후 상대경로로 참조

새 태그 추가:

1. `scripts/tag-map.json`에 `"한국어 이름": "slug"` 한 줄 추가 (쉼표·콜론 형식 주의)
2. 포스트 프론트매터에 slug 입력
3. 로컬 확인: `npm run generate-tags`
4. push → CI 자동 처리

상세 규칙: `docs/spec.md` § 5.6 참조

발행 전 콘텐츠 검증:

```bash
npm run validate:content
```

front matter 계약 위반(카테고리 오기입, 필수 필드 누락 등)을 로컬에서 사전 점검합니다.

상세 운영 루틴: `docs/spec.md` § 10 참조

## Local Preview

```bash
hugo server -D
```

- 기본 주소: `http://localhost:1313`
- `-D` 옵션은 `draft: true` 글까지 표시

검색(Pagefind)까지 확인하려면:

```bash
npm ci
BASE_URL="http://localhost:1313/" npm run build:pages
```

`build:pages` 스크립트는 `public/`의 이전 산출물을 정리한 뒤 빌드하여, 로컬에서 `-D` 미리보기 후에도 검색 인덱스에 draft 글이 섞이지 않도록 합니다.

## Supabase Interactions

- 설정 위치: `hugo.yaml`의 `params.supabase`
- 프론트 렌더링: `layouts/partials/interactions.html`
- 스타일: `static/css/site.css`
- DB/RLS/RPC 기준 SQL: `supabase/migrations/20260330153000_interactions.sql`
- 댓글 삭제 함수: `supabase/functions/delete-comment/index.ts`

현재 상호작용 시스템은 Supabase를 사용합니다. 개별 포스트 하단에서 조회수, 좋아요, 댓글을 렌더링하며, 댓글 삭제는 Edge Function에서 비밀번호 해시를 검증한 뒤 처리합니다. 조회수와 좋아요는 RPC(`increment_views`, `toggle_like`)를 통해 원자적으로 갱신하고, 댓글 목록/등록은 REST API로 처리합니다.

적용 순서는 다음과 같습니다. 먼저 Supabase SQL Editor에서 `supabase/migrations/20260330153000_interactions.sql` 내용을 실행해 테이블, RLS, RPC를 맞춥니다. 그다음 `supabase functions deploy delete-comment --project-ref <project-ref>`로 삭제 함수를 배포합니다. 마지막으로 `hugo.yaml`의 `params.supabase.url`, `anonKey`, `edgeFunctionUrl`이 실제 프로젝트와 일치하는지 확인합니다.

## Deployment (GitHub Pages)

- GitHub repo `Settings` → `Pages`
- `Build and deployment` → `Source: GitHub Actions`
- `main` 브랜치 push 시 자동 배포

워크플로우 파일:
- `.github/workflows/deploy-github-pages.yml`

## URL / Domain Notes

- 커스텀 도메인: `https://minorupdates.com`
- GitHub repo variable `SITE_BASE_URL` = `https://minorupdates.com`
- GitHub Pages `Custom domain` 설정 완료
- `static/CNAME` 파일로 도메인 고정

## Documentation

- 통합 명세서(기획 + 구현 + 운영 + 검증): `docs/spec.md`
