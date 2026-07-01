import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { ADMIN_PANEL_ROUTES } from './admin-panel/admin-panel.routes';
import { PUBLIC_ROUTES } from './public/public.routes';
import { USER_APP_ROUTES } from './user-app/user-app.routes';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  ...PUBLIC_ROUTES,
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [...ADMIN_PANEL_ROUTES],
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [...USER_APP_ROUTES],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
