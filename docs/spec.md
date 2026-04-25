# anotherminor.github.io 통합 명세서

블로그의 기획 원칙·구현 설정·운영 루틴·검증 기준을 하나로 합친 단일 기준 문서(Single Source of Truth).

## 1. 문서 목적 / 범위 / 독자

- 목적: 초기 구축, 운영, 수정, 이주 시 기준이 되는 명세를 고정한다.
- 범위: 현재 구축 범위와 후속 개선 메모까지 포함한다.
- 독자: 본인, 에이전트, 외주 구현자. 대화 로그 없이도 실행 가능해야 한다.

## 2. 목표와 원칙

### 2.1 목표

- 저널링·아카이빙 중심 블로그
- 카테고리
  - 소회 및 단상 (`rambling`)
  - 작품 후기·감상 (`entertainment`)
  - 테크 관찰 (`tech`)

### 2.1.1 사용자와 이용 맥락

운영자 본인의 저널링·아카이빙을 우선하는 개인 블로그다. 동시에 미디어·테크·단상 카테고리를 따라 천천히 읽고 다시 찾아오는 방문자를 전제한다. 짧은 소비보다 누적된 맥락을 따라 이동하며, 검색과 아카이브로 과거 글을 재방문하는 흐름을 기본 시나리오로 둔다. 홈·카테고리·아카이브·검색은 빠른 전환보다 차분한 탐색과 재발견에 유리한 구조를 우선한다.

### 2.1.2 브랜드 성격과 시각 방향

브랜드 성격은 차분함·절제·긴장감이다. 시각 방향은 에디토리얼한 흑백 저널을 기준으로 하며, 강한 대비 대신 약간 틴트된 뉴트럴로 밀도를 만든다. 화면의 대부분은 정적이고 조용해야 하고, 링크·활성 상태·포맷 배지·검색 하이라이트·주요 버튼처럼 시선과 행동을 명확히 유도해야 할 지점에만 형광 포인트를 사용한다.

- 색 비율: 뉴트럴 60 / 보조 회색 30 / 형광 포인트 10

### 2.1.3 디자인 원칙

- 계층은 명도와 면적 차이로 먼저 만들고 색은 마지막에 더한다.
- 중립색은 순수 회색이 아니라 미세하게 틴트된 값을 사용해 인쇄물 같은 밀도를 확보한다.
- 포인트 색은 장식이 아니라 의미를 가진 상태 변화·행동 유도에만 쓴다.
- 같은 포인트 색은 항상 같은 의미를 갖는다.
- 검색·포맷·링크로그·404처럼 행동 전환이 필요한 화면일수록 포인트 색의 이유가 더 명확해야 한다.

### 2.2 운영 철학

- 간단한 정적 사이트를 유지한다.
- 글은 Markdown 파일로 관리한다.
- 정적 빌드 결과물만 호스팅에 배포한다.

### 2.3 빌드/호스팅 분리 원칙

- `Hugo`: 빌드(정적 산출물 생성)
- `GitHub Pages`: 호스팅·배포
- 경계면: `public/` 산출물 폴더

이 경계면을 지키면 빌더/호스트 교체가 쉬워진다.

### 2.4 이주 가능성 우선 규칙 (핵심)

- 콘텐츠는 `순수 Markdown + YAML front matter` 중심으로 유지한다.
- 빌더 전용 문법(Shortcode / Liquid / MDX)은 본문에서 최소화한다.
- 단, 반복 사용되는 소셜 임베드는 작성 편의를 위해 제한된 Hugo shortcode 사용을 허용한다.
- 이미지·첨부는 포스트 번들 상대경로 규칙을 고정한다.
- 퍼머링크 규칙은 초기에 고정하고 자주 바꾸지 않는다.
- 콘텐츠와 테마/레이아웃을 논리적으로 분리한다.

## 3. 확정 스택

| 역할 | 도구 |
|---|---|
| 작성 | Obsidian 혹은 유사 노트 앱 |
| 저장소 | GitHub (단일 공개 저장소) |
| 빌드 | Hugo |
| 호스팅·배포 | GitHub Pages |
| 상호작용 | Supabase (조회수·좋아요·댓글) |
| 검색 | Pagefind |
| 임베드 | 플랫폼 공식 embed HTML (작성 시에는 Hugo shortcode 래퍼 우선) |
| Supabase 자동 일시정지 방지 | GitHub Actions (`keep-alive.yml`) |

### 3.1 저장소 공개 전략

- 단일 공개 GitHub 저장소를 사용한다.
- 사이트 소스와 콘텐츠는 같은 repo에 둔다.
- 상호작용 데이터는 Supabase 프로젝트로 연동한다.
- 이유: 초기 설정·운영 복잡도 최소화.

## 4. 콘텐츠 계약 (Public Content Contract)

### 4.1 폴더 구조

- 포스트: `content/posts/<entry_id>/index.md` (page bundle)
- 포스트 자산: `content/posts/<entry_id>/images/...`
- 공용 자산: `static/`

### 4.2 `entry_id`와 `slug`의 역할 분리

- `entry_id`: 내부 관리용 로컬 폴더명 (URL과 무관)
- `slug`: 공개 URL 제어용 (URL 마지막 세그먼트)

예시:

- `content/posts/20260222-0001/index.md`
- front matter: `slug: "hello-world"`
- 공개 URL: `/posts/2026/02/hello-world/`

### 4.3 page bundle 원칙

포스트는 page bundle(`index.md` + `images/`)로 유지한다. 샘플 콘텐츠도 같은 규칙을 따른다.

## 5. 메타데이터 계약 (YAML Front Matter Schema)

front matter는 YAML로 통일한다.

### 5.1 필수 필드

- `title` (string)
- `date` (datetime)
- `draft` (bool)
- `slug` (string)
- `categories` (array, 길이 1)

허용 카테고리: `rambling`, `entertainment`, `tech`.

### 5.2 권장 필드

- `tags` (array, 주제 태그만)
- `summary` (string)
- `cover` (string, 예: `images/cover.webp`)
- `updated` (datetime)

### 5.3 선택 필드

- `formats` (array, 길이 1, `link`)
- `external_url` (`formats=["link"]`일 때 사용)
- `aliases` (이전 URL 경로 기록)
- `canonical` (교차 게시 시 정규 URL override)

### 5.4 비권장/주의

- `url` 필드는 URL 규칙을 덮어쓸 수 있으므로 특별한 경우가 아니면 사용하지 않는다.

### 5.5 태그/포맷 운영 원칙

- 태그는 주제 태그만 사용한다 (형태 태그 금지).
- 기본 글에는 `formats`를 기록하지 않는다.
- 예외 글에만 `formats: ["link"]`를 기록한다.
- 뉴스성 글은 `formats` 대신 `소식` 태그로 분류한다.

### 5.6 태그 slug 시스템

Obsidian 등 노트 앱은 태그에 한국어 특수문자·공백·콜론을 안정적으로 다루기 어렵다. 이를 해결하기 위해 포스트 front matter에는 영문 slug를 저장하고, 빌드 시 `_index.md`를 자동 생성해 Hugo가 한국어 표시 이름으로 렌더링한다.

**구조**

| 파일 | 역할 |
|---|---|
| `scripts/tag-map.json` | `"한국어 이름": "english-slug"` 매핑 테이블 |
| `scripts/generate-tag-pages.js` | 비-draft 포스트에서 slug를 수집해 `content/tags/<slug>/_index.md` 생성 |
| `content/tags/<slug>/_index.md` | Hugo 태그 페이지 제목 고정 (`title: "한국어 이름"`) |

**포스트 작성 규칙**

