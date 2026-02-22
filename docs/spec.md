# anotherminor.pages.dev 통합 명세서 (v1 + v3 보정안)

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

### 2.2 운영 철학

- 간단한 정적 사이트를 유지한다.
- 글은 Markdown 파일로 관리한다.
- 정적 빌드 결과물만 호스팅에 배포한다.

### 2.3 빌드/호스팅 분리 원칙

- `Hugo`: 빌드(정적 산출물 생성)
- `Cloudflare Pages`: 호스팅/배포
- 경계면은 `public/` 산출물 폴더

이 경계면을 지키면 빌더/호스트 교체가 쉬워진다.

### 2.4 이주 가능성 우선 규칙 (핵심)

- 콘텐츠는 `순수 Markdown + YAML front matter` 중심으로 유지
- 빌더 전용 문법(Shortcode/Liquid/MDX)은 본문에서 최소화
- 이미지/첨부는 포스트 번들 상대경로 규칙 고정
- 퍼머링크 규칙은 초기에 고정하고 자주 바꾸지 않음
- 콘텐츠와 테마/레이아웃을 논리적으로 분리

## 3. 확정 스택

- 작성: `MWeb` (macOS)
- 저장소: `GitHub` (단일 공개 저장소)
- 빌드: `Hugo`
- 호스팅/배포: `Cloudflare Pages`
- 댓글: `giscus` (GitHub Discussions 기반)
- 검색: `Pagefind`
- 임베드: 플랫폼 제공 embed HTML 우선

### 3.1 저장소 공개 전략 (확정)

- 단일 공개 GitHub 저장소를 사용한다.
- 사이트 소스/콘텐츠/Discussions(giscus) 연결을 같은 repo에 둔다.
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

- `formats` (array, 길이 1, `news|link`)
- `external_url` (`formats=["link"]`일 때 사용)
- `aliases` (이전 URL 경로 기록)
- `canonical` (교차 게시 시 정규 URL override)

### 5.4 비권장/주의

- `url` 필드는 URL 규칙을 덮어쓸 수 있으므로 특별한 경우가 아니면 사용하지 않는다.

### 5.5 태그/포맷 운영 원칙

- 태그는 주제 태그만 사용 (형태 태그 금지)
- 기본 글에는 `formats`를 기록하지 않음
- 예외 글에만 `formats: ["news"]` 또는 `formats: ["link"]`

## 6. URL / 분류 / 페이지 정책

### 6.1 포스트 URL 정책 (고정)

- 포스트 URL: `/posts/YYYY/MM/slug/`
- Hugo 설정:
  - `permalinks.posts: /posts/:year/:month/:slug/`

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

### 6.4 내비게이션 정책

고정 메뉴(노출):
- `rambling`
- `entertainment`
- `tech`
- `about`

포맷 아카이브(`news`, `link`)는 메뉴에 노출하지 않고 배지 클릭/직접 URL로 진입한다.

## 7. 구현 설정 (Hugo / Cloudflare Pages / Pagefind) - v3 핵심

### 7.1 Hugo 설정 핵심 (`hugo.yaml`)

현재 기준 핵심 설정:

- `permalinks.posts: /posts/:year/:month/:slug/`
- `taxonomies: category/tags/format`
- `markup.goldmark.renderer.unsafe: true`
- `disableKinds: [taxonomy]`
- `ignoreErrors: ["error-disable-taxonomy"]`

목적:
- 임베드 HTML(raw HTML) 렌더링 허용
- taxonomy list 비활성화 + 빌드 로그 실패 리스크 완화

### 7.2 Cloudflare Pages Build/Deploy Interface (최종)

Build command (최종):

```sh
npm ci && hugo --gc --minify --baseURL "${SITE_BASE_URL:-$CF_PAGES_URL}" && npx --no-install pagefind --site public --glob "posts/**/*.html"
```

Output directory:

```txt
public
```

### 7.3 Cloudflare Pages 환경변수 계약

- `HUGO_VERSION` (정확 버전 핀)
- `NODE_VERSION` (정확 버전 핀)
- `SKIP_DEPENDENCY_INSTALL=1` (자동 설치 중복 방지)
- `SITE_BASE_URL` (커스텀 도메인 도입 후 프로덕션에서 설정)

