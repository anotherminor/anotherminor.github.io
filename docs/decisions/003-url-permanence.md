# ADR 003: URL 영구성 원칙

**상태:** 채택됨 (변경 불가 정책)  
**날짜:** 초기 설계 시점

## 맥락

블로그 URL은 외부 링크, 소셜 공유, 북마크를 통해 퍼진다.  
URL이 변경되면 기존에 공유된 링크가 모두 404가 된다.

## 결정

**한 번 배포된 포스트의 URL은 영구적이다. 어떤 이유로도 변경하지 않는다.**

## 구현

퍼머링크 구조: `/posts/:year/:month/:slug/`

- `:year`, `:month` — front matter `date` 필드에서 자동 추출
- `:slug` — front matter `slug` 필드 값 (필수, 명시적 선언)

`hugo.yaml`:
```yaml
permalinks:
  posts: /posts/:year/:month/:slug/
```

## 결과

- `slug` 필드는 포스트 생성 시 한 번만 결정하고 이후 변경 금지
- 제목이 바뀌어도 slug는 그대로 유지
- 날짜가 바뀌면 URL이 바뀌므로 `date`도 게시 후 변경 금지
- `entry_id` (디렉터리명)는 내부 식별자 — URL에 영향 없음

## 불가피한 경우

정말 URL 변경이 필요한 경우(오타 등):
1. Hugo의 `aliases` 필드로 301 리다이렉트 설정
2. 기존 URL → 새 URL 리다이렉트 확인 후 변경

```yaml
aliases:
  - /posts/2026/01/old-slug/
```
