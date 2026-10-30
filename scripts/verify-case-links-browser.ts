import assert from 'node:assert/strict';
import { chromium, type Page } from 'playwright';
import { CASE_IDS } from '../src/data/portfolio-index';

const base = process.env.PROJECT_RAIL_URL ?? 'http://127.0.0.1:3000';
const storageKey = 'ai-portfolio-context-threads-v2';
const visibleCase = (page: Page, id: string) => page.locator(`[id="${id}-at-a-glance-title"]`).waitFor({ state: 'visible', timeout: 15000 });
const urlIs = (page: Page, url: string | RegExp) => page.waitForURL(url, { timeout: 15000 });
const storedCaseIs = (page: Page, id: string) => page.waitForFunction(
  ({ key, id }) => JSON.parse(localStorage.getItem(key) ?? '{}').activeContextId === `case:${id}`,
  { key: storageKey, id },
);

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [375, 1440]) {
      for (const id of CASE_IDS) {
        const context = await browser.newContext({ viewport: { width, height: 1000 } });
        try {
          let chatCalls = 0;
          await context.route('**/api/chat', (route) => { chatCalls++; return route.abort(); });
          const page = await context.newPage();
          await page.goto(`${base}/?case=${id}`);
          await visibleCase(page, id);
          await page.reload();
          await visibleCase(page, id);
          assert.equal(chatCalls, 0, 'Browsing a case must not call chat');
          if (width === 1440) {
            const cv = page.getByRole('link', { name: 'Скачать CV', exact: true });
            await cv.waitFor({ state: 'visible' });
            assert.equal(await cv.getAttribute('download'), '');
            if (id === 'siebel') {
              await page.waitForFunction(() => [...document.images].filter((image) => {
                const rect = image.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0 && rect.top < innerHeight && rect.bottom > 0;
              }).every((image) => image.complete && image.naturalWidth > 0));
              await page.waitForTimeout(400);
              await page.screenshot({ path: '/tmp/portfolio-case-links-siebel.png' });
            }
          }
          console.log(`case URL OK: ${id} / ${width}px`);
        } finally { await context.close(); }
      }
    }
    const safetyContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    try {
      const page = await safetyContext.newPage();
      const calls: { input: { type: string; action?: { caseId?: string } } }[] = [];
      await page.route('**/api/chat', (route) => {
        calls.push(route.request().postDataJSON());
        return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ code: 'SESSION_STORE_UNAVAILABLE' }) });
      });
      await page.goto(`${base}/?case=siebel`);
      await visibleCase(page, 'siebel');
      await page.locator('textarea').fill('Коротко расскажи о кейсе');
      await page.getByRole('button', { name: 'Отправить', exact: true }).click();
      await page.getByText('Сессия ассистента временно недоступна. Повторите попытку.', { exact: true }).waitFor({ state: 'visible' });
      assert.equal(calls.length, 1);
      assert.equal(calls[0].input.type, 'action');
      assert.equal(calls[0].input.action?.caseId, 'siebel', 'First question must sync the linked case, not entry');
      assert.equal(new URL(page.url()).searchParams.get('case'), 'siebel');
      assert.equal(await page.locator('#siebel-at-a-glance-title').count(), 1);
      await page.getByRole('button', { name: 'Повторить', exact: true }).waitFor({ state: 'visible' });
      console.log('Linked-case first-question sync and 503 retry passed.');
    } finally { await safetyContext.close(); }

    const raceContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    try {
      const page = await raceContext.newPage();
      await page.goto(`${base}/`);
      await page.getByRole('heading', { name: 'Кейсы', exact: true }).waitFor({ state: 'visible' });
      await page.route('**/*.js', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        await route.continue();
      });
      await page.getByRole('button', { name: 'Открыть кейс: SIEBEL', exact: true }).click();
      await page.getByRole('button', { name: 'Вернуться на главную', exact: true }).click();
      await page.waitForTimeout(1200);
      await page.getByRole('heading', { name: 'Кейсы', exact: true }).waitFor({ state: 'visible' });
      assert.equal(new URL(page.url()).searchParams.has('case'), false);
      console.log('Late case load cannot reopen workspace after home.');
    } finally { await raceContext.close(); }

    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    try {
      const page = await context.newPage();
      await page.goto(`${base}/`);
      await page.getByRole('button', { name: 'Открыть кейс: Альфа-Смарт', exact: true }).click();
      await urlIs(page, /\?case=alfa-smart$/);
      await visibleCase(page, 'alfa-smart');
      await page.getByRole('button', { name: 'SIEBEL CRM для службы поддержки', exact: true }).click();
      await urlIs(page, /\?case=siebel$/);
      await visibleCase(page, 'siebel');
      await page.goBack();
      await visibleCase(page, 'alfa-smart');
      await page.goForward();
      await visibleCase(page, 'siebel');
      await page.getByRole('button', { name: 'Вернуться на главную', exact: true }).click();
      await urlIs(page, `${base}/`);
      await page.getByRole('heading', { name: 'Кейсы', exact: true }).waitFor({ state: 'visible' });
      await page.goBack();
      await visibleCase(page, 'siebel');
      await storedCaseIs(page, 'siebel');
      const before = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey);
      await page.goto(`${base}/?case=alfa-smart&utm_source=test#work`);
      await visibleCase(page, 'alfa-smart');
      await storedCaseIs(page, 'alfa-smart');
      const after = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey);
      const withoutAnimation = (items: Record<string, unknown>[]) => items.map((item) => ({ ...item, hasAnimated: undefined }));
      assert.deepEqual(withoutAnimation(after.threadsByContextId['case:siebel'].items), withoutAnimation(before.threadsByContextId['case:siebel'].items));
      assert.deepEqual(after.sessionMeta, before.sessionMeta);
      assert.equal(after.sessionId, before.sessionId);
      // After a popstate replay, subsequent clicks must still PUSH, not replace history.
      await page.getByRole('button', { name: 'ChatPoint Платформа для коммуникации', exact: true }).click();
      await visibleCase(page, 'chatpoint');
      await urlIs(page, /case=chatpoint/);
      assert.ok(page.url().includes('utm_source=test') && page.url().endsWith('#work'));
      await page.goBack();
      await visibleCase(page, 'alfa-smart');
      await page.getByRole('button', { name: 'SIEBEL CRM для службы поддержки', exact: true }).click();
      await visibleCase(page, 'siebel');
      await page.goBack();
      await visibleCase(page, 'alfa-smart');
      await page.goForward();
      await visibleCase(page, 'siebel');
      for (const query of ['case=unknown', 'case=siebel&case=chatpoint']) {
        await page.goto(`${base}/?${query}`);
        await page.getByRole('heading', { name: 'Кейсы', exact: true }).waitFor({ state: 'visible' });
        await urlIs(page, `${base}/`);
      }
      await page.goto(`${base}/?reset=1&case=chatpoint`);
      await visibleCase(page, 'chatpoint');
      await storedCaseIs(page, 'chatpoint');
      assert.equal(new URL(page.url()).searchParams.has('reset'), false);
      const reset = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey);
      assert.equal(reset.sessionMeta.used, 0);
      assert.equal(reset.threadsByContextId['case:siebel'], undefined);
      const pdf = await context.request.get(`${base}/cv/andrey-makarevich-product-designer.pdf`);
      assert.ok(pdf.ok());
      assert.equal((await pdf.body()).subarray(0, 5).toString(), '%PDF-');
      console.log('History, storage override, invalid links and CV download passed.');
    } finally { await context.close(); }
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
