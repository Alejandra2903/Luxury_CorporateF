import { Routes } from '@angular/router';

import { AdminLayout } from './admin-layout/admin-layout';

export const ADMIN_PANEL_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full',
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users').then((m) => m.Users),
        title: 'Luxury - Usuarios',
      },
      {
        path: 'roles',
        loadComponent: () => import('./roles/roles').then((m) => m.Roles),
        title: 'Luxury - Roles',
      },
      {
        path: 'permissions',
        loadComponent: () => import('./permissions/permissions').then((m) => m.Permissions),
        title: 'Luxury - Permisos',
      },
    ],
  },
];
