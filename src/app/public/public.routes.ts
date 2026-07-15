import { Routes } from '@angular/router';


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
      {
        path: 'registro',
        loadComponent: () => import('./auth/register/register').then((m) => m.Register),
        title: 'Luxury - Registro',
      },
    ],
  },
];
