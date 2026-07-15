import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, forkJoin, map, of, throwError } from 'rxjs';

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
import { LocalStorageDataService } from './local-storage-data.service';
import { AlertCenterService } from './alert-center.service';
import { AccessScopeService } from './access-scope.service';

@Injectable({ providedIn: 'root' })
export class BusinessRulesService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(LocalStorageDataService);
  private readonly alertCenter = inject(AlertCenterService);
  private readonly accessScope = inject(AccessScopeService);
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly mockDelayMs = 450;
  private readonly tarifasKey = 'luxury_tarifas';
  private readonly umbralesKey = 'luxury_umbrales';
  private readonly alertasKey = 'luxury_alertas';

  obtenerTarifas(): Observable<Tarifa[]> {
    if (environment.useMocks) {
      const tarifas = this.storage.obtenerLista(this.tarifasKey, TARIFAS_MOCK);
      return of(this.accessScope.filtrarPorSede(tarifas)).pipe(
        delay(this.mockDelayMs),
      );
    }
    return this.http.get<Tarifa[]>(`${this.apiBaseUrl}/tarifas`);
  }

  crearTarifa(request: CrearTarifaRequest): Observable<Tarifa> {
    if (environment.useMocks) {
      if (!this.accessScope.esAdmin()) {
        return throwError(() => new Error('Solo ADMIN puede cambiar tarifas o tasas.'));
      }

      const tarifa = this.mapearTarifa(Date.now(), request, true);
      const tarifas = this.storage.obtenerLista(this.tarifasKey, TARIFAS_MOCK);
      this.storage.guardarLista(this.tarifasKey, [tarifa, ...tarifas]);
      this.alertCenter.crearPorEvento(
        'RATE_CHANGED',
        'Sistema',
        'Tarifa registrada',
        `${tarifa.sedeNombre} / ${tarifa.tipoRecursoCodigo}: S/ ${tarifa.costoUnitario}.`,
        tarifa.sedeId,
      );
      return of(tarifa).pipe(delay(this.mockDelayMs));
    }
    return this.http.post<Tarifa>(`${this.apiBaseUrl}/tarifas`, request);
  }

  actualizarTarifa(request: ActualizarTarifaRequest): Observable<Tarifa> {
    if (environment.useMocks) {
      if (!this.accessScope.esAdmin()) {
        return throwError(() => new Error('Solo ADMIN puede cambiar tarifas o tasas.'));
      }

      const tarifa = this.mapearTarifa(request.id, request, request.vigente);
      const tarifas = this.storage.obtenerLista(this.tarifasKey, TARIFAS_MOCK);
      this.storage.guardarLista(
        this.tarifasKey,
        tarifas.map((item) => (item.id === tarifa.id ? tarifa : item)),
      );
      this.alertCenter.crearPorEvento(
        'RATE_CHANGED',
        'Sistema',
        'Tarifa modificada',
        `${tarifa.sedeNombre} / ${tarifa.tipoRecursoCodigo}: S/ ${tarifa.costoUnitario}.`,
        tarifa.sedeId,
      );
      return of(tarifa).pipe(delay(this.mockDelayMs));
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
      const umbrales = this.storage.obtenerLista(this.umbralesKey, UMBRALES_MOCK);
      return of(this.accessScope.filtrarPorSede(umbrales)).pipe(
        delay(this.mockDelayMs),
      );
    }
    return this.http.get<Umbral[]>(`${this.apiBaseUrl}/umbrales`);
  }

  crearUmbral(request: CrearUmbralRequest): Observable<Umbral> {
    if (environment.useMocks) {
      if (!this.accessScope.puedeVerSede(request.sedeId)) {
        return throwError(() => new Error('No puedes configurar umbrales de otra sede.'));
      }

      const umbral = this.mapearUmbral(Date.now(), request, true);
      const umbrales = this.storage.obtenerLista(this.umbralesKey, UMBRALES_MOCK);
      this.storage.guardarLista(this.umbralesKey, [umbral, ...umbrales]);
      return of(umbral).pipe(delay(this.mockDelayMs));
    }
    return this.http.post<Umbral>(`${this.apiBaseUrl}/umbrales`, request);
  }

  actualizarUmbral(request: ActualizarUmbralRequest): Observable<Umbral> {
    if (environment.useMocks) {
      if (!this.accessScope.puedeVerSede(request.sedeId)) {
        return throwError(() => new Error('No puedes editar umbrales de otra sede.'));
      }

      const umbral = this.mapearUmbral(request.id, request, request.activo);
      const umbrales = this.storage.obtenerLista(this.umbralesKey, UMBRALES_MOCK);
      this.storage.guardarLista(
        this.umbralesKey,
        umbrales.map((item) => (item.id === umbral.id ? umbral : item)),
      );
      return of(umbral).pipe(delay(this.mockDelayMs));
    }
    return this.http.put<Umbral>(`${this.apiBaseUrl}/umbrales`, request);
  }

  eliminarUmbral(id: number): Observable<void> {
    if (environment.useMocks) {
      const umbrales = this.storage.obtenerLista(this.umbralesKey, UMBRALES_MOCK);
      this.storage.guardarLista(
        this.umbralesKey,
        umbrales.filter((umbral) => umbral.id !== id),
      );
      return of(void 0).pipe(delay(this.mockDelayMs));
    }
    return this.http.delete<void>(`${this.apiBaseUrl}/umbrales/${id}`);
  }

  obtenerAlertas(): Observable<Alerta[]> {
    if (environment.useMocks) {
      const alertas = this.storage.obtenerLista(this.alertasKey, ALERTAS_MOCK);
      return of(this.accessScope.filtrarPorSede(alertas)).pipe(
        delay(this.mockDelayMs),
      );
    }
    return this.http.get<Alerta[]>(`${this.apiBaseUrl}/alertas`);
  }

  crearAlerta(request: CrearAlertaRequest): Observable<Alerta> {
    if (environment.useMocks) {
      if (!this.accessScope.puedeVerSede(request.sedeId)) {
        return throwError(() => new Error('No puedes generar alertas de otra sede.'));
      }

      const sede = SEDES_MOCK.find((item) => item.id === request.sedeId);
      const tipo = TIPOS_RECURSO_MOCK.find((item) => item.id === request.tipoRecursoId);
      const alerta: Alerta = {
        id: Date.now(),
        sedeId: request.sedeId,
        sedeNombre: sede?.nombre ?? 'Sede',
        tipoRecursoId: request.tipoRecursoId,
        tipoRecursoCodigo: tipo?.codigo ?? 'ENERGIA',
        severidad: request.severidad,
        mensaje: request.mensaje,
        fechaGeneracion: new Date().toISOString(),
        atendida: false,
      };
      const alertas = this.storage.obtenerLista(this.alertasKey, ALERTAS_MOCK);
      this.storage.guardarLista(this.alertasKey, [alerta, ...alertas]);
      this.alertCenter.crearPorEvento(
        'BUDGET_EXCEEDED',
        'Alerta',
        `Alerta ${alerta.severidad.toLowerCase()} generada`,
        `${alerta.sedeNombre} / ${alerta.tipoRecursoCodigo}: ${alerta.mensaje}`,
        alerta.sedeId,
      );
      return of(alerta).pipe(delay(this.mockDelayMs));
    }
    return this.http.post<Alerta>(`${this.apiBaseUrl}/alertas`, request);
  }

  atenderAlerta(id: number): Observable<Alerta> {
    if (environment.useMocks) {
      const alertas = this.storage.obtenerLista(this.alertasKey, ALERTAS_MOCK);
      const actualizada = {
        ...(alertas.find((alerta) => alerta.id === id) ?? alertas[0]),
        atendida: true,
        atendidaPor: 'Usuario',
      };
      this.storage.guardarLista(
        this.alertasKey,
        alertas.map((alerta) => (alerta.id === id ? actualizada : alerta)),
      );
      return of(actualizada).pipe(delay(this.mockDelayMs));
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
    // MOCK DESHABILITADO — useMocks = false
    // if (!environment.useMocks) {
    //   return of(BUSINESS_RULES_RESUMEN_MOCK).pipe(delay(this.mockDelayMs));
    // }
    // const tarifas = this.accessScope.filtrarPorSede(...);
    // ...

    if (environment.useMocks) {
      const tarifas = this.accessScope.filtrarPorSede(
        this.storage.obtenerLista(this.tarifasKey, TARIFAS_MOCK),
      );
      const umbrales = this.accessScope.filtrarPorSede(
        this.storage.obtenerLista(this.umbralesKey, UMBRALES_MOCK),
      );
      const alertas = this.accessScope.filtrarPorSede(
        this.storage.obtenerLista(this.alertasKey, ALERTAS_MOCK),
      );

      return of({
        tarifasVigentes: tarifas.filter((tarifa) => tarifa.vigente).length,
        umbralesActivos: umbrales.filter((umbral) => umbral.activo).length,
        alertasPendientes: alertas.filter((alerta) => !alerta.atendida).length,
        alertasCriticas: alertas.filter(
          (alerta) => !alerta.atendida && alerta.severidad === 'CRITICA',
        ).length,
      }).pipe(delay(this.mockDelayMs));
    }

    // HTTP real: combina tarifas + umbrales + alertas del backend
    return forkJoin({
      tarifas: this.http.get<ApiBrTarifa[]>(`${this.apiBaseUrl}/tarifas`),
      umbrales: this.http.get<ApiBrUmbral[]>(`${this.apiBaseUrl}/umbrales`),
      alertas: this.http.get<ApiBrAlerta[]>(`${this.apiBaseUrl}/alertas`),
    }).pipe(
      map(({ tarifas, umbrales, alertas }) => ({
        tarifasVigentes: tarifas.filter((t) => t.vigente).length,
        umbralesActivos: umbrales.filter((u) => u.activo).length,
        alertasPendientes: alertas.filter((a) => !a.atendida).length,
        alertasCriticas: alertas.filter((a) => !a.atendida && a.severidad === 'CRITICA').length,
      })),
    );
  }

  private mapearTarifa(id: number, request: CrearTarifaRequest, vigente: boolean): Tarifa {
    const sede = SEDES_MOCK.find((item) => item.id === request.sedeId);
    const tipo = TIPOS_RECURSO_MOCK.find((item) => item.id === request.tipoRecursoId);
    const moneda = MONEDAS_MOCK.find((item) => item.id === request.monedaId);
    return {
      id,
      sedeId: request.sedeId,
      sedeNombre: sede?.nombre ?? 'Sede',
      tipoRecursoId: request.tipoRecursoId,
      tipoRecursoCodigo: tipo?.codigo ?? 'ENERGIA',
      tipoRecursoNombre: tipo?.nombre ?? 'Recurso',
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
      sedeNombre: sede?.nombre ?? 'Sede',
      tipoRecursoId: request.tipoRecursoId,
      tipoRecursoCodigo: tipo?.codigo ?? 'ENERGIA',
      tipoRecursoNombre: tipo?.nombre ?? 'Recurso',
      unidad: tipo?.unidad ?? 'kWh',
      minimo: request.minimo,
      maximo: request.maximo,
      periodo: request.periodo,
      activo,
    };
  }
}

interface ApiBrTarifa { vigente: boolean; }
interface ApiBrUmbral { activo: boolean; }
interface ApiBrAlerta { atendida: boolean; severidad: string; }
