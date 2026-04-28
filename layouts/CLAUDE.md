# CLAUDE.md — layouts/ (Hugo 템플릿)

Hugo 템플릿 디렉터리. 변경 시 사이트 전체 레이아웃에 영향.

## 파일 구조

```
layouts/
├── _default/
│   ├── baseof.html          ← 모든 페이지의 HTML 뼈대
│   ├── home.html            ← 홈 페이지
│   ├── single.html          ← 개별 포스트
│   ├── list.html            ← 일반 목록
│   └── term.html            ← 카테고리/태그/포맷 term 페이지
├── _markup/
│   ├── render-image.html    ← Markdown 이미지 렌더링 커스텀
│   └── render-codeblock.html← 코드 블록 렌더링 커스텀
├── partials/                ← 재사용 HTML 조각 (18개)
├── shortcodes/              ← 소셜 임베드 단축코드 (9개)
├── posts/list.html          ← 포스트 목록 페이지
├── archive/list.html        ← 아카이브 페이지
└── search/list.html         ← 검색 결과 페이지
```

## 핵심 파일 역할

**baseof.html** — 모든 페이지의 최상위 템플릿. 변경 시 전체 사이트에 영향.
- `<head>`: SEO, Open Graph, 폰트, CSS
- `<header>`: 사이트 로고, 내비게이션
- `<main>`: 각 페이지 콘텐츠 주입
- `<aside>`: 사이드바 (`partials/sidebar.html`)
- `<footer>`: 푸터

**partials/interactions.html** — Supabase 연동 UI (조회수, 좋아요, 댓글 폼). 변경 전 `supabase/CLAUDE.md` 읽기.

**shortcodes/** — 소셜 임베드 단축코드. 각 파일은 단일 플랫폼 전담 (`youtube`, `instagram`, `tiktok`, `twitter`, `threads`, `facebook`, `applemusic`, `vimeo`). 새 플랫폼은 동일한 패턴으로 추가. 임베드 실패 시 원본 URL 링크로 fallback.

## Go 템플릿 규칙

- nil 안전 접근: `.Params.X`를 직접 쓰지 않고 `with`나 `default ""`로 감싼다
- Partial 컨텍스트: 전체 컨텍스트는 `.` 전달, 선택적 전달은 `dict` 사용
- CSS 변수 우선: 인라인 스타일 대신 `site.css`의 CSS 커스텀 프로퍼티를 사용한다

## 변경 영향 범위

| 파일 | 영향 범위 |
|---|---|
| `_default/baseof.html` | 전체 사이트 |
| `_default/single.html` | 모든 포스트 페이지 |
| `_default/home.html` | 홈 페이지만 |
| `partials/head.html` | 전체 사이트 (SEO/메타) |
| `shortcodes/*.html` | 해당 단축코드 사용 포스트 |

Hugo 캐시로 인해 템플릿 변경이 바로 반영 안 될 수 있음: `hugo --gc && hugo server -D`
