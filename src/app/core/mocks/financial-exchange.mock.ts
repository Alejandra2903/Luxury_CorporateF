import { Moneda, TipoCambio } from '../models/financial-exchange.model';

export const MONEDAS_MOCK: Moneda[] = [
  {
    id: 1,
    codigo: 'PEN',
    nombre: 'Sol peruano',
    simbolo: 'S/',
    activa: true,
  },
  {
    id: 2,
    codigo: 'USD',
    nombre: 'Dolar estadounidense',
    simbolo: '$',
    activa: true,
  },
  {
    id: 3,
    codigo: 'EUR',
    nombre: 'Euro',
    simbolo: 'EUR',
    activa: true,
  },
  {
    id: 4,
    codigo: 'CLP',
    nombre: 'Peso chileno',
    simbolo: 'CLP',
    activa: false,
  },
];

export const TIPOS_CAMBIO_MOCK: TipoCambio[] = [
  {
    id: 1,
    monedaOrigenId: 2,
    monedaOrigenCodigo: 'USD',
    monedaDestinoId: 1,
    monedaDestinoCodigo: 'PEN',
    tasa: 3.71,
    fechaVigencia: '2026-06-21',
    fuente: 'SBS',
    activo: true,
  },
  {
    id: 2,
    monedaOrigenId: 3,
    monedaOrigenCodigo: 'EUR',
    monedaDestinoId: 1,
    monedaDestinoCodigo: 'PEN',
    tasa: 4.02,
    fechaVigencia: '2026-06-21',
    fuente: 'BCRP',
    activo: true,
  },
  {
    id: 3,
    monedaOrigenId: 1,
    monedaOrigenCodigo: 'PEN',
    monedaDestinoId: 2,
    monedaDestinoCodigo: 'USD',
    tasa: 0.2695,
    fechaVigencia: '2026-06-21',
    fuente: 'SBS',
    activo: true,
  },
  {
    id: 4,
    monedaOrigenId: 2,
    monedaOrigenCodigo: 'USD',
    monedaDestinoId: 1,
    monedaDestinoCodigo: 'PEN',
    tasa: 3.69,
    fechaVigencia: '2026-06-14',
    fuente: 'SBS',
    activo: false,
  },
];
