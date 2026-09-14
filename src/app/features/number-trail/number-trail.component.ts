import {Component} from '@angular/core';
import {PuzzleBoardComponent} from '../puzzles/puzzle-board.component';
import {TRAIL} from './number-trail.engine';
@Component({selector:'app-number-trail',imports:[PuzzleBoardComponent],template:'<app-puzzle-board [spec]="spec"/>'})
export class NumberTrailComponent {protected readonly spec=TRAIL}
