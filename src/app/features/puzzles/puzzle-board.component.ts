import {Component,computed,effect,inject,input,signal,untracked} from '@angular/core';
import {SessionService} from '../../core/session.service';
import {Puzzle,PuzzleSpec} from './puzzle.model';

@Component({selector:'app-puzzle-board',templateUrl:'./puzzle-board.component.html',styleUrl:'./puzzle-board.component.less'})
export class PuzzleBoardComponent {
  readonly spec=input.required<PuzzleSpec>();
  protected readonly session=inject(SessionService);
  protected readonly puzzle=signal<Puzzle>({size:4,initial:[],solution:[],clues:[]});
  protected readonly values=signal<readonly number[]>([]);
  protected readonly selected=signal(-1);
  protected readonly mode=signal(1);
  protected readonly hinted=signal(-1);
  protected readonly message=signal('');
  protected readonly history=signal<readonly (readonly number[])[]>([]);
  protected readonly help=signal(false);
  protected readonly status=computed(()=>this.spec().status(this.puzzle(),this.values()));
  protected readonly indices=computed(()=>Array.from({length:this.puzzle().size**2},(_,i)=>i));
  protected readonly rows=computed(()=>Array.from({length:this.puzzle().size},(_,i)=>i));
  protected readonly maximum=computed(()=>Math.max(0,...this.values()));
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
        const match=current.puzzleId?.match(new RegExp('^'+spec.kind+'-v1-(\\d+)-(0|1)$'));
        let seed=0;for(const char of current.id)seed=(Math.imul(seed,31)+char.charCodeAt(0))>>>0;
        seed=(seed+round)>>>0;
        const standard=match?match[2]==='1':this.session.difficulty()==='standard';
        if(match)seed=Number(match[1]);
        const id=spec.kind+'-v1-'+seed+'-'+(standard?1:0);
        const puzzle=spec.create(seed,standard);
        this.puzzle.set(puzzle);this.values.set([...puzzle.initial]);this.history.set([]);
        this.selected.set(-1);this.hinted.set(-1);this.message.set(spec.tip);
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
    const before=this.values(), move=this.spec().act(this.puzzle(),before,index,this.selected(),this.mode());
    this.selected.set(move.selected);this.message.set(move.message);this.hinted.set(-1);
    if(move.values===before)return;
    this.history.update(history=>[...history.slice(-199),before]);this.values.set(move.values);this.persist();
    if(this.spec().solved(this.puzzle(),move.values))this.session.completePuzzle();
  }
  protected undo():void{const last=this.history().at(-1);if(!last)return;this.values.set(last);this.history.update(value=>value.slice(0,-1));this.selected.set(-1);this.hinted.set(-1);this.message.set('Move undone.');this.persist()}
  protected reset():void{this.history.update(history=>[...history.slice(-199),this.values()]);this.values.set([...this.puzzle().initial]);this.selected.set(-1);this.hinted.set(-1);this.message.set('Fresh board. Reset can also be undone.');this.persist()}
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
  private persist():void{try{sessionStorage.setItem(this.saveKey,JSON.stringify({id:this.session.current()?.puzzleId,values:this.values()}))}catch{/* Play without persistence if unavailable. */}}
}
