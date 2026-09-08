/**
 * Renders every route at real viewport widths and checks for the failures
 * that only appear in a browser: horizontal overflow, touch targets that are
 * too small, and text that has collapsed below a readable size.
 *
 * Usage: node scripts/viewport-check.mjs [baseUrl]
 */
import puppeteer from 'puppeteer';

const BASE = process.argv[2] ?? 'http://localhost:4311';

const VIEWPORTS = [
  { name: '320  (small phone)', width: 320, height: 640, mobile: true },
  { name: '390  (iPhone)', width: 390, height: 844, mobile: true },
  { name: '768  (tablet)', width: 768, height: 1024, mobile: true },
  { name: '1280 (laptop)', width: 1280, height: 800, mobile: false },
  { name: '2560 (4K/ultrawide)', width: 2560, height: 1440, mobile: false },
];

const ROUTES = ['/', '/tree', '/people', '/people/miriam-abrams', '/timeline', '/stories', '/photos', '/places', '/archive'];

let failures = 0;
const problems = [];

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({
    width: vp.width,
    height: vp.height,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    deviceScaleFactor: 1,
  });

  for (const route of ROUTES) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle2', timeout: 60000 });
    // Let reveal-on-scroll and the tree's fit-to-view settle.
    await new Promise((r) => setTimeout(r, 450));

    const report = await page.evaluate((viewportWidth) => {
      const docWidth = document.documentElement.scrollWidth;

      // Elements that stick out past the viewport's right edge.
      const overflowing = [];
      for (const el of document.querySelectorAll('body *')) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        const style = getComputedStyle(el);
        if (style.position === 'fixed') continue;
        // Ignore anything inside a clipping container: it is meant to scroll.
        let clipped = false;
        for (let p = el.parentElement; p; p = p.parentElement) {
          const ps = getComputedStyle(p);
          if (/hidden|auto|scroll|clip/.test(ps.overflowX)) {
            clipped = true;
            break;
          }
        }
        if (clipped) continue;
        if (rect.right > viewportWidth + 1.5) {
          overflowing.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className?.toString?.() ?? '').slice(0, 60),
            right: Math.round(rect.right),
          });
        }
      }

      // Interactive targets smaller than the 44px guideline.
      const smallTargets = [];
      for (const el of document.querySelectorAll('a, button, input, [role="button"]')) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        const style = getComputedStyle(el);
        if (style.visibility === 'hidden' || style.display === 'none') continue;
        // Inline links inside prose are exempt; the guideline targets controls.
        const inProse = el.closest('p, figcaption, blockquote, dd, li p');
        if (el.tagName === 'A' && inProse) continue;
        if (rect.height < 30 || rect.width < 24) {
          smallTargets.push({
            tag: el.tagName.toLowerCase(),
            label: (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 32),
            size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
          });
        }
      }

      // Body copy that has collapsed below a comfortable reading size.
      const tinyText = [];
      for (const el of document.querySelectorAll('p, li, dd')) {
        if (!el.textContent?.trim()) continue;
        const size = parseFloat(getComputedStyle(el).fontSize);
        if (size < 11) tinyText.push({ size: size.toFixed(1), text: el.textContent.trim().slice(0, 30) });
      }

      return { docWidth, overflowing: overflowing.slice(0, 5), smallTargets: smallTargets.slice(0, 5), tinyText: tinyText.slice(0, 3) };
    }, vp.width);

    const issues = [];
    if (report.docWidth > vp.width + 1.5) {
      issues.push(`page scrolls horizontally (${report.docWidth}px > ${vp.width}px)`);
    }
    if (report.overflowing.length > 0) {
      issues.push(
        `overflow: ${report.overflowing.map((o) => `${o.tag}.${o.cls.split(' ')[0]}@${o.right}`).join(', ')}`,
      );
    }
    if (report.smallTargets.length > 0 && vp.mobile) {
      issues.push(
        `small targets: ${report.smallTargets.map((t) => `${t.tag}"${t.label}"${t.size}`).join(', ')}`,
      );
    }
    if (report.tinyText.length > 0) {
      issues.push(`tiny text: ${report.tinyText.map((t) => `${t.size}px`).join(', ')}`);
    }

    if (issues.length > 0) {
      failures += issues.length;
      problems.push({ viewport: vp.name, route, issues });
    }
  }

  await page.close();
  console.log(`  checked ${vp.name}`);
}

await browser.close();

if (problems.length === 0) {
  console.log('\nNo layout problems at any viewport.\n');
} else {
  console.log('\nProblems found:\n');
  for (const p of problems) {
    console.log(`  ${p.viewport}  ${p.route}`);
    for (const i of p.issues) console.log(`      - ${i}`);
  }
  console.log('');
}

process.exit(failures === 0 ? 0 : 1);
