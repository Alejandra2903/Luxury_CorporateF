import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AUDIT_MODULOS_MOCK } from '../../../../core/mocks/audit.mock';
import { AuditModulo, AuditResumen, Auditoria, EventoAcceso } from '../../../../core/models/audit.model';
import { AuditService } from '../../../../core/services/audit.service';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './audit.html',
  styleUrl: './audit.scss',
})
export class Audit {
  private readonly fb = inject(FormBuilder);
  private readonly auditService = inject(AuditService);

  readonly cargando = signal(true);
  readonly resumen = signal<AuditResumen | null>(null);
  readonly auditorias = signal<Auditoria[]>([]);
  readonly eventosAcceso = signal<EventoAcceso[]>([]);
  readonly modulos = AUDIT_MODULOS_MOCK;

  readonly filtroForm = this.fb.nonNullable.group({
    usuarioId: [0],
    modulo: ['TODOS' as AuditModulo | 'TODOS'],
  });

  readonly usuariosAuditados = computed(() => {
    const mapa = new Map<number, string>();
    this.auditorias().forEach((auditoria) => mapa.set(auditoria.usuarioId, auditoria.usuarioNombre));
    return Array.from(mapa.entries()).map(([id, nombre]) => ({ id, nombre }));
  });

  readonly auditoriasFiltradas = computed(() => {
    const filtro = this.filtroForm.getRawValue();
    return this.auditorias().filter((auditoria) => {
      const coincideUsuario = filtro.usuarioId === 0 || auditoria.usuarioId === Number(filtro.usuarioId);
      const coincideModulo = filtro.modulo === 'TODOS' || auditoria.modulo === filtro.modulo;
      return coincideUsuario && coincideModulo;
    });
  });

  readonly accesosObservados = computed(() =>
    this.eventosAcceso().filter((evento) => !evento.exitoso),
  );

  constructor() {
    this.cargarDatosIniciales();
  }

  aplicarFiltros(): void {
    const filtro = this.filtroForm.getRawValue();

    if (Number(filtro.usuarioId) > 0) {
      this.auditService.obtenerAuditoriasPorUsuario(Number(filtro.usuarioId)).subscribe((auditorias) => {
        this.auditorias.set(
          filtro.modulo === 'TODOS'
            ? auditorias
            : auditorias.filter((auditoria) => auditoria.modulo === filtro.modulo),
        );
      });
      return;
    }

    if (filtro.modulo !== 'TODOS') {
      this.auditService.obtenerAuditoriasPorModulo(filtro.modulo).subscribe((auditorias) => {
        this.auditorias.set(auditorias);
      });
      return;
    }

    this.auditService.obtenerAuditorias().subscribe((auditorias) => {
      this.auditorias.set(auditorias);
    });
  }

  limpiarFiltros(): void {
    this.filtroForm.reset({ usuarioId: 0, modulo: 'TODOS' });
    this.aplicarFiltros();
  }

  claseResultado(resultado: Auditoria['resultado']): string {
    return `badge badge--${resultado.toLowerCase()}`;
  }

  claseAcceso(evento: EventoAcceso): string {
    return evento.exitoso ? 'badge badge--exitoso' : 'badge badge--fallido';
  }

  formatearFecha(fecha: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(fecha));
  }

  private cargarDatosIniciales(): void {
    forkJoin({
      resumen: this.auditService.obtenerResumen(),
      auditorias: this.auditService.obtenerAuditorias(),
      accesos: this.auditService.obtenerEventosAcceso(),
    })
      .pipe(takeUntilDestroyed())
      .subscribe((data) => {
        this.resumen.set(data.resumen);
        this.auditorias.set(data.auditorias);
        this.eventosAcceso.set(data.accesos);
        this.cargando.set(false);
      });
  }
}
