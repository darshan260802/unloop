function assert(condition:boolean,message:string):asserts condition{if(!condition)throw new Error(message)}
import {createTrail,trailMove,trailSolved,trailHint} from '../src/app/features/number-trail/number-trail.engine';
for(let seed=1;seed<=64;seed++){
  for(const standard of [false,true]){
    const puzzle=createTrail(seed,standard);
    assert(!trailSolved(puzzle,puzzle.initial),'Trail starts solved');
    let values=puzzle.initial;
    for(let step=2;step<=puzzle.solution.length;step++)values=trailMove(puzzle,values,puzzle.solution.indexOf(step)).values;
    assert(trailSolved(puzzle,values),'Trail '+seed+' solution invalid');
    assert(!trailSolved(puzzle,puzzle.initial),'Trail accepts incomplete board');
    if(seed<=4)assert(trailHint(puzzle,puzzle.initial).index>=0,'Trail initial hint missing');
  }
}
console.log('Validated 128 new Number Trail boards.');

import {createPicross,logicallySolvable,picrossSolved,picrossDeduction} from '../src/app/features/picross/picross.engine';
for(let seed=1;seed<=64;seed++)for(const standard of [false,true]){
  const puzzle=createPicross(seed,standard);
  assert(logicallySolvable(puzzle),'Picross requires guessing: '+seed);
  assert(picrossSolved(puzzle,puzzle.solution),'Picross solution rejected');
  assert(!picrossSolved(puzzle,puzzle.initial),'Picross starts solved');
  assert(picrossDeduction(puzzle,puzzle.initial).index>=0,'Picross has no starting deduction');
}
console.log('Validated 128 new Picross boards with deduction-only solutions.');

import {createCargo,cargoTransfer,cargoSolved,cargoSearch} from '../src/app/features/cargo-sort/cargo-sort.engine';
for(let seed=0;seed<72;seed++)for(const standard of [false,true]){
  const puzzle=createCargo(seed,standard);
  let values=puzzle.initial;
  assert(!cargoSolved(puzzle,values),'Cargo starts solved');
  for(const move of puzzle.clues){
    const next=cargoTransfer(values,move[0]!,move[1]!);
    assert(next,'Cargo solution contains illegal move');values=next;
  }
  assert(cargoSolved(puzzle,values),'Cargo solution failed');
  assert(cargoTransfer(puzzle.initial,0,0)===null,'Cargo permits self transfer');
  if(seed<4)assert(cargoSearch(puzzle.initial)!==null,'Cargo hint solver failed');
}
console.log('Validated 144 Cargo Sort layouts and their legal move sequences.');

import {createCircuit,circuitSolved,rotatePorts,circuitHint} from '../src/app/features/circuit/circuit.engine';
for(let seed=0;seed<128;seed++)for(const standard of [false,true]){
  const puzzle=createCircuit(seed,standard);
  assert(circuitSolved(puzzle,puzzle.solution),'Circuit solution invalid');
  assert(!circuitSolved(puzzle,puzzle.initial),'Circuit starts solved');
  assert(circuitHint(puzzle,puzzle.initial).index>=0,'Circuit hint unavailable');
  assert(puzzle.initial.every((value,i)=>{let port=value;for(let turn=0;turn<4;turn++){if(port===puzzle.solution[i])return true;port=rotatePorts(port)}return false}),'Circuit has unreachable tile');
}
console.log('Validated 256 Circuit networks.');

import {TRAIL} from '../src/app/features/number-trail/number-trail.engine';
import {PICROSS} from '../src/app/features/picross/picross.engine';
import {CARGO} from '../src/app/features/cargo-sort/cargo-sort.engine';
import {CIRCUIT} from '../src/app/features/circuit/circuit.engine';
import {freshPuzzle,puzzleFingerprint} from '../src/app/features/puzzles/fresh-puzzle';
for(const spec of [TRAIL,PICROSS,CARGO,CIRCUIT]){
  const fingerprints=new Set<string>();
  for(let i=0;i<32;i++){
    const {seed,puzzle}=freshPuzzle(spec,false);
    const fingerprint=puzzleFingerprint(spec,puzzle);
    assert(!fingerprints.has(fingerprint),spec.title+' repeated a fresh board');
    fingerprints.add(fingerprint);
    assert(puzzleFingerprint(spec,spec.create(seed,false))===fingerprint,spec.title+' seed is not reproducible');
  }
}
console.log('Fresh-board generation: 32 distinct starts per game; seeded reloads reproduce exactly.');
