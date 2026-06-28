import { Consumo, ResourcesResumen, Sede, TipoRecurso } from '../models/resources.model';

export const SEDES_MOCK: Sede[] = [
  {
    id: 1,
    nombre: 'Lima Corporate HQ',
    codigo: 'LIM-HQ',
    direccion: 'Av. Republica 450',
    ciudad: 'Lima',
    activa: true,
    responsable: 'Mariana Costa',
  },
  {
    id: 2,
    nombre: 'Miraflores Executive',
    codigo: 'MIR-EX',
    direccion: 'Calle Schell 280',
    ciudad: 'Lima',
    activa: true,
    responsable: 'Diego Salazar',
  },
  {
    id: 3,
    nombre: 'San Isidro Finance',
    codigo: 'SIS-FI',
    direccion: 'Av. Camino Real 1140',
    ciudad: 'Lima',
    activa: true,
    responsable: 'Lucia Paredes',
  },
  {
    id: 4,
    nombre: 'Arequipa Operations',
    codigo: 'AQP-OP',
    direccion: 'Av. Ejercito 612',
    ciudad: 'Arequipa',
    activa: true,
    responsable: 'Rafael Medina',
  },
  {
    id: 5,
    nombre: 'Cusco Hospitality',
    codigo: 'CUS-HO',
    direccion: 'Av. El Sol 920',
    ciudad: 'Cusco',
    activa: true,
    responsable: 'Valeria Rojas',
  },
];

export const TIPOS_RECURSO_MOCK: TipoRecurso[] = [
  {
    id: 1,
    codigo: 'ENERGIA',
    nombre: 'Energia electrica',
    unidad: 'kWh',
    activo: true,
  },
  {
    id: 2,
    codigo: 'AGUA',
    nombre: 'Agua potable',
    unidad: 'm3',
    activo: true,
  },
  {
    id: 3,
    codigo: 'GAS',
    nombre: 'Gas natural',
    unidad: 'mmbtu',
    activo: true,
  },
  {
    id: 4,
    codigo: 'INTERNET',
    nombre: 'Datos corporativos',
    unidad: 'GB',
    activo: true,
  },
];

export const CONSUMOS_MOCK: Consumo[] = [
  crearConsumo(1001, 1, 1, '2026-06', 72400, 31280, 'VALIDADO'),
  crearConsumo(1002, 1, 2, '2026-06', 860, 10000, 'REGISTRADO'),
  crearConsumo(1003, 2, 1, '2026-06', 51800, 23540, 'VALIDADO'),
  crearConsumo(1004, 2, 2, '2026-06', 730, 8000, 'VALIDADO'),
  crearConsumo(1005, 3, 1, '2026-06', 68800, 29860, 'OBSERVADO', 'Pico nocturno fuera de rango.'),
  crearConsumo(1006, 3, 2, '2026-06', 690, 9000, 'VALIDADO'),
  crearConsumo(1007, 4, 1, '2026-06', 43200, 19130, 'REGISTRADO'),
  crearConsumo(1008, 4, 2, '2026-06', 920, 7000, 'VALIDADO'),
  crearConsumo(1009, 5, 1, '2026-06', 76640, 32950, 'OBSERVADO', 'Consumo sobre umbral semanal.'),
  crearConsumo(1010, 5, 2, '2026-06', 1620, 14000, 'OBSERVADO', 'Revisar fuga o evento operativo.'),
  crearConsumo(1011, 1, 1, '2026-05', 69050, 29880, 'VALIDADO'),
  crearConsumo(1012, 2, 2, '2026-05', 705, 7700, 'VALIDADO'),
];

export const RESOURCES_RESUMEN_MOCK: ResourcesResumen = {
  sedesActivas: SEDES_MOCK.filter((sede) => sede.activa).length,
  consumosMes: CONSUMOS_MOCK.filter((consumo) => consumo.periodo === '2026-06').length,
  costoTotalMes: CONSUMOS_MOCK.filter((consumo) => consumo.periodo === '2026-06').reduce(
    (total, consumo) => total + consumo.costo,
    0,
  ),
  registrosObservados: CONSUMOS_MOCK.filter((consumo) => consumo.estado === 'OBSERVADO').length,
};

function crearConsumo(
  id: number,
  sedeId: number,
  tipoRecursoId: number,
  periodo: string,
  cantidad: number,
  costo: number,
  estado: Consumo['estado'],
  observacion?: string,
): Consumo {
  const sede = SEDES_MOCK.find((item) => item.id === sedeId);
  const tipo = TIPOS_RECURSO_MOCK.find((item) => item.id === tipoRecursoId);

  if (!sede || !tipo) {
    throw new Error('Mock de consumo invalido.');
  }

  return {
    id,
    sedeId,
    sedeNombre: sede.nombre,
    tipoRecursoId,
    tipoRecursoCodigo: tipo.codigo,
    tipoRecursoNombre: tipo.nombre,
    unidad: tipo.unidad,
    periodo,
    fechaRegistro: '2026-06-21T10:00:00',
    cantidad,
    costo,
    moneda: 'PEN',
    estado,
    observacion,
  };
}