태그 입력 시 slug를 직접 사용한다.

```yaml
tags: [film, disney-plus, severance]
```

URL은 `/tags/film/`이 되고, 페이지 타이틀은 `영화`로 표시된다.

---

**새 태그 추가 루틴**

#### 1단계 — `tag-map.json` 편집

단일 JSON 객체이며 각 줄은 `"표시 이름": "slug"` 형식이다.

```json
{
  "기존 태그": "existing-slug",
  "새 태그": "new-slug"
}
```

JSON 작성 규칙:

| 규칙 | 올바른 예 | 잘못된 예 |
|---|---|---|
| 키·값은 각각 별도의 문자열 | `"블로그": "blog"` | `"블로그: blog"` |
| 키-값은 콜론(`:`)으로 구분 | `"블로그": "blog"` | `"블로그" "blog"` |
| 마지막 외 모든 줄에 쉼표 | `"foo": "bar",` | `"foo": "bar"` |
| 마지막 항목에는 쉼표 없음 | `"zzz": "zzz"` | `"zzz": "zzz",` |
| slug는 소문자 영문·숫자·하이픈만 | `"vision-pro"` | `"Vision Pro"` |

slug 충돌(다른 표시 이름이 같은 slug)이 있으면 스크립트가 stderr에 경고를 출력한다.

#### 2단계 — 포스트 front matter에 slug 입력

```yaml
tags: [new-slug, other-slug]
```

#### 3단계 — 로컬 검증

```bash
npm run generate-tags
```

정상 출력 예: `태그 페이지 생성 완료: 1개 생성, 42개 처리`

매핑 누락 시 stderr 경고: `[경고] 매핑 없는 태그: "unknown-slug" — tag-map.json에 추가 필요`

#### 4단계 — push

CI `prebuild` 훅이 `generate-tag-pages`를 자동 실행한다. 별도 작업 불필요.

---

**스크립트 동작 요약 (`generate-tag-pages.js`)**

1. `tag-map.json` 로드 → `표시 이름 → slug` 맵 구성
2. 역방향 맵(`slug → 표시 이름`) 생성
3. `content/posts/` 하위 비-draft 포스트를 순회하며 `tags` 필드 수집
   - 표시 이름이면 정방향 맵으로 slug 변환
   - slug면 역방향 맵으로 표시 이름 조회
   - 매핑이 없으면 경고 후 건너뜀
4. 수집된 slug마다 `content/tags/<slug>/_index.md` 생성 (이미 존재하면 덮어쓰지 않음)

생성되는 `_index.md` 형식:

```markdown
---
title: "한국어 이름"
slug: "english-slug"
---
```

`generate-tag-pages`는 `prebuild` 훅을 통해 Hugo 빌드 직전 자동 실행되며, 로컬에서는 `npm run generate-tags`로 독립 실행 가능하다.

**검증 절차 / 자동 차단 범위**

1. `npm run generate-tags`
   - `tag-map.json` JSON 파싱 오류만 즉시 실패(exit 1).
   - 매핑 누락·`__TODO__` 대기 태그·slug 충돌은 stderr 경고로만 알리고 종료 코드는 0.
2. `npm run migrate-tags` (선택) — front matter의 한국어 표시 이름을 slug로 일괄 변환하는 교정 도구. 검증 도구가 아니므로 정상 루틴 단계는 아니다.
3. `npm run validate:content` — `tags`가 배열인지 같은 front matter 계약만 검사. 태그 매핑 정합성은 검사하지 않는다.
4. GitHub Actions — `npm run generate-tags`와 Hugo 빌드만 자동 실행. 경고를 실패로 승격하는 품질 게이트는 아직 없다.

따라서 현재 누락된 자동 검증은 세 가지다:

- 매핑 누락·slug 충돌이 있어도 CI가 실패하지 않는다.
- draft 포스트는 `generate-tags` 대상에서 제외되므로 발행 직전까지 태그 번역 문제가 숨을 수 있다.
- `validate-content.rb`는 태그 배열의 형태만 보며 매핑 정합성은 보지 않는다.

태그를 수정한 글은 발행 전에 반드시 `npm run generate-tags` 로그를 직접 확인한다.

### 5.7 콘텐츠 유효성 검사 (`validate-content.rb`)

`scripts/validate-content.rb`는 `content/posts/` 하위 모든 `index.md`의 YAML 프론트매터를 검사하는 Ruby 스크립트다.

**검사 항목**

- 필수 필드 존재 여부: `title`, `date`, `draft`, `slug`, `categories`
- `title`, `slug`: 비어 있지 않은 문자열
- `date`: 유효한 날짜/시간 값
- `updated`: 제공된 경우 유효한 날짜/시간
- `draft`: `true` / `false` boolean
- `categories`: 길이 1, 허용값 `[rambling, entertainment, tech]`
- `formats`: 제공된 경우 길이 1, 허용값 `[link]`
- `formats: [link]`이면 `external_url`이 유효한 `http/https` URL이어야 함
- `tags`: 제공된 경우 배열
- `url` 사용 시 경고 (slug 사용 권장)

**실행**

```bash
npm run validate:content
# 내부적으로: ruby scripts/validate-content.rb
```

오류가 하나라도 있으면 exit 1로 종료한다. 발행 전(`draft: false` 변경 전후) 로컬에서 실행한다.

**CI 연동**

현재 GitHub Actions 배포 워크플로우에는 연결돼 있지 않다. 로컬 발행 루틴의 수동 점검 단계이며 품질 게이트는 아니다.

## 6. URL / 분류 / 페이지 정책

### 6.1 포스트 URL 정책 (고정)

- 포스트 URL: `/posts/YYYY/MM/slug/`
- Hugo 설정: `permalinks.posts: /posts/:year/:month/:slug/`

### 6.1.1 사이트 루트 URL 정책 (GitHub Pages 기준)

GitHub Pages 사이트의 루트 URL은 저장소 유형에 따라 달라진다.

- 프로젝트 사이트: `https://<user>.github.io/<repo>/`
- 사용자 사이트: `https://<user>.github.io/`
- 커스텀 도메인: `https://<custom-domain>/`

현재 운영 방식:

- 사용자 사이트 repo(`anotherminor.github.io`)로 운영 중이며 기본 URL은 루트다.
- 커스텀 도메인 연결 시 `SITE_BASE_URL` repo variable로 baseURL을 고정한다.

### 6.2 taxonomy / term 정책

Hugo는 기본적으로 taxonomy list(`/tags/`)와 term page(`/tags/foo/`)를 모두 생성하지만, 본 프로젝트는 다음과 같이 운영한다.

- taxonomy list(`/categories/`, `/tags/`, `/formats/`)는 생성하지 않는다.
- term page(`/categories/<term>/`, `/tags/<term>/`, `/formats/<term>/`)는 유지한다.

구현 설정:

- `disableKinds: [taxonomy]`
- `ignoreErrors: ["error-disable-taxonomy"]`

### 6.3 "9개 페이지" 정의

Hugo의 내부 kind 수가 아니라 사용자 화면 유형 기준이다.

1. 홈
2. 아카이브
3. 카테고리(term)
4. 태그(term)
5. 포맷(term)
6. 포스트 상세
7. About
8. 검색
9. 404

각 화면의 상세 규칙은 § 14.4를 따른다.

### 6.4 내비게이션 정책

고정 메뉴(노출): `rambling`, `entertainment`, `tech`, `about`.

포맷 아카이브(`link`)는 메뉴에 노출하지 않고 배지 클릭 또는 직접 URL로 진입한다. 표시 규칙은 § 14.4에서 정의한다.

