import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {TuiButton} from '@taiga-ui/core';
import {GAME_CARDS} from '../../core/game-catalog';
import {SessionService} from '../../core/session.service';

@Component({
  selector: 'app-coming-soon',
  imports: [RouterLink, TuiButton],
  template: `
    @if (session.current(); as current) {
      <section class="session">
        <header><div><p>{{label(current.currentGame)}} · {{session.difficulty()}}</p><h1>Your table is ready.</h1></div><strong>{{minutes()}}</strong></header>
        <div class="placeholder"><span aria-hidden="true">✦</span><h2>{{label(current.currentGame)}}</h2><p>The first puzzle is being laid out.</p></div>
        <nav aria-label="Session controls"><button tuiButton appearance="secondary" type="button" (click)="togglePause()">{{current.phase === 'paused' ? 'Resume' : 'Pause'}}</button><button tuiButton appearance="flat" type="button" (click)="finish()">Finish break</button></nav>
        @if (current.phase === 'paused') { <div class="pause" role="dialog" aria-modal="true" aria-labelledby="pause-title"><div><h2 id="pause-title">Break paused</h2><p>Take your time. The clock is stopped.</p><button tuiButton type="button" (click)="session.resume()">Resume</button></div></div> }
      </section>
    } @else {
      <section class="empty"><span aria-hidden="true">✦</span><p>No active break</p><h1>Choose a world when you’re ready.</h1><a tuiButton routerLink="/">Go home</a></section>
    }
  `,
  styles: `:host{display:block}.session{width:min(100% - 2rem,64rem);margin:auto;padding:2rem 0}.session>header{display:flex;align-items:center;justify-content:space-between}.session header p{margin:0;color:var(--plum);font-weight:800;text-transform:capitalize}.session h1{margin:.25rem 0;font-size:clamp(2rem,5vw,3.5rem)}.session header strong{font-variant-numeric:tabular-nums}.placeholder{display:grid;place-items:center;min-height:28rem;margin:2rem 0;padding:2rem;border:1px solid var(--line);border-radius:2rem;background:white;text-align:center;box-shadow:var(--shadow-soft)}.placeholder>span{font-size:3rem}.placeholder h2,.placeholder p{margin:.25rem}.placeholder p{color:var(--muted)}.session>nav{display:flex;justify-content:space-between}.pause{position:fixed;z-index:10;inset:0;display:grid;place-items:center;padding:1rem;background:rgba(36,36,56,.45);backdrop-filter:blur(8px)}.pause>div{width:min(100%,26rem);padding:2rem;border-radius:1.5rem;background:white;text-align:center}.empty{display:grid;place-items:center;min-height:70dvh;padding:2rem;text-align:center}.empty>span{font-size:3rem}.empty p,.empty h1{margin:.3rem}`,
})
export class ComingSoonComponent {
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);
  protected label(id: string): string { return GAME_CARDS.find((game) => game.id === id)?.name ?? id; }
  protected minutes(): string {
    const seconds = Math.ceil(this.session.remainingMs() / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }
  protected togglePause(): void { this.session.current()?.phase === 'paused' ? this.session.resume() : this.session.pause(); }
  protected finish(): void { this.session.finish(); void this.router.navigate(['/']); }
}
