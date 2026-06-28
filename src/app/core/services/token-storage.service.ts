import { Injectable } from '@angular/core';

const TOKEN_KEY = 'luxury_token';
const USER_KEY = 'luxury_usuario';

/**
 * Aisla el acceso al almacenamiento del navegador (localStorage) para
 * el JWT y los datos del usuario autenticado.
 *
 * Mantener este acceso aislado en un servicio (en vez de llamar a
 * localStorage directamente desde AuthService) facilita testear
 * AuthService con un mock y permite cambiar la estrategia de
 * almacenamiento en un solo lugar si fuera necesario.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  guardarToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  guardarUsuario(usuarioJson: string): void {
    localStorage.setItem(USER_KEY, usuarioJson);
  }

  obtenerUsuario(): string | null {
    return localStorage.getItem(USER_KEY);
  }

  limpiar(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