## 7. 구현 설정 (Hugo / GitHub Pages / Pagefind)

### 7.1 Hugo 설정 핵심 (`hugo.yaml`)

- `permalinks.posts: /posts/:year/:month/:slug/`
- `taxonomies: category/tags/format`
- `markup.goldmark.renderer.unsafe: true`
- `markup.goldmark.renderHooks.image.useEmbedded: always`
- `disableKinds: [taxonomy]`
- `ignoreErrors: ["error-disable-taxonomy"]`

목적:

- 임베드 HTML(raw HTML) 렌더링 허용 (직접 입력 및 shortcode 내부 출력 모두)
- taxonomy list 비활성화 + 빌드 로그 실패 리스크 완화

### 7.1.1 소셜 임베드 작성 규칙 (Hugo shortcode)

긴 embed HTML을 본문에 직접 붙여넣기보다 `layouts/shortcodes/`의 소셜 임베드 shortcode를 우선 사용한다. 이 규칙은 작성 편의를 위한 예외이며, 내부 구현은 플랫폼 공식 embed HTML/스크립트를 감싸는 방식으로 유지해 이식성을 크게 해치지 않는다.

현재 지원 shortcode:

- `youtube`, `youtube-shorts`
- `tiktok`, `instagram`, `twitter`, `threads`, `facebook`
- `applemusic`, `vimeo`

작성 원칙:

- 본문에서는 URL 또는 영상 ID만 넘기는 한 줄 호출을 기본으로 한다.
- 세로형(`youtube-shorts`, `tiktok`)은 shortcode 내부에서 9:16 포트레이트 래퍼를 적용한다.
- Instagram / TikTok / X는 직접 iframe을 구성한다. Instagram은 iframe이 보내는 `MEASURE` postMessage로 높이를 자동 조정한다.
- Threads는 `blockquote.text-post-media`와 공식 `embed.js`를 사용하고, iframe 생성 후 postMessage로 높이를 자동 조정한다.
- Facebook은 `fb-post + SDK`를 우선 시도하고, 실패 시 같은 블록 안의 직접 iframe fallback으로 내려간다.
- 임베드 실패·지연 시 사용자 친화적 링크 폴백 문구를 출력한다.
- 필요 시 raw HTML 임베드도 계속 허용한다 (예외 케이스 대응).
- YouTube URL에 `t=` / `start=` / `end=`가 있으면 embed 재생 구간으로 반영한다.
- Instagram 캐러셀 embed는 항상 첫 슬라이드를 표시한다. `img_index=`는 Instagram embed iframe이 무시하므로 특정 슬라이드를 꽂아 렌더할 수 없다. 특정 슬라이드를 강조해야 하면 해당 이미지를 별도로 저장해 일반 이미지로 삽입한다.
- Apple Music은 `Copy Embed Code`에서 얻은 공식 embed `src`(`https://embed.music.apple.com/...`)만 입력으로 사용하고, 일반 `music.apple.com/...` 공유 URL을 임의 변환하지 않는다.

본문 접힘 UI가 필요할 때는 HTML 표준 `details` / `summary`를 직접 사용한다. 브라우저 기본 기능이므로 이식성을 해치지 않는다. 긴 부연 설명·보충 메모·스포일러 등 처음부터 보일 필요가 없는 내용에 한해 제한적으로 사용하고, 글의 핵심 문장을 숨기는 용도로 쓰지 않는다.

예시:

```md
{{< youtube "https://www.youtube.com/watch?v=..." >}}
{{< youtube "https://www.youtube.com/watch?v=...&t=90&end=122" >}}
{{< youtube url="https://www.youtube.com/watch?v=..." start="90" end="122" >}}
{{< youtube-shorts "https://www.youtube.com/shorts/..." >}}
{{< tiktok "https://www.tiktok.com/@user/video/..." >}}
{{< instagram "https://www.instagram.com/p/..." >}}
{{< twitter "https://twitter.com/.../status/..." >}}
{{< threads "https://www.threads.net/@.../post/..." >}}
{{< facebook "https://www.facebook.com/.../posts/..." >}}
{{< applemusic "https://embed.music.apple.com/kr/album/...?..." >}}
{{< vimeo "https://vimeo.com/..." >}}
```

### 7.2 GitHub Pages 빌드/배포 인터페이스

- GitHub Actions에서 빌드 후 `public/`을 GitHub Pages에 배포한다.
- 워크플로우: `.github/workflows/deploy-github-pages.yml`

빌드 단계(개념):

```sh
npm ci
hugo --gc --minify --cleanDestinationDir --baseURL "${BASE_URL}"
npx --no-install pagefind --site public --glob "posts/**/*.html"
```

출력 디렉터리: `public`

### 7.3 GitHub Pages 배포 계약

- GitHub Actions로 빌드/배포한다 (`.github/workflows/deploy-github-pages.yml`).
- Hugo 버전 핀: `0.156.0`
- Node 버전 핀: `20`
- 기본 `BASE_URL`: `actions/configure-pages`의 `base_url` 출력값 사용
- repo variable `SITE_BASE_URL`가 있으면 이를 우선 사용 (커스텀 도메인용)
- 커스텀 도메인은 GitHub Pages 설정(`Custom domain`)으로 연결하고, 필요 시 `static/CNAME`를 사용한다

`baseURL` 주입 우선순위:

1. `SITE_BASE_URL` (repo variable)
2. GitHub Pages 배포 URL (`actions/configure-pages` 출력값)

### 7.4 Pagefind 버전/실행 정책

- `pagefind`는 `package.json`의 `devDependencies`에 정확 버전으로 핀한다.
- lockfile 기반(`npm ci`)으로 설치한다.
- 실행은 `npx --no-install pagefind ...`를 사용한다.

주의:

- `npx pagefind`(자동 최신 설치) 방식은 쓰지 않는다.
- 로컬 검증 시에도 `public/` 잔여 산출물(특히 과거 draft 빌드 결과)이 검색 인덱스에 섞이지 않도록 Hugo 빌드에 `--cleanDestinationDir`를 포함한다.

검색 UX/인덱싱 대체안(JSON 인덱스)은 § 14.2에서 정의한다.

### 7.5 글로벌 타이포그래피 (cap-height 시스템)

글로벌 타이포그래피는 tonsky.me의 cap-height 기반 아이디어를 참고해, GothicA1과 현재 레이아웃에 맞게 자체 구현했다. 원문 스타일시트를 복제하지 않고, cap-height 기준으로 본문·보조 텍스트 스케일을 계산하는 방식만 적용한다. 이 레이어는 `static/css/site.css`의 `:root` 변수와 `body` 선언에서 관리한다.

**핵심 변수 (`static/css/site.css` — `:root`)**

- `--cap-height`: 기준 cap-height (데스크탑 `calc(1rem * 11.75 / 16)`, 모바일 `calc(1rem * 10.8 / 16)`)
- `--cap-ratio`: cap-height → font-size 변환 비율 (`calc(1 / 0.698)`, GothicA1 기준)
- `--gap`: 기본 간격 단위 (`var(--cap-height)`)
- `--font-smaller`: 보조 텍스트 최소 스케일 (`10/12 cap`)
- `--font-small`: 보조 텍스트 중간 스케일 (`11/12 cap`)
- `--reading-line-height-body`: 한글 본문 기본 행간 (`1.68`)
- `--reading-line-height-relaxed`: 리드 문장 등 넉넉한 읽기 행간 (`1.7`)
- `--reading-line-height-support`: 요약·검색 발췌·캡션용 보조 행간 (`1.58`)

**한글 읽기 텍스트 행간 운영 원칙**

