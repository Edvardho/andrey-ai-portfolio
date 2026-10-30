import assert from 'node:assert/strict';
import { CASE_IDS } from '../src/data/portfolio-index';
import { readCaseLink, buildCaseLink } from '../src/lib/portfolio/case-links';

for (const id of CASE_IDS) {
  assert.deepEqual(readCaseLink(`?case=${id}`), { explicit: true, caseId: id });
  assert.equal(buildCaseLink('/?utm_source=test#work', id), `/?utm_source=test&case=${id}#work`);
}
assert.deepEqual(readCaseLink('?utm_source=test'), { explicit: false, caseId: null });
for (const query of ['?case=unknown', '?case=', '?case=siebel&case=chatpoint', '?case=../../private']) {
  assert.deepEqual(readCaseLink(query), { explicit: true, caseId: null });
}
assert.equal(buildCaseLink('/?case=siebel&utm_source=test#work', null), '/?utm_source=test#work');
console.log('Case link policy passed.');
