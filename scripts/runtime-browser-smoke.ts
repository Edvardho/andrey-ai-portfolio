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
  return page.getByRole('button', { name: /Открыть кейс: Альфа-Смарт/i }).first();
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

async function assertLandingState(page: Page) {
  await page.getByRole('heading', { name: 'Андрей Макаревич' }).waitFor({ state: 'visible', timeout: 8_000 });
  await page.getByRole('heading', { name: 'Где работал' }).waitFor({ state: 'visible', timeout: 8_000 });
  await page.getByRole('heading', { name: 'Кейсы' }).waitFor({ state: 'visible', timeout: 8_000 });
  assert.equal(await page.locator('textarea').count(), 0, 'Landing must not render the AI composer');
  assert.equal(await page.getByText('AI products').count(), 0, 'Landing must not render AI metadata');
  const landingCv = page.getByRole('link', { name: /Скачать CV/i });
  assert.equal(await landingCv.getAttribute('href'), '/cv/andrey-makarevich-product-designer.pdf', 'Landing CV must point to the supplied PDF');
  assert.notEqual(await landingCv.getAttribute('download'), null, 'Landing CV must download the supplied PDF');
  assert.equal(await page.getByRole('button', { name: /Открыть кейс:/i }).count(), 6, 'Landing must render six project cards');
}

async function assertDesktopProjectInteraction(page: Page) {
  const projects = page.getByRole('heading', { name: 'Кейсы' });
  await projects.hover();
  await delay(450);
  const section = projects.locator('xpath=ancestor::section');
  assert.ok(await section.evaluate((element) => element.classList.contains('is-expanded')), 'Project fan must expand on hover');
  const rightArrow = page.getByRole('button', { name: 'Прокрутить проекты вправо' });
  assert.equal(await rightArrow.isDisabled(), false, 'Right project arrow must be enabled after expanding the fan');
  await rightArrow.click();
  await delay(300);
}

async function assertEditorialCaseEntry(page: Page, expectedUserBubbleCount = 0) {
  const threadItems = page.locator('[data-thread-item-kind]');
  await threadItems.first().waitFor({ state: 'visible', timeout: 12_000 });
  const firstThreadItem = threadItems.first();
  assert.equal(
    await firstThreadItem.getAttribute('data-thread-item-kind'),
    'assistant',
    'A direct case entry must start with authored case content',
  );
  assert.equal(
    await page.locator('[data-thread-item-kind="user"]').count(),
    expectedUserBubbleCount,
    'A case entry must preserve only real user bubbles from its conversation history',
  );
  assert.equal(
    await firstThreadItem.getByText('ИИ ассистент', { exact: true }).count(),
    0,
    'A direct case entry must not render the assistant identity header',
  );
}

async function assertDesktopArtifactRailsEndAtVisibleEdge(page: Page) {
  const rails = page.locator('.portfolio-case-collection-scroll-viewport');
  await rails.first().waitFor({ state: 'visible', timeout: 8_000 });

  const measurements = await rails.evaluateAll((viewports) => viewports.map((viewport) => {
    const content = viewport.querySelector('.portfolio-case-collection-scroll-content');
    const row = content?.firstElementChild?.firstElementChild;
    const lastCard = row?.lastElementChild;
    if (!lastCard) return null;

    viewport.scrollLeft = viewport.scrollWidth;

    let visibleRight = Math.min(viewport.getBoundingClientRect().right, window.innerWidth);
    for (let parent = viewport.parentElement; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (style.overflowX !== 'visible') {
        visibleRight = Math.min(visibleRight, parent.getBoundingClientRect().right);
      }
    }

    return {
      scrollable: viewport.scrollWidth > viewport.clientWidth,
      trailingSpace: visibleRight - lastCard.getBoundingClientRect().right,
    };
  }));

  assert.ok(measurements.length > 0, 'Case entry must render at least one desktop artifact rail');
  for (const measurement of measurements) {
    assert.ok(measurement, 'Artifact rail must render a final card');
    assert.equal(measurement.scrollable, true, 'Artifact rail must preserve horizontal scrolling');
    assert.ok(
      Math.abs(measurement.trailingSpace - 16) <= 2,
      `Last artifact card must end 16px before the visible column edge; received ${measurement.trailingSpace}px`,
    );
  }
}

