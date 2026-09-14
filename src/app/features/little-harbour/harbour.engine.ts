import {Difficulty} from '../../core/session.models';

export interface Boat {readonly id:string;readonly symbol:string;readonly dock:string;readonly route:readonly boolean[]}
export interface HarbourFixture {readonly id:string;readonly difficulty:Difficulty;readonly junctions:number;readonly docks:readonly string[];readonly boats:readonly Boat[]}
interface HarbourHistory {readonly junctions:readonly boolean[];readonly queue:readonly Boat[];readonly delivered:readonly Boat[]}
export interface HarbourState {readonly junctions:readonly boolean[];readonly queue:readonly Boat[];readonly delivered:readonly Boat[];readonly history:readonly HarbourHistory[];readonly message:string;readonly solved:boolean}

const symbols=['●','◆','▲'] as const;
function routeCode(route:readonly boolean[]):number{return route.reduce((code,right,index)=>code+(right?2**index:0),0)}
function routeForDock(dockIndex:number,dockCount:number,junctions:number,variant:number):readonly boolean[]{
  const candidates=Array.from({length:2**junctions},(_,code)=>code).filter((code)=>code%dockCount===dockIndex);
  const code=candidates[variant%candidates.length]!;
  return Array.from({length:junctions},(_,index)=>(code&2**index)!==0);
}
function make(id:string,difficulty:Difficulty,seed:number):HarbourFixture{
  const gentle=difficulty==='gentle',junctions=gentle?2:3,count=gentle?3:5,docks=symbols.slice(0,gentle?2:3);
  const boats=Array.from({length:count},(_,index)=>{
    const dockIndex=(index+seed)%docks.length,dock=docks[dockIndex]!;
    return{id:`${id}-boat-${index+1}`,symbol:dock,dock,route:routeForDock(dockIndex,docks.length,junctions,index+seed)};
  });
  return{id,difficulty,junctions,docks,boats};
}
export const HARBOUR_FIXTURES:readonly HarbourFixture[]=[
  ...Array.from({length:8},(_,i)=>make(`harbour-g0${i+1}`,'gentle',i)),
  ...Array.from({length:4},(_,i)=>make(`harbour-s0${i+1}`,'standard',i+2)),
];
export function routedDock(fixture:HarbourFixture,junctions:readonly boolean[]):string{return fixture.docks[routeCode(junctions)%fixture.docks.length]!}
export function createHarbourState(fixture:HarbourFixture):HarbourState{return{junctions:Array<boolean>(fixture.junctions).fill(false),queue:fixture.boats,delivered:[],history:[],message:'Turn a junction and watch the route preview.',solved:false}}
export function toggleJunction(state:HarbourState,index:number):HarbourState{const junctions=[...state.junctions];junctions[index]=!junctions[index];return{...state,junctions,message:`Junction ${index+1} now sends boats ${junctions[index]?'right':'left'}.`}}
export function launchBoat(fixture:HarbourFixture,state:HarbourState):HarbourState{
  const boat=state.queue[0];if(!boat)return state;
  const destination=routedDock(fixture,state.junctions);
  if(destination!==boat.dock)return{...state,message:`${boat.symbol} sailed toward ${destination}, not ${boat.dock}, and returned safely. Adjust the route.`};
  const history=[...state.history,{junctions:state.junctions,queue:state.queue,delivered:state.delivered}];
  const queue=state.queue.slice(1),delivered=[...state.delivered,boat],solved=queue.length===0;
  return{...state,queue,delivered,history,message:solved?'Every boat is safely home.':`${boat.symbol} reached its matching dock. Preview the next route.`,solved};
}
export function undoHarbour(state:HarbourState):HarbourState{const last=state.history.at(-1);return last?{...state,...last,history:state.history.slice(0,-1),message:'The last boat returned to the queue.',solved:false}:state}
export function harbourHint(fixture:HarbourFixture,state:HarbourState):string{
  const boat=state.queue[0];if(!boat)return'Every boat is home.';
  if(routedDock(fixture,state.junctions)===boat.dock)return'The preview matches this boat. Launch when ready.';
  const index=boat.route.findIndex((turn,i)=>turn!==state.junctions[i]);
  return index<0?'The route is ready.':`Try turning junction ${index+1} ${boat.route[index]?'right':'left'}.`;
}
