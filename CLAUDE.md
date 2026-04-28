# CLAUDE.md — anotherminor.github.io

## 왜 이 프로젝트가 존재하는가

개인 한국어 블로그. 글쓰기(단상), 미디어(영화·음악·게임), 테크 세 범주로 일상을 아카이빙한다.  
독자는 오롯이 글에 집중할 수 있어야 하며, URL은 영구적이어야 한다.

## 스택

| 레이어 | 기술 |
|---|---|
| SSG | Hugo |
| 배포 | GitHub Pages (`main` 브랜치 push → 자동 배포) |
| 검색 | Pagefind |
| 백엔드 | Supabase (조회수, 좋아요, 댓글) |
| Keep-Alive | GitHub Actions (`.github/workflows/keep-alive.yml`, 주 2회 cron) |
| 검증 | Ruby (`validate-content.rb`) |

## 저장소 맵

```
CLAUDE.md               ← 지금 이 파일 (북극성)
hugo.yaml               ← Hugo 전역 설정
content/                ← 모든 글 (Markdown + YAML front matter)
  posts/YYYYMMDD-NNNN/  ← 포스트 번들 (index.md + images/)
  categories/           ← 카테고리 _index.md (rambling / entertainment / tech)
  tags/                 ← 자동 생성 (generate-tag-pages.js)
layouts/                ← Hugo 템플릿
  partials/             ← 재사용 HTML 조각
  shortcodes/           ← 소셜 임베드 단축코드
static/
  css/site.css          ← 디자인 시스템 (OKLCH 토큰 + 다크 모드)
  js/                   ← 테마 토글, 검색 초기화
scripts/
  tag-map.json          ← 태그 한국어 표시명 ↔ 영어 슬러그 매핑 (진실의 원천)
  validate-content.rb   ← front matter 계약 검증
  generate-tag-pages.js ← 태그 _index.md 자동 생성
supabase/               ← DB 스키마 + Edge Function (위험 구역 → supabase/CLAUDE.md)
.github/workflows/
  deploy-github-pages.yml ← Hugo 빌드·배포
  keep-alive.yml        ← Supabase 무료 플랜 일시정지 방지 (주 2회 RPC ping + last-run.txt 자동 커밋)
last-run.txt            ← keep-alive 워크플로우가 자동 갱신 (수동 편집 금지)
docs/
  spec.md               ← 마스터 명세 (모든 규칙의 근거)
  architecture.md       ← 시스템 구조 개요
  decisions/            ← ADR (아키텍처 결정 기록)
  runbooks/             ← 운영 절차서
.claude/
  skills/               ← 재사용 전문가 모드
  hooks/                ← 자동 가드레일
```

## 규칙 & 제약

### URL 불변 원칙 (최우선)
- 퍼머링크 형식: `/posts/YYYY/MM/{slug}/`
- **한 번 배포된 slug는 절대 변경하지 않는다**
- 슬러그는 `hugo.yaml`의 permalinks 설정이 결정하며, front matter의 `slug` 필드가 최종 URL이 된다

### 태그 슬러그 시스템
- 태그는 front matter에 **영어 슬러그**로만 기입 (`tags: [film, disney-plus]`)
- 표시명 ↔ 슬러그 매핑은 `scripts/tag-map.json`이 진실의 원천
- 새 태그 추가 시: tag-map.json 수정 → `npm run generate-tags` 실행
- 한국어 태그를 직접 front matter에 쓰지 않는다

### 콘텐츠 계약
```yaml
title: "제목"                     # 필수
date: 2026-01-01T00:00:00+09:00  # 필수, KST
draft: false                     # 게시 시 반드시 false
slug: "url-slug"                 # 필수, 한 번 설정 후 불변
categories: ["rambling"]         # 필수, 셋 중 하나만
tags: [slug1, slug2]             # 영어 슬러그
summary: "한 줄 요약"             # 권장
cover: "images/cover.webp"       # 권장
```

### 금지 사항
- `public/` 폴더를 직접 편집하지 않는다 (빌드 산출물)
- `node_modules/`를 건드리지 않는다
- `supabase/schema.sql`은 프로덕션 DB와 직결 — 반드시 supabase/CLAUDE.md 읽고 작업
- slug 변경 금지 (이미 배포된 글)
- `last-run.txt`를 직접 편집·삭제하지 않는다 (keep-alive 워크플로우 전용)
- `keep_alive()` RPC를 무거운 쿼리로 변경하지 않는다 (활성 신호 외 목적 금지)

## 주요 커맨드

```bash
hugo server -D                    # 로컬 프리뷰 (localhost:1313, 초안 포함)
npm run validate:content          # front matter 계약 검증
npm run generate-tags             # 태그 페이지 생성
npm run build:pages               # 프로덕션 빌드 + 검색 인덱싱
```

## layouts/ 규칙

Hugo 템플릿. 변경 시 사이트 전체에 영향.

- `_default/baseof.html` — 모든 페이지의 HTML 뼈대 (head/header/main/aside/footer). 변경 시 전체 사이트 영향
- `_default/single.html` (포스트) · `home.html` (홈) · `list.html`/`term.html` (목록·카테고리·태그)
- `_markup/render-{image,codeblock}.html` — Markdown 렌더 커스텀
- `partials/interactions.html` — Supabase 연동 UI. 변경 전 `supabase/CLAUDE.md` 읽기
- `partials/head.html` — SEO/메타. 변경 시 전체 사이트 영향
- `shortcodes/` — 소셜 임베드 (`youtube`, `instagram`, `tiktok`, `twitter`, `threads`, `facebook`, `applemusic`, `vimeo`). 단일 플랫폼 단위, 실패 시 원본 URL 링크로 fallback

### Go 템플릿 규칙

- nil 안전 접근: `.Params.X`를 직접 쓰지 않고 `with`나 `default ""`로 감싼다
- Partial 컨텍스트: 전체는 `.`, 선택적 전달은 `dict`
- 인라인 스타일 대신 `static/css/site.css`의 CSS 커스텀 프로퍼티를 쓴다
- 템플릿 캐시로 변경이 바로 반영 안 되면: `hugo --gc && hugo server -D`

## 참고 문서 위치

- 전체 명세 → `docs/spec.md`
- 시스템 구조 → `docs/architecture.md`
- 디자인 원칙 → `.impeccable.md`
- Supabase 위험 구역 → `supabase/CLAUDE.md`
- 스크립트 동작 → `scripts/CLAUDE.md`