- 행간은 포인트 수치가 아니라 읽을 때 보이는 글자 높이를 기준으로 잡는다.
- WCAG 최소 `1.5`는 목표값이 아닌 하한선으로 해석하며, 한글 읽기 텍스트는 `1.45`~`1.75` 범위에서 운용한다.
- `.prose-body`는 이 범위 안에서 `1.68`을 기본값으로 유지한다.
- 리드 문장·요약·검색 발췌·캡션 같은 읽기 계열 텍스트는 역할에 따라 `--reading-line-height-relaxed` 또는 `--reading-line-height-support`를 사용한다.
- 읽기 계열 텍스트의 행간은 개별 셀렉터에 숫자를 직접 복사하지 않고 읽기 전용 변수에서 선택한다.
- 네비게이션·메타·배지·입력창 같은 UI 크롬은 이 체계에 편입하지 않는다.

**모바일 분기**

`@media (max-width: 640px)`에서 `--cap-height`만 재선언하여 모든 파생 변수가 자동으로 스케일된다. 본문 글로벌 스케일을 약 6% 낮추는 목적이므로, 모바일에서도 동일하게 `--cap-height`만 조정하고 파생 변수 체계는 유지한다.

**금지 사항**

- `--cap-height`, `--cap-ratio`를 제거하거나 `clamp()` / fluid typography / 임의의 rem 재설계로 대체하지 않는다.
- 모바일 분기 media query(`max-width: 640px`)를 삭제하거나 다른 방식의 별도 font-size 하드코딩으로 대체하지 않는다.
- `body font-size`를 하드코딩된 rem/px로 바꾸지 않는다.
- 라이트/다크 모드 토글을 추가하지 않는다 (시스템 설정 추종 유지).

**변수 체계를 따르는 요소**

- `body` (font-size: `calc(--cap-height * --cap-ratio)`)
- `.prose-body` (font-size: `inherit`)
- `.meta`, `.entry-summary__aux`, `.format-card__meta`, `.prose-body figcaption` → `var(--font-smaller)`
- `.page-hero__lede`, `.entry-summary__snippet`, `.format-card__summary` → `var(--font-small)`

**별도 스케일 컴포넌트 (이 시스템의 영향을 받지 않음)**

- 네비게이션(`.site-nav a`, `.site-brand`), 푸터(`.site-footer`), 배지(`.badge`)
- 검색 UI(`.pagefind-ui`), 댓글(`.discussion-panel`)
- 헤딩(`h1`~`h6`, 각 clamp() 스케일)
- 아카이브 타임라인 요소
- 코드블록은 본문 스케일을 상속하되 배경·스크롤·모노스페이스 폰트는 별도 유지

**검증 기준값**

- 데스크탑(1rem=16px): body ≈ 17.91px
- 모바일(viewport ≤ 640px): body ≈ 25.79px
- 모바일/데스크탑 비율: 1.44배
- `text-size-adjust: none` (모바일 자동 확대 차단)

### 7.6 색상 변수 시스템

색상 시스템은 § 2.1.2의 에디토리얼 흑백 저널 방향을 구현하는 기술 계층이다. 색은 화면마다 새로 고안하지 않고 `hugo.yaml`의 **6개 기준색**만 단일 지점에서 관리하며, CSS는 이 기준값에서 파생해 계산한다.

**기준색 정의 위치 (`hugo.yaml`)**

```yaml
params:
  colors:
    light:
      bg:     "..."   # 배경 기준색 (라이트)
      text:   "..."   # 글자 기준색 (라이트)
      accent: "..."   # 강조 기준색 (라이트)
    dark:
      bg:     "..."   # 배경 기준색 (다크)
      text:   "..."   # 글자 기준색 (다크)
      accent: "..."   # 강조 기준색 (다크)
```

색을 변경하려면 이 6개 값만 수정한다. 나머지 파생색은 자동 재계산된다.

**CSS 주입 흐름**

1. `layouts/partials/head.html`이 Hugo 템플릿으로 3개의 CSS custom property를 인라인 주입한다:
   - `--color-bg`, `--color-text`, `--color-accent` (라이트 기본)
   - `@media (prefers-color-scheme: dark)`에서 다크 기준색으로 교체
2. `static/css/site.css`는 이 3개 변수를 기준으로 파생 변수를 계산한다.

**파생색 계산 원칙**

파생색은 기준 변수에서 oklch 밝기(`l`) 조정 공식으로 만든다.

```css
/* 기준색보다 δ만큼 밝게 */
oklch(from var(--color-bg) calc(l + δ) c h)

/* 기준색보다 δ만큼 어둡게 */
oklch(from var(--color-bg) calc(l - δ) c h)

/* 투명도 조합 */
oklch(from var(--color-accent) calc(l + δ) c h / α)
```

- `δ`는 oklch lightness 절댓값 차이 (0.0~1.0 범위)
- 색상(`h`)·채도(`c`)는 기준색에서 그대로 상속
- 색 값을 직접 하드코딩하지 않는다 (단, `--accent-ink`처럼 기준색과 무관한 고정색은 예외 허용)

**라이트 / 다크 모드 파생 방향**

| 계열 | 라이트 파생 방향 | 다크 파생 방향 |
|------|----------------|--------------|
| `--color-bg` 기반 (배경·선) | 밝기 ↑ = 더 밝은 표면, ↓ = 구분선 | 밝기 ↑ = 더 밝은 표면, 구분선 |
| `--color-text` 기반 (글자) | 밝기 ↑ = 흐린 글자 | 밝기 ↓ = 흐린 글자 |
| `--color-accent` 기반 (강조) | 밝기 ↓ = strong, ↑ = soft | 밝기 ↑ = strong, ↓ = soft |

**금지 사항**

- `hugo.yaml`의 6개 기준색 외 색 값을 CSS에 직접 하드코딩하지 않는다.
- 새 파생색 추가 시 반드시 `oklch(from var(--color-*) ...)` 공식을 따르고, 조정 δ값을 주석으로 명시한다.

### 7.7 Supabase 설정 및 스키마 관리

#### 설정 위치

`hugo.yaml`의 `params.supabase`에서 관리한다.

```yaml
params:
  supabase:
    enabled: true
    url: "https://<project-ref>.supabase.co"
    anonKey: "<anon-key>"
    edgeFunctionUrl: "https://<project-ref>.supabase.co/functions/v1/delete-comment"
```

`interactions.html` 파셜이 이 값을 HTML `data-*` 속성으로 주입한다. anon 키는 공개 설계(publishable key)이므로 소스에 포함해도 무방하다. 실제 접근 제어는 RLS 정책과 Edge Function 비밀번호 검증으로 처리한다.

#### 스키마 관리

DB 스키마는 `supabase/schema.sql` 단일 파일로 관리한다. 마이그레이션 파일 누적 방식을 사용하지 않으며, 파일은 항상 현재 DB의 최종 상태를 반영한다.

**대시보드에서 스키마를 변경한 경우** 아래 명령으로 파일을 동기화한다.

```bash
supabase db dump -f supabase/schema.sql
```

변경 이력은 git history로 추적한다.

#### 초기 적용 순서

1. Supabase SQL Editor에서 `supabase/schema.sql` 실행 (테이블·RLS·RPC 생성)
2. Edge Function 배포:
   ```bash
   supabase functions deploy delete-comment --project-ref <project-ref>
   ```
3. `hugo.yaml`의 `params.supabase` 값이 실제 프로젝트와 일치하는지 확인

#### 관련 파일

