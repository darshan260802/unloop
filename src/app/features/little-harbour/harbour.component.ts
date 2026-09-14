import {Component,effect,inject,signal} from '@angular/core';
import {TuiButton} from '@taiga-ui/core';
import {SessionService} from '../../core/session.service';
import {HARBOUR_FIXTURES,HarbourFixture,HarbourState,createHarbourState,harbourHint,launchBoat,toggleJunction,undoHarbour} from './harbour.engine';

@Component({selector:'app-little-harbour',imports:[TuiButton],styleUrl:'./harbour.component.less',templateUrl:'./harbour.component.html'})
export class HarbourComponent{
  protected readonly session=inject(SessionService);
  protected readonly fixture=signal<HarbourFixture>(HARBOUR_FIXTURES[0]!);
  protected readonly state=signal<HarbourState>(createHarbourState(this.fixture()));
  private round=-1;
  constructor(){effect(()=>{const current=this.session.current();if(current?.currentGame==='little-harbour'&&current.phase==='playing'&&current.puzzleCount!==this.round){this.round=current.puzzleCount;const pool=HARBOUR_FIXTURES.filter((item)=>item.difficulty===this.session.difficulty());const next=pool[this.round%pool.length]!;this.fixture.set(next);this.state.set(createHarbourState(next));this.session.setPuzzle(next.id)}})}
  protected toggle(index:number):void{this.state.update((value)=>toggleJunction(value,index))}
  protected launch():void{const next=launchBoat(this.state());this.state.set(next);if(next.solved)this.session.completePuzzle()}
  protected undo():void{this.state.update(undoHarbour)}
  protected reset():void{this.state.set(createHarbourState(this.fixture()))}
  protected hint():void{this.session.markAssisted();this.state.update((value)=>({...value,message:harbourHint(value)}))}
}