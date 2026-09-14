import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-settings',
  styleUrl: './settings.component.less',
  template: `
    <section class="settings">
      <p class="eyebrow">Make it yours</p><h1>Settings</h1>
      <p class="intro">These choices stay only in this browser.</p>
      <div class="panel">
        <fieldset><legend>Default break</legend>
          <label><input type="radio" name="duration" value="5" [checked]="duration() === 5" (change)="duration.set(5)"> 5 minutes</label>
          <label><input type="radio" name="duration" value="10" [checked]="duration() === 10" (change)="duration.set(10)"> 10 minutes</label>
        </fieldset>
        <label class="row"><span><b>Gentle puzzles only</b><small>Keep every world at its easiest pace.</small></span><input type="checkbox" [checked]="gentleOnly()" (change)="gentleOnly.set(!gentleOnly())"></label>
        <label class="row"><span><b>Reduce movement</b><small>Show state changes without transitions.</small></span><input type="checkbox" [checked]="reduceMotion()" (change)="reduceMotion.set(!reduceMotion())"></label>
        <label class="row"><span><b>Sound</b><small>Soft confirmations. Off by default.</small></span><input type="checkbox" [checked]="sound()" (change)="sound.set(!sound())"></label>
        <label class="row"><span><b>Haptics</b><small>Small taps on supported devices. Off by default.</small></span><input type="checkbox" [checked]="haptics()" (change)="haptics.set(!haptics())"></label>
      </div>
    </section>
  `,
})
export class SettingsComponent {
  protected readonly duration = signal<5 | 10>(5);
  protected readonly gentleOnly = signal(false);
  protected readonly reduceMotion = signal(false);
  protected readonly sound = signal(false);
  protected readonly haptics = signal(false);
}
