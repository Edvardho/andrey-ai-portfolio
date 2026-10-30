import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Run against a local dev/production server; no assistant/model requests are needed.
async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const reducedMotion of ['no-preference', 'reduce'] as const) {
      for (const width of [375, 768, 1024, 1280, 1428, 1920]) {
        const page = await browser.newPage({ viewport: { width, height: 1200 }, reducedMotion });
        try {
          await page.goto(process.env.PROJECT_RAIL_URL ?? 'http://127.0.0.1:3000');
          await page.getByRole('heading', { name: 'Кейсы', exact: true }).hover();
          await page.waitForTimeout(800);
          // Larger text must grow the rail, not get clipped by a fixed desktop height.
          await page.locator('.portfolio-landing-project-card-wrap p').evaluateAll((elements) => {
            elements.forEach((element) => { (element as HTMLElement).style.fontSize = '18px'; });
          });
          const rail = page.locator('.portfolio-landing-project-rail');
          const measure = () => rail.evaluate((element) => {
            const rect = element.getBoundingClientRect();
            const cards = [...element.querySelectorAll('button')].map((card) => card.getBoundingClientRect());
            return {
              left: rect.left, right: rect.right,
              topRoom: Math.min(...cards.map((card) => card.top - rect.top)),
              bottomRoom: Math.min(...cards.map((card) => rect.bottom - card.bottom)),
              lastRight: cards.at(-1)!.right,
              pageOverflow: document.documentElement.scrollWidth > window.innerWidth,
            };
          });
          const label = `${width}px / ${reducedMotion}`;
          const initial = await measure();
          assert.ok(Math.abs(initial.left) <= 1 && Math.abs(initial.right - width) <= 1,
            `${label}: rail must reach viewport edges, got ${initial.left}..${initial.right}`);
          assert.ok(initial.topRoom >= 4 && initial.bottomRoom >= 24,
            `${label}: cards and shadows must fit vertically: ${JSON.stringify(initial)}`);
          assert.equal(initial.pageOverflow, false, `${label}: no horizontal page overflow`);
          await rail.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
          await page.waitForTimeout(100);
          const end = await measure();
          assert.ok(end.lastRight <= width - 15 && end.lastRight >= 270,
            `${label}: last card must be fully reachable: ${end.lastRight}`);
          if (width >= 1280) {
            const right = page.getByRole('button', { name: 'Прокрутить проекты вправо' });
            assert.equal(await right.isDisabled(), true, `${label}: right arrow disabled at end`);
            await page.getByRole('button', { name: 'Прокрутить проекты влево' }).click();
            await page.waitForTimeout(500);
            assert.ok(await rail.evaluate((element) => element.scrollLeft < element.scrollWidth - element.clientWidth - 1),
              `${label}: left arrow scrolls back`);
            await page.getByRole('heading', { name: 'Где работал', exact: true }).hover();
            await page.waitForTimeout(800);
            assert.equal(await rail.evaluate((element) => element.scrollLeft), 0, `${label}: fan resets on exit`);
          }
          console.log(`project rail OK: ${label}`);
        } finally {
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
