import { Routes } from '@angular/router';

/**
 * Rutas publicas: no requieren sesion. Por ahora solo /login esta
 * implementado; /registro y la landing page se agregan en pasos
 * posteriores siguiendo el mismo patron.
 */
export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./public-layout/public-layout').then((m) => m.PublicLayout),
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login').then((m) => m.Login),
        title: 'Luxury - Iniciar sesion',
      },
    ],
  },
];
