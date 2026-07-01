export type CodigoMoneda = 'PEN' | 'USD' | 'EUR';

export interface DashboardResumen {
  periodo: string;
  monedaBase: CodigoMoneda;
  costoTotal: number;
  variacionCostoPorcentaje: number;
  consumoEnergiaKwh: number;
  consumoAguaM3: number;
  sedesActivas: number;
  alertasActivas: number;
  cumplimientoUmbralesPorcentaje: number;
  ultimaActualizacion: string;
}

export interface ConsumoPorSede {
  sedeId: number;
  sede: string;
  energiaKwh: number;
  aguaM3: number;
  costoTotal: number;
  alertas: number;
}

export interface CostosPorMes {
  periodo: string;
  etiqueta: string;
  costoEnergia: number;
  costoAgua: number;
  costoTotal: number;
}

export interface DashboardAlerta {
  id: number;
  sede: string;
  severidad: 'CRITICA' | 'ALTA' | 'MEDIA';
  mensaje: string;
  fecha: string;
}

export interface MonedaDashboard {
  codigo: CodigoMoneda;
  simbolo: string;
  nombre: string;
  factorDesdePen: number;
}
