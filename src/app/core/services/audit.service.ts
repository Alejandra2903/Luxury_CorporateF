import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, forkJoin, map, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AUDITORIAS_MOCK,
  AUDIT_RESUMEN_MOCK,
  EVENTOS_ACCESO_MOCK,
} from '../mocks/audit.mock';
import { AuditModulo, AuditResumen, Auditoria, EventoAcceso } from '../models/audit.model';
import { AccessScopeService } from './access-scope.service';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly http = inject(HttpClient);
  private readonly accessScope = inject(AccessScopeService);
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly mockDelayMs = 450;

  obtenerAuditorias(): Observable<Auditoria[]> {
    if (environment.useMocks) {
      return of(this.filtrarAuditoriasPorAlcance(AUDITORIAS_MOCK)).pipe(delay(this.mockDelayMs));
    }
    // Adapta la respuesta del backend al modelo del frontend
    return this.http.get<ApiAuditoria[]>(`${this.apiBaseUrl}/auditorias`).pipe(
      map((items) => items.map((a) => this.mapAuditoria(a))),
    );
  }

  obtenerAuditoriasPorUsuario(id: number): Observable<Auditoria[]> {
    if (environment.useMocks) {
      return this.obtenerAuditorias().pipe(
        map((auditorias) => auditorias.filter((auditoria) => auditoria.usuarioId === id)),
      );
    }
    return this.http.get<ApiAuditoria[]>(`${this.apiBaseUrl}/auditorias/usuario/${id}`).pipe(
      map((items) => items.map((a) => this.mapAuditoria(a))),
    );
  }

  obtenerAuditoriasPorModulo(modulo: AuditModulo): Observable<Auditoria[]> {
    if (environment.useMocks) {
      return this.obtenerAuditorias().pipe(
        map((auditorias) => auditorias.filter((auditoria) => auditoria.modulo === modulo)),
      );
    }
    return this.http.get<ApiAuditoria[]>(`${this.apiBaseUrl}/auditorias/modulo/${modulo}`).pipe(
      map((items) => items.map((a) => this.mapAuditoria(a))),
    );
  }

  obtenerEventosAcceso(): Observable<EventoAcceso[]> {
    if (environment.useMocks) {
      return of(this.filtrarAccesosPorAlcance(EVENTOS_ACCESO_MOCK)).pipe(delay(this.mockDelayMs));
    }
    // El backend no implementa un endpoint de EventoAcceso con la misma estructura;
    // retornamos array vacío para evitar errores en los componentes.
    return of([]);
  }

  obtenerResumen(): Observable<AuditResumen> {
    if (environment.useMocks) {
      return of(AUDIT_RESUMEN_MOCK).pipe(delay(this.mockDelayMs));
    }
    return forkJoin({
      auditorias: this.obtenerAuditorias(),
      accesos: this.obtenerEventosAcceso(),
    }).pipe(
      map(({ auditorias, accesos }) => ({
        totalAuditorias: auditorias.length,
        totalEventosAcceso: accesos.length,
        eventosObservados:
          auditorias.filter((auditoria) => auditoria.resultado !== 'EXITOSO').length +
          accesos.filter((acceso) => !acceso.exitoso).length,
        modulosAuditados: new Set(auditorias.map((auditoria) => auditoria.modulo)).size,
      })),
    );
  }

  private mapAuditoria(a: ApiAuditoria): Auditoria {
    return {
      id: a.id,
      usuarioId: a.usuarioId ?? 0,
      usuarioNombre: a.usuarioNombre ?? 'Sistema',
      usuarioRol: (a.usuarioRol ?? 'OPERADOR') as Auditoria['usuarioRol'],
      sedeId: null,
      modulo: (a.modulo ?? 'ADMIN') as AuditModulo,
      accion: (a.accion ?? 'CONSULTA') as Auditoria['accion'],
      descripcion: a.descripcion ?? '',
      entidad: a.tabla,
      entidadId: a.registroId,
      ipOrigen: '',
      fechaEvento: a.fecha ?? new Date().toISOString(),
      resultado: 'EXITOSO',
    };
  }

  private filtrarAuditoriasPorAlcance(auditorias: Auditoria[]): Auditoria[] {
    if (this.accessScope.esAdmin()) {
      return auditorias;
    }

    const sedeId = this.accessScope.obtenerSedeId();
    return auditorias.filter((auditoria) => auditoria.sedeId === sedeId);
  }

  private filtrarAccesosPorAlcance(accesos: EventoAcceso[]): EventoAcceso[] {
    if (this.accessScope.esAdmin()) {
      return accesos;
    }

    const sedeId = this.accessScope.obtenerSedeId();
    return accesos.filter((acceso) => acceso.sedeId === sedeId);
  }
}

interface ApiAuditoria {
  id: number;
  usuarioId?: number;
  usuarioNombre?: string;
  usuarioRol?: string;
  modulo?: string;
  accion?: string;
  tabla?: string;
  registroId?: number;
  descripcion?: string;
  fecha?: string;
}

