import {Routes} from '@angular/router';

export const routes: Routes = [
  {path: '', title: 'Unloop — a mindful play break', loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent)},
  {path: 'play', title: 'Play — Unloop', loadComponent: () => import('./features/play/coming-soon.component').then((m) => m.ComingSoonComponent)},
  {path: 'settings', title: 'Settings — Unloop', loadComponent: () => import('./features/settings/settings.component').then((m) => m.SettingsComponent)},
  {path: '**', redirectTo: ''},
];
