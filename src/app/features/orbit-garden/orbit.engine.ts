import {Difficulty} from '../../core/session.models';

export interface OrbitFixture {readonly id:string;readonly difficulty:Difficulty;readonly initial:readonly number[];readonly target:readonly number[]}
export interface OrbitState {readonly offsets:readonly number[];readonly history:readonly (readonly number[])[];readonly selected:number;readonly message:string;readonly solved:boolean}

function make(id:string,difficulty:Difficulty,seed:number):OrbitFixture{
  const target=[(seed*2+1)%8,(seed*3+3)%8,(seed*5+2)%8];
  const distance=difficulty==='gentle'?[1,2,1]:[3,5,2];
  const initial=target.map((value,index)=>(value+distance[index]!+seed%2)%8);
  return{id,difficulty,initial,target};
}
export const ORBIT_FIXTURES:readonly OrbitFixture[]=[
  ...Array.from({length:8},(_,index)=>make(`orbit-g0${index+1}`,'gentle',index)),
  ...Array.from({length:4},(_,index)=>make(`orbit-s0${index+1}`,'standard',index+4)),
];
export function isOrbitSolved(fixture:OrbitFixture,offsets:readonly number[]):boolean{return offsets.every((value,index)=>value===fixture.target[index])}
export function createOrbitState(fixture:OrbitFixture):OrbitState{return{offsets:fixture.initial,history:[],selected:0,message:'Select a ring, then move its water gate onto the flower.',solved:false}}
export function rotateRing(fixture:OrbitFixture,state:OrbitState,direction:-1|1):OrbitState{
  const offsets=[...state.offsets];offsets[state.selected]=(offsets[state.selected]!+direction+8)%8;
  const solved=isOrbitSolved(fixture,offsets);
  const aligned=offsets.filter((value,index)=>value===fixture.target[index]).length;
  return{...state,offsets,history:[...state.history,state.offsets],message:solved?'All three gates align. Water reaches the whole garden.':`${aligned} of 3 rings aligned.`,solved};
}
export function undoOrbit(state:OrbitState):OrbitState{const offsets=state.history.at(-1);return offsets?{...state,offsets,history:state.history.slice(0,-1),message:'Last ring turn undone.',solved:false}:state}
export function orbitHint(fixture:OrbitFixture,state:OrbitState):{ring:number;direction:-1|1}|null{
  const ring=state.offsets.findIndex((value,index)=>value!==fixture.target[index]);if(ring<0)return null;
  const current=state.offsets[ring]!,target=fixture.target[ring]!,clockwise=(target-current+8)%8;
  return{ring,direction:clockwise<=4?1:-1};
}
