import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, mergeMap, of, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { autenticarMock, MOCK_UNAUTHORIZED_ERROR } from '../mocks/auth.mock';
import { LoginRequest, RegistroUsuarioRequest, TokenResponse } from '../models/auth.model';
import { NombreRol, Usuario, parseRoles } from '../models/usuario.model';
import { TokenStorageService } from './token-storage.service';

/**
 * Maneja el estado de autenticacion de toda la aplicacion usando Signals.
 * El usuario autenticado (o null) vive en un signal privado; el resto de
 * la app solo puede leerlo a traves de los computed/metodos publicos,
 * nunca mutarlo directamente, manteniendo una unica fuente de verdad.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);

  private readonly apiUrl = `${environment.apiBaseUrl}/auth`;

  /** Usuario actualmente autenticado, o null si no hay sesion. */
  private readonly usuarioActual = signal<Usuario | null>(this.restaurarUsuario());

  /** Señal de solo lectura para el resto de la app. */
  readonly usuario = this.usuarioActual.asReadonly();

  /** True si hay un token y un usuario cargados en memoria. */
  readonly estaAutenticado = computed(() => this.usuarioActual() !== null);

  /** Roles del usuario actual ya parseados como array tipado. */
  readonly roles = computed<NombreRol[]>(() => {
    const usuario = this.usuarioActual();
    return usuario ? parseRoles(usuario.roles) : [];
  });

  login(request: LoginRequest): Observable<TokenResponse> {
    const login$ = environment.useMocks
      ? this.loginMock(request)
      : this.http.post<TokenResponse>(`${this.apiUrl}/login`, request);

    return login$.pipe(tap((response) => this.establecerSesion(response)));
  }

  registrar(request: RegistroUsuarioRequest): Observable<Usuario> {
    if (environment.useMocks) {
      return throwError(() => ({
        status: 501,
        error: 'Not Implemented',
        message: 'El registro mock se implementara cuando se habilite el flujo publico.',
      }));
    }

    return this.http.post<Usuario>(`${this.apiUrl}/registro`, request);
  }

  /**
   * Cierra la sesion del lado del cliente. Como el backend usa JWT
   * stateless (sin sesion en servidor), no existe un endpoint de logout:
   * basta con descartar el token almacenado.
   */
  logout(): void {
    this.tokenStorage.limpiar();
    this.usuarioActual.set(null);
  }

  obtenerToken(): string | null {
    return this.tokenStorage.obtenerToken();
  }

  /** Verifica si el usuario actual tiene al menos uno de los roles indicados. */
  tieneAlgunRol(rolesPermitidos: NombreRol[]): boolean {
    if (rolesPermitidos.length === 0) {
      return true;
    }
    const rolesUsuario = this.roles();
    return rolesPermitidos.some((rol) => rolesUsuario.includes(rol));
  }

  private establecerSesion(response: TokenResponse): void {
    this.tokenStorage.guardarToken(response.token);
    this.tokenStorage.guardarUsuario(JSON.stringify(response.usuario));
    this.usuarioActual.set(response.usuario);
  }

  private loginMock(request: LoginRequest): Observable<TokenResponse> {
    const response = autenticarMock(request);

    if (!response) {
      return of(null).pipe(
        delay(500),
        mergeMap(() => throwError(() => MOCK_UNAUTHORIZED_ERROR)),
      );
    }

    return of(response).pipe(delay(500));
  }

  /** Restaura el usuario desde localStorage al recargar la pagina. */
  private restaurarUsuario(): Usuario | null {
    const token = this.tokenStorage.obtenerToken();
    const usuarioJson = this.tokenStorage.obtenerUsuario();
    if (!token || !usuarioJson) {
      return null;
    }
    try {
      return JSON.parse(usuarioJson) as Usuario;
    } catch {
      this.tokenStorage.limpiar();
      return null;
    }
  }
}
