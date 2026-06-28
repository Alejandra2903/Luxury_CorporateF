import { Component, EventEmitter, Input, Output, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { NombreRol } from '../../../core/models/role.model';

interface NavigationItem {
  label: string;
  shortLabel: string;
  route: string;
  roles: NombreRol[];
}

const TODOS_AUTENTICADOS: NombreRol[] = ['ADMIN', 'GERENTE', 'AUDITOR', 'ANALISTA', 'OPERADOR'];

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: 'Dashboard',
    shortLabel: 'D',
    route: '/dashboard',
    roles: ['ADMIN', 'GERENTE', 'AUDITOR', 'ANALISTA'],
  },
  {
    label: 'Recursos',
    shortLabel: 'R',
    route: '/resources',
    roles: ['ADMIN', 'ANALISTA', 'GERENTE', 'OPERADOR'],
  },
  {
    label: 'Energia',
    shortLabel: 'E',
    route: '/resources/energy',
    roles: ['ADMIN', 'ANALISTA', 'GERENTE', 'OPERADOR'],
  },
  {
    label: 'Agua',
    shortLabel: 'A',
    route: '/resources/water',
    roles: ['ADMIN', 'ANALISTA', 'GERENTE', 'OPERADOR'],
  },
  {
    label: 'Transacciones',
    shortLabel: 'T',
    route: '/resources/transactions',
    roles: ['ADMIN', 'ANALISTA', 'GERENTE', 'OPERADOR'],
  },
  {
    label: 'Cambio financiero',
    shortLabel: 'F',
    route: '/financial-exchange',
    roles: ['ADMIN', 'GERENTE'],
  },
  {
    label: 'Reglas',
    shortLabel: 'B',
    route: '/business-rules',
    roles: ['ADMIN', 'GERENTE'],
  },
  {
    label: 'Auditoria',
    shortLabel: 'U',
    route: '/audit',
    roles: ['ADMIN', 'AUDITOR'],
  },
  {
    label: 'Reportes',
    shortLabel: 'P',
    route: '/reports',
    roles: ['ADMIN', 'GERENTE', 'AUDITOR', 'ANALISTA'],
  },
  {
    label: 'Sesiones',
    shortLabel: 'S',
    route: '/session-monitoring',
    roles: TODOS_AUTENTICADOS,
  },
  {
    label: 'Usuarios',
    shortLabel: 'Us',
    route: '/admin/users',
    roles: ['ADMIN'],
  },
  {
    label: 'Roles',
    shortLabel: 'Ro',
    route: '/admin/roles',
    roles: ['ADMIN'],
  },
  {
    label: 'Permisos',
    shortLabel: 'Pe',
    route: '/admin/permissions',
    roles: ['ADMIN'],
  },
];

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss',
})
export class Navigation {
  @Input() expanded = false;
  @Output() menuItemClick = new EventEmitter<void>();

  private readonly authService = inject(AuthService);

  readonly items = computed(() =>
    NAVIGATION_ITEMS.filter((item) => this.authService.tieneAlgunRol(item.roles)),
  );

  onMenuItemClick(): void {
    this.menuItemClick.emit();
  }
}
