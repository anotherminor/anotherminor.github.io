/**
 * migrate-tags.js
 *
 * [용도]
 * 포스트 프론트매터에 표시 이름(한국어, 특수문자 포함)으로 저장된 태그를
 * tag-map.json 기준 영문 slug로 일괄 변환한다.
 *
 * 정상 운영 중에는 Obsidian에서 slug를 직접 입력하므로 이 스크립트는 필요 없다.
 * 아래 두 경우에만 사용한다.
 *   1. 태그 slug 시스템 도입 이전에 작성된 포스트를 일괄 변환할 때
 *   2. 실수로 표시 이름을 프론트매터에 입력한 채 발행하려 할 때
 *
 * [절차]
 * 1. scripts/tag-map.json 로드
 * 2. 포스트를 순회하며 표시 이름 태그를 slug로 변환 (기본: draft 제외)
 *    매핑 없는 태그는 경고 출력, 변환하지 않음
 * 3. --apply 없이 실행하면 dry-run (변경 내용만 출력)
 *    --apply 플래그를 붙여야 파일에 실제 반영
 *    --include-drafts 플래그를 붙이면 draft 포스트도 포함
 *
 * [실행]
 * dry-run:             npm run migrate-tags
 * 실제 적용:           npm run migrate-tags:apply
 * draft 포함 dry-run:  node scripts/migrate-tags.js --include-drafts
 * draft 포함 적용:     node scripts/migrate-tags.js --include-drafts --apply
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT     = path.resolve(__dirname, '..');
const MAP_PATH = path.join(__dirname, 'tag-map.json');
const POSTS    = path.join(ROOT, 'content', 'posts');

const APPLY = process.argv.includes('--apply');
const INCLUDE_DRAFTS = process.argv.includes('--include-drafts');

// 1. 매핑 로드: 표시 이름 → slug
const tagMap = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));

// 2. 인라인 YAML 배열 파싱 (따옴표 내 쉼표 처리 포함)
function splitInline(str) {
  const parts = [];
  let cur = '', inQ = false, qc = '';
  for (const ch of str) {
    if (!inQ && (ch === '"' || ch === "'")) { inQ = true; qc = ch; }
    else if (inQ && ch === qc)              { inQ = false; }
    else if (!inQ && ch === ',')            { parts.push(cur.trim().replace(/^["']|["']$/g, '')); cur = ''; }
    else                                    { cur += ch; }
  }
  if (cur.trim()) parts.push(cur.trim().replace(/^["']|["']$/g, ''));
  return parts.filter(Boolean);
}

function extractFrontmatterRange(src) {
  const m = src.match(/^(---[ \t]*\r?\n)([\s\S]*?)(\r?\n---[ \t]*(?:\r?\n|$))/);
  if (!m) return null;
  return { open: m[1], fm: m[2], close: m[3], full: m[0] };
}

function isDraft(fm) {
  return /^draft:\s*true\b/m.test(fm);
}

// 태그 블록을 찾아 slug로 치환한 새 프론트매터 반환
// 변경 내역 배열도 반환
function migrateTagsInFm(fm) {
  const changes = [];

  // 인라인 배열: tags: [...]
  const inlineMatch = fm.match(/^(tags:\s*\[)([^\]]*)(\])/m);
  if (inlineMatch) {
    const oldTags = splitInline(inlineMatch[2]);
    const newTags = oldTags.map(tag => {
      const slug = tagMap[tag];
      if (!slug) {
        process.stderr.write(`[경고] 매핑 없는 태그: "${tag}" — tag-map.json에 추가 필요\n`);
        return tag;
      }
      if (slug !== tag) changes.push({ from: tag, to: slug });
      return slug;
    });
    if (changes.length === 0) return { fm, changes };
    const newInner = newTags.map(t => (t.includes(' ') || t.includes('"') ? `"${t}"` : t)).join(', ');
    const newFm = fm.replace(inlineMatch[0], `${inlineMatch[1]}${newInner}${inlineMatch[3]}`);
    return { fm: newFm, changes };
  }

  // 블록 배열: tags:\n  - ...
  const blockMatch = fm.match(/^(tags:\s*\r?\n)((?:[ \t]+-[ \t\S].*(?:\r?\n)?)*)/m);
  if (blockMatch) {
    const lines = blockMatch[2].split(/\r?\n/).filter(Boolean);
    const newLines = lines.map(line => {
      const m = line.match(/^([ \t]+-[ \t]+)(.+)$/);
      if (!m) return line;
      const tag = m[2].replace(/^["']|["']$/g, '');
      const slug = tagMap[tag];
      if (!slug) {
        process.stderr.write(`[경고] 매핑 없는 태그: "${tag}" — tag-map.json에 추가 필요\n`);
        return line;
      }
      if (slug !== tag) changes.push({ from: tag, to: slug });
      const quoted = slug.includes(' ') ? `"${slug}"` : slug;
      return `${m[1]}${quoted}`;
    });
    if (changes.length === 0) return { fm, changes };
    const newBlock = newLines.join('\n') + '\n';
    const newFm = fm.replace(blockMatch[0], `${blockMatch[1]}${newBlock}`);
    return { fm: newFm, changes };
  }

  return { fm, changes };
}

let totalFiles = 0;
let totalChanges = 0;
let warnCount = 0;

for (const dir of fs.readdirSync(POSTS)) {
  const indexPath = path.join(POSTS, dir, 'index.md');
  if (!fs.existsSync(indexPath)) continue;
  const src = fs.readFileSync(indexPath, 'utf8');
  const parsed = extractFrontmatterRange(src);
  if (!parsed) continue;
  if (!INCLUDE_DRAFTS && isDraft(parsed.fm)) continue;

  const { fm: newFm, changes } = migrateTagsInFm(parsed.fm);
  if (changes.length === 0) continue;

  const relPath = path.relative(ROOT, indexPath);
  if (!APPLY) {
    console.log(`[dry-run] ${relPath}`);
    changes.forEach(c => console.log(`  ${c.from} → ${c.to}`));
  } else {
    const newSrc = src.replace(parsed.full, `${parsed.open}${newFm}${parsed.close}`);
    fs.writeFileSync(indexPath, newSrc, 'utf8');
    console.log(`[적용] ${relPath} (${changes.length}개 변경)`);
  }

  totalFiles++;
  totalChanges += changes.length;
}

const mode = APPLY ? '적용' : 'dry-run';
console.log(`\n[${mode}] 완료: ${totalFiles}개 파일, ${totalChanges}개 태그 변경${warnCount ? `, ${warnCount}개 경고` : ''}`);
if (!APPLY && totalFiles > 0) {
  console.log('실제 적용하려면: node scripts/migrate-tags.js --apply');
}
