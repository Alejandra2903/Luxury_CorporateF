import {
  Alerta,
  BusinessRulesResumen,
  Tarifa,
  Umbral,
} from '../models/business-rules.model';

export const TARIFAS_MOCK: Tarifa[] = [
  crearTarifa(1, 1, 'Lima Corporate HQ', 1, 'ENERGIA', 'Energia electrica', 0.432),
  crearTarifa(2, 1, 'Lima Corporate HQ', 2, 'AGUA', 'Agua potable', 11.62),
  crearTarifa(3, 3, 'San Isidro Finance', 1, 'ENERGIA', 'Energia electrica', 0.447),
  crearTarifa(4, 5, 'Cusco Hospitality', 2, 'AGUA', 'Agua potable', 12.18),
  {
    ...crearTarifa(5, 2, 'Miraflores Executive', 1, 'ENERGIA', 'Energia electrica', 0.419),
    vigente: false,
    fechaFin: '2026-05-31',
  },
];

export const UMBRALES_MOCK: Umbral[] = [
  crearUmbral(1, 1, 'Lima Corporate HQ', 1, 'ENERGIA', 'Energia electrica', 'kWh', 48000, 76000),
  crearUmbral(2, 1, 'Lima Corporate HQ', 2, 'AGUA', 'Agua potable', 'm3', 620, 900),
  crearUmbral(3, 3, 'San Isidro Finance', 1, 'ENERGIA', 'Energia electrica', 'kWh', 52000, 70000),
  crearUmbral(4, 5, 'Cusco Hospitality', 2, 'AGUA', 'Agua potable', 'm3', 950, 1450),
];

export const ALERTAS_MOCK: Alerta[] = [
  crearAlerta(1, 5, 'Cusco Hospitality', 2, 'AGUA', 'CRITICA', 'Consumo de agua supera umbral mensual en 11.7%.'),
  crearAlerta(2, 3, 'San Isidro Finance', 1, 'ENERGIA', 'ALTA', 'Pico de energia fuera de franja operativa.'),
  crearAlerta(3, 1, 'Lima Corporate HQ', 2, 'AGUA', 'MEDIA', 'Consumo cerca del limite superior semanal.'),
  {
    ...crearAlerta(4, 2, 'Miraflores Executive', 1, 'ENERGIA', 'BAJA', 'Tarifa historica pendiente de archivo.'),
    atendida: true,
    atendidaPor: 'Admin Luxury',
  },
];

export const BUSINESS_RULES_RESUMEN_MOCK: BusinessRulesResumen = {
  tarifasVigentes: TARIFAS_MOCK.filter((tarifa) => tarifa.vigente).length,
  umbralesActivos: UMBRALES_MOCK.filter((umbral) => umbral.activo).length,
  alertasPendientes: ALERTAS_MOCK.filter((alerta) => !alerta.atendida).length,
  alertasCriticas: ALERTAS_MOCK.filter((alerta) => !alerta.atendida && alerta.severidad === 'CRITICA').length,
};

function crearTarifa(
  id: number,
  sedeId: number,
  sedeNombre: string,
  tipoRecursoId: number,
  tipoRecursoCodigo: Tarifa['tipoRecursoCodigo'],
  tipoRecursoNombre: string,
  costoUnitario: number,
): Tarifa {
  return {
    id,
    sedeId,
    sedeNombre,
    tipoRecursoId,
    tipoRecursoCodigo,
    tipoRecursoNombre,
    monedaId: 1,
    monedaCodigo: 'PEN',
    costoUnitario,
    fechaInicio: '2026-06-01',
    vigente: true,
  };
}

function crearUmbral(
  id: number,
  sedeId: number,
  sedeNombre: string,
  tipoRecursoId: number,
  tipoRecursoCodigo: Umbral['tipoRecursoCodigo'],
  tipoRecursoNombre: string,
  unidad: Umbral['unidad'],
  minimo: number,
  maximo: number,
): Umbral {
  return {
    id,
    sedeId,
    sedeNombre,
    tipoRecursoId,
    tipoRecursoCodigo,
    tipoRecursoNombre,
    unidad,
    minimo,
    maximo,
    periodo: 'MENSUAL',
    activo: true,
  };
}

function crearAlerta(
  id: number,
  sedeId: number,
  sedeNombre: string,
  tipoRecursoId: number,
  tipoRecursoCodigo: Alerta['tipoRecursoCodigo'],
  severidad: Alerta['severidad'],
  mensaje: string,
): Alerta {
  return {
    id,
    sedeId,
    sedeNombre,
    tipoRecursoId,
    tipoRecursoCodigo,
    severidad,
    mensaje,
    fechaGeneracion: '2026-06-21T09:30:00',
    atendida: false,
  };
}
