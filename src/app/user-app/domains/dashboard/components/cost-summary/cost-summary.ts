import { Component, Input } from '@angular/core';

import { CostosPorMes, MonedaDashboard } from '../../../../../core/models/dashboard.model';

@Component({
  selector: 'app-cost-summary',
  standalone: true,
  templateUrl: './cost-summary.html',
  styleUrl: './cost-summary.scss',
})
export class CostSummary {
  @Input({ required: true }) costos: CostosPorMes[] = [];
  @Input({ required: true }) moneda: MonedaDashboard = {
    codigo: 'PEN',
    simbolo: 'S/',
    nombre: 'Sol peruano',
    factorDesdePen: 1,
  };

  maximo(): number {
    return Math.max(...this.costos.map((item) => item.costoTotal), 1);
  }

  anchoBarra(valor: number): number {
    return Math.max(8, Math.round((valor / this.maximo()) * 100));
  }

  formatearMonto(valor: number): string {
    return `${this.moneda.simbolo} ${valor.toLocaleString('es-PE', {
      maximumFractionDigits: 0,
    })}`;
  }
}
