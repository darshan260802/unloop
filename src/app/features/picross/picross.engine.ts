import {Hint,Move,Puzzle,PuzzleSpec,random} from '../puzzles/puzzle.model';

export function runs(line:readonly number[]):number[]{
  const result:number[]=[];let count=0;
  for(const value of [...line,0]){if(value===1)count++;else if(count){result.push(count);count=0}}
  return result.length?result:[0];
}
export function lineOptions(clue:readonly number[],known:readonly number[]):number[][]{
  const options:number[][]=[];
  for(let mask=0;mask<2**known.length;mask++){
    const line=known.map((_,i)=>(mask>>i)&1);
    if(known.some((value,i)=>value!==-1&&value!==line[i]))continue;
    if(runs(line).join(',')===clue.join(','))options.push(line);
  }
  return options;
}
export function picrossDeduction(puzzle:Puzzle,values:readonly number[]):Hint{
  const n=puzzle.size;
  for(let axis=0;axis<2;axis++)for(let line=0;line<n;line++){
    const indices=Array.from({length:n},(_,i)=>axis===0?line*n+i:i*n+line);
    const options=lineOptions(puzzle.clues[axis*n+line]!,indices.map(i=>values[i]!));
    const name=(axis===0?'Row ':'Column ')+(line+1);
    if(options.length===0)return{index:indices[0]!,message:name+' contradicts its clues. Erase a mark there or undo your last move.'};
    for(let i=0;i<n;i++)if(values[indices[i]!]===-1&&options.every(option=>option[i]===options[0]![i])){
      return{index:indices[i]!,message:name+': all '+options.length+' possible arrangements make the outlined square '+(options[0]![i]===1?'filled. Choose Fill.':'empty. Choose × Empty.')};
    }
  }
  return{index:-1,message:'Compare the row and column clues together. Undo uncertain marks if no deduction is available.'};
}
export function logicallySolvable(puzzle:Puzzle):boolean{
  const values=[...puzzle.initial],n=puzzle.size;
  for(let pass=0;pass<n*n;pass++){
    let changed=false;
    for(let axis=0;axis<2;axis++)for(let line=0;line<n;line++){
      const indices=Array.from({length:n},(_,i)=>axis===0?line*n+i:i*n+line);
      const options=lineOptions(puzzle.clues[axis*n+line]!,indices.map(i=>values[i]!));
      if(!options.length)return false;
      for(let i=0;i<n;i++)if(values[indices[i]!]===-1&&options.every(option=>option[i]===options[0]![i])){
        values[indices[i]!]=options[0]![i]!;changed=true;
      }
    }
    if(values.every(value=>value!==-1))return true;
    if(!changed)return false;
  }
  return false;
}
function fromPicture(solution:readonly number[]):Puzzle{
  const size=5;
  const clues=Array.from({length:size*2},(_,line)=>runs(Array.from({length:size},(_,i)=>solution[line<size?line*size+i:i*size+line-size]!)));
  return{size,initial:Array<number>(size*size).fill(-1),solution,clues};
}
export function createPicross(seed:number,standard:boolean):Puzzle{
  const rng=random(seed);
  for(let attempt=0;attempt<500;attempt++){
    const solution=Array.from({length:25},()=>rng()<(standard?.48:.62)?1:0);
    const count=solution.filter(Boolean).length;
    if(count<9||count>19)continue;
    const puzzle=fromPicture(solution);
    if(standard&&puzzle.clues.some(clue=>clue[0]===5||clue[0]===0))continue;
    if(logicallySolvable(puzzle))return puzzle;
  }
  return fromPicture([0,0,1,0,0,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,0,0,1,0,0]);
}
export function picrossMove(_puzzle:Puzzle,values:readonly number[],index:number,_selected:number,mode:number):Move{
  if(index<0||index>=values.length)return{values,selected:-1,message:'Choose a square.'};
  const next=[...values];next[index]=values[index]===mode?-1:mode;
  return{values:next,selected:-1,message:'Clues describe filled groups in order, separated by at least one empty square.'};
}
export function picrossSolved(puzzle:Puzzle,values:readonly number[]):boolean{return values.length===puzzle.solution.length&&values.every((value,i)=>value===puzzle.solution[i])}
export const PICROSS:PuzzleSpec={
  id:'stencil-studio',kind:'picross',title:'Picross',subtitle:'Picture deduction',
  instructions:'Reveal the hidden pattern using the numbers beside each row and column. A clue of 2 1 means two filled squares, a gap, then one filled square. Mark the remaining squares ×.',
  tip:'For a five-square line with clue 3, the middle square must be filled wherever the group starts. Use overlapping possibilities, then compare crossing clues. No guessing is needed.',
  create:createPicross,act:picrossMove,solved:picrossSolved,hint:picrossDeduction,
  status:(_p,values)=>values.filter(value=>value!==-1).length+' / '+values.length+' squares decided'
};
