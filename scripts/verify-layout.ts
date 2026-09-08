/**
 * Structural verification of the tree layout against the real fixture data.
 * Run with: npx tsx scripts/verify-layout.ts
 *
 * Asserts the properties that actually matter for correctness:
 *  - no two nodes on the same generation row overlap horizontally
 *  - every node stays inside the reported canvas bounds
 *  - every edge connects two nodes that were actually emitted
 *  - cycles in the graph terminate instead of hanging
 */
import { people } from '../src/lib/data/fixtures/people';
import { buildTreeLayout, collectDescendantIds, DEFAULT_LAYOUT } from '../src/lib/tree-layout';
import { validateGraph } from '../src/lib/data/integrity';
import { places } from '../src/lib/data/fixtures/places';
import { media } from '../src/lib/data/fixtures/media';
import { events } from '../src/lib/data/fixtures/events';
import { stories } from '../src/lib/data/fixtures/stories';

let failures = 0;
const check = (name: string, ok: boolean, detail = ''): void => {
  if (ok) {
    console.log(`  PASS  ${name}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${name}${detail ? ` -- ${detail}` : ''}`);
  }
};

console.log('\nGraph integrity');
const issues = validateGraph({ people, places, media, events, stories });
const errors = issues.filter((i) => i.severity === 'error');
const warnings = issues.filter((i) => i.severity === 'warning');
check('no referential errors', errors.length === 0, errors.map((e) => e.message).join('; '));
if (warnings.length > 0) {
  console.log(`  note  ${warnings.length} warning(s): ${warnings.map((w) => w.message).join('; ')}`);
}

const ROOT = 'p-jozef';
const all = collectDescendantIds(people, ROOT);

console.log('\nLayout, fully expanded');
const layout = buildTreeLayout(people, ROOT, all, DEFAULT_LAYOUT);
check('emits nodes', layout.nodes.length > 0, `${layout.nodes.length} nodes`);
console.log(
  `  info  ${layout.nodes.length} nodes, ${layout.edges.length} edges, canvas ${Math.round(layout.width)}x${Math.round(layout.height)}`,
);

// Row overlap: the classic tidy-tree failure mode.
const rows = new Map<number, { id: string; x1: number; x2: number }[]>();
for (const n of layout.nodes) {
  const w = n.spouse ? DEFAULT_LAYOUT.nodeWidth + DEFAULT_LAYOUT.spouseWidth : DEFAULT_LAYOUT.nodeWidth;
  const row = rows.get(n.depth) ?? [];
  row.push({ id: n.id, x1: n.x, x2: n.x + w });
  rows.set(n.depth, row);
}
let overlap: string | null = null;
for (const [depth, row] of rows) {
  const sorted = [...row].sort((a, b) => a.x1 - b.x1);
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    if (!prev || !cur) continue;
    if (cur.x1 < prev.x2 - 0.01) {
      overlap = `depth ${depth}: ${prev.id} [${prev.x1.toFixed(0)},${prev.x2.toFixed(0)}] overlaps ${cur.id} [${cur.x1.toFixed(0)},${cur.x2.toFixed(0)}]`;
      break;
    }
  }
  if (overlap) break;
}
check('no sibling overlap on any row', overlap === null, overlap ?? '');

// Bounds.
let oob: string | null = null;
for (const n of layout.nodes) {
  const w = n.spouse ? DEFAULT_LAYOUT.nodeWidth + DEFAULT_LAYOUT.spouseWidth : DEFAULT_LAYOUT.nodeWidth;
  if (n.x < 0 || n.y < 0 || n.x + w > layout.width + 0.01 || n.y + DEFAULT_LAYOUT.nodeHeight > layout.height + 0.01) {
    oob = `${n.id} at (${n.x.toFixed(0)},${n.y.toFixed(0)})`;
    break;
  }
}
check('all nodes within canvas bounds', oob === null, oob ?? '');

// Edge endpoints must exist.
const ids = new Set(layout.nodes.map((n) => n.id));
const dangling = layout.edges.filter((e) => !ids.has(e.fromId) || !ids.has(e.toId));
check('no dangling edges', dangling.length === 0, dangling.map((e) => e.id).join(', '));

// A person must never be drawn twice (spouse adjoining is the usual culprit).
const dupes = layout.nodes.map((n) => n.id).filter((id, i, a) => a.indexOf(id) !== i);
check('no duplicated nodes', dupes.length === 0, dupes.join(', '));

const adjoinedTwice = layout.nodes
  .map((n) => n.spouse?.id)
  .filter((id): id is string => id !== undefined)
  .filter((id, i, a) => a.indexOf(id) !== i);
check('no spouse adjoined twice', adjoinedTwice.length === 0, adjoinedTwice.join(', '));

const bothNodeAndSpouse = layout.nodes.filter((n) => n.spouse && ids.has(n.spouse.id));
check(
  'no person both node and spouse',
  bothNodeAndSpouse.length === 0,
  bothNodeAndSpouse.map((n) => n.spouse?.id).join(', '),
);

console.log('\nLayout, collapsed to root');
const collapsed = buildTreeLayout(people, ROOT, new Set(), DEFAULT_LAYOUT);
check('root only', collapsed.nodes.length === 1, `${collapsed.nodes.length} nodes`);
check('root reports hidden children', collapsed.nodes[0]?.hasHiddenChildren === true);

console.log('\nCycle safety');
const cyclic = [
  { ...people[0]!, id: 'c1', slug: 'c1', parentIds: ['c2'], childIds: ['c2'], spouseIds: [] },
  { ...people[0]!, id: 'c2', slug: 'c2', parentIds: ['c1'], childIds: ['c1'], spouseIds: [] },
];
const started = Date.now();
const cyclicLayout = buildTreeLayout(cyclic, 'c1', new Set(['c1', 'c2']), DEFAULT_LAYOUT);
check('terminates on a cycle', Date.now() - started < 1000, `${cyclicLayout.nodes.length} nodes`);

console.log('\nUnknown root');
const empty = buildTreeLayout(people, 'does-not-exist', new Set(), DEFAULT_LAYOUT);
check('returns empty layout', empty.nodes.length === 0 && empty.width === 0);

console.log(failures === 0 ? '\nAll layout checks passed.\n' : `\n${failures} check(s) failed.\n`);
process.exit(failures === 0 ? 0 : 1);
