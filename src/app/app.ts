import {Component,effect,inject} from '@angular/core';
import {RouterLink,RouterLinkActive,RouterOutlet} from '@angular/router';
import {TuiButton,TuiRoot} from '@taiga-ui/core';
import {PwaService} from './core/pwa.service';
import {StorageService} from './core/storage.service';

@Component({selector:'app-root',imports:[RouterLink,RouterLinkActive,RouterOutlet,TuiButton,TuiRoot],styleUrl:'./app.less',templateUrl:'./app.html'})
export class App{
  protected readonly pwa=inject(PwaService);private readonly storage=inject(StorageService);
  constructor(){effect(()=>document.documentElement.classList.toggle('reduce-motion',this.storage.preferences().reduceMotion))}
}
