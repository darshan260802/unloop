import {Component} from '@angular/core';
import {PuzzleBoardComponent} from '../puzzles/puzzle-board.component';
import {CIRCUIT} from './circuit.engine';
@Component({selector:'app-circuit',imports:[PuzzleBoardComponent],template:'<app-puzzle-board [spec]="spec"/>'})
export class CircuitComponent {protected readonly spec=CIRCUIT}
