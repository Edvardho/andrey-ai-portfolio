import {
  batch1CuratedFixtures,
  batch3ExploratoryFixtures,
  batch3ReleaseCoreFixtures,
  batch3HiringLeadObjectionFixtures,
  batch2DirtyRussianFixtures,
  type IntentEvalFixture,
} from '@/lib/portfolio/eval-fixtures';
import { resolveMessage } from '@/lib/portfolio/engine';
import {
  classifyMessageDeterministically,
  classifyMessageWithModel,
} from '@/lib/portfolio/intent';
import { getOrCreateSession } from '@/lib/portfolio/session-store';

type BatchRun = {
  label: string;
  fixtures: IntentEvalFixture[];
  classifiedCount: number;
  classifiedPasses: number;
  failures: string[];
  ambiguousQuestions: string[];
};

function formatExpectedActual(label: string, expected: string | undefined, actual: string | undefined) {
  return `${label}: expected="${expected ?? 'n/a'}" actual="${actual ?? 'n/a'}"`;
}

async function runFixture(batch: BatchRun, fixture: IntentEvalFixture, index: number) {
  const session = await getOrCreateSession(`eval-${batch.label}-${Date.now()}-${index}`);

  let classification = classifyMessageDeterministically(fixture.input, session);
  if (!classification) {
    classification = await classifyMessageWithModel(fixture.input, session);
  }

  if (fixture.expectedIntent) {
    batch.classifiedCount += 1;
    const actualIntent = classification?.intent.type;
    if (actualIntent === fixture.expectedIntent) {
      batch.classifiedPasses += 1;
    } else {
      batch.failures.push(
        [
          `[${batch.label}] intent mismatch for "${fixture.input}"`,
          formatExpectedActual('intent', fixture.expectedIntent, actualIntent),
        ].join('\n'),
      );
    }
  }

  const { envelope } = await resolveMessage(session, fixture.input);

  if (
    classification?.intent.type === 'ambiguous_question' ||
    envelope.viewType === 'ambiguous_question'
  ) {
    batch.ambiguousQuestions.push(fixture.input);
  }

  if (
    fixture.expectedPresentationVariant &&
    envelope.presentationVariant !== fixture.expectedPresentationVariant
  ) {
    batch.failures.push(
      [
        `[${batch.label}] presentationVariant mismatch for "${fixture.input}"`,
        formatExpectedActual(
          'presentationVariant',
          fixture.expectedPresentationVariant,
          envelope.presentationVariant,
        ),
      ].join('\n'),
    );
  }

  if (fixture.expectedViewType && envelope.viewType !== fixture.expectedViewType) {
    batch.failures.push(
      [
        `[${batch.label}] viewType mismatch for "${fixture.input}"`,
        formatExpectedActual('viewType', fixture.expectedViewType, envelope.viewType),
      ].join('\n'),
    );
  }

  if (fixture.expectedSafetyState && envelope.safetyState !== fixture.expectedSafetyState) {
    batch.failures.push(
      [
        `[${batch.label}] safetyState mismatch for "${fixture.input}"`,
        formatExpectedActual('safetyState', fixture.expectedSafetyState, envelope.safetyState),
      ].join('\n'),
    );
  }
}

async function runBatch(label: string, fixtures: IntentEvalFixture[]) {
  const batch: BatchRun = {
    label,
    fixtures,
    classifiedCount: 0,
    classifiedPasses: 0,
    failures: [],
    ambiguousQuestions: [],
  };

  for (const [index, fixture] of fixtures.entries()) {
    await runFixture(batch, fixture, index);
  }

  return batch;
}

function accuracy(batch: BatchRun) {
  return batch.classifiedCount === 0 ? 1 : batch.classifiedPasses / batch.classifiedCount;
}

