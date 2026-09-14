import {Component,computed,effect,inject,signal} from '@angular/core';
import {TuiButton} from '@taiga-ui/core';
import {SessionService} from '../../core/session.service';
import {Ink,STENCIL_FIXTURES,StencilFixture,StencilState,applyStencil,createStencilState,hintStencil,previewCells,rotateMask,undoStencil} from './stencil.engine';

@Component({selector:'app-stencil-studio',imports:[TuiButton],styleUrl:'./stencil.component.less',templateUrl:'./stencil.component.html'})
export class StencilComponent {
  protected readonly session=inject(SessionService);
  protected readonly fixture=signal<StencilFixture>(STENCIL_FIXTURES[0]!);
  protected readonly state=signal<StencilState>(createStencilState());
  protected readonly indices=Array.from({length:9},(_,index)=>index);
  protected readonly preview=computed(()=>previewCells(this.fixture(),this.state()));
  protected readonly selectedTool=computed(()=>this.fixture().tools[this.state().selected]!);
  protected readonly guidedReset=signal(false);
  private round=-1;

  constructor(){effect(()=>{const current=this.session.current();if(current?.currentGame==='stencil-studio'&&(current.phase==='playing'||current.phase==='overtime')&&current.puzzleCount!==this.round){this.round=current.puzzleCount;const pool=STENCIL_FIXTURES.filter((item)=>item.difficulty===this.session.difficulty());const next=pool[this.round%pool.length]!;this.fixture.set(next);this.state.set(createStencilState());this.guidedReset.set(false);this.session.setPuzzle(next.id)}})}

  protected select(index:number):void{this.guidedReset.set(false);this.state.update((value)=>({...value,selected:index,message:`${this.fixture().tools[index]!.name} selected. Its highlighted cells show the next layer.`}))}
  protected turn(direction:-1|1):void{this.guidedReset.set(false);this.state.update((value)=>({...value,rotation:((value.rotation+direction+4)%4) as 0|1|2|3,message:`Stencil turned to ${((value.rotation+direction+4)%4)*90} degrees.`}))}
  protected apply():void{const next=applyStencil(this.fixture(),this.state());this.state.set(next);this.guidedReset.set(false);if(next.solved)this.session.completePuzzle()}
  protected undo():void{this.guidedReset.set(false);this.state.update(undoStencil)}
  protected reset():void{this.state.set(createStencilState());this.guidedReset.set(false)}
  protected hint():void{this.session.markAssisted();const hint=hintStencil(this.fixture(),this.state());if(hint){this.guidedReset.set(false);this.state.update((value)=>({...value,message:`Next: choose ${this.fixture().tools[hint.tool]!.name}, rotate to ${hint.rotation*90}°, then apply.`}))}else{this.guidedReset.set(true);this.state.update((value)=>({...value,message:'These layers differ from the guided order. Reset only if you want to follow it.'}))}}
  protected useGuidedReset():void{this.reset();this.hint()}
  protected glyph(ink:Ink):string{return ink==='plum'?'●':ink==='mint'?'▲':ink==='peach'?'◆':'·'}
  protected inkName(ink:Ink):string{return ink==='blank'?'paper':ink}
  protected toolCovers(toolIndex:number,cellIndex:number):boolean{const point={row:Math.floor(cellIndex/3),col:cellIndex%3};return rotateMask(this.fixture().tools[toolIndex]!.mask,0).some((item)=>item.row===point.row&&item.col===point.col)}
}
