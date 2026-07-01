import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NombreRol, ROLES_SISTEMA } from '../../core/models/role.model';

interface RolInfo {
  nombre: NombreRol;
  descripcion: string;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent {
  rolesInfo: RolInfo[] = [
    {
      nombre: 'ADMIN',
      descripcion: 'Control total del sistema. Puede crear usuarios, modificar roles, y acceder a todos los módulos sin restricción.'
    },
    {
      nombre: 'GERENTE',
      descripcion: 'Acceso a nivel gerencial. Puede ver reportes, dashboards y supervisar auditorías y finanzas.'
    },
    {
      nombre: 'AUDITOR',
      descripcion: 'Encargado de revisar las reglas de negocio, logs de auditoría y transacciones financieras. Rol de solo lectura en su mayoría.'
    },
    {
      nombre: 'ANALISTA',
      descripcion: 'Analiza datos de recursos y energía. Tiene acceso a generar reportes específicos de métricas.'
    },
    {
      nombre: 'OPERADOR',
      descripcion: 'Operador del sistema para ingreso de datos transaccionales. Permisos limitados al área operativa.'
    }
  ];
}
