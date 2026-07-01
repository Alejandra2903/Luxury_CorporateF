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
import { LocalStorageDataService } from './local-storage-data.service';
import { AlertCenterService } from './alert-center.service';

@Injectable({ providedIn: 'root' })
export class ResourcesService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(LocalStorageDataService);
  private readonly alertCenter = inject(AlertCenterService);
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly mockDelayMs = 450;
  private readonly consumosKey = 'luxury_consumos';

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
      return of(this.storage.obtenerLista(this.consumosKey, CONSUMOS_MOCK)).pipe(
        delay(this.mockDelayMs),
      );
    }

    return this.http.get<Consumo[]>(`${this.apiBaseUrl}/consumos`);
  }

  crearConsumo(request: CrearConsumoRequest): Observable<Consumo> {
    if (environment.useMocks) {
      const sede = SEDES_MOCK.find((item) => item.id === request.sedeId);
      const tipo = TIPOS_RECURSO_MOCK.find((item) => item.id === request.tipoRecursoId);
      const observado = Boolean(request.observacion?.trim()) || request.costo >= 15000;
      const nuevo: Consumo = {
        id: Date.now(),
        sedeId: request.sedeId,
        sedeNombre: sede?.nombre ?? 'Sede',
        tipoRecursoId: request.tipoRecursoId,
        tipoRecursoCodigo: tipo?.codigo ?? 'ENERGIA',
        tipoRecursoNombre: tipo?.nombre ?? 'Recurso',
        unidad: tipo?.unidad ?? 'kWh',
        periodo: request.periodo,
        fechaRegistro: new Date().toISOString(),
        cantidad: request.cantidad,
        costo: request.costo,
        moneda: 'PEN',
        estado: observado ? 'OBSERVADO' : 'REGISTRADO',
        observacion: request.observacion,
      };

      const consumos = this.storage.obtenerLista(this.consumosKey, CONSUMOS_MOCK);
      this.storage.guardarLista(this.consumosKey, [nuevo, ...consumos]);
      this.alertCenter.crearParaAdmin(
        observado ? 'Alerta' : 'Consumo',
        observado ? 'Consumo observado registrado' : 'Nuevo consumo registrado',
        `${nuevo.sedeNombre} / ${nuevo.tipoRecursoNombre}: ${nuevo.cantidad} ${nuevo.unidad} por S/ ${nuevo.costo.toLocaleString('es-PE')}.`,
      );
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
