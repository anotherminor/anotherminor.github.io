# anotherminor.github.io 통합 계획안

작성 목적: 이 문서는 블로그의 기획 원칙, 구현 설정, 운영 루틴, 검증 기준을 하나로 합친 단일 기준 문서(Single Source of Truth)입니다.

## 1. 문서 목적 / 범위 / 독자

- 목적: 초기 구축, 운영, 수정, 이주 시 기준이 되는 명세를 고정한다.
- 범위: v1 구축 범위 + v1.1 후보(후속 개선 메모)까지 포함한다.
- 독자: 본인, 에이전트, 외주 구현자(대화 로그 없이도 실행 가능해야 함).

## 2. 목표와 원칙

### 2.1 목표

- 저널링 및 아카이빙 중심 블로그
- 범주
  - 소회 및 단상
  - 작품 후기/감상
  - 테크 관찰

### 2.1.1 사용자와 이용 맥락

이 사이트는 운영자 본인의 저널링과 아카이빙을 우선하는 개인 블로그다. 동시에 미디어, 테크, 단상 카테고리를 따라 천천히 읽고 다시 찾아오는 방문자를 전제로 설계한다. 사용자는 짧은 소비보다 글의 결과 축적된 맥락을 따라 이동하며, 검색과 아카이브를 통해 기록을 재방문한다. 따라서 홈, 카테고리, 아카이브, 검색은 모두 빠른 전환보다 차분한 탐색과 재발견에 유리한 구조를 우선해야 한다.

### 2.1.2 브랜드 성격과 시각 방향

이 블로그의 브랜드 성격은 차분함, 절제, 긴장감이다. 시각적 방향은 에디토리얼한 흑백 저널을 기준으로 삼고, 강한 대비를 과시하기보다 약간 틴트된 뉴트럴로 밀도를 만든다. 화면의 대부분은 정적이고 조용해야 하며, 링크, 활성 상태, 포맷 배지, 검색 하이라이트, 주요 버튼처럼 사용자의 시선과 행동을 분명히 유도해야 하는 지점에만 형광 포인트를 사용한다. 색 비율은 뉴트럴 60, 보조 회색 30, 형광 포인트 10을 기준으로 유지한다.

### 2.1.3 디자인 원칙

대부분의 화면은 무채색 질서 안에서 해결하고, 계층은 먼저 명도와 면적 차이로 만든 뒤 마지막에 색을 더한다. 중립색은 순수 회색보다 미세하게 틴트된 값을 사용해 차가운 평면감을 줄이고 인쇄물 같은 밀도를 확보한다. 포인트 색은 장식이 아니라 의미를 가진 상태 변화와 행동 유도에만 사용하며, 같은 포인트 색은 항상 같은 의미를 가져야 한다. 특히 검색, 포맷, 링크로그, 404처럼 행동 전환이 필요한 화면일수록 포인트 색의 이유가 더 명확해야 한다.

### 2.2 운영 철학

- 간단한 정적 사이트를 유지한다.
- 글은 Markdown 파일로 관리한다.
- 정적 빌드 결과물만 호스팅에 배포한다.

### 2.3 빌드/호스팅 분리 원칙

- `Hugo`: 빌드(정적 산출물 생성)
- `GitHub Pages`: 호스팅/배포
- 경계면은 `public/` 산출물 폴더

이 경계면을 지키면 빌더/호스트 교체가 쉬워진다.

### 2.4 이주 가능성 우선 규칙 (핵심)

- 콘텐츠는 `순수 Markdown + YAML front matter` 중심으로 유지
- 빌더 전용 문법(Shortcode/Liquid/MDX)은 본문에서 최소화
- 단, 반복 사용되는 소셜 임베드는 작성 편의를 위해 제한된 Hugo shortcode 사용을 허용
- 이미지/첨부는 포스트 번들 상대경로 규칙 고정
- 퍼머링크 규칙은 초기에 고정하고 자주 바꾸지 않음
- 콘텐츠와 테마/레이아웃을 논리적으로 분리

## 3. 확정 스택

- 작성: `MWeb` (macOS)
- 저장소: `GitHub` (단일 공개 저장소)
- 빌드: `Hugo`
- 호스팅/배포: `GitHub Pages`
- 댓글: `commentbox.io`
- 검색: `Pagefind`
- 임베드: 플랫폼 제공 embed HTML 우선(운영 작성은 Hugo shortcode 래퍼 우선)

### 3.1 저장소 공개 전략 (확정)

- 단일 공개 GitHub 저장소를 사용한다.
- 사이트 소스/콘텐츠는 같은 repo에 둔다.
- 댓글은 `commentbox.io` 프로젝트 ID로 연동한다.
- 이유: 초기 설정/운영 복잡도를 최소화한다.

## 4. 콘텐츠 계약 (Public Content Contract)

### 4.1 폴더 구조

- 포스트(권장, page bundle): `content/posts/<entry_id>/index.md`
- 포스트 자산: `content/posts/<entry_id>/images/...`
- 공용 자산: `static/`

### 4.2 `entry_id`와 `slug`의 역할 분리

- `entry_id`: 내부 관리용 로컬 폴더명 (URL과 무관)
- `slug`: 공개 URL 제어용 (URL 마지막 세그먼트)

예시:
- `content/posts/20260222-0001/index.md`
- front matter `slug: "hello-world"`
- 공개 URL: `/posts/2026/02/hello-world/`

### 4.3 page bundle 원칙

- 원칙: 포스트는 page bundle(`index.md` + `images/`)로 유지한다.
- 샘플 콘텐츠도 같은 규칙을 따른다.

## 5. 메타데이터 계약 (YAML Front Matter Schema)

front matter는 YAML로 통일한다.

### 5.1 필수 필드

- `title` (string)
- `date` (datetime)
- `draft` (bool)
- `slug` (string)
- `categories` (array, 길이 1)

카테고리 허용값:
- `rambling`
- `entertainment`
- `tech`

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

