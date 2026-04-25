# Runbook: 태그 관리

## 개념

태그는 **두 레이어**로 구성된다:

| 레이어 | 위치 | 역할 |
|---|---|---|
| 슬러그 | front matter `tags: [slug]` | URL, 내부 식별자 |
| 표시명 | `scripts/tag-map.json` | 화면 노출 한국어 이름 |

`tag-map.json`이 진실의 원천. 여기 없는 슬러그는 표시명 없음.

## 새 태그 추가

### 1. tag-map.json 수정

`scripts/tag-map.json`:
```json
{
  ...
  "새로운 태그": "new-tag-slug",
  ...
}
```

**슬러그 규칙**: 소문자 영문, 숫자, 하이픈만.  
예: `"봉준호 영화"` → `"bong-joon-ho"`

### 2. 태그 페이지 생성

```bash
npm run generate-tags
```

`content/tags/new-tag-slug/_index.md`가 생성된다.

### 3. 포스트에 태그 추가

```yaml
tags: [new-tag-slug, existing-slug]
```

### 4. 검증

```bash
npm run validate:content
```

## 태그 이름 변경 (표시명만)

`tag-map.json`에서 한국어 키만 변경:

```json
"이전 표시명": "same-slug"
→
"새 표시명": "same-slug"
```

슬러그는 URL이므로 변경 금지. 표시명만 변경 가능.  
`npm run generate-tags` 재실행 불필요 (슬러그 변화 없음).

## 태그 슬러그 변경 (URL 변경 — 주의)

슬러그 변경은 URL 변경을 의미한다.  
해당 태그를 사용하는 **모든 포스트의 front matter**도 함께 변경해야 한다.

```bash
# 일괄 치환 예시 (git으로 되돌릴 수 있을 때만)
grep -rl "old-slug" content/posts/ | xargs sed -i 's/old-slug/new-slug/g'
npm run validate:content
npm run generate-tags
```

## 태그 삭제

1. `tag-map.json`에서 항목 삭제
2. 해당 태그를 사용하는 포스트 front matter에서 제거
3. `content/tags/{slug}/` 디렉터리 삭제
4. `npm run generate-tags` 실행 (클린업)

## 태그 목록 확인

현재 등록된 태그 수:
```bash
cat scripts/tag-map.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d), 'tags')"
```

포스트에서 사용 중인 태그 확인:
```bash
grep -h "^tags:" content/posts/*/index.md | sort | uniq
```

## 주의사항

- `content/tags/` 디렉터리를 직접 편집하지 않는다 (`generate-tag-pages.js`가 덮어씀)
- `tag-map.json`에 없는 슬러그를 front matter에 쓰면 표시명이 슬러그 그대로 노출됨
- JSON 형식 오류 시 `npm run generate-tags`가 전체 실패 → JSON Lint 확인
