import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { USUARIOS_MOCK } from '../mocks/users.mock';
import { LoginRequest, RegistroUsuarioRequest, TokenResponse } from '../models/auth.model';
import {
  ActualizarUsuarioRequest,
  CambiarEstadoUsuarioRequest,
  CrearUsuarioRequest,
  Usuario,
} from '../models/usuario.model';
import { LocalStorageDataService } from './local-storage-data.service';
import { AlertCenterService } from './alert-center.service';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(LocalStorageDataService);
  private readonly alertCenter = inject(AlertCenterService);
  private readonly apiUrl = `${environment.apiBaseUrl}/usuarios`;
  private readonly storageKey = 'luxury_usuarios';
  private readonly authAccountsKey = 'luxury_auth_accounts';
  private readonly mockDelayMs = 350;

  obtenerUsuarios(): Observable<Usuario[]> {
    if (environment.useMocks) {
      return of(this.leerUsuarios()).pipe(delay(this.mockDelayMs));
    }

    return this.http.get<Usuario[]>(this.apiUrl);
  }

  crearUsuario(request: CrearUsuarioRequest): Observable<Usuario> {
    if (environment.useMocks) {
      const usuarios = this.leerUsuarios();
      const ahora = new Date().toISOString();
      const nuevo: Usuario = {
        id: this.obtenerSiguienteId(usuarios),
        ...request,
        nombreCompleto: `${request.nombres} ${request.apellidos}`,
        activo: true,
        estado: 'ACTIVO',
        fechaRegistro: ahora,
        fechaActualizacion: ahora,
      };

      this.guardarUsuarios([nuevo, ...usuarios]);
      this.alertCenter.crearParaAdmin(
        'Usuario',
        'Usuario creado por administrador',
        `${nuevo.nombreCompleto} fue registrado con rol ${nuevo.roles}.`,
      );
      return of(nuevo).pipe(delay(this.mockDelayMs));
    }

    return this.http.post<Usuario>(this.apiUrl, request);
  }

  actualizarUsuario(request: ActualizarUsuarioRequest): Observable<Usuario> {
    if (environment.useMocks) {
      const actualizado: Usuario = {
        ...request,
        nombreCompleto: `${request.nombres} ${request.apellidos}`,
        estado: request.activo ? 'ACTIVO' : 'INACTIVO',
        fechaRegistro: this.leerUsuarios().find((usuario) => usuario.id === request.id)?.fechaRegistro
          ?? new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
      };
      const usuarios = this.leerUsuarios().map((usuario) =>
        usuario.id === actualizado.id ? actualizado : usuario,
      );

      this.guardarUsuarios(usuarios);
      this.actualizarCuentaAuth(actualizado);
      return of(actualizado).pipe(delay(this.mockDelayMs));
    }

    return this.http.put<Usuario>(this.apiUrl, request);
  }

  cambiarEstadoUsuario(request: CambiarEstadoUsuarioRequest): Observable<Usuario> {
    if (environment.useMocks) {
      const usuarios = this.leerUsuarios();
      const usuarioActual = usuarios.find((usuario) => usuario.id === request.id) ?? usuarios[0];
      const actualizado: Usuario = {
        ...usuarioActual,
        activo: request.activo,
        estado: request.activo ? 'ACTIVO' : 'INACTIVO',
        fechaActualizacion: new Date().toISOString(),
      };

      this.guardarUsuarios(
        usuarios.map((usuario) => (usuario.id === request.id ? actualizado : usuario)),
      );
      this.actualizarCuentaAuth(actualizado);
      return of(actualizado).pipe(delay(this.mockDelayMs));
    }

    return this.http.patch<Usuario>(this.apiUrl, request);
  }

  registrarOperador(request: RegistroUsuarioRequest): Observable<Usuario> {
    if (!environment.useMocks) {
      return this.http.post<Usuario>(`${environment.apiBaseUrl}/auth/registro`, request);
    }

    const usuarios = this.leerUsuarios();
    const correo = request.correo.trim().toLowerCase();

    if (usuarios.some((usuario) => usuario.correo.toLowerCase() === correo)) {
      return throwError(() => new Error('Ya existe un usuario con ese correo.'));
    }

    if (usuarios.some((usuario) => usuario.numeroDocumento === request.numeroDocumento.trim())) {
      return throwError(() => new Error('Ya existe un usuario con ese documento.'));
    }

    const ahora = new Date().toISOString();
    const usuario: Usuario = {
      id: this.obtenerSiguienteId(usuarios),
      nombres: request.nombres.trim(),
      apellidos: request.apellidos.trim(),
      nombreCompleto: `${request.nombres.trim()} ${request.apellidos.trim()}`,
      tipoDocumento: request.tipoDocumento,
      numeroDocumento: request.numeroDocumento.trim(),
      telefono: request.telefono.trim(),
      correo,
      activo: true,
      estado: 'ACTIVO',
      roles: 'OPERADOR',
      fechaRegistro: ahora,
      fechaActualizacion: ahora,
    };

    this.guardarUsuarios([usuario, ...usuarios]);
    this.guardarCuentaAuth({
      identificador: usuario.correo,
      contrasena: request.contrasena,
      token: `mock-jwt-token-operador-${usuario.id}`,
      usuario,
    });
    this.alertCenter.crearParaAdmin(
      'Usuario',
      'Nuevo usuario registrado',
      `${usuario.nombreCompleto} creo una cuenta y quedo como OPERADOR.`,
    );

    return of(usuario).pipe(delay(this.mockDelayMs));
  }

  autenticarCuentaLocal(request: LoginRequest): TokenResponse | null {
    const identificador = request.identificador.trim().toLowerCase();
    const cuenta = this.leerCuentasAuth().find(
      (item) => item.identificador === identificador && item.contrasena === request.contrasena,
    );

    if (!cuenta || !cuenta.usuario.activo) {
      return null;
    }

    return {
      token: cuenta.token,
      tipo: 'Bearer',
      usuario: cuenta.usuario,
      expiraEnSegundos: 3600,
    };
  }

  private leerUsuarios(): Usuario[] {
    return this.storage.obtenerLista(this.storageKey, USUARIOS_MOCK);
  }

  private guardarUsuarios(usuarios: Usuario[]): void {
    this.storage.guardarLista(this.storageKey, usuarios);
  }

  private obtenerSiguienteId(usuarios: Usuario[]): number {
    return Math.max(0, ...usuarios.map((usuario) => usuario.id)) + 1;
  }

  private leerCuentasAuth(): LocalAuthAccount[] {
    return this.storage.obtenerLista(this.authAccountsKey, []);
  }

  private guardarCuentaAuth(cuenta: LocalAuthAccount): void {
    const cuentas = this.leerCuentasAuth().filter(
      (item) => item.identificador !== cuenta.identificador,
    );
    this.storage.guardarLista(this.authAccountsKey, [cuenta, ...cuentas]);
  }

  private actualizarCuentaAuth(usuario: Usuario): void {
    const cuentas = this.leerCuentasAuth();
    this.storage.guardarLista(
      this.authAccountsKey,
      cuentas.map((cuenta) =>
        cuenta.usuario.id === usuario.id
          ? { ...cuenta, identificador: usuario.correo, usuario }
          : cuenta,
      ),
    );
  }
}

interface LocalAuthAccount {
  identificador: string;
  contrasena: string;
  token: string;
  usuario: Usuario;
}
