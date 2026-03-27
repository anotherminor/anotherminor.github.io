/**
 * generate-tag-pages.js
 *
 * [용도]
 * 포스트 프론트매터의 태그 slug를 읽어 content/tags/<slug>/_index.md를 자동 생성한다.
 * Hugo는 _index.md의 title을 태그 페이지 제목으로 사용하므로,
 * 포스트에는 Obsidian-safe slug(영문, 하이픈)를 쓰고
 * 태그 페이지에는 한국어 표시 이름이 나타나도록 한다.
 *
 * [절차]
 * 1. scripts/tag-map.json 로드 (표시 이름 → slug)
 * 2. slug → 표시 이름 역방향 맵 생성
 * 3. 비-draft 포스트를 순회하며 tags 수집
 *    - 태그가 표시 이름이면 tagMap으로 slug 변환
 *    - 태그가 이미 slug이면 역방향 맵에서 표시 이름 조회
 *    - 둘 다 없으면 경고 출력 (태그 페이지 미생성)
 * 4. 수집된 slug마다 content/tags/<slug>/_index.md 생성
 *    이미 존재하면 건드리지 않음
 *
 * [실행]
 * - 로컬: npm run generate-tags
 * - CI:   prebuild 훅을 통해 Hugo 빌드 전 자동 실행
 *
 * [새 태그 추가 방법]
 * 1. scripts/tag-map.json에 "표시 이름": "slug" 추가
 * 2. 포스트 프론트매터에 slug 입력
 * 3. push → CI가 자동 처리
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT     = path.resolve(__dirname, '..');
const MAP_PATH = path.join(__dirname, 'tag-map.json');
const POSTS    = path.join(ROOT, 'content', 'posts');
const TAGS_DIR = path.join(ROOT, 'content', 'tags');

// 1. 매핑 로드: 표시 이름 → slug
const tagMap = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));

// 2. 역방향 맵: slug → 표시 이름
const slugToDisplay = {};
for (const [display, slug] of Object.entries(tagMap)) {
  if (slug in slugToDisplay && slugToDisplay[slug] !== display) {
    process.stderr.write(`[경고] slug 충돌: "${slug}" — "${display}" vs "${slugToDisplay[slug]}"\n`);
  }
  slugToDisplay[slug] = display;
}

// 3. 인라인 YAML 배열 파싱 (따옴표 내 쉼표 처리 포함)
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

function extractFrontmatter(src) {
  const m = src.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  return m ? m[1] : null;
}

function isDraft(fm) {
  return /^draft:\s*true\b/m.test(fm);
}

function parseTags(fm) {
  const inline = fm.match(/^tags:\s*\[([^\]]*)\]/m);
  if (inline) return splitInline(inline[1]);
  const block = fm.match(/^tags:\s*\r?\n((?:[ \t]+-[ \t\S].*(?:\r?\n)?)*)/m);
  if (block) {
    return block[1]
      .split(/\r?\n/)
      .map(l => l.replace(/^[ \t]+-[ \t]+/, '').trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }
  return [];
}

// 4. 비-draft 포스트에서 slug 수집
const usedSlugs = new Set();
let warned = 0;

for (const dir of fs.readdirSync(POSTS)) {
  const indexPath = path.join(POSTS, dir, 'index.md');
  if (!fs.existsSync(indexPath)) continue;
  const src = fs.readFileSync(indexPath, 'utf8');
  const fm = extractFrontmatter(src);
  if (!fm || isDraft(fm)) continue;

  for (const tag of parseTags(fm)) {
    // 표시 이름으로 조회 → slug 반환
    // 이미 slug라면 slugToDisplay에 존재 → 그대로 사용
    const slug = tagMap[tag] ?? (tag in slugToDisplay ? tag : null);
    if (!slug) {
      process.stderr.write(`[경고] 매핑 없는 태그: "${tag}" — tag-map.json에 추가 필요\n`);
      warned++;
    } else {
      usedSlugs.add(slug);
    }
  }
}

// 5. slug별 _index.md 생성 (이미 존재하면 건드리지 않음)
fs.mkdirSync(TAGS_DIR, { recursive: true });
let created = 0;

for (const slug of usedSlugs) {
  const display = slugToDisplay[slug];
  const dir     = path.join(TAGS_DIR, slug);
  const dest    = path.join(dir, '_index.md');
  if (fs.existsSync(dest)) continue;
  fs.mkdirSync(dir, { recursive: true });
  const escaped = display.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  fs.writeFileSync(dest, `---\ntitle: "${escaped}"\nslug: "${slug}"\n---\n`, 'utf8');
  created++;
}

console.log(`태그 페이지 생성 완료: ${created}개 생성, ${usedSlugs.size}개 처리${warned ? `, ${warned}개 경고` : ''}`);
