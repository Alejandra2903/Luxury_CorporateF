import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { NombreRol } from '../models/usuario.model';
import { AuthService } from '../services/auth.service';
import { NotificacionService } from '../services/notificacion.service';

/**
 * Bloquea el acceso a rutas segun el rol del usuario autenticado.
 * Se configura por ruta con: data: { roles: ['ADMIN', 'GERENTE'] }.
 * Si la ruta no define "roles", se permite el acceso (el control de
 * acceso real sigue ocurriendo en el backend via SecurityConfig; este
 * guard es una capa de UX para no mostrar pantallas que el usuario no
 * podra usar).
 *
 * Requiere que authGuard se ejecute antes en la misma ruta (o una ruta
 * padre), ya que asume que, de no haber sesion, el acceso ya fue
 * bloqueado previamente.
 */
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const notificacionService = inject(NotificacionService);
  const router = inject(Router);

  const rolesPermitidos = route.data['roles'] as NombreRol[] | undefined;

  if (!rolesPermitidos || rolesPermitidos.length === 0) {
    return true;
  }

  if (authService.tieneAlgunRol(rolesPermitidos)) {
    return true;
  }

  notificacionService.error('No tienes permisos para acceder a esta seccion.');
  return router.createUrlTree(['/panel']);
};
