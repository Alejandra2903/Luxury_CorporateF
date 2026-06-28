import { Component, OnDestroy, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
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
  private readonly router = inject(Router);
  private readonly sessionMonitoringService = inject(SessionMonitoringService);
  private readonly themeService = inject(ThemeService);
  private collapseTimer?: ReturnType<typeof setTimeout>;

  readonly usuario = this.authService.usuario;
  readonly tema = this.themeService.tema;
  readonly sidebarExpandido = signal(false);

  constructor() {
    this.sessionMonitoringService.iniciarMonitoreo();
  }

  alternarTema(): void {
    this.themeService.alternar();
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
