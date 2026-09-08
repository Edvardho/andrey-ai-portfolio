import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { loadEnvConfig } from '@next/env';

import { fullContextEvalFixtures } from '@/lib/portfolio/full-context-eval-fixtures';
import { portfolioDossier } from '@/lib/portfolio/full-context-dossier';
import { generateFullContextDraft } from '@/lib/portfolio/full-context-answer';
import { createEmptySession } from '@/lib/portfolio/session-store';
import type { VisibleHistoryItem } from '@/lib/portfolio/full-context-contract';
import { resolveMessage } from '@/lib/portfolio/engine';

const BUDGET_USD = 10;
const MAX_INPUT_TOKENS = 32_000;
const MAX_OUTPUT_TOKENS = 2_000;
const MAX_CALLS_PER_ANSWER = 2;
const pricePerMillion = {
  'legacy:gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-5.4-mini': { input: 0.75, output: 4.5 },
  'gpt-5.4': { input: 2.5, output: 15 },
} as const;

type EvalConfiguration = keyof typeof pricePerMillion;

function argValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function maxCost(configuration: EvalConfiguration, answers: number) {
  const pricing = pricePerMillion[configuration];
  const calls = answers * MAX_CALLS_PER_ANSWER;
  return ((MAX_INPUT_TOKENS * calls * pricing.input) + (MAX_OUTPUT_TOKENS * calls * pricing.output)) / 1_000_000;
}

function answerCount(split: 'working' | 'holdout', limit?: number) {
  const fixtures = fullContextEvalFixtures.filter((fixture) => fixture.split === split).slice(0, limit);
  return fixtures.reduce((count, fixture) => count + fixture.turns.length, 0);
}

async function runLive() {
  loadEnvConfig(process.cwd());
  const configuration = (argValue('configuration') ?? 'gpt-5.4-mini') as EvalConfiguration;
  assert.ok(configuration in pricePerMillion, `Unsupported eval configuration: ${configuration}`);
  const split = argValue('split') === 'holdout' ? 'holdout' : 'working';
  const limitArg = Number.parseInt(argValue('limit') ?? '', 10);
  const limit = Number.isFinite(limitArg) && limitArg > 0 ? limitArg : undefined;
  const remainingBudget = Number.parseFloat(argValue('remaining-budget-usd') ?? '');
  assert.ok(Number.isFinite(remainingBudget) && remainingBudget > 0, '--remaining-budget-usd is required for a live run');
  const fixtures = fullContextEvalFixtures.filter((fixture) => fixture.split === split).slice(0, limit);
  const answerTotal = fixtures.reduce((count, fixture) => count + fixture.turns.length, 0);
  const reservedCost = maxCost(configuration, answerTotal);
  assert.ok(reservedCost <= remainingBudget, `Run requires up to $${reservedCost.toFixed(2)}, but only $${remainingBudget.toFixed(2)} remains.`);
  assert.equal(process.env.AI_MODE, 'live', 'AI_MODE=live is required');
  assert.ok(process.env.OPENAI_API_KEY, 'OPENAI_API_KEY is required');
  const isLegacy = configuration === 'legacy:gpt-4o-mini';
  process.env.AI_ANSWER_ENGINE = isLegacy ? 'legacy' : 'full_context';
  if (!isLegacy) process.env.AI_FULL_CONTEXT_MODEL = configuration;

  const report = [];
  for (const fixture of fixtures) {
    let session = createEmptySession(`eval-${fixture.id}-${Date.now()}`);
    const history: VisibleHistoryItem[] = [];
    const turns = [];
    for (const question of fixture.turns) {
      let rendered: string;
      let details: unknown;
      if (isLegacy) {
        const result = await resolveMessage(session, question);
        session = result.session;
        rendered = JSON.stringify(result.envelope.contentBlocks);
        details = { responseSource: result.envelope.meta.responseSource, assistantReplyState: result.envelope.meta.assistantReplyState };
      } else {
        const result = await generateFullContextDraft(session, question, history, { requestId: `${fixture.id}-${turns.length + 1}` });
        rendered = result.draft.blocks.flatMap((block) => [
          block.text,
          ...block.metricIds.map((id) => portfolioDossier.metrics.find((metric) => metric.id === id)?.text ?? ''),
        ]).filter(Boolean).join('\n');
        details = { draft: result.draft, usage: result.usage, modelCalls: result.modelCalls };
      }
      turns.push({ question, answer: rendered, details });
      history.push({ role: 'user', text: question }, { role: 'assistant', text: rendered });
    }
    report.push({ fixture, turns });
  }

  const outputDirectory = path.resolve(process.cwd(), 'scratch/full-context-eval');
  fs.mkdirSync(outputDirectory, { recursive: true });
  const outputPath = path.join(outputDirectory, `${new Date().toISOString().replace(/[:.]/g, '-')}-${configuration.replace(':', '-')}-${split}.json`);
  fs.writeFileSync(outputPath, JSON.stringify({ configuration, split, dossierVersion: portfolioDossier.version, reservedCost, report }, null, 2));
  console.log(JSON.stringify({ outputPath, scenarios: fixtures.length, answers: answerTotal, reservedCost }, null, 2));
}

const pilotAnswers = answerCount('working', 12);
const holdoutAnswers = answerCount('holdout');
const maximumComparisonUsd = (Object.keys(pricePerMillion) as EvalConfiguration[])
  .reduce((sum, configuration) => sum + maxCost(configuration, pilotAnswers + holdoutAnswers), 0);

async function main() {
  if (process.argv.includes('--live')) {
    await runLive();
    return;
  }
  console.log(JSON.stringify({
    mode: 'preflight_only',
    dossierVersion: portfolioDossier.version,
    tokenCount: portfolioDossier.estimatedTokens,
    tokenizer: 'o200k_base',
    pilotAnswers,
    holdoutAnswers,
    maximumComparisonUsd: Number(maximumComparisonUsd.toFixed(2)),
    budgetUsd: BUDGET_USD,
    fitsBudgetAtWorstCase: maximumComparisonUsd <= BUDGET_USD,
    note: 'No OpenAI request was made. Live mode requires --live and an explicit --remaining-budget-usd value.',
  }, null, 2));
}

void main();
