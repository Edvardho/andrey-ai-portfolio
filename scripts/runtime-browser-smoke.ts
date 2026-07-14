import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 3137;
const DEFAULT_EXISTING_SERVER_URL = 'http://localhost:3000';
const FALLBACK_DEV_SERVER_URL =
  `http://${process.env.RUNTIME_SMOKE_HOST ?? DEFAULT_HOST}:${process.env.RUNTIME_SMOKE_PORT ?? DEFAULT_PORT}`;
const STARTUP_TIMEOUT_MS = 60_000;
const INTERACTION_SETTLE_MS = 240;
const FRAMEWORK_OVERLAY_PATTERNS = [
  /Runtime Error/i,
  /Unhandled Runtime Error/i,
  /Maximum update depth exceeded/i,
  /Application error/i,
  /Build Error/i,
  /Hydration failed/i,
];

type Browser = import('playwright').Browser;
type ConsoleMessage = import('playwright').ConsoleMessage;
type Page = import('playwright').Page;

type RuntimeSmokeState = {
  consoleErrors: string[];
  pageErrors: string[];
  ignoredConsoleErrorPatterns: RegExp[];
};

function createRuntimeSmokeState(ignoredConsoleErrorPatterns: RegExp[] = []): RuntimeSmokeState {
  return {
    consoleErrors: [],
    pageErrors: [],
    ignoredConsoleErrorPatterns,
  };
}

function formatConsoleMessage(message: ConsoleMessage) {
  return `[${message.type()}] ${message.text()}`;
}

async function waitForServer(url: string, timeoutMs = STARTUP_TIMEOUT_MS) {
  const startedAt = Date.now();
  let lastError: unknown = null;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { cache: 'no-store' });

      if (response.ok || response.status < 500) {
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await delay(500);
  }

  throw new Error(`Runtime smoke server did not become ready at ${url}. Last error: ${String(lastError)}`);
}

async function canReachServer(url: string) {
  try {
    await waitForServer(url, 2_000);
    return true;
  } catch {
    return false;
  }
}

