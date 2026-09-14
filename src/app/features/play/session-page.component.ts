import {Component,effect,inject,signal} from '@angular/core';
import {ActivatedRoute,Router} from '@angular/router';
import {TuiButton} from '@taiga-ui/core';
import {GAME_CARDS,GameId,SessionChoice} from '../../core/game-catalog';
import {SessionService} from '../../core/session.service';
import {StorageService} from '../../core/storage.service';
import {HarbourComponent} from '../little-harbour/harbour.component';
import {OrbitComponent} from '../orbit-garden/orbit.component';
import {NumberTrailComponent} from '../number-trail/number-trail.component';
import {PicrossComponent} from '../picross/picross.component';

const isChoice=(value:string|null):value is SessionChoice=>value==='random'||GAME_CARDS.some((game)=>game.id===value);

@Component({selector:'app-session-page',imports:[TuiButton,NumberTrailComponent,PicrossComponent,HarbourComponent,OrbitComponent],styleUrl:'./session-page.component.less',templateUrl:'./session-page.component.html'})
export class SessionPageComponent{
  protected readonly session=inject(SessionService);protected readonly storage=inject(StorageService);
  private readonly router=inject(Router);private readonly route=inject(ActivatedRoute);
  protected readonly tutorialGame=signal<GameId|null>(null);protected readonly demoDone=signal(false);
  constructor(){
    if(!this.session.current()){const choice=this.route.snapshot.queryParamMap.get('game');const minutes=this.route.snapshot.queryParamMap.get('minutes');this.session.start(isChoice(choice)?choice:'random',minutes==='10'?10:5)}
    effect(()=>{const current=this.session.current();if(current&&current.phase==='playing'&&!this.storage.preferences().seenTutorials.includes(current.currentGame)&&this.tutorialGame()!==current.currentGame){this.tutorialGame.set(current.currentGame);this.demoDone.set(true);this.session.pause()}})
  }
  protected label(id:GameId):string{return GAME_CARDS.find((game)=>game.id===id)?.name??id}
  protected minutes():string{const seconds=Math.ceil(this.session.remainingMs()/1000);return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`}
  protected tutorialText(id:GameId):string{switch(id){case'pocket-post':return'Number Trail: connect checkpoints in order and visit every square once.';case'stencil-studio':return'Picross: use row and column clues to fill squares or mark them empty.';case'little-harbour':return'Turn the junctions, then launch the first waiting boat.';case'orbit-garden':return'Select a ring and rotate it until all channels connect.'}}
  protected tryDemo():void{this.demoDone.set(true)}
  protected closeTutorial():void{const game=this.tutorialGame();if(game)this.storage.markTutorialSeen(game);this.tutorialGame.set(null);this.session.resume()}
  protected togglePause():void{this.session.current()?.phase==='paused'?this.session.resume():this.session.pause()}
  protected finish():void{this.session.finish();void this.router.navigate(['/summary'])}
  protected next():void{this.session.nextPuzzle()}
  protected skip():void{this.session.skip()}
  protected goHome():void{void this.router.navigate(['/'])}
}
