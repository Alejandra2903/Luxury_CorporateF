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

const PANEL_CARDS: Record<NombreRol, RolePanelCard[]> = {
  ADMIN: [
    { title: 'Usuarios activos', value: '5', detail: 'Gestion y control de accesos' },
    { title: 'Roles configurados', value: '5', detail: 'Permisos principales del sistema' },
    { title: 'Alertas pendientes', value: '6', detail: 'Seguimiento general' },
  ],
  GERENTE: [
    { title: 'Costo mensual', value: 'S/ 184,760', detail: 'Control financiero consolidado' },
    { title: 'Cumplimiento', value: '91.4%', detail: 'Promedio de sedes' },
    { title: 'Reportes', value: '3', detail: 'Periodos disponibles' },
  ],
  AUDITOR: [
    { title: 'Auditorias', value: '8', detail: 'Acciones internas revisables' },
    { title: 'Accesos observados', value: '2', detail: 'Eventos para seguimiento' },
    { title: 'Sesiones', value: '5', detail: 'Monitoreo activo' },
  ],
  ANALISTA: [
    { title: 'Consumos', value: '24', detail: 'Registros del periodo' },
    { title: 'Sedes', value: '5', detail: 'Con informacion consolidada' },
    { title: 'Reportes', value: '3', detail: 'Listos para consultar' },
  ],
  OPERADOR: [
    { title: 'Registros', value: '24', detail: 'Consumos disponibles' },
    { title: 'Recursos', value: '2', detail: 'Energia y agua' },
    { title: 'Sesion', value: 'Activa', detail: 'Monitoreo basico habilitado' },
  ],
};

const PANEL_ACTIONS: Record<NombreRol, RoleAction[]> = {
  ADMIN: [
    { label: 'Gestionar usuarios', detail: 'Crear, editar y asignar roles.', route: '/admin/users' },
    { label: 'Revisar sesiones', detail: 'Ver actividad de todos los usuarios.', route: '/session-monitoring' },
    { label: 'Atender alertas', detail: 'Controlar reglas y avisos operativos.', route: '/business-rules' },
  ],
  GERENTE: [
    { label: 'Revisar dashboard', detail: 'Ver indicadores y costos consolidados.', route: '/dashboard' },
    { label: 'Gestionar reglas', detail: 'Crear tarifas y umbrales operativos.', route: '/business-rules' },
    { label: 'Ver reportes', detail: 'Consultar reportes por periodo y sede.', route: '/reports' },
  ],
  AUDITOR: [
    { label: 'Auditar eventos', detail: 'Filtrar acciones y accesos observados.', route: '/audit' },
    { label: 'Ver reportes', detail: 'Revisar informacion mensual.', route: '/reports' },
  ],
  ANALISTA: [
    { label: 'Analizar recursos', detail: 'Consultar consumo por sede y recurso.', route: '/resources' },
    { label: 'Ver reportes', detail: 'Comparar costos y variaciones.', route: '/reports' },
  ],
  OPERADOR: [
    { label: 'Registrar consumo', detail: 'Crear transacciones operativas de energia o agua.', route: '/resources/transactions' },
    { label: 'Consultar recursos', detail: 'Revisar sedes y tipos de recurso.', route: '/resources' },
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
  readonly cards = computed(() => PANEL_CARDS[this.rolPrincipal()]);
  readonly acciones = computed(() => PANEL_ACTIONS[this.rolPrincipal()]);
}
