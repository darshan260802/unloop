import {DestroyRef,inject,Injectable,signal} from '@angular/core';
import {SwUpdate,VersionReadyEvent} from '@angular/service-worker';
import {filter} from 'rxjs';

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{readonly outcome:'accepted'|'dismissed';readonly platform:string}>;
}

@Injectable({providedIn:'root'})
export class PwaService{
  private readonly updates=inject(SwUpdate);private readonly destroyRef=inject(DestroyRef);
  readonly ready=signal(false);readonly updateAvailable=signal(false);readonly canInstall=signal(false);
  private promptEvent:InstallPrompt|null=null;
  constructor(){
    if('serviceWorker' in navigator)void navigator.serviceWorker.ready.then(()=>this.ready.set(true));
    this.updates.versionUpdates.pipe(filter((event):event is VersionReadyEvent=>event.type==='VERSION_READY')).subscribe(()=>this.updateAvailable.set(true));
    const install=(event:Event):void=>{event.preventDefault();this.promptEvent=event as InstallPrompt;this.canInstall.set(true)};
    const installed=():void=>{this.promptEvent=null;this.canInstall.set(false);this.ready.set(true)};
    window.addEventListener('beforeinstallprompt',install);window.addEventListener('appinstalled',installed);
    this.destroyRef.onDestroy(()=>{window.removeEventListener('beforeinstallprompt',install);window.removeEventListener('appinstalled',installed)});
  }
  async install():Promise<void>{if(!this.promptEvent)return;await this.promptEvent.prompt();await this.promptEvent.userChoice;this.promptEvent=null;this.canInstall.set(false)}
  async update():Promise<void>{await this.updates.activateUpdate();location.reload()}
}
