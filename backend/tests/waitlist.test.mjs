import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { inspect } from 'node:util';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';

process.env.TABLE_NAME = 'roomie-unit-test';
const rows = new Map();
let databaseError;
let writes = 0;
DynamoDBDocumentClient.prototype.send = async function(command) {
    assert.equal(command.constructor.name, 'PutCommand');
    const { TableName, Item, ConditionExpression } = command.input;
    assert.equal(TableName, 'roomie-unit-test');
    assert.equal(ConditionExpression, 'attribute_not_exists(PK)');
    writes++;
    if (databaseError) throw databaseError;
    const key = JSON.stringify([Item.PK, Item.SK]);
    if (rows.has(key)) {
        throw new ConditionalCheckFailedException({ message: 'Already exists', $metadata: {} });
    }
    rows.set(key, structuredClone(Item));
    return {};
};
const { handler } = await import('../.test-build/handlers/waitlist.js');
const event = (value) => ({ body: JSON.stringify(value), isBase64Encoded: false });
beforeEach(() => { rows.clear(); databaseError = undefined; writes = 0; });

test('anonymous signup stores only normalized email, consent and creation metadata', async () => {
    const result = await handler(event({ email: '  Person+Launch@Example.COM  ' }));
    assert.equal(result.statusCode, 200);
    const [record] = [...rows.values()];
    assert.equal(rows.size, 1);
    assert.deepEqual(Object.keys(record).sort(), ['PK', 'SK', 'consentVersion', 'createdAt', 'email']);
    assert.equal(record.email, 'person+launch@example.com');
    assert.equal(record.PK, 'WAITLIST#' + createHash('sha256').update(record.email).digest('hex'));
    assert.equal(record.SK, 'SIGNUP');
    assert.equal(record.consentVersion, 'waitlist-v1');
    assert.ok(Number.isFinite(Date.parse(record.createdAt)));
    assert.ok(!result.body.includes(record.email));
});

test('case variants and concurrent retries succeed identically without replacing first signup', async () => {
    const first = await handler(event({ email: 'person@example.com' }));
    assert.equal(first.statusCode, 200);
    assert.equal(rows.size, 1);
    const original = structuredClone([...rows.values()][0]);
    original.createdAt = '2026-01-01T00:00:00.000Z';
    rows.set(JSON.stringify([original.PK, original.SK]), original);
    const retries = await Promise.all(Array.from({ length: 12 }, () => handler(event({ email: ' PERSON@Example.com ' }))));
    for (const retry of retries) assert.deepEqual(retry, first);
    assert.equal(rows.size, 1);
    assert.deepEqual([...rows.values()][0], original);
});

test('concurrent first submissions create only one signup and return identical success', async () => {
    const results = await Promise.all(Array.from({ length: 12 }, () => handler(event({ email: 'person@example.com' }))));
    assert.equal(rows.size, 1);
    assert.equal(results[0].statusCode, 200);
    for (const result of results) assert.deepEqual(result, results[0]);
});

test('rejects invalid emails, oversized emails, nonobjects and unknown fields before storage', async () => {
    const invalid = [null, [], 'person@example.com', {}, { email: null }, { email: 123 },
        { email: '' }, { email: '  ' }, { email: 'not-an-email' }, { email: 'a@' },
        { email: 'person@example.com\nBcc:other@example.com' },
        { email: 'a'.repeat(243) + '@example.com' },
        { email: 'person@example.com', school: 'private' },
        { email: 'person@example.com', consentVersion: 'fake' },
        { email: 'person@example.com', website: 123 }];
    for (const body of invalid) assert.equal((await handler(event(body))).statusCode, 400, JSON.stringify(body));
    assert.equal(writes, 0);
});

test('rejects missing, malformed, noncanonical base64 and oversized bodies before storage', async () => {
    const invalid = [{}, { body: '' }, { body: '{oops' },
        { body: '{"email":"person@example.com"}' + ' '.repeat(2048) },
        { body: Buffer.from(' '.repeat(2049)).toString('base64'), isBase64Encoded: true },
        { body: '%%%=', isBase64Encoded: true },
        { body: Buffer.from('{"email":"person@example.com"}').toString('base64') + '!', isBase64Encoded: true },
        { body: Buffer.from([0xff, 0xfe]).toString('base64'), isBase64Encoded: true }];
    for (const body of invalid) assert.ok([400, 413].includes((await handler(body)).statusCode));
    assert.equal(writes, 0);
});

test('accepts valid base64 requests and blank honeypot fields', async () => {
    const result = await handler({ body: Buffer.from(JSON.stringify({ email: 'person@example.com', website: '' })).toString('base64'), isBase64Encoded: true });
    assert.equal(result.statusCode, 200);
    assert.equal(rows.size, 1);
});

test('filled honeypot returns the same success without storing an address', async () => {
    const caught = await handler(event({ email: 'bot@example.com', website: 'https://spam.example.com' }));
    assert.equal(writes, 0);
    const real = await handler(event({ email: 'person@example.com' }));
    assert.deepEqual(caught, real);
    assert.equal(rows.size, 1);
});

test('storage failures return retryable generic errors without exposing or logging emails', async (t) => {
    databaseError = new Error('Secret context person@example.com');
    const errorLog = t.mock.method(console, 'error', () => {});
    const infoLog = t.mock.method(console, 'log', () => {});
    const result = await handler(event({ email: 'person@example.com' }));
    assert.equal(result.statusCode, 500);
    assert.ok(!result.body.includes('person@example.com'));
    const logs = [...errorLog.mock.calls, ...infoLog.mock.calls];
    assert.ok(!inspect(logs, { depth: 10 }).includes('person@example.com'));
    assert.equal(rows.size, 0);
});
