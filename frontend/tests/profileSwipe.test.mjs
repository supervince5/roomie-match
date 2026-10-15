import test from 'node:test';
import assert from 'node:assert/strict';
import {createProfileDrag, moveProfileDrag, profileSwipeDecision, springStep} from '../src/lib/profileSwipe.ts';
for (const sign of [-1, 1]) {
  test(`short flick ${sign} survives the stationary mouse-up sample`, () => {
    const d = createProfileDrag({x:200,y:100,time:0});
    moveProfileDrag(d,{x:200+sign*18,y:100,time:25});
    moveProfileDrag(d,{x:200+sign*18,y:100,time:30});
    assert.equal(profileSwipeDecision(d),sign>0?'like':'pass');
  });
  test(`long slow drag ${sign} requires no velocity`, () => {
    const d=createProfileDrag({x:200,y:100,time:0});
    moveProfileDrag(d,{x:200+sign*1000,y:100,time:500});
    assert.equal(profileSwipeDecision(d),sign>0?'like':'pass');
  });
}
test('vertical scrolling never makes a decision', () => {
  const d=createProfileDrag({x:200,y:100,time:0});
  moveProfileDrag(d,{x:202,y:120,time:20});
  moveProfileDrag(d,{x:300,y:300,time:100});
  assert.equal(d.axis,'y'); assert.equal(profileSwipeDecision(d),null);
});
test('tiny movement and held subthreshold drags do not vote', () => {
  const d=createProfileDrag({x:200,y:100,time:0});
  moveProfileDrag(d,{x:206,y:100,time:1});
  assert.equal(profileSwipeDecision(d),null);
  moveProfileDrag(d,{x:220,y:100,time:20});
  moveProfileDrag(d,{x:220,y:100,time:200});
  assert.equal(profileSwipeDecision(d),null);
});
test('grabbing a returning card preserves its displayed position', () => {
  const d=createProfileDrag({x:200,y:100,time:0},32);
  assert.equal(moveProfileDrag(d,{x:210,y:100,time:20}),42);
});
test('spring is frame-rate independent and settles without overshooting', () => {
  let a={x:100,velocity:0}, b={...a};
  for(let i=0;i<60;i++) {a=springStep(a.x,a.velocity,0,1/60); assert.ok(a.x>=0);}
  for(let i=0;i<120;i++) b=springStep(b.x,b.velocity,0,1/120);
  assert.ok(Math.abs(a.x-b.x)<1e-8); assert.ok(Math.abs(a.x)<.01);
});
test('spring carries release velocity and can reverse from its current position', () => {
  const moving=springStep(30,600,500,1/60);
  assert.ok(moving.x>30);
  const reversed=springStep(moving.x,moving.velocity,0,1/60);
  assert.ok(Number.isFinite(reversed.velocity));
  assert.ok(Math.abs(reversed.x-moving.x)<30);
});
