# CLAUDE.md — layouts/ (템플릿 레이어)

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

### baseof.html

모든 페이지의 최상위 템플릿. 변경 시 전체 사이트에 영향.
- `<head>`: SEO, Open Graph, 폰트, CSS
- `<header>`: 사이트 로고, 내비게이션
- `<main>`: `{{ block "main" . }}` 로 각 페이지 콘텐츠 주입
- `<aside>`: 사이드바 (`partials/sidebar.html`)
- `<footer>`: 푸터

### partials/interactions.html

Supabase 연동 UI. 조회수, 좋아요, 댓글 폼.  
→ 변경 전 `supabase/CLAUDE.md` 읽기.

### shortcodes/

소셜 임베드 단축코드. 각 파일은 단일 플랫폼 전담:
- `youtube.html`, `youtube-shorts.html`
- `instagram.html`, `tiktok.html`, `twitter.html`
- `threads.html`, `facebook.html`
- `applemusic.html`, `vimeo.html`

새 플랫폼 추가 시 동일한 패턴으로 새 파일 생성.  
Fallback: 임베드 실패 시 원본 URL 링크로 대체.

## Go 템플릿 규칙

### nil 안전 접근

```html
<!-- 나쁜 예: 필드 없으면 빌드 오류 -->
{{ .Params.cover }}

<!-- 좋은 예 -->
{{ with .Params.cover }}<img src="{{ . }}">{{ end }}
{{ .Params.summary | default "" }}
```

### Partial 컨텍스트 전달

```html
<!-- 전체 컨텍스트 전달 -->
{{ partial "post-meta.html" . }}

<!-- 딕셔너리로 선택적 전달 -->
{{ partial "some-partial.html" (dict "Page" . "Title" "커스텀") }}
```

### CSS 변수 사용 (인라인 스타일 지양)

```html
<!-- 나쁜 예 -->
<div style="color: #333">

<!-- 좋은 예 -->
<div class="post-body">
<!-- site.css에서 .post-body { color: var(--color-text); } -->
```

## 디자인 원칙

`.impeccable.md`가 최종 기준. 요약:
- 중립 60% / 서포트 그레이 30% / 형광 악센트 10%
- 색상 추가 전 기존 CSS 변수 먼저 확인
- 새로운 UI 패턴은 기존 partials 스타일과 일관성 유지

## 변경 영향 범위

| 파일 | 영향 범위 |
|---|---|
| `_default/baseof.html` | 전체 사이트 |
| `_default/single.html` | 모든 포스트 페이지 |
| `_default/home.html` | 홈 페이지만 |
| `partials/head.html` | 전체 사이트 (SEO/메타) |
| `shortcodes/*.html` | 해당 단축코드 사용 포스트 |

## 개발 시 주의

Hugo 캐시로 인해 템플릿 변경이 바로 반영 안 될 수 있음:
```bash
hugo --gc && hugo server -D
```
