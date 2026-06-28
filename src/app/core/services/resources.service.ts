import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CONSUMOS_MOCK,
  RESOURCES_RESUMEN_MOCK,
  SEDES_MOCK,
  TIPOS_RECURSO_MOCK,
} from '../mocks/resources.mock';
import {
  Consumo,
  CrearConsumoRequest,
  ResourcesResumen,
  Sede,
  TipoRecurso,
} from '../models/resources.model';

@Injectable({ providedIn: 'root' })
export class ResourcesService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly mockDelayMs = 450;

  obtenerSedes(): Observable<Sede[]> {
    if (environment.useMocks) {
      return of(SEDES_MOCK).pipe(delay(this.mockDelayMs));
    }

    return this.http.get<Sede[]>(`${this.apiBaseUrl}/sedes`);
  }

  obtenerTiposRecurso(): Observable<TipoRecurso[]> {
    if (environment.useMocks) {
      return of(TIPOS_RECURSO_MOCK).pipe(delay(this.mockDelayMs));
    }

    return this.http.get<TipoRecurso[]>(`${this.apiBaseUrl}/tipos-recurso`);
  }

  obtenerConsumos(): Observable<Consumo[]> {
    if (environment.useMocks) {
      return of(CONSUMOS_MOCK).pipe(delay(this.mockDelayMs));
    }

    return this.http.get<Consumo[]>(`${this.apiBaseUrl}/consumos`);
  }

  crearConsumo(request: CrearConsumoRequest): Observable<Consumo> {
    if (environment.useMocks) {
      const sede = SEDES_MOCK.find((item) => item.id === request.sedeId);
      const tipo = TIPOS_RECURSO_MOCK.find((item) => item.id === request.tipoRecursoId);
      const nuevo: Consumo = {
        id: Date.now(),
        sedeId: request.sedeId,
        sedeNombre: sede?.nombre ?? 'Sede mock',
        tipoRecursoId: request.tipoRecursoId,
        tipoRecursoCodigo: tipo?.codigo ?? 'ENERGIA',
        tipoRecursoNombre: tipo?.nombre ?? 'Recurso mock',
        unidad: tipo?.unidad ?? 'kWh',
        periodo: request.periodo,
        fechaRegistro: new Date().toISOString(),
        cantidad: request.cantidad,
        costo: request.costo,
        moneda: 'PEN',
        estado: 'REGISTRADO',
        observacion: request.observacion,
      };

      return of(nuevo).pipe(delay(this.mockDelayMs));
    }

    return this.http.post<Consumo>(`${this.apiBaseUrl}/consumos`, request);
  }

  obtenerConsumoPorId(id: number): Observable<Consumo> {
    if (environment.useMocks) {
      return this.obtenerConsumos().pipe(
        map((consumos) => consumos.find((consumo) => consumo.id === id) ?? consumos[0]),
      );
    }

    return this.http.get<Consumo>(`${this.apiBaseUrl}/consumos/${id}`);
  }

  obtenerConsumosPorSede(idSede: number): Observable<Consumo[]> {
    if (environment.useMocks) {
      return this.obtenerConsumos().pipe(
        map((consumos) => consumos.filter((consumo) => consumo.sedeId === idSede)),
      );
    }

    return this.http.get<Consumo[]>(`${this.apiBaseUrl}/consumos/sede/${idSede}`);
  }

  obtenerConsumosPorPeriodo(periodo: string): Observable<Consumo[]> {
    if (environment.useMocks) {
      return this.obtenerConsumos().pipe(
        map((consumos) => consumos.filter((consumo) => consumo.periodo === periodo)),
      );
    }

    return this.http.get<Consumo[]>(`${this.apiBaseUrl}/consumos/periodo/${periodo}`);
  }

  obtenerResumenRecursos(): Observable<ResourcesResumen> {
    return of(RESOURCES_RESUMEN_MOCK).pipe(delay(this.mockDelayMs));
  }
}
