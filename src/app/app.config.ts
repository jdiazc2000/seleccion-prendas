import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { provideSpanishPaginatorIntl } from './core/shared/spanish-paginator-intl';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync(),
    provideToastr({
      timeOut: 3500,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      closeButton: true,
    }),
    { provide: MatPaginatorIntl, useFactory: provideSpanishPaginatorIntl },
  ],
};
