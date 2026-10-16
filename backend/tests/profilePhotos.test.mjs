import test from 'node:test';
import assert from 'node:assert/strict';
import { profileSchema } from '../.test-build/validation/profileSchemas.js';
import { searchSchools } from '../.test-build/data/schools.js';
process.env.TABLE_NAME = 'photo-test-only';
process.env.PHOTOS_BUCKET = 'photo-test-only';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_ACCESS_KEY_ID = 'test-only';
process.env.AWS_SECRET_ACCESS_KEY = 'test-only';
const basics = { name:'Jamie', schoolId:searchSchools('Virginia Tech',1)[0].id, major:'Architecture', tags:[] };
const keys = ['photos/self/first.jpg','photos/self/second.jpg'];
const { handler: create } = await import('../.test-build/handlers/createProfile.js');
const { handler: update } = await import('../.test-build/handlers/updateProfile.js');
const { ownView, fullView, publicView } = await import('../.test-build/services/profileViews.js');
const { updateProfile } = await import('../.test-build/repositories/profileRepository.js');
const { DynamoDBDocumentClient } = await import('@aws-sdk/lib-dynamodb');
const event = data => ({body:JSON.stringify({...basics,...data}),requestContext:{authorizer:{jwt:{claims:{sub:'self'}}}}});
test('albums accept up to six unique keys, including an empty album to clear', () => {
 for (const photoKeys of [[],keys,Array.from({length:6},(_,i)=>`photos/self/${i}.jpg`)]) assert.equal(profileSchema.safeParse({...basics,photoKeys}).success,true);
 for (const photoKeys of [[...keys,keys[0]],['bad'],Array.from({length:7},(_,i)=>`photos/self/${i}.jpg`)]) assert.equal(profileSchema.safeParse({...basics,photoKeys}).success,false);
});
test('every photo key and legacy cover must belong to caller before either handler writes', async () => {
 for (const handler of [create,update]) {
  assert.equal((await handler(event({photoKeys:[keys[0],'photos/another/foreign.jpg']}))).statusCode,403);
  assert.equal((await handler(event({photoKeys:keys,photoKey:'photos/another/foreign.jpg'}))).statusCode,403);
 }
});
test('views sign in album order, keep own keys, hide all keys and private contact from strangers', async () => {
 const profile = {...basics,id:'self',school:'test',photoKeys:keys,photoKey:keys[1],instagram:'private'};
 const own = await ownView(profile);
 assert.deepEqual(own.photoKeys,keys);
 assert.deepEqual(own.photoUrls.map(url=>new URL(url).pathname), keys.map(key=>`/${key}`));
 assert.equal(own.photoUrl,own.photoUrls[0]);
 for (const view of [fullView,publicView]) {
  const result = await view(profile);
  assert.equal('photoKey' in result,false); assert.equal('photoKeys' in result,false);
  assert.equal(result.photoUrls.length,2);
  assert.equal('instagram' in result,view === fullView);
 }
});
test('legacy profiles still render and an explicit empty album cannot revive a stale cover', async () => {
 assert.equal((await publicView({...basics,id:'self',school:'test',photoKey:keys[0]})).photoUrls.length,1);
 const clear = await ownView({...basics,id:'self',school:'test',photoKey:keys[0],photoKeys:[]});
 assert.deepEqual(clear.photoUrls,[]); assert.equal(clear.photoUrl,undefined);
});
test('basic updates conditionally preserve albums; explicit clear removes the cover', async t => {
 const commands=[];
 t.mock.method(DynamoDBDocumentClient.prototype,'send',async command => {
  commands.push(command.input);
  return command.constructor.name === 'GetCommand' ? {Item:{...basics,userId:'self',school:'test',photoKeys:keys,photoKey:keys[0]}} : {};
 });
 const saved=await updateProfile('self',basics);
 assert.deepEqual(saved.photoKeys,keys);
 const put=commands[1];
 assert.deepEqual(put.Item.photoKeys,keys);
 assert.equal(commands[0].ConsistentRead,true);
 assert.match(put.ConditionExpression,/#photoKeys = :photoKeys/);
 assert.match(put.ConditionExpression,/#photoKey = :photoKey/);
 const clear=await updateProfile('self',{...basics,photoKeys:[]});
 assert.deepEqual(clear.photoKeys,[]); assert.equal(clear.photoKey,undefined);
});
test('an album changed concurrently is read again instead of overwritten', async t => {
 const {ConditionalCheckFailedException}=await import('@aws-sdk/client-dynamodb');
 let reads=0, writes=0;
 const latest=['photos/self/new.jpg'];
 t.mock.method(DynamoDBDocumentClient.prototype,'send',async command => {
  if(command.constructor.name==='GetCommand') { reads++; return {Item:{...basics,userId:'self',photoKeys:reads===1?keys:latest}}; }
  writes++;
  if(writes===1) throw new ConditionalCheckFailedException({$metadata:{},message:'album changed'});
  assert.deepEqual(command.input.Item.photoKeys,latest);
  return {};
 });
 assert.deepEqual((await updateProfile('self',basics)).photoKeys,latest);
 assert.equal(reads,2); assert.equal(writes,2);
});
test('persistent album contention returns a retryable conflict, never silently overwrites', async t => {
 const {ConditionalCheckFailedException}=await import('@aws-sdk/client-dynamodb');
 let writes=0;
 t.mock.method(DynamoDBDocumentClient.prototype,'send',async command => {
  if(command.constructor.name==='GetCommand') return {Item:{...basics,userId:'self'}};
  writes++; throw new ConditionalCheckFailedException({$metadata:{},message:'album changed'});
 });
 assert.equal((await update(event({}))).statusCode,409); assert.equal(writes,3);
});
