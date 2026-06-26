import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const caseIds = [
  'alfa-smart',
  'chatpoint',
  'siebel',
  'expenses-card-holders',
  'subscription-sharing',
  'ux-ui-wannabelike',
] as const;

const expectedFiles = [
  'src/data/portfolio-index.ts',
  'src/data/portfolio-global-content.ts',
  'src/data/portfolio-case-loader.client.ts',
  'src/data/portfolio-content.server.ts',
  ...caseIds.map((caseId) => `src/data/cases/${caseId}.ts`),
];

const missingFiles = expectedFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missingFiles.length) {
  throw new Error(`Missing case splitting files:\n${missingFiles.join('\n')}`);
}

const loaderSource = fs.readFileSync(
  path.join(root, 'src/data/portfolio-case-loader.client.ts'),
  'utf8',
);

for (const caseId of caseIds) {
  if (!loaderSource.includes(`import('./cases/${caseId}')`)) {
    throw new Error(`Client loader must dynamically import ${caseId}.`);
  }
}

const clientFiles = [
  ...fs.readdirSync(path.join(root, 'src/components'))
    .filter((file) => file.endsWith('.tsx'))
    .map((file) => path.join(root, 'src/components', file)),
  path.join(root, 'src/lib/portfolio/client-seeds.ts'),
];

const forbiddenImport = /@\/data\/(portfolio-content(?:\.server)?|cases\/)/;
const violations = clientFiles.flatMap((file) => {
  const source = fs.readFileSync(file, 'utf8');
  return forbiddenImport.test(source) ? [path.relative(root, file)] : [];
});

if (violations.length) {
  throw new Error(`Client files import full case content:\n${violations.join('\n')}`);
}

if (fs.existsSync(path.join(root, 'src/data/portfolio-content.ts'))) {
  throw new Error('Legacy src/data/portfolio-content.ts must be removed.');
}

console.log('Case module boundary contract passed.');
