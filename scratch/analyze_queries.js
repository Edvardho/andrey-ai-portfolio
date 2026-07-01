import { batch1CuratedFixtures, batch2DirtyRussianFixtures, batch3HiringLeadObjectionFixtures } from '../src/lib/portfolio/eval-fixtures';
import { classifyMessageDeterministically } from '../src/lib/portfolio/intent';
import { getOrCreateSession } from '../src/lib/portfolio/session-store';

async function main() {
  const session = await getOrCreateSession('analysis-session');

  const analyzeBatch = (label, fixtures) => {
    let deterministicCount = 0;
    let modelCount = 0;
    const modelQueries = [];

    for (const f of fixtures) {
      const classification = classifyMessageDeterministically(f.input, session);
      if (classification) {
        deterministicCount++;
      } else {
        modelCount++;
        modelQueries.push(f.input);
      }
    }

    console.log(`\nBatch: ${label}`);
    console.log(`Total fixtures: ${fixtures.length}`);
    console.log(`Deterministic: ${deterministicCount} (${Math.round(deterministicCount/fixtures.length*100)}%)`);
    console.log(`Model needed: ${modelCount} (${Math.round(modelCount/fixtures.length*100)}%)`);
    if (modelCount > 0) {
      console.log(`Queries requiring model:`);
      for (const q of modelQueries) {
        console.log(`  - "${q}"`);
      }
    }
  };

  analyzeBatch('Batch 1 (Curated)', batch1CuratedFixtures);
  analyzeBatch('Batch 2 (Dirty Russian)', batch2DirtyRussianFixtures);
  analyzeBatch('Batch 3 (Objections)', batch3HiringLeadObjectionFixtures);
}

main().catch(console.error);
