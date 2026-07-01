export type TendenciaReporte = 'ALZA' | 'BAJA' | 'ESTABLE';

export interface ReporteRecurso {
  codigo: 'ENERGIA' | 'AGUA';
  nombre: string;
  consumo: number;
  unidad: 'kWh' | 'm3';
  costo: number;
  participacionPorcentaje: number;
  variacionPorcentaje: number;
}

export interface ReporteSedeResumen {
  sedeId: number;
  sedeNombre: string;
  ciudad: string;
  costoTotal: number;
  consumoEnergiaKwh: number;
  consumoAguaM3: number;
  alertas: number;
  cumplimientoPorcentaje: number;
}

export interface ReporteMensual {
  periodo: string;
  fechaGeneracion: string;
  moneda: 'PEN';
  costoTotal: number;
  variacionCostoPorcentaje: number;
  tendencia: TendenciaReporte;
  sedesEvaluadas: number;
  alertasDetectadas: number;
  cumplimientoPromedioPorcentaje: number;
  recursos: ReporteRecurso[];
  sedes: ReporteSedeResumen[];
}

export interface ReporteSede {
  sedeId: number;
  sedeNombre: string;
  codigoSede: string;
  ciudad: string;
  responsable: string;
  periodoDesde: string;
  periodoHasta: string;
  costoAcumulado: number;
  consumoEnergiaKwh: number;
  consumoAguaM3: number;
  alertasAcumuladas: number;
  cumplimientoPromedioPorcentaje: number;
  variacionCostoPorcentaje: number;
  tendencia: TendenciaReporte;
}