| 항목 | 경로 |
|---|---|
| Hugo 설정 | `hugo.yaml` `params.supabase` |
| DB 스키마 | `supabase/schema.sql` |
| 렌더링 파셜 | `layouts/partials/interactions.html` |
| Edge Function | `supabase/functions/delete-comment/index.ts` |

### 7.8 Supabase 자동 일시정지 방지 (keep-alive 워크플로우)

Supabase 무료 플랜 프로젝트는 7일간 DB 활동이 없으면 자동 일시정지된다. 이를 방지하기 위해 GitHub Actions로 주기적 ping을 수행하며, 동시에 동일 워크플로우가 저장소에 작은 활동 파일을 커밋해 GitHub public 저장소 60일 비활성으로 인한 scheduled workflow 자동 비활성화도 함께 차단한다.

**구현 위치**

- 워크플로우 파일: `.github/workflows/keep-alive.yml`
- Supabase DB 함수: `public.keep_alive()` (SQL Editor에서 1회 생성)
- 활동 파일: 저장소 루트 `last-run.txt` (워크플로우가 자동 갱신·커밋)

**Supabase RPC 정의**

SQL Editor에서 1회 실행:

```sql
create or replace function public.keep_alive()
returns int
language sql
stable
as $$
  select 1;
$$;
grant execute on function public.keep_alive() to anon;
```

**워크플로우 동작 요약**

- 트리거: `schedule: "17 1 * * 1,4"` (UTC) — 매주 월·목 KST 10:17 + `workflow_dispatch` 수동 실행
- Step 1 — Checkout (`actions/checkout@v4`, `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: "true"` 설정)
- Step 2 — `curl`로 `${SUPABASE_URL}/rest/v1/rpc/keep_alive` POST 호출 (`apikey`·`Authorization` 헤더에 `SUPABASE_ANON_KEY` 적용)
- Step 3 — `last-run.txt`에 UTC 타임스탬프 기록 후 `github-actions[bot]` 명의로 자동 커밋·push (`|| exit 0`로 변경 없을 때 실패 방지)

**필수 GitHub 설정**

- Secrets (`Settings → Secrets and variables → Actions`)
  - `SUPABASE_URL` — 예: `https://<project-ref>.supabase.co`
  - `SUPABASE_ANON_KEY` — Supabase API 설정의 publishable key (구 anon key, 신규 분류명 publishable). secret key는 사용하지 않는다.
- Workflow permissions (`Settings → Actions → General`)
  - **Read and write permissions** 활성화 — Step 3의 자동 커밋 push에 필요

**주기 산정 근거**

- Supabase 7일 한도 대비 최대 간격 4일(목→월)로 충분한 안전 마진
- 정각 회피(`xx:17`)로 GitHub Actions schedule 정각대 부하·드롭 위험 회피
- GitHub schedule은 정시 실행 비보장이므로 빠듯한 일정 대신 주 2회 고정 요일 채택

**금지 사항**

- `secret key`(service_role 등 관리자 키)를 Secrets에 등록하지 않는다. publishable(anon) key만 사용한다.
- workflow 로그에 `${{ secrets.* }}` 값을 echo·출력하지 않는다.
- `keep_alive()` 함수의 정의를 무거운 쿼리로 변경하지 않는다 (활성 신호 외 목적 금지).
- 60일 활동 회피용 `last-run.txt` 외에 별도 더미 파일·더미 커밋을 추가하지 않는다.

## 8. 템플릿 규칙 (구현 가드레일)

### 8.1 검색 인덱싱 규칙 (이중 안전장치)

본 절은 구현 가드레일 요약이며, 배경·운영 원칙은 § 14.2를 따른다.

**템플릿 규칙**

- `data-pagefind-body`는 포스트 상세 템플릿에만 사용한다.
- interactions 영역은 `data-pagefind-ignore`를 적용한다.
- 목록·분류·검색·404·about 템플릿에는 `data-pagefind-body`를 넣지 않는다.

**CLI 규칙**

- `pagefind --glob "posts/**/*.html"` 고정

이 둘을 조합해 템플릿 실수와 목록 전문 렌더링 중복 인덱싱 리스크를 동시에 줄인다.

### 8.2 링크로그(`formats=["link"]`) 규칙

본 절은 구현 규칙 요약이며, 렌더링·SEO 상세 기준은 § 14.3을 따른다.

- `link` 포맷의 외부 URL 공유 동작은 선택 기능이며, 사용할 때는 front matter에 `external_url`을 기록한다.
- `formats=["link"]`이고 `external_url`이 있으면 제목 링크는 외부 URL로 연결한다.
- 외부 링크에 `rel="noopener noreferrer"`를 적용한다.
- 내부 상세(`.Permalink`)로 가는 보조 링크를 제공한다.
- 보조 링크는 기호(예: `¶`)와 함께 텍스트 라벨(예: `내 글`)을 제공해 접근성을 확보한다.
- 상세 본문 상단에 원문 링크(`external_url`)를 명시한다.

### 8.3 포맷 배지 규칙

본 절은 템플릿 출력 요약이며, 화면별 노출 위치·메타 조합은 § 14.4를 따른다.

- 홈·카테고리·태그·포맷 목록 카드(또는 메타 영역)에서 `formats` 값을 읽어 조건부로 배지를 출력한다.
- `formats=["link"]` → `LINK` 배지
- 배지는 클릭 가능하며 해당 포맷 term 페이지(`/formats/link/`)로 이동한다.

### 8.4 canonical 우선순위

본 절은 `<head>` 템플릿 구현 요약이며, 적용 맥락은 § 14.3을 따른다.

- 기본: `.Permalink`
- 예외: front matter의 `canonical`이 있으면 우선 사용

## 9. 리다이렉트 정책 (`aliases` 중심)

### 9.1 역할 정의

- `aliases`
  - front matter에 기록
  - Hugo가 alias HTML 생성
  - 클라이언트 리다이렉트 보조 용도

**GitHub Pages 제약**

- Cloudflare `_redirects` 같은 서버 측 리다이렉트 규칙 파일을 지원하지 않는다.

**중요**

- `aliases`를 HTTP 301로 간주하지 않는다.
- 서버 측 301/302가 필요하면 별도 호스트/프록시가 필요하다.

### 9.2 slug 변경 운영 절차

1. 포스트 `slug` 변경
2. 기존 경로를 `aliases`에 추가
3. 배포 후 이전/신규 URL 모두 확인 (alias HTML 동작 확인)
4. 서버 측 301이 꼭 필요한 경우, 호스트/프록시 전략을 별도 검토

### 9.3 후속 개선 메모

- Hugo `.Aliases` 기반 alias 자동 점검 (또는 향후 호스트 변경 시 리다이렉트 규칙 생성) 검토

## 10. 운영 루틴

### 10.1 새 글 작성

1. `hugo new content posts/<entry_id>/index.md`
2. Obsidian 등 노트 앱에서 `index.md` 작성
3. `slug` 입력 (공개 URL용)
4. 이미지는 `images/`에 저장하고 상대경로로 참조
5. 태그를 추가·수정했다면 `npm run generate-tags` 실행
6. 출력 로그에서 매핑 누락·slug 충돌 경고 확인
7. 로컬 미리보기 확인
8. `npm run validate:content` 실행
9. 커밋·푸시 → GitHub Actions 배포 확인 → merge

### 10.2 발행

- `draft: false` 변경 전·직후 로컬에서 `npm run validate:content`로 front matter 계약 위반 여부를 점검한다.
- 태그를 건드린 글이면 같은 시점에 `npm run generate-tags`를 다시 실행해 경고 로그를 확인한다.
- merge 후 GitHub Actions가 `npm run generate-tags`와 Hugo 빌드를 자동 재실행한다.

