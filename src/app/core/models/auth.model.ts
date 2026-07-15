import { Usuario } from './usuario.model';


export interface LoginRequest {
  identificador: string;
  contrasena: string;
}


export interface TokenResponse {
  token: string;
  tipo: 'Bearer';
  usuario: Usuario;
  expiraEnSegundos: number;
}


export interface RegistroUsuarioRequest {
  nombres: string;
  apellidos: string;
  tipoDocumento: 'DNI' | 'CE';
  numeroDocumento: string;
  telefono: string;
  correo: string;
  contrasena: string;
}
