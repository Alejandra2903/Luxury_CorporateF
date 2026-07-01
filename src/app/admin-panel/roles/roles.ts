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
      descripcion: 'Gestion de indicadores, recursos, reglas operativas y reportes.',
      accesos: ['Dashboard', 'Recursos', 'Finanzas', 'Reglas', 'Reportes'],
    },
    {
      nombre: 'AUDITOR',
      descripcion: 'Revision de auditorias, alertas y reportes.',
      accesos: ['Dashboard', 'Auditoria', 'Reportes'],
    },
    {
      nombre: 'ANALISTA',
      descripcion: 'Consulta de dashboard, recursos y reportes.',
      accesos: ['Dashboard', 'Recursos', 'Reportes'],
    },
    {
      nombre: 'OPERADOR',
      descripcion: 'Registro operativo de consumos y recursos.',
      accesos: ['Recursos', 'Transacciones'],
    },
  ];
}
