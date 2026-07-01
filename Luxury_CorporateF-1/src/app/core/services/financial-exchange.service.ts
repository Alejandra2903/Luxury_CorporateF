import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { MONEDAS_MOCK, TIPOS_CAMBIO_MOCK } from '../mocks/financial-exchange.mock';
import {
  ActualizarTipoCambioRequest,
  CrearMonedaRequest,
  CrearTipoCambioRequest,
  Moneda,
  TipoCambio,
} from '../models/financial-exchange.model';

@Injectable({ providedIn: 'root' })
export class FinancialExchangeService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly mockDelayMs = 450;

  obtenerMonedas(): Observable<Moneda[]> {
    if (environment.useMocks) {
      return of(MONEDAS_MOCK).pipe(delay(this.mockDelayMs));
    }

    return this.http.get<Moneda[]>(`${this.apiBaseUrl}/monedas`);
  }

  crearMoneda(request: CrearMonedaRequest): Observable<Moneda> {
    if (environment.useMocks) {
      const nueva: Moneda = {
        id: Date.now(),
        codigo: request.codigo.trim().toUpperCase(),
        nombre: request.nombre.trim(),
        simbolo: request.simbolo.trim(),
        activa: true,
      };

      return of(nueva).pipe(delay(this.mockDelayMs));
    }

    return this.http.post<Moneda>(`${this.apiBaseUrl}/monedas`, request);
  }

  obtenerTiposCambio(): Observable<TipoCambio[]> {
    if (environment.useMocks) {
      return of(TIPOS_CAMBIO_MOCK).pipe(delay(this.mockDelayMs));
    }

    return this.http.get<TipoCambio[]>(`${this.apiBaseUrl}/tipos-cambio`);
  }

  crearTipoCambio(request: CrearTipoCambioRequest): Observable<TipoCambio> {
    if (environment.useMocks) {
      const nuevo = this.mapearTipoCambio(Date.now(), request, true);
      return of(nuevo).pipe(delay(this.mockDelayMs));
    }

    return this.http.post<TipoCambio>(`${this.apiBaseUrl}/tipos-cambio`, request);
  }

  actualizarTipoCambio(request: ActualizarTipoCambioRequest): Observable<TipoCambio> {
    if (environment.useMocks) {
      const actualizado = this.mapearTipoCambio(request.id, request, request.activo);
      return of(actualizado).pipe(delay(this.mockDelayMs));
    }

    return this.http.put<TipoCambio>(`${this.apiBaseUrl}/tipos-cambio`, request);
  }

  private mapearTipoCambio(
    id: number,
    request: CrearTipoCambioRequest,
    activo: boolean,
  ): TipoCambio {
    const origen = MONEDAS_MOCK.find((moneda) => moneda.id === request.monedaOrigenId);
    const destino = MONEDAS_MOCK.find((moneda) => moneda.id === request.monedaDestinoId);

    return {
      id,
      monedaOrigenId: request.monedaOrigenId,
      monedaOrigenCodigo: origen?.codigo ?? 'N/D',
      monedaDestinoId: request.monedaDestinoId,
      monedaDestinoCodigo: destino?.codigo ?? 'N/D',
      tasa: request.tasa,
      fechaVigencia: request.fechaVigencia,
      fuente: request.fuente,
      activo,
    };
  }
}
