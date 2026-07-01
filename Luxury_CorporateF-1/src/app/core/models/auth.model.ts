import { Usuario } from './usuario.model';

/** Refleja LoginRequest del backend. El campo se llama "identificador"
 * porque el backend acepta correo o numero de documento indistintamente. */
export interface LoginRequest {
  identificador: string;
  contrasena: string;
}

/** Refleja TokenResponse del backend (seguridad/dto/response/TokenResponse.java). */
export interface TokenResponse {
  token: string;
  tipo: 'Bearer';
  usuario: Usuario;
  expiraEnSegundos: number;
}

/** Refleja RegistroUsuarioRequest del backend para el endpoint POST /auth/registro. */
export interface RegistroUsuarioRequest {
  nombres: string;
  apellidos: string;
  tipoDocumento: 'DNI' | 'CE';
  numeroDocumento: string;
  telefono: string;
  correo: string;
  contrasena: string;
  rol?: string;   // ← AGREGAR ESTA LÍNEA
}
