# Runbook: 콘텐츠 발행

## 목적

새 블로그 포스트를 안전하게 작성하고 배포하는 표준 절차.

## 사전 조건

- Hugo 설치 (`hugo version`)
- Node.js + npm 설치 (`node --version`)
- Git 설정 완료

## Step 1: 포스트 번들 생성

```bash
# entry_id 형식: YYYYMMDD-NNNN (당일 순번)
# 예: 20260415-0001
ENTRY_ID="20260415-0001"
mkdir -p content/posts/$ENTRY_ID/images
```

## Step 2: index.md 작성

`content/posts/$ENTRY_ID/index.md` 생성:

```yaml
---
title: "글 제목"
date: 2026-04-15T12:00:00+09:00
draft: true
slug: "url-slug-here"
categories: ["rambling"]
tags: [tag-slug-1, tag-slug-2]
summary: "한 줄 요약"
cover: "images/cover.webp"
---

본문 내용...
```

**slug 규칙**: 소문자 영문, 숫자, 하이픈만. 한 번 설정 후 불변.

## Step 3: 태그 확인

사용할 태그 슬러그가 `scripts/tag-map.json`에 있는지 확인:

```bash
grep "원하는-태그-슬러그" scripts/tag-map.json
```

없으면 추가:
```json
"한국어 표시명": "english-slug"
```

그 후:
```bash
npm run generate-tags
```

## Step 4: 검증

```bash
npm run validate:content
```

오류가 없을 때까지 front matter 수정.

## Step 5: 로컬 프리뷰

```bash
hugo server -D
# http://localhost:1313 에서 확인
```

포스트 URL: `http://localhost:1313/posts/YYYY/MM/{slug}/`

## Step 6: 발행

글이 완성되면 `draft: true` → `draft: false` 변경.

```bash
npm run validate:content   # 최종 검증
git add content/ scripts/  # 변경된 파일만
git commit -m "post: 글 제목 (20260415-0001)"
git push origin main
```

## Step 7: 배포 확인

1. GitHub Actions 완료 대기 (보통 2-3분)
2. `https://minorupdates.com/posts/YYYY/MM/{slug}/` 접속
3. 제목, 내용, 태그, 이미지 정상 표시 확인

## 이미지 첨부

이미지는 포스트 번들 내에 보관:
```
content/posts/{entry_id}/
├── index.md
└── images/
    ├── cover.webp      ← 커버 이미지 (front matter cover 필드)
    └── photo.webp
```

Markdown 내 참조:
```markdown
![설명](images/photo.webp)
```

커버 이미지:
```yaml
cover: "images/cover.webp"
```

## 소셜 임베드

사용 가능한 단축코드:

```
{{< youtube VIDEO_ID >}}
{{< youtube-shorts VIDEO_ID >}}
{{< instagram POST_ID >}}
{{< tiktok VIDEO_ID >}}
{{< twitter TWEET_ID >}}
{{< threads POST_ID >}}
{{< facebook POST_ID >}}
{{< applemusic ALBUM_OR_SONG_URL >}}
{{< vimeo VIDEO_ID >}}
```
