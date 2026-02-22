# anotherminor.pages.dev

Hugo 기반의 정적 저널링 블로그입니다.

- 콘텐츠: Markdown + YAML front matter
- 배포: GitHub Pages (GitHub Actions)
- 검색: Pagefind
- 댓글: giscus (GitHub Discussions)

## Project Goals

- 저널링/아카이빙 중심 운영
- 단순한 정적 사이트 유지
- 장기 이주 가능성 확보 (콘텐츠 규격 우선)

## Stack

- SSG: Hugo
- Hosting: GitHub Pages
- CI/CD: GitHub Actions
- Search: Pagefind
- Comments: giscus

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

## Deployment (GitHub Pages)

- GitHub repo `Settings` → `Pages`
- `Build and deployment` → `Source: GitHub Actions`
- `main` 브랜치 push 시 자동 배포

워크플로우 파일:
- `.github/workflows/deploy-github-pages.yml`

## URL / Domain Notes

- 기본 GitHub Pages 프로젝트 사이트 URL은 `https://<user>.github.io/<repo>/` 형태입니다.
- 현재 repo 이름이 `anotherminor.pages.dev` 이므로 기본 URL은 `https://anotherminor.github.io/anotherminor.pages.dev/` 형태가 됩니다.
- 장기적으로 URL 정상화(짧고 안정적인 주소)를 원하면 아래 중 하나를 선택합니다.
  - 커스텀 도메인 연결 (권장)
  - 사용자 사이트 repo (`<user>.github.io`)로 운영

커스텀 도메인 사용 시:
- GitHub repo variable `SITE_BASE_URL` 설정 (예: `https://blog.example.com`)
- GitHub Pages `Custom domain` 설정
- 필요 시 `static/CNAME` 추가

## Documentation

- 통합 명세서(기획 + 구현 + 운영 + 검증): `docs/spec.md`
