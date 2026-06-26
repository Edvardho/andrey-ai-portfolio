import { resolveMessage } from '../src/lib/portfolio/engine';
import { getOrCreateSession } from '../src/lib/portfolio/session-store';
import type { AssistantEnvelope } from '../src/lib/portfolio/types';

// Set up empty environment for deterministic/offline run
process.env.OPENAI_API_KEY = '';
process.env.SUPABASE_URL = '';
process.env.NEXT_PUBLIC_SUPABASE_URL = '';
process.env.SUPABASE_SERVICE_ROLE_KEY = '';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

const forbiddenWords = [
  'сигнал',
  'product judgment',
  'craft',
  'delivery',
  'workflow-heavy',
  'workflow-redesign',
  'product depth',
  'anti-case',
  'proof-проект',
  'strong signal',
  'weak signal',
  'scorecard',
];

const queries = [
  'На какие роли он подойдет?',
  'Какие у него сильные стороны?',
  'Какие есть риски?',
  'Какой у него уровень?',
  'Покажи опыт работы.',
  'Что он за тип как спец?',
  'Расскажи про ChatPoint',
  'Покажи сильный кейс',
];

function extractFullText(envelope: AssistantEnvelope): string {
  const texts: string[] = [];
  for (const block of envelope.contentBlocks) {
    if (block.type === 'lead') {
      if (block.title) texts.push(block.title);
      texts.push(...block.body);
    } else if (block.type === 'section') {
      if (block.title) texts.push(block.title);
      texts.push(...block.body);
    } else if (block.type === 'bullet_list') {
      if (block.title) texts.push(block.title);
      texts.push(...block.items);
    }
  }
  return texts.join(' ');
}

async function main() {
  const session = await getOrCreateSession('verify-vocabulary-session');
  let failures = 0;

  for (const query of queries) {
    const result = await resolveMessage(session, query);
    const text = extractFullText(result.envelope);

    for (const word of forbiddenWords) {
      if (text.toLowerCase().includes(word.toLowerCase())) {
        console.error(`[FAIL] Query "${query}" returned response containing forbidden word: "${word}"`);
        failures++;
      }
    }
  }

  if (failures > 0) {
    console.error(`Vocabulary check failed with ${failures} errors.`);
    process.exit(1);
  }

  console.log('Vocabulary check passed successfully (no forbidden jargon found).');
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
