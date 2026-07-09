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
      const apiError = normalizarError(error);

      if (error.status === 401 && !esLogin) {
        authService.logout();
        notificacionService.error(mensajePorEstado(error.status));
        router.navigate(['/login']);
      }

      if (debeNotificar(error.status, esLogin)) {
        notificacionService.error(apiError.message);
      }

      return throwError(() => apiError);
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
    message: mensajePorEstado(error.status),
  };
}

function debeNotificar(status: number, esLogin: boolean): boolean {
  if (esLogin || status === 400 || status === 401 || status === 422) {
    return false;
  }

  return true;
}

function mensajePorEstado(status: number): string {
  switch (status) {
    case 0:
      return 'No se pudo conectar con el servidor.';
    case 400:
      return 'La solicitud enviada no es valida.';
    case 401:
      return 'Tu sesion ha expirado. Inicia sesion nuevamente.';
    case 403:
      return 'No tienes permisos para realizar esta accion.';
    case 404:
      return 'No se encontro el recurso solicitado.';
    case 409:
      return 'La operacion genera un conflicto con los datos actuales.';
    case 422:
      return 'Revisa los datos ingresados.';
    case 500:
      return 'El servidor no pudo procesar la solicitud.';
    default:
      return 'Ocurrio un error inesperado. Intenta nuevamente.';
  }
}
