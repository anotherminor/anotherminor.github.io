#!/usr/bin/env bash
# PostToolUse 훅: scripts/tag-map.json 편집 후 태그 페이지 자동 동기화

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c \
  "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path',''))" \
  2>/dev/null)

# tag-map.json이 아니면 무시
[[ "$FILE_PATH" == *"scripts/tag-map.json" ]] || exit 0

cd "$(git rev-parse --show-toplevel)" || exit 0

echo "→ 태그 페이지 재생성 중..."
if npm run generate-tags --silent 2>&1; then
  echo "✓ content/tags/ 동기화 완료"
else
  echo "✗ 태그 페이지 생성 실패 — tag-map.json JSON 형식을 확인하세요"
  exit 1
fi
