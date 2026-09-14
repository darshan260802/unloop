import {Difficulty} from '../../core/session.models';

export interface Boat {readonly id:string;readonly symbol:string;readonly dock:string;readonly route:readonly boolean[]}
export interface HarbourFixture {readonly id:string;readonly difficulty:Difficulty;readonly junctions:number;readonly docks:readonly string[];readonly boats:readonly Boat[]}
export interface HarbourState {readonly junctions:readonly boolean[];readonly queue:readonly Boat[];readonly delivered:readonly Boat[];readonly history:readonly HarbourHistory[];readonly message:string;readonly solved:boolean}
interface HarbourHistory {readonly junctions:readonly boolean[];readonly queue:readonly Boat[];readonly delivered:readonly Boat[]}

const symbols=['●','◆','▲'];
function make(id:string,difficulty:Difficulty,seed:number):HarbourFixture{
  const gentle=difficulty==='gentle',junctions=gentle?2:3,count=gentle?3:5,docks=symbols.slice(0,gentle?2:3);
  const boats=Array.from({length:count},(_,index)=>{
    const dock=docks[(index+seed)%docks.length]!;
    const route=Array.from({length:junctions},(_,junction)=>((index+seed+junction)%3)!==0);
    return{id:`${id}-boat-${index+1}`,symbol:dock,dock,route};
  });
  return{id,difficulty,junctions,docks,boats};
}
export const HARBOUR_FIXTURES:readonly HarbourFixture[]=[
  ...Array.from({length:8},(_,i)=>make(`harbour-g0${i+1}`,'gentle',i)),
  ...Array.from({length:4},(_,i)=>make(`harbour-s0${i+1}`,'standard',i+2)),
];
export function createHarbourState(fixture:HarbourFixture):HarbourState{return{junctions:Array<boolean>(fixture.junctions).fill(false),queue:fixture.boats,delivered:[],history:[],message:'Set the junctions for the first boat.',solved:false}}
export function toggleJunction(state:HarbourState,index:number):HarbourState{const junctions=[...state.junctions];junctions[index]=!junctions[index];return{...state,junctions,message:`Junction ${index+1} now turns ${junctions[index]?'right':'left'}.`}}
export function launchBoat(state:HarbourState):HarbourState{
  const boat=state.queue[0];if(!boat)return state;
  const correct=boat.route.every((turn,index)=>turn===state.junctions[index]);
  if(!correct)return{...state,message:`${boat.symbol} reached the wrong dock and returned to the front. Adjust a junction and try again.`};
  const history=[...state.history,{junctions:state.junctions,queue:state.queue,delivered:state.delivered}];
  const queue=state.queue.slice(1),delivered=[...state.delivered,boat],solved=queue.length===0;
  return{...state,queue,delivered,history,message:solved?'Every boat is tucked safely into harbour.':`${boat.symbol} arrived safely. Set a route for the next boat.`,solved};
}
export function undoHarbour(state:HarbourState):HarbourState{const last=state.history.at(-1);return last?{...state,...last,history:state.history.slice(0,-1),message:'The last boat returned to the queue.',solved:false}:state}
export function harbourHint(state:HarbourState):string{const boat=state.queue[0];if(!boat)return'Every boat is home.';const index=boat.route.findIndex((turn,i)=>turn!==state.junctions[i]);return index<0?'The route is ready. Launch this boat.':`Turn junction ${index+1} ${boat.route[index]?'right':'left'}.`}
