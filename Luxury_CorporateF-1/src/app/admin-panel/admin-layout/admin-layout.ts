import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ThemeService, Tema } from '../../core/services/theme.service';
import { Navigation } from '../../user-app/components/navigation/navigation';
import { Usuario } from '../../core/models/usuario.model';
import {
  obtenerNotificacionesAdmin,
  marcarTodasLeidasAdmin,
  NotificacionAdmin,
} from '../../core/mocks/auth.mock';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [Navigation, RouterOutlet, DatePipe],
  templateUrl: './admin-layout.html',
  styleUrl: '../../user-app/app-layout/app-layout.scss',
})
export class AdminLayout implements OnInit, OnDestroy {
  private collapseTimer?: ReturnType<typeof setTimeout>;
  private sub = new Subscription();

  usuario: Usuario | null = null;
  tema: Tema = 'light';
  sidebarExpandido: boolean = false;

  notificaciones: NotificacionAdmin[] = [];
  mostrarNotificaciones = false;

  get cantidadNoLeidas(): number {
    return this.notificaciones.filter(n => !n.leida).length;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.sub.add(this.authService.usuario$.subscribe(u => this.usuario = u));
    this.sub.add(this.themeService.tema$.subscribe(t => this.tema = t));
    this.cargarNotificaciones();
  }

  cargarNotificaciones(): void {
    this.notificaciones = obtenerNotificacionesAdmin();
  }

  toggleNotificaciones(): void {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    if (this.mostrarNotificaciones) {
      this.cargarNotificaciones();
    }
  }

  marcarLeidas(): void {
    marcarTodasLeidasAdmin();
    this.cargarNotificaciones();
  }

  irAUsuarios(): void {
    this.mostrarNotificaciones = false;
    this.router.navigate(['/admin/users']);
  }

  alternarTema(): void {
    this.themeService.alternar();
  }

  onMenuItemClick(): void {
    this.sidebarExpandido = true;
    this.programarColapsoSidebar();
  }

  cerrarSesion(): void {
    this.limpiarTimerSidebar();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.limpiarTimerSidebar();
  }

  private programarColapsoSidebar(): void {
    this.limpiarTimerSidebar();
    this.collapseTimer = setTimeout(() => {
      this.sidebarExpandido = false;
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