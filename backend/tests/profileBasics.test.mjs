import test from 'node:test';
import assert from 'node:assert/strict';
import { profileSchema } from '../.test-build/validation/profileSchemas.js';
import { searchSchools } from '../.test-build/data/schools.js';
const basics = { name: 'Jamie', schoolId: searchSchools('Virginia Tech', 1)[0].id, major: 'Architecture' };
test('a basic profile saves without inventing unanswered personal details', () => {
  const result = profileSchema.safeParse(basics);
  assert.equal(result.success, true);
  assert.deepEqual(result.data, { ...basics, tags: [] });
});
test('optional profile details still validate when supplied', () => {
  for (const extra of [{age:16},{age:101},{budget:{min:900,max:200}},{moveInDate:'tomorrow'},{smoking:'false'},{cleanliness:'anything'},{schoolId:-1},{admin:true}]) {
    assert.equal(profileSchema.safeParse({...basics,...extra}).success, false);
  }
});
