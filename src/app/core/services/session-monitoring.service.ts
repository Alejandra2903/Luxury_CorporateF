import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  Observable,
  Subscription,
  catchError,
  delay,
  filter,
  fromEvent,
  map,
  merge,
  of,
  startWith,
  switchMap,
  throttleTime,
  timer,
} from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  SESSION_MONITORING_MOCK,
  SESSION_MONITORING_SESSION_KEY,
  SESSION_MONITORING_STORAGE_KEY,
} from '../mocks/session-monitoring.mock';
import {
  CrearSessionMonitoringEventRequest,
  SessionEventSeverity,
  SessionEventType,
  SessionMonitoringEvent,
  SessionMonitoringResumen,
} from '../models/session-monitoring.model';
import { NombreRol, parseRoles } from '../models/usuario.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SessionMonitoringService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly mockDelayMs = 350;
  private readonly inactivityMs = 60000;

  private trackingSubscription?: Subscription;
  private currentRoute = this.router.url;

  iniciarMonitoreo(): void {
    if (this.trackingSubscription || !this.authService.estaAutenticado()) {
      return;
    }

    this.trackingSubscription = new Subscription();
    this.trackingSubscription.add(
      this.router.events
        .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe((event) => {
          this.currentRoute = event.urlAfterRedirects;
        }),
    );

    this.trackingSubscription.add(
      fromEvent(this.document, 'visibilitychange')
        .pipe(throttleTime(1200))
        .subscribe(() => {
          this.registrarEventoSeguro(
            this.document.hidden ? 'CAMBIO_PESTANA' : 'REGRESO_SESION',
            this.document.hidden
              ? 'La pestana quedo oculta durante una sesion autenticada.'
              : 'El usuario regreso a una sesion autenticada.',
          );
        }),
    );

    this.trackingSubscription.add(
      fromEvent(window, 'blur')
        .pipe(throttleTime(1200))
        .subscribe(() => {
          this.registrarEventoSeguro(
            'PERDIDA_FOCO',
            'La ventana del navegador perdio foco durante la sesion.',
          );
        }),
    );

    this.trackingSubscription.add(
      fromEvent(window, 'focus')
        .pipe(throttleTime(1200))
        .subscribe(() => {
          this.registrarEventoSeguro(
            'REGRESO_SESION',
            'La ventana del navegador recupero foco durante la sesion.',
          );
        }),
    );

    this.trackingSubscription.add(
      fromEvent<MouseEvent>(this.document.documentElement, 'mouseleave')
        .pipe(throttleTime(2500))
        .subscribe(() => {
          this.registrarEventoSeguro(
            'SALIDA_VIEWPORT',
            'El puntero salio del viewport durante una sesion autenticada.',
          );
        }),
    );

    this.trackingSubscription.add(
      merge(
        fromEvent(window, 'mousemove'),
        fromEvent(window, 'keydown'),
        fromEvent(window, 'click'),
        fromEvent(window, 'scroll'),
      )
        .pipe(
          startWith(null),
          switchMap(() => timer(this.inactivityMs)),
        )
        .subscribe(() => {
          this.registrarEventoSeguro(
            'INACTIVIDAD',
            'Sesion sin actividad durante el umbral de control.',
            { segundosInactivo: this.inactivityMs / 1000 },
          );
        }),
    );
  }

  detenerMonitoreo(): void {
    this.trackingSubscription?.unsubscribe();
    this.trackingSubscription = undefined;
  }

  registrarEvento(
    request: CrearSessionMonitoringEventRequest,
  ): Observable<SessionMonitoringEvent> {
    if (!environment.useMocks) {
      return this.http.post<SessionMonitoringEvent>(
        `${this.apiBaseUrl}/sessions/events`,
        request,
      );
    }

    const evento = this.crearEventoMock(request);
    this.guardarEventoMock(evento);
    return of(evento).pipe(delay(this.mockDelayMs));
  }

  registrarManipulacionDatosFinancieros(
    descripcion: string,
    metadata?: Record<string, string | number | boolean>,
  ): void {
    this.registrarActividadUsuario('GESTION_FINANCIERA', descripcion, metadata);
  }

  registrarActividadUsuario(
    tipo: SessionEventType,
    descripcion: string,
    metadata?: Record<string, string | number | boolean>,
  ): void {
    const usuario = this.authService.usuario();
    if (!usuario) {
      return;
    }

    this.registrarEvento({
      sesionId: this.obtenerSesionId(),
      usuarioId: usuario.id,
      tipo: 'MANIPULACION_DATOS_FINANCIEROS',
      ruta: this.currentRoute,
      descripcion,
      metadata,
    })
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  obtenerEventos(): Observable<SessionMonitoringEvent[]> {
    if (environment.useMocks) {
      return of(this.obtenerEventosMock()).pipe(delay(this.mockDelayMs));
    }

    return this.http.get<SessionMonitoringEvent[]>(`${this.apiBaseUrl}/session-monitoring/eventos`);
  }

  obtenerEventosPorUsuario(id: number): Observable<SessionMonitoringEvent[]> {
    if (environment.useMocks) {
      return this.obtenerEventos().pipe(
        map((eventos) => eventos.filter((evento) => evento.usuarioId === id)),
      );
    }

    return this.http.get<SessionMonitoringEvent[]>(
      `${this.apiBaseUrl}/session-monitoring/eventos/usuario/${id}`,
    );
  }

  obtenerEventosPorTipo(tipo: SessionEventType): Observable<SessionMonitoringEvent[]> {
    if (environment.useMocks) {
      return this.obtenerEventos().pipe(
        map((eventos) => eventos.filter((evento) => evento.tipo === tipo)),
      );
    }

    return this.http.get<SessionMonitoringEvent[]>(
      `${this.apiBaseUrl}/session-monitoring/eventos/tipo/${tipo}`,
    );
  }

  obtenerEventosPorSesion(sesionId: string): Observable<SessionMonitoringEvent[]> {
    if (environment.useMocks) {
      return this.obtenerEventos().pipe(
        map((eventos) => eventos.filter((evento) => evento.sesionId === sesionId)),
      );
    }

    return this.http.get<SessionMonitoringEvent[]>(
      `${this.apiBaseUrl}/session-monitoring/eventos/sesion/${sesionId}`,
    );
  }

  obtenerEventosDePerfil(): Observable<SessionMonitoringEvent[]> {
    const usuario = this.authService.usuario();
    if (!usuario) {
      return of([]);
    }

    if (this.authService.roles().includes('ADMIN')) {
      return this.obtenerEventos();
    }

    return this.obtenerEventosPorUsuario(usuario.id);
  }

  obtenerResumen(): Observable<SessionMonitoringResumen> {
    return this.obtenerEventos().pipe(
      map((eventos) => ({
        totalEventos: eventos.length,
        eventosCriticos: eventos.filter(
          (evento) => evento.severidad === 'ALTA' || evento.severidad === 'CRITICA',
        ).length,
        usuariosObservados: new Set(eventos.map((evento) => evento.usuarioId)).size,
        sesionesObservadas: new Set(eventos.map((evento) => evento.sesionId)).size,
      })),
    );
  }

  obtenerSesionActualId(): string {
    return this.obtenerSesionId();
  }

  private registrarEventoSeguro(
    tipo: SessionEventType,
    descripcion: string,
    metadata?: Record<string, string | number | boolean>,
  ): void {
    const usuario = this.authService.usuario();
    if (!usuario) {
      return;
    }

    this.registrarEvento({
      sesionId: this.obtenerSesionId(),
      usuarioId: usuario.id,
      tipo,
      ruta: this.currentRoute,
      descripcion,
      metadata,
    })
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  private crearEventoMock(
    request: CrearSessionMonitoringEventRequest,
  ): SessionMonitoringEvent {
    const usuario = this.authService.usuario();
    const roles = usuario ? parseRoles(usuario.roles) : [];
    const rol: NombreRol = roles[0] ?? 'OPERADOR';

    return {
      id: Date.now(),
      sesionId: request.sesionId,
      usuarioId: request.usuarioId,
      usuarioNombre: usuario?.nombreCompleto ?? 'Usuario autenticado',
      usuarioRol: rol,
      tipo: request.tipo,
      severidad: this.obtenerSeveridad(request.tipo),
      fechaEvento: new Date().toISOString(),
      ruta: request.ruta,
      ipOrigen: '127.0.0.1',
      userAgent: navigator.userAgent,
      descripcion: request.descripcion,
      metadata: request.metadata,
    };
  }

  private obtenerEventosMock(): SessionMonitoringEvent[] {
    const guardados = this.leerEventosGuardados();
    return [...guardados, ...SESSION_MONITORING_MOCK].sort(
      (a, b) => new Date(b.fechaEvento).getTime() - new Date(a.fechaEvento).getTime(),
    );
  }

  private guardarEventoMock(evento: SessionMonitoringEvent): void {
    const eventos = this.leerEventosGuardados();
    localStorage.setItem(
      SESSION_MONITORING_STORAGE_KEY,
      JSON.stringify([evento, ...eventos].slice(0, 150)),
    );
  }

  private leerEventosGuardados(): SessionMonitoringEvent[] {
    const raw = localStorage.getItem(SESSION_MONITORING_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as SessionMonitoringEvent[];
    } catch {
      localStorage.removeItem(SESSION_MONITORING_STORAGE_KEY);
      return [];
    }
  }

  private obtenerSesionId(): string {
    const actual = localStorage.getItem(SESSION_MONITORING_SESSION_KEY);
    if (actual) {
      return actual;
    }

    const nueva = `sess-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    localStorage.setItem(SESSION_MONITORING_SESSION_KEY, nueva);
    return nueva;
  }

  private obtenerSeveridad(tipo: SessionEventType): SessionEventSeverity {
    const severidades: Record<SessionEventType, SessionEventSeverity> = {
      CAMBIO_PESTANA: 'MEDIA',
      SALIDA_VIEWPORT: 'MEDIA',
      PERDIDA_FOCO: 'MEDIA',
      INACTIVIDAD: 'ALTA',
      REGRESO_SESION: 'INFO',
      MANIPULACION_DATOS_FINANCIEROS: 'CRITICA',
      REGISTRO_CONSUMO: 'INFO',
      GESTION_USUARIOS: 'MEDIA',
      GESTION_SEDES: 'MEDIA',
      GESTION_REGLAS: 'MEDIA',
      GESTION_FINANCIERA: 'CRITICA',
      GENERACION_REPORTE: 'INFO',
      ACTUALIZACION_PERFIL: 'INFO',
    };

    return severidades[tipo];
  }
}
