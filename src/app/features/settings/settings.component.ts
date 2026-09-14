import {Component, inject} from '@angular/core';
import {StorageService} from '../../core/storage.service';

@Component({
  selector: 'app-settings',
  styleUrl: './settings.component.less',
  template: `
    <section class="settings">
      <p class="eyebrow">Make it yours</p><h1>Settings</h1><p class="intro">These choices stay only in this browser.</p>
      <div class="panel">
        <fieldset><legend>Default break</legend>
          <label><input type="radio" name="duration" value="5" [checked]="prefs().durationMinutes === 5" (change)="setDuration(5)"> 5 minutes</label>
          <label><input type="radio" name="duration" value="10" [checked]="prefs().durationMinutes === 10" (change)="setDuration(10)"> 10 minutes</label>
        </fieldset>
        <label class="row"><span><b>Gentle puzzles only</b><small>Keep every world at its easiest pace.</small></span><input type="checkbox" [checked]="prefs().gentleOnly" (change)="toggle('gentleOnly')"></label>
        <label class="row"><span><b>Reduce movement</b><small>Show state changes without transitions.</small></span><input type="checkbox" [checked]="prefs().reduceMotion" (change)="toggle('reduceMotion')"></label>
        <label class="row"><span><b>Sound</b><small>Soft confirmations. Off by default.</small></span><input type="checkbox" [checked]="prefs().sound" (change)="toggle('sound')"></label>
        <label class="row"><span><b>Haptics</b><small>Small taps on supported devices. Off by default.</small></span><input type="checkbox" [checked]="prefs().haptics" (change)="toggle('haptics')"></label>
      </div>
      <div class="danger"><div><h2>Local data</h2><p>{{storage.history().length}} completed breaks saved on this device.</p></div><button type="button" (click)="clear()">Clear data</button></div>
      @if (message) { <p role="status">{{message}}</p> }
    </section>
  `,
})
export class SettingsComponent {
  protected readonly storage = inject(StorageService);
  protected readonly prefs = this.storage.preferences;
  protected message = '';

  protected setDuration(value: 5 | 10): void { this.storage.updatePreferences({durationMinutes: value}); }
  protected toggle(key: 'gentleOnly' | 'reduceMotion' | 'sound' | 'haptics'): void {
    this.storage.updatePreferences({[key]: !this.prefs()[key]});
  }
  protected clear(): void {
    if (confirm('Clear all Unloop history and settings from this device?')) {
      this.storage.clear();
      this.message = 'Your local data was cleared.';
    }
  }
}
