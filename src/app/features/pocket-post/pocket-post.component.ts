import {Component, computed, effect, inject, signal} from '@angular/core';
import {TuiButton} from '@taiga-ui/core';
import {SessionService} from '../../core/session.service';
import {PocketFixture, PocketState, POCKET_FIXTURES, checkPocket, createPocketState, extendPath, nextHint, Point, pointKey} from './pocket-post.engine';

@Component({
  selector: 'app-pocket-post',
  imports: [TuiButton],
  styleUrl: './pocket-post.component.less',
  templateUrl: './pocket-post.component.html',
})
export class PocketPostComponent {
  protected readonly session = inject(SessionService);
  protected readonly fixture = signal<PocketFixture>(POCKET_FIXTURES[0]!);
  protected readonly state = signal<PocketState>(createPocketState(this.fixture()));
  protected readonly cells = computed(() => Array.from({length: this.fixture().size ** 2}, (_, index) => ({row: Math.floor(index / this.fixture().size), col: index % this.fixture().size})));
  protected readonly guidedReset = signal(false);
  private round = -1;

  constructor() {
    effect(() => {
      const current = this.session.current();
      if (current?.currentGame === 'pocket-post' && current.phase === 'playing' && current.puzzleCount !== this.round) {
        this.round = current.puzzleCount;
        const pool = POCKET_FIXTURES.filter((item) => item.difficulty === this.session.difficulty());
        const next = pool[this.round % pool.length]!;
        this.fixture.set(next);
        this.state.set(createPocketState(next));
        this.guidedReset.set(false);
        this.session.setPuzzle(next.id);
      }
    });
  }

  protected select(point: Point): void { this.state.update((state) => extendPath(this.fixture(), state, point)); }
  protected undo(): void {
    this.state.update((state) => state.path.length > 1 ? {...state, path: state.path.slice(0, -1), message: 'One step undone.'} : state);
  }
  protected reset(): void { this.state.set(createPocketState(this.fixture())); this.guidedReset.set(false); }
  protected hint(): void {
    this.session.markAssisted();
    const point = nextHint(this.fixture(), this.state());
    if (point) this.state.update((state) => ({...state, message: `Try row ${point.row + 1}, column ${point.col + 1} next.`}));
    else { this.guidedReset.set(true); this.state.update((state) => ({...state, message: 'This route has wandered away from the guide. You can reset it explicitly.'})); }
  }
  protected check(): void {
    const next = checkPocket(this.fixture(), this.state());
    this.state.set(next);
    if (next.solved) this.session.completePuzzle();
  }
  protected useGuidedReset(): void { this.reset(); this.hint(); }
  protected cellClass(point: Point): string {
    const f = this.fixture(), s = this.state();
    if (f.blocked.some((item) => pointKey(item) === pointKey(point))) return 'blocked';
    if (pointKey(f.start) === pointKey(point)) return 'start';
    if (pointKey(f.exit) === pointKey(point)) return 'exit';
    if (f.deliveries.some((item) => pointKey(item.parcel) === pointKey(point))) return 'parcel';
    if (f.deliveries.some((item) => pointKey(item.home) === pointKey(point))) return 'home';
    if (s.path.some((item) => pointKey(item) === pointKey(point))) return 'path';
    return '';
  }
  protected content(point: Point): string {
    const f = this.fixture();
    if (pointKey(f.start) === pointKey(point)) return '🚲';
    if (pointKey(f.exit) === pointKey(point)) return '⚑';
    const parcel = f.deliveries.find((item) => pointKey(item.parcel) === pointKey(point));
    if (parcel) return parcel.symbol;
    const home = f.deliveries.find((item) => pointKey(item.home) === pointKey(point));
    return home ? `⌂${home.symbol}` : '';
  }
  protected label(point: Point): string { return `Row ${point.row + 1}, column ${point.col + 1}, ${this.content(point) || this.cellClass(point) || 'empty'}`; }
}
