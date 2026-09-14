import {Component,computed,effect,inject,input,signal,untracked} from '@angular/core';
import {SessionService} from '../../core/session.service';
import {connected,portNames} from '../circuit/circuit.engine';
import {freshPuzzle} from './fresh-puzzle';
import {SwipeCell,SwipeGridDirective} from './swipe-grid.directive';
import {MoveMotionDirective} from './move-motion.directive';
import {Puzzle,PuzzleSpec} from './puzzle.model';

@Component({selector:'app-puzzle-board',imports:[SwipeGridDirective,MoveMotionDirective],templateUrl:'./puzzle-board.component.html',styleUrl:'./puzzle-board.component.less'})
export class PuzzleBoardComponent {
  readonly spec=input.required<PuzzleSpec>();
  protected readonly session=inject(SessionService);
  protected readonly puzzle=signal<Puzzle>({size:4,initial:[],solution:[],clues:[]});
  protected readonly values=signal<readonly number[]>([]);
  protected readonly selected=signal(-1);
  protected readonly locks=signal<ReadonlySet<number>>(new Set());
  protected readonly powered=computed(()=>this.spec().kind==='circuit'?connected(this.puzzle(),this.values()):new Set<number>());
  protected readonly mode=signal(1);
  protected readonly hinted=signal(-1);
  protected readonly message=signal('');
  protected readonly history=signal<readonly (readonly number[])[]>([]);
  protected readonly help=signal(false);
  protected readonly status=computed(()=>this.spec().status(this.puzzle(),this.values()));
  protected readonly indices=computed(()=>Array.from({length:this.puzzle().size**2},(_,i)=>i));
  protected readonly rows=computed(()=>Array.from({length:this.puzzle().size},(_,i)=>i));
  protected readonly maximum=computed(()=>Math.max(0,...this.values()));
  protected readonly inputDisabled=computed(()=>!['playing','overtime'].includes(this.session.current()?.phase??''));
  private paintValue=1;
  private readonly painted=new Set<number>();
  protected swipeCell(cell:SwipeCell):void{
    if(this.inputDisabled())return;
    if(this.spec().kind==='picross'){
      if(cell.first){this.painted.clear();this.paintValue=this.values()[cell.index]===this.mode()?-1:this.mode()}
      if(this.painted.has(cell.index))return;
      this.painted.add(cell.index);
      if(this.values()[cell.index]===this.paintValue)return;
      const tool=this.mode();this.mode.set(this.paintValue);this.play(cell.index);this.mode.set(tool);
      return;
    }
    // Resting on the current endpoint should not add a no-op undo entry.
    if(this.values()[cell.index]===this.maximum())return;
    this.play(cell.index);
  }
  private activeKey='';
  private saveKey='';
  constructor(){
    effect(()=>{
      const current=this.session.current(), spec=this.spec(), round=this.session.roundKey();
      if(!current||current.currentGame!==spec.id||!['playing','overtime'].includes(current.phase))return;
      const key=current.id+':'+round;
      if(key===this.activeKey)return;
      this.activeKey=key;
      untracked(()=>{
        const match=current.puzzleId?.match(new RegExp('^'+spec.kind+'-v2-(\\d+)-(0|1)$'));
        const standard=match?match[2]==='1':this.session.difficulty()==='standard';
        const fresh=match?{seed:Number(match[1]),puzzle:spec.create(Number(match[1]),standard)}:freshPuzzle(spec,standard);
        const {seed,puzzle}=fresh;
        const id=spec.kind+'-v2-'+seed+'-'+(standard?1:0);
        this.puzzle.set(puzzle);this.values.set([...puzzle.initial]);this.history.set([]);
        this.selected.set(-1);this.locks.set(new Set());this.mode.set(1);this.hinted.set(-1);this.message.set(spec.tip);
        this.saveKey='unloop:puzzle:'+current.id+':'+spec.kind;
        try{
          const raw=JSON.parse(sessionStorage.getItem(this.saveKey)??'null') as {id?:string;values?:unknown}|null;
          if(raw?.id===id&&Array.isArray(raw.values)&&raw.values.length===puzzle.initial.length&&raw.values.every(value=>Number.isInteger(value)&&value>=-1&&value<=Math.max(16,puzzle.initial.length))&&!spec.solved(puzzle,raw.values)){
            this.values.set(raw.values as number[]);this.message.set('Your puzzle has been restored. '+spec.tip);
          }
        }catch{/* Storage is optional. */}
        this.session.setPuzzle(id);
      });
    });
  }
  protected play(index:number):void{
    const phase=this.session.current()?.phase;
    if(phase!=='playing'&&phase!=='overtime')return;
    if(this.spec().kind==='circuit'){
      if(this.mode()===2){this.locks.update(locks=>{const next=new Set(locks);if(next.has(index))next.delete(index);else next.add(index);return next});this.message.set('Tile '+(this.locks().has(index)?'locked.':'unlocked.'));return}
      if(this.locks().has(index)){this.message.set('This tile is locked. Choose Lock and tap it to unlock.');return}
    }
    const before=this.values(), move=this.spec().act(this.puzzle(),before,index,this.selected(),this.mode());
    this.selected.set(move.selected);this.message.set(move.message);this.hinted.set(-1);
    if(move.values===before)return;
    this.history.update(history=>[...history.slice(-199),before]);this.values.set(move.values);this.persist();
    if(this.spec().solved(this.puzzle(),move.values))this.session.completePuzzle();
  }
  protected undo():void{const last=this.history().at(-1);if(!last)return;this.values.set(last);this.history.update(value=>value.slice(0,-1));this.selected.set(-1);this.hinted.set(-1);this.message.set('Move undone.');this.persist()}
  protected reset():void{this.history.update(history=>[...history.slice(-199),this.values()]);this.values.set([...this.puzzle().initial]);this.locks.set(new Set());this.selected.set(-1);this.hinted.set(-1);this.message.set('Fresh board. Reset can also be undone.');this.persist()}
  protected hint():void{this.session.markAssisted();const hint=this.spec().hint(this.puzzle(),this.values());this.hinted.set(hint.index);this.message.set(hint.message)}
  protected edge(index:number,direction:number):boolean{
    const size=this.puzzle().size, next=index+direction;
    if(next<0||next>=this.values().length||Math.abs(Math.floor(index/size)-Math.floor(next/size))+Math.abs(index%size-next%size)!==1)return false;
    return this.values()[index]!>0&&this.values()[next]!>0&&Math.abs(this.values()[index]!-this.values()[next]!)===1;
  }
  protected label(index:number):string{return 'Row '+(Math.floor(index/this.puzzle().size)+1)+', column '+(index%this.puzzle().size+1)+(this.puzzle().clues[0]?.[index]?', checkpoint '+this.puzzle().clues[0]![index]:'')+(this.values()[index]!>0?', path step '+this.values()[index]:'')}
  protected markName(value:number):string{return value===1?'filled':value===0?'marked empty':'undecided'}
  protected lineMatched(line:number,column:boolean):boolean{
    const n=this.puzzle().size,values=Array.from({length:n},(_,i)=>this.values()[column?i*n+line:line*n+i]!);
    if(values.includes(-1))return false;
    const groups:number[]=[];let count=0;
    for(const value of [...values,0]){if(value===1)count++;else if(count){groups.push(count);count=0}}
    return (groups.length?groups:[0]).join(',')===this.puzzle().clues[(column?n:0)+line]!.join(',');
  }
  protected readonly cargoSlots=[0,1,2,3];
  protected cargoSymbol(value:number):string{return ['·','●','▲','◆','★'][value]??'·'}
  protected cargoFull(bay:number):boolean{const stack=this.values().slice(bay*4,bay*4+4);return stack[0]!>0&&stack.every(value=>value===stack[0])}
  protected cargoLabel(bay:number):string{return 'Bay '+(bay+1)+', top to bottom: '+this.values().slice(bay*4,bay*4+4).filter(Boolean).reverse().map(value=>this.cargoSymbol(value)).join(', ')+(this.selected()===bay?', selected':'')}
  protected hasPort(value:number,bit:number):boolean{return Boolean(value&bit)}
  protected isSource(index:number):boolean{return index===Math.floor(this.puzzle().size**2/2)}
  protected circuitLabel(index:number):string{return 'Row '+(Math.floor(index/this.puzzle().size)+1)+', column '+(index%this.puzzle().size+1)+', wires '+portNames(this.values()[index]!)+(this.isSource(index)?', source':'')+(this.powered().has(index)?', powered':', disconnected')+(this.locks().has(index)?', locked':'')}
  private persist():void{try{sessionStorage.setItem(this.saveKey,JSON.stringify({id:this.session.current()?.puzzleId,values:this.values()}))}catch{/* Play without persistence if unavailable. */}}
}
