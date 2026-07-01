import { Component, Input } from '@angular/core';

import { ConsumoPorSede, MonedaDashboard } from '../../../../../core/models/dashboard.model';

@Component({
  selector: 'app-resource-chart',
  standalone: true,
  templateUrl: './resource-chart.html',
  styleUrl: './resource-chart.scss',
})
export class ResourceChart {
  @Input({ required: true }) sedes: ConsumoPorSede[] = [];
  @Input({ required: true }) moneda: MonedaDashboard = {
    codigo: 'PEN',
    simbolo: 'S/',
    nombre: 'Sol peruano',
    factorDesdePen: 1,
  };

  maxCosto(): number {
    return Math.max(...this.sedes.map((sede) => sede.costoTotal), 1);
  }

  anchoCosto(valor: number): number {
    return Math.max(10, Math.round((valor / this.maxCosto()) * 100));
  }

  formatearMonto(valor: number): string {
    return `${this.moneda.simbolo} ${valor.toLocaleString('es-PE', {
      maximumFractionDigits: 0,
    })}`;
  }
}
