import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { NombreRol } from '../models/usuario.model';
import { AuthService } from '../services/auth.service';
import { NotificacionService } from '../services/notificacion.service';


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
