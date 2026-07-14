import { NombreRol } from './role.model';

export type { NombreRol } from './role.model';

export type TipoDocumento = 'DNI' | 'CE';

export type EstadoUsuario = 'ACTIVO' | 'INACTIVO';


export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  sedeId: number | null;
  sedeNombre: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  telefono: string;
  correo: string;
  activo: boolean;
  estado: EstadoUsuario;
  roles: string;
  fechaRegistro: string;
  fechaActualizacion: string;
}

export interface CrearUsuarioRequest {
  nombres: string;
  apellidos: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  telefono: string;
  correo: string;
  contrasena: string;
  roles: string;
  sedeId: number | null;
}

export interface ActualizarUsuarioRequest {
  id: number;
  nombres: string;
  apellidos: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  telefono: string;
  correo: string;
  roles: string;
  sedeId: number | null;
  activo: boolean;
}

export interface CambiarEstadoUsuarioRequest {
  id: number;
  activo: boolean;
}


export function parseRoles(roles: string): NombreRol[] {
  return roles
    .split(',')
    .map((r) => r.trim())
    .filter((r): r is NombreRol => r.length > 0) as NombreRol[];
}