### 10.3 수정/정정

- URL(slug) 변경은 예외적으로만 허용한다.
- 불가피할 때 `aliases`를 사용하고, 서버 측 리다이렉트가 꼭 필요하면 호스팅 전략을 재검토한다.
- 필요 시 `updated`를 갱신한다.

### 10.4 `<!--more-->` 정책

- 홈·카테고리 목록은 기본적으로 전문 렌더링을 유지한다.
- 작성자가 `<!--more-->`를 넣은 글은 해당 지점까지 목록에 노출하고 `계속 읽기` 링크를 붙인다.
- 상세 페이지는 항상 전문 유지.

### 10.5 archetype / YAML 강제 규칙

- `hugo new content ...`를 기본 루틴으로 사용한다.
- archetype 파일은 YAML 구분자(`---`)를 사용해 YAML front matter를 강제한다.

### 10.6 이미지 캡션 빈 줄 규칙

이미지 캡션 여부는 별도 문법이 아니라 마크다운의 빈 줄 규칙으로 결정한다. 전제 조건은 `hugo.yaml`에 `markup.goldmark.renderHooks.image.useEmbedded: fallback`이 설정돼 있고, 프로젝트의 image render hook이 이미지를 `<figure>`가 아닌 `<img>` 인라인으로 렌더링하는 상태여야 한다.

- 이미지 마크다운 다음 줄에 텍스트를 바로 쓰면 같은 문단으로 묶이며, CSS가 그 문단 전체를 캡션으로 간주해 작은 크기·낮은 대비·가운데 정렬로 표시한다.
- 이미지 다음에 빈 줄을 하나 넣으면 이미지 문단과 일반 본문 문단으로 분리된다.

**캡션 패턴**

```md
![img](url)
이 문장은 캡션
```

```html
<p><img src="..." alt="">이 문장은 캡션</p>
```

**일반 문단 패턴**

```md
![img](url)

이 문장은 일반 문단
```

```html
<p><img src="..." alt=""></p>
<p>이 문장은 일반 문단</p>
```

작성자는 이미지 바로 다음 줄에 텍스트를 쓰면 캡션으로 처리된다는 점을 이해해야 하며, 일반 문단을 이어 쓰려면 반드시 빈 줄을 넣는다. 이 규칙을 위해 마크다운 클래스 추가, HTML 구조 수정, JavaScript는 사용하지 않는다. image render hook이 `<figure>` 구조를 출력하도록 바뀌면 이 규칙은 다시 검토한다.

브라우저 기본 툴팁이 필요하면 image render hook에서 `title` 속성을 `alt` 값으로 기본 복제한다. 작성자가 `![설명](경로 "제목")` 문법을 쓰면 `title`은 그 값을 우선 사용한다.

**본문 이미지 표시 규칙**

- 실제 본문 컨테이너 `.prose-body img`를 기준으로 고정한다.
- `width: auto`, `max-width: 100%`, `height: auto` — 원본 비율을 유지한 채 본문 폭을 넘지 않는다.
- 가로로 긴 이미지는 필요할 때만 본문 폭 안으로 축소되며, 원본 폭이 더 작으면 억지로 늘리지 않는다.
- 세로로 긴 이미지는 `max-height: 480px` 제한을 적용한다.
- 블록 요소로 가운데 정렬하며, 이미지 자체 여백은 `margin: 0 auto`로 두고 문단 간 세로 여백은 이미지 문단 규칙이 관리한다.

### 10.7 본문 접힘(`details` / `summary`) 규칙

마크다운에는 접기 전용 문법이 없으므로, 본문에서 해당 UI가 필요하면 HTML `details` / `summary`를 사용한다. 전제 조건은 `hugo.yaml`에서 raw HTML 렌더링이 허용돼 있는 것이며, 현재 설정은 이를 충족한다.

- `details`는 접히고 펼쳐지는 전체 영역.
- `summary`는 사용자가 눌러 여닫는 제목 줄. 반드시 첫 줄에 둔다.
- 실제 숨길 문단은 그 아래에 일반 문단처럼 작성한다.
- 접힘 영역은 긴 부연·보충·스포일러 같은 보조 정보에만 사용하고, 핵심 본문을 통째로 숨기지 않는다.

예시:

```md
<details>
<summary>숨겨둔 문단 열어보기</summary>

이 문단은 처음에는 접혀 있다가 제목 줄을 누르면 펼쳐진다.

</details>
```

렌더링 전제:

```html
<details>
  <summary>숨겨둔 문단 열어보기</summary>
  <p>이 문단은 처음에는 접혀 있다가 제목 줄을 누르면 펼쳐진다.</p>
</details>
```

- `summary` 문구만 보고도 내용을 짐작할 수 있게 짧고 분명하게 쓴다.
- 접힘 영역의 위·아래 여백은 일반 문단 흐름을 크게 해치지 않아야 한다.
- CSS에서 별도 스타일을 추가하더라도 기본 동작은 브라우저 표준을 유지한다.

## 11. 리스크 가드레일

### 11.1 GitHub Pages / Actions 운영 리스크

- GitHub Actions 실행 시간·분량, GitHub Pages 배포 제약을 고려한다.
- 현재 운영 기준은 순수 정적 사이트 + GitHub Pages 표준 배포 유지.
- 파일·미디어 증가 속도를 관리한다.
- 프로젝트 사이트 URL은 repo 경로(`/<repo>/`)를 포함하므로, 템플릿·자산 경로는 `baseURL` 기준으로 생성한다.
- 정확한 제한·정책은 운영 시점에 GitHub 공식 문서 최신값을 확인한다.

### 11.2 GitHub 저장소 용량 리스크

- 미디어 누적 시 저장소 크기 증가가 운영 이슈가 될 수 있다.
- 대용량 바이너리는 장기적으로 분리 전략이 필요할 수 있다.

### 11.3 이미지 운영 기본 규칙

- 커밋 전 리사이즈 + WebP 변환을 우선한다.
- 포스트 번들 + 상대경로 규칙을 유지한다.
- 고해상도 원본·대용량 미디어는 필요 시 분리 검토.

### 11.4 전문 렌더링 성능 관리 기준

- 홈: 최신 `N`개 전문 렌더링 (현재 `N=5`)
- 카테고리: 전문 렌더링 + 페이지네이션
- 검색 인덱싱은 포스트 상세만 대상으로 제한

### 11.5 Supabase 무료 플랜 / GitHub Actions 비활성 리스크

- Supabase 무료 플랜은 7일 무활동 시 프로젝트 자동 일시정지된다. § 7.8의 keep-alive 워크플로우로 대응한다.
- GitHub public 저장소는 60일 무활동 시 scheduled workflow가 자동 비활성화된다. keep-alive 워크플로우의 자동 커밋 스텝이 매 실행마다 저장소 활동을 발생시켜 이 카운터를 리셋한다.
- Pro 플랜 전환 시 Supabase 측 일시정지 정책에서 자유로워지며, 그 시점에 § 7.8의 keep-alive 워크플로우 유지 여부를 재검토한다.
- 워크플로우 실패 알림은 GitHub 계정 기본 메일 수신 설정으로 받는다. 장기 미수신 시 Actions 탭에서 직접 상태 점검.

## 12. 테스트 / 검증 시나리오

### 12.1 태그 번역 검증

- `tag-map.json`에 등록된 slug를 비-draft 포스트에 추가한 뒤 `npm run generate-tags` 실행 시, 해당 slug의 `content/tags/<slug>/_index.md`가 없으면 자동 생성되는지 확인.
- `tag-map.json`에 없는 태그를 넣었을 때 경고를 출력하지만 종료 코드는 0을 유지하는지 확인.
- `draft: true` 포스트의 태그는 수집 대상에서 제외되는지 확인.
- `npm run validate:content`가 `tags` 배열 타입 오류는 잡지만 매핑 누락은 잡지 않는지 확인.