function startDevServer() {
  const port = process.env.RUNTIME_SMOKE_PORT ?? String(DEFAULT_PORT);
  const host = process.env.RUNTIME_SMOKE_HOST ?? DEFAULT_HOST;

  return spawn(
    'npm',
    ['run', 'dev', '--', '--hostname', host, '--port', port],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
}

async function stopDevServer(server: ChildProcess | null) {
  if (!server || server.killed) {
    return;
  }

  server.kill('SIGTERM');
  await Promise.race([
    new Promise<void>((resolve) => {
      server.once('exit', () => resolve());
    }),
    delay(2_000).then(() => {
      if (!server.killed) {
        server.kill('SIGKILL');
      }
    }),
  ]);
}

async function assertHealthy(page: Page, state: RuntimeSmokeState, step: string) {
  await page.waitForLoadState('domcontentloaded');

  const bodyText = await page.locator('body').innerText({ timeout: 8_000 });
  assert.ok(bodyText.trim().length > 0, `Blank page after ${step}`);

  const matchedOverlay = FRAMEWORK_OVERLAY_PATTERNS.find((pattern) => pattern.test(bodyText));
  assert.equal(
    matchedOverlay,
    undefined,
    `Framework/runtime overlay detected after ${step}: ${matchedOverlay?.toString()}`,
  );

  const nextPortalText = await page
    .locator('nextjs-portal')
    .evaluateAll((elements) => elements.map((element) => element.textContent ?? '').join('\n'))
    .catch(() => '');
  const matchedPortalOverlay = FRAMEWORK_OVERLAY_PATTERNS.find((pattern) => pattern.test(nextPortalText));
  assert.equal(
    matchedPortalOverlay,
    undefined,
    `Next.js runtime overlay text detected after ${step}: ${matchedPortalOverlay?.toString()}`,
  );

  assert.deepEqual(state.pageErrors, [], `Page errors after ${step}:\n${state.pageErrors.join('\n')}`);
  assert.deepEqual(state.consoleErrors, [], `Console errors after ${step}:\n${state.consoleErrors.join('\n')}`);
}

function getRail(page: Page) {
  return page.locator('aside').first();
}

function getEntryAlfaCard(page: Page) {
  return page.getByRole('button', { name: /Альфа-смарт подписка на банковские продукты/i }).first();
}

async function clickRailCase(page: Page, label: string) {
  const button = getRail(page).getByRole('button', { name: new RegExp(label, 'i') });
  await button.waitFor({ state: 'visible', timeout: 8_000 });
  await button.click();
  await delay(INTERACTION_SETTLE_MS);
}

function resetRuntimeSmokeState(state: RuntimeSmokeState, ignoredConsoleErrorPatterns: RegExp[] = []) {
  state.consoleErrors = [];
  state.pageErrors = [];
  state.ignoredConsoleErrorPatterns = ignoredConsoleErrorPatterns;
}

function collectRuntimeErrors(page: Page, state: RuntimeSmokeState) {
  page.on('console', (message) => {
    if (message.type() === 'error') {
      const formatted = formatConsoleMessage(message);
      if (state.ignoredConsoleErrorPatterns.some((pattern) => pattern.test(formatted))) {
        return;
      }

      state.consoleErrors.push(formatted);
    }
  });
  page.on('pageerror', (error) => {
    state.pageErrors.push(error.stack ?? error.message);
  });
}

async function clearBrowserStorageBeforeNavigation(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

async function expectButtonBackground(
  button: import('playwright').Locator,
  expected: string,
  step: string,
) {
  const background = await button.evaluate((element) => getComputedStyle(element).backgroundColor);
  assert.equal(background, expected, `${step}: unexpected button background`);
}

async function assertComposerStates(page: Page) {
  const textarea = page.locator('textarea').last();
  await textarea.waitFor({ state: 'visible', timeout: 8_000 });
  const composer = textarea.locator('xpath=ancestor::form').getByRole('button', { name: 'Отправить' });
  await composer.waitFor({ state: 'visible', timeout: 8_000 });
  await textarea.fill('');
  await delay(200);
  assert.equal(await composer.isDisabled(), true, 'Composer must be disabled without text');
  await expectButtonBackground(composer, 'rgb(166, 166, 166)', 'inactive composer');

  await textarea.fill('Кто такой Андрей?');
  await delay(200);
  assert.equal(await composer.isDisabled(), false, 'Composer must become active after text input');
  await expectButtonBackground(composer, 'rgb(26, 28, 34)', 'active composer');

  const iconColor = await composer.locator('svg').evaluate((element) => getComputedStyle(element).color);
  assert.equal(iconColor, 'rgb(255, 255, 255)', 'Active composer arrow must stay white');
  await textarea.fill('');
}

async function main() {
  let server: ChildProcess | null = null;
  let browser: Browser | null = null;
  let appUrl = process.env.RUNTIME_SMOKE_URL ?? DEFAULT_EXISTING_SERVER_URL;
  const state = createRuntimeSmokeState();

  try {
    if (!process.env.RUNTIME_SMOKE_URL && !(await canReachServer(appUrl))) {
      server = startDevServer();
      server.stdout?.on('data', () => undefined);
      server.stderr?.on('data', () => undefined);
      appUrl = FALLBACK_DEV_SERVER_URL;
    }

    await waitForServer(appUrl);

    const { chromium } = await import('playwright');
    browser = await chromium.launch({ args: ['--single-process'] });

    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    collectRuntimeErrors(page, state);
    await clearBrowserStorageBeforeNavigation(page);

    resetRuntimeSmokeState(state, [/Failed to load resource:.*500/i]);
    await page.route('**/api/assistant/bootstrap**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Forced runtime smoke bootstrap failure' }),
      });
    });
    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
    await getEntryAlfaCard(page).waitFor({ state: 'visible', timeout: 15_000 });
    await assertHealthy(page, state, 'bootstrap fallback after forced 500');

    await page.unroute('**/api/assistant/bootstrap**');
    resetRuntimeSmokeState(state);

    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Андрей Макаревич' }).waitFor({ state: 'visible', timeout: 15_000 });
    await assertHealthy(page, state, 'initial landing load');
    await assertComposerStates(page);

    await getEntryAlfaCard(page).click();
    await page.getByText('ИИ ассистент').first().waitFor({ state: 'visible', timeout: 15_000 });
    await assertHealthy(page, state, 'landing case click');

    await page.getByRole('button', { name: 'Вернуться на главную' }).click();
    await getEntryAlfaCard(page).waitFor({
      state: 'visible',
      timeout: 8_000,
    });
    await assertHealthy(page, state, 'header return to landing');

    await getEntryAlfaCard(page).click();
    await page.getByText('ИИ ассистент').first().waitFor({ state: 'visible', timeout: 8_000 });

    const switchSequence = [
      'ChatPoint',
      'SIEBEL',
      'Расходы держателей',
      'Шаринг подписки',
      'UX/UI WannabeLike',
      'Альфа-Смарт',
      'ChatPoint',
      'SIEBEL',
      'Альфа-Смарт',
    ];

    for (const label of switchSequence) {
      await clickRailCase(page, label);
      await assertHealthy(page, state, `rail switch to ${label}`);
    }

    await page.getByRole('button', { name: /Написать мне/i }).click();
    await page.getByText('Выберите удобный способ связи с Андреем').waitFor({
      state: 'visible',
      timeout: 8_000,
    });
    await assertHealthy(page, state, 'contact modal open');
    await page.getByRole('button', { name: 'Закрыть' }).last().click();
    await page.getByText('Выберите удобный способ связи с Андреем').waitFor({
      state: 'hidden',
      timeout: 8_000,
    });
    await assertHealthy(page, state, 'contact modal close');

    await page.getByRole('button', { name: /Лендинг подписки/i }).first().click();
    await page.getByRole('button', { name: 'Закрыть' }).last().waitFor({
      state: 'visible',
      timeout: 8_000,
    });
    await assertHealthy(page, state, 'artifact modal open');
    await page.keyboard.press('Escape');
    await delay(INTERACTION_SETTLE_MS);
    await assertHealthy(page, state, 'artifact modal escape close');

    await page.addInitScript({
      content: `
        Object.defineProperty(Storage.prototype, 'setItem', {
          configurable: true,
          value: function () {
            throw new DOMException('Forced runtime smoke storage write failure', 'QuotaExceededError');
          },
        });
      `,
    });
    resetRuntimeSmokeState(state);
    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
    await page
      .getByRole('button', { name: /Альфа-смарт подписка на банковские продукты/i })
      .waitFor({ state: 'visible', timeout: 15_000 });
    await assertHealthy(page, state, 'landing with storage write failure');
    await page.getByRole('button', { name: /Альфа-смарт подписка на банковские продукты/i }).click();
    await page.getByText('ИИ ассистент').waitFor({ state: 'visible', timeout: 15_000 });
    await assertHealthy(page, state, 'case click with storage write failure');

    console.log('Runtime browser smoke passed.');
  } finally {
    if (browser) {
      await browser.close();
    }
    await stopDevServer(server);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
