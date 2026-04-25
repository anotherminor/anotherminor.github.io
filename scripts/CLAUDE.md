# CLAUDE.md — scripts/ (빌드 유틸리티)

콘텐츠 관리를 자동화하는 스크립트 모음. Hugo 빌드 파이프라인의 일부.

## 파일 목록

| 파일 | 언어 | 역할 | npm 커맨드 |
|---|---|---|---|
| `tag-map.json` | JSON | 태그 표시명 ↔ 슬러그 매핑 테이블 | — |
| `generate-tag-pages.js` | Node.js | tag-map.json → content/tags/ 생성 | `npm run generate-tags` |
| `migrate-tags.js` | Node.js | front matter 태그 일괄 마이그레이션 | `npm run migrate-tags` |
| `validate-content.rb` | Ruby | front matter 계약 검증 | `npm run validate:content` |

## tag-map.json (진실의 원천)

```json
{
  "한국어 태그 이름": "english-slug",
  "영화": "film",
  "디즈니 플러스": "disney-plus"
}
```

**편집 규칙:**
- 키: 화면에 표시될 한국어 이름
- 값: URL에 사용될 영어 슬러그 (소문자, 하이픈)
- JSON 형식 오류 시 `generate-tag-pages.js` 전체 실패
- 순서는 무관하지만 알파벳 정렬 권장

새 태그 추가 후 반드시: `npm run generate-tags`

## generate-tag-pages.js

`tag-map.json`을 읽어 `content/tags/{slug}/_index.md`를 생성.

**동작:**
1. `content/tags/` 하위 기존 파일 삭제 후 재생성 (멱등성 보장)
2. 각 태그에 `title`과 `slug` front matter 포함

**주의:** `content/tags/` 파일을 직접 수정하지 말 것 — 다음 실행 시 덮어씌워짐.

## migrate-tags.js

Korean 태그를 영어 슬러그로 일괄 변환하는 일회성 마이그레이션 도구.  
이미 마이그레이션 완료 상태. 새 포스트에는 처음부터 슬러그를 사용.

신규 태그 슬러그가 필요하면 tag-map.json에 추가 → generate-tags 사용.

## validate-content.rb

모든 포스트 front matter가 계약을 준수하는지 검증.

**검증 항목:**
- 필수 필드 존재 여부: `title`, `date`, `draft`, `slug`, `categories`
- `categories` 값이 허용 목록 안에 있는지 (`rambling`, `entertainment`, `tech`)
- `date` 형식 유효성
- `slug` 형식 (소문자, 알파벳/숫자/하이픈만)
- `tags` 각 항목이 tag-map.json에 등록되어 있는지

**실행:**
```bash
npm run validate:content
# 성공: "All X posts validated"
# 실패: 오류 위치와 내용 출력
```

Ruby가 설치되지 않은 환경에서는 실행 불가. `ruby --version` 으로 확인.

## 실행 순서 (중요)

```
콘텐츠 수정
    ↓
npm run validate:content   ← 오류 없을 때까지
    ↓
tag-map.json 수정 (태그 추가 시)
    ↓
npm run generate-tags      ← 태그 페이지 동기화
    ↓
npm run build:pages        ← 최종 빌드 + 검색 인덱싱
```
