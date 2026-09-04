import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { portfolioProfile } from '../src/data/portfolio-profile';

const root = process.cwd();
const outputPath = path.join(root, 'public/cv/andrey-makarevich-product-designer.pdf');

async function inlineOnestFontFaces() {
  const chunksDir = path.join(root, '.next/dev/static/chunks');
  const cssFile = (await fs.readdir(chunksDir)).find((file) => file.includes('internal_font_google_onest') && file.endsWith('.css'));
  if (!cssFile) throw new Error('Onest CSS was not found. Start or build Next.js before generating the CV.');

  const css = await fs.readFile(path.join(chunksDir, cssFile), 'utf8');
  const fontFaces = css.match(/@font-face\s*\{[\s\S]*?\}/g) ?? [];
  const inlined: string[] = [];

  for (const face of fontFaces.filter((item) => item.includes('font-family: Onest;'))) {
    const url = face.match(/url\("\.\.\/media\/([^"\)]+)"\)/)?.[1];
    if (!url) continue;
    const file = await fs.readFile(path.join(root, '.next/dev/static/media', url));
    inlined.push(
      face
        .replace(/url\("\.\.\/media\/[^"\)]+"\)/, `url("data:font/woff2;base64,${file.toString('base64')}")`)
        .replace('font-display: swap', 'font-display: block'),
    );
  }

  if (inlined.length === 0) throw new Error('Onest font faces could not be inlined.');
  return inlined.join('\n');
}

function workCard(index: number, description: string, bullets: string[]) {
  const work = portfolioProfile.workHistory[index];
  return `
    <section class="job">
      <div class="job-meta"><span>${work.period}</span><span>0${index + 1}</span></div>
      <h2>${work.company}</h2>
      <p class="role">${work.role}</p>
      <p>${description}</p>
      <ul>${bullets.map((item) => `<li>${item}</li>`).join('')}</ul>
    </section>`;
}

