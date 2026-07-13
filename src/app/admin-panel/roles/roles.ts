import { Component } from '@angular/core';

interface RoleInfo {
  nombre: string;
  descripcion: string;
  accesos: string[];
}

@Component({
  selector: 'app-roles',
  standalone: true,
  templateUrl: './roles.html',
  styleUrl: './roles.scss',
})
export class Roles {
  readonly roles: RoleInfo[] = [
    {
      nombre: 'ADMIN',
      descripcion: 'Control total del sistema y administracion de usuarios.',
      accesos: ['Dashboard', 'Recursos', 'Finanzas', 'Reglas', 'Auditoria', 'Reportes', 'Sesiones', 'Admin'],
    },
    {
      nombre: 'GERENTE',
      descripcion: 'Gestion de indicadores, recursos, reglas, auditoria y reportes de su sede.',
      accesos: ['Dashboard', 'Recursos', 'Reglas', 'Auditoria', 'Reportes'],
    },
    {
      nombre: 'OPERADOR',
      descripcion: 'Registro operativo y consulta de recursos de su sede.',
      accesos: ['Dashboard', 'Recursos', 'Transacciones'],
    },
  ];
}
