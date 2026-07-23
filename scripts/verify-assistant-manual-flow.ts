import assert from 'node:assert/strict';

import { chromium } from 'playwright';

const appUrl = process.env.RUNTIME_SMOKE_URL ?? 'http://127.0.0.1:3138';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

  await page.goto(`${appUrl}/?reset=1`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Андрей Макаревич' }).waitFor({ timeout: 15_000 });

  const responses: Array<{ viewType: string; selectedCase: string | null; answerType: string | null; used: number }> = [];
  let pendingChatRequests = 0;
  page.on('request', (request) => {
    if (request.url().includes('/api/chat')) pendingChatRequests += 1;
  });
  page.on('requestfinished', (request) => {
    if (request.url().includes('/api/chat')) pendingChatRequests -= 1;
  });
  page.on('requestfailed', (request) => {
    if (request.url().includes('/api/chat')) pendingChatRequests -= 1;
  });
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
    await page.waitForTimeout(100);
    const sendButton = page.getByRole('button', { name: 'Отправить' });
    assert.equal(await sendButton.isEnabled(), true, `Send button must be enabled for: ${text}`);
    const responseCount = responses.length;
    await sendButton.click();
    const deadline = Date.now() + 15_000;
    let idleSince: number | null = null;
    while (Date.now() < deadline) {
      if (responses.length > responseCount && pendingChatRequests === 0) {
        idleSince ??= Date.now();
        if (Date.now() - idleSince >= 400) break;
      } else {
        idleSince = null;
      }
      await page.waitForTimeout(100);
    }
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

  await rail.getByRole('button', { name: /SIEBEL/i }).click();
  await page.waitForTimeout(700);
  const ambiguous = await send('Емко расскажи о том, что ты умеешь');
  assert.equal(ambiguous.selectedCase, null, 'the recovery fixture must end with a contextless reply');

  await page.evaluate((unknownSessionId) => {
    const storageKey = 'ai-portfolio-context-threads-v2';
    const raw = globalThis.localStorage.getItem(storageKey);
    if (!raw) {
      throw new Error('persisted thread state must exist before simulating a lost server session');
    }
    const persisted = JSON.parse(raw);
    persisted.sessionId = unknownSessionId;
    globalThis.localStorage.setItem(storageKey, JSON.stringify(persisted));
  }, `unknown-server-session-${Date.now()}`);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);
  const recoveryResponseCount = responses.length;
  const recoveredSiebel = await send('Емко расскажи о кейсе');
  const recoveryResponses = responses.slice(recoveryResponseCount);
  assert.equal(recoveredSiebel.selectedCase, 'siebel', 'recovered UI state must resync SIEBEL before the message');
  assert.equal(recoveredSiebel.answerType, 'case_summary', 'compact SIEBEL wording must return a case summary');
  assert.ok(recoveryResponses.length >= 2, 'recovery must issue a context sync action before the message');
  assert.equal(recoveryResponses.at(-2)?.selectedCase, 'siebel', 'sync action must restore SIEBEL on the server');

  await browser.close();
  console.log('Assistant browser acceptance flow passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
