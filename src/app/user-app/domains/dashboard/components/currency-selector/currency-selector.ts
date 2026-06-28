import { Component, EventEmitter, Input, Output } from '@angular/core';

import { CodigoMoneda, MonedaDashboard } from '../../../../../core/models/dashboard.model';

@Component({
  selector: 'app-currency-selector',
  standalone: true,
  templateUrl: './currency-selector.html',
  styleUrl: './currency-selector.scss',
})
export class CurrencySelector {
  @Input({ required: true }) monedas: MonedaDashboard[] = [];
  @Input({ required: true }) monedaSeleccionada: CodigoMoneda = 'PEN';
  @Output() monedaSeleccionadaChange = new EventEmitter<CodigoMoneda>();

  cambiarMoneda(codigo: string): void {
    this.monedaSeleccionadaChange.emit(codigo as CodigoMoneda);
  }
}
