import { getSynthesisTopicConfig } from '@/data/portfolio-facts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const identityChips = getSynthesisTopicConfig('identity').chips;
const identityChipLabels = identityChips.map((chip) => chip.label);
const identityChipMessages = identityChips
  .map((chip) => ('message' in chip && typeof chip.message === 'string' ? chip.message : ''))
  .filter((message): message is string => Boolean(message));

assert(
  !identityChipLabels.some((label) => /опыт работы/i.test(label)),
  'Identity follow-up chips must not ask for work experience because it repeats the identity answer.',
);

assert(
  !identityChipMessages.some((message) => /какой у него опыт работы/i.test(message)),
  'Identity follow-up chips must not route to the near-duplicate experience overview question.',
);

assert(
  identityChipLabels.some((label) => /звать/i.test(label)),
  'Identity follow-up chips should include a hiring/interview angle.',
);

assert(
  identityChipLabels.some((label) => /слабое место/i.test(label)),
  'Identity follow-up chips should include a risk angle.',
);

console.log('Chip policy verified.');
