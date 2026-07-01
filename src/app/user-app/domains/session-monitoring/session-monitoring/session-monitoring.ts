import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import {
  SessionEventSeverity,
  SessionEventType,
  SessionMonitoringEvent,
  SessionMonitoringResumen,
} from '../../../../core/models/session-monitoring.model';
import { SessionMonitoringService } from '../../../../core/services/session-monitoring.service';

@Component({
  selector: 'app-session-monitoring',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './session-monitoring.html',
  styleUrl: './session-monitoring.scss',
})
export class SessionMonitoring {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sessionMonitoringService = inject(SessionMonitoringService);

  readonly cargando = signal(true);
  readonly eventos = signal<SessionMonitoringEvent[]>([]);
  readonly resumen = signal<SessionMonitoringResumen | null>(null);
  readonly sesionActualId = this.sessionMonitoringService.obtenerSesionActualId();

  readonly tipos: SessionEventType[] = [
    'CAMBIO_PESTANA',
    'SALIDA_VIEWPORT',
    'PERDIDA_FOCO',
    'INACTIVIDAD',
    'REGRESO_SESION',
    'MANIPULACION_DATOS_FINANCIEROS',
  ];

  readonly filtroForm = this.fb.nonNullable.group({
    usuarioId: [0],
    tipo: ['TODOS' as SessionEventType | 'TODOS'],
    sesionId: [''],
  });

  readonly usuariosObservados = computed(() => {
    const usuarios = new Map<number, string>();
    for (const evento of this.eventos()) {
      usuarios.set(evento.usuarioId, evento.usuarioNombre);
    }
    return Array.from(usuarios, ([id, nombre]) => ({ id, nombre })).sort((a, b) =>
      a.nombre.localeCompare(b.nombre),
    );
  });

  readonly eventosFiltrados = computed(() => {
    const filtros = this.filtroForm.getRawValue();
    return this.eventos().filter((evento) => {
      const coincideUsuario = !filtros.usuarioId || evento.usuarioId === Number(filtros.usuarioId);
      const coincideTipo = filtros.tipo === 'TODOS' || evento.tipo === filtros.tipo;
      const sesion = filtros.sesionId.trim().toLowerCase();
      const coincideSesion = !sesion || evento.sesionId.toLowerCase().includes(sesion);
      return coincideUsuario && coincideTipo && coincideSesion;
    });
  });

  constructor() {
    this.cargarDatos();
  }

  aplicarFiltros(): void {
    const filtros = this.filtroForm.getRawValue();

    if (filtros.sesionId.trim()) {
      this.sessionMonitoringService
        .obtenerEventosPorSesion(filtros.sesionId.trim())
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((eventos) => this.eventos.set(eventos));
      return;
    }

    if (filtros.usuarioId) {
      this.sessionMonitoringService
        .obtenerEventosPorUsuario(Number(filtros.usuarioId))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((eventos) => this.eventos.set(eventos));
      return;
    }

    if (filtros.tipo !== 'TODOS') {
      this.sessionMonitoringService
        .obtenerEventosPorTipo(filtros.tipo)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((eventos) => this.eventos.set(eventos));
      return;
    }

    this.cargarDatos(false);
  }

  limpiarFiltros(): void {
    this.filtroForm.reset({
      usuarioId: 0,
      tipo: 'TODOS',
      sesionId: '',
    });
    this.cargarDatos(false);
  }

  claseSeveridad(severidad: SessionEventSeverity): string {
    return `badge badge--${severidad.toLowerCase()}`;
  }

  formatearFecha(fecha: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(fecha));
  }

  private cargarDatos(mostrarCarga = true): void {
    if (mostrarCarga) {
      this.cargando.set(true);
    }

    forkJoin({
      eventos: this.sessionMonitoringService.obtenerEventos(),
      resumen: this.sessionMonitoringService.obtenerResumen(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ eventos, resumen }) => {
        this.eventos.set(eventos);
        this.resumen.set(resumen);
        this.cargando.set(false);
      });
  }
}
