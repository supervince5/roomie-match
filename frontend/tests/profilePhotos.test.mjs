import test from 'node:test';
import assert from 'node:assert/strict';
import { profileWithBasics } from '../src/lib/guidedDiscovery.ts';
test('guided basic saves retain the complete ordered album without signed URLs', () => {
 const photoKeys=['photos/self/a.jpg','photos/self/b.jpg'];
 const profile={id:'self',name:'Alex',schoolId:1,school:'test',major:'',tags:[],photoKeys,photoUrls:['signed-a','signed-b']};
 const result=profileWithBasics(profile,{name:'Alex',school:{id:1,name:'test'},major:'Art',cleanliness:''});
 assert.deepEqual(result.photoKeys,photoKeys);
 assert.equal('photoUrls' in result,false);
});
test('right swipes advance photos; left swipes go back, vertical and tiny moves do nothing', async () => {
 const { photoSwipeStep, nextPhotoIndex } = await import('../src/lib/profilePhotos.ts');
 assert.equal(photoSwipeStep(85,10),1);
 assert.equal(photoSwipeStep(-85,10),-1);
 assert.equal(photoSwipeStep(85,120),0);
 assert.equal(photoSwipeStep(12,0),0);
 assert.equal(nextPhotoIndex(2,1,3),2);
 assert.equal(nextPhotoIndex(0,-1,3),0);
 assert.equal(nextPhotoIndex(0,1,3),1);
});
test('album URLs override legacy cover, including explicit empty albums', async () => {
 const { profilePhotoUrls, editablePhotos } = await import('../src/lib/profilePhotos.ts');
 assert.deepEqual(profilePhotoUrls({photoUrl:'legacy'}),['legacy']);
 assert.deepEqual(profilePhotoUrls({photoUrl:'stale',photoUrls:[]}),[]);
 assert.deepEqual(profilePhotoUrls({photoUrl:'stale',photoUrls:['a','b']}),['a','b']);
 assert.deepEqual(editablePhotos({photoKey:'legacy',photoUrl:'signed'}),[{key:'legacy',url:'signed'}]);
 assert.deepEqual(editablePhotos({photoKey:'stale',photoUrl:'stale',photoKeys:[],photoUrls:[]}),[]);
 assert.deepEqual(editablePhotos({photoKeys:['a','b'],photoUrls:['signed-a','signed-b']}),[{key:'a',url:'signed-a'},{key:'b',url:'signed-b'}]);
});
