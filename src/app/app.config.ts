import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // El orden importa: jwtInterceptor agrega el header Authorization primero;
    // errorInterceptor luego intercepta la respuesta (o el error) de esa misma request.
    provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
  ],
};
