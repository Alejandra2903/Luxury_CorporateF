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
import { AccessScopeService } from './access-scope.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly accessScope = inject(AccessScopeService);
  private readonly apiUrl = `${environment.apiBaseUrl}/dashboard`;
  private readonly mockDelayMs = 450;

  obtenerResumen(): Observable<DashboardResumen> {
    if (environment.useMocks) {
      const sedes = this.accessScope.filtrarPorSede(CONSUMO_POR_SEDE_MOCK);
      const costoTotal = sedes.reduce((total, sede) => total + sede.costoTotal, 0);
      const energia = sedes.reduce((total, sede) => total + sede.energiaKwh, 0);
      const agua = sedes.reduce((total, sede) => total + sede.aguaM3, 0);
      const alertas = sedes.reduce((total, sede) => total + sede.alertas, 0);

      return of({
        ...DASHBOARD_RESUMEN_MOCK,
        costoTotal,
        consumoEnergiaKwh: energia,
        consumoAguaM3: agua,
        sedesActivas: sedes.length,
        alertasActivas: alertas,
      }).pipe(delay(this.mockDelayMs));
    }

    return this.http.get<DashboardResumen>(`${this.apiUrl}/resumen`);
  }

  obtenerConsumoPorSede(): Observable<ConsumoPorSede[]> {
    if (environment.useMocks) {
      return of(this.accessScope.filtrarPorSede(CONSUMO_POR_SEDE_MOCK)).pipe(
        delay(this.mockDelayMs),
      );
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
    if (this.accessScope.esAdmin()) {
      return of(DASHBOARD_ALERTAS_MOCK).pipe(delay(this.mockDelayMs));
    }

    const sedeId = this.accessScope.obtenerSedeId();
    const sedes = this.accessScope.filtrarPorSede(CONSUMO_POR_SEDE_MOCK);
    const sede = sedes.find((item) => item.sedeId === sedeId);
    const alertas = DASHBOARD_ALERTAS_MOCK.filter((alerta) => alerta.sede === sede?.sede);

    return of(alertas).pipe(delay(this.mockDelayMs));
  }

  obtenerMonedasDashboard(): Observable<MonedaDashboard[]> {
    return of(MONEDAS_DASHBOARD_MOCK).pipe(delay(this.mockDelayMs));
  }
}
