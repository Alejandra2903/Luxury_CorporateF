import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NombreRol } from '../../../core/models/role.model';
import { AuthService } from '../../../core/services/auth.service';

interface RolePanelCard {
  title: string;
  value: string;
  detail: string;
}

interface RoleAction {
  label: string;
  detail: string;
  route: string;
}

interface RolePanelCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
}

const PANEL_COPY: Record<NombreRol, RolePanelCopy> = {
  ADMIN: {
    eyebrow: 'Centro de control',
    title: 'Panel administrativo',
    subtitle: 'Supervision global de usuarios, sesiones y alertas del sistema.',
  },
  GERENTE: {
    eyebrow: 'Gestion operativa',
    title: 'Panel gerencial',
    subtitle: 'Seguimiento financiero y operativo de la sede asignada.',
  },
  OPERADOR: {
    eyebrow: 'Trabajo operativo',
    title: 'Panel operativo',
    subtitle: 'Registro y consulta diaria de consumos de la sede asignada.',
  },
};

const PANEL_CARDS: Record<NombreRol, RolePanelCard[]> = {
  ADMIN: [
    { title: 'Usuarios activos', value: '3', detail: 'Cuentas habilitadas' },
    { title: 'Sesiones observadas', value: '4', detail: 'Eventos monitoreados' },
    { title: 'Alertas pendientes', value: '6', detail: 'Requieren seguimiento' },
  ],
  GERENTE: [
    { title: 'Costo mensual', value: 'S/ 38,860', detail: 'Sede asignada' },
    { title: 'Cumplimiento', value: '89%', detail: 'Umbrales del periodo' },
    { title: 'Reportes', value: '3', detail: 'Periodos disponibles' },
  ],
  OPERADOR: [
    { title: 'Registros del mes', value: '2', detail: 'Consumos de tu sede' },
    { title: 'Recursos activos', value: '2', detail: 'Energia y agua' },
    { title: 'Pendientes', value: '0', detail: 'Sin alertas asignadas' },
  ],
};

const PANEL_ACTIONS: Record<NombreRol, RoleAction[]> = {
  ADMIN: [
    { label: 'Gestionar usuarios', detail: 'Crear cuentas, asignar sede y controlar estados.', route: '/admin/users' },
    { label: 'Revisar sesiones', detail: 'Consultar actividad de todos los usuarios.', route: '/session-monitoring' },
    { label: 'Atender alertas', detail: 'Revisar reglas, umbrales y eventos pendientes.', route: '/business-rules' },
  ],
  GERENTE: [
    { label: 'Revisar indicadores', detail: 'Ver consumo, costo y cumplimiento de tu sede.', route: '/dashboard' },
    { label: 'Gestionar umbrales', detail: 'Ajustar reglas operativas de la sede.', route: '/business-rules' },
    { label: 'Generar reportes', detail: 'Consultar documentos ejecutivos del periodo.', route: '/reports' },
  ],
  OPERADOR: [
    { label: 'Registrar consumo', detail: 'Agregar consumo de energia o agua.', route: '/resources/transactions' },
    { label: 'Consultar recursos', detail: 'Revisar informacion de tu sede.', route: '/resources' },
  ],
};

@Component({
  selector: 'app-role-panel',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './role-panel.html',
  styleUrl: './role-panel.scss',
})
export class RolePanel {
  private readonly authService = inject(AuthService);

  readonly usuario = this.authService.usuario;
  readonly rolPrincipal = computed<NombreRol>(() => this.authService.roles()[0] ?? 'OPERADOR');
  readonly copy = computed(() => PANEL_COPY[this.rolPrincipal()]);
  readonly cards = computed(() => PANEL_CARDS[this.rolPrincipal()]);
  readonly acciones = computed(() => PANEL_ACTIONS[this.rolPrincipal()]);
  readonly fechaTrabajo = computed(() =>
    new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date()),
  );
}