- 태그는 주제 태그만 사용 (형태 태그 금지)
- 기본 글에는 `formats`를 기록하지 않음
- 예외 글에만 `formats: ["link"]`
- 뉴스성 글은 `formats` 대신 `소식` 태그로 분류한다.

### 5.6 태그 slug 시스템

Obsidian은 태그에 한국어 특수문자·공백·콜론을 허용하지 않는다.
이를 해결하기 위해 포스트 프론트매터에는 영문 slug를 저장하고,
빌드 시 `_index.md`를 자동 생성해 Hugo가 한국어 표시 이름으로 렌더링하도록 한다.

**구조**

| 파일 | 역할 |
|---|---|
| `scripts/tag-map.json` | `"한국어 표시 이름": "english-slug"` 매핑 테이블 |
| `scripts/generate-tag-pages.js` | 비-draft 포스트에서 slug를 수집해 `content/tags/<slug>/_index.md` 생성 |
| `content/tags/<slug>/_index.md` | Hugo 태그 페이지 제목 고정 (`title: "한국어 이름"`) |

**포스트 작성 규칙**

Obsidian에서 태그를 입력할 때 slug를 직접 사용한다.

```yaml
tags: [film, disney-plus, severance]
```

URL은 `/tags/film/`이 되고, 페이지 타이틀은 `영화`로 표시된다.

---

**새 태그 추가 루틴**

#### 1단계 — `tag-map.json` 편집

파일은 단일 JSON 객체다. 진입점은 `{`, 종료는 `}`이며 각 줄은 `"표시 이름": "slug"` 형식이다.

```json
{
  ...
  "기존 태그": "existing-slug",
  "새 태그": "new-slug"
}
```

**JSON 작성 규칙 (반드시 준수)**

| 규칙 | 올바른 예 | 잘못된 예 |
|---|---|---|
| 키와 값은 각각 별도의 문자열 | `"블로그": "blog"` | `"블로그: blog"` |
| 키-값은 콜론(`:`)으로 구분 | `"블로그": "blog"` | `"블로그" "blog"` |
| 마지막 항목을 제외한 모든 줄에 쉼표 | `"foo": "bar",` | `"foo": "bar"` (중간 위치) |
| 가장 마지막 항목에는 쉼표 없음 | `"zzz": "zzz"` | `"zzz": "zzz",` |
| slug는 소문자 영문·숫자·하이픈만 | `"vision-pro"` | `"Vision Pro"` |

slug 충돌(다른 표시 이름이 같은 slug)이 있으면 스크립트가 stderr에 경고를 출력한다.

#### 2단계 — 포스트 프론트매터에 slug 입력

```yaml
tags: [new-slug, other-slug]
```

또는 블록 형식:

```yaml
tags:
  - new-slug
  - other-slug
```

#### 3단계 — 로컬 검증

```bash
npm run generate-tags
```

정상 출력 예:

```
태그 페이지 생성 완료: 1개 생성, 42개 처리
```

매핑이 누락된 태그가 있으면 stderr에 경고가 나타난다:

```
[경고] 매핑 없는 태그: "unknown-slug" — tag-map.json에 추가 필요
```

이 경우 1단계로 돌아가 `tag-map.json`에 추가한다.

#### 4단계 — push

push 이후 CI `prebuild` 훅이 `generate-tag-pages`를 자동 실행한다. 별도 작업 불필요.

---

**스크립트 동작 요약 (`generate-tag-pages.js`)**

1. `tag-map.json` 로드 → `표시 이름 → slug` 맵 구성
2. 역방향 맵(`slug → 표시 이름`) 생성
3. `content/posts/` 하위 비-draft 포스트를 순회하며 `tags` 필드의 slug 수집
   - 포스트에 표시 이름이 들어 있으면 `tag-map.json`으로 slug 변환
   - 포스트에 slug가 들어 있으면 역방향 맵으로 표시 이름 조회
   - 둘 다 없으면 경고 출력 후 해당 태그 건너뜀
4. 수집된 slug마다 `content/tags/<slug>/_index.md` 생성 (이미 존재하면 덮어쓰지 않음)

생성되는 `_index.md` 형식:

```markdown
---
title: "한국어 이름"
slug: "english-slug"
---
```

**빌드 파이프라인에서의 위치**

`generate-tag-pages`는 `prebuild` 훅을 통해 Hugo 빌드 직전 자동 실행된다.
로컬에서도 `npm run generate-tags`로 독립 실행 가능하다.

### 5.7 콘텐츠 유효성 검사 (`validate-content.rb`)

`scripts/validate-content.rb`는 `content/posts/` 하위 모든 `index.md`의 YAML 프론트매터를 검사하는 Ruby 스크립트다.

**검사 항목**

- 필수 필드 존재 여부: `title`, `date`, `draft`, `slug`, `categories`
- `title`, `slug`: 비어 있지 않은 문자열
- `date`: 유효한 날짜/시간 값
- `updated`: 제공된 경우 유효한 날짜/시간
- `draft`: `true` 또는 `false` (boolean)
- `categories`: 정확히 1개, 허용값 `[rambling, entertainment, tech]`
- `formats`: 제공된 경우 정확히 1개, 허용값 `[link]`
- `formats: [link]`인 경우 `external_url`이 유효한 `http/https` URL이어야 함
- `tags`: 제공된 경우 배열이어야 함
- `url` 필드 사용 시 경고 (slug 사용 권장)

**실행**

```bash
npm run validate:content
# 내부적으로: ruby scripts/validate-content.rb
```

오류가 하나라도 있으면 exit 1로 종료한다. 발행 전(`draft: false`로 변경 전후) 로컬에서 실행해 계약 위반 여부를 확인한다.

**CI 연동**

GitHub Actions 배포 워크플로우의 prebuild 단계에서 자동 실행된다. 검사 실패 시 빌드가 중단된다.

## 6. URL / 분류 / 페이지 정책

### 6.1 포스트 URL 정책 (고정)

- 포스트 URL: `/posts/YYYY/MM/slug/`
- Hugo 설정:
  - `permalinks.posts: /posts/:year/:month/:slug/`

