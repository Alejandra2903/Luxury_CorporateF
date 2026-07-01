import { Routes } from '@angular/router';

import { AdminLayout } from './admin-layout/admin-layout';

import { UsuariosComponent } from './usuarios/usuarios.component';
import { RolesComponent } from './roles/roles.component';
import { PermisosComponent } from './permisos/permisos.component';

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
        data: {
          eyebrow: 'Administracion',
          title: 'Usuarios',
          description: 'Ruta preparada para listar, crear, editar y activar usuarios del sistema.',
          status: 'PASO 10',
        },
        component: UsuariosComponent,
        title: 'Luxury - Usuarios',
      },
      {
        path: 'roles',
        data: {
          eyebrow: 'Administracion',
          title: 'Roles',
          description: 'Vista preparada para explicar y revisar roles RBAC del sistema Luxury.',
          status: 'PASO 2',
        },
        component: RolesComponent,
        title: 'Luxury - Roles',
      },
      {
        path: 'permissions',
        data: {
          eyebrow: 'Administracion',
          title: 'Permisos',
          description: 'Vista preparada para documentar permisos visibles por rol y modulo.',
          status: 'PASO 2',
        },
        component: PermisosComponent,
        title: 'Luxury - Permisos',
      },
    ],
  },
];
