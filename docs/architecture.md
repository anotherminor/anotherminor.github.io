# 시스템 아키텍처

## 개요

```
작성자 (로컬)
    │
    ├─ hugo server -D ──────────────────── localhost:1313 (초안 포함 프리뷰)
    │
    └─ git push origin main
           │
           ▼
    GitHub Actions (CI/CD)
           │
           ├─ npm run generate-tags    (태그 페이지 생성)
           ├─ hugo --minify            (정적 파일 빌드 → public/)
           ├─ pagefind --site public   (검색 인덱스 생성)
           └─ GitHub Pages 배포
                  │
                  ▼
           https://minorupdates.com
                  │
    브라우저 ◄──── HTML/CSS/JS (정적)
                  │
                  └─ Supabase API (조회수, 좋아요, 댓글) ──► Supabase DB
                                                              ▲
                                                              │ keep_alive() RPC
                                                              │
    GitHub Actions (cron, 매주 월·목 KST 10:17) ──────────────┘
           │
           └─ last-run.txt 자동 커밋 (저장소 활동 갱신 → 60일 워크플로우 비활성화 차단)
```

## 레이어별 역할

### 콘텐츠 레이어 (`content/`)

- 모든 글은 `content/posts/{YYYYMMDD-NNNN}/index.md` 형태의 Page Bundle
- YAML front matter가 메타데이터 계약 정의
- Markdown 본문 + 소셜 임베드 단축코드
- 이미지는 각 포스트 번들의 `images/` 하위에 보관 (Hugo Page Resources)

### 템플릿 레이어 (`layouts/`)

- `_default/baseof.html`: 전체 HTML 껍데기 (head, header, sidebar, footer)
- `single.html`: 개별 포스트 렌더링
- `partials/interactions.html`: Supabase 연동 UI (조회수, 좋아요, 댓글 폼)
- `shortcodes/`: 소셜 플랫폼 임베드 단축코드 9종

### 스타일 레이어 (`static/css/site.css`)

- OKLCH 색공간 CSS 커스텀 프로퍼티 기반 디자인 시스템
- 라이트/다크 모드 `[data-theme]` 셀렉터 체계
- 디자인 원칙: `.impeccable.md` 참조

### 검색 레이어

- Pagefind: 빌드 산출물(`public/`)을 인덱싱, 클라이언트 사이드 검색
- 개발 서버(`hugo server`)에서는 미작동 — 빌드 후 확인 필요

### 백엔드 레이어 (`supabase/`)

- **조회수**: 포스트 로드 시 RPC 호출로 자동 증가
- **좋아요**: 익명 토글 (로컬스토리지 기반 중복 방지)
- **댓글**: 비밀번호 기반 작성/삭제 (Edge Function)
- RLS 정책: `anon` 역할만 허용, 직접 삭제는 Edge Function만 가능
- **활성 유지**: `keep_alive()` RPC를 GitHub Actions가 주 2회 호출 (무료 플랜 7일 일시정지 회피)

### Keep-Alive 레이어 (`.github/workflows/keep-alive.yml`)

- 매주 월·목 KST 10:17 cron 트리거 + 수동 실행
- Supabase `rpc/keep_alive` POST → 무료 플랜 자동 일시정지 차단
- `last-run.txt`를 `github-actions[bot]` 명의로 자동 커밋·push → public 저장소 60일 비활성화에 따른 워크플로우 자동 비활성화 차단
- 상세 명세: `docs/spec.md` § 7.8

## 데이터 흐름: 새 글 발행

```
1. content/posts/{entry_id}/index.md 작성
2. npm run validate:content          → front matter 계약 검증
3. npm run generate-tags             → content/tags/ 동기화 (새 태그 있을 때)
4. git add & git commit
5. git push origin main
6. GitHub Actions:
   a. generate-tags (최신화)
   b. hugo --minify (빌드)
   c. pagefind (검색 인덱싱)
   d. GitHub Pages 배포
7. https://minorupdates.com/posts/YYYY/MM/{slug}/ 접근 가능
```

## URL 구조

```
https://minorupdates.com/
├── /posts/YYYY/MM/{slug}/     ← 개별 포스트 (영구 URL)
├── /categories/{category}/    ← 카테고리 목록
├── /tags/{slug}/              ← 태그 목록
├── /archive/                  ← 전체 아카이브
├── /search/                   ← 검색 결과
└── /about/                    ← 소개 페이지
```

퍼머링크 구조는 `hugo.yaml`의 `permalinks.posts`가 결정.  
**변경 시 기존 URL이 모두 깨지므로 절대 수정 금지.**

## 의존성 관계

```
tag-map.json ──► generate-tag-pages.js ──► content/tags/*/index.md
                                               │
hugo.yaml ──────────────────────────────────── ┤
layouts/ ───────────────────────────────────── ┤ ──► public/ (배포 산출물)
content/ ───────────────────────────────────── ┤
static/ ────────────────────────────────────── ┘
```
