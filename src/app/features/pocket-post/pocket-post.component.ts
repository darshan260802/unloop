import {Component,computed,effect,inject,signal} from '@angular/core';
import {TuiButton} from '@taiga-ui/core';
import {SessionService} from '../../core/session.service';
import {PocketFixture,PocketState,POCKET_FIXTURES,checkPocket,createPocketState,extendPath,nextHint,Point,pointKey} from './pocket-post.engine';

@Component({selector:'app-pocket-post',imports:[TuiButton],styleUrl:'./pocket-post.component.less',templateUrl:'./pocket-post.component.html'})
export class PocketPostComponent {
  protected readonly session=inject(SessionService);
  protected readonly fixture=signal<PocketFixture>(POCKET_FIXTURES[0]!);
  protected readonly state=signal<PocketState>(createPocketState(this.fixture()));
  protected readonly cells=computed(()=>Array.from({length:this.fixture().size**2},(_,index)=>({row:Math.floor(index/this.fixture().size),col:index%this.fixture().size})));
  protected readonly hinted=signal<string|null>(null);
  protected readonly guidedReset=signal(false);
  protected readonly canDeliver=computed(()=>pointKey(this.state().path.at(-1)!)===pointKey(this.fixture().exit));
  protected readonly progress=computed(()=>this.fixture().deliveries.map((delivery)=>{
    const parcelIndex=this.state().path.findIndex((point)=>pointKey(point)===pointKey(delivery.parcel));
    const homeIndex=this.state().path.findIndex((point)=>pointKey(point)===pointKey(delivery.home));
    return{symbol:delivery.symbol,collected:parcelIndex>=0,delivered:parcelIndex>=0&&homeIndex>parcelIndex};
  }));
  private round=-1;

  constructor(){effect(()=>{const current=this.session.current();if(current?.currentGame==='pocket-post'&&(current.phase==='playing'||current.phase==='overtime')&&current.puzzleCount!==this.round){this.round=current.puzzleCount;const pool=POCKET_FIXTURES.filter((item)=>item.difficulty===this.session.difficulty());const next=pool[this.round%pool.length]!;this.fixture.set(next);this.state.set(createPocketState(next));this.hinted.set(null);this.guidedReset.set(false);this.session.setPuzzle(next.id)}})}

  protected select(point:Point):void{this.hinted.set(null);this.state.update((value)=>extendPath(this.fixture(),value,point))}
  protected undo():void{this.hinted.set(null);this.state.update((value)=>value.path.length>1?{...value,path:value.path.slice(0,-1),message:'One step undone.'}:value)}
  protected reset():void{this.state.set(createPocketState(this.fixture()));this.hinted.set(null);this.guidedReset.set(false)}
  protected hint():void{this.session.markAssisted();const point=nextHint(this.fixture(),this.state());if(point){this.hinted.set(pointKey(point));this.guidedReset.set(false);this.state.update((value)=>({...value,message:`The softly glowing square is a safe next step: row ${point.row+1}, column ${point.col+1}.`}))}else{this.hinted.set(null);this.guidedReset.set(true);this.state.update((value)=>({...value,message:'This route left the guided path. Reset only if you want the guide to lead from the start.'}))}}
  protected check():void{const next=checkPocket(this.fixture(),this.state());this.state.set(next);if(next.solved)this.session.completePuzzle()}
  protected useGuidedReset():void{this.reset();this.hint()}
  protected isPath(point:Point):boolean{return this.state().path.some((item)=>pointKey(item)===pointKey(point))}
  protected isCurrent(point:Point):boolean{return pointKey(this.state().path.at(-1)!)===pointKey(point)}
  protected isHinted(point:Point):boolean{return this.hinted()===pointKey(point)}
  protected order(point:Point):number{return this.state().path.findIndex((item)=>pointKey(item)===pointKey(point))+1}
  protected isBlocked(point:Point):boolean{return this.fixture().blocked.some((item)=>pointKey(item)===pointKey(point))}
  protected isStart(point:Point):boolean{return pointKey(this.fixture().start)===pointKey(point)}
  protected isExit(point:Point):boolean{return pointKey(this.fixture().exit)===pointKey(point)}
  protected parcel(point:Point):string{return this.fixture().deliveries.find((item)=>pointKey(item.parcel)===pointKey(point))?.symbol??''}
  protected home(point:Point):string{return this.fixture().deliveries.find((item)=>pointKey(item.home)===pointKey(point))?.symbol??''}
  protected label(point:Point):string{const details=this.isBlocked(point)?'closed square':this.isStart(point)?'courier start':this.isExit(point)?'finish flag':this.parcel(point)?`${this.parcel(point)} parcel`:this.home(point)?`${this.home(point)} home`:'open square';return`Row ${point.row+1}, column ${point.col+1}, ${details}${this.isPath(point)?`, route step ${this.order(point)}`:''}`}
}