### 6.1.1 사이트 루트 URL 정책 (GitHub Pages 기준)

GitHub Pages에서 사이트의 루트 URL은 저장소 유형에 따라 달라진다.

- 프로젝트 사이트(repo가 일반 이름): `https://<user>.github.io/<repo>/`
- 사용자 사이트(repo 이름이 `<user>.github.io`): `https://<user>.github.io/`
- 커스텀 도메인 사용 시: `https://<custom-domain>/`

현재 운영 방식:
- 사용자 사이트 repo(`anotherminor.github.io`)로 운영 중이며 기본 URL은 루트(`https://anotherminor.github.io/`)다.
- 커스텀 도메인 연결 시 `SITE_BASE_URL` repo variable로 baseURL을 고정한다.

### 6.2 taxonomy / term 정책 (v3 보정 반영)

Hugo taxonomy 사용 시 기본적으로 taxonomy list(`/tags/`)와 term page(`/tags/foo/`)가 모두 생성되지만, 본 프로젝트는 아래처럼 운영한다.

- taxonomy list(`/categories/`, `/tags/`, `/formats/`)는 생성하지 않음
- term page(`/categories/<term>/`, `/tags/<term>/`, `/formats/<term>/`)는 유지

구현 설정:
- `disableKinds: [taxonomy]`
- `ignoreErrors: ["error-disable-taxonomy"]`

### 6.3 “9개 페이지” 정의

`9개 페이지`는 Hugo의 내부 kind 수가 아니라 사용자 화면 유형 기준이다.

- 홈
- 아카이브
- 카테고리(term)
- 태그(term)
- 포맷(term)
- 포스트 상세
- About
- 검색
- 404

각 화면의 상세 렌더링/UI 규칙은 `14.4 페이지 설계(사용자 화면 9종)`을 따른다.

### 6.4 내비게이션 정책

고정 메뉴(노출):
- `rambling`
- `entertainment`
- `tech`
- `about`

포맷 아카이브(`link`)는 메뉴에 노출하지 않고 배지 클릭/직접 URL로 진입한다.
구체적인 표시 규칙(배지/메타/목록 형태)은 `14.4 페이지 설계`에서 정의한다.

## 7. 구현 설정 (Hugo / GitHub Pages / Pagefind) - v4 핵심

### 7.1 Hugo 설정 핵심 (`hugo.yaml`)

현재 기준 핵심 설정:

- `permalinks.posts: /posts/:year/:month/:slug/`
- `taxonomies: category/tags/format`
- `markup.goldmark.renderer.unsafe: true`
- `markup.goldmark.renderHooks.image.useEmbedded: always`
- `disableKinds: [taxonomy]`
- `ignoreErrors: ["error-disable-taxonomy"]`

목적:
- 임베드 HTML(raw HTML) 렌더링 허용(직접 입력 및 shortcode 내부 출력 모두 지원)
- taxonomy list 비활성화 + 빌드 로그 실패 리스크 완화

### 7.1.1 소셜 임베드 작성 규칙 (Hugo shortcode)

운영 작성 시에는 긴 embed HTML을 본문에 직접 붙여넣기보다 `layouts/shortcodes/`의 소셜 임베드 shortcode를 우선 사용한다. 이 규칙은 작성 속도/수정 편의성을 위한 예외이며, 내부 구현은 플랫폼 공식 embed HTML/스크립트를 감싸는 방식으로 유지해 이식성을 크게 해치지 않도록 한다.

현재 지원 shortcode:

- `youtube`
- `youtube-shorts`
- `tiktok`
- `instagram`
- `twitter`
- `threads`
- `facebook`
- `vimeo`

작성 원칙:

- 본문에서는 URL(또는 영상 ID)만 넘기는 한 줄 호출을 기본으로 사용
- 세로형 콘텐츠(`youtube-shorts`, `tiktok`)는 shortcode 내부에서 포트레이트 비율(`9:16`) 래퍼를 적용
- 스크립트 기반 플랫폼(TikTok / Instagram / X(Twitter) / Threads)은 같은 페이지에서 필요한 스크립트를 1회만 로드
- 임베드 실패/지연 시 사용자 친화적 링크 폴백 문구를 출력
- 필요 시 raw HTML 임베드는 계속 허용(예외 케이스 대응)

예시(본문):

```md
{{< youtube "https://www.youtube.com/watch?v=..." >}}
{{< youtube-shorts "https://www.youtube.com/shorts/..." >}}
{{< tiktok "https://www.tiktok.com/@user/video/..." >}}
{{< instagram "https://www.instagram.com/p/.../" >}}
{{< twitter "https://twitter.com/.../status/..." >}}
{{< threads "https://www.threads.net/@.../post/..." >}}
{{< facebook "https://www.facebook.com/.../posts/..." >}}
{{< vimeo "https://vimeo.com/..." >}}
```

### 7.2 GitHub Pages Build/Deploy Interface (최종)

배포 방식(최종):

- GitHub Actions에서 빌드 후 `public/`를 GitHub Pages에 배포
- 워크플로우 파일: `.github/workflows/deploy-github-pages.yml`

빌드 단계(개념):

```sh
npm ci
hugo --gc --minify --cleanDestinationDir --baseURL "${BASE_URL}"
npx --no-install pagefind --site public --glob "posts/**/*.html"
```

출력 디렉터리:

```txt
public
```

### 7.3 GitHub Pages 배포 계약 (워크플로우)

- GitHub Actions로 빌드/배포한다 (`.github/workflows/deploy-github-pages.yml`)
- Hugo 버전은 워크플로우에서 핀 (`0.156.0`)
- Node 버전은 워크플로우에서 핀 (`20`)
- 기본 `BASE_URL`은 `actions/configure-pages`의 `base_url` 출력값을 사용
- GitHub repo variable `SITE_BASE_URL`가 있으면 이를 우선 사용 (커스텀 도메인용)
- 커스텀 도메인은 GitHub Pages 설정(`Custom domain`)으로 연결하고, 필요 시 `static/CNAME`를 사용한다