async function main() {
  const fontFaces = await inlineOnestFontFaces();
  const html = `<!doctype html>
  <html lang="ru"><head><meta charset="utf-8"><style>
    ${fontFaces}
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; color: #111827; background: #fff; font-family: Onest, Arial, sans-serif; }
    body { font-size: 9.4pt; line-height: 1.42; }
    .page { width: 210mm; height: 297mm; padding: 14mm 16mm 13mm; page-break-after: always; position: relative; overflow: hidden; }
    .page:last-child { page-break-after: auto; }
    .eyebrow { margin: 0 0 3mm; color: #6e7280; font-size: 8pt; font-weight: 650; letter-spacing: .08em; text-transform: uppercase; }
    h1 { margin: 0; font-size: 27pt; line-height: 1.02; letter-spacing: -.035em; }
    h2 { margin: 1.5mm 0 .7mm; font-size: 16pt; line-height: 1.1; letter-spacing: -.02em; }
    h3 { margin: 0 0 2mm; font-size: 12pt; line-height: 1.15; }
    p { margin: 0; }
    .header { display: grid; grid-template-columns: 1fr auto; gap: 10mm; padding-bottom: 7mm; border-bottom: .35mm solid #e2e5ea; }
    .title-role { margin-top: 2mm; color: #4b5563; font-size: 12pt; }
    .contacts { display: grid; align-content: start; justify-items: end; gap: 1.2mm; font-size: 8.6pt; }
    a { color: #111827; text-decoration: none; border-bottom: .2mm solid #c9ced8; }
    .intro { display: grid; grid-template-columns: 1.35fr .65fr; gap: 10mm; padding: 7mm 0 6mm; }
    .lead { font-size: 12.3pt; line-height: 1.42; letter-spacing: -.01em; }
    .quick { display: grid; gap: 2.6mm; }
    .quick div { padding: 2.5mm 3mm; border: .3mm solid #e2e5ea; border-radius: 3mm; }
    .quick strong { display: block; font-size: 11pt; }
    .quick span { color: #6e7280; font-size: 8pt; }
    .section-title { margin: 0 0 3mm; font-size: 9pt; color: #6e7280; text-transform: uppercase; letter-spacing: .08em; }
    .jobs { display: grid; gap: 4mm; }
    .job { padding: 4mm 4.5mm; border: .3mm solid #dfe3ea; border-radius: 4mm; break-inside: avoid; }
    .job-meta { display: flex; justify-content: space-between; color: #6e7280; font-size: 8pt; }
    .role { margin-bottom: 2.2mm; color: #4b5563; font-weight: 600; }
    ul { margin: 2.2mm 0 0; padding-left: 4.5mm; }
    li { margin: 1mm 0; }
    li::marker { color: #9ca3af; }
    .footer { position: absolute; left: 16mm; right: 16mm; bottom: 8mm; display: flex; justify-content: space-between; color: #8c919e; font-size: 7.5pt; }
    .page-two-head { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 5mm; border-bottom: .35mm solid #e2e5ea; }
    .page-two-head h2 { font-size: 21pt; }
    .grid { display: grid; grid-template-columns: 1.08fr .92fr; gap: 7mm; margin-top: 7mm; }
    .stack { display: grid; align-content: start; gap: 5mm; }
    .panel { padding: 4.5mm; background: #f6f7f9; border-radius: 4mm; }
    .panel.white { background: #fff; border: .3mm solid #dfe3ea; }
    .skills { display: flex; flex-wrap: wrap; gap: 2mm; }
    .chip { padding: 1.7mm 2.5mm; border: .3mm solid #d8dce4; border-radius: 99mm; font-size: 8.2pt; }
    .metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5mm; }
    .metric { min-height: 23mm; padding: 3.5mm; border: .3mm solid #dfe3ea; border-radius: 3.5mm; }
    .metric strong { display: block; font-size: 14pt; line-height: 1.15; }
    .metric span { display: block; margin-top: 1.5mm; color: #6e7280; font-size: 8pt; }
    .edu + .edu { margin-top: 3.5mm; padding-top: 3.5mm; border-top: .3mm solid #e2e5ea; }
    .edu strong { display: block; font-size: 10.5pt; }
    .muted { color: #6e7280; }
  </style></head><body>
    <main class="page">
      <header class="header">
        <div><p class="eyebrow">CV · Product Design</p><h1>${portfolioProfile.name}</h1><p class="title-role">${portfolioProfile.role} · B2B / B2C</p></div>
        <nav class="contacts" aria-label="Контакты">
          <span>${portfolioProfile.location}</span>
          <a href="mailto:${portfolioProfile.contact.email}">${portfolioProfile.contact.email}</a>
          <a href="${portfolioProfile.contact.telegram}">Telegram</a>
          <a href="${portfolioProfile.contact.linkedin}">LinkedIn</a>
          <a href="https://ai-portfolio-bice-beta.vercel.app/">Портфолио</a>
        </nav>
      </header>
      <section class="intro">
        <p class="lead">${portfolioProfile.description} Веду работу от исследования и структуры сценария до проверки гипотез, передачи в разработку и релиза.</p>
        <div class="quick">
          <div><strong>${portfolioProfile.experienceLabel}</strong><span>в продуктовой разработке</span></div>
          <div><strong>Fintech · Enterprise</strong><span>сложные B2B/B2C-продукты</span></div>
        </div>
      </section>
      <p class="section-title">Опыт работы</p>
      <div class="jobs">
        ${workCard(0,
          'Проектирую продукты для киберполигона и багбаунти: рабочие сценарии исследователей и интерфейсы жюри, проверяющего отчёты.',
          ['Разбираю сложные роли, статусы и сценарии сдачи отчётов.', 'Работаю с готовой дизайн-системой и поддерживаю UI kit продукта.'])}
        ${workCard(1,
          'Проектировал Альфа-Смарт — семейную подписку на банковские продукты для mobile и web.',
          [`${portfolioProfile.highlightMetrics.alfaSubscriptions}; ${portfolioProfile.highlightMetrics.alfaRevenue}.`, 'Разобрал требования, собрал User Flow и прототип, подготовил гипотезы, провёл тестирование и передал решение в разработку.', '30% владельцев подписки добавили участников.'])}
        ${workCard(2,
          'Проектировал CRM и платформу коммуникаций для операторов поддержки и бизнеса.',
          [`Сократил среднее время обработки диалога: ${portfolioProfile.highlightMetrics.mtsDialogTime}.`, `Увеличил объём обработки: ${portfolioProfile.highlightMetrics.mtsDialogVolume}.`, 'Исследовал реальную работу операторов, проектировал сценарии и сопровождал решения до релиза.'])}
      </div>
      <div class="footer"><span>${portfolioProfile.name}</span><span>1 / 2</span></div>
    </main>
    <main class="page">
      <header class="page-two-head"><h2>Подход и компетенции</h2><span class="muted">${portfolioProfile.role}</span></header>
      <div class="grid">
        <div class="stack">
          <section><p class="section-title">Как работаю</p><div class="panel white">
            <h3>Сначала логика, затем интерфейс</h3>
            <p>Погружаюсь в предметную область, роли и ограничения. Собираю User Flow, проверяю критические сценарии и только после этого фиксирую UI.</p>
          </div></section>
          <section><div class="panel white">
            <h3>Проверяю решения на данных и пользователях</h3>
            <p>Формулирую гипотезы, готовлю прототипы, провожу интервью и usability-тесты. После релиза сверяю результат с продуктовой метрикой.</p>
          </div></section>
          <section><div class="panel white">
            <h3>Довожу до реализации</h3>
            <p>Согласовываю решения с продуктом и разработкой, прохожу дизайн-чек и поддерживаю команду на этапе сборки.</p>
          </div></section>
          <section><p class="section-title">Ключевые результаты</p><div class="metric-grid">
            <div class="metric"><strong>32 111</strong><span>подписок за первый месяц</span></div>
            <div class="metric"><strong>1,1 млн ₽</strong><span>выручки Альфа-Смарт</span></div>
            <div class="metric"><strong>900 → 580</strong><span>секунд на диалог</span></div>
            <div class="metric"><strong>1000 → 2000</strong><span>диалогов в обработке</span></div>
          </div></section>
        </div>
        <div class="stack">
          <section><p class="section-title">Компетенции</p><div class="skills">
            ${['Product discovery', 'UX research', 'User Flow', 'Information architecture', 'Prototyping', 'Usability testing', 'UI design', 'Design systems', 'Mobile', 'Web', 'Enterprise', 'AI-инструменты'].map((item) => `<span class="chip">${item}</span>`).join('')}
          </div></section>
          <section><p class="section-title">Инструменты</p><div class="panel"><p>Figma · FigJam · Miro · Amplitude · Jira · Confluence · AI-инструменты для анализа и прототипирования</p></div></section>
          <section><p class="section-title">Образование</p><div class="panel white">
            <div class="edu"><strong>Британская высшая школа дизайна</strong><span class="muted">UX/UI-дизайн</span></div>
            <div class="edu"><strong>Российский экономический университет им. Г. В. Плеханова</strong><span class="muted">Экономика и управление</span></div>
          </div></section>
          <section><p class="section-title">Языки</p><div class="panel"><p><strong>Русский</strong> — родной<br><strong>Английский</strong> — рабочая документация и коммуникация</p></div></section>
          <section><p class="section-title">Открыт к диалогу</p><div class="panel white"><p>Лучший способ быстро оценить опыт — открыть портфолио с шестью кейсами или написать напрямую.</p><p style="margin-top:3mm"><a href="mailto:${portfolioProfile.contact.email}">${portfolioProfile.contact.email}</a></p></div></section>
        </div>
      </div>
      <div class="footer"><span>Актуальная версия · 2026</span><span>2 / 2</span></div>
    </main>
  </body></html>`;

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: outputPath, format: 'A4', printBackground: true, preferCSSPageSize: true });
  } finally {
    await browser.close();
  }
  console.log(`Generated ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
