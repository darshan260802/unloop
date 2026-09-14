import {Hint,Move,Puzzle,PuzzleSpec,neighbours,random} from '../puzzles/puzzle.model';

export function rotatePorts(value:number,direction=1):number{
  return direction===1?((value<<1)&15)|(value>>3):(value>>1)|((value&1)<<3);
}
export function portDirection(from:number,to:number,size:number):number{
  return to===from-size?1:to===from+1?2:to===from+size?4:8;
}
export function connected(puzzle:Puzzle,values:readonly number[]):Set<number>{
  const source=Math.floor(puzzle.size*puzzle.size/2),seen=new Set([source]),queue=[source];
  for(let cursor=0;cursor<queue.length;cursor++){
    const from=queue[cursor]!;
    for(const to of neighbours(from,puzzle.size)){
      const direction=portDirection(from,to,puzzle.size),opposite=rotatePorts(rotatePorts(direction));
      if((values[from]!&direction)&&(values[to]!&opposite)&&!seen.has(to)){seen.add(to);queue.push(to)}
    }
  }
  return seen;
}
export function circuitSolved(puzzle:Puzzle,values:readonly number[]):boolean{
  if(connected(puzzle,values).size!==values.length)return false;
  for(let index=0;index<values.length;index++){
    let matched=0;
    for(const next of neighbours(index,puzzle.size)){
      const bit=portDirection(index,next,puzzle.size),opposite=rotatePorts(rotatePorts(bit));
      if((values[index]!&bit)&&(values[next]!&opposite))matched|=bit;
    }
    if(matched!==values[index])return false;
  }
  return true;
}
export function createCircuit(seed:number,standard:boolean):Puzzle{
  const size=standard?5:4,rng=random(seed),solution=Array<number>(size*size).fill(0);
  const visited=new Set([Math.floor(size*size/2)]);
  while(visited.size<solution.length){
    const edges:number[][]=[];
    for(const from of visited)for(const to of neighbours(from,size))if(!visited.has(to))edges.push([from,to]);
    const [from,to]=edges[Math.floor(rng()*edges.length)]!;
    const bit=portDirection(from!,to!,size);
    solution[from!]!|=bit;solution[to!]!|=rotatePorts(rotatePorts(bit));visited.add(to!);
  }
  const initial=solution.map(value=>{let port=value;for(let turns=Math.floor(rng()*4);turns>0;turns--)port=rotatePorts(port);return port});
  // Ensure enough decisions even in the unlikely near-solved scramble.
  for(let i=0;i<initial.length&&initial.filter((value,j)=>value!==solution[j]).length<6;i++)if(initial[i]===solution[i]&&initial[i]!==15)initial[i]=rotatePorts(initial[i]!);
  return{size,initial,solution,clues:[]};
}
export function circuitMove(_puzzle:Puzzle,values:readonly number[],index:number,_selected:number,mode:number):Move{
  const next=[...values];next[index]=rotatePorts(next[index]!,mode===-1?-1:1);
  return{values:next,selected:-1,message:'Only touching wire ends connect. All tiles must join the source, with no loose wires.'};
}
export function portNames(value:number):string{return [1,2,4,8].map((bit,i)=>value&bit?['north','east','south','west'][i]:null).filter(Boolean).join(', ')}
export function circuitHint(puzzle:Puzzle,values:readonly number[]):Hint{
  // Solve orientation constraints, accepting all reciprocal possibilities.
  const domains=values.map((value,index)=>{
    const options=new Set<number>();let port=value;
    for(let i=0;i<4;i++){options.add(port);port=rotatePorts(port)}
    let inside=0;for(const next of neighbours(index,puzzle.size))inside|=portDirection(index,next,puzzle.size);
    return [...options].filter(option=>(option&inside)===option);
  });
  for(let pass=0;pass<values.length;pass++){
    let changed=false;
    for(let index=0;index<values.length;index++){
      const nextDomain=domains[index]!.filter(option=>neighbours(index,puzzle.size).every(next=>{
        const bit=portDirection(index,next,puzzle.size),opposite=rotatePorts(rotatePorts(bit));
        return domains[next]!.some(other=>Boolean(option&bit)===Boolean(other&opposite));
      }));
      if(nextDomain.length!==domains[index]!.length){domains[index]=nextDomain;changed=true}
    }
    if(!changed)break;
  }
  const forced=domains.findIndex((options,index)=>options.length===1&&options[0]!==values[index]);
  if(forced>=0)return{index:forced,message:'The edge and neighbouring wire shapes force this tile to point '+portNames(domains[forced]![0]!) +'. Rotate the outlined tile; unlock it first if needed.'};
  const index=values.findIndex((value,i)=>value!==puzzle.solution[i]);
  return{index,message:index>=0?'One valid network has this tile pointing '+portNames(puzzle.solution[index]!) +'. Rotate it to those directions.':'Check for disconnected wires.'};
}
export const CIRCUIT:PuzzleSpec={
  id:'orbit-garden',kind:'circuit',title:'Circuit',subtitle:'Network reasoning',
  instructions:'Rotate the wire tiles to connect every tile to the central power source. Wire ends must meet on both sides. Leave no loose wires at the edges or between tiles.',
  tip:'Start at the corners and edges: wires cannot leave the board. Follow those constraints inward. Lock tiles you are confident about, then work on the remaining branches.',
  create:createCircuit,act:circuitMove,solved:circuitSolved,hint:circuitHint,
  status:(puzzle,values)=>connected(puzzle,values).size+' / '+values.length+' tiles powered'
};
