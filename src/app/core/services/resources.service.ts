import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, map, of, throwError } from 'rxjs';

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
  CrearSedeRequest,
  ResourcesResumen,
  Sede,
  TipoRecurso,
} from '../models/resources.model';
import { LocalStorageDataService } from './local-storage-data.service';
import { AlertCenterService } from './alert-center.service';
import { AccessScopeService } from './access-scope.service';

@Injectable({ providedIn: 'root' })
export class ResourcesService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(LocalStorageDataService);
  private readonly alertCenter = inject(AlertCenterService);
  private readonly accessScope = inject(AccessScopeService);
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly mockDelayMs = 450;
  private readonly consumosKey = 'luxury_consumos';
  private readonly sedesKey = 'luxury_sedes';

  obtenerSedes(): Observable<Sede[]> {
    if (environment.useMocks) {
      const sedes = this.storage.obtenerLista(this.sedesKey, SEDES_MOCK);
      return of(this.accessScope.filtrarSedes(sedes)).pipe(delay(this.mockDelayMs));
    }

    return this.http.get<Sede[]>(`${this.apiBaseUrl}/sedes`);
  }

  crearSede(request: CrearSedeRequest): Observable<Sede> {
    if (environment.useMocks) {
      const sedes = this.storage.obtenerLista(this.sedesKey, SEDES_MOCK);
      const nueva: Sede = {
        id: Date.now(),
        nombre: request.nombre.trim(),
        codigo: request.codigo.trim().toUpperCase(),
        direccion: request.direccion.trim(),
        ciudad: request.ciudad.trim(),
        responsable: request.responsable.trim(),
        activa: true,
      };

      this.storage.guardarLista(this.sedesKey, [nueva, ...sedes]);
      return of(nueva).pipe(delay(this.mockDelayMs));
    }

    return this.http.post<Sede>(`${this.apiBaseUrl}/sedes`, request);
  }

  obtenerTiposRecurso(): Observable<TipoRecurso[]> {
    if (environment.useMocks) {
      return of(TIPOS_RECURSO_MOCK).pipe(delay(this.mockDelayMs));
    }

    return this.http.get<TipoRecurso[]>(`${this.apiBaseUrl}/tipos-recurso`);
  }

  obtenerConsumos(): Observable<Consumo[]> {
    if (environment.useMocks) {
      const consumos = this.storage.obtenerLista(this.consumosKey, CONSUMOS_MOCK);
      return of(this.accessScope.filtrarPorSede(consumos)).pipe(
        delay(this.mockDelayMs),
      );
    }

    return this.http.get<Consumo[]>(`${this.apiBaseUrl}/consumos`);
  }

  crearConsumo(request: CrearConsumoRequest): Observable<Consumo> {
    if (environment.useMocks) {
      if (!this.accessScope.puedeVerSede(request.sedeId)) {
        return throwError(() => new Error('No tienes permisos para registrar datos de esta sede.'));
      }

      const sedes = this.storage.obtenerLista(this.sedesKey, SEDES_MOCK);
      const sede = sedes.find((item) => item.id === request.sedeId);
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
      this.alertCenter.crearPorEvento(
        observado ? 'BUDGET_EXCEEDED' : 'RESOURCE_REGISTERED',
        observado ? 'Alerta' : 'Consumo',
        observado ? 'Consumo observado registrado' : 'Nuevo consumo registrado',
        `${nuevo.sedeNombre} / ${nuevo.tipoRecursoNombre}: ${nuevo.cantidad} ${nuevo.unidad} por S/ ${nuevo.costo.toLocaleString('es-PE')}.`,
        nuevo.sedeId,
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
    // MOCK DESHABILITADO — useMocks = false
    // if (!environment.useMocks) {
    //   return of(RESOURCES_RESUMEN_MOCK).pipe(delay(this.mockDelayMs));
    // }
    // const sedes = this.accessScope.filtrarSedes(this.storage.obtenerLista(this.sedesKey, SEDES_MOCK));
    // const consumos = this.accessScope.filtrarPorSede(
    //   this.storage.obtenerLista(this.consumosKey, CONSUMOS_MOCK),
    // );
    // const consumosMes = consumos.filter((consumo) => consumo.periodo === '2026-06');
    // return of({
    //   sedesActivas: sedes.filter((sede) => sede.activa).length,
    //   consumosMes: consumosMes.length,
    //   costoTotalMes: consumosMes.reduce((total, consumo) => total + consumo.costo, 0),
    //   registrosObservados: consumos.filter((consumo) => consumo.estado === 'OBSERVADO').length,
    // }).pipe(delay(this.mockDelayMs));

    if (environment.useMocks) {
      const sedes = this.accessScope.filtrarSedes(this.storage.obtenerLista(this.sedesKey, SEDES_MOCK));
      const consumos = this.accessScope.filtrarPorSede(
        this.storage.obtenerLista(this.consumosKey, CONSUMOS_MOCK),
      );
      const consumosMes = consumos.filter((consumo) => consumo.periodo === '2026-06');

      return of({
        sedesActivas: sedes.filter((sede) => sede.activa).length,
        consumosMes: consumosMes.length,
        costoTotalMes: consumosMes.reduce((total, consumo) => total + consumo.costo, 0),
        registrosObservados: consumos.filter((consumo) => consumo.estado === 'OBSERVADO').length,
      }).pipe(delay(this.mockDelayMs));
    }

    // HTTP real: usa el resumen del dashboard que agrega los datos necesarios
    return this.http.get<ApiDashboardResumen>(`${this.apiBaseUrl}/dashboard/resumen`).pipe(
      map((r) => ({
        sedesActivas: r.totalSedes ?? 0,
        consumosMes: 0, // el backend no expone este dato en el resumen
        costoTotalMes: r.costoTotalPen ?? 0,
        registrosObservados: r.totalAlertas ?? 0,
      })),
    );
  }
}

interface ApiDashboardResumen {
  costoTotalPen: number;
  totalSedes: number;
  totalAlertas: number;
}
