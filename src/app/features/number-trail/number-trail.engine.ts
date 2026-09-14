import {Hint,Move,Puzzle,PuzzleSpec,neighbours,random} from '../puzzles/puzzle.model';

/** Backbite transformations preserve a full Hamiltonian path without a retry loop. */
export function createTrail(seed: number, standard: boolean): Puzzle {
  const size=standard?5:4, rng=random(seed);
  let path=Array.from({length:size*size},(_,i)=>Math.floor(i/size)*size+(Math.floor(i/size)%2?size-1-i%size:i%size));
  for(let i=0;i<240;i++){
    if(rng()<.5)path.reverse();
    const options=neighbours(path[0]!,size).filter(cell=>cell!==path[1]);
    const target=options[Math.floor(rng()*options.length)];
    if(target===undefined)continue;
    const at=path.indexOf(target);
    path=[...path.slice(0,at).reverse(),...path.slice(at)];
  }
  const checkpoints=standard?[0,4,9,14,19,24]:[0,4,8,12,15];
  const labels=Array<number>(size*size).fill(0);
  checkpoints.forEach((step,i)=>labels[path[step]!]=i+1);
  const initial=Array<number>(size*size).fill(0);initial[path[0]!]=1;
  const solution=Array<number>(size*size).fill(0);path.forEach((cell,i)=>solution[cell]=i+1);
  return {size,initial,solution,clues:[labels]};
}
export function trailMove(puzzle:Puzzle,values:readonly number[],index:number):Move {
  const length=Math.max(...values), labels=puzzle.clues[0]!;
  if(index<0||index>=values.length)return{values,selected:-1,message:'Choose a square on the board.'};
  if(values[index]!>0)return{values:values.map(value=>value>values[index]!?0:value),selected:-1,message:'Route rewound. Try a different turn.'};
  const head=values.indexOf(length);
  if(!neighbours(head,puzzle.size).includes(index))return{values,selected:-1,message:'Move one square horizontally or vertically from the glowing endpoint.'};
  const visited=labels.filter((label,i)=>label>0&&values[i]!>0).length;
  if(labels[index]!>0&&labels[index]!==visited+1)return{values,selected:-1,message:'Reach checkpoint '+(visited+1)+' next.'};
  if(labels[index]===Math.max(...labels)&&length!==values.length-1)return{values,selected:-1,message:'The final checkpoint is the finish. Fill every other square first.'};
  const next=[...values];next[index]=length+1;
  return{values:next,selected:-1,message:'Keep a way through the unvisited squares. Tap an earlier square to rewind.'};
}
export function trailSolved(puzzle:Puzzle,values:readonly number[]):boolean {
  if(values.some(value=>value===0)||new Set(values).size!==values.length)return false;
  let previous=0;
  for(let label=1;label<=Math.max(...puzzle.clues[0]!);label++){
    const step=values[puzzle.clues[0]!.indexOf(label)]!;
    if(step<=previous)return false;previous=step;
  }
  for(let step=2;step<=values.length;step++)if(!neighbours(values.indexOf(step-1),puzzle.size).includes(values.indexOf(step)))return false;
  return true;
}
export function trailHint(puzzle:Puzzle,values:readonly number[]):Hint {
  let budget=60000;
  const length=Math.max(...values);
  const search=(state:readonly number[]):number|null=>{
    if(--budget<0)return null;
    const filled=Math.max(...state);
    if(filled===state.length)return trailSolved(puzzle,state)?-2:null;
    for(const index of neighbours(state.indexOf(filled),puzzle.size)){
      if(state[index]!==0)continue;
      const next=trailMove(puzzle,state,index).values;
      if(next===state)continue;
      const answer=search(next);
      if(answer!==null)return filled===length?index:answer;
    }
    return null;
  };
  const index=search(values);
  return index!==null&&index>=0
    ?{index,message:'A route to the finish continues through the outlined square.'}
    :{index:-1,message:'No continuation found within the hint search. Undo a few turns to reopen space, or reset.'};
}
export const TRAIL:PuzzleSpec={
  id:'pocket-post',kind:'trail',title:'Number Trail',subtitle:'Spatial planning',
  instructions:'Start at 1. Draw one continuous path through every square, visiting the numbered checkpoints in order. Move horizontally or vertically; never cross your path.',
  tip:'Look ahead: a tempting shortcut can isolate an entire corner. Tap an earlier square to rewind.',
  create:createTrail,act:trailMove,solved:trailSolved,hint:trailHint,
  status:(_p,values)=>Math.max(...values)+' / '+values.length+' squares connected'
};
