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
  crearUsuarioMock(1, 'Admin', 'Luxury', 'admin@luxury.pe', 'admin123', 'ADMIN'),
  crearUsuarioMock(2, 'Gerente', 'Luxury', 'gerente@luxury.pe', 'gerente123', 'GERENTE'),
  crearUsuarioMock(3, 'Auditor', 'Luxury', 'auditor@luxury.pe', 'auditor123', 'AUDITOR'),
  crearUsuarioMock(4, 'Analista', 'Luxury', 'analista@luxury.pe', 'analista123', 'ANALISTA'),
  crearUsuarioMock(5, 'Operador', 'Luxury', 'operador@luxury.pe', 'operador123', 'OPERADOR'),
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
): MockAuthUser {
  return {
    identificador: correo,
    contrasena,
    token: `mock-jwt-token-${rol.toLowerCase()}`,
    usuario: {
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
      roles: rol,
      fechaRegistro: fechaBase,
      fechaActualizacion: fechaBase,
    },
  };
}