async function assertCompactWorkspace(page: Page, expectedTitle: string) {
  await page.getByRole('button', { name: 'Открыть мои проекты' }).waitFor({ state: 'visible', timeout: 12_000 });
  await page.locator('header').getByText(expectedTitle, { exact: true }).waitFor({ state: 'visible', timeout: 8_000 });
  await assertEditorialCaseEntry(page);
  assert.equal(await page.getByText('Доступна только десктоп-версия').count(), 0, 'Compact workspace must replace the blocker');
  assert.equal(await page.locator('.portfolio-compact-workspace').count(), 1, 'Exactly one compact workspace must render');
  assert.equal(await page.locator('.portfolio-desktop-stage').count(), 0, 'Desktop workspace must not render in compact mode');
  assert.equal(await page.locator('textarea:visible').count(), 1, 'Compact workspace must render one composer');
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    false,
    'Compact workspace must not create document overflow',
  );
}

async function assertCompactCollapsedDisclosureGeometry(page: Page) {
  const section = page
    .getByRole('heading', { name: 'Что делал Андрей', exact: true })
    .locator('xpath=ancestor::section');
  const rows = section.locator('button[aria-expanded="false"]');
  await rows.first().waitFor({ state: 'visible', timeout: 8_000 });

  const measurements = await rows.evaluateAll((elements) => elements.map((element, index) => {
    const label = element.querySelector('p');
    const chevronControl = element.lastElementChild;
    const previous = index > 0 ? elements[index - 1] : null;
    const previousBottom = previous?.getBoundingClientRect().bottom ?? null;

    return {
      height: element.getBoundingClientRect().height,
      gap: previousBottom === null ? null : element.getBoundingClientRect().top - previousBottom,
      chevronWidth: chevronControl?.getBoundingClientRect().width,
      labelPaddingTop: label ? getComputedStyle(label).paddingTop : null,
      labelPaddingBottom: label ? getComputedStyle(label).paddingBottom : null,
    };
  }));

  assert.ok(measurements.length > 1, 'Compact case entry must render multiple collapsed disclosure rows');
  for (const [index, measurement] of measurements.entries()) {
    assert.ok(measurement.height >= 32, `Compact disclosure ${index + 1} must preserve the 32px Figma baseline`);
    assert.equal(measurement.chevronWidth, 32, `Compact disclosure ${index + 1} must use a 32px chevron control`);
    assert.equal(measurement.labelPaddingTop, '0px', `Compact disclosure ${index + 1} label must not add vertical padding`);
    assert.equal(measurement.labelPaddingBottom, '0px', `Compact disclosure ${index + 1} label must not add vertical padding`);
    if (index > 0) {
      assert.equal(measurement.gap, 4, `Compact disclosure ${index + 1} must keep a 4px gap from the prior row`);
    }
  }
}

async function assertCompactExperienceWorkspace(page: Page) {
  await page.getByRole('button', { name: 'Вернуться к списку проектов' }).waitFor({ state: 'visible', timeout: 12_000 });
  await page.locator('header').getByText('Опыт работы', { exact: true }).waitFor({ state: 'visible', timeout: 8_000 });
  assert.equal(await page.locator('.portfolio-compact-workspace').count(), 1, 'Experience must render in the compact workspace');
  assert.equal(await page.locator('.portfolio-desktop-stage').count(), 0, 'Experience must not render the desktop workspace in compact mode');
  assert.equal(await page.getByText('ИИ ассистент', { exact: true }).count(), 0, 'Direct experience must start as authored content');
  await page.getByText('Андрей — product designer с 6 годами опыта в B2B и B2C', { exact: true }).waitFor({ state: 'visible', timeout: 8_000 });
  await page.getByText('Где работал Андрей', { exact: true }).waitFor({ state: 'visible', timeout: 8_000 });
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
    false,
    'Compact experience must not create document overflow',
  );
}