`baseURL` 주입 우선순위:
- `SITE_BASE_URL`가 있으면 사용 (프로덕션 canonical 안정화)
- 없으면 `CF_PAGES_URL` 사용 (프리뷰/초기 운영)

### 7.4 Pagefind 버전/실행 정책

- `pagefind`는 `package.json`의 `devDependencies`에 정확 버전으로 핀
- lockfile 기반(`npm ci`)으로 설치
- 실행은 `npx --no-install pagefind ...` 사용

주의:
- `npx pagefind` (자동 최신 설치) 방식은 사용하지 않음

## 8. 템플릿 규칙 (구현 가드레일)

### 8.1 검색 인덱싱 규칙 (이중 안전장치)

템플릿 규칙:
- `data-pagefind-body`는 포스트 상세 템플릿에만 사용
- giscus 영역은 `data-pagefind-ignore`
- 목록/분류/검색/404/about 템플릿에는 `data-pagefind-body` 금지

CLI 규칙:
- `pagefind --glob "posts/**/*.html"` 고정

효과:
- 템플릿 실수와 목록 전문 렌더링 중복 인덱싱 리스크를 동시에 줄임

### 8.2 링크로그(`formats=["link"]`) 규칙

목록:
- `formats=["link"]`이고 `external_url`이 있으면 제목 링크는 외부 URL
- 외부 링크에 `rel="noopener noreferrer"` 적용
- 내부 상세(`.Permalink`)로 가는 보조 링크 제공

상세:
- 본문 상단에 원문 링크(`external_url`) 명시

### 8.3 포맷 배지 규칙

- `formats=["news"]` → `NEWS` 배지
- `formats=["link"]` → `LINK` 배지
- 배지는 클릭 가능하며 해당 포맷 term 페이지(`/formats/news/`, `/formats/link/`)로 이동

### 8.4 canonical 우선순위

- 기본: `.Permalink`
- 예외: front matter의 `canonical`이 있으면 우선 사용

## 9. 리다이렉트 정책 (`aliases` vs `_redirects`)

### 9.1 역할 분리 (문서 전체 공통 규칙)

- `aliases`
  - front matter에 기록
  - Hugo가 alias HTML 생성
  - 클라이언트 리다이렉트 보조 용도
- `static/_redirects`
  - Cloudflare Pages HTTP 리다이렉트(301/302) 규칙

중요:
- `aliases`를 HTTP 301로 간주하지 않는다.

### 9.2 slug 변경 운영 절차

1. 포스트 `slug` 변경
2. 기존 경로를 `aliases`에 추가
3. `static/_redirects`에 301 규칙 추가
4. 배포 후 이전/신규 URL 모두 확인

### 9.3 후속 개선 (v1.1 후보)

- Hugo `.Aliases` 기반 `_redirects` 자동 생성 검토

## 10. 운영 루틴

### 10.1 새 글 작성

1. 포스트 생성
   - `hugo new content posts/<entry_id>/index.md`
2. MWeb에서 `index.md` 작성
3. `slug` 입력 (공개 URL용)
4. 이미지가 있으면 `images/`에 저장하고 상대경로로 참조
5. 로컬 미리보기 확인
6. 커밋/푸시 → PR 프리뷰 확인 → merge

### 10.2 발행

- `draft: false`로 변경 후 merge → 자동 배포

### 10.3 수정/정정

- URL(slug) 변경은 예외적으로만 허용
- 불가피할 때 `aliases` + `static/_redirects`를 함께 사용
- 필요 시 `updated` 갱신

### 10.4 `<!--more-->` 정책

- 기본: 홈/카테고리 전문 렌더링 유지
- 예외: 성능 이슈가 큰 글에서만 `<!--more-->` 사용 (비상 브레이크)
- 상세 페이지는 전문 유지

### 10.5 archetype / YAML 강제 규칙

- `hugo new content ...`를 기본 루틴으로 사용
- archetype 파일은 YAML 구분자(`---`)를 사용해 YAML front matter를 강제

## 11. 리스크 가드레일

### 11.1 Cloudflare Pages 운영 리스크 (요약)

- 빌드 횟수/시간, 파일 수/개별 파일 크기 제한 존재
- v1에서는 순수 정적 + Functions 미사용 원칙 유지
- 파일/미디어 증가 속도 관리 필요

