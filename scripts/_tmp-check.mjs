import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
const failed = [];
p.on('requestfailed', (r) => failed.push(r.url() + ' :: ' + r.failure()?.errorText));
p.on('response', (r) => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url()); });
await p.setViewport({ width: 320, height: 640, isMobile: true });
await p.goto('http://localhost:4311/', { waitUntil: 'networkidle0' });

const r = await p.evaluate(() => ({
  sheets: [...document.styleSheets].map((s) => ({ href: s.href, rules: (() => { try { return s.cssRules.length; } catch { return 'CORS'; } })() })),
  links: [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => l.href),
  bodyBg: getComputedStyle(document.body).backgroundColor,
  bodyClass: document.body.className,
  htmlClass: document.documentElement.className,
}));
console.log(JSON.stringify(r, null, 2));
console.log('FAILED:', failed);
await b.close();
