import {Puzzle,PuzzleSpec} from './puzzle.model';

const memory=new Map<string,string[]>();
export function puzzleFingerprint(spec:PuzzleSpec,puzzle:Puzzle):string {
  // Solutions are deliberately excluded: the player-visible board defines a repeat.
  return JSON.stringify([puzzle.size,puzzle.initial,(spec.kind==='trail'||spec.kind==='picross')?puzzle.clues:[]]);
}
export function freshPuzzle(spec:PuzzleSpec,standard:boolean):{seed:number;puzzle:Puzzle}{
  const key='unloop:recent-boards:v2:'+spec.kind;
  let recent=memory.get(key)??[];
  try{
    const raw:unknown=JSON.parse(localStorage.getItem(key)??'[]');
    if(Array.isArray(raw))recent=raw.filter((value):value is string=>typeof value==='string').slice(-128);
  }catch{/* Keep the in-memory history if browser storage is unavailable. */}
  let seed=crypto.getRandomValues(new Uint32Array(1))[0]!;
  let puzzle=spec.create(seed,standard),fingerprint=puzzleFingerprint(spec,puzzle);
  for(let attempt=0;attempt<32&&recent.includes(fingerprint);attempt++){
    seed=(seed+2654435761)>>>0;puzzle=spec.create(seed,standard);fingerprint=puzzleFingerprint(spec,puzzle);
  }
  // The pools are vastly larger than the recent window. Bounded retries avoid blocking play.
  recent=[...recent.filter(value=>value!==fingerprint),fingerprint].slice(-128);
  memory.set(key,recent);
  try{localStorage.setItem(key,JSON.stringify(recent))}catch{/* Continue in memory. */}
  return{seed,puzzle};
}
