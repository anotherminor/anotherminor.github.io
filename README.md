# anotherminor.github.io

Hugo 기반의 정적 저널링 블로그입니다.

- 콘텐츠: Markdown + YAML front matter
- 배포: GitHub Pages (GitHub Actions)
- 검색: Pagefind
- 댓글: commentbox.io

## Project Goals

- 저널링/아카이빙 중심 운영
- 단순한 정적 사이트 유지
- 장기 이주 가능성 확보 (콘텐츠 규격 우선)

## Stack

- SSG: Hugo
- Hosting: GitHub Pages
- CI/CD: GitHub Actions
- Search: Pagefind
- Comments: commentbox.io

## Content Workflow

새 글 작성:

```bash
hugo new content posts/<entry_id>/index.md
```

- `entry_id` 형식: `YYYYMMDD-NNNN` (예: `20260327-0001`)
- `index.md` 작성 후 `draft: true` → `draft: false`로 변경해 발행
- 이미지는 `content/posts/<entry_id>/images/`에 저장 후 상대경로로 참조

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
