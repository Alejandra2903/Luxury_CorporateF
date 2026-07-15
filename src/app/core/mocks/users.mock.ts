import { Usuario } from '../models/usuario.model';

const fechaBase = '2026-01-01T00:00:00';

export const USUARIOS_MOCK: Usuario[] = [
  crearUsuario(1, 'Admin', 'Luxury', 'admin@luxury.pe', 'ADMIN', null, 'Todas las sedes'),
  crearUsuario(2, 'Gerente', 'Luxury', 'gerente@luxury.pe', 'GERENTE', 3, 'San Isidro Finance'),
  crearUsuario(3, 'Operador', 'Luxury', 'operador@luxury.pe', 'OPERADOR', 5, 'Cusco Hospitality'),
];

function crearUsuario(
  id: number,
  nombres: string,
  apellidos: string,
  correo: string,
  roles: string,
  sedeId: number | null,
  sedeNombre: string,
): Usuario {
  return {
    id,
    nombres,
    apellidos,
    nombreCompleto: `${nombres} ${apellidos}`,
    sedeId,
    sedeNombre,
    tipoDocumento: 'DNI',
    numeroDocumento: `7000000${id}`,
    telefono: `+51 900 000 00${id}`,
    correo,
    activo: true,
    estado: 'ACTIVO',
    roles,
    fechaRegistro: fechaBase,
    fechaActualizacion: fechaBase,
  };
}
