import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ALERTAS_MOCK,
  BUSINESS_RULES_RESUMEN_MOCK,
  TARIFAS_MOCK,
  UMBRALES_MOCK,
} from '../mocks/business-rules.mock';
import { MONEDAS_MOCK } from '../mocks/financial-exchange.mock';
import { SEDES_MOCK, TIPOS_RECURSO_MOCK } from '../mocks/resources.mock';
import {
  ActualizarTarifaRequest,
  ActualizarUmbralRequest,
  Alerta,
  BusinessRulesResumen,
  CrearAlertaRequest,
  CrearTarifaRequest,
  CrearUmbralRequest,
  Tarifa,
  Umbral,
} from '../models/business-rules.model';

@Injectable({ providedIn: 'root' })
export class BusinessRulesService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly mockDelayMs = 450;

  obtenerTarifas(): Observable<Tarifa[]> {
    if (environment.useMocks) {
      return of(TARIFAS_MOCK).pipe(delay(this.mockDelayMs));
    }
    return this.http.get<Tarifa[]>(`${this.apiBaseUrl}/tarifas`);
  }

  crearTarifa(request: CrearTarifaRequest): Observable<Tarifa> {
    if (environment.useMocks) {
      return of(this.mapearTarifa(Date.now(), request, true)).pipe(delay(this.mockDelayMs));
    }
    return this.http.post<Tarifa>(`${this.apiBaseUrl}/tarifas`, request);
  }

  actualizarTarifa(request: ActualizarTarifaRequest): Observable<Tarifa> {
    if (environment.useMocks) {
      return of(this.mapearTarifa(request.id, request, request.vigente)).pipe(delay(this.mockDelayMs));
    }
    return this.http.put<Tarifa>(`${this.apiBaseUrl}/tarifas`, request);
  }

  obtenerTarifaVigente(sedeId: number, tipoRecursoId: number): Observable<Tarifa | undefined> {
    if (environment.useMocks) {
      return this.obtenerTarifas().pipe(
        map((tarifas) =>
          tarifas.find(
            (tarifa) =>
              tarifa.sedeId === sedeId &&
              tarifa.tipoRecursoId === tipoRecursoId &&
              tarifa.vigente,
          ),
        ),
      );
    }
    return this.http.get<Tarifa>(
      `${this.apiBaseUrl}/tarifas/vigente?sedeId=${sedeId}&tipoRecursoId=${tipoRecursoId}`,
    );
  }

  obtenerUmbrales(): Observable<Umbral[]> {
    if (environment.useMocks) {
      return of(UMBRALES_MOCK).pipe(delay(this.mockDelayMs));
    }
    return this.http.get<Umbral[]>(`${this.apiBaseUrl}/umbrales`);
  }

  crearUmbral(request: CrearUmbralRequest): Observable<Umbral> {
    if (environment.useMocks) {
      return of(this.mapearUmbral(Date.now(), request, true)).pipe(delay(this.mockDelayMs));
    }
    return this.http.post<Umbral>(`${this.apiBaseUrl}/umbrales`, request);
  }

  actualizarUmbral(request: ActualizarUmbralRequest): Observable<Umbral> {
    if (environment.useMocks) {
      return of(this.mapearUmbral(request.id, request, request.activo)).pipe(delay(this.mockDelayMs));
    }
    return this.http.put<Umbral>(`${this.apiBaseUrl}/umbrales`, request);
  }

  eliminarUmbral(id: number): Observable<void> {
    if (environment.useMocks) {
      return of(void 0).pipe(delay(this.mockDelayMs));
    }
    return this.http.delete<void>(`${this.apiBaseUrl}/umbrales/${id}`);
  }

  obtenerAlertas(): Observable<Alerta[]> {
    if (environment.useMocks) {
      return of(ALERTAS_MOCK).pipe(delay(this.mockDelayMs));
    }
    return this.http.get<Alerta[]>(`${this.apiBaseUrl}/alertas`);
  }

  crearAlerta(request: CrearAlertaRequest): Observable<Alerta> {
    if (environment.useMocks) {
      const sede = SEDES_MOCK.find((item) => item.id === request.sedeId);
      const tipo = TIPOS_RECURSO_MOCK.find((item) => item.id === request.tipoRecursoId);
      return of({
        id: Date.now(),
        sedeId: request.sedeId,
        sedeNombre: sede?.nombre ?? 'Sede mock',
        tipoRecursoId: request.tipoRecursoId,
        tipoRecursoCodigo: tipo?.codigo ?? 'ENERGIA',
        severidad: request.severidad,
        mensaje: request.mensaje,
        fechaGeneracion: new Date().toISOString(),
        atendida: false,
      }).pipe(delay(this.mockDelayMs));
    }
    return this.http.post<Alerta>(`${this.apiBaseUrl}/alertas`, request);
  }

  atenderAlerta(id: number): Observable<Alerta> {
    if (environment.useMocks) {
      return this.obtenerAlertas().pipe(
        map((alertas) => ({
          ...(alertas.find((alerta) => alerta.id === id) ?? alertas[0]),
          atendida: true,
          atendidaPor: 'Usuario mock',
        })),
      );
    }
    return this.http.patch<Alerta>(`${this.apiBaseUrl}/alertas/${id}/atender`, {});
  }

  obtenerAlertasPorSede(idSede: number): Observable<Alerta[]> {
    if (environment.useMocks) {
      return this.obtenerAlertas().pipe(
        map((alertas) => alertas.filter((alerta) => alerta.sedeId === idSede)),
      );
    }
    return this.http.get<Alerta[]>(`${this.apiBaseUrl}/alertas/sede/${idSede}`);
  }

  obtenerResumen(): Observable<BusinessRulesResumen> {
    return of(BUSINESS_RULES_RESUMEN_MOCK).pipe(delay(this.mockDelayMs));
  }

  private mapearTarifa(id: number, request: CrearTarifaRequest, vigente: boolean): Tarifa {
    const sede = SEDES_MOCK.find((item) => item.id === request.sedeId);
    const tipo = TIPOS_RECURSO_MOCK.find((item) => item.id === request.tipoRecursoId);
    const moneda = MONEDAS_MOCK.find((item) => item.id === request.monedaId);
    return {
      id,
      sedeId: request.sedeId,
      sedeNombre: sede?.nombre ?? 'Sede mock',
      tipoRecursoId: request.tipoRecursoId,
      tipoRecursoCodigo: tipo?.codigo ?? 'ENERGIA',
      tipoRecursoNombre: tipo?.nombre ?? 'Recurso mock',
      monedaId: request.monedaId,
      monedaCodigo: moneda?.codigo ?? 'PEN',
      costoUnitario: request.costoUnitario,
      fechaInicio: request.fechaInicio,
      fechaFin: request.fechaFin,
      vigente,
    };
  }

  private mapearUmbral(id: number, request: CrearUmbralRequest, activo: boolean): Umbral {
    const sede = SEDES_MOCK.find((item) => item.id === request.sedeId);
    const tipo = TIPOS_RECURSO_MOCK.find((item) => item.id === request.tipoRecursoId);
    return {
      id,
      sedeId: request.sedeId,
      sedeNombre: sede?.nombre ?? 'Sede mock',
      tipoRecursoId: request.tipoRecursoId,
      tipoRecursoCodigo: tipo?.codigo ?? 'ENERGIA',
      tipoRecursoNombre: tipo?.nombre ?? 'Recurso mock',
      unidad: tipo?.unidad ?? 'kWh',
      minimo: request.minimo,
      maximo: request.maximo,
      periodo: request.periodo,
      activo,
    };
  }
}