`baseURL` 주입 우선순위:
- `SITE_BASE_URL` (repo variable) 우선
- 없으면 GitHub Pages 배포 URL (`actions/configure-pages` 출력값) 사용

### 7.4 Pagefind 버전/실행 정책

- `pagefind`는 `package.json`의 `devDependencies`에 정확 버전으로 핀
- lockfile 기반(`npm ci`)으로 설치
- 실행은 `npx --no-install pagefind ...` 사용

주의:
- `npx pagefind` (자동 최신 설치) 방식은 사용하지 않음
- 로컬 검증 시에도 `public/` 잔여 산출물(특히 과거 draft 빌드 결과)이 검색 인덱스에 섞이지 않도록 Hugo 빌드에 `--cleanDestinationDir`를 포함

검색 UX/인덱싱 대체안(JSON 인덱스)은 `14.2 검색 페이지(정적 환경)`에서 정의한다.

### 7.5 글로벌 타이포그래피 (cap-height 시스템)

본 블로그의 글로벌 타이포그래피는 tonsky.me의 cap-height 기반 스케일링 시스템을 이식한 것이다.
이 레이어는 `static/css/site.css`의 `:root` 변수와 `body` 선언에서 관리하며, 아래 규칙을 준수한다.

핵심 변수 (`static/css/site.css` — `:root`)

- `--cap-height`: 기준 cap-height (데스크탑 `calc(1rem * 11.75 / 16)`, 모바일 `calc(1rem * 10.8 / 16)`)
- `--cap-ratio`: cap-height → font-size 변환 비율 (`calc(1 / 0.698)`, GothicA1 기준)
- `--gap`: 기본 간격 단위 (`var(--cap-height)`)
- `--font-smaller`: 보조 텍스트 중 가장 작은 스케일 (`10/12 cap`)
- `--font-small`: 보조 텍스트 중간 스케일 (`11/12 cap`)

모바일 분기

- `@media (max-width: 640px)` 에서 `--cap-height`만 재선언하여 모든 파생 변수가 자동으로 스케일된다.
- 본문 계열의 글로벌 스케일을 약 6% 낮추는 목적이므로, 모바일에서도 동일하게 `--cap-height`만 조정하고 파생 변수 체계는 유지한다.

금지 사항 (에이전트/외주 구현자 공통)

- `--cap-height`, `--cap-ratio` 변수를 제거하거나 `clamp()`, fluid typography, 임의의 rem 재설계로 대체하지 않는다.
- 모바일 분기 media query(`max-width: 640px`)를 삭제하거나 다른 방식의 별도 font-size 하드코딩으로 대체하지 않는다.
- `body font-size`를 하드코딩된 rem/px 값으로 바꾸지 않는다.
- 라이트/다크 모드 토글을 추가하지 않는다 (시스템 설정 추종 방식 유지).

변수 체계를 따르는 요소

- `body` (font-size: `calc(--cap-height * --cap-ratio)`)
- `.prose-body` (font-size: `inherit` → body에서 상속)
- `.meta`, `.entry-summary__aux`, `.format-card__meta`, `.prose-body figcaption` → `var(--font-smaller)`
- `.page-hero__lede`, `.entry-summary__snippet`, `.format-card__summary` → `var(--font-small)`

별도 스케일을 가진 컴포넌트 (이 시스템의 영향을 받지 않음)

- 네비게이션 (`.site-nav a`, `.site-brand`)
- 푸터 (`.site-footer`)
- 배지 (`.badge`)
- 검색 UI (`.pagefind-ui`)
- 댓글 (`.discussion-panel`)
- 헤딩 (`h1`~`h6`, 각 clamp() 스케일 유지)
- 코드블록 (`.prose-body code`, `.prose-body pre`)
- 아카이브 타임라인 요소

검증 기준값

- 데스크탑(1rem=16px): body ≈ 17.91px
- 모바일(viewport ≤ 640px, CSS 분기점 기준): body ≈ 25.79px
- 모바일/데스크탑 비율: 1.44배
- `text-size-adjust: none` (모바일 자동 확대 차단)

### 7.6 색상 변수 시스템

본 블로그의 색상 시스템은 앞서 정의한 에디토리얼 흑백 저널 방향을 구현하기 위한 기술 계층이다. 색은 화면마다 새로 고안하지 않고 `hugo.yaml`의 **6개 기준색**만 단일 지점에서 관리하며, CSS는 이 기준값에서 파생해 계산한다. 넓은 표면과 본문 계열은 틴트된 뉴트럴과 보조 회색으로 정리하고, 강조색은 링크, 활성 상태, 포맷 배지, 검색 하이라이트, 주요 버튼처럼 의미가 분명한 지점에만 사용한다.

#### 기준색 정의 위치 (`hugo.yaml`)

```yaml
params:
  colors:
    light:
      bg:     "..."   # 배경 기준색 (라이트 모드)
      text:   "..."   # 글자 기준색 (라이트 모드)
      accent: "..."   # 강조 기준색 (라이트 모드)
    dark:
      bg:     "..."   # 배경 기준색 (다크 모드)
      text:   "..."   # 글자 기준색 (다크 모드)
      accent: "..."   # 강조 기준색 (다크 모드)
```

색을 변경하려면 이 6개 값만 수정한다. 나머지 모든 파생색은 자동으로 재계산된다.

#### CSS 주입 흐름

1. `layouts/partials/head.html`이 Hugo 템플릿으로 3개의 CSS custom property를 인라인 주입:
   - `--color-bg`, `--color-text`, `--color-accent` (라이트 기본)
   - `@media (prefers-color-scheme: dark)`에서 다크 기준색으로 교체
2. `static/css/site.css`는 이 3개 변수를 기준으로 파생 변수를 계산한다.

#### 파생색 계산 원칙

파생색이 필요하면 기준 변수에서 oklch 밝기(`l`) 조정 공식을 사용한다:

```css
/* 기준색보다 δ만큼 밝게 */
oklch(from var(--color-bg) calc(l + δ) c h)

/* 기준색보다 δ만큼 어둡게 */
oklch(from var(--color-bg) calc(l - δ) c h)

/* 투명도 조합 */
oklch(from var(--color-accent) calc(l + δ) c h / α)
```

- `δ` 단위는 oklch lightness 절댓값 차이 (0.0~1.0 범위)
- 색상(`h`)과 채도(`c`)는 기준색에서 그대로 상속
- 색 값을 직접 하드코딩하지 않는다 (단, `--accent-ink`처럼 기준색과 무관한 고정색은 예외 허용)

#### 라이트 / 다크 모드 파생 방향

| 계열 | 라이트 파생 방향 | 다크 파생 방향 |
|------|----------------|--------------|
| `--color-bg` 기반 (배경·선) | 밝기 ↑ = 더 밝은 표면, 밝기 ↓ = 구분선 | 밝기 ↑ = 더 밝은 표면, 구분선 |
| `--color-text` 기반 (글자) | 밝기 ↑ = 흐린 글자 | 밝기 ↓ = 흐린 글자 |
| `--color-accent` 기반 (강조) | 밝기 ↓ = strong, 밝기 ↑ = soft | 밝기 ↑ = strong, 밝기 ↓ = soft |

#### 금지 사항

- `hugo.yaml`의 6개 기준색 외 색 값을 CSS에 직접 하드코딩하지 않는다.
- 새 파생색 추가 시 반드시 `oklch(from var(--color-*) ...)` 공식을 따르고, 조정 δ값을 주석으로 명시한다.



## 8. 템플릿 규칙 (구현 가드레일)

### 8.1 검색 인덱싱 규칙 (이중 안전장치)

이 절은 구현 가드레일 요약이며, 배경/운영 원칙은 `14.2 검색 페이지(정적 환경)`을 따른다.

템플릿 규칙:
- `data-pagefind-body`는 포스트 상세 템플릿에만 사용
- commentbox 영역은 `data-pagefind-ignore`
- 목록/분류/검색/404/about 템플릿에는 `data-pagefind-body` 금지

CLI 규칙:
- `pagefind --glob "posts/**/*.html"` 고정

효과:
- 템플릿 실수와 목록 전문 렌더링 중복 인덱싱 리스크를 동시에 줄임

### 8.2 링크로그(`formats=["link"]`) 규칙

이 절은 템플릿 구현 강제 규칙 요약이며, 렌더링/SEO 정책의 상세 기준은 `14.3 링크로그(link 포맷) 렌더링과 SEO`를 따른다.

- `link` 포맷의 외부 URL 공유 동작은 선택 기능으로 두며, 사용할 때는 front matter에 `external_url`을 기록한다.
- `formats=["link"]`이고 `external_url`이 있으면 제목 링크는 외부 URL
- 외부 링크에 `rel="noopener noreferrer"` 적용
- 내부 상세(`.Permalink`)로 가는 보조 링크 제공
- 보조 링크는 기호(예: `¶`)와 함께 텍스트 라벨(예: `내 글`)을 제공해 접근성을 확보
- 상세 본문 상단에 원문 링크(`external_url`) 명시

### 8.3 포맷 배지 규칙

이 절은 템플릿 출력 규칙 요약이며, 화면별 노출 위치/메타 조합은 `14.4 페이지 설계(사용자 화면 9종)`을 따른다.

- 홈/카테고리/태그/포맷 목록 카드(또는 메타 영역)에서 `formats` 값을 읽어 조건부로 배지를 출력한다.
- `formats=["link"]` → `LINK` 배지
- 배지는 클릭 가능하며 해당 포맷 term 페이지(`/formats/link/`)로 이동

### 8.4 canonical 우선순위

이 절은 `<head>` 템플릿 구현 규칙 요약이며, 적용 맥락은 `14.3 링크로그(link 포맷) 렌더링과 SEO`를 따른다.

- 기본: `.Permalink`
- 예외: front matter의 `canonical`이 있으면 우선 사용

## 9. 리다이렉트 정책 (`aliases` 중심)

### 9.1 역할 정의 (문서 전체 공통 규칙)

- `aliases`
  - front matter에 기록
  - Hugo가 alias HTML 생성
  - 클라이언트 리다이렉트 보조 용도

GitHub Pages 제약:
- Cloudflare `_redirects` 같은 서버 측 리다이렉트 규칙 파일을 지원하지 않는다.

중요:
- `aliases`를 HTTP 301로 간주하지 않는다.
- GitHub Pages에서 서버 측 301/302가 필요하면 별도 호스트/프록시가 필요하다.

### 9.2 slug 변경 운영 절차 (GitHub Pages 기준)

1. 포스트 `slug` 변경
2. 기존 경로를 `aliases`에 추가
3. 배포 후 이전/신규 URL 모두 확인 (alias HTML 동작 확인)
4. 서버 측 301이 꼭 필요한 경우, 호스트/프록시 전략을 별도 검토

### 9.3 후속 개선 (v1.1 후보)

- Hugo `.Aliases` 기반 alias 운영 자동 점검(또는 향후 호스트 변경 시 리다이렉트 규칙 생성) 검토

## 10. 운영 루틴

### 10.1 새 글 작성

1. 포스트 생성
   - `hugo new content posts/<entry_id>/index.md`
2. MWeb에서 `index.md` 작성
3. `slug` 입력 (공개 URL용)
4. 이미지가 있으면 `images/`에 저장하고 상대경로로 참조
5. 로컬 미리보기 확인
6. 로컬 콘텐츠 검증 실행 (`npm run validate:content`)
7. 커밋/푸시 → GitHub Actions 배포 확인 → merge

### 10.2 발행

- `draft: false`로 변경 전/직후 로컬에서 `npm run validate:content`로 front matter 계약 위반 여부를 점검
- 이후 merge → 자동 배포

### 10.3 수정/정정

