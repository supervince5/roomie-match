import test from 'node:test';
import assert from 'node:assert/strict';
import { guidedSteps, validateGuidedStep, profileWithBasics, setupKeys, hasSeenSetup, markSetupSeen } from '../src/lib/guidedDiscovery.ts';
const values={name:' Jamie ',school:{id:233921,name:'Virginia Tech'},major:' Architecture ',cleanliness:'very_clean'};
test('new students see basics while completed profiles skip repeated questions',()=>{
 assert.deepEqual(guidedSteps(null),['hello','name','school','major','cleanliness','ready']);
 assert.deepEqual(guidedSteps({name:'Alex',schoolId:1,major:'Biology'}),['hello','cleanliness','ready']);
 assert.deepEqual(guidedSteps(null,false),['hello','name','school','major','ready']);
});
test('guided basics reject blanks and unselected colleges but allow skipping a preference',()=>{
 assert.ok(validateGuidedStep('name',{...values,name:' '}));
 assert.ok(validateGuidedStep('school',{...values,school:null}));
 assert.ok(validateGuidedStep('major',{...values,major:' '}));
 assert.equal(validateGuidedStep('cleanliness',{...values,cleanliness:''}),'');
});
test('new profile contains only supplied basics, never inferred living habits',()=>{
 assert.deepEqual(profileWithBasics(null,values),{name:'Jamie',schoolId:233921,major:'Architecture',tags:[]});
});
test('filling missing basics preserves photos, preferences and existing details',()=>{
 const existing={id:'self',school:'Old label',photoUrl:'temporary-url',name:'Alex',schoolId:2,major:'',tags:['Cooking'],photoKey:'photos/self/photo.jpg',budget:{min:500,max:900},cleanliness:'relaxed',smoking:false};
 const saved=profileWithBasics(existing,values);
 assert.equal(saved.name,'Alex');assert.equal(saved.schoolId,2);assert.equal(saved.major,'Architecture');
 assert.equal(saved.photoKey,existing.photoKey);assert.deepEqual(saved.budget,existing.budget);assert.equal(saved.cleanliness,'relaxed');
 assert.equal('id' in saved,false);assert.equal('photoUrl' in saved,false);assert.equal('school' in saved,false);
});
test('first-visit markers are account scoped and storage failures do not block setup',()=>{
 const data=new Map();const storage={getItem:key=>data.get(key),setItem:(key,value)=>data.set(key,value)};
 assert.equal(hasSeenSetup(storage,setupKeys('a').hint),false);markSetupSeen(storage,setupKeys('a').hint);
 assert.equal(hasSeenSetup(storage,setupKeys('a').hint),true);assert.equal(hasSeenSetup(storage,setupKeys('b').hint),false);
 const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};
 assert.equal(hasSeenSetup(blocked,'key'),false);assert.doesNotThrow(()=>markSetupSeen(blocked,'key'));
});
