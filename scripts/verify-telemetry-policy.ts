import assert from 'node:assert/strict';

import { redactProductionTelemetry } from '@/lib/portfolio/logger';

function main() {
  const redacted = redactProductionTelemetry({
    event: 'call_end',
    route: 'synthesizeGeneralAnswer',
    model: 'gpt-4o-mini',
    error: 'OpenAI request for private user text failed with 429',
    durationMs: 321,
  });

  assert.equal('error' in redacted, false, 'production telemetry must not write raw error text');
  assert.equal(redacted.errorCategory, 'rate_limit', 'production telemetry must retain a safe error category');
  assert.equal(redacted.route, 'synthesizeGeneralAnswer');
  assert.equal(redacted.durationMs, 321);

  console.log('Telemetry policy contract passed.');
}

main();