- URL(slug) 변경은 예외적으로만 허용
- 불가피할 때 `aliases`를 사용하고, 서버 측 리다이렉트가 꼭 필요하면 호스팅 전략을 재검토
- 필요 시 `updated` 갱신

### 10.4 `<!--more-->` 정책

- 홈/카테고리 목록은 기본적으로 전문 렌더링을 유지
- 단, 작성자가 `<!--more-->`를 넣은 글은 해당 지점까지 목록에 노출하고 `계속 읽기` 링크를 붙임
- 상세 페이지는 항상 전문 유지

### 10.5 archetype / YAML 강제 규칙

- `hugo new content ...`를 기본 루틴으로 사용
- archetype 파일은 YAML 구분자(`---`)를 사용해 YAML front matter를 강제

### 10.6 이미지 캡션 빈 줄 규칙

이미지 캡션 여부는 별도 문법이 아니라 마크다운의 빈 줄 규칙으로 결정한다. 이 규칙의 전제 조건: `hugo.yaml`에 `markup.goldmark.renderHooks.image.useEmbedded: always`가 설정되어 있어야 한다(이미지를 `<figure>` 대신 `<img>` 인라인으로 렌더링). 이 설정 하에서 이미지 마크다운 다음 줄에 텍스트를 바로 쓰면 이미지와 텍스트가 같은 문단으로 묶인다. 이 경우 블로그 CSS는 그 문단 전체를 캡션으로 간주해, 이미지 아래의 텍스트를 작은 크기와 낮은 대비, 가운데 정렬로 표시한다.

예를 들어 아래처럼 쓰면 두 줄은 하나의 문단으로 렌더링되며 캡션으로 처리된다.

```md
![img](url)
이 문장은 캡션
```

이 패턴의 렌더링 전제는 다음과 같다.

```html
<p><img src="..." alt="">이 문장은 캡션</p>
```

반대로 이미지 다음에 빈 줄을 하나 넣으면 문단이 분리된다. 이 경우 이미지는 이미지 문단으로 끝나고, 다음 텍스트는 일반 본문 문단으로 처리된다.

```md
![img](url)

이 문장은 일반 문단
```

이 패턴의 렌더링 전제는 다음과 같다.

```html
<p><img src="..." alt=""></p>
<p>이 문장은 일반 문단</p>
```

작성자는 이미지 바로 다음 줄에 텍스트를 쓰면 캡션으로 처리된다고 이해해야 하며, 일반 문단을 이어 쓰고 싶다면 반드시 빈 줄을 넣어야 한다. 이 규칙을 위해 마크다운 클래스 추가, HTML 구조 수정, JavaScript는 사용하지 않는다. 향후 image render hook이 `<figure>` 구조를 출력하도록 바뀌면 이 규칙은 다시 검토한다.

현재 본문 이미지의 표시 규칙은 실제 본문 컨테이너인 `.prose-body img`를 기준으로 고정한다. 이미지는 `width: auto`, `max-width: 100%`, `height: auto`를 사용해 원본 비율을 유지한 채 본문 폭을 넘지 않도록 표시한다. 따라서 가로로 긴 이미지는 필요할 때만 본문 폭 안으로 축소되고, 원본 폭이 더 작으면 억지로 늘리지 않는다. 세로로 긴 이미지는 `max-height: 480px` 제한을 적용해 화면을 과도하게 차지하지 않도록 한다. 이미지는 블록 요소로 가운데 정렬하며, 이미지 자체 여백은 `margin: 0 auto`로 두고 문단 간 세로 여백은 이미지 문단 규칙이 관리한다.

## 11. 리스크 가드레일

### 11.1 GitHub Pages / GitHub Actions 운영 리스크 (요약)

- GitHub Actions 실행 시간/분량, GitHub Pages 배포 제약을 고려해야 함
- v1에서는 순수 정적 사이트 + GitHub Pages 표준 배포를 유지
- 파일/미디어 증가 속도 관리 필요
- 프로젝트 사이트 URL은 repo 경로(`/<repo>/`)를 포함하므로, 템플릿/자산 경로는 `baseURL`을 기준으로 생성해야 함

주의:
- 정확한 제한/정책은 운영 시점에 GitHub 공식 문서 최신값 확인

### 11.2 GitHub 저장소 용량 리스크 (요약)

- 미디어 누적 시 저장소 크기 증가가 운영 이슈가 될 수 있음
- 대용량 바이너리는 장기적으로 분리 전략 필요 가능

### 11.3 이미지 운영 기본 규칙

- 커밋 전 리사이즈 + WebP 변환 우선
- 포스트 번들 + 상대경로 규칙 유지
- 고해상도 원본/대용량 미디어는 필요 시 분리 검토

### 11.4 전문 렌더링 성능 관리 기준

- 홈: 최신 `N`개 전문 렌더링 (현재 설정 기준 `N=5`)
- 카테고리: 전문 렌더링 + 페이지네이션
- 검색 인덱싱은 포스트 상세만 대상으로 제한

## 12. 테스트 / 검증 시나리오

### 12.1 taxonomy disable + 빌드 로그 안정성

- `disableKinds: [taxonomy]` 적용 후 빌드 성공
- `ignoreErrors: ["error-disable-taxonomy"]` 적용 상태에서 GitHub Actions 빌드 성공
- `/categories/`, `/tags/`, `/formats/` 미생성 확인
- `/categories/<term>/`, `/tags/<term>/`, `/formats/<term>/` 생성 유지 확인

### 12.2 baseURL / canonical / 절대 URL

- 사용자 사이트 기본 배포 시 `https://anotherminor.github.io/` 기준 canonical/절대 URL 생성 확인
- 커스텀 도메인 도입 후 `SITE_BASE_URL` 기준 canonical 생성값 확인
- RSS/sitemap 절대 URL 정합성 확인

### 12.3 Pagefind 검색 인덱싱

- `public/posts/**/*.html`만 인덱싱되는지 확인
- 로컬 검증 전 `public/` 잔여 산출물 정리(`--cleanDestinationDir` 포함 빌드) 상태 확인
- 홈/카테고리/태그/아카이브가 검색 결과에 섞이지 않는지 확인

