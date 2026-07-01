import {
  ConsumoPorSede,
  CostosPorMes,
  DashboardAlerta,
  DashboardResumen,
  MonedaDashboard,
} from '../models/dashboard.model';

export const DASHBOARD_RESUMEN_MOCK: DashboardResumen = {
  periodo: '2026-06',
  monedaBase: 'PEN',
  costoTotal: 184760,
  variacionCostoPorcentaje: -7.8,
  consumoEnergiaKwh: 312840,
  consumoAguaM3: 4820,
  sedesActivas: 8,
  alertasActivas: 6,
  cumplimientoUmbralesPorcentaje: 91.4,
  ultimaActualizacion: '2026-06-21T12:40:00',
};

export const CONSUMO_POR_SEDE_MOCK: ConsumoPorSede[] = [
  {
    sedeId: 1,
    sede: 'Lima Corporate HQ',
    energiaKwh: 72400,
    aguaM3: 860,
    costoTotal: 41280,
    alertas: 1,
  },
  {
    sedeId: 2,
    sede: 'Miraflores Executive',
    energiaKwh: 51800,
    aguaM3: 730,
    costoTotal: 31540,
    alertas: 0,
  },
  {
    sedeId: 3,
    sede: 'San Isidro Finance',
    energiaKwh: 68800,
    aguaM3: 690,
    costoTotal: 38860,
    alertas: 2,
  },
  {
    sedeId: 4,
    sede: 'Arequipa Operations',
    energiaKwh: 43200,
    aguaM3: 920,
    costoTotal: 26130,
    alertas: 1,
  },
  {
    sedeId: 5,
    sede: 'Cusco Hospitality',
    energiaKwh: 76640,
    aguaM3: 1620,
    costoTotal: 46950,
    alertas: 2,
  },
];

export const COSTOS_POR_MES_MOCK: CostosPorMes[] = [
  {
    periodo: '2026-01',
    etiqueta: 'Ene',
    costoEnergia: 133500,
    costoAgua: 38500,
    costoTotal: 172000,
  },
  {
    periodo: '2026-02',
    etiqueta: 'Feb',
    costoEnergia: 141900,
    costoAgua: 40200,
    costoTotal: 182100,
  },
  {
    periodo: '2026-03',
    etiqueta: 'Mar',
    costoEnergia: 151100,
    costoAgua: 42600,
    costoTotal: 193700,
  },
  {
    periodo: '2026-04',
    etiqueta: 'Abr',
    costoEnergia: 146300,
    costoAgua: 41400,
    costoTotal: 187700,
  },
  {
    periodo: '2026-05',
    etiqueta: 'May',
    costoEnergia: 137200,
    costoAgua: 39900,
    costoTotal: 177100,
  },
  {
    periodo: '2026-06',
    etiqueta: 'Jun',
    costoEnergia: 143860,
    costoAgua: 40900,
    costoTotal: 184760,
  },
];

export const DASHBOARD_ALERTAS_MOCK: DashboardAlerta[] = [
  {
    id: 101,
    sede: 'Cusco Hospitality',
    severidad: 'CRITICA',
    mensaje: 'Consumo de agua 18% sobre el umbral semanal.',
    fecha: '2026-06-21T09:30:00',
  },
  {
    id: 102,
    sede: 'San Isidro Finance',
    severidad: 'ALTA',
    mensaje: 'Pico de energia fuera del rango esperado.',
    fecha: '2026-06-20T18:10:00',
  },
  {
    id: 103,
    sede: 'Lima Corporate HQ',
    severidad: 'MEDIA',
    mensaje: 'Tarifa vigente requiere revision para julio.',
    fecha: '2026-06-19T14:25:00',
  },
];

export const MONEDAS_DASHBOARD_MOCK: MonedaDashboard[] = [
  {
    codigo: 'PEN',
    simbolo: 'S/',
    nombre: 'Sol peruano',
    factorDesdePen: 1,
  },
  {
    codigo: 'USD',
    simbolo: '$',
    nombre: 'Dolar estadounidense',
    factorDesdePen: 0.27,
  },
  {
    codigo: 'EUR',
    simbolo: 'EUR',
    nombre: 'Euro',
    factorDesdePen: 0.25,
  },
];
