import { Injectable } from '@angular/core';

const TOKEN_KEY = 'luxury_token';
const USER_KEY = 'luxury_usuario';


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
