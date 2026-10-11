import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {DynamoDBDocumentClient} from '@aws-sdk/lib-dynamodb';
import {TransactionCanceledException} from '@aws-sdk/client-dynamodb';
process.env.TABLE_NAME='roomie-unit-test';
const rows=new Map();
const key=k=>JSON.stringify([k.PK,k.SK]);
let endMatchDuringSend=false;
DynamoDBDocumentClient.prototype.send=async function(command){
 const i=command.input;switch(command.constructor.name){
  case 'GetCommand':return {Item:rows.get(key(i.Key))};
  case 'PutCommand':rows.set(key(i.Item),structuredClone(i.Item));return {};
  case 'QueryCommand':return {Items:[...rows.values()].filter(x=>x.PK===i.ExpressionAttributeValues[':pk'] && (!i.ExpressionAttributeValues[':prefix'] || x.SK.startsWith(i.ExpressionAttributeValues[':prefix'])))};
  case 'DeleteCommand':{const Item=rows.get(key(i.Key));rows.delete(key(i.Key));return {Attributes:Item};}
  case 'BatchWriteCommand':for(const requests of Object.values(i.RequestItems))for(const r of requests)rows.delete(key(r.DeleteRequest.Key));return {};
  case 'TransactWriteCommand':{
   if(endMatchDuringSend)rows.delete(key({PK:'USER#b',SK:'MATCH#a'}));
   for(const op of i.TransactItems){if(op.ConditionCheck){const c=op.ConditionCheck;const item=rows.get(key(c.Key));if(!item || item.matchedAt!==c.ExpressionAttributeValues[':matchedAt'])throw new TransactionCanceledException({message:'Condition failed',$metadata:{}});}else if(rows.has(key(op.Put.Item)))throw new TransactionCanceledException({message:'Duplicate',$metadata:{}});}
   for(const op of i.TransactItems)if(op.Put)rows.set(key(op.Put.Item),structuredClone(op.Put.Item));return {};
  }
  default:throw new Error('Unexpected database command '+command.constructor.name);
 }
};
const {handler}=await import('../.test-build/handlers/messages.js');
const {deleteMatch,deleteEverythingFor}=await import('../.test-build/repositories/swipeRepository.js');
const {messageSchema}=await import('../.test-build/validation/messageSchemas.js');
const id='eeb10c86-6f1f-4a56-8d1d-bfe8fdc13520';
const event=(method='GET',body,peer='b',user='a')=>({pathParameters:{userId:peer},requestContext:{authorizer:{jwt:{claims:{sub:user}}},http:{method}},body:body===undefined ? undefined : JSON.stringify(body)});
beforeEach(()=>{rows.clear();endMatchDuringSend=false;for(const [a,b] of [['a','b'],['b','a']]){const item={PK:`USER#${a}`,SK:`MATCH#${b}`,matchedAt:'2026-10-10T12:00:00.000Z'};rows.set(key(item),item);}});
test('writes to both participants and retries return the same message',async()=>{const one=await handler(event('POST',{text:' Hello roommate! ',clientId:id}));assert.equal(one.statusCode,201);const m=JSON.parse(one.body).message;assert.equal(m.text,'Hello roommate!');const two=await handler(event('POST',{text:'Hello roommate!',clientId:id}));assert.deepEqual(JSON.parse(two.body).message,m);assert.equal([...rows.values()].filter(x=>x.SK.startsWith('MESSAGE#')).length,2);const peer=await handler(event('GET',undefined,'a','b'));assert.equal(JSON.parse(peer.body).messages[0].senderId,'a');});
test('denies non-matches before reading or writing conversation data',async()=>{rows.delete(key({PK:'USER#b',SK:'MATCH#a'}));for(const method of ['GET','POST'])assert.equal((await handler(event(method,{text:'Hi',clientId:id}))).statusCode,403);assert.equal([...rows.values()].filter(x=>x.SK.startsWith('MESSAGE#')).length,0);});
test('transaction prevents a send when unmatch races the request',async()=>{endMatchDuringSend=true;const result=await handler(event('POST',{text:'Hi',clientId:id}));assert.equal(result.statusCode,403);assert.equal([...rows.values()].filter(x=>x.SK.startsWith('MESSAGE#')).length,0);});
test('rejects empty, oversized, malformed, and extra-field messages',async()=>{for(const body of [{text:' ',clientId:id},{text:'a'.repeat(2001),clientId:id},{text:'Hi',clientId:'invalid'},{text:'Hi',clientId:id,admin:true}]){assert.equal(messageSchema.safeParse(body).success,false);assert.equal((await handler(event('POST',body))).statusCode,400);}});
test('cannot reuse a retry ID to overwrite a message',async()=>{await handler(event('POST',{text:'First',clientId:id}));assert.equal((await handler(event('POST',{text:'Changed',clientId:id}))).statusCode,409);});
test('unmatching deletes both message copies and revokes access',async()=>{await handler(event('POST',{text:'Hi',clientId:id}));assert.equal(await deleteMatch('a','b'),true);assert.equal(rows.size,0);assert.equal((await handler(event())).statusCode,403);});
test('deleting an account removes its messages from the other account too',async()=>{await handler(event('POST',{text:'Hi',clientId:id}));await deleteEverythingFor('a');assert.equal(rows.size,0);});
test('refuses self-conversations',async()=>{assert.equal((await handler(event('GET',undefined,'a'))).statusCode,400);});
