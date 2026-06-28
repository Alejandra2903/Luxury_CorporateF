import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { ApiError, isApiError } from '../models/api-error.model';
import { AuthService } from '../services/auth.service';
import { NotificacionService } from '../services/notificacion.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificacionService = inject(NotificacionService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const esLogin = req.url.endsWith('/auth/login');

      if (error.status === 401 && !esLogin) {
        authService.logout();
        notificacionService.error('Tu sesion ha expirado. Inicia sesion nuevamente.');
        router.navigate(['/login']);
      }

      if (error.status === 403) {
        notificacionService.error('No tienes permisos para realizar esta accion.');
      }

      return throwError(() => normalizarError(error));
    }),
  );
};

function normalizarError(error: HttpErrorResponse): ApiError {
  if (isApiError(error.error)) {
    return error.error;
  }
  return {
    status: error.status,
    error: error.statusText || 'Error',
    message: error.message || 'Ocurrio un error inesperado. Intenta nuevamente.',
  };
}
