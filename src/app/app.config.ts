import {isDevMode,ApplicationConfig,provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideServiceWorker} from '@angular/service-worker';
import {provideTaiga} from '@taiga-ui/core';
import {routes} from './app.routes';

export const appConfig:ApplicationConfig={providers:[
  provideBrowserGlobalErrorListeners(),
  provideRouter(routes),
  provideTaiga(),
  provideServiceWorker('ngsw-worker.js',{enabled:!isDevMode(),registrationStrategy:'registerWhenStable:30000'}),
]};
