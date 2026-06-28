import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { forkJoin, startWith } from 'rxjs';

import { ResourcesService } from '../../../../../core/services/resources.service';
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
  private readonly resourcesService = inject(ResourcesService);

  readonly cargando = signal(true);
  readonly sedes = signal<Sede[]>([]);
  readonly tipos = signal<TipoRecurso[]>([]);
  readonly consumos = signal<Consumo[]>([]);
  readonly filtros = this.fb.nonNullable.group({
    sedeId: [0],
    tipoRecursoId: [0],
    periodo: ['2026-06'],
  });

  readonly consumosFiltrados = signal<Consumo[]>([]);
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
