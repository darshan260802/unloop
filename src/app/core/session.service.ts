import {computed,DestroyRef,inject,Injectable,signal} from '@angular/core';
import {GAME_CARDS,SessionChoice} from './game-catalog';
import {Difficulty,SessionSnapshot,SessionSummary} from './session.models';
import {StorageService} from './storage.service';

const IDS=GAME_CARDS.map((game)=>game.id);
function shuffle<T>(items:readonly T[]):T[]{const result=[...items];for(let index=result.length-1;index>0;index--){const target=Math.floor(Math.random()*(index+1));[result[index],result[target]]=[result[target]!,result[index]!]}return result}

@Injectable({providedIn:'root'})
export class SessionService{
  private readonly storage=inject(StorageService);private readonly destroyRef=inject(DestroyRef);
  readonly current=signal<SessionSnapshot|null>(this.storage.active());
  readonly remainingMs=computed(()=>{const value=this.current();return value?Math.max(0,value.durationMinutes*60_000-value.activeMs):0});
  readonly difficulty=computed<Difficulty>(()=>!this.storage.preferences().gentleOnly&&(this.current()?.unassistedStreak??0)>=3?'standard':'gentle');
  readonly hasResume=computed(()=>this.current()!==null&&this.current()?.phase!=='finished');
  constructor(){const timer=window.setInterval(()=>this.tick(),1000);const onVisibility=():void=>{if(document.hidden&&this.current()?.phase==='playing')this.pause()};document.addEventListener('visibilitychange',onVisibility);this.destroyRef.onDestroy(()=>{window.clearInterval(timer);document.removeEventListener('visibilitychange',onVisibility)})}
  start(choice:SessionChoice,durationMinutes:5|10):void{const queue=choice==='random'?shuffle(IDS):[choice];this.set({version:1,id:crypto.randomUUID(),choice,durationMinutes,queue,currentGame:queue[0]!,phase:'playing',activeMs:0,puzzleCount:0,unassistedStreak:0,assistedThisPuzzle:false,startedAt:new Date().toISOString(),puzzleId:null});this.storage.updatePreferences({durationMinutes})}
  pause():void{if(this.current()?.phase==='playing')this.patch({phase:'paused'})}
  resume():void{if(this.current()?.phase==='paused')this.patch({phase:'playing'})}
  continueCurrent():void{if(this.current()?.phase==='limit')this.patch({phase:'overtime'})}
  markAssisted():void{this.patch({assistedThisPuzzle:true})}
  setPuzzle(id:string):void{if(this.current()?.puzzleId!==id)this.patch({puzzleId:id})}
  completePuzzle():void{const value=this.current();if(!value)return;const streak=value.assistedThisPuzzle?0:value.unassistedStreak+1;this.feedback();this.patch({phase:value.phase==='overtime'?'finished':this.remainingMs()===0?'limit':'between',puzzleCount:value.puzzleCount+1,unassistedStreak:streak})}
  nextPuzzle():void{const value=this.current();if(!value||value.phase==='limit'||value.phase==='finished')return;let queue=value.queue.slice(1);if(queue.length===0)queue=value.choice==='random'?shuffle(IDS.filter((id)=>id!==value.currentGame)):[value.choice];this.patch({queue,currentGame:queue[0]!,phase:'playing',assistedThisPuzzle:false,puzzleId:null})}
  skip():void{const value=this.current();if(!value)return;let queue=value.queue.slice(1);if(queue.length===0)queue=value.choice==='random'?shuffle(IDS.filter((id)=>id!==value.currentGame)):[value.choice];this.patch({queue,currentGame:queue[0]!,phase:this.remainingMs()===0?'limit':'playing',unassistedStreak:0,assistedThisPuzzle:false,puzzleId:null})}
  finish():SessionSummary|null{const value=this.current();if(!value)return null;const summary:SessionSummary={id:value.id,completedAt:new Date().toISOString(),durationMs:value.activeMs,puzzleCount:value.puzzleCount,games:Array.from(new Set([value.currentGame,...value.queue]))};this.current.set(null);this.storage.addSummary(summary);return summary}
  discard():void{this.current.set(null);this.storage.saveActive(null)}
  private tick():void{const value=this.current();if(!value||value.phase!=='playing')return;const activeMs=Math.min(value.durationMinutes*60_000,value.activeMs+1000);this.patch({activeMs,phase:activeMs>=value.durationMinutes*60_000?'limit':'playing'})}
  private feedback():void{const preferences=this.storage.preferences();if(preferences.haptics&&'vibrate' in navigator)navigator.vibrate(35);if(preferences.sound){try{const context=new AudioContext();const oscillator=context.createOscillator();const gain=context.createGain();gain.gain.setValueAtTime(.035,context.currentTime);gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+.22);oscillator.frequency.value=523;oscillator.connect(gain);gain.connect(context.destination);oscillator.start();oscillator.stop(context.currentTime+.22)}catch{}}}
  private patch(patch:Partial<SessionSnapshot>):void{const value=this.current();if(value)this.set({...value,...patch})}
  private set(value:SessionSnapshot):void{this.current.set(value);this.storage.saveActive(value)}
}
