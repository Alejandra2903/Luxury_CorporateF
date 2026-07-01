import { Component, Input } from '@angular/core';

import { DashboardAlerta } from '../../../../../core/models/dashboard.model';

@Component({
  selector: 'app-alert-summary',
  standalone: true,
  templateUrl: './alert-summary.html',
  styleUrl: './alert-summary.scss',
})
export class AlertSummary {
  @Input({ required: true }) alertas: DashboardAlerta[] = [];

  claseSeveridad(severidad: DashboardAlerta['severidad']): string {
    return `severity severity--${severidad.toLowerCase()}`;
  }
}
