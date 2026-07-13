import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize, forkJoin, of } from 'rxjs';

import { ReporteMensual, ReporteSede } from '../../../../core/models/reports.model';
import { Sede } from '../../../../core/models/resources.model';
import { ReportsService } from '../../../../core/services/reports.service';
import { ResourcesService } from '../../../../core/services/resources.service';
import { SessionMonitoringService } from '../../../../core/services/session-monitoring.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly reportsService = inject(ReportsService);
  private readonly resourcesService = inject(ResourcesService);
  private readonly sessionMonitoringService = inject(SessionMonitoringService);

  readonly cargando = signal(true);
  readonly descargando = signal(false);
  readonly error = signal('');
  readonly sedes = signal<Sede[]>([]);
  readonly reporteMensual = signal<ReporteMensual | null>(null);
  readonly reporteSede = signal<ReporteSede | null>(null);

  readonly filtrosForm = this.fb.nonNullable.group({
    periodo: ['2026-06'],
    sedeId: [0],
  });

  readonly periodos = [
    { value: '2026-06', label: 'Junio 2026' },
    { value: '2026-05', label: 'Mayo 2026' },
    { value: '2026-04', label: 'Abril 2026' },
  ];

  readonly maxCostoSede = computed(() =>
    Math.max(...(this.reporteMensual()?.sedes.map((sede) => sede.costoTotal) ?? [1])),
  );

  constructor() {
    this.cargarReporte();
  }

  cargarReporte(): void {
    const { periodo, sedeId } = this.filtrosForm.getRawValue();
    this.cargando.set(true);
    this.error.set('');

    forkJoin({
      sedes: this.sedes().length ? of(this.sedes()) : this.resourcesService.obtenerSedes(),
      mensual: this.reportsService.obtenerReporteMensual(periodo),
      sede:
        Number(sedeId) > 0
          ? this.reportsService.obtenerReportePorSede(Number(sedeId))
          : of(null),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: ({ sedes, mensual, sede }) => {
          this.sedes.set(sedes);
          this.reporteMensual.set(mensual);
          this.reporteSede.set(sede);
        },
        error: (error: unknown) => {
          this.error.set(error instanceof Error ? error.message : 'No se pudo cargar el reporte.');
        },
      });
  }

  limpiarSede(): void {
    this.filtrosForm.controls.sedeId.setValue(0);
    this.cargarReporte();
  }

  descargarPdf(): void {
    const { periodo } = this.filtrosForm.getRawValue();
    this.descargando.set(true);
    this.error.set('');

    this.reportsService
      .descargarReporteMensualPdf(periodo)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.descargando.set(false)),
      )
      .subscribe({
        next: (archivo) => {
          const url = URL.createObjectURL(archivo);
          const enlace = this.document.createElement('a');
          enlace.href = url;
          enlace.download = `reporte-luxury-${periodo}.pdf`;
          enlace.click();
          URL.revokeObjectURL(url);
          this.sessionMonitoringService.registrarActividadUsuario(
            'GENERACION_REPORTE',
            `Descarga de reporte mensual ${periodo}.`,
            {
              periodo,
              formato: 'PDF',
            },
          );
        },
        error: (error: unknown) => {
          this.error.set(error instanceof Error ? error.message : 'No se pudo descargar el PDF.');
        },
      });
  }

  anchoCosto(costo: number): number {
    return Math.max(8, (costo / this.maxCostoSede()) * 100);
  }

  claseVariacion(valor: number): string {
    return valor <= 0 ? 'variation variation--positive' : 'variation variation--warning';
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      maximumFractionDigits: 0,
    }).format(valor);
  }

  formatearNumero(valor: number): string {
    return new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 }).format(valor);
  }

  formatearDecimal(valor: number): string {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(valor);
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
}
