import { Component, OnDestroy, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { Navigation } from '../../user-app/components/navigation/navigation';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [Navigation, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: '../../user-app/app-layout/app-layout.scss',
})
export class AdminLayout implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private collapseTimer?: ReturnType<typeof setTimeout>;

  readonly usuario = this.authService.usuario;
  readonly tema = this.themeService.tema;
  readonly sidebarExpandido = signal(false);

  alternarTema(): void {
    this.themeService.alternar();
  }

  onMenuItemClick(): void {
    this.sidebarExpandido.set(true);
    this.programarColapsoSidebar();
  }

  cerrarSesion(): void {
    this.limpiarTimerSidebar();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.limpiarTimerSidebar();
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
