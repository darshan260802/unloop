import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {TuiButton} from '@taiga-ui/core';

@Component({
  selector: 'app-coming-soon',
  imports: [RouterLink, TuiButton],
  template: `<section class="empty"><span aria-hidden="true">✦</span><p>Preparing your table</p><h1>Your break is almost ready.</h1><a tuiButton routerLink="/">Back home</a></section>`,
  styles: `:host{display:grid;place-items:center;min-height:70dvh}.empty{text-align:center;padding:2rem}.empty>span{display:grid;place-items:center;width:5rem;height:5rem;margin:auto;border-radius:1.5rem;background:var(--lilac);font-size:2rem}.empty p{margin:1.5rem 0 .25rem;color:var(--plum);font-weight:800}.empty h1{margin:0 0 2rem;font-size:clamp(2rem,6vw,4rem);letter-spacing:-.05em}`,
})
export class ComingSoonComponent {}
