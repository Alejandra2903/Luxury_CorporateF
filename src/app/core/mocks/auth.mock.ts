import { ApiError } from '../models/api-error.model';
import { LoginRequest, TokenResponse } from '../models/auth.model';
import { NombreRol } from '../models/role.model';
import { Usuario } from '../models/usuario.model';

interface MockAuthUser {
  identificador: string;
  contrasena: string;
  token: string;
  usuario: Usuario;
}

const fechaBase = '2026-01-01T00:00:00';

export const MOCK_AUTH_USERS: MockAuthUser[] = [
  crearUsuarioMock(1, 'Admin', 'Luxury', 'admin@luxury.pe', 'admin123', 'ADMIN', null, 'Todas las sedes'),
  crearUsuarioMock(2, 'Gerente', 'Luxury', 'gerente@luxury.pe', 'gerente123', 'GERENTE', 3, 'San Isidro Finance'),
  crearUsuarioMock(3, 'Operador', 'Luxury', 'operador@luxury.pe', 'operador123', 'OPERADOR', 5, 'Cusco Hospitality'),
];

export const MOCK_UNAUTHORIZED_ERROR: ApiError = {
  timestamp: fechaBase,
  status: 401,
  error: 'Unauthorized',
  message: 'Credenciales invalidas',
};

export function autenticarMock(request: LoginRequest): TokenResponse | null {
  const identificador = request.identificador.trim().toLowerCase();
  const usuarioMock = MOCK_AUTH_USERS.find(
    (item) =>
      item.identificador === identificador &&
      item.contrasena === request.contrasena,
  );

  if (!usuarioMock) {
    return null;
  }

  return {
    token: usuarioMock.token,
    tipo: 'Bearer',
    usuario: usuarioMock.usuario,
    expiraEnSegundos: 3600,
  };
}

function crearUsuarioMock(
  id: number,
  nombres: string,
  apellidos: string,
  correo: string,
  contrasena: string,
  rol: NombreRol,
  sedeId: number | null,
  sedeNombre: string,
): MockAuthUser {
  return {
    identificador: correo,
    contrasena,
    token: `mock-jwt-token-${rol.toLowerCase()}-sede-${sedeId ?? 'all'}`,
    usuario: {
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
      roles: rol,
      fechaRegistro: fechaBase,
      fechaActualizacion: fechaBase,
    },
  };
}
