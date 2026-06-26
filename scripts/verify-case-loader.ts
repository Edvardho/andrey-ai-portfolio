import { getLoadedCaseById, loadCaseById } from '@/data/portfolio-case-loader.client';
import { CASE_IDS } from '@/data/portfolio-index';

async function main() {
  for (const caseId of CASE_IDS) {
    if (getLoadedCaseById(caseId)) {
      throw new Error(`${caseId} was resolved before an explicit load.`);
    }

    const first = await loadCaseById(caseId);
    const second = await loadCaseById(caseId);

    if (!first || first.id !== caseId) {
      throw new Error(`${caseId} loader returned the wrong case.`);
    }

    if (first !== second || getLoadedCaseById(caseId) !== first) {
      throw new Error(`${caseId} loader did not reuse its resolved cache.`);
    }
  }

  if (await loadCaseById('unknown-case')) {
    throw new Error('Unknown case IDs must not resolve.');
  }

  console.log('Case loader contract passed.');
}

void main();
