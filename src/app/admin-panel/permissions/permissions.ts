import { Component } from '@angular/core';

interface PermissionRow {
  modulo: string;
  roles: string;
}

@Component({
  selector: 'app-permissions',
  standalone: true,
  templateUrl: './permissions.html',
  styleUrl: './permissions.scss',
})
export class Permissions {
  readonly permisos: PermissionRow[] = [
    { modulo: 'Dashboard', roles: 'ADMIN, GERENTE, AUDITOR, ANALISTA' },
    { modulo: 'Recursos', roles: 'ADMIN, GERENTE, ANALISTA, OPERADOR' },
    { modulo: 'Cambio financiero', roles: 'ADMIN, GERENTE' },
    { modulo: 'Reglas', roles: 'ADMIN, GERENTE' },
    { modulo: 'Auditoria', roles: 'ADMIN, AUDITOR' },
    { modulo: 'Reportes', roles: 'ADMIN, GERENTE, AUDITOR, ANALISTA' },
    { modulo: 'Sesiones', roles: 'ADMIN' },
    { modulo: 'Usuarios', roles: 'ADMIN' },
    { modulo: 'Roles', roles: 'ADMIN' },
    { modulo: 'Permisos', roles: 'ADMIN' },
  ];
}
