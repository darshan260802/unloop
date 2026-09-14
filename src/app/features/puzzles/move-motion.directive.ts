import {DestroyRef,Directive,ElementRef,effect,inject,input} from '@angular/core';
import {StorageService} from '../../core/storage.service';

/** Cosmetic only: engine state is committed before motion, never in a completion callback. */
@Directive({selector:'[appMoveMotion]'})
export class MoveMotionDirective {
  readonly appMoveMotion=input.required<number>();
  readonly motionKind=input<'tile'|'wire'|'crate'|'board'>('tile');
  readonly motionDirection=input(1);
  private readonly element=inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly storage=inject(StorageService);
  private readonly media=window.matchMedia('(prefers-reduced-motion: reduce)');
  private last:number|undefined;
  private animation:Animation|null=null;
  constructor(){
    const stop=():void=>{this.animation?.cancel();this.animation=null};
    this.media.addEventListener('change',stop);
    inject(DestroyRef).onDestroy(()=>{stop();this.media.removeEventListener('change',stop)});
    effect(()=>{
      const value=this.appMoveMotion(),reduced=this.storage.preferences().reduceMotion;
      const previous=this.last;this.last=value;
      if(reduced||this.media.matches){stop();return}
      if(previous===undefined||previous===value)return;
      stop();
      const kind=this.motionKind();
      const target=kind==='wire'?this.element.querySelector('svg'):this.element;
      if(!target?.animate)return;
      const frames:Keyframe[]=kind==='board'?[{opacity:.5},{opacity:1}]:kind==='wire'
        ?[{transform:'rotate('+(this.motionDirection()===-1?90:-90)+'deg)'},{transform:'rotate(0deg)'}]
        :kind==='crate'
          ?[{opacity:.5,transform:'translateY(-6px) scale(.96)'},{opacity:1,transform:'translateY(0) scale(1)'}]
          :[{transform:'scale(.9)'},{transform:'scale(1)'}];
      this.animation=target.animate(frames,{duration:kind==='wire'?180:160,easing:'cubic-bezier(.2,.7,.3,1)'});
    });
  }
}
