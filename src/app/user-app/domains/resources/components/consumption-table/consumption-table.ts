import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Consumo } from '../../../../../core/models/resources.model';

@Component({
  selector: 'app-consumption-table',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './consumption-table.html',
  styleUrl: './consumption-table.scss',
})
export class ConsumptionTable {
  @Input({ required: true }) consumos: Consumo[] = [];
  @Input() mostrarTipo = true;

  formatearMonto(valor: number): string {
    return `S/ ${valor.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`;
  }

  claseEstado(estado: Consumo['estado']): string {
    return `status status--${estado.toLowerCase()}`;
  }
}