### 12.4 이미지 캡션 빈 줄 규칙 검증

- 이미지 다음 줄에 텍스트를 붙여 쓴 경우, 빌드 결과가 하나의 `<p>` 안에 이미지와 텍스트를 함께 포함하는지 확인
- 위 패턴이 화면에서 작은 보조 텍스트 크기, 낮은 대비, 가운데 정렬의 캡션처럼 보이는지 확인
- 이미지 다음에 빈 줄을 넣은 경우, 빌드 결과가 이미지 문단과 일반 문단으로 분리되는지 확인
- 빈 줄이 있는 패턴의 두 번째 문단이 본문 기본 크기와 정렬을 유지하는지 확인
- 가로 이미지가 본문 폭을 초과할 때만 축소되고, 원본 폭이 더 작은 이미지는 확대되지 않는지 확인
- 세로 이미지가 비율을 유지한 채 최대 높이 480px 안으로 제한되는지 확인
- 동일 글이 목록/상세로 중복 검색되지 않는지 확인
- commentbox 댓글 내용이 검색 결과에 섞이지 않는지 확인

### 12.5 댓글(commentbox.io)

- 댓글 박스 렌더링 정상 동작 (`params.commentbox.projectId` 설정 기준)
- 댓글 작성/표시 기본 흐름 정상 동작
- 페이지 URL 기준 스레드 분리(기본 `#commentbox` 박스 ID 기준) 정상 동작

### 12.6 리다이렉트

- `aliases`만 추가 시 alias HTML 기반 이동 동작 확인
- `slug` 변경 + `aliases` 추가 조합에서 이전 URL 이동 동작 확인
- (선택) 커스텀 도메인/프록시 도입 시 서버 측 리다이렉트 정책 별도 검증

### 12.7 빌드 재현성

- `npm ci` 후 빌드 성공
- lockfile 유지 상태 재빌드 일관성 확인
- GitHub Actions 배포 결과와 로컬 빌드 결과 핵심 동작 동일성 확인

## 13. 후속 작업 (v1.1+)

- Hugo `.Aliases` 기반 alias 점검 자동화 (또는 향후 호스트 전환 대비 리다이렉트 규칙 생성)
- 이미지 처리 자동화(Hugo image processing / render hook)
- ~~로컬 콘텐츠 검증 스크립트의 CI 품질 게이트 연동~~ → 완료 (5.7 참고)
- 검색 UI 커스터마이징 (필요 시)

## 14. 렌더링·검색·링크로그·페이지 설계 가이드

### 14.1 홈/카테고리 ‘전문’ 렌더링과 성능 제어

정책

- 홈과 카테고리 페이지는 원칙적으로 “전문(잘림 없이)”을 렌더링합니다.

예외(비상 브레이크)

- 이미지/임베드가 많거나 글이 지나치게 길어 목록 로딩에 부담이 생길 경우, 작성자가 본문에 `<!--more-->`를 삽입해 목록에서의 출력 길이를 제한할 수 있습니다. 이 경우 홈과 카테고리 목록은 해당 지점까지만 렌더링하고 `계속 읽기` 링크를 노출합니다.
- 이 예외를 사용할 때에도 개별 포스트(상세) 페이지에는 전문이 유지되어야 합니다.
- 목록에 노출할 텍스트를 명확히 통제해야 하면 `summary` 필드를 함께 사용합니다.

### 14.2 검색 페이지(정적 환경)

정적 사이트에서 검색은 “빌드 시점에 만든 인덱스”를 브라우저에서 탐색하는 방식으로 구현합니다. 서버는 필요하지 않습니다.

기본 구현(권장): Pagefind

설치/버전 핀(필수)

- 저장소에 `package.json` + lockfile을 추가합니다.
- `pagefind`는 devDependencies에 **정확 버전**으로 고정합니다.
- CI(GitHub Actions)에서는 `npm ci`로만 설치하고 `npx --no-install`로만 실행합니다.

빌드 단계(필수)

- Hugo 빌드 후 `public/` 디렉터리를 Pagefind가 인덱싱합니다.
- 표준 커맨드(요약):
  - `hugo --gc --minify` 후
  - `npx --no-install pagefind --site public --glob "posts/**/*.html"`

인덱싱 범위 제어(필수, 이중 안전장치)

- 템플릿 규칙
  - `data-pagefind-body`는 **개별 포스트 상세 템플릿에만** 사용합니다.
  - 홈/카테고리/태그/포맷/아카이브/검색/404/about 템플릿에는 `data-pagefind-body`를 넣지 않습니다.
  - commentbox 영역에는 `data-pagefind-ignore`를 적용합니다.
- CLI 규칙
  - `--glob "posts/**/*.html"`로 **포스트 상세 HTML만** 인덱싱하도록 고정합니다.
  - 템플릿 실수로 목록 페이지에 표식이 들어가더라도 인덱싱 범위를 제한합니다.

대체 구현(필요 시): JSON 인덱스 + 클라이언트 검색(Fuse.js 등)

- 빌드 시 `index.json` 같은 검색 인덱스를 생성하고, 브라우저에서 이를 읽어 검색합니다.
- 요구사항 1: 설정에서 홈 출력에 JSON을 포함(HTML/RSS/JSON).
- 요구사항 2: JSON 내용을 정의하는 템플릿(레이아웃)을 추가(제목/URL/요약/본문 등 어떤 필드를 내보낼지 명시).
- 주의: 글이 늘면 `index.json`이 커져 초기 로딩 부담이 커질 수 있습니다.

### 14.3 링크로그(link 포맷) 렌더링과 SEO

목표

- 목록에서 제목 클릭은 외부 원문으로 즉시 이동.
- 동시에 내부 상세 페이지(아카이빙/댓글/내 메모)는 별도 경로로 항상 접근 가능.

목록 템플릿 정책

