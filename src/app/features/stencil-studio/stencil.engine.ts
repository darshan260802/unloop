import {Difficulty} from '../../core/session.models';

export type Ink = 'blank' | 'plum' | 'mint' | 'peach';
export interface MaskPoint {readonly row: number; readonly col: number}
export interface StencilTool {readonly id: string; readonly name: string; readonly ink: Exclude<Ink,'blank'>; readonly mask: readonly MaskPoint[]}
export interface StencilAction {readonly tool: number; readonly rotation: 0|1|2|3}
export interface StencilFixture {readonly id: string; readonly difficulty: Difficulty; readonly tools: readonly StencilTool[]; readonly target: readonly Ink[]; readonly solution: readonly StencilAction[]}
export interface StencilState {readonly canvas: readonly Ink[]; readonly history: readonly (readonly Ink[])[]; readonly actions: readonly StencilAction[]; readonly selected: number; readonly rotation: 0|1|2|3; readonly message: string; readonly solved: boolean}

const tools: readonly StencilTool[] = [
  {id:'ribbon',name:'Ribbon',ink:'plum',mask:[{row:0,col:0},{row:0,col:1},{row:0,col:2}]},
  {id:'corner',name:'Corner',ink:'mint',mask:[{row:0,col:0},{row:1,col:0},{row:1,col:1}]},
  {id:'spark',name:'Spark',ink:'peach',mask:[{row:0,col:1},{row:1,col:1},{row:2,col:1}]},
];

export function rotateMask(mask: readonly MaskPoint[], rotation: number): readonly MaskPoint[] {
  let result = mask.map((point) => ({...point}));
  for (let turn=0; turn<rotation; turn++) result = result.map(({row,col}) => ({row:col,col:2-row}));
  return result;
}

function paint(canvas: readonly Ink[], tool: StencilTool, rotation: number): readonly Ink[] {
  const next=[...canvas];
  for(const point of rotateMask(tool.mask,rotation)) next[point.row*3+point.col]=tool.ink;
  return next;
}

function make(id:string,difficulty:Difficulty,solution:readonly StencilAction[],offset:number):StencilFixture{
  const palette = tools.map((tool,index)=>({...tool,ink: tools[(index+offset)%tools.length]!.ink}));
  const target=solution.reduce<readonly Ink[]>((canvas,action)=>paint(canvas,palette[action.tool]!,action.rotation),Array<Ink>(9).fill('blank'));
  return{id,difficulty,tools:palette,target,solution};
}

export const STENCIL_FIXTURES: readonly StencilFixture[] = [
  make('stencil-g01','gentle',[{tool:0,rotation:0},{tool:1,rotation:2}],0),
  make('stencil-g02','gentle',[{tool:1,rotation:0},{tool:0,rotation:2}],1),
  make('stencil-g03','gentle',[{tool:2,rotation:1},{tool:1,rotation:3}],2),
  make('stencil-g04','gentle',[{tool:0,rotation:1},{tool:2,rotation:0}],0),
  make('stencil-g05','gentle',[{tool:1,rotation:1},{tool:0,rotation:3}],1),
  make('stencil-g06','gentle',[{tool:2,rotation:0},{tool:1,rotation:2}],2),
  make('stencil-g07','gentle',[{tool:0,rotation:2},{tool:2,rotation:1}],0),
  make('stencil-g08','gentle',[{tool:1,rotation:3},{tool:2,rotation:2}],1),
  make('stencil-s01','standard',[{tool:0,rotation:0},{tool:1,rotation:1},{tool:2,rotation:2},{tool:0,rotation:3}],0),
  make('stencil-s02','standard',[{tool:2,rotation:0},{tool:0,rotation:2},{tool:1,rotation:3},{tool:2,rotation:1}],1),
  make('stencil-s03','standard',[{tool:1,rotation:2},{tool:2,rotation:3},{tool:0,rotation:1},{tool:1,rotation:0}],2),
  make('stencil-s04','standard',[{tool:0,rotation:3},{tool:2,rotation:1},{tool:1,rotation:0},{tool:0,rotation:2},{tool:2,rotation:0}],0),
];

export function createStencilState():StencilState{return{canvas:Array<Ink>(9).fill('blank'),history:[],actions:[],selected:0,rotation:0,message:'Choose a stencil, turn it, then apply.',solved:false}}
export function applyStencil(fixture:StencilFixture,state:StencilState):StencilState{
  const canvas=paint(state.canvas,fixture.tools[state.selected]!,state.rotation);
  const solved=canvas.every((ink,index)=>ink===fixture.target[index]);
  return{...state,canvas,history:[...state.history,state.canvas],actions:[...state.actions,{tool:state.selected,rotation:state.rotation}],message:solved?'Postcard complete. The layers line up beautifully.':'Layer applied. Compare it with the postcard.',solved};
}
export function undoStencil(state:StencilState):StencilState{
  const canvas=state.history.at(-1);if(!canvas)return state;
  return{...state,canvas,history:state.history.slice(0,-1),actions:state.actions.slice(0,-1),message:'Last layer lifted away.',solved:false};
}
export function previewCells(fixture:StencilFixture,state:StencilState):readonly number[]{return rotateMask(fixture.tools[state.selected]!.mask,state.rotation).map((point)=>point.row*3+point.col)}
export function hintStencil(fixture:StencilFixture,state:StencilState):StencilAction|null{
  const prefix=state.actions.every((action,index)=>action.tool===fixture.solution[index]?.tool&&action.rotation===fixture.solution[index]?.rotation);
  return prefix?fixture.solution[state.actions.length]??null:null;
}
