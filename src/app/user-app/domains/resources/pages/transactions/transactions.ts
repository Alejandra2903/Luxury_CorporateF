import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, startWith } from 'rxjs';

import { ResourcesService } from '../../../../../core/services/resources.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { NotificacionService } from '../../../../../core/services/notificacion.service';
import { SessionMonitoringService } from '../../../../../core/services/session-monitoring.service';
import { Consumo, Sede, TipoRecurso } from '../../../../../core/models/resources.model';
import { ConsumptionTable } from '../../components/consumption-table/consumption-table';
import { ResourceStatCard } from '../../components/resource-stat-card/resource-stat-card';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [ConsumptionTable, ReactiveFormsModule, ResourceStatCard],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly resourcesService = inject(ResourcesService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly sessionMonitoringService = inject(SessionMonitoringService);

  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly sedes = signal<Sede[]>([]);
  readonly tipos = signal<TipoRecurso[]>([]);
  readonly consumos = signal<Consumo[]>([]);
  readonly filtros = this.fb.nonNullable.group({
    sedeId: [0],
    tipoRecursoId: [0],
    periodo: ['2026-06'],
  });
  readonly registroForm = this.fb.nonNullable.group({
    sedeId: [1, [Validators.required]],
    tipoRecursoId: [1, [Validators.required]],
    periodo: ['2026-06', [Validators.required]],
    cantidad: [0, [Validators.required, Validators.min(1)]],
    costo: [0, [Validators.required, Validators.min(1)]],
    observacion: [''],
  });

  readonly consumosFiltrados = signal<Consumo[]>([]);
  readonly puedeRegistrar = computed(() =>
    this.authService.tieneAlgunRol(['ADMIN', 'OPERADOR']),
  );
  readonly totalCosto = computed(() =>
    this.consumosFiltrados().reduce((total, consumo) => total + consumo.costo, 0),
  );
  readonly observados = computed(
    () => this.consumosFiltrados().filter((consumo) => consumo.estado === 'OBSERVADO').length,
  );

  constructor() {
    forkJoin({
      sedes: this.resourcesService.obtenerSedes(),
      tipos: this.resourcesService.obtenerTiposRecurso(),
      consumos: this.resourcesService.obtenerConsumos(),
    })
      .pipe(takeUntilDestroyed())
      .subscribe((data) => {
        this.sedes.set(data.sedes);
        this.tipos.set(data.tipos);
        this.consumos.set(data.consumos);
        this.cargando.set(false);
        this.aplicarFiltros(this.filtros.getRawValue());
      });

    this.filtros.valueChanges
      .pipe(startWith(this.filtros.getRawValue()))
      .pipe(takeUntilDestroyed())
      .subscribe((filtros) => this.aplicarFiltros(filtros));
  }

  formatearMonto(valor: number): string {
    return `S/ ${valor.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`;
  }

  registrarConsumo(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    const form = this.registroForm.getRawValue();
    this.guardando.set(true);
    this.resourcesService
      .crearConsumo({
        sedeId: Number(form.sedeId),
        tipoRecursoId: Number(form.tipoRecursoId),
        periodo: form.periodo,
        cantidad: Number(form.cantidad),
        costo: Number(form.costo),
        observacion: form.observacion.trim() || undefined,
      })
      .subscribe((consumo) => {
        this.consumos.update((consumos) => [consumo, ...consumos]);
        this.aplicarFiltros(this.filtros.getRawValue());
        this.guardando.set(false);
        this.notificacionService.exito(`Consumo registrado para ${consumo.sedeNombre}.`);
        this.sessionMonitoringService.registrarActividadUsuario(
          'REGISTRO_CONSUMO',
          `Registro de consumo de ${consumo.tipoRecursoNombre} en ${consumo.sedeNombre}.`,
          {
            consumoId: consumo.id,
            sede: consumo.sedeNombre,
            recurso: consumo.tipoRecursoNombre,
            periodo: consumo.periodo,
            costo: consumo.costo,
          },
        );
        this.registroForm.patchValue({
          cantidad: 0,
          costo: 0,
          observacion: '',
        });
      });
  }

  private aplicarFiltros(filtros: Partial<{ sedeId: number; tipoRecursoId: number; periodo: string }>): void {
    const sedeId = Number(filtros.sedeId ?? 0);
    const tipoRecursoId = Number(filtros.tipoRecursoId ?? 0);
    const periodo = filtros.periodo ?? '';

    this.consumosFiltrados.set(
      this.consumos().filter((consumo) => {
        const coincideSede = sedeId === 0 || consumo.sedeId === sedeId;
        const coincideTipo = tipoRecursoId === 0 || consumo.tipoRecursoId === tipoRecursoId;
        const coincidePeriodo = !periodo || consumo.periodo === periodo;
        return coincideSede && coincideTipo && coincidePeriodo;
      }),
    );
  }
}
