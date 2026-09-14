import {Component} from '@angular/core';
import {PuzzleBoardComponent} from '../puzzles/puzzle-board.component';
import {CARGO} from './cargo-sort.engine';
@Component({selector:'app-cargo-sort',imports:[PuzzleBoardComponent],template:'<app-puzzle-board [spec]="spec"/>'})
export class CargoSortComponent {protected readonly spec=CARGO}
