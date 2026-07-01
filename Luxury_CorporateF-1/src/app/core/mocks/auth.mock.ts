import { ApiError } from '../models/api-error.model';
import { LoginRequest, TokenResponse } from '../models/auth.model';
import { NombreRol } from '../models/role.model';
import { Usuario } from '../models/usuario.model';
import { RegistroUsuarioRequest } from '../models/auth.model';

interface MockAuthUser {
  identificador: string;
  contrasena: string;
  token: string;
  usuario: Usuario;
}

const fechaBase = '2026-01-01T00:00:00';

const USERS_DB_KEY = 'luxury_users_db_mock';

export function obtenerUsuariosMock(): MockAuthUser[] {
  const guardado = localStorage.getItem(USERS_DB_KEY);
  if (guardado) {
    return JSON.parse(guardado);
  }
  
  const usuariosPorDefecto: MockAuthUser[] = [
    crearUsuarioMock(1, 'Admin', 'Luxury', 'admin@luxury.pe', 'admin123', 'ADMIN'),
    crearUsuarioMock(2, 'Gerente', 'Luxury', 'gerente@luxury.pe', 'gerente123', 'GERENTE'),
    crearUsuarioMock(3, 'Auditor', 'Luxury', 'auditor@luxury.pe', 'auditor123', 'AUDITOR'),
    crearUsuarioMock(4, 'Analista', 'Luxury', 'analista@luxury.pe', 'analista123', 'ANALISTA'),
    crearUsuarioMock(5, 'Operador', 'Luxury', 'operador@luxury.pe', 'operador123', 'OPERADOR'),
  ];
  
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(usuariosPorDefecto));
  return usuariosPorDefecto;
}

export function guardarUsuariosMock(usuarios: MockAuthUser[]): void {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(usuarios));
}

export const MOCK_UNAUTHORIZED_ERROR: ApiError = {
  timestamp: fechaBase,
  status: 401,
  error: 'Unauthorized',
  message: 'Credenciales invalidas',
};

export function autenticarMock(request: LoginRequest): TokenResponse | null {
  const identificador = request.identificador.trim().toLowerCase();
  const usuarios = obtenerUsuariosMock();
  const usuarioMock = usuarios.find(
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

export function registrarMock(request: RegistroUsuarioRequest): Usuario {
  const usuarios = obtenerUsuariosMock();
  
  if (usuarios.some(u => u.identificador === request.correo.trim().toLowerCase())) {
    throw {
      status: 400,
      error: 'Bad Request',
      message: 'El correo ya está registrado.'
    } as ApiError;
  }
  
  const nuevoId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.usuario.id)) + 1 : 1;
  const nuevoUser = crearUsuarioMock(
    nuevoId, 
    request.nombres, 
    request.apellidos, 
    request.correo.trim().toLowerCase(), 
    request.contrasena, 
    request.rol as NombreRol ?? 'OPERADOR'   // ← CAMBIO: usa el rol que llega
  );
  
  usuarios.push(nuevoUser);
  guardarUsuariosMock(usuarios);
  
  // Guardar notificación para el admin
  agregarNotificacionAdmin(request.correo, request.nombres);
  
  return nuevoUser.usuario;
}

export function actualizarUsuarioMock(id: number, request: Partial<RegistroUsuarioRequest> & { roles?: string, activo?: boolean }): Usuario {
  const usuarios = obtenerUsuariosMock();
  const index = usuarios.findIndex(u => u.usuario.id === id);
  if (index === -1) throw new Error('Usuario no encontrado');

  const user = usuarios[index];
  
  if (request.nombres) user.usuario.nombres = request.nombres;
  if (request.apellidos) user.usuario.apellidos = request.apellidos;
  if (request.nombres || request.apellidos) {
    user.usuario.nombreCompleto = `${user.usuario.nombres} ${user.usuario.apellidos}`;
  }
  if (request.correo) {
    user.identificador = request.correo.trim().toLowerCase();
    user.usuario.correo = request.correo.trim().toLowerCase();
  }
  if (request.contrasena) user.contrasena = request.contrasena;
  if (request.roles) user.usuario.roles = request.roles;
  if (request.activo !== undefined) {
    user.usuario.activo = request.activo;
    user.usuario.estado = request.activo ? 'ACTIVO' : 'INACTIVO';
  }

  user.usuario.fechaActualizacion = new Date().toISOString();
  guardarUsuariosMock(usuarios);
  
  return user.usuario;
}
// ─── Notificaciones para el admin ───────────────────────────────────────────

const NOTIF_KEY = 'luxury_admin_notificaciones';

export interface NotificacionAdmin {
  id: number;
  mensaje: string;
  correoUsuario: string;
  leida: boolean;
  fecha: string;
}

export function obtenerNotificacionesAdmin(): NotificacionAdmin[] {
  const guardado = localStorage.getItem(NOTIF_KEY);
  return guardado ? JSON.parse(guardado) : [];
}

export function agregarNotificacionAdmin(correo: string, nombres: string): void {
  const notifs = obtenerNotificacionesAdmin();
  const nueva: NotificacionAdmin = {
    id: Date.now(),
    mensaje: `Nuevo usuario registrado: ${nombres} (${correo})`,
    correoUsuario: correo,
    leida: false,
    fecha: new Date().toISOString(),
  };
  notifs.unshift(nueva);
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
}

export function marcarTodasLeidasAdmin(): void {
  const notifs = obtenerNotificacionesAdmin();
  notifs.forEach(n => n.leida = true);
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
}