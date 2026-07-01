import { Component } from '@angular/core';

import { ResourceConsumption } from '../resource-consumption/resource-consumption';

@Component({
  selector: 'app-water-consumption',
  standalone: true,
  imports: [ResourceConsumption],
  template: `
    <app-resource-consumption
      tipo="AGUA"
      titulo="Consumo de agua"
      descripcion="Control de consumo hidrico por sede, con registros observados y costos mensuales."
    />
  `,
})
export class WaterConsumption {}
