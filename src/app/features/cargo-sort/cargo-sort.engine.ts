import {Hint,Move,Puzzle,PuzzleSpec,random} from '../puzzles/puzzle.model';

interface CargoFixture {readonly colors:number;readonly initial:readonly number[];readonly moves:readonly (readonly number[])[]}
const FIXTURES:readonly CargoFixture[]=[{"colors":3,"initial":[1,1,3,1,2,1,2,2,3,3,3,2,0,0,0,0,0,0,0,0],"moves":[[0,3],[0,4],[3,0],[1,3],[1,3],[0,1],[0,1],[2,3],[1,0],[1,0],[1,0],[1,3],[4,2]]},{"colors":3,"initial":[2,1,1,3,3,3,1,2,2,2,1,3,0,0,0,0,0,0,0,0],"moves":[[0,3],[2,3],[0,2],[0,4],[1,0],[1,4],[1,3],[1,3],[2,4],[2,4],[0,2],[0,2]]},{"colors":3,"initial":[2,3,3,2,3,1,3,2,1,2,1,1,0,0,0,0,0,0,0,0],"moves":[[0,3],[1,3],[0,1],[0,4],[0,3],[1,4],[1,4],[2,1],[2,1],[2,3],[1,2],[1,2],[1,2],[1,4]]},{"colors":3,"initial":[3,3,2,3,2,1,3,2,1,1,2,1,0,0,0,0,0,0,0,0],"moves":[[0,3],[1,0],[1,3],[2,1],[0,2],[0,4],[0,3],[0,3],[2,4],[2,4],[1,2],[1,2],[1,4]]},{"colors":3,"initial":[3,2,1,3,2,2,3,1,3,1,1,2,0,0,0,0,0,0,0,0],"moves":[[0,3],[1,0],[1,3],[2,1],[0,2],[0,4],[0,1],[0,3],[2,4],[2,4],[2,4],[2,3]]},{"colors":3,"initial":[2,3,1,3,1,2,3,2,3,1,1,2,0,0,0,0,0,0,0,0],"moves":[[0,3],[0,4],[0,3],[1,0],[1,3],[0,1],[0,1],[2,0],[1,0],[1,0],[1,0],[1,2],[2,4],[2,4],[2,4],[2,3]]},{"colors":3,"initial":[1,1,3,3,2,3,2,2,2,1,1,3,0,0,0,0,0,0,0,0],"moves":[[0,3],[0,3],[2,3],[0,2],[1,4],[1,4],[1,3],[1,4],[2,0],[2,0],[2,0],[2,4]]},{"colors":3,"initial":[3,2,1,2,3,3,1,2,2,1,1,3,0,0,0,0,0,0,0,0],"moves":[[0,3],[1,3],[0,1],[0,3],[2,0],[1,2],[1,4],[0,1],[0,1],[2,4],[2,4],[2,4],[2,3]]},{"colors":3,"initial":[3,1,2,3,1,1,3,2,2,3,1,2,0,0,0,0,0,0,0,0],"moves":[[0,3],[1,0],[1,3],[0,4],[0,4],[0,1],[0,3],[2,4],[1,2],[2,0],[2,0],[0,1],[0,1],[2,3],[2,4]]},{"colors":3,"initial":[2,2,1,3,1,3,2,3,2,1,3,1,0,0,0,0,0,0,0,0],"moves":[[0,3],[1,3],[2,0],[2,3],[0,2],[0,2],[0,1],[1,4],[1,0],[1,3],[2,1],[2,1],[2,1],[2,0],[4,0]]},{"colors":3,"initial":[2,2,1,1,3,1,3,2,3,3,2,1,0,0,0,0,0,0,0,0],"moves":[[0,3],[0,3],[1,0],[2,3],[0,2],[1,4],[1,3],[1,4],[2,0],[2,0],[2,4],[2,4]]},{"colors":3,"initial":[2,2,3,2,3,3,1,1,1,3,2,1,0,0,0,0,0,0,0,0],"moves":[[0,3],[0,4],[3,0],[1,3],[1,3],[2,3],[0,2],[4,1],[2,0],[2,0],[1,2],[1,2],[2,4],[2,1],[2,1],[1,4],[2,3],[1,4],[1,4]]},{"colors":4,"initial":[3,2,4,2,2,1,1,4,4,1,3,2,3,3,1,4,0,0,0,0,0,0,0,0],"moves":[[0,4],[1,0],[2,4],[0,5],[0,5],[0,4],[0,2],[3,5],[1,3],[1,0],[1,4],[3,0],[3,0],[2,3],[2,3],[0,2],[0,2],[2,1],[2,0],[2,0],[0,1],[2,5],[0,1],[0,1]]},{"colors":4,"initial":[2,4,4,2,4,3,1,1,2,1,1,3,3,2,4,3,0,0,0,0,0,0,0,0],"moves":[[0,4],[0,5],[0,5],[0,4],[1,0],[1,0],[2,1],[0,2],[3,1],[2,0],[2,0],[2,0],[2,4],[3,5],[3,4],[1,3],[1,3],[1,3],[1,5]]},{"colors":4,"initial":[4,2,1,1,3,4,4,2,1,4,3,2,1,2,3,3,0,0,0,0,0,0,0,0],"moves":[[0,4],[0,4],[1,0],[2,0],[3,2],[0,5],[0,5],[0,5],[0,1],[2,3],[1,0],[1,0],[1,0],[1,2],[3,1],[2,1],[2,1],[0,2],[0,2],[1,3],[2,0],[2,0],[2,0],[2,4],[3,1],[3,1],[3,5],[3,4]]},{"colors":4,"initial":[1,3,1,4,1,3,2,2,4,2,4,4,1,3,2,3,0,0,0,0,0,0,0,0],"moves":[[0,4],[2,4],[2,4],[1,2],[1,2],[3,1],[2,3],[0,5],[0,1],[0,5],[3,2],[1,0],[1,0],[1,0],[1,5],[2,3],[2,1],[2,1],[2,4],[3,1],[3,1],[0,3],[0,3],[3,2],[3,0],[3,0],[0,2],[3,5],[0,2],[0,2]]},{"colors":4,"initial":[2,2,3,4,1,2,1,3,1,4,4,1,4,3,3,2,0,0,0,0,0,0,0,0],"moves":[[0,4],[1,0],[2,1],[2,4],[2,4],[1,2],[1,2],[3,1],[0,3],[0,5],[0,1],[3,5],[1,0],[1,0],[1,0],[1,2],[3,5],[3,5],[3,4]]},{"colors":4,"initial":[2,4,1,4,2,4,3,1,1,3,2,2,3,4,1,3,0,0,0,0,0,0,0,0],"moves":[[0,4],[1,0],[3,1],[0,3],[0,5],[0,4],[2,0],[2,0],[1,2],[1,2],[1,4],[0,1],[3,5],[0,1],[0,1],[3,5],[3,4],[2,3],[2,3],[2,3],[2,5]]},{"colors":4,"initial":[1,1,2,4,3,1,2,3,4,4,3,3,1,2,4,2,0,0,0,0,0,0,0,0],"moves":[[0,4],[3,0],[3,4],[0,3],[0,3],[1,5],[2,5],[2,5],[2,4],[2,4],[3,1],[1,2],[1,2],[0,1],[0,1],[2,3],[1,0],[1,0],[1,0],[1,5],[3,2],[3,2],[3,2],[3,0]]},{"colors":4,"initial":[1,4,2,3,1,1,3,4,2,2,1,4,2,4,3,3,0,0,0,0,0,0,0,0],"moves":[[0,4],[3,4],[3,4],[1,3],[1,4],[2,3],[1,2],[0,5],[2,1],[2,1],[3,0],[3,0],[5,2],[0,3],[0,3],[0,5],[0,1],[3,5],[3,5],[3,5],[3,2]]},{"colors":4,"initial":[2,3,1,1,3,3,1,4,4,2,3,2,1,2,4,4,0,0,0,0,0,0,0,0],"moves":[[0,4],[0,4],[0,5],[2,0],[2,5],[0,2],[0,2],[1,0],[1,4],[1,5],[1,5],[3,0],[3,0],[2,3],[2,3],[2,1],[0,2],[3,1],[0,2],[0,2],[1,3],[3,0],[3,0],[1,0],[3,0],[3,4]]},{"colors":4,"initial":[1,3,1,1,3,4,3,4,2,2,1,2,4,4,3,2,0,0,0,0,0,0,0,0],"moves":[[0,4],[0,4],[0,5],[0,4],[1,0],[1,5],[0,1],[2,0],[2,4],[0,2],[3,2],[3,5],[1,3],[1,3],[1,5]]},{"colors":4,"initial":[4,3,1,4,2,2,2,1,4,1,4,2,3,1,3,3,0,0,0,0,0,0,0,0],"moves":[[0,4],[1,0],[2,1],[2,4],[0,2],[0,2],[3,0],[3,0],[2,3],[2,3],[0,5],[0,5],[0,5],[0,4],[3,2],[3,2],[2,0],[2,0],[0,3],[2,0],[0,3],[2,4],[3,0],[3,0],[3,0],[3,5]]},{"colors":4,"initial":[4,3,4,1,1,1,2,2,2,3,4,2,3,4,3,1,0,0,0,0,0,0,0,0],"moves":[[0,4],[3,4],[0,5],[0,3],[0,5],[1,0],[1,0],[1,4],[1,4],[2,0],[2,5],[3,2],[3,2],[3,5],[2,3],[2,3],[2,3],[2,0]]}];
export const CAPACITY=4;
export function stacks(values:readonly number[]):number[][]{
  return Array.from({length:values.length/CAPACITY},(_,i)=>values.slice(i*CAPACITY,(i+1)*CAPACITY).filter(Boolean));
}
export function cargoSolved(_puzzle:Puzzle,values:readonly number[]):boolean{
  return stacks(values).every(stack=>!stack.length||(stack.length===CAPACITY&&stack.every(value=>value===stack[0])));
}
export function cargoTransfer(values:readonly number[],from:number,to:number):readonly number[]|null{
  const piles=stacks(values);
  if(from===to||!piles[from]?.length||!piles[to]||piles[to]!.length===CAPACITY)return null;
  const color=piles[from]!.at(-1)!;
  if(piles[to]!.length&&piles[to]!.at(-1)!==color)return null;
  piles[from]!.pop();piles[to]!.push(color);
  return piles.flatMap(pile=>[...pile,...Array<number>(CAPACITY-pile.length).fill(0)]);
}
/** New shuffled cargo on every seed, accepted only after the solver finds a route. */
export function createCargo(seed:number,standard:boolean):Puzzle{
  const colors=standard?4:3,rng=random(seed);
  for(let attempt=0;attempt<12;attempt++){
    const deck=Array.from({length:colors*4},(_,i)=>Math.floor(i/4)+1);
    for(let i=deck.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[deck[i],deck[j]]=[deck[j]!,deck[i]!]}
    if(stacks(deck).some(stack=>new Set(stack).size===1))continue;
    const initial=[...deck,...Array<number>(8).fill(0)];
    const route=cargoSearch(initial);
    if(!route||route.length<10)continue;
    let solution:readonly number[]=initial;
    for(const move of route)solution=cargoTransfer(solution,move[0]!,move[1]!)!;
    return{size:colors+2,initial,solution,clues:route};
  }
  // Bounded generation fallback: a verified layout, with symbol and bay permutation.
  const pool=FIXTURES.filter(fixture=>fixture.colors===colors),fixture=pool[seed%pool.length]!;
  const count=colors+2,shift=Math.floor(seed/12)%count;
  const initial=Array<number>(fixture.initial.length).fill(0);
  for(let pile=0;pile<count;pile++)for(let slot=0;slot<4;slot++){
    const value=fixture.initial[pile*4+slot]!;
    initial[((pile+shift)%count)*4+slot]=value?((value-1+Math.floor(seed/72))%colors)+1:0;
  }
  const moves=fixture.moves.map(move=>[(move[0]!+shift)%count,(move[1]!+shift)%count]);
  let solution:readonly number[]=initial;
  for(const move of moves)solution=cargoTransfer(solution,move[0]!,move[1]!)!;
  return{size:count,initial,solution,clues:moves};
}
export function cargoMove(_puzzle:Puzzle,values:readonly number[],index:number,selected:number):Move{
  if(selected===index)return{values,selected:-1,message:'Selection cleared.'};
  if(selected===-1){
    return stacks(values)[index]?.length
      ?{values,selected:index,message:'Bay '+(index+1)+' selected. Move its top crate onto the same symbol, or into an empty bay.'}
      :{values,selected:-1,message:'Choose a bay with cargo first.'};
  }
  const next=cargoTransfer(values,selected,index);
  return next?{values:next,selected:-1,message:'Crate moved. Keep a spare bay available for buried symbols.'}
    :{values,selected,message:'That bay is full or has a different top symbol. Choose another destination, or tap the selected bay to cancel.'};
}
/** Canonical stack keys collapse equivalent empty-bay choices. Search is bounded. */
export function cargoSearch(values:readonly number[]):readonly (readonly number[])[]|null{
  let budget=50000;
  const seen=new Set<string>(),piles=stacks(values),count=piles.length;
  const search=(board:number[][],depth:number):number[][]|null=>{
    if(--budget<0||depth>65)return null;
    if(board.every(stack=>!stack.length||(stack.length===4&&stack.every(value=>value===stack[0]))))return [];
    const key=board.map(stack=>stack.join('')).sort().join('|');
    if(seen.has(key))return null;seen.add(key);
    const moves:number[][]=[];
    for(let from=0;from<count;from++){
      const source=board[from]!;
      if(!source.length||(source.length===4&&source.every(value=>value===source[0])))continue;
      let empty=false;
      for(let to=0;to<count;to++){
        const target=board[to]!;
        if(from===to||target.length===4||(target.length&&target.at(-1)!==source.at(-1)))continue;
        if(!target.length){if(empty||source.every(value=>value===source[0]))continue;empty=true}
        moves.push([from,to,target.length?0:1]);
      }
    }
    moves.sort((a,b)=>a[2]!-b[2]!);
    for(const [from,to] of moves){
      const next=board.map(stack=>[...stack]);next[to!]!.push(next[from!]!.pop()!);
      const tail=search(next,depth+1);if(tail)return[[from!,to!],...tail];
    }
    return null;
  };
  return search(piles,0);
}
export function cargoHint(puzzle:Puzzle,values:readonly number[]):Hint{
  const route=values.every((value,i)=>value===puzzle.initial[i])?puzzle.clues:cargoSearch(values);
  const move=route?.[0];
  return move?{index:move[0]!,message:'A solution starts by moving the top crate from bay '+(move[0]!+1)+' to bay '+(move[1]!+1)+'.'}
    :{index:-1,message:'No solution found within the hint search. Undo recent moves to free a bay, or reset. Reset is undoable.'};
}
export const CARGO:PuzzleSpec={
  id:'little-harbour',kind:'cargo',title:'Cargo Sort',subtitle:'Plan several moves ahead',
  instructions:'Group every symbol into a full bay of four matching crates. Select a bay, then a destination. Only the top crate moves, and it can land on the same symbol or in an empty bay.',
  tip:'Empty bays are working space. Before moving a crate, look at the symbol it will uncover. Filling your spare bays too early can trap the cargo you need.',
  create:createCargo,act:cargoMove,solved:cargoSolved,hint:cargoHint,
  status:(_p,values)=>stacks(values).filter(stack=>stack.length===4&&stack.every(value=>value===stack[0])).length+' bays sorted · 4 crates per bay'
};
