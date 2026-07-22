import assert from 'node:assert/strict';

import { chromium } from 'playwright';

const appUrl = process.env.RUNTIME_SMOKE_URL ?? 'http://127.0.0.1:3138';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

  await page.goto(`${appUrl}/?reset=1`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Андрей Макаревич' }).waitFor({ timeout: 15_000 });

  const responses: Array<{ viewType: string; selectedCase: string | null; answerType: string | null; used: number }> = [];
  page.on('response', async (response) => {
    if (!response.url().includes('/api/chat')) return;
    try {
      const body = await response.json();
      responses.push({
        viewType: body.viewType,
        selectedCase: body.selectedContext?.id ?? null,
        answerType: body.meta?.answerType ?? null,
        used: body.meta?.userMessagesUsed ?? -1,
      });
    } catch {
      // Ignore non-JSON responses; the request assertion below will catch failures.
    }
  });

  const send = async (text: string) => {
    const textarea = page.locator('textarea').last();
    await textarea.fill(text);
    const responseCount = responses.length;
    await page.getByRole('button', { name: 'Отправить' }).click();
    await page.waitForFunction((count) => document.body.innerText.length > 0 && count < 1000, responseCount);
    await page.waitForTimeout(900);
    assert.ok(responses.length > responseCount, `No API response captured for: ${text}`);
    return responses.at(-1)!;
  };

  await page.getByRole('button', { name: /Альфа-смарт подписка на банковские продукты/i }).first().click();
  await page.waitForTimeout(700);
  const alfaSummary = await send('Коротко расскажи об этом кейсе');
  assert.equal(alfaSummary.selectedCase, 'alfa-smart');
  assert.equal(alfaSummary.answerType, 'case_summary');

  const globalCompact = await send('Расскажи емко про Андрея');
  assert.equal(globalCompact.answerType, 'candidate_positioning');

  const fastReview = await send('Быстро оценить Андрея по кейсам');
  assert.equal(fastReview.viewType, 'candidate_fast_review');

  const rail = page.locator('aside').first();
  await rail.getByRole('button', { name: /SIEBEL/i }).click();
  await page.waitForTimeout(700);
  const siebelSummary = await send('Коротко расскажи об этом кейсе');
  assert.equal(siebelSummary.selectedCase, 'siebel');
  assert.equal(siebelSummary.answerType, 'case_summary');

  const research = await send('Емко: как Андрей исследовал проблему?');
  assert.equal(research.selectedCase, 'siebel');
  assert.equal(research.answerType, 'decision_breakdown');

  await rail.getByRole('button', { name: /ChatPoint/i }).click();
  await page.waitForTimeout(700);
  const risk = await send('Коротко: какую ошибку совершили?');
  assert.equal(risk.selectedCase, 'chatpoint');
  assert.equal(risk.answerType, 'risk_assessment');

  const gratitudeBefore = responses.at(-1)!.used;
  const gratitude = await send('Спасибо тебе большое!');
  assert.equal(gratitude.viewType, 'general_synthesis');
  assert.equal(gratitude.answerType, null);
  assert.equal(gratitude.used, gratitudeBefore, 'gratitude must not consume a message');

  const evidence = await send('Спасибо, а где доказательства?');
  assert.equal(evidence.viewType, 'general_synthesis');
  assert.equal(evidence.answerType, 'proof_map');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);
  const restored = await send('Коротко расскажи об этом кейсе');
  assert.equal(restored.selectedCase, 'chatpoint', 'reload must preserve the active case session');
  assert.equal(restored.answerType, 'case_summary');

  await browser.close();
  console.log('Assistant browser acceptance flow passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
