import { NombreRol } from './role.model';

export type { NombreRol } from './role.model';

export type TipoDocumento = 'DNI' | 'CE';

export type EstadoUsuario = 'ACTIVO' | 'INACTIVO';

/**
 * Refleja UsuarioResponse del backend (seguridad/dto/response/UsuarioResponse.java).
 * Nota: "roles" llega como un string separado por ", " (ej. "ADMIN" o "ADMIN, GERENTE"),
 * no como array. Se parsea con el helper parseRoles() cuando se necesite trabajar
 * con los roles individualmente.
 */
export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
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

/** Convierte el string "ADMIN, GERENTE" en un array tipado de roles. */
export function parseRoles(roles: string): NombreRol[] {
  return roles
    .split(',')
    .map((r) => r.trim())
    .filter((r): r is NombreRol => r.length > 0) as NombreRol[];
}
