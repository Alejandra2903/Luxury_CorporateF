import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, mergeMap, of, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { autenticarMock, MOCK_UNAUTHORIZED_ERROR } from '../mocks/auth.mock';
import { LoginRequest, RegistroUsuarioRequest, TokenResponse } from '../models/auth.model';
import { NombreRol, Usuario, parseRoles } from '../models/usuario.model';
import { TokenStorageService } from './token-storage.service';
import { UsersService } from './users.service';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly usersService = inject(UsersService);

  private readonly apiUrl = `${environment.apiBaseUrl}/auth`;


  private readonly usuarioActual = signal<Usuario | null>(this.restaurarUsuario());


  readonly usuario = this.usuarioActual.asReadonly();


  readonly estaAutenticado = computed(() => this.usuarioActual() !== null);


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
      return this.usersService.registrarOperador(request);
    }

    return this.http.post<Usuario>(`${this.apiUrl}/registro`, request);
  }

  actualizarPerfil(data: { nombres: string; apellidos: string; correo: string; telefono: string }): void {
    const usuario = this.usuarioActual();
    if (!usuario) {
      return;
    }

    const actualizado: Usuario = {
      ...usuario,
      nombres: data.nombres.trim(),
      apellidos: data.apellidos.trim(),
      nombreCompleto: `${data.nombres.trim()} ${data.apellidos.trim()}`,
      correo: data.correo.trim().toLowerCase(),
      telefono: data.telefono.trim(),
      fechaActualizacion: new Date().toISOString(),
    };

    this.tokenStorage.guardarUsuario(JSON.stringify(actualizado));
    this.usersService.sincronizarUsuarioLocal(actualizado);
    this.usuarioActual.set(actualizado);
  }

  cambiarContrasena(actual: string, nueva: string): Observable<boolean> {
    const usuario = this.usuarioActual();
    if (!usuario) {
      return of(false);
    }

    return this.usersService.cambiarContrasena(usuario.correo, actual, nueva);
  }


  logout(): void {
    this.tokenStorage.limpiar();
    this.usuarioActual.set(null);
  }

  obtenerToken(): string | null {
    return this.tokenStorage.obtenerToken();
  }


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
    const response = autenticarMock(request) ?? this.usersService.autenticarCuentaLocal(request);

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
