import {DatePipe} from '@angular/common';
import {Component,inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {TuiButton} from '@taiga-ui/core';
import {GAME_CARDS,GameId} from '../../core/game-catalog';
import {StorageService} from '../../core/storage.service';

@Component({selector:'app-summary',imports:[DatePipe,RouterLink,TuiButton],styleUrl:'./summary.component.less',templateUrl:'./summary.component.html'})
export class SummaryComponent{
  private readonly storage=inject(StorageService);protected readonly summary=this.storage.history()[0]??null;
  protected duration(ms:number):string{const minutes=Math.floor(ms/60_000),seconds=Math.floor(ms%60_000/1000);return minutes?`${minutes}m ${seconds}s`:`${seconds}s`}
  protected names(ids:readonly GameId[]):string{return ids.map((id)=>GAME_CARDS.find((game)=>game.id===id)?.name??id).join(' · ')}
}
