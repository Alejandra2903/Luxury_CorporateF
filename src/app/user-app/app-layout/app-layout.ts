import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { AlertCenterService } from '../../core/services/alert-center.service';
import { SessionMonitoringService } from '../../core/services/session-monitoring.service';
import { ThemeService } from '../../core/services/theme.service';
import { Navigation } from '../components/navigation/navigation';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [Navigation, RouterOutlet],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
})
export class AppLayout implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly alertCenter = inject(AlertCenterService);
  private readonly router = inject(Router);
  private readonly sessionMonitoringService = inject(SessionMonitoringService);
  private readonly themeService = inject(ThemeService);
  private collapseTimer?: ReturnType<typeof setTimeout>;

  readonly usuario = this.authService.usuario;
  readonly tema = this.themeService.tema;
  readonly sidebarExpandido = signal(false);
  readonly perfilAbierto = signal(false);
  readonly notificacionesAbiertas = signal(false);
  readonly notificaciones = computed(() => this.alertCenter.obtenerPorRoles(this.authService.roles()));
  readonly pendientes = computed(() => this.notificaciones().filter((item) => !item.leida).length);
  readonly puedeVerNotificaciones = computed(() => this.authService.roles().includes('ADMIN'));
  readonly usuarioInicial = computed(() => this.usuario()?.nombres.charAt(0).toUpperCase() ?? 'U');

  constructor() {
    this.sessionMonitoringService.iniciarMonitoreo();
  }

  alternarTema(): void {
    this.themeService.alternar();
  }

  alternarNotificaciones(): void {
    this.notificacionesAbiertas.update((abiertas) => !abiertas);
    this.perfilAbierto.set(false);
  }

  alternarPerfil(): void {
    this.perfilAbierto.update((abierto) => !abierto);
    this.notificacionesAbiertas.set(false);
  }

  marcarNotificacionLeida(id: number): void {
    this.alertCenter.marcarLeida(id);
  }

  marcarNotificacionesLeidas(): void {
    this.alertCenter.marcarLeidasPorRoles(this.authService.roles());
  }

  onMenuItemClick(): void {
    this.sidebarExpandido.set(true);
    this.programarColapsoSidebar();
  }

  cerrarSesion(): void {
    this.limpiarTimerSidebar();
    this.sessionMonitoringService.detenerMonitoreo();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.limpiarTimerSidebar();
    this.sessionMonitoringService.detenerMonitoreo();
  }

  private programarColapsoSidebar(): void {
    this.limpiarTimerSidebar();
    this.collapseTimer = setTimeout(() => {
      this.sidebarExpandido.set(false);
      this.collapseTimer = undefined;
    }, 4000);
  }

  private limpiarTimerSidebar(): void {
    if (this.collapseTimer) {
      clearTimeout(this.collapseTimer);
      this.collapseTimer = undefined;
    }
  }
}
