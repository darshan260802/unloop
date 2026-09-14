import {Component,computed,effect,inject,signal} from '@angular/core';
import {TuiButton} from '@taiga-ui/core';
import {SessionService} from '../../core/session.service';
import {ORBIT_FIXTURES,OrbitFixture,OrbitState,createOrbitState,orbitHint,rotateRing,undoOrbit} from './orbit.engine';

@Component({selector:'app-orbit-garden',imports:[TuiButton],styleUrl:'./orbit.component.less',templateUrl:'./orbit.component.html'})
export class OrbitComponent{
  protected readonly session=inject(SessionService);
  protected readonly fixture=signal<OrbitFixture>(ORBIT_FIXTURES[0]!);
  protected readonly state=signal<OrbitState>(createOrbitState(this.fixture()));
  protected readonly sectors=Array.from({length:8},(_,index)=>index);
  protected readonly watered=computed(()=>this.state().offsets.map((value,index)=>value===this.fixture().target[index]));
  protected readonly connectedCount=computed(()=>this.watered().filter((value)=>value).length);
  private round=-1;
  constructor(){effect(()=>{const current=this.session.current();if(current?.currentGame==='orbit-garden'&&current.phase==='playing'&&current.puzzleCount!==this.round){this.round=current.puzzleCount;const pool=ORBIT_FIXTURES.filter((item)=>item.difficulty===this.session.difficulty());const next=pool[this.round%pool.length]!;this.fixture.set(next);this.state.set(createOrbitState(next));this.session.setPuzzle(next.id)}})}
  protected select(ring:number):void{this.state.update((value)=>({...value,selected:ring,message:`Ring ${ring+1} selected.`}))}
  protected rotate(direction:-1|1):void{const next=rotateRing(this.fixture(),this.state(),direction);this.state.set(next);if(next.solved)this.session.completePuzzle()}
  protected undo():void{this.state.update(undoOrbit)}
  protected reset():void{this.state.set(createOrbitState(this.fixture()))}
  protected hint():void{this.session.markAssisted();const hint=orbitHint(this.fixture(),this.state());if(hint)this.state.update((value)=>({...value,selected:hint.ring,message:`Select ring ${hint.ring+1} and turn it ${hint.direction===1?'clockwise':'counterclockwise'}.`}))}
  protected transform(ring:number):string{return `rotate(${this.state().offsets[ring]!*45}deg)`}
  protected sectorTransform(index:number):string{return `rotate(${index*45}deg) translateY(-50%)`}
}
