import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await p.goto('http://localhost:4311/', { waitUntil: 'networkidle0' });
await p.click('button[aria-label="Open menu"]');
await new Promise((r) => setTimeout(r, 500));

// Sample rapidly right after the close click to catch the exit animation.
const frames = await p.evaluate(async () => {
  const out = [];
  document.querySelector('button[aria-label="Close menu"]').click();
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => requestAnimationFrame(r));
    const d = document.querySelector('[role="dialog"] .glass');
    out.push(d ? `${Math.round(d.getBoundingClientRect().left)} ${getComputedStyle(d).animationName}` : 'unmounted');
    await new Promise((r) => setTimeout(r, 35));
  }
  return out;
});
console.log('exit frames:', frames);
await b.close();
