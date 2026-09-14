import {Component, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {TuiButton} from '@taiga-ui/core';
import {GAME_CARDS} from '../../core/game-catalog';

@Component({
  selector: 'app-home',
  imports: [RouterLink, TuiButton],
  styleUrl: './home.component.less',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  protected readonly games = GAME_CARDS;
  protected readonly duration = signal<5 | 10>(5);
}
