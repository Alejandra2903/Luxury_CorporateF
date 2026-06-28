import { Component, Input, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { ResourcesService } from '../../../../../core/services/resources.service';
import { Consumo, Sede, TipoRecursoCodigo } from '../../../../../core/models/resources.model';
import { ConsumptionTable } from '../../components/consumption-table/consumption-table';
import { ResourceStatCard } from '../../components/resource-stat-card/resource-stat-card';

@Component({
  selector: 'app-resource-consumption',
  standalone: true,
  imports: [ConsumptionTable, ResourceStatCard],
  templateUrl: './resource-consumption.html',
  styleUrl: './resource-consumption.scss',
})
export class ResourceConsumption {
  @Input({ required: true }) tipo: TipoRecursoCodigo = 'ENERGIA';
  @Input({ required: true }) titulo = '';
  @Input({ required: true }) descripcion = '';

  private readonly resourcesService = inject(ResourcesService);

  readonly cargando = signal(true);
  readonly sedes = signal<Sede[]>([]);
  readonly consumos = signal<Consumo[]>([]);
  readonly consumosFiltrados = computed(() =>
    this.consumos().filter((consumo) => consumo.tipoRecursoCodigo === this.tipo),
  );
  readonly totalCantidad = computed(() =>
    this.consumosFiltrados().reduce((total, consumo) => total + consumo.cantidad, 0),
  );
  readonly totalCosto = computed(() =>
    this.consumosFiltrados().reduce((total, consumo) => total + consumo.costo, 0),
  );
  readonly observados = computed(
    () => this.consumosFiltrados().filter((consumo) => consumo.estado === 'OBSERVADO').length,
  );
  readonly unidad = computed(() => this.consumosFiltrados()[0]?.unidad ?? '');

  constructor() {
    forkJoin({
      sedes: this.resourcesService.obtenerSedes(),
      consumos: this.resourcesService.obtenerConsumosPorPeriodo('2026-06'),
    })
      .pipe(takeUntilDestroyed())
      .subscribe((data) => {
        this.sedes.set(data.sedes);
        this.consumos.set(data.consumos);
        this.cargando.set(false);
      });
  }

  formatearMonto(valor: number): string {
    return `S/ ${valor.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`;
  }

  formatearNumero(valor: number): string {
    return valor.toLocaleString('es-PE', { maximumFractionDigits: 0 });
  }
}
