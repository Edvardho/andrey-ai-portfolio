import assert from 'node:assert/strict';
import { isProgrammaticScrollAllowed } from '../src/lib/portfolio/response-scroll-policy';

const now = 1000;
const manualLockUntil = 2000;

assert.equal(isProgrammaticScrollAllowed('reply_anchor', manualLockUntil, now), false);
assert.equal(isProgrammaticScrollAllowed('reply_anchor', manualLockUntil, manualLockUntil), true);
assert.equal(isProgrammaticScrollAllowed('sticky_bottom', manualLockUntil, now), false);
assert.equal(isProgrammaticScrollAllowed('disclosure_anchor', manualLockUntil, now), false);

for (const reason of [
  'thread_switch_restore',
  'modal_restore',
  'jump_to_latest',
  'initial_thread_top',
] as const) {
  assert.equal(isProgrammaticScrollAllowed(reason, manualLockUntil, now), true);
}

console.log('response scroll policy checks passed');
