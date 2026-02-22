# anotherminor.pages.dev

Hugo + Cloudflare Pages 기반의 정적 저널링 블로그입니다.

- 콘텐츠: Markdown + YAML front matter
- 배포: Cloudflare Pages (GitHub 연동)
- 검색: Pagefind
- 댓글: giscus (GitHub Discussions)

상세 정책/구현/운영 기준 문서:
- `/Users/heejoon/Desktop/WORK/PROJECT/BLOG/anotherminor.pages.dev/docs/spec.md`

## Quick Start (Local Preview)

### 1) Hugo 미리보기 서버

```bash
hugo server -D
```

- `-D`: `draft: true` 글도 함께 표시
- 기본 주소: `http://localhost:1313`
- 저장 시 자동 반영(라이브리로드)

### 2) 검색(Pagefind)까지 포함한 로컬 빌드 확인 (선택)

```bash
npm ci
hugo --gc --minify --baseURL "http://localhost:8080"
npx --no-install pagefind --site public --glob "posts/**/*.html"
npx serve public -l 8080
```

- 검색 페이지(`/search/`) 동작까지 확인하려면 이 방식이 더 정확합니다.

## Cloudflare Pages 배포 설정 (v3 확정안 반영)

### Build command

```bash
npm ci && hugo --gc --minify --baseURL "${SITE_BASE_URL:-$CF_PAGES_URL}" && npx --no-install pagefind --site public --glob "posts/**/*.html"
```

### Output directory

```txt
public
```

### Environment variables

- `HUGO_VERSION=<pin>`
- `NODE_VERSION=<pin>`
- `SKIP_DEPENDENCY_INSTALL=1`
- `SITE_BASE_URL=https://your-domain.example` (커스텀 도메인 도입 후 프로덕션에만)

## 콘텐츠 구조 (요약)

- 포스트: `content/posts/<entry_id>/index.md`
- 포스트 이미지: `content/posts/<entry_id>/images/...`
- 공용 자산: `static/`

공개 URL은 front matter의 `slug`로 제어합니다.

## 운영 시 중요한 규칙 (요약)

### 검색 인덱싱 규칙

- `data-pagefind-body`는 **포스트 상세 템플릿에만** 사용
- giscus 영역은 `data-pagefind-ignore`
- Pagefind CLI는 `--glob "posts/**/*.html"`로 포스트 상세 HTML만 인덱싱

### 리다이렉트 정책

- `aliases`: Hugo alias HTML(클라이언트 리다이렉트 보조)
- `static/_redirects`: Cloudflare Pages HTTP 301/302 규칙

즉, `aliases`를 HTTP 301로 간주하지 않습니다.

## 문서

- 통합 명세서(기획 + 구현 + 운영 + 검증): `/Users/heejoon/Desktop/WORK/PROJECT/BLOG/anotherminor.pages.dev/docs/spec.md`

## 후속 개선 (v1.1 후보)

- Hugo `.Aliases` 기반 `_redirects` 자동 생성
