# minorupdates.com

Hugo 기반의 정적 저널링 블로그.

- 콘텐츠: Markdown + YAML front matter
- 빌드: Hugo
- 배포: GitHub Pages (GitHub Actions)
- 검색: Pagefind
- 상호작용: Supabase (조회수·좋아요·댓글)

## 원칙

- 저널링·아카이빙 중심 운영
- 단순한 정적 사이트 유지
- 장기 이주 가능성 확보 (콘텐츠 규격 우선)

## 스택

| 역할 | 도구 |
|---|---|
| SSG | Hugo |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |
| Search | Pagefind |
| Interactions | Supabase (views, likes, comments, delete Edge Function) |
| Keep-Alive | GitHub Actions (`.github/workflows/keep-alive.yml`) |

## 새 글 작성

```bash
hugo new content posts/<entry_id>/index.md
```

- `entry_id` 형식: `YYYYMMDD-NNNN` (예: `20260327-0001`)
- 작성 후 `draft: true` → `draft: false`로 발행
- 이미지는 `content/posts/<entry_id>/images/`에 두고 상대경로로 참조

## 새 태그 추가

1. `scripts/tag-map.json`에 `"한국어 이름": "slug"` 한 줄 추가
2. 포스트 front matter `tags`에 새 slug 기입
3. `npm run generate-tags` — 태그 페이지 자동 생성
4. 출력에 `[경고] 매핑 없는 태그` 또는 `slug 충돌`이 없는지 확인
5. `npm run validate:content` — front matter 형식 점검
6. push — CI에서 `generate-tags`와 Hugo 빌드가 재실행

`generate-tags`는 경고를 자동 차단하지 않는다. 태그를 수정한 날에는 로그를 직접 확인한다. 상세 규칙은 `docs/spec.md` § 5.6 참조.

## 발행 전 검증

```bash
npm run validate:content
```

front matter 계약 위반(카테고리 오기입, 필수 필드 누락 등)을 로컬에서 점검한다. 현재 CI에는 연결돼 있지 않으므로 발행 전 수동 실행한다. 상세 운영 루틴은 `docs/spec.md` § 10 참조.

## 로컬 미리보기

```bash
hugo server -D
```

- 기본 주소: `http://localhost:1313`
- `-D`는 draft 포함

검색(Pagefind)까지 확인하려면:

```bash
npm ci
BASE_URL="http://localhost:1313/" npm run build:pages
```

`build:pages`는 `public/` 이전 산출물을 정리한 뒤 빌드하므로, draft가 검색 인덱스에 섞이지 않는다.

## Supabase 상호작용

각 포스트 하단의 조회수·좋아요·댓글을 Supabase로 관리한다. 조회수·좋아요는 데이터베이스 함수(`increment_views`, `toggle_like`)로 원자적으로 갱신하고, 댓글 목록/등록은 Supabase REST API를 사용한다. 댓글 삭제는 비밀번호 검증을 수행하는 Edge Function에서 처리한다.

### 적용 순서

1. Supabase SQL Editor에서 `supabase/schema.sql` 실행 (테이블·RLS·RPC 생성)
2. `supabase functions deploy delete-comment --project-ref <project-ref>` 실행
3. `hugo.yaml`의 `params.supabase.url`, `anonKey`, `edgeFunctionUrl`이 실제 프로젝트 값과 일치하는지 확인

### 관련 위치

| 항목 | 경로 |
|---|---|
| 설정 | `hugo.yaml` `params.supabase` |
| 렌더링 | `layouts/partials/interactions.html` |
| 스타일 | `static/css/site.css` |
| DB 스키마 | `supabase/schema.sql` |
| 삭제 함수 | `supabase/functions/delete-comment/index.ts` |

## Supabase 자동 일시정지 방지

Supabase 무료 플랜은 7일간 DB 활동이 없으면 프로젝트가 자동 일시정지된다. `.github/workflows/keep-alive.yml`이 매주 월·목(KST 10:17) Supabase의 `keep_alive()` RPC를 호출해 활성 상태를 유지하고, 같은 실행에서 `last-run.txt`를 자동 커밋해 public 저장소 60일 비활성으로 인한 워크플로우 자동 비활성화도 함께 차단한다.

### 적용 순서

1. Supabase SQL Editor에서 `keep_alive()` 함수 생성 (상세 SQL은 `docs/spec.md` § 7.8 참조)
2. GitHub 저장소 → Settings → Secrets and variables → Actions에 두 개 등록
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY` (Supabase API 설정의 publishable key)
3. 저장소 → Settings → Actions → General → Workflow permissions를 **Read and write permissions**로 설정
4. Actions 탭에서 `Supabase Keep Alive` → `Run workflow` 1회 수동 실행 후 모든 스텝 ✅, `last-run.txt` 생성, 커밋 기록 확인

상세 명세·검증 항목·금지 사항은 `docs/spec.md` § 7.8, § 11.5, § 12.10 참조.

## 배포 (GitHub Pages)

- `Settings` → `Pages` → `Source: GitHub Actions`
- `main` 브랜치 push 시 자동 배포
- 워크플로우: `.github/workflows/deploy-github-pages.yml`

## 도메인

- 커스텀 도메인: `https://minorupdates.com`
- repo variable `SITE_BASE_URL` = `https://minorupdates.com`
- `static/CNAME`로 도메인 고정

## 문서

통합 명세서(기획·구현·운영·검증): `docs/spec.md`