주의:
- 정확한 수치는 변동될 수 있으므로 운영 시점에 Cloudflare 공식 문서 최신값 확인

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
- `ignoreErrors: ["error-disable-taxonomy"]` 적용 상태에서 Cloudflare Pages 빌드 성공
- `/categories/`, `/tags/`, `/formats/` 미생성 확인
- `/categories/<term>/`, `/tags/<term>/`, `/formats/<term>/` 생성 유지 확인

### 12.2 baseURL / canonical / 절대 URL

- 프리뷰 배포: `CF_PAGES_URL` 기준 canonical/절대 URL 생성
- 프로덕션(커스텀 도메인 도입 후): `SITE_BASE_URL` 기준 canonical 생성
- RSS/sitemap 절대 URL 정합성 확인

### 12.3 Pagefind 검색 인덱싱

- `public/posts/**/*.html`만 인덱싱되는지 확인
- 홈/카테고리/태그/아카이브가 검색 결과에 섞이지 않는지 확인
- 동일 글이 목록/상세로 중복 검색되지 않는지 확인
- giscus 댓글 내용이 검색 결과에 섞이지 않는지 확인

### 12.4 댓글(giscus)

- 비로그인 상태에서 읽기 가능
- 로그인 상태에서 댓글 작성 가능
- Discussions 매핑(pathname) 정상 동작

### 12.5 리다이렉트

- `aliases`만 추가 시 alias HTML 기반 이동 동작 확인
- `_redirects` 추가 시 HTTP 301/302 동작 확인
- `static/_redirects`가 배포 결과물에 포함되는지 확인

### 12.6 빌드 재현성

- `npm ci` 후 빌드 성공
- lockfile 유지 상태 재빌드 일관성 확인
- Cloudflare Pages와 로컬 빌드 결과 핵심 동작 동일성 확인

## 13. 후속 작업 (v1.1+)

- Hugo `.Aliases` 기반 `_redirects` 자동 생성
- 이미지 처리 자동화(Hugo image processing / render hook)
- 콘텐츠 검증 스크립트
  - 카테고리 허용값 검사
  - `formats` 허용값 검사
  - `link` 포맷의 `external_url` 검사
- 검색 UI 커스터마이징 (필요 시)

## 14. 변경 이력 / 결정 로그

### v1 기획안 (초기)

- Hugo + Cloudflare Pages + Markdown/YAML + page bundle 중심 설계 확정
- 카테고리 3종 + 태그 + 포맷(news/link 예외) 정책 수립
- 임베드(raw HTML) + giscus + Pagefind 방향성 확정

### v2 보정안

- `aliases`는 301이 아니라는 점 명확화
- Cloudflare Pages에 `baseURL` 주입 필요성 반영
- taxonomy list 페이지 처리 정책 필요성 반영
- Pagefind 인덱싱 범위 제어 필요성 반영

### v3 보정안 (최신 기준)

- `disableKinds: [taxonomy]` + `ignoreErrors: ["error-disable-taxonomy"]`
- Cloudflare 빌드에서 `SKIP_DEPENDENCY_INSTALL=1` 권장(사실상 필수)
- `npx --no-install pagefind --glob "posts/**/*.html"`로 검색 인덱싱 범위/재현성 강화

## 부록 A. 현재 repo와의 정합성 체크 포인트

- `README.md`: 요약/진입 문서 역할 유지, 본 문서 링크 제공
- `hugo.yaml`: v3 핵심 보정값 반영 상태 유지
- `package.json`: `pagefind` 버전 핀 + `build:cf` 스크립트 일치 유지
- `static/_redirects`: 수동 리다이렉트 정책과 문서 설명 일치 유지

## 부록 B. 참고 문서(운영 시 확인)

- Cloudflare Pages Hugo 가이드
- Cloudflare Pages build image / limits / redirects 문서
- Hugo taxonomies / URLs / aliases / archetypes / front matter / summaries 문서
- Pagefind CLI / indexing options 문서

정책 우선순위:
- 이 문서와 외부 문서가 충돌하면, 먼저 외부 문서 최신 변경 여부를 확인하고 이 문서를 갱신한다.
