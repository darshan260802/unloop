import {DestroyRef,Directive,ElementRef,effect,inject,input,output} from '@angular/core';

export interface SwipeCell {readonly index:number;readonly first:boolean}
interface CellRect {readonly index:number;readonly left:number;readonly right:number;readonly top:number;readonly bottom:number}
@Directive({
  selector:'[appSwipeGrid]',
  host:{
    '(pointerdown)':'start($event)','(pointermove)':'move($event)',
    '(pointerup)':'end($event)','(pointercancel)':'cancelPointer($event)',
    '(lostpointercapture)':'cancelPointer($event)','(click)':'click($event)',
    '(window:blur)':'cancel()','(window:resize)':'cancel()',
    '[class.drawing]':'pointerId !== null'
  }
})
export class SwipeGridDirective {
  readonly swipeDisabled=input(false);
  readonly cellSwipe=output<SwipeCell>();
  private readonly element=inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected pointerId:number|null=null;
  private cells:CellRect[]=[];
  private previous:{x:number;y:number}|null=null;
  private lastCell=-1;
  private handledPointer=false;
  constructor(){
    effect(()=>{if(this.swipeDisabled())this.cancel()});
    inject(DestroyRef).onDestroy(()=>this.cancel());
  }
  protected start(event:PointerEvent):void{
    if(this.swipeDisabled()||!event.isPrimary||event.button!==0||this.pointerId!==null)return;
    const target=event.target instanceof Element?event.target.closest<HTMLButtonElement>('button[data-cell]'):null;
    if(!target||!this.element.contains(target))return;
    this.cells=Array.from(this.element.querySelectorAll<HTMLButtonElement>('button[data-cell]'),button=>{
      const rect=button.getBoundingClientRect();
      return{index:Number(button.dataset['cell']),left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom};
    });
    this.pointerId=event.pointerId;this.previous={x:event.clientX,y:event.clientY};
    this.lastCell=Number(target.dataset['cell']);this.handledPointer=true;
    this.element.setPointerCapture(event.pointerId);
    target.focus({preventScroll:true});event.preventDefault();
    this.cellSwipe.emit({index:this.lastCell,first:true});
  }
  protected move(event:PointerEvent):void{
    if(event.pointerId!==this.pointerId)return;
    if(this.swipeDisabled()){this.cancel();return}
    event.preventDefault();
    // Coalesced samples preserve curved strokes on browsers that provide them.
    const samples=typeof event.getCoalescedEvents==='function'?event.getCoalescedEvents():[];
    for(const sample of samples.length?samples:[event])this.trace(sample.clientX,sample.clientY);
  }
  private trace(x:number,y:number):void{
    const previous=this.previous??{x,y};this.previous={x,y};
    const inside=(px:number,py:number):boolean=>this.cells.some(cell=>px>=cell.left&&px<=cell.right&&py>=cell.top&&py<=cell.bottom);
    // Never draw an invented segment across the board after leaving it.
    if(!inside(x,y)&&!inside(previous.x,previous.y)){this.previous=null;return}
    const width=this.cells[0]?(this.cells[0].right-this.cells[0].left):44;
    const distance=Math.hypot(x-previous.x,y-previous.y);
    const steps=Math.min(256,Math.max(1,Math.ceil(distance/Math.max(4,width/5))));
    for(let step=1;step<=steps;step++){
      const px=previous.x+(x-previous.x)*step/steps,py=previous.y+(y-previous.y)*step/steps;
      // A small inset avoids accidental turns when skimming grid corners.
      const cell=this.cells.find(rect=>px>=rect.left+3&&px<=rect.right-3&&py>=rect.top+3&&py<=rect.bottom-3);
      if(!cell||cell.index===this.lastCell)continue;
      if(this.swipeDisabled())break;
      this.lastCell=cell.index;this.cellSwipe.emit({index:cell.index,first:false});
    }
    if(!inside(x,y))this.previous=null;
  }
  protected end(event:PointerEvent):void{if(event.pointerId!==this.pointerId)return;this.move(event);this.cancel()}
  protected cancelPointer(event:PointerEvent):void{if(event.pointerId===this.pointerId)this.cancel()}
  protected click(event:MouseEvent):void{
    if(this.swipeDisabled())return;
    if(event.detail!==0&&this.handledPointer){this.handledPointer=false;event.preventDefault();return}
    const target=event.target instanceof Element?event.target.closest<HTMLElement>('button[data-cell]'):null;
    if(target&&this.element.contains(target))this.cellSwipe.emit({index:Number(target.dataset['cell']),first:true});
  }
  protected cancel():void{
    const id=this.pointerId;this.pointerId=null;this.previous=null;this.lastCell=-1;this.cells=[];
    if(id!==null&&this.element.hasPointerCapture(id))this.element.releasePointerCapture(id);
  }
}
