import {Component,computed,effect,inject} from '@angular/core';
import {RouterLink,RouterLinkActive,RouterOutlet} from '@angular/router';
import {TuiButton,TuiRoot} from '@taiga-ui/core';
import {PwaService} from './core/pwa.service';
import {StorageService} from './core/storage.service';

@Component({selector:'app-root',imports:[RouterLink,RouterLinkActive,RouterOutlet,TuiButton,TuiRoot],styleUrl:'./app.less',templateUrl:'./app.html'})
export class App {
  protected readonly pwa = inject(PwaService);
  protected readonly storage = inject(StorageService);
  protected readonly isDark = computed(() => this.storage.preferences().theme === 'dark');

  constructor() {
    effect(() => {
      const preferences = this.storage.preferences();
      document.documentElement.dataset['theme'] = preferences.theme;
      document.documentElement.style.colorScheme = preferences.theme;
      document.documentElement.classList.toggle('reduce-motion', preferences.reduceMotion);
    });
  }

  protected toggleTheme(): void {
    this.storage.updatePreferences({theme: this.isDark() ? 'light' : 'dark'});
  }
}
