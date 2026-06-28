import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { ResourcesService } from '../../../../../core/services/resources.service';
import {
  Consumo,
  ResourcesResumen,
  Sede,
  TipoRecurso,
} from '../../../../../core/models/resources.model';
import { ConsumptionTable } from '../../components/consumption-table/consumption-table';
import { ResourceStatCard } from '../../components/resource-stat-card/resource-stat-card';

@Component({
  selector: 'app-resources-overview',
  standalone: true,
  imports: [ConsumptionTable, ResourceStatCard],
  templateUrl: './resources-overview.html',
  styleUrl: './resources-overview.scss',
})
export class ResourcesOverview {
  private readonly resourcesService = inject(ResourcesService);

  readonly cargando = signal(true);
  readonly resumen = signal<ResourcesResumen | null>(null);
  readonly sedes = signal<Sede[]>([]);
  readonly tipos = signal<TipoRecurso[]>([]);
  readonly consumos = signal<Consumo[]>([]);
  readonly consumosRecientes = computed(() => this.consumos().slice(0, 6));

  constructor() {
    forkJoin({
      resumen: this.resourcesService.obtenerResumenRecursos(),
      sedes: this.resourcesService.obtenerSedes(),
      tipos: this.resourcesService.obtenerTiposRecurso(),
      consumos: this.resourcesService.obtenerConsumosPorPeriodo('2026-06'),
    })
      .pipe(takeUntilDestroyed())
      .subscribe((data) => {
        this.resumen.set(data.resumen);
        this.sedes.set(data.sedes);
        this.tipos.set(data.tipos);
        this.consumos.set(data.consumos);
        this.cargando.set(false);
      });
  }

  formatearMonto(valor: number): string {
    return `S/ ${valor.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`;
  }
}
