import {Component,computed,effect,inject,signal} from '@angular/core';
import {TuiButton} from '@taiga-ui/core';
import {SessionService} from '../../core/session.service';
import {ORBIT_FIXTURES,OrbitFixture,OrbitState,createOrbitState,isOrbitSolved,orbitHint,rotateRing,undoOrbit} from './orbit.engine';

@Component({selector:'app-orbit-garden',imports:[TuiButton],styleUrl:'./orbit.component.less',templateUrl:'./orbit.component.html'})
export class OrbitComponent {
  protected readonly session=inject(SessionService);
  protected readonly fixture=signal<OrbitFixture>(ORBIT_FIXTURES[0]!);
  protected readonly state=signal<OrbitState>(createOrbitState(this.fixture()));
  protected readonly sectors=Array.from({length:8},(_,index)=>index);
  protected readonly ringNames=['Inner ring','Middle ring','Outer ring'] as const;
  protected readonly directions=['N','NE','E','SE','S','SW','W','NW'] as const;
  protected readonly aligned=computed(()=>this.state().offsets.map((value,index)=>value===this.fixture().target[index]));
  protected readonly alignedCount=computed(()=>this.aligned().filter((value)=>value).length);
  protected readonly hintedDirection=signal<-1|1|null>(null);
  private round=-1;

  constructor(){effect(()=>{const current=this.session.current();if(current?.currentGame==='orbit-garden'&&(current.phase==='playing'||current.phase==='overtime')&&current.puzzleCount!==this.round){this.round=current.puzzleCount;const pool=ORBIT_FIXTURES.filter((item)=>item.difficulty===this.session.difficulty());const next=pool[this.round%pool.length]!;this.fixture.set(next);this.state.set(createOrbitState(next));this.hintedDirection.set(null);this.session.setPuzzle(next.id)}})}

  protected select(ring:number):void{this.hintedDirection.set(null);this.state.update((value)=>({...value,selected:ring,message:`${this.ringNames[ring]} selected. Move its drop onto the flower.`}))}
  protected rotate(direction:-1|1):void{this.hintedDirection.set(null);const next=rotateRing(this.fixture(),this.state(),direction);this.state.set(next);if(next.solved)this.session.completePuzzle()}
  protected undo():void{this.hintedDirection.set(null);this.state.update(undoOrbit)}
  protected reset():void{this.hintedDirection.set(null);this.state.set(createOrbitState(this.fixture()))}
  protected hint():void{this.session.markAssisted();const hint=orbitHint(this.fixture(),this.state());if(hint){this.hintedDirection.set(hint.direction);this.state.update((value)=>({...value,selected:hint.ring,message:`${this.ringNames[hint.ring]} is selected. Use the glowing ${hint.direction===1?'right':'left'} arrow.`}))}}
  protected isGate(ring:number,sector:number):boolean{return this.state().offsets[ring]===sector}
  protected isGoal(ring:number,sector:number):boolean{return this.fixture().target[ring]===sector}
  protected status(ring:number):string{return this.aligned()[ring]?'Watering':'Move the drop'}
  protected solved():boolean{return isOrbitSolved(this.fixture(),this.state().offsets)}
}
