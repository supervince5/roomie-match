import test from 'node:test';
import assert from 'node:assert/strict';
import {isOutsideDialog} from '../src/lib/dialog.ts';
test('blank space inside dialog is not a backdrop click',()=>{
  const rect={left:100,right:500,top:100,bottom:600};
  assert.equal(isOutsideDialog({clientX:110,clientY:110},rect),false);
  assert.equal(isOutsideDialog({clientX:100,clientY:600},rect),false);
  assert.equal(isOutsideDialog({clientX:99,clientY:300},rect),true);
  assert.equal(isOutsideDialog({clientX:200,clientY:601},rect),true);
});
