export interface Moneda {
  id: number;
  codigo: string;
  nombre: string;
  simbolo: string;
  activa: boolean;
}

export interface CrearMonedaRequest {
  codigo: string;
  nombre: string;
  simbolo: string;
}

export interface TipoCambio {
  id: number;
  monedaOrigenId: number;
  monedaOrigenCodigo: string;
  monedaDestinoId: number;
  monedaDestinoCodigo: string;
  tasa: number;
  fechaVigencia: string;
  fuente: string;
  activo: boolean;
}

export interface CrearTipoCambioRequest {
  monedaOrigenId: number;
  monedaDestinoId: number;
  tasa: number;
  fechaVigencia: string;
  fuente: string;
}

export interface ActualizarTipoCambioRequest extends CrearTipoCambioRequest {
  id: number;
  activo: boolean;
}
