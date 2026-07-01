import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), 'utf8');
}

const envelope = read('src/components/portfolio-assistant-envelope.tsx');
const synthesis = read('src/components/portfolio-assistant-synthesis-reply.tsx');
const assistantComponents = [
  'src/components/portfolio-assistant-candidate-fast-review.tsx',
  'src/components/portfolio-assistant-case-summary.tsx',
  'src/components/portfolio-assistant-experience-summary.tsx',
  'src/components/portfolio-assistant-sectioned-reply.tsx',
  'src/components/portfolio-assistant-synthesis-reply.tsx',
].map((path) => ({ path, source: read(path) }));

assert(
  !envelope.includes("import { PortfolioAssistantRefusalReply }"),
  'Envelope must not route conversational replies through PortfolioAssistantRefusalReply.',
);
assert(
  !envelope.includes("import { PortfolioAssistantBulletReply }"),
  'Envelope must not route conversational replies through PortfolioAssistantBulletReply.',
);
assert(
  !envelope.includes("import { PortfolioAssistantPlainTextReply }"),
  'Envelope must not route conversational replies through PortfolioAssistantPlainTextReply.',
);
assert(
  envelope.includes('const isEntitySectionedReply') &&
    envelope.includes("envelope.selectedContext.kind !== 'none'"),
  'Only entity-bound sectioned replies may use the legacy sectioned renderer.',
);
assert(
  envelope.includes('if (!isStructuredSummary && !isEntitySectionedReply)'),
  'Conversational replies must be routed to the synthesis renderer before variant switch.',
);
assert(
  envelope.includes("envelope.presentationVariant === 'candidate_fast_review'"),
  'Candidate fast review must have an explicit structured renderer before synthesis fallback.',
);

assert(
  !synthesis.includes('<motion.h2') && !synthesis.includes('</motion.h2>'),
  'Conversational renderer must not start answers with an H2.',
);
assert(
  !synthesis.includes('getStatusLabel') && !synthesis.includes('statusLabel'),
  'Conversational renderer must not display assistant state badges.',
);
assert(
  !hasDividerClass(synthesis),
  'Conversational chips/CTA containers must not render divider borders.',
);
assert(
  synthesis.includes('text-[17px] font-normal leading-6'),
  'Conversational paragraph styles must use 17px / 24px.',
);

for (const { path, source } of assistantComponents) {
  assert(
    !hasDividerClass(source) &&
      !source.includes('border-t border-[#EBEDF2]') &&
      !source.includes('border-t border-[#ECEEF4]'),
    `${path}: chips/CTA containers must not render divider borders.`,
  );
}

console.log('Assistant render routing contract passed.');

function hasDividerClass(source: string): boolean {
  return /(^|\s)border-t(\s|["'`])/.test(source);
}
