import {POCKET_FIXTURES,checkPocket,createPocketState,extendPath} from '../src/app/features/pocket-post/pocket-post.engine';
import {STENCIL_FIXTURES,applyStencil,createStencilState} from '../src/app/features/stencil-studio/stencil.engine';
import {HARBOUR_FIXTURES,createHarbourState,launchBoat,routedDock} from '../src/app/features/little-harbour/harbour.engine';
import {ORBIT_FIXTURES,createOrbitState,isOrbitSolved,rotateRing} from '../src/app/features/orbit-garden/orbit.engine';

function assert(condition:boolean,message:string):asserts condition{if(!condition)throw new Error(message)}
function unique(ids:readonly string[],group:string):void{assert(new Set(ids).size===ids.length,`${group} contains duplicate fixture IDs`)}

unique(POCKET_FIXTURES.map((fixture)=>fixture.id),'Pocket Post');
for(const fixture of POCKET_FIXTURES){
  let state=createPocketState(fixture);
  for(const point of fixture.solution.slice(1))state=extendPath(fixture,state,point);
  state=checkPocket(fixture,state);
  assert(state.solved,`${fixture.id} solution did not deliver every parcel`);
}

unique(STENCIL_FIXTURES.map((fixture)=>fixture.id),'Stencil Studio');
for(const fixture of STENCIL_FIXTURES){
  let state=createStencilState();
  for(const action of fixture.solution){
    state={...state,selected:action.tool,rotation:action.rotation};
    state=applyStencil(fixture,state);
  }
  assert(state.solved,`${fixture.id} solution did not match its target card`);
  assert(fixture.target.some((ink)=>ink!=='blank'),`${fixture.id} generated a blank target card`);
}

unique(HARBOUR_FIXTURES.map((fixture)=>fixture.id),'Little Harbour');
for(const fixture of HARBOUR_FIXTURES){
  let state=createHarbourState(fixture);
  while(state.queue.length){
    const boat=state.queue[0]!;
    state={...state,junctions:boat.route};
    assert(routedDock(fixture,state.junctions)===boat.dock,`${fixture.id} known route points to the wrong dock`);
    const before=state.queue.length;
    state=launchBoat(fixture,state);
    assert(state.queue.length===before-1,`${fixture.id} could not deliver ${boat.id}`);
  }
  assert(state.solved,`${fixture.id} did not finish after its queue was delivered`);
}

unique(ORBIT_FIXTURES.map((fixture)=>fixture.id),'Orbit Garden');
for(const fixture of ORBIT_FIXTURES){
  let state=createOrbitState(fixture);
  for(let ring=0;ring<3;ring++){
    state={...state,selected:ring};
    let turns=0;
    while(state.offsets[ring]!==fixture.target[ring]&&turns<8){state=rotateRing(fixture,state,1);turns++}
    assert(turns<8,`${fixture.id} ring ${ring+1} is unreachable`);
  }
  assert(state.solved&&isOrbitSolved(fixture,state.offsets),`${fixture.id} did not water every ring`);
}

const total=POCKET_FIXTURES.length+STENCIL_FIXTURES.length+HARBOUR_FIXTURES.length+ORBIT_FIXTURES.length;
console.log(`Validated ${total} playable fixtures across four games.`);

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
