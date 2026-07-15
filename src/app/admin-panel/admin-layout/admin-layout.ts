import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { AlertCenterService } from '../../core/services/alert-center.service';
import { SessionMonitoringEvent } from '../../core/models/session-monitoring.model';
import { SessionMonitoringService } from '../../core/services/session-monitoring.service';
import { ThemeService } from '../../core/services/theme.service';
import { esCelularPeruanoValido } from '../../core/validators/identity.validators';
import { Navigation } from '../../user-app/components/navigation/navigation';

type PerfilTab = 'datos' | 'seguridad' | 'actividad';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [Navigation, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: '../../user-app/app-layout/app-layout.scss',
})
export class AdminLayout implements OnDestroy {
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
  readonly perfilTab = signal<PerfilTab>('datos');
  readonly editandoPerfil = signal(false);
  readonly perfilMensaje = signal('');
  readonly seguridadMensaje = signal('');
  readonly actividad = signal<SessionMonitoringEvent[]>([]);
  readonly cargandoActividad = signal(false);
  readonly notificacionesAbiertas = signal(false);
  readonly notificaciones = computed(() =>
    this.alertCenter.obtenerPorPerfil(
      this.authService.roles(),
      this.usuario()?.sedeId ?? null,
    ),
  );
  readonly pendientes = computed(() => this.notificaciones().filter((item) => !item.leida).length);
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

  seleccionarPerfilTab(tab: PerfilTab): void {
    this.perfilTab.set(tab);
    this.perfilMensaje.set('');
    this.seguridadMensaje.set('');

    if (tab === 'actividad') {
      this.cargarActividad();
    }
  }

  activarEdicionPerfil(): void {
    this.editandoPerfil.set(true);
    this.perfilMensaje.set('');
  }

  cancelarEdicionPerfil(): void {
    this.editandoPerfil.set(false);
    this.perfilMensaje.set('');
  }

  guardarPerfil(nombres: string, apellidos: string, correo: string, telefono: string): void {
    const nombresLimpios = nombres.trim();
    const apellidosLimpios = apellidos.trim();
    const correoLimpio = correo.trim();
    const telefonoLimpio = telefono.trim();

    if (!nombresLimpios || !apellidosLimpios || !correoLimpio || !telefonoLimpio) {
      this.perfilMensaje.set('Completa todos los campos personales.');
      return;
    }

    if (!correoLimpio.includes('@') || !correoLimpio.includes('.')) {
      this.perfilMensaje.set('Ingresa un correo electronico valido.');
      return;
    }

    if (!esCelularPeruanoValido(telefonoLimpio)) {
      this.perfilMensaje.set('Ingresa un celular peruano valido de 9 digitos.');
      return;
    }

    this.authService.actualizarPerfil({
      nombres: nombresLimpios,
      apellidos: apellidosLimpios,
      correo: correoLimpio,
      telefono: telefonoLimpio,
    });
    this.sessionMonitoringService.registrarActividadUsuario(
      'ACTUALIZACION_PERFIL',
      'Actualizacion de datos personales del perfil.',
      { correo: correoLimpio },
    );
    this.editandoPerfil.set(false);
    this.perfilMensaje.set('Datos personales actualizados.');
  }

  guardarSeguridad(actual: string, nueva: string, confirmar: string): void {
    if (!actual || !nueva || !confirmar) {
      this.seguridadMensaje.set('Completa todos los campos.');
      return;
    }

    if (nueva.length < 6) {
      this.seguridadMensaje.set('La nueva contrasena debe tener al menos 6 caracteres.');
      return;
    }

    if (nueva !== confirmar) {
      this.seguridadMensaje.set('Las contrasenas no coinciden.');
      return;
    }

    this.authService.cambiarContrasena(actual, nueva).subscribe((ok) => {
      this.seguridadMensaje.set(
        ok ? 'Contrasena actualizada correctamente.' : 'La contrasena actual no es correcta.',
      );
      if (ok) {
        this.sessionMonitoringService.registrarActividadUsuario(
          'ACTUALIZACION_PERFIL',
          'Cambio de contrasena del perfil.',
        );
      }
    });
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

  formatearActividadFecha(fecha: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(fecha));
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

  private cargarActividad(): void {
    this.cargandoActividad.set(true);
    this.sessionMonitoringService.obtenerEventosDePerfil().subscribe((eventos) => {
      this.actividad.set(eventos.slice(0, 8));
      this.cargandoActividad.set(false);
    });
  }
}