### 12.2 taxonomy disable + 빌드 로그 안정성

- `disableKinds: [taxonomy]` 적용 후 빌드 성공.
- `ignoreErrors: ["error-disable-taxonomy"]` 상태에서 GitHub Actions 빌드 성공.
- `/categories/`, `/tags/`, `/formats/` 미생성 확인.
- `/categories/<term>/`, `/tags/<term>/`, `/formats/<term>/` 생성 유지 확인.

### 12.3 baseURL / canonical / 절대 URL

- 사용자 사이트 기본 배포 시 `https://anotherminor.github.io/` 기준 canonical/절대 URL 생성 확인.
- 커스텀 도메인 도입 후 `SITE_BASE_URL` 기준 canonical 생성값 확인.
- RSS / sitemap 절대 URL 정합성 확인.

### 12.4 Pagefind 검색 인덱싱

- `public/posts/**/*.html`만 인덱싱되는지 확인.
- 로컬 검증 전 `public/` 잔여 산출물 정리(`--cleanDestinationDir` 포함 빌드) 상태 확인.
- 홈·카테고리·태그·아카이브가 검색 결과에 섞이지 않는지 확인.
- 동일 글이 목록/상세로 중복 검색되지 않는지 확인.
- interactions 댓글 내용이 검색 결과에 섞이지 않는지 확인.

### 12.5 이미지 캡션 빈 줄 규칙 검증

- 이미지 다음 줄에 텍스트를 붙여 쓴 경우, 빌드 결과가 하나의 `<p>` 안에 이미지와 텍스트를 함께 포함하는지 확인.
- 위 패턴이 화면에서 작은 보조 텍스트 크기·낮은 대비·가운데 정렬의 캡션으로 보이는지 확인.
- 이미지 다음에 빈 줄을 넣은 경우, 이미지 문단과 일반 문단으로 분리되는지 확인.
- 빈 줄이 있는 패턴의 두 번째 문단이 본문 기본 크기·정렬을 유지하는지 확인.
- 가로 이미지가 본문 폭을 초과할 때만 축소되고, 원본 폭이 더 작은 이미지는 확대되지 않는지 확인.
- 세로 이미지가 비율을 유지한 채 최대 높이 480px 안으로 제한되는지 확인.

### 12.6 본문 접힘(`details` / `summary`) 규칙 검증

- `details`·`summary`를 입력한 본문이 빌드 후에도 태그 형태로 유지되는지 확인.
- 초기 렌더링에서 `summary` 문구만 보이고 접힘 영역 본문은 기본적으로 닫힌 상태인지 확인.
- `summary`를 눌렀을 때 정상적으로 펼쳐지고 다시 접히는지 확인.
- 접힘 블록 전후의 문단 여백·줄간격이 일반 본문 흐름을 과도하게 깨지 않는지 확인.

### 12.7 상호작용(Supabase)

- 상호작용 바 렌더링이 정상 동작하는지 (`params.supabase.enabled`, `url`, `anonKey`, `edgeFunctionUrl` 기준) 확인.
- 조회수 RPC(`increment_views`) 호출 시 count 생성·증가가 화면에 반영되는지 확인.
- 좋아요 RPC(`toggle_like`) 호출 시 동일 브라우저 기준 토글·count 반영이 정상 동작하는지 확인.
- 댓글 작성·표시 기본 흐름 정상 동작 확인.
- 댓글 삭제 Edge Function이 비밀번호 검증 성공 시 삭제, 실패 시 403 메시지를 반환하는지 확인.
- 포스트 permalink 기준으로 조회수·좋아요·댓글이 분리되는지 확인.

### 12.8 리다이렉트

- `aliases`만 추가 시 alias HTML 기반 이동 동작 확인.
- `slug` 변경 + `aliases` 추가 조합에서 이전 URL 이동 동작 확인.
- (선택) 커스텀 도메인·프록시 도입 시 서버 측 리다이렉트 정책 별도 검증.

### 12.9 빌드 재현성

- `npm ci` 후 빌드 성공.
- lockfile 유지 상태 재빌드 일관성 확인.
- GitHub Actions 배포 결과와 로컬 빌드 결과 핵심 동작 동일성 확인.

### 12.10 Supabase keep-alive 워크플로우

- `Run workflow` 수동 실행 시 모든 스텝이 ✅로 완료되는지 확인.
- Supabase Dashboard → Logs에서 `rpc/keep_alive` 호출이 200으로 기록되는지 확인.
- 저장소 루트에 `last-run.txt`가 생성·갱신되고, 커밋 히스토리에 `chore: keep-alive ping`이 기록되는지 확인.
- Secrets 미설정 또는 오타 시 Step 2가 실패하는지 확인 (정상 가드 동작).
- Workflow permissions가 read-only일 때 Step 3 push가 실패하는지 확인 (운영 시 read/write 유지).
- 정기 실행(`schedule`) 트리거가 월·목 중 1회 이상 실제 실행 로그를 남기는지 주기적으로 확인.

## 13. 후속 작업

- Hugo `.Aliases` 기반 alias 점검 자동화 (또는 향후 호스트 전환 대비 리다이렉트 규칙 생성)
- 이미지 처리 자동화(Hugo image processing / render hook)
- 로컬 콘텐츠 검증 스크립트의 CI 품질 게이트 연동 (`npm run validate:content`)
- 태그 매핑 누락·slug 충돌을 CI 실패로 승격하는 검증 추가
- 검색 UI 커스터마이징 (필요 시)
- Pro 플랜 전환 시 § 7.8 keep-alive 워크플로우 유지 여부 재검토

## 14. 렌더링·검색·링크로그·페이지 설계 가이드

### 14.1 홈/카테고리 '전문' 렌더링과 성능 제어

**정책**

- 홈과 카테고리 페이지는 원칙적으로 전문(잘림 없이)을 렌더링한다.

**예외 (비상 브레이크)**

- 이미지·임베드가 많거나 글이 지나치게 길어 목록 로딩에 부담이 생길 경우, 작성자가 본문에 `<!--more-->`를 삽입해 목록 출력 길이를 제한한다. 이 경우 홈·카테고리 목록은 해당 지점까지만 렌더링하고 `계속 읽기` 링크를 노출한다.
- 이 예외를 사용할 때에도 개별 포스트 상세 페이지에는 전문이 유지된다.
- 목록에 노출할 텍스트를 명확히 통제하려면 `summary` 필드를 함께 사용한다.

### 14.2 검색 페이지 (정적 환경)

정적 사이트에서 검색은 빌드 시점에 만든 인덱스를 브라우저에서 탐색하는 방식으로 구현한다. 서버는 필요하지 않다.

**기본 구현: Pagefind**

설치·버전 핀:

- 저장소에 `package.json` + lockfile을 추가한다.
- `pagefind`는 devDependencies에 **정확 버전**으로 고정한다.
- CI는 `npm ci`로만 설치하고 `npx --no-install`로만 실행한다.

빌드 단계:

- Hugo 빌드 후 `public/` 디렉터리를 Pagefind가 인덱싱한다.
- 표준 커맨드: `hugo --gc --minify` → `npx --no-install pagefind --site public --glob "posts/**/*.html"`

인덱싱 범위 제어 (이중 안전장치):

- 템플릿 규칙
  - `data-pagefind-body`는 포스트 상세 템플릿에만 사용한다.
  - 홈·카테고리·태그·포맷·아카이브·검색·404·about 템플릿에는 넣지 않는다.
  - interactions 영역에는 `data-pagefind-ignore`를 적용한다.
- CLI 규칙
  - `--glob "posts/**/*.html"`로 포스트 상세 HTML만 인덱싱하도록 고정한다.
  - 템플릿 실수로 목록 페이지에 표식이 들어가더라도 인덱싱 범위를 제한한다.

**대체 구현 (필요 시): JSON 인덱스 + 클라이언트 검색 (Fuse.js 등)**

- 빌드 시 `index.json` 같은 검색 인덱스를 생성하고 브라우저에서 읽어 검색한다.
- 요구사항: 홈 출력에 JSON 포함(HTML/RSS/JSON), JSON 템플릿 추가(필드 명시).
- 주의: 글이 늘면 `index.json`이 커져 초기 로딩 부담이 증가한다.

### 14.3 링크로그(link 포맷) 렌더링과 SEO

**목표**

- 목록에서 제목 클릭은 외부 원문으로 즉시 이동.
- 동시에 내부 상세 페이지(아카이빙·댓글·내 메모)는 별도 경로로 항상 접근 가능.

**목록 템플릿 정책**

적용 범위: 홈·카테고리·태그·포맷 목록 템플릿 (카드·요약 리스트·메타 영역 공통).

`formats`에 `link`가 있고 `external_url`이 있으면:

- 제목 링크 → `external_url`
- 외부 링크 공유용 필드 → front matter `external_url`
- 외부 링크에 `rel="noopener noreferrer"` 적용
- 보조 링크(예: `¶`, "내 글", ∞ 등) → 내부 상세 `.Permalink`
- 보조 링크에 기호만 쓰지 말고 접근성용 텍스트 라벨(예: "내 글")을 함께 제공

**상세 페이지 정책**

- 본문 상단에 원문 링크(`external_url`)를 명확히 노출한다.

**canonical 정책**

- 기본: 내부 상세 페이지의 `.Permalink`를 정규 URL로 사용한다.
- 예외: front matter에 `canonical`이 지정된 경우 그 값을 우선한다.
- 구현: `<link rel="canonical" href="{{ .Params.canonical | default .Permalink }}">`

### 14.4 페이지 설계 (사용자 화면 9종)

**공통 UI 규칙**

모든 화면은 차분한 읽기 경험을 기본값으로 유지한다. 제목·메타·본문·배지·버튼 사이의 위계는 먼저 크기·면적·여백·명도로 해결하고, 강조색은 시선 이동이나 다음 행동을 명확히 도와야 할 순간에만 개입한다. 특히 검색·포맷·링크로그·404처럼 다음 행동을 제안해야 하는 화면에서는 형광 포인트의 의미가 더 직접적으로 드러나야 한다.

- 내비게이션 메뉴는 `rambling / entertainment / tech / about` 4개만 고정 노출한다.
  - 데스크톱: 사이드바
  - 모바일: 상단(탑)
- 포맷 배지는 `formats`가 있는 글에만 표시한다 (`LINK`).
  - 배지는 클릭 가능하며 해당 포맷 아카이브(`/formats/link/`)로 이동한다.
  - 홈·카테고리·태그·포맷 목록 카드 또는 메타 영역에서 조건부 렌더링한다.
- 메타 정보 표기 순서: 날짜 → 카테고리 → 포맷 배지(있을 때만).
  - 태그는 상세에서 노출하고 목록에서는 생략 또는 축약한다.
  - 날짜 라벨은 기본적으로 절대 날짜를 표시하되, 작성 시각이 24시간 미만이면 `nn시간 nn분 전` 형식의 상대시간으로 치환한다. 상세 메타와 홈·카테고리·태그·포맷 목록 전체에 적용하며, 24시간이 지나면 절대 날짜로 돌아간다.
- 스니펫 규칙
  - `summary`가 있으면 우선 사용
  - 없으면 본문 첫 문단을 일정 길이로 잘라 사용

**1. 홈 (최초 랜딩)**

- 최신 글 N개를 전문 리스트로 렌더링한다.
- N을 넘는 글은 하단 `더보기` 링크로 아카이브(2)로 이동한다.
- 홈은 숫자 페이지네이션을 쓰지 않는다.

**2. 아카이브 (모아보기)**

- 연·월 기준으로 그룹핑하고 제목만 나열한다.
- 각 항목은 제목 + 날짜 + (있을 때) 포맷 배지로 표기한다.

**3. 카테고리 페이지 (3개: rambling / entertainment / tech)**

- 전문 리스트 + 실제 페이지네이션을 적용한다.
- 홈의 `더보기` 방식과 구분된다.

**4. 태그 페이지**

- 스니펫 리스트 + 실제 페이지네이션을 적용한다.
- 제목 / 날짜 / 카테고리 / 포맷 배지 + 요약을 함께 노출한다.

**5. 포맷 페이지 (숨김 아카이브: link)**

- 내비게이션 메뉴에는 노출하지 않는다.
- 진입은 (a) 포맷 배지 클릭 또는 (b) 직접 URL.
- 목록은 가볍게 구성한다.
  - `link`: 제목 + 날짜 + 카테고리 + (가능하면) 외부 도메인·원문 표시
- `link`이고 `external_url`이 있으면
  - 제목 클릭 → 외부 원문
  - 보조 링크(예: "내 글", ∞) → 내부 상세

**6. 개별 포스트 (상세)**

- 제목 / 메타(날짜·카테고리·포맷 배지·태그) → 본문(임베드 포함) → 상호작용(Supabase 조회수·좋아요·댓글) 순서로 구성한다.
- `link` 포맷은 본문 상단에 원문 링크(`external_url`)를 명확히 노출한다.

**7. About (단일 페이지)**

- 소개·연락·원하는 정보만 포함하는 단일 페이지.
- 댓글은 기본적으로 넣지 않는다.

**8. 검색 페이지**

- 검색 입력창 + 결과 리스트로 구성한다.
- 결과는 제목 + 날짜 + 카테고리 + 포맷 배지 + 스니펫을 노출한다.
- 기본 정렬은 최신순.

**9. 404 페이지**

- "페이지를 찾을 수 없음" 안내와 함께 홈·아카이브·검색으로 이동하는 링크를 제공한다.

## 부록 A. 현재 repo와의 정합성 체크 포인트

- `README.md`: 요약·진입 문서 역할 유지, 본 문서 링크 제공
- `hugo.yaml`: v4.x 핵심 설정 반영 상태 유지
- `package.json`: `pagefind` 버전 핀 + `build:pages` 스크립트 일치 유지
- `.github/workflows/deploy-github-pages.yml`: 배포 워크플로우와 문서 설명 일치 유지
- 템플릿 링크 생성: 배포 `baseURL`(프로젝트 사이트 서브경로·루트·커스텀 도메인)을 보존하도록 `absURL` / `.Permalink` 사용
- `.github/workflows/keep-alive.yml`: § 7.8 명세와 일치 유지 (cron, RPC 엔드포인트, env 설정, Secrets 이름)

## 부록 B. 참고 문서 (운영 시 확인)

- GitHub Pages + GitHub Actions (Hugo) 배포 문서
- GitHub Pages 커스텀 도메인 설정 문서
- Hugo taxonomies / URLs / aliases / archetypes / front matter / summaries 문서
- Pagefind CLI / indexing options 문서

**정책 우선순위**

이 문서와 외부 문서가 충돌하면, 먼저 외부 문서 최신 변경 여부를 확인하고 이 문서를 갱신한다.
