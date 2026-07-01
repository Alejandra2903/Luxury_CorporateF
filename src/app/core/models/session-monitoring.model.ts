import { NombreRol } from './role.model';

export type SessionEventType =
  | 'CAMBIO_PESTANA'
  | 'SALIDA_VIEWPORT'
  | 'PERDIDA_FOCO'
  | 'INACTIVIDAD'
  | 'REGRESO_SESION'
  | 'MANIPULACION_DATOS_FINANCIEROS';

export type SessionEventSeverity = 'INFO' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface SessionMonitoringEvent {
  id: number;
  sesionId: string;
  usuarioId: number;
  usuarioNombre: string;
  usuarioRol: NombreRol;
  tipo: SessionEventType;
  severidad: SessionEventSeverity;
  fechaEvento: string;
  ruta: string;
  ipOrigen: string;
  userAgent: string;
  descripcion: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface CrearSessionMonitoringEventRequest {
  sesionId: string;
  usuarioId: number;
  tipo: SessionEventType;
  ruta: string;
  descripcion: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface SessionMonitoringResumen {
  totalEventos: number;
  eventosCriticos: number;
  usuariosObservados: number;
  sesionesObservadas: number;
}
