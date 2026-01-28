import {
  ApplicationConfig,
  LOCALE_ID,
  provideZoneChangeDetection,
  isDevMode
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngxs/store';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';

import { routes } from './app.routes';
import { AuthState } from './store/auth/auth.state';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideStore(
      [AuthState],
      withNgxsReduxDevtoolsPlugin({ disabled: !isDevMode() })
    ),
    {
      provide: LOCALE_ID,
      useValue: 'fr-FR'
    }
  ]
};
