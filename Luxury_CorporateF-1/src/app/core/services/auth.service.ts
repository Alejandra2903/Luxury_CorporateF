import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, mergeMap, of, tap, throwError, BehaviorSubject } from 'rxjs';

import { environment } from '../../../environments/environment';
import { autenticarMock, registrarMock, MOCK_UNAUTHORIZED_ERROR } from '../mocks/auth.mock';
import { LoginRequest, RegistroUsuarioRequest, TokenResponse } from '../models/auth.model';
import { NombreRol, Usuario, parseRoles } from '../models/usuario.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiBaseUrl}/auth`;

  private usuarioActualSubject!: BehaviorSubject<Usuario | null>;
  public usuario$!: Observable<Usuario | null>;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {
    this.usuarioActualSubject = new BehaviorSubject<Usuario | null>(this.restaurarUsuario());
    this.usuario$ = this.usuarioActualSubject.asObservable();
  }

  obtenerUsuarioActual(): Usuario | null {
    return this.usuarioActualSubject.value;
  }

  estaAutenticado(): boolean {
    return this.usuarioActualSubject.value !== null;
  }

  obtenerRoles(): NombreRol[] {
    const usuario = this.usuarioActualSubject.value;
    return usuario ? parseRoles(usuario.roles) : [];
  }

  login(request: LoginRequest): Observable<TokenResponse> {
    const login$ = environment.useMocks
      ? this.loginMock(request)
      : this.http.post<TokenResponse>(`${this.apiUrl}/login`, request);

    return login$.pipe(tap((response) => this.establecerSesion(response)));
  }

  registrar(request: RegistroUsuarioRequest): Observable<Usuario> {
    if (environment.useMocks) {
      try {
        const nuevoUsuario = registrarMock(request);
        return of(nuevoUsuario).pipe(delay(800));
      } catch (error) {
        return throwError(() => error);
      }
    }

    return this.http.post<Usuario>(`${this.apiUrl}/registro`, request);
  }

  logout(): void {
    this.tokenStorage.limpiar();
    this.usuarioActualSubject.next(null);
  }

  obtenerToken(): string | null {
    return this.tokenStorage.obtenerToken();
  }

  tieneAlgunRol(rolesPermitidos: NombreRol[]): boolean {
    if (rolesPermitidos.length === 0) {
      return true;
    }
    const rolesUsuario = this.obtenerRoles();
    return rolesPermitidos.some((rol) => rolesUsuario.includes(rol));
  }

  private establecerSesion(response: TokenResponse): void {
    this.tokenStorage.guardarToken(response.token);
    this.tokenStorage.guardarUsuario(JSON.stringify(response.usuario));
    this.usuarioActualSubject.next(response.usuario);
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
