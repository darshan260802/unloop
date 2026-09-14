import {Difficulty} from '../../core/session.models';

export interface Point {readonly row: number; readonly col: number}
export interface Delivery {readonly symbol: string; readonly parcel: Point; readonly home: Point}
export interface PocketFixture {
  readonly id: string; readonly difficulty: Difficulty; readonly size: number;
  readonly start: Point; readonly exit: Point; readonly deliveries: readonly Delivery[];
  readonly blocked: readonly Point[]; readonly solution: readonly Point[];
}
export interface PocketState {readonly path: readonly Point[]; readonly message: string; readonly solved: boolean}

const p = (row: number, col: number): Point => ({row, col});
const k = (point: Point): string => `${point.row}:${point.col}`;
const same = (a: Point, b: Point): boolean => a.row === b.row && a.col === b.col;

function fixture(id: string, difficulty: Difficulty, size: number, solution: readonly Point[], blocked: readonly Point[] = []): PocketFixture {
  const gentle = difficulty === 'gentle';
  return {
    id, difficulty, size, start: solution[0]!, exit: solution.at(-1)!,
    deliveries: gentle
      ? [{symbol: '●', parcel: solution[1]!, home: solution.at(-2)!}]
      : [
          {symbol: '●', parcel: solution[1]!, home: solution.at(-3)!},
          {symbol: '◆', parcel: solution[2]!, home: solution.at(-2)!},
        ],
    blocked, solution,
  };
}

export const POCKET_FIXTURES: readonly PocketFixture[] = [
  fixture('post-g01','gentle',4,[p(0,0),p(0,1),p(0,2),p(0,3)]),
  fixture('post-g02','gentle',4,[p(3,0),p(2,0),p(1,0),p(0,0)]),
  fixture('post-g03','gentle',4,[p(0,0),p(1,0),p(1,1),p(1,2),p(2,2)]),
  fixture('post-g04','gentle',4,[p(3,3),p(3,2),p(2,2),p(1,2),p(1,1)]),
  fixture('post-g05','gentle',4,[p(0,3),p(1,3),p(2,3),p(2,2),p(2,1)]),
  fixture('post-g06','gentle',4,[p(2,0),p(2,1),p(1,1),p(0,1),p(0,2)]),
  fixture('post-g07','gentle',4,[p(1,3),p(1,2),p(2,2),p(3,2),p(3,1)]),
  fixture('post-g08','gentle',4,[p(3,1),p(2,1),p(2,2),p(1,2),p(0,2)]),
  fixture('post-s01','standard',5,[p(0,0),p(0,1),p(0,2),p(1,2),p(2,2),p(2,3),p(2,4)], [p(1,1),p(1,3)]),
  fixture('post-s02','standard',5,[p(4,0),p(3,0),p(2,0),p(2,1),p(2,2),p(1,2),p(0,2)], [p(3,1),p(1,1)]),
  fixture('post-s03','standard',5,[p(0,4),p(1,4),p(2,4),p(2,3),p(2,2),p(3,2),p(4,2)], [p(1,3),p(3,3)]),
  fixture('post-s04','standard',5,[p(4,4),p(4,3),p(4,2),p(3,2),p(2,2),p(2,1),p(2,0)], [p(3,3),p(3,1)]),
];

export function createPocketState(value: PocketFixture): PocketState {
  return {path: [value.start], message: 'Choose a neighbouring square to begin.', solved: false};
}

export function extendPath(value: PocketFixture, state: PocketState, point: Point): PocketState {
  if (state.solved) return state;
  const last = state.path.at(-1)!;
  const previous = state.path.at(-2);
  if (previous && same(previous, point)) return {...state, path: state.path.slice(0, -1), message: 'One step undone.'};
  if (Math.abs(last.row - point.row) + Math.abs(last.col - point.col) !== 1) return {...state, message: 'Choose a square beside the courier.'};
  if (value.blocked.some((item) => same(item, point))) return {...state, message: 'That square is resting. Go around it.'};
  if (state.path.some((item) => same(item, point))) return {...state, message: 'The path cannot cross itself.'};
  return {...state, path: [...state.path, point], message: 'Path extended.'};
}

export function checkPocket(value: PocketFixture, state: PocketState): PocketState {
  if (!same(state.path.at(-1)!, value.exit)) return {...state, message: 'The path still needs to reach the flag.'};
  for (const delivery of value.deliveries) {
    const parcel = state.path.findIndex((point) => same(point, delivery.parcel));
    const home = state.path.findIndex((point) => same(point, delivery.home));
    if (parcel < 0) return {...state, message: `Collect the ${delivery.symbol} parcel first.`};
    if (home < 0) return {...state, message: `Visit the matching ${delivery.symbol} home.`};
    if (home < parcel) return {...state, message: `Collect the ${delivery.symbol} parcel before its home.`};
  }
  return {...state, solved: true, message: 'Every parcel is home. Beautiful route.'};
}

export function nextHint(value: PocketFixture, state: PocketState): Point | null {
  const prefix = state.path.every((point, index) => same(point, value.solution[index]!));
  return prefix ? value.solution[state.path.length] ?? null : null;
}

export function pointKey(point: Point): string { return k(point); }
