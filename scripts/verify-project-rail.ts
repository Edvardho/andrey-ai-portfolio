import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Run against a local dev/production server; no assistant/model requests are needed.
async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const reducedMotion of ['no-preference', 'reduce'] as const) {
      for (const width of [375, 768, 1024, 1280, 1428, 1440, 1441, 1600, 1920, 2048]) {
        const page = await browser.newPage({ viewport: { width, height: 1200 }, reducedMotion });
        try {
          await page.goto(process.env.PROJECT_RAIL_URL ?? 'http://127.0.0.1:3000');
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(800);
          const cardEdges = () => page.locator('.portfolio-landing-project-card-wrap button').evaluateAll((cards) => {
            const rects = cards.map((card) => card.getBoundingClientRect());
            return { first: rects[0].left, last: rects.at(-1)!.right };
          });
          const collapsed = await cardEdges();
          const fanTransforms = () => page.locator('.portfolio-landing-project-card-wrap')
            .evaluateAll((cards) => cards.map((card) => getComputedStyle(card).transform));
          const collapsedTransforms = await fanTransforms();
          const controls = page.locator('.portfolio-landing-project-controls');
          await page.getByRole('heading', { name: 'Кейсы', exact: true }).hover();
          await page.waitForTimeout(800);
          const expanded = await cardEdges();
          const hasOverflow = await page.locator('.portfolio-landing-project-rail')
            .evaluate((rail) => rail.scrollWidth > rail.clientWidth + 1);
          assert.equal(await controls.isVisible(), width >= 768 && hasOverflow,
            `${width}px: arrows follow actual expanded-row overflow`);
          if (width === 1600 && reducedMotion === 'no-preference') {
            await page.screenshot({ path: '/tmp/portfolio-rail-overflow-controls.png' });
          }
          if (width >= 1920) {
            assert.ok(Math.abs(expanded.first - (width - expanded.last)) <= 1,
              `${width}px: expanded row must be centered: ${JSON.stringify(expanded)}`);
            assert.ok(expanded.first >= 24 && expanded.last <= width - 24,
              `${width}px: all six cards must fit`);
            if (reducedMotion === 'no-preference') {
              assert.ok(expanded.first < collapsed.first - 100 && expanded.last > collapsed.last + 100,
                `${width}px: fan must expand both left and right`);
            }
          }
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
          if (width >= 1280 && await rail.evaluate((element) => element.scrollWidth > element.clientWidth + 1)) {
            const right = page.getByRole('button', { name: 'Прокрутить проекты вправо' });
            assert.equal(await right.isDisabled(), true, `${label}: right arrow disabled at end`);
            await page.getByRole('button', { name: 'Прокрутить проекты влево' }).click();
            await page.waitForTimeout(500);
            assert.ok(await rail.evaluate((element) => element.scrollLeft < element.scrollWidth - element.clientWidth - 1),
              `${label}: left arrow scrolls back`);
          }
          if (width >= 1280) {
            await page.getByRole('heading', { name: 'Где работал', exact: true }).hover();
            await page.waitForTimeout(800);
            assert.equal(await rail.evaluate((element) => element.scrollLeft), 0, `${label}: fan resets on exit`);
            if (width >= 1920 && reducedMotion === 'no-preference') {
              // Larger test text changes rotated bounding boxes, not the fan transforms.
              assert.deepEqual(await fanTransforms(), collapsedTransforms,
                `${label}: fan returns to its original transforms`);
            }
          }
          console.log(`project rail OK: ${label}`);
        } finally {
          await page.close();
        }
      }
    }
    // Resize an already mounted/expanded row: no reload or hover reset required.
    const page = await browser.newPage({ viewport: { width: 1920, height: 1200 } });
    try {
      await page.goto(process.env.PROJECT_RAIL_URL ?? 'http://127.0.0.1:3000');
      await page.getByRole('heading', { name: 'Кейсы', exact: true }).hover();
      await page.waitForTimeout(800);
      const controls = page.locator('.portfolio-landing-project-controls');
      assert.equal(await controls.isVisible(), false);
      await page.setViewportSize({ width: 1600, height: 1200 });
      await page.waitForTimeout(800);
      assert.equal(await controls.isVisible(), true, 'Resize must reveal controls when row overflows');
      await page.setViewportSize({ width: 1920, height: 1200 });
      await page.waitForTimeout(800);
      assert.equal(await controls.isVisible(), false, 'Resize must hide controls when row fits');
      console.log('project rail live resize OK');
    } finally { await page.close(); }
  } finally {
    await browser.close();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
