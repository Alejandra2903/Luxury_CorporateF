import { Component } from '@angular/core';

import { ResourceConsumption } from '../resource-consumption/resource-consumption';

@Component({
  selector: 'app-energy-consumption',
  standalone: true,
  imports: [ResourceConsumption],
  template: `
    <app-resource-consumption
      tipo="ENERGIA"
      titulo="Consumo de energia"
      descripcion="Seguimiento de energia electrica por sede, costo y estado de validacion."
    />
  `,
})
export class EnergyConsumption {}
