import {ApplicationConfig, LOCALE_ID, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';

import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {routes} from "./app.routes";
import {provideAnimations} from "@angular/platform-browser/animations";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {HttpRequestInterceptor} from "./_helpers/http.interceptor";
import { provideHotToastConfig } from '@ngxpert/hot-toast';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    provideHttpClient(
      withInterceptors([HttpRequestInterceptor])
    ),
    provideAnimations(), provideAnimationsAsync(), provideHotToastConfig(),
    { provide: LOCALE_ID, useValue: 'uk' }
  ]
};
