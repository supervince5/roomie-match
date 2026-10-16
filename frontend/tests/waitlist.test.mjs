import test from 'node:test';
import assert from 'node:assert/strict';
import { submitWaitlist } from '../src/lib/waitlist.ts';

test('submits only email and honeypot without an account token', async () => {
  let sent;
  await submitWaitlist('https://api.example.test/', '  Student@Example.com  ', '', async (url, options) => {
    sent = {url, options};
    return Response.json({message: 'saved'});
  });
  assert.equal(sent.url, 'https://api.example.test/waitlist');
  assert.deepEqual(JSON.parse(sent.options.body), {email: 'Student@Example.com', website: ''});
  assert.deepEqual(sent.options.headers, {'Content-Type': 'application/json'});
  assert.ok(sent.options.signal instanceof AbortSignal);
});

test('network, server, and invalid successful responses never claim a saved signup', async () => {
  for (const request of [
    async () => { throw new TypeError('network down'); },
    async () => new Response('internal private details', {status: 500}),
    async () => new Response('<html>proxy error</html>'),
    async () => Response.json({}),
  ]) await assert.rejects(submitWaitlist('https://api.example.test', 'a@example.com', '', request), /couldn’t/);
});

test('validation and throttling provide actionable messages and missing config never sends', async () => {
  await assert.rejects(submitWaitlist('https://api.example.test', 'bad', '', async () => new Response('', {status: 400})), /check your email/);
  await assert.rejects(submitWaitlist('https://api.example.test', 'a@example.com', '', async () => new Response('', {status: 429})), /give it a moment/);
  await assert.rejects(submitWaitlist(undefined, 'a@example.com', '', async () => { assert.fail('must not send'); }), /isn’t available/);
});
