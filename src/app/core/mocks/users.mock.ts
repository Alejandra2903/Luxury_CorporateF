import { Usuario } from '../models/usuario.model';

const fechaBase = '2026-01-01T00:00:00';

export const USUARIOS_MOCK: Usuario[] = [
  crearUsuario(1, 'Admin', 'Luxury', 'admin@luxury.pe', 'ADMIN'),
  crearUsuario(2, 'Gerente', 'Luxury', 'gerente@luxury.pe', 'GERENTE'),
  crearUsuario(3, 'Auditor', 'Luxury', 'auditor@luxury.pe', 'AUDITOR'),
  crearUsuario(4, 'Analista', 'Luxury', 'analista@luxury.pe', 'ANALISTA'),
  crearUsuario(5, 'Operador', 'Luxury', 'operador@luxury.pe', 'OPERADOR'),
];

function crearUsuario(
  id: number,
  nombres: string,
  apellidos: string,
  correo: string,
  roles: string,
): Usuario {
  return {
    id,
    nombres,
    apellidos,
    nombreCompleto: `${nombres} ${apellidos}`,
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

