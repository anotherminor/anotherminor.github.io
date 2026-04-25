# Runbook: 배포

## 배포 방식

`main` 브랜치에 push하면 GitHub Actions가 자동으로 빌드 + 배포.  
수동 배포 명령은 없다. Push = 배포.

## 자동 배포 파이프라인

```yaml
# .github/workflows/deploy-github-pages.yml
트리거: push to main
단계:
  1. generate-tags   (태그 페이지 최신화)
  2. hugo --minify   (정적 빌드)
  3. pagefind        (검색 인덱싱)
  4. GitHub Pages 배포
```

예상 소요 시간: 2-4분

## 배포 전 로컬 검증 순서

```bash
# 1. 콘텐츠 검증
npm run validate:content

# 2. 태그 동기화
npm run generate-tags

# 3. 로컬 프리뷰 (선택)
hugo server -D

# 4. 프로덕션 빌드 테스트 (선택)
npm run build:pages
```

## Git 커밋 & Push

```bash
# 변경된 파일만 선택적으로 스테이징
git add content/posts/           # 새 글
git add scripts/tag-map.json     # 태그 변경 시
git add content/tags/            # 태그 페이지 재생성 시
git add layouts/ static/         # 템플릿/스타일 변경 시
git add hugo.yaml                # Hugo 설정 변경 시

# 커밋 메시지 컨벤션
git commit -m "post: 제목 (20260415-0001)"    # 새 글
git commit -m "fix: 오타 수정 (20260401-0001)" # 내용 수정
git commit -m "feat: 다크모드 버그 수정"       # 기능/스타일
git commit -m "chore: 태그 추가 (봉준호)"      # 운영성 변경

git push origin main
```

## 배포 상태 확인

GitHub Actions 탭 → `Deploy Hugo site to Pages` 워크플로 확인.

오류 발생 시 로그에서:
- Hugo 빌드 오류: front matter 문제 가능성 → `npm run validate:content`
- Pagefind 오류: 빌드 산출물 문제 → `npm run build:pages` 로컬 테스트
- 배포 오류: GitHub Pages 설정 문제 → 저장소 Settings > Pages 확인

## 롤백

```bash
# 직전 커밋으로 되돌리기
git revert HEAD
git push origin main
```

`git revert`는 새 커밋으로 되돌려 히스토리를 보존.  
`git reset --hard`는 사용하지 않음 (히스토리 파괴).

## 브랜치 작업 전략

- `main`: 프로덕션. 직접 push 또는 PR 머지로만 변경.
- `claude/{worktree-name}`: Claude Code 워크트리 브랜치.
- 기능 개발: 별도 브랜치에서 작업 후 PR로 `main`에 머지.

## 도메인

- **프로덕션**: `https://minorupdates.com/` (CNAME → GitHub Pages)
- **GitHub Pages 원본 URL**: `https://anotherminor.github.io/`
- DNS 설정: `CNAME` 파일이 `minorupdates.com`을 가리킴

DNS 변경이나 도메인 관련 작업은 도메인 레지스트라에서 직접 진행.
