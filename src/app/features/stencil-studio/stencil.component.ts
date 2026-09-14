import {Component, computed, effect, inject, signal} from '@angular/core';
import {TuiButton} from '@taiga-ui/core';
import {SessionService} from '../../core/session.service';
import {STENCIL_FIXTURES, StencilFixture, StencilState, applyStencil, createStencilState, hintStencil, previewCells, undoStencil} from './stencil.engine';

@Component({selector:'app-stencil-studio',imports:[TuiButton],styleUrl:'./stencil.component.less',templateUrl:'./stencil.component.html'})
export class StencilComponent{
  protected readonly session=inject(SessionService);
  protected readonly fixture=signal<StencilFixture>(STENCIL_FIXTURES[0]!);
  protected readonly state=signal<StencilState>(createStencilState());
  protected readonly indices=Array.from({length:9},(_,index)=>index);
  protected readonly preview=computed(()=>previewCells(this.fixture(),this.state()));
  private round=-1;
  constructor(){effect(()=>{const current=this.session.current();if(current?.currentGame==='stencil-studio'&&current.phase==='playing'&&current.puzzleCount!==this.round){this.round=current.puzzleCount;const pool=STENCIL_FIXTURES.filter((item)=>item.difficulty===this.session.difficulty());const next=pool[this.round%pool.length]!;this.fixture.set(next);this.state.set(createStencilState());this.session.setPuzzle(next.id)}})}
  protected select(index:number):void{this.state.update((value)=>({...value,selected:index,message:`${this.fixture().tools[index]!.name} selected.`}))}
  protected rotate():void{this.state.update((value)=>({...value,rotation:((value.rotation+1)%4) as 0|1|2|3,message:'Stencil turned 90 degrees.'}))}
  protected apply():void{const next=applyStencil(this.fixture(),this.state());this.state.set(next);if(next.solved)this.session.completePuzzle()}
  protected undo():void{this.state.update(undoStencil)}
  protected reset():void{this.state.set(createStencilState())}
  protected hint():void{this.session.markAssisted();const hint=hintStencil(this.fixture(),this.state());if(hint){this.state.update((value)=>({...value,message:`Try ${this.fixture().tools[hint.tool]!.name}, turned ${hint.rotation*90}°.`}))}else this.state.update((value)=>({...value,message:'Your layers differ from the guide. Reset if you want to follow its path.'}))}
}