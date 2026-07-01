export type TipoRecursoCodigo = 'ENERGIA' | 'AGUA' | 'GAS' | 'INTERNET';
export type UnidadRecurso = 'kWh' | 'm3' | 'mmbtu' | 'GB';
export type EstadoConsumo = 'REGISTRADO' | 'OBSERVADO' | 'VALIDADO';

export interface Sede {
  id: number;
  nombre: string;
  codigo: string;
  direccion: string;
  ciudad: string;
  activa: boolean;
  responsable: string;
}

export interface TipoRecurso {
  id: number;
  codigo: TipoRecursoCodigo;
  nombre: string;
  unidad: UnidadRecurso;
  activo: boolean;
}

export interface Consumo {
  id: number;
  sedeId: number;
  sedeNombre: string;
  tipoRecursoId: number;
  tipoRecursoCodigo: TipoRecursoCodigo;
  tipoRecursoNombre: string;
  unidad: UnidadRecurso;
  periodo: string;
  fechaRegistro: string;
  cantidad: number;
  costo: number;
  moneda: 'PEN';
  estado: EstadoConsumo;
  observacion?: string;
}

export interface CrearConsumoRequest {
  sedeId: number;
  tipoRecursoId: number;
  periodo: string;
  cantidad: number;
  costo: number;
  observacion?: string;
}

export interface ResourcesResumen {
  sedesActivas: number;
  consumosMes: number;
  costoTotalMes: number;
  registrosObservados: number;
}
