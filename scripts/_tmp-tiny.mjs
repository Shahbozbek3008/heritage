import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 1280, height: 800 });
await p.goto('http://localhost:4311/', { waitUntil: 'networkidle0' });
console.log(await p.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('*')) {
    if (!el.children.length && el.textContent.trim()) {
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs > 0 && fs <= 10.5) out.push({ text: el.textContent.trim().slice(0,40), fs, cls: el.className.toString().slice(0,70) });
    }
  }
  return out;
}));
// Desktop nav at 768: is it visible there?
const p2 = await b.newPage();
await p2.setViewport({ width: 768, height: 1024, isMobile: true });
await p2.goto('http://localhost:4311/archive', { waitUntil: 'networkidle0' });
console.log('768 nav:', await p2.evaluate(() => {
  const nav = document.querySelector('nav[aria-label="Primary"]');
  const a = nav?.querySelector('a');
  const r = a.getBoundingClientRect();
  const par = a.closest('li').getBoundingClientRect();
  return { navDisplay: getComputedStyle(nav).display, linkH: Math.round(r.height),
           linkPadY: getComputedStyle(a).paddingTop, liH: Math.round(par.height) };
}));
await b.close();
