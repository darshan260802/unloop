import {GameId} from '../../core/game-catalog';

export interface Puzzle {
  readonly size: number;
  readonly initial: readonly number[];
  readonly solution: readonly number[];
  readonly clues: readonly (readonly number[])[];
}
export interface Move {readonly values: readonly number[]; readonly selected: number; readonly message: string}
export interface Hint {readonly index: number; readonly message: string}
export interface PuzzleSpec {
  readonly id: GameId;
  readonly kind: 'trail' | 'picross' | 'cargo' | 'circuit';
  readonly title: string;
  readonly subtitle: string;
  readonly instructions: string;
  readonly tip: string;
  create(seed: number, standard: boolean): Puzzle;
  act(puzzle: Puzzle, values: readonly number[], index: number, selected: number, mode: number): Move;
  solved(puzzle: Puzzle, values: readonly number[]): boolean;
  hint(puzzle: Puzzle, values: readonly number[]): Hint;
  status(puzzle: Puzzle, values: readonly number[]): string;
}
export function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {state = (Math.imul(state,1664525)+1013904223)>>>0; return state/4294967296};
}
export function neighbours(index: number, size: number): number[] {
  return [index-size,index+1,index+size,index-1].filter(next => next>=0 && next<size*size &&
    Math.abs(Math.floor(next/size)-Math.floor(index/size))+Math.abs(next%size-index%size)===1);
}
