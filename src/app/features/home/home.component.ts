import {Component,inject,signal} from '@angular/core';
import {Router} from '@angular/router';
import {TuiButton} from '@taiga-ui/core';
import {GAME_CARDS,SessionChoice} from '../../core/game-catalog';
import {SessionService} from '../../core/session.service';
import {StorageService} from '../../core/storage.service';

@Component({selector:'app-home',imports:[TuiButton],styleUrl:'./home.component.less',templateUrl:'./home.component.html'})
export class HomeComponent{
  private readonly router=inject(Router);
  protected readonly session=inject(SessionService);protected readonly storage=inject(StorageService);
  protected readonly games=GAME_CARDS;protected readonly duration=signal<5|10>(this.storage.preferences().durationMinutes);
  protected start(choice:SessionChoice):void{this.session.start(choice,this.duration());void this.router.navigate(['/play'])}
  protected resume():void{void this.router.navigate(['/play'])}
  protected discard():void{this.session.discard()}
}
