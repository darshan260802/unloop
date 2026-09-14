import {Difficulty} from '../../core/session.models';

export interface OrbitFixture {readonly id:string;readonly difficulty:Difficulty;readonly initial:readonly number[];readonly target:readonly number[];readonly flowers:readonly number[];readonly channels:readonly (readonly number[])[]}
export interface OrbitState {readonly offsets:readonly number[];readonly history:readonly (readonly number[])[];readonly selected:number;readonly message:string;readonly solved:boolean}
function make(id:string,difficulty:Difficulty,seed:number):OrbitFixture{
  const gentle=difficulty==='gentle';
  const target=[(seed+1)%8,(seed*2+2)%8,(seed*3+1)%8];
  const initial=target.map((value,index)=>(value+(gentle?index+1:index*2+1))%8);
  return{id,difficulty,initial,target,flowers:gentle?[target[2]!] : [target[2]!, (target[2]!+3)%8],channels:[[0,2,4,6],[1,3,5],[0,1,4,6]]};
}
export const ORBIT_FIXTURES:readonly OrbitFixture[]=[
  ...Array.from({length:8},(_,i)=>make(`orbit-g0${i+1}`,'gentle',i)),
  ...Array.from({length:4},(_,i)=>make(`orbit-s0${i+1}`,'standard',i+3)),
];
export function createOrbitState(fixture:OrbitFixture):OrbitState{return{offsets:fixture.initial,history:[],selected:0,message:'Choose a ring and turn it one step.',solved:false}}
export function rotateRing(fixture:OrbitFixture,state:OrbitState,direction:-1|1):OrbitState{
  const offsets=[...state.offsets];offsets[state.selected]=(offsets[state.selected]!+direction+8)%8;
  const solved=offsets.every((value,index)=>value===fixture.target[index]);
  return{...state,offsets,history:[...state.history,state.offsets],message:solved?'Water reaches every flower. The garden is awake.':`Ring ${state.selected+1} turned ${direction===1?'clockwise':'counterclockwise'}.`,solved};
}
export function undoOrbit(state:OrbitState):OrbitState{const offsets=state.history.at(-1);return offsets?{...state,offsets,history:state.history.slice(0,-1),message:'Last turn undone.',solved:false}:state}
export function orbitHint(fixture:OrbitFixture,state:OrbitState):{ring:number;direction:-1|1}|null{
  const ring=state.offsets.findIndex((value,index)=>value!==fixture.target[index]);if(ring<0)return null;
  const current=state.offsets[ring]!,target=fixture.target[ring]!,clockwise=(target-current+8)%8;
  return{ring,direction:clockwise<=4?1:-1};
}