async function main() {
  const mode = process.argv[2] ?? 'default';

  if (mode === 'objections') {
    const batch3Core = await runBatch('batch3_release_core', batch3ReleaseCoreFixtures);
    const batch3Exploratory = await runBatch('batch3_exploratory_tail', batch3ExploratoryFixtures);
    const batch3 = await runBatch('batch3_hiring_lead_objections', batch3HiringLeadObjectionFixtures);
    const batch3Accuracy = accuracy(batch3);

    if (batch3.failures.length > 0) {
      throw new Error(
        [
          'Objection intent eval failed.',
          `Batch 3 accuracy: ${Math.round(batch3Accuracy * 100)}% (${batch3.classifiedPasses}/${batch3.classifiedCount})`,
          `Release core: ${Math.round(accuracy(batch3Core) * 100)}% (${batch3Core.classifiedPasses}/${batch3Core.classifiedCount})`,
          `Exploratory tail: ${Math.round(accuracy(batch3Exploratory) * 100)}% (${batch3Exploratory.classifiedPasses}/${batch3Exploratory.classifiedCount})`,
          '',
          batch3.failures.join('\n\n'),
        ].join('\n'),
      );
    }

    console.log(
      [
        `Objection intent eval passed: ${Math.round(batch3Accuracy * 100)}% (${batch3.classifiedPasses}/${batch3.classifiedCount})`,
        `Release core: ${Math.round(accuracy(batch3Core) * 100)}% (${batch3Core.classifiedPasses}/${batch3Core.classifiedCount})`,
        `Exploratory tail: ${Math.round(accuracy(batch3Exploratory) * 100)}% (${batch3Exploratory.classifiedPasses}/${batch3Exploratory.classifiedCount})`,
      ].join('\n'),
    );
    return;
  }

  if (mode === 'objections-core') {
    const batch3Core = await runBatch('batch3_release_core', batch3ReleaseCoreFixtures);
    const batch3CoreAccuracy = accuracy(batch3Core);
    const uniqueAmbiguous = [...new Set(batch3Core.ambiguousQuestions)];
    const hardFailures: string[] = [];

    if (batch3CoreAccuracy < 0.8) {
      hardFailures.push(
        `Release-core objection accuracy ${Math.round(batch3CoreAccuracy * 100)}% is below required 80%.`,
      );
    }

    if (uniqueAmbiguous.length > 0) {
      hardFailures.push(
        [
          'Release-core objection eval hit ambiguous_question for these inputs:',
          ...uniqueAmbiguous.map((input) => `- ${input}`),
        ].join('\n'),
      );
    }

    if (hardFailures.length > 0) {
      throw new Error(
        [
          'Release-core objection eval failed.',
          `Accuracy: ${Math.round(batch3CoreAccuracy * 100)}% (${batch3Core.classifiedPasses}/${batch3Core.classifiedCount})`,
          '',
          ...hardFailures,
          '',
          ...batch3Core.failures,
        ].join('\n'),
      );
    }

    const softMismatchCount = batch3Core.failures.length;
    console.log(
      [
        `Release-core objection eval passed: ${Math.round(batch3CoreAccuracy * 100)}% (${batch3Core.classifiedPasses}/${batch3Core.classifiedCount})`,
        softMismatchCount > 0
          ? `Non-blocking mismatches remaining: ${softMismatchCount}`
          : 'No non-blocking mismatches.',
      ].join('\n'),
    );
    return;
  }

  const batch1 = await runBatch('batch1_curated', batch1CuratedFixtures);
  const batch2 = await runBatch('batch2_dirty_russian', batch2DirtyRussianFixtures);
  const overallClassifiedCount = batch1.classifiedCount + batch2.classifiedCount;
  const overallClassifiedPasses = batch1.classifiedPasses + batch2.classifiedPasses;
  const overallAccuracy = overallClassifiedCount === 0 ? 1 : overallClassifiedPasses / overallClassifiedCount;
  const batch2Accuracy = accuracy(batch2);
  const failures = [...batch1.failures, ...batch2.failures];

  if (overallAccuracy < 0.9) {
    failures.push(
      `Overall intent accuracy ${Math.round(overallAccuracy * 100)}% is below required 90%.`,
    );
  }

  if (batch2Accuracy < 0.85) {
    failures.push(
      `Batch 2 intent accuracy ${Math.round(batch2Accuracy * 100)}% is below required 85%.`,
    );
  }

  if (failures.length > 0) {
    throw new Error(
      [
        'Intent eval failed.',
        `Overall accuracy: ${Math.round(overallAccuracy * 100)}% (${overallClassifiedPasses}/${overallClassifiedCount})`,
        `Batch 1 accuracy: ${Math.round(accuracy(batch1) * 100)}% (${batch1.classifiedPasses}/${batch1.classifiedCount})`,
        `Batch 2 accuracy: ${Math.round(batch2Accuracy * 100)}% (${batch2.classifiedPasses}/${batch2.classifiedCount})`,
        '',
        failures.join('\n\n'),
      ].join('\n'),
    );
  }

  console.log(
    [
      `Intent eval passed: overall ${Math.round(overallAccuracy * 100)}% (${overallClassifiedPasses}/${overallClassifiedCount})`,
      `Batch 1: ${Math.round(accuracy(batch1) * 100)}% (${batch1.classifiedPasses}/${batch1.classifiedCount})`,
      `Batch 2: ${Math.round(batch2Accuracy * 100)}% (${batch2.classifiedPasses}/${batch2.classifiedCount})`,
    ].join('\n'),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
