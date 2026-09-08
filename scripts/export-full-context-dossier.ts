import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { portfolioDossier } from '@/lib/portfolio/full-context-dossier';

const outputPath = path.resolve(process.cwd(), 'docs/full-context-dossier.generated.md');

function buildDocument() {
  const counts = portfolioDossier.records.reduce<Record<string, number>>((result, record) => {
    result[record.kind] = (result[record.kind] ?? 0) + 1;
    return result;
  }, {});
  const sourceCounts = portfolioDossier.records.reduce<Record<string, number>>((result, record) => {
    const source = record.source.split(':').slice(0, 3).join(':');
    result[source] = (result[source] ?? 0) + 1;
    return result;
  }, {});
  const lines = [
    '# Досье AI-ассистента портфолио',
    '',
    `Версия: ${portfolioDossier.version}. Версия промпта: ${portfolioDossier.promptVersion}.`,
    '',
    `Объём: ${portfolioDossier.records.length} записей, ${portfolioDossier.metrics.length} канонических числовых записей, ${portfolioDossier.artifacts.length} доступных артефактов, ${portfolioDossier.estimatedTokens} токенов o200k_base.`,
    '',
    `Автоматический редакционный аудит: ${portfolioDossier.review.automatedAt}. ${portfolioDossier.review.method}`,
    '',
    `Авторская проверка Андреем: ${portfolioDossier.review.authorReviewed ? `завершена ${portfolioDossier.review.authorReviewedAt ?? ''}`.trim() : 'ожидается'}.`,
    '',
    `Неразрешённые противоречия: ${portfolioDossier.contradictions.length}.`,
    '',
    '## Состав',
    '',
    ...Object.entries(counts).map(([kind, count]) => `- ${kind}: ${count}`),
    '',
    '## Реестр источников',
    '',
    ...Object.entries(sourceCounts).sort(([left], [right]) => left.localeCompare(right)).map(([source, count]) => `- ${source}: ${count}`),
    '',
    '## Записи',
    '',
    ...portfolioDossier.records.flatMap((record) => [
      `### ${record.id}`,
      '',
      `Тип: ${record.kind}. Контекст: ${record.caseId ?? 'profile'}. Источник: ${record.source}.`,
      '',
      record.text,
      '',
    ]),
    '## Канонические числовые факты',
    '',
    ...portfolioDossier.metrics.flatMap((metric) => [
      `- ${metric.id} → ${metric.text} (источник: ${metric.recordId})`,
    ]),
    '',
    '## Доступные артефакты',
    '',
    ...portfolioDossier.artifacts.map((artifact) => `- ${artifact.id} · ${artifact.caseId} · ${artifact.title}: ${artifact.description}`),
    '',
  ];
  return `${lines.join('\n')}\n`;
}

const expected = buildDocument();
if (process.argv.includes('--check')) {
  assert.equal(fs.readFileSync(outputPath, 'utf8'), expected, 'generated dossier is stale; run npm run dossier:export');
  console.log('export-full-context-dossier: generated document is current');
} else {
  fs.writeFileSync(outputPath, expected);
  console.log(`export-full-context-dossier: wrote ${outputPath}`);
}
