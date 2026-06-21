import fs from 'node:fs';
import path from 'node:path';

const chunksDir = path.join(process.cwd(), '.next/static/chunks');
if (!fs.existsSync(chunksDir)) {
  throw new Error('Run `npm run build` before verifying case code splitting.');
}

const markers = new Map([
  ['alfa-smart', 'Miro-структуру'],
  ['chatpoint', 'Apple Messages for Business'],
  ['siebel', 'Работа в 2 окнах'],
  ['expenses-card-holders', 'Новая сущность в истории операций'],
  ['subscription-sharing', 'Старый путь добавления участника'],
  ['ux-ui-wannabelike', 'Первый вход в приложение'],
]);

const chunks = fs.readdirSync(chunksDir)
  .filter((file) => file.endsWith('.js'))
  .map((file) => ({ file, source: fs.readFileSync(path.join(chunksDir, file), 'utf8') }));

const resolvedChunks = new Map<string, string>();

for (const [caseId, marker] of markers) {
  const matches = chunks.filter((chunk) => chunk.source.includes(marker));
  if (matches.length !== 1) {
    throw new Error(`${caseId} must exist in exactly one client chunk; found ${matches.length}.`);
  }
  resolvedChunks.set(caseId, matches[0].file);
}

if (new Set(resolvedChunks.values()).size !== markers.size) {
  throw new Error(`Case content was merged into shared chunks:\n${JSON.stringify(Object.fromEntries(resolvedChunks), null, 2)}`);
}

console.log('Case code splitting contract passed.');
for (const [caseId, chunk] of resolvedChunks) {
  console.log(`- ${caseId}: ${chunk}`);
}
