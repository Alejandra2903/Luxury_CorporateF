import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CONSUMO_POR_SEDE_MOCK,
  COSTOS_POR_MES_MOCK,
  DASHBOARD_ALERTAS_MOCK,
  DASHBOARD_RESUMEN_MOCK,
  MONEDAS_DASHBOARD_MOCK,
} from '../mocks/dashboard.mock';
import {
  ConsumoPorSede,
  CostosPorMes,
  DashboardAlerta,
  DashboardResumen,
  MonedaDashboard,
} from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/dashboard`;
  private readonly mockDelayMs = 450;

  obtenerResumen(): Observable<DashboardResumen> {
    if (environment.useMocks) {
      return of(DASHBOARD_RESUMEN_MOCK).pipe(delay(this.mockDelayMs));
    }

    return this.http.get<DashboardResumen>(`${this.apiUrl}/resumen`);
  }

  obtenerConsumoPorSede(): Observable<ConsumoPorSede[]> {
    if (environment.useMocks) {
      return of(CONSUMO_POR_SEDE_MOCK).pipe(delay(this.mockDelayMs));
    }

    return this.http.get<ConsumoPorSede[]>(`${this.apiUrl}/consumo-por-sede`);
  }

  obtenerCostosPorMes(): Observable<CostosPorMes[]> {
    if (environment.useMocks) {
      return of(COSTOS_POR_MES_MOCK).pipe(delay(this.mockDelayMs));
    }

    return this.http.get<CostosPorMes[]>(`${this.apiUrl}/costos-por-mes`);
  }

  obtenerAlertasResumen(): Observable<DashboardAlerta[]> {
    return of(DASHBOARD_ALERTAS_MOCK).pipe(delay(this.mockDelayMs));
  }

  obtenerMonedasDashboard(): Observable<MonedaDashboard[]> {
    return of(MONEDAS_DASHBOARD_MOCK).pipe(delay(this.mockDelayMs));
  }
}
