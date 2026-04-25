#!/usr/bin/env bash
# PostToolUse 훅: content/ 파일 편집 후 front matter 자동 검증

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c \
  "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path',''))" \
  2>/dev/null)

# content/ 하위 파일이 아니면 무시
[[ "$FILE_PATH" == content/* ]] || exit 0

cd "$(git rev-parse --show-toplevel)" || exit 0

echo "→ front matter 검증 중 ($FILE_PATH)..."
if npm run validate:content --silent 2>&1; then
  echo "✓ 검증 통과"
else
  echo "✗ front matter 오류 — 위 내용을 확인하세요"
  exit 1
fi