async function assertSubmittedDraftClearsAfterChatFailure(page: Page, state: RuntimeSmokeState) {
  const textarea = page.locator('textarea:visible');
  assert.equal(await textarea.count(), 1, 'Expected one visible chat composer');
  const composer = page.getByRole('button', { name: 'Отправить' });
  assert.equal(await composer.count(), 1, 'Expected one chat submit button');

  await page.route('**/api/chat', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Assistant session temporarily unavailable',
        code: 'SESSION_STORE_UNAVAILABLE',
        retryable: true,
      }),
    });
  });
  resetRuntimeSmokeState(state, [/Failed to load resource:.*503/i]);

  await textarea.fill('Проверка очистки черновика');
  await composer.click();
  await page.getByText('Сессия ассистента временно недоступна. Повторите попытку.').waitFor({
    state: 'visible',
    timeout: 8_000,
  });
  assert.equal(
    await page.locator('[data-thread-item-kind="user"]').count(),
    1,
    'A submitted question must create one real user bubble',
  );
  assert.equal(
    await textarea.inputValue(),
    '',
    'A submitted message must clear from the composer even when the server request fails',
  );
  await page.unroute('**/api/chat');
  resetRuntimeSmokeState(state);
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
    await delay(720);
    await assertHealthy(page, state, 'initial landing load');
    await assertLandingState(page);
    assert.equal(
      await page.locator('.portfolio-landing-tags-track').evaluate((element) => getComputedStyle(element).animationName),
      'none',
      'Landing tags must stay static at 1280px and above',
    );
    assert.equal(
      await page.locator('.portfolio-landing-tags-group:visible').count(),
      1,
      'Desktop landing must render one visible tag group',
    );
    await assertDesktopProjectInteraction(page);

    await getEntryAlfaCard(page).click();
    await assertEditorialCaseEntry(page);
    await delay(720);
    await assertDesktopArtifactRailsEndAtVisibleEdge(page);
    await assertHealthy(page, state, 'landing case click');
    await assertSubmittedDraftClearsAfterChatFailure(page, state);

    await page.getByRole('button', { name: 'Вернуться на главную' }).click();
    await getEntryAlfaCard(page).waitFor({
      state: 'visible',
      timeout: 8_000,
    });
    await assertHealthy(page, state, 'header return to landing');

    await getEntryAlfaCard(page).click();
    await assertEditorialCaseEntry(page, 1);

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
      if (label !== 'Альфа-Смарт') {
        await assertEditorialCaseEntry(page);
      }
      if (await page.locator('.portfolio-case-collection-scroll-viewport').count()) {
        await assertDesktopArtifactRailsEndAtVisibleEdge(page);
      }
      await assertHealthy(page, state, `rail switch to ${label}`);
    }

    await page.getByRole('button', { name: /Написать мне/i }).click();
    await page.getByText('Выберите удобный способ связи с Андреем').waitFor({
      state: 'visible',
      timeout: 8_000,
    });
    assert.equal(
      await page.getByRole('link', { name: /Написать на почту/i }).getAttribute('href'),
      'mailto:andrew.makarevitch@yandex.ru',
      'Contact modal must expose the canonical email address',
    );
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
      .getByRole('button', { name: /Открыть кейс: Альфа-Смарт/i })
      .waitFor({ state: 'visible', timeout: 15_000 });
    await assertHealthy(page, state, 'landing with storage write failure');
    await page.getByRole('button', { name: /Открыть кейс: Альфа-Смарт/i }).click();
    await assertEditorialCaseEntry(page);
    await assertHealthy(page, state, 'case click with storage write failure');

    await page.setViewportSize({ width: 375, height: 812 });
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
    resetRuntimeSmokeState(state, [/Failed to persist ai-portfolio-context-threads-v2/i]);
    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
    await assertLandingState(page);
    assert.equal(
      await page.locator('.portfolio-landing-tags-track').evaluate((element) => getComputedStyle(element).animationName),
      'portfolio-landing-tags-marquee',
      'Landing tags must animate below 1280px',
    );
    assert.equal(
      await page.locator('.portfolio-landing-tags-group:visible').count(),
      3,
      'Compact landing must render enough tag copies for a seamless marquee',
    );
    const tagsBox = await page.locator('.portfolio-landing-tags').boundingBox();
    assert.ok(tagsBox, 'Compact landing tag rail must remain visible');
    assert.equal(Math.round(tagsBox?.x ?? 0), 0, 'Compact landing tag rail must start at the viewport edge');
    assert.equal(Math.round(tagsBox?.width ?? 0), 375, 'Compact landing tag rail must span the viewport width');
    assert.equal(
      await page.locator('.portfolio-landing-tags').evaluate((element) => getComputedStyle(element).paddingLeft),
      '16px',
      'Compact landing tag rail must keep a 16px left inset',
    );
    assert.equal(
      await page.locator('.portfolio-landing-tags').evaluate((element) => getComputedStyle(element).paddingRight),
      '16px',
      'Compact landing tag rail must keep a 16px right inset',
    );
    assert.equal(
      await page.locator('.portfolio-landing-project-card-wrap').first().locator('button > div:last-child p').evaluate(
        (element) => getComputedStyle(element).color,
      ),
      'rgb(48, 49, 58)',
      'Project result text must use the neutral portfolio color',
    );
    const experienceRail = page.locator('.portfolio-landing-experience-rail');
    const experienceRailBox = await experienceRail.boundingBox();
    const experienceItemBoxes = await page.locator('.portfolio-landing-experience-item').evaluateAll((items) =>
      items.map((item) => {
        const rect = item.getBoundingClientRect();
        return { x: Math.round(rect.x), width: Math.round(rect.width), height: Math.round(rect.height) };
      }),
    );
    assert.deepEqual(
      experienceRailBox && { x: Math.round(experienceRailBox.x), width: Math.round(experienceRailBox.width) },
      { x: 0, width: 375 },
      'Mobile experience timeline must expand to the viewport edges',
    );
    assert.deepEqual(
      experienceItemBoxes,
      [
        { x: 16, width: 216, height: 118 },
        { x: 244, width: 216, height: 118 },
        { x: 472, width: 216, height: 118 },
      ],
      'Mobile experience timeline must match the Figma horizontal rail',
    );
    assert.ok(
      await page.evaluate(() => {
        const rail = document.querySelector('.portfolio-landing-project-rail');
        const card = document.querySelector('.portfolio-landing-project-card-wrap button');
        if (!rail || !card) return false;
        return rail.getBoundingClientRect().bottom - card.getBoundingClientRect().bottom >= 24;
      }),
      'Mobile project rail must leave enough room for the card shadow',
    );
    const firstProjectCardBox = await page.locator('.portfolio-landing-project-card-wrap').first().boundingBox();
    assert.ok(firstProjectCardBox, 'First mobile project card must remain visible');
    assert.equal(
      Math.round(firstProjectCardBox?.x ?? 0),
      16,
      'First mobile project card must keep the 16px left inset',
    );
    await page.locator('.portfolio-landing-project-rail').evaluate((rail) => {
      rail.scrollLeft = rail.scrollWidth;
    });
    const finalProjectCard = page.locator('.portfolio-landing-project-card-wrap').last();
    const finalProjectCardBox = await finalProjectCard.boundingBox();
    assert.ok(finalProjectCardBox, 'Last mobile project card must remain visible after horizontal scrolling');
    assert.equal(
      Math.round((finalProjectCardBox?.x ?? 0) + (finalProjectCardBox?.width ?? 0)),
      359,
      'Last mobile project card must keep the 16px right inset',
    );
    assert.equal(await page.getByText('Доступна только десктоп-версия').count(), 0, 'Mobile landing must not show the desktop blocker');
    const contact = page.getByRole('button', { name: 'Написать мне' });
    const landingHeader = page.locator('.portfolio-landing-header');
    const landingHeaderShell = page.locator('.portfolio-landing-header-shell');
    const headerIdentity = landingHeader.locator('> div:first-child');
    const headerShellBox = await landingHeaderShell.boundingBox();
    assert.deepEqual(
      headerShellBox && { x: Math.round(headerShellBox.x), width: Math.round(headerShellBox.width) },
      { x: 0, width: 375 },
      'Mobile sticky header background must cover the full viewport width',
    );
    assert.equal(
      await landingHeaderShell.evaluate((element) => getComputedStyle(element).backgroundColor),
      'rgb(255, 255, 255)',
      'Mobile sticky header must fully cover moving content behind it',
    );
    assert.equal(
      await headerIdentity.evaluate((element) => getComputedStyle(element).alignItems),
      'flex-start',
      'Mobile header identity must align to its left edge',
    );
    assert.equal(
      await headerIdentity.evaluate((element) => getComputedStyle(element).textAlign),
      'left',
      'Mobile header identity text must align left',
    );
    const beforeScroll = await contact.boundingBox();
    const headerBeforeScroll = await landingHeader.boundingBox();
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await delay(120);
    const afterScroll = await contact.boundingBox();
    const headerAfterScroll = await landingHeader.boundingBox();
    assert.ok(beforeScroll && afterScroll, 'Mobile contact CTA must be visible');
    assert.ok(headerBeforeScroll && headerAfterScroll, 'Landing header must stay visible');
    assert.equal(Math.round(beforeScroll?.y ?? 0), Math.round(afterScroll?.y ?? 0), 'Mobile contact CTA must stay fixed while scrolling');
    assert.equal(
      Math.round(headerAfterScroll?.y ?? -1),
      0,
      'Landing header must stay pinned to the top while scrolling',
    );
    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert.equal(overflows, false, 'Mobile landing must not create horizontal page overflow');
    await assertHealthy(page, state, 'mobile landing');

    await getEntryAlfaCard(page).click();
    await assertCompactWorkspace(page, 'Альфа-Смарт');

    const compactDisclosures = page.locator('.portfolio-compact-workspace button[aria-controls*="-panel"]');
    assert.ok(await compactDisclosures.count() >= 2, 'Compact case must render disclosure rows');
    assert.equal(
      await compactDisclosures.evaluateAll((buttons) => buttons.every((button) => button.getAttribute('aria-expanded') === 'false')),
      true,
      'Compact disclosures must be closed initially',
    );
    await compactDisclosures.nth(0).click();
    await compactDisclosures.nth(1).click();
    assert.equal(await compactDisclosures.nth(0).getAttribute('aria-expanded'), 'true');
    assert.equal(await compactDisclosures.nth(1).getAttribute('aria-expanded'), 'true');
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
      false,
      'Expanded compact disclosures and artifact rails must not create document overflow',
    );

    const compactComposer = page.locator('textarea:visible');
    const compactSubmit = page.getByRole('button', { name: 'Отправить' });
    assert.equal(await compactSubmit.isDisabled(), true, 'Compact submit must be disabled for an empty draft');
    await compactComposer.fill('Что было главным результатом?');
    assert.equal(await compactSubmit.isDisabled(), false, 'Compact submit must become ready after text input');
    await compactComposer.fill('');

    await page.getByRole('button', { name: 'Открыть мои проекты' }).click();
    let projectsDrawer = page.getByRole('dialog', { name: 'Мои проекты' });
    await projectsDrawer.waitFor({ state: 'visible', timeout: 8_000 });
    assert.equal(
      await page.evaluate(() => document.activeElement?.getAttribute('aria-label')),
      'Закрыть',
      'Drawer must focus its close button on open',
    );
    await page.keyboard.press('Shift+Tab');
    assert.equal(
      await page.evaluate(() => document.activeElement?.textContent?.trim()),
      'На главную',
      'Drawer header must expose the Figma home action before its close button',
    );
    await page.keyboard.press('Shift+Tab');
    assert.equal(
      await page.evaluate(() => document.activeElement?.textContent?.trim()),
      'Написать мне',
      'Drawer focus trap must wrap backward from its first header action',
    );
    await page.keyboard.press('Tab');
    assert.equal(
      await page.evaluate(() => document.activeElement?.textContent?.trim()),
      'На главную',
      'Drawer focus trap must wrap forward to its first header action',
    );
    await page.keyboard.press('Escape');
    await projectsDrawer.waitFor({ state: 'hidden', timeout: 8_000 });
    assert.equal(
      await page.evaluate(() => document.activeElement?.getAttribute('aria-label')),
      'Открыть мои проекты',
      'Closing the drawer must return focus to the menu button',
    );
    await page.getByRole('button', { name: 'Открыть мои проекты' }).click();
    projectsDrawer = page.getByRole('dialog', { name: 'Мои проекты' });
    await projectsDrawer.waitFor({ state: 'visible', timeout: 8_000 });
    assert.equal(
      await projectsDrawer.getByRole('button', { name: /Альфа-Смарт/i }).getAttribute('aria-current'),
      'page',
      'Drawer must identify the active case',
    );
    const drawerCv = projectsDrawer.getByRole('link', { name: 'Скачать CV' });
    assert.equal(await drawerCv.getAttribute('href'), '/cv/andrey-makarevich-product-designer.pdf');
    assert.notEqual(await drawerCv.getAttribute('download'), null, 'Drawer CV must download the supplied PDF');
    const remainingCompactCases = [
      'ChatPoint',
      'SIEBEL',
      'Расходы держателей',
      'Шаринг подписки',
      'UX/UI WannabeLike',
    ];

    for (const caseTitle of remainingCompactCases) {
      await projectsDrawer.getByRole('button', { name: new RegExp(caseTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).click();
      await assertCompactWorkspace(page, caseTitle);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
        false,
        `${caseTitle} must not create compact document overflow`,
      );
      await page.getByRole('button', { name: 'Открыть мои проекты' }).click();
      projectsDrawer = page.getByRole('dialog', { name: 'Мои проекты' });
      await projectsDrawer.waitFor({ state: 'visible', timeout: 8_000 });
    }

    await projectsDrawer.getByRole('button', { name: /Альфа-Смарт/i }).click();
    await assertCompactWorkspace(page, 'Альфа-Смарт');
    const restoredAlfaDisclosures = page.locator('.portfolio-compact-workspace button[aria-controls*="-panel"]');
    assert.equal(await restoredAlfaDisclosures.nth(0).getAttribute('aria-expanded'), 'true');
    assert.equal(await restoredAlfaDisclosures.nth(1).getAttribute('aria-expanded'), 'true');

    await page.getByRole('button', { name: /Лендинг подписки/i }).first().click();
    const mobileImageDialog = page.getByRole('dialog', { name: /Просмотр изображения:/ });
    await mobileImageDialog.waitFor({ state: 'visible', timeout: 8_000 });
    const imageCanvas = page.locator('.portfolio-mobile-image-canvas');
    const imageCanvasBox = await imageCanvas.boundingBox();
    assert.deepEqual(
      imageCanvasBox && {
        x: Math.round(imageCanvasBox.x),
        width: Math.round(imageCanvasBox.width),
        height: Math.round(imageCanvasBox.height),
      },
      { x: 16, width: 343, height: 250 },
      'Mobile image viewer must preserve the Figma fit-state canvas',
    );
    await page.locator('.portfolio-mobile-image-lightbox').dblclick();
    await delay(240);
    assert.equal(
      await page.getByText('Масштаб 200%', { exact: true }).count(),
      1,
      'Double tap must expose the current zoom state',
    );
    const zoomOut = page.getByRole('button', { name: 'Уменьшить изображение' });
    const fitImage = page.getByRole('button', { name: 'Вписать изображение целиком' });
    const zoomIn = page.getByRole('button', { name: 'Увеличить изображение' });
    for (const zoomControl of [zoomOut, fitImage, zoomIn]) {
      const box = await zoomControl.boundingBox();
      assert.ok(box && box.width >= 44 && box.height >= 44, 'Image viewer controls must have a 44px hit area');
    }
    await fitImage.click();
    assert.equal(await page.getByText('Масштаб 100%', { exact: true }).count(), 1, 'Fit control must reset image scale');
    await page.keyboard.press('Escape');
    await mobileImageDialog.waitFor({ state: 'hidden', timeout: 8_000 });

    await page.getByRole('button', { name: 'Открыть мои проекты' }).click();
    projectsDrawer = page.getByRole('dialog', { name: 'Мои проекты' });
    await projectsDrawer.waitFor({ state: 'visible', timeout: 8_000 });
    await projectsDrawer.getByRole('button', { name: /ChatPoint/i }).click();
    await assertCompactWorkspace(page, 'ChatPoint');

    await page.getByRole('button', { name: 'Открыть мои проекты' }).click();
    await page.getByRole('dialog', { name: 'Мои проекты' }).getByRole('button', { name: 'Написать мне' }).click();
    const mobileContactDialog = page.getByRole('dialog', { name: 'Выберите удобный способ связи с Андреем' });
    await mobileContactDialog.waitFor({ state: 'visible', timeout: 8_000 });
    await delay(440);
    const mobileContactSheet = page.locator('.portfolio-contact-mobile-sheet');
    const mobileContactSheetBox = await mobileContactSheet.boundingBox();
    assert.ok(
      mobileContactSheetBox &&
        Math.round(mobileContactSheetBox.x) === 0 &&
        Math.round(mobileContactSheetBox.width) === 375 &&
        Math.round(mobileContactSheetBox.y + mobileContactSheetBox.height) === 812,
      'Mobile contact modal must stay attached to the bottom edge',
    );
    assert.equal(await mobileContactSheet.getByRole('link').count(), 3, 'Mobile contact sheet must render three contact actions');
    assert.equal(
      await mobileContactSheet.getByRole('link', { name: /Написать на почту/i }).getAttribute('href'),
      'mailto:andrew.makarevitch@yandex.ru',
      'Mobile contact sheet must expose the canonical email address',
    );
    assert.equal(
      await mobileContactSheet.locator('a [class*="text-[14px]"]').evaluateAll(
        (elements) => elements.filter((element) => getComputedStyle(element).display !== 'none').length,
      ),
      0,
      'Mobile contact rows must not show desktop helper text',
    );
    assert.equal(
      await page.evaluate(() => document.activeElement?.getAttribute('aria-label')),
      'Закрыть',
      'Mobile contact modal must focus its close button on open',
    );
    assert.equal(
      await page.locator('.portfolio-contact-overlay').evaluate((element) => getComputedStyle(element).animationName),
      'portfolio-contact-backdrop-in',
      'Mobile contact backdrop must fade in',
    );
    assert.equal(
      await mobileContactSheet.evaluate((element) => getComputedStyle(element).animationName),
      'portfolio-contact-sheet-in',
      'Mobile contact sheet must slide in from the bottom',
    );
    await mobileContactDialog.getByRole('button', { name: 'Закрыть' }).click();
    assert.equal(
      await page.locator('.portfolio-contact-overlay').evaluate((element) => element.classList.contains('is-closing')),
      true,
      'Mobile contact modal must keep its exit state until the slide-out finishes',
    );
    await mobileContactDialog.waitFor({ state: 'hidden', timeout: 8_000 });

    await page.getByRole('button', { name: 'Открыть мои проекты' }).click();
    projectsDrawer = page.getByRole('dialog', { name: 'Мои проекты' });
    await projectsDrawer.waitFor({ state: 'visible', timeout: 8_000 });
    await projectsDrawer.getByRole('button', { name: /Опыт работы/i }).click();
    await assertCompactExperienceWorkspace(page);
    await page.getByRole('button', { name: 'Вернуться к списку проектов' }).click();
    projectsDrawer = page.getByRole('dialog', { name: 'Мои проекты' });
    await projectsDrawer.waitFor({ state: 'visible', timeout: 8_000 });
    assert.equal(
      await projectsDrawer.getByRole('button', { name: /Опыт работы/i }).getAttribute('aria-current'),
      'page',
      'Drawer must identify the active compact experience view',
    );
    await projectsDrawer.getByRole('button', { name: /Альфа-Смарт/i }).click();
    await assertCompactWorkspace(page, 'Альфа-Смарт');

    await page.getByRole('button', { name: 'Открыть мои проекты' }).click();
    const compactHomeAction = page.getByRole('dialog', { name: 'Мои проекты' }).getByRole('button', { name: 'На главную' });
    await compactHomeAction.scrollIntoViewIfNeeded();
    await compactHomeAction.click();
    await assertLandingState(page);
    await assertHealthy(page, state, 'compact drawer return to landing');

    await page.setViewportSize({ width: 1279, height: 800 });
    await getEntryAlfaCard(page).click();
    await assertCompactWorkspace(page, 'Альфа-Смарт');
    await assertCompactCollapsedDisclosureGeometry(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.getByRole('button', { name: 'Вернуться на главную' }).waitFor({ state: 'visible', timeout: 8_000 });
    assert.equal(await page.locator('.portfolio-compact-workspace').count(), 0, 'Compact workspace must unmount at 1280px');
    assert.equal(await page.locator('.portfolio-desktop-stage').count(), 1, 'Desktop workspace must render at 1280px');
    assert.equal(await page.locator('textarea:visible').count(), 1, 'Breakpoint switch must not duplicate the composer');
    await assertEditorialCaseEntry(page);
    await assertHealthy(page, state, 'compact to desktop breakpoint switch');

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
