import { TipoRecursoCodigo, UnidadRecurso } from './resources.model';

export interface Tarifa {
  id: number;
  sedeId: number;
  sedeNombre: string;
  tipoRecursoId: number;
  tipoRecursoCodigo: TipoRecursoCodigo;
  tipoRecursoNombre: string;
  monedaId: number;
  monedaCodigo: string;
  costoUnitario: number;
  fechaInicio: string;
  fechaFin?: string;
  vigente: boolean;
}

export interface CrearTarifaRequest {
  sedeId: number;
  tipoRecursoId: number;
  monedaId: number;
  costoUnitario: number;
  fechaInicio: string;
  fechaFin?: string;
}

export interface ActualizarTarifaRequest extends CrearTarifaRequest {
  id: number;
  vigente: boolean;
}

export interface Umbral {
  id: number;
  sedeId: number;
  sedeNombre: string;
  tipoRecursoId: number;
  tipoRecursoCodigo: TipoRecursoCodigo;
  tipoRecursoNombre: string;
  unidad: UnidadRecurso;
  minimo: number;
  maximo: number;
  periodo: 'DIARIO' | 'SEMANAL' | 'MENSUAL';
  activo: boolean;
}

export interface CrearUmbralRequest {
  sedeId: number;
  tipoRecursoId: number;
  minimo: number;
  maximo: number;
  periodo: 'DIARIO' | 'SEMANAL' | 'MENSUAL';
}

export interface ActualizarUmbralRequest extends CrearUmbralRequest {
  id: number;
  activo: boolean;
}

export interface Alerta {
  id: number;
  sedeId: number;
  sedeNombre: string;
  tipoRecursoId: number;
  tipoRecursoCodigo: TipoRecursoCodigo;
  severidad: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';
  mensaje: string;
  fechaGeneracion: string;
  atendida: boolean;
  atendidaPor?: string;
}

export interface CrearAlertaRequest {
  sedeId: number;
  tipoRecursoId: number;
  severidad: Alerta['severidad'];
  mensaje: string;
}

export interface BusinessRulesResumen {
  tarifasVigentes: number;
  umbralesActivos: number;
  alertasPendientes: number;
  alertasCriticas: number;
}
