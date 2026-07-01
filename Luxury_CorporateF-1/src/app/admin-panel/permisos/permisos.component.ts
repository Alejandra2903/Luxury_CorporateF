import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NombreRol, ROLES_SISTEMA } from '../../core/models/role.model';

interface ModuloPermiso {
  modulo: string;
  descripcion: string;
  permisos: Partial<Record<NombreRol, 'VER' | 'EDITAR' | 'NADA'>>;
}

@Component({
  selector: 'app-permisos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './permisos.component.html',
  styleUrl: './permisos.component.scss'
})
export class PermisosComponent {
  roles = ROLES_SISTEMA;
  
  modulos: ModuloPermiso[] = [
    {
      modulo: 'Dashboard Principal',
      descripcion: 'KPIs y métricas globales del sistema.',
      permisos: {
        ADMIN: 'EDITAR',
        GERENTE: 'VER',
        AUDITOR: 'VER',
        ANALISTA: 'VER',
        OPERADOR: 'VER'
      }
    },
    {
      modulo: 'Gestión de Usuarios',
      descripcion: 'Crear, editar y desactivar cuentas.',
      permisos: {
        ADMIN: 'EDITAR',
        GERENTE: 'NADA',
        AUDITOR: 'VER',
        ANALISTA: 'NADA',
        OPERADOR: 'NADA'
      }
    },
    {
      modulo: 'Recursos',
      descripcion: 'Inventario y gestión de recursos corporativos.',
      permisos: {
        ADMIN: 'EDITAR',
        GERENTE: 'EDITAR',
        AUDITOR: 'VER',
        ANALISTA: 'VER',
        OPERADOR: 'EDITAR'
      }
    },
    {
      modulo: 'Transacciones Financieras',
      descripcion: 'Registro y validación de movimientos.',
      permisos: {
        ADMIN: 'EDITAR',
        GERENTE: 'VER',
        AUDITOR: 'VER',
        ANALISTA: 'NADA',
        OPERADOR: 'EDITAR'
      }
    },
    {
      modulo: 'Reportes y Auditoría',
      descripcion: 'Generación de reportes PDF y logs de sistema.',
      permisos: {
        ADMIN: 'EDITAR',
        GERENTE: 'VER',
        AUDITOR: 'VER',
        ANALISTA: 'VER',
        OPERADOR: 'NADA'
      }
    }
  ];

  getIconoPermiso(nivel?: 'VER' | 'EDITAR' | 'NADA'): string {
    if (nivel === 'EDITAR') return 'Total'; 
    if (nivel === 'VER') return 'Lectura'; 
    return '---'; 
  }
}
