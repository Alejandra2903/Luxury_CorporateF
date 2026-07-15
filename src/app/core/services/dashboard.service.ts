import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, forkJoin, map, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CONSUMO_POR_SEDE_MOCK,
  COSTOS_POR_MES_MOCK,
  DASHBOARD_ALERTAS_MOCK,
  DASHBOARD_RESUMEN_MOCK,
  MONEDAS_DASHBOARD_MOCK,
} from '../mocks/dashboard.mock';
import {
  CodigoMoneda,
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

    // HTTP real: adapta la respuesta del backend al modelo del frontend
    return this.http.get<ApiDashboardResumen>(`${this.apiUrl}/resumen`).pipe(
      map((r) => ({
        periodo: r.periodo ?? '',
        monedaBase: (r.moneda ?? 'PEN') as DashboardResumen['monedaBase'],
        costoTotal: r.costoTotalPen ?? 0,
        variacionCostoPorcentaje: r.variacionCostoPorcentaje ?? 0,
        consumoEnergiaKwh: r.energiaKwh ?? 0,
        consumoAguaM3: r.aguaM3 ?? 0,
        sedesActivas: r.totalSedes ?? 0,
        alertasActivas: r.totalAlertas ?? 0,
        cumplimientoUmbralesPorcentaje: r.cumplimientoUmbralesPorcentaje ?? 0,
        ultimaActualizacion: r.ultimaActualizacion ?? new Date().toISOString(),
      })),
    );
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
    if (environment.useMocks) {
      if (this.accessScope.esAdmin()) {
        return of(DASHBOARD_ALERTAS_MOCK).pipe(delay(this.mockDelayMs));
      }

      const sedeId = this.accessScope.obtenerSedeId();
      const sedes = this.accessScope.filtrarPorSede(CONSUMO_POR_SEDE_MOCK);
      const sede = sedes.find((item) => item.sedeId === sedeId);
      const alertas = DASHBOARD_ALERTAS_MOCK.filter((alerta) => alerta.sede === sede?.sede);

      return of(alertas).pipe(delay(this.mockDelayMs));
    }

    const sedeId = this.accessScope.obtenerSedeId();
    const url = this.accessScope.esAdmin() || sedeId == null
      ? `${environment.apiBaseUrl}/alertas`
      : `${environment.apiBaseUrl}/alertas/sede/${sedeId}`;

    return this.http.get<ApiAlerta[]>(url).pipe(
      map((alertas) =>
        alertas.map((alerta) => ({
          id: alerta.id,
          sede: alerta.sedeNombre ?? 'Sin sede',
          severidad: alerta.severidad as DashboardAlerta['severidad'],
          mensaje: alerta.mensaje,
          fecha: alerta.fechaGeneracion,
        })),
      ),
    );
  }

  obtenerMonedasDashboard(): Observable<MonedaDashboard[]> {
    if (environment.useMocks) {
      return of(MONEDAS_DASHBOARD_MOCK).pipe(delay(this.mockDelayMs));
    }

    return forkJoin({
      monedas: this.http.get<ApiMoneda[]>(`${environment.apiBaseUrl}/monedas`),
      cambios: this.http.get<ApiTipoCambio[]>(`${environment.apiBaseUrl}/tipos-cambio`),
    }).pipe(
      map(({ monedas, cambios }) =>
        monedas
          .filter((moneda) => ['PEN', 'USD', 'EUR'].includes(moneda.codigo))
          .map((moneda) => ({
            codigo: moneda.codigo as CodigoMoneda,
            simbolo: moneda.simbolo,
            nombre: moneda.nombre,
            factorDesdePen: this.calcularFactorDesdePen(moneda.codigo, cambios),
          })),
      ),
    );
  }

  private calcularFactorDesdePen(codigo: string, cambios: ApiTipoCambio[]): number {
    if (codigo === 'PEN') {
      return 1;
    }
    const directo = cambios.find(
      (cambio) => cambio.monedaOrigenCodigo === 'PEN' && cambio.monedaDestinoCodigo === codigo,
    );
    if (directo) {
      return directo.tasa;
    }
    const inverso = cambios.find(
      (cambio) => cambio.monedaOrigenCodigo === codigo && cambio.monedaDestinoCodigo === 'PEN',
    );
    if (inverso && inverso.tasa !== 0) {
      return 1 / inverso.tasa;
    }
    return 1;
  }
}

interface ApiAlerta {
  id: number;
  sedeNombre: string | null;
  severidad: string;
  mensaje: string;
  fechaGeneracion: string;
}

interface ApiMoneda {
  codigo: string;
  nombre: string;
  simbolo: string;
}

interface ApiTipoCambio {
  monedaOrigenCodigo: string;
  monedaDestinoCodigo: string;
  tasa: number;
}

interface ApiDashboardResumen {
  periodo: string;
  moneda: string;
  costoTotalPen: number;
  variacionCostoPorcentaje: number;
  energiaKwh: number;
  aguaM3: number;
  totalSedes: number;
  totalAlertas: number;
  cumplimientoUmbralesPorcentaje: number;
  ultimaActualizacion: string;
}
