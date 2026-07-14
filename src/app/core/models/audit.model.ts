import { NombreRol } from './role.model';

export type AuditAccion =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREACION'
  | 'ACTUALIZACION'
  | 'ELIMINACION'
  | 'CONSULTA'
  | 'ATENCION_ALERTA'
  | 'EXPORTACION';

export type AuditModulo =
  | 'AUTH'
  | 'DASHBOARD'
  | 'RECURSOS'
  | 'FINANZAS'
  | 'REGLAS'
  | 'ALERTAS'
  | 'REPORTES'
  | 'ADMIN';

export type AuditResultado = 'EXITOSO' | 'OBSERVADO' | 'FALLIDO';

export interface Auditoria {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  usuarioRol: NombreRol;
  sedeId: number | null;
  modulo: AuditModulo;
  accion: AuditAccion;
  descripcion: string;
  entidad?: string;
  entidadId?: number;
  ipOrigen: string;
  fechaEvento: string;
  resultado: AuditResultado;
}

export type EventoAccesoTipo =
  | 'LOGIN_EXITOSO'
  | 'LOGIN_FALLIDO'
  | 'TOKEN_EXPIRADO'
  | 'ACCESO_DENEGADO'
  | 'CIERRE_SESION';

export interface EventoAcceso {
  id: number;
  usuarioId?: number;
  usuarioNombre?: string;
  identificador: string;
  rol?: NombreRol;
  sedeId: number | null;
  tipo: EventoAccesoTipo;
  ipOrigen: string;
  userAgent: string;
  rutaSolicitada?: string;
  fechaEvento: string;
  exitoso: boolean;
  detalle: string;
}

export interface AuditResumen {
  totalAuditorias: number;
  totalEventosAcceso: number;
  eventosObservados: number;
  modulosAuditados: number;
}
