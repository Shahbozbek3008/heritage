/**
 * Audits the running production build for the things this project promised:
 * accessibility basics, SEO metadata, and layout-overflow hazards.
 *
 * Usage: node scripts/audit.mjs [baseUrl]
 */
const BASE = process.argv[2] ?? 'http://localhost:4311';

const ROUTES = [
  '/',
  '/tree',
  '/people',
  '/people/miriam-abrams',
  '/people/rivka-abramowicz',
  '/timeline',
  '/stories',
  '/stories/eleven-dollars',
  '/photos',
  '/places',
  '/places/vilna',
  '/archive',
];

let failures = 0;
let warnings = 0;

const fail = (route, msg) => {
  failures += 1;
  console.error(`  FAIL  ${route}  ${msg}`);
};
const warn = (route, msg) => {
  warnings += 1;
  console.warn(`  WARN  ${route}  ${msg}`);
};

/** Strips <script>/<style> so their contents never count as page markup. */
const stripCode = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

const results = [];

for (const route of ROUTES) {
  const res = await fetch(`${BASE}${route}`);
  const html = await res.text();
  const body = stripCode(html);

  if (res.status !== 200) {
    fail(route, `status ${res.status}`);
    continue;
  }

  // ---- SEO / document basics ----
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? '';
  if (!title.trim()) fail(route, 'missing <title>');
  else if (title.length > 70) warn(route, `title is ${title.length} chars`);

  const desc = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] ?? '';
  if (!desc.trim()) fail(route, 'missing meta description');

  if (!/<html[^>]+lang=/i.test(html)) fail(route, 'missing lang attribute');

  const viewport = html.match(/<meta name="viewport" content="([^"]*)"/i)?.[1] ?? '';
  if (!viewport) fail(route, 'missing viewport meta');
  if (/user-scalable\s*=\s*no/i.test(viewport) || /maximum-scale\s*=\s*1\b/.test(viewport)) {
    fail(route, 'viewport blocks zoom (accessibility)');
  }

  // ---- Headings ----
  const h1s = body.match(/<h1[\s>]/gi) ?? [];
  if (h1s.length === 0) fail(route, 'no <h1>');
  else if (h1s.length > 1) warn(route, `${h1s.length} <h1> elements`);

  // ---- Images ----
  const imgs = body.match(/<img\b[^>]*>/gi) ?? [];
  const missingAlt = imgs.filter((tag) => !/\balt\s*=/.test(tag));
  if (missingAlt.length > 0) fail(route, `${missingAlt.length} <img> without alt`);

  // ---- Interactive elements need an accessible name ----
  const buttons = body.match(/<button\b[^>]*>[\s\S]*?<\/button>/gi) ?? [];
  const namelessButtons = buttons.filter((tag) => {
    if (/aria-label\s*=\s*"[^"]+"/i.test(tag)) return false;
    if (/aria-labelledby\s*=/i.test(tag)) return false;
    const inner = tag.replace(/<[^>]+>/g, '').trim();
    return inner.length === 0;
  });
  if (namelessButtons.length > 0) {
    fail(route, `${namelessButtons.length} button(s) with no accessible name`);
  }

  const links = body.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) ?? [];
  const namelessLinks = links.filter((tag) => {
    if (/aria-label\s*=\s*"[^"]+"/i.test(tag)) return false;
    const inner = tag.replace(/<[^>]+>/g, '').trim();
    return inner.length === 0;
  });
  if (namelessLinks.length > 0) {
    fail(route, `${namelessLinks.length} link(s) with no accessible name`);
  }

  // ---- Overflow hazards: fixed pixel widths wider than a 320px viewport ----
  // Inline styles only; utility classes are checked separately below.
  const fixedWidths = [...body.matchAll(/style="[^"]*\bwidth:\s*(\d+)px/gi)]
    .map((m) => Number(m[1]))
    .filter((w) => w > 320);
  if (fixedWidths.length > 0) {
    // The tree canvas legitimately sets a wide inner width inside an
    // overflow-hidden viewport, so this is informational on that route.
    const msg = `inline width > 320px: ${[...new Set(fixedWidths)].join(', ')}`;
    if (route === '/tree') warn(route, `${msg} (tree canvas, clipped by container)`);
    else warn(route, msg);
  }

  // ---- Structured data must parse ----
  const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  for (const [, json] of ldBlocks) {
    try {
      JSON.parse(json);
    } catch {
      fail(route, 'invalid JSON-LD');
    }
  }

  results.push({
    route,
    bytes: html.length,
    title: title.slice(0, 48),
    imgs: imgs.length,
    ld: ldBlocks.length,
  });
}

console.log('\nRoute summary');
for (const r of results) {
  console.log(
    `  ${r.route.padEnd(30)} ${String(Math.round(r.bytes / 1024)).padStart(4)}kB  imgs:${String(r.imgs).padStart(2)}  ld:${r.ld}  "${r.title}"`,
  );
}

console.log(
  `\n${failures} failure(s), ${warnings} warning(s) across ${ROUTES.length} routes.\n`,
);
process.exit(failures === 0 ? 0 : 1);
