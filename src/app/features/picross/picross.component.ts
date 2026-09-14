import {Component} from '@angular/core';
import {PuzzleBoardComponent} from '../puzzles/puzzle-board.component';
import {PICROSS} from './picross.engine';
@Component({selector:'app-picross',imports:[PuzzleBoardComponent],template:'<app-puzzle-board [spec]="spec"/>'})
export class PicrossComponent {protected readonly spec=PICROSS}