- 적용 범위: 홈/카테고리/태그/포맷 목록 템플릿(카드/요약 리스트/메타 영역 공통)
- `formats`에 `link`가 있고 `external_url`이 있으면
  - 제목 링크: `external_url`
  - 외부 링크 공유용 필드: front matter `external_url`
  - 외부 링크에 `rel="noopener noreferrer"` 적용(권장)
  - 보조 링크(예: `¶`, “내 글”, ∞ 등): 내부 상세 `.Permalink`
  - 보조 링크에 기호만 쓰지 말고 접근성용 텍스트 라벨(예: “내 글”)을 함께 제공(권장)

상세 페이지 정책

- 본문 상단에 “원문 링크(external_url)”를 명확히 노출(필수 권장).

canonical(정규 URL) 정책

- 기본: 내부 상세 페이지의 `.Permalink`를 정규 URL로 사용합니다.
- 예외: 프론트매터에 `canonical`이 지정된 경우(교차 게시 등)에는 그 값을 우선합니다.
- 구현 원칙: `<link rel="canonical" href="{{ .Params.canonical | default .Permalink }}">` 형태로 처리합니다.

### 14.4 페이지 설계(사용자 화면 9종)

공통 UI 규칙

이 절의 모든 화면은 차분한 읽기 경험을 기본값으로 유지해야 한다. 제목, 메타, 본문, 배지, 버튼 사이의 위계는 먼저 크기와 면적, 여백과 명도로 해결하고, 강조색은 사용자의 시선 이동이나 다음 행동을 명확히 도와야 하는 순간에만 개입한다. 특히 검색, 포맷 페이지, 링크로그, 404처럼 다음 행동을 제안해야 하는 화면에서는 형광 포인트의 의미가 더 직접적으로 드러나야 한다.

- 내비게이션 메뉴는 `rambling / entertainment / tech / about` 4개만 고정 노출합니다.
  - 데스크톱: 사이드바
  - 모바일: 상단(탑)
- 포맷 배지는 `formats`가 있는 글에만 표시합니다: `LINK`
  - 배지는 클릭 가능하며 해당 포맷 아카이브(`/formats/link/`)로 이동합니다.
  - 홈/카테고리/태그/포맷 목록 카드 또는 메타 영역에서 조건부 렌더링합니다.
- 메타 정보 표기(권장 순서)
  - 날짜 → 카테고리 → 포맷 배지(있을 때만)
  - 태그는 상세 페이지에서 노출(목록에서는 생략하거나 축약)
- 스니펫(요약) 규칙
  - `summary`가 있으면 우선 사용
  - 없으면 본문 첫 문단을 일정 길이로 잘라 사용

1. 홈(최초 랜딩)

- 최신 글 N개를 “전문(잘림 없이)” 리스트로 렌더링합니다.
- N을 넘는 글은 하단 “더보기” 링크로 아카이브(2)로 이동합니다.
- 홈은 숫자 페이지네이션을 쓰지 않습니다.

2. 아카이브(모아보기)

- 연/월 기준으로 그룹핑하고 “제목만” 나열합니다.
- 각 항목은 제목 + 날짜 + (있을 때) 포맷 배지로 표기합니다.

3. 카테고리 페이지(3개: rambling/entertainment/tech)

- 전문(잘림 없이) 리스트 + 실제 페이지네이션을 적용합니다.
- 홈의 “더보기” 방식과 구분됩니다.

4. 태그 페이지

- 스니펫(요약) 리스트 + 실제 페이지네이션을 적용합니다.
- 제목/날짜/카테고리/포맷 배지 + 요약을 함께 노출합니다.

5. 포맷 페이지(숨김 아카이브: link)

- 내비게이션 메뉴에는 노출하지 않습니다.
- 진입은 (a) 포맷 배지 클릭 또는 (b) 직접 URL로 합니다.
- 목록은 가볍게 구성합니다.
  - `link`: 제목 + 날짜 + 카테고리 + (가능하면) 외부 도메인/원문 표시
- `link`이고 `external_url`이 있으면
  - 제목 클릭: 외부 원문
  - 보조 링크(예: “내 글”, ∞): 내부 상세

6. 개별 포스트(상세)

- 제목/메타(날짜·카테고리·포맷 배지·태그) → 본문(임베드 포함) → 댓글(commentbox.io) 순서로 구성합니다.
- `link` 포맷은 본문 상단에 원문 링크(`external_url`)를 명확히 노출합니다.

7. About(단일 페이지)

- 소개/연락/원하는 정보만 포함하는 단일 페이지입니다.
- 댓글은 기본적으로 넣지 않습니다.

8. 검색 페이지

- 검색 입력창 + 결과 리스트로 구성합니다.
- 결과는 제목 + 날짜 + 카테고리 + 포맷 배지 + 스니펫을 노출합니다.
- 기본 정렬은 최신순을 권장합니다.

9. 404 페이지

- “페이지를 찾을 수 없음” 안내와 함께 홈/아카이브/검색으로 이동 링크를 제공합니다.

## 부록 A. 현재 repo와의 정합성 체크 포인트

- `README.md`: 요약/진입 문서 역할 유지, 본 문서 링크 제공
- `hugo.yaml`: v4.x 핵심 설정 반영 상태 유지
- `package.json`: `pagefind` 버전 핀 + `build:pages` 스크립트 일치 유지
- `.github/workflows/deploy-github-pages.yml`: GitHub Pages 배포 워크플로우와 문서 설명 일치 유지
- 템플릿 링크 생성: 배포 `baseURL`(프로젝트 사이트 서브경로/루트/커스텀 도메인)를 보존하도록 `absURL`/`.Permalink` 사용

## 부록 B. 참고 문서(운영 시 확인)

- GitHub Pages + GitHub Actions (Hugo) 배포 문서
- GitHub Pages 커스텀 도메인 설정 문서
- Hugo taxonomies / URLs / aliases / archetypes / front matter / summaries 문서
- Pagefind CLI / indexing options 문서

정책 우선순위:
- 이 문서와 외부 문서가 충돌하면, 먼저 외부 문서 최신 변경 여부를 확인하고 이 문서를 갱신한다.
