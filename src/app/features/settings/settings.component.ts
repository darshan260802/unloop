import {Component,inject} from '@angular/core';
import {StorageService} from '../../core/storage.service';
import {ThemeMode} from '../../core/session.models';
import {FeedbackService} from '../../core/feedback.service';
import {PwaService} from '../../core/pwa.service';

@Component({
  selector:'app-settings',
  styleUrl:'./settings.component.less',
  template:`
    <section class="settings">
      <p class="eyebrow">Make it yours</p><h1>Settings</h1><p class="intro">These choices stay only in this browser.</p>
      <div class="panel">
        <fieldset><legend>Appearance</legend><div class="choice-group">
          <button type="button" [class.selected]="prefs().theme==='light'" [attr.aria-pressed]="prefs().theme==='light'" (click)="setTheme('light')">☀ Light</button>
          <button type="button" [class.selected]="prefs().theme==='dark'" [attr.aria-pressed]="prefs().theme==='dark'" (click)="setTheme('dark')">☾ Dark</button>
        </div></fieldset>
        <fieldset><legend>Default break</legend><div class="choice-group">
          <button type="button" [class.selected]="prefs().durationMinutes===5" [attr.aria-pressed]="prefs().durationMinutes===5" (click)="setDuration(5)">5 minutes</button>
          <button type="button" [class.selected]="prefs().durationMinutes===10" [attr.aria-pressed]="prefs().durationMinutes===10" (click)="setDuration(10)">10 minutes</button>
        </div></fieldset>
        <label class="row"><span><b>Gentle puzzles only</b><small>Keep every world at its easiest pace.</small></span><input type="checkbox" [checked]="prefs().gentleOnly" (change)="toggle('gentleOnly')"></label>
        <label class="row"><span><b>Reduce movement</b><small>Show state changes without transitions.</small></span><input type="checkbox" [checked]="prefs().reduceMotion" (change)="toggle('reduceMotion')"></label>
        <label class="row"><span><b>Sound</b><small>Soft confirmations. Off by default.</small></span><input type="checkbox" [checked]="prefs().sound" (change)="toggle('sound')"></label>
        <label class="row"><span><b>Haptics</b><small>Small taps on supported devices. Off by default.</small></span><input type="checkbox" [checked]="prefs().haptics" (change)="toggle('haptics')"></label>
      </div>
      <div class="update-card"><div><h2>App version</h2><p>Remove cached files and download the newest version from the server.</p></div><button type="button" [disabled]="pwa.updating()" (click)="forceUpdate()">{{pwa.updating() ? 'Updating…' : 'Download latest version'}}</button></div>
      <div class="danger"><div><h2>Local data</h2><p>{{storage.history().length}} completed breaks saved on this device.</p></div><button type="button" (click)="clear()">Clear data</button></div>
      @if(message){<p role="status">{{message}}</p>}
    </section>
  `,
})
export class SettingsComponent {
  protected readonly storage=inject(StorageService);
  protected readonly prefs=this.storage.preferences;
  protected readonly pwa=inject(PwaService);
  private readonly feedback=inject(FeedbackService);
  protected message='';
  protected setTheme(theme:ThemeMode):void{this.storage.updatePreferences({theme})}
  protected setDuration(value:5|10):void{this.storage.updatePreferences({durationMinutes:value})}
  protected async toggle(key:'gentleOnly'|'reduceMotion'|'sound'|'haptics'):Promise<void>{
    const enabled=!this.prefs()[key];this.storage.updatePreferences({[key]:enabled});
    if(!enabled)return;
    if(key==='sound')this.message=await this.feedback.playSound()?'Sound is working.':'This browser blocked audio. Tap Sound off and on once more.';
    if(key==='haptics')this.message=this.feedback.playHaptic()?'Haptics are working.':'Haptics are not supported by this browser or device.';
  }
  protected async forceUpdate():Promise<void>{this.message='Downloading the latest version…';if(!await this.pwa.forceUpdate())this.message=navigator.onLine?'Could not refresh the app. Please try again.':'Connect to the internet, then try again.'}
  protected clear():void{if(confirm('Clear all Unloop history and settings from this device?')){this.storage.clear();this.message='Your local data was cleared.'}}
}
