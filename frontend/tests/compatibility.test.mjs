import test from 'node:test';
import assert from 'node:assert/strict';
import { compareProfiles } from '../src/lib/compatibility.ts';
test('unanswered preferences are unknown rather than agreements', () => {
  const fits = compareProfiles({name:'Jamie'}, {name:'Alex'});
  assert.equal(fits.length,4);
  assert.ok(fits.every(fit=>fit.aligned === false));
  assert.ok(fits.every(fit=>fit.detail.includes('not shared')));
});
