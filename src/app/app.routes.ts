import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./public/public-layout/public-layout').then((m) => m.PublicLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./public/auth/login/login').then((m) => m.Login),
        title: 'Luxury - Iniciar sesion',
      },
    ],
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./public/public-layout/public-layout').then((m) => m.PublicLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./public/auth/register/register').then((m) => m.Register),
        title: 'Luxury - Registro',
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () =>
      import('./admin-panel/admin-panel.routes').then((m) => m.ADMIN_PANEL_ROUTES),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => import('./user-app/user-app.routes').then((m) => m.USER_APP_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'panel',
  },
];
