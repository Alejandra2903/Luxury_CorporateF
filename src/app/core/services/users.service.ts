import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { USUARIOS_MOCK } from '../mocks/users.mock';
import { SEDES_MOCK } from '../mocks/resources.mock';
import { MOCK_AUTH_USERS } from '../mocks/auth.mock';
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
  private readonly sedesKey = 'luxury_sedes';
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
      const correo = request.correo.trim().toLowerCase();

      if (this.existeCorreo(correo)) {
        return throwError(() => new Error('Ya existe un usuario con ese correo.'));
      }

      if (usuarios.some((usuario) => usuario.numeroDocumento === request.numeroDocumento.trim())) {
        return throwError(() => new Error('Ya existe un usuario con ese documento.'));
      }

      const ahora = new Date().toISOString();
      const sedeId = this.obtenerSedeUsuario(request.roles, request.sedeId);
      const nuevo: Usuario = {
        id: this.obtenerSiguienteId(usuarios),
        nombres: request.nombres.trim(),
        apellidos: request.apellidos.trim(),
        nombreCompleto: `${request.nombres.trim()} ${request.apellidos.trim()}`,
        sedeId,
        sedeNombre: this.obtenerNombreSede(sedeId),
        tipoDocumento: request.tipoDocumento,
        numeroDocumento: request.numeroDocumento.trim(),
        telefono: request.telefono.trim(),
        correo,
        roles: request.roles,
        activo: true,
        estado: 'ACTIVO',
        fechaRegistro: ahora,
        fechaActualizacion: ahora,
      };

      this.guardarUsuarios([nuevo, ...usuarios]);
      this.guardarCuentaAuth({
        identificador: nuevo.correo,
        contrasena: request.contrasena,
        token: `mock-jwt-token-${nuevo.roles.toLowerCase()}-${nuevo.id}`,
        usuario: nuevo,
      });
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
        sedeId: this.obtenerSedeUsuario(request.roles, request.sedeId),
        sedeNombre: this.obtenerNombreSede(this.obtenerSedeUsuario(request.roles, request.sedeId)),
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

    if (this.existeCorreo(correo)) {
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
      sedeId: 5,
      sedeNombre: this.obtenerNombreSede(5),
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

  sincronizarUsuarioLocal(usuario: Usuario): void {
    const usuarios = this.leerUsuarios();
    this.guardarUsuarios(
      usuarios.map((item) => (item.id === usuario.id ? usuario : item)),
    );
    this.actualizarCuentaAuth(usuario);
  }

  cambiarContrasena(correo: string, actual: string, nueva: string): Observable<boolean> {
    const identificador = correo.trim().toLowerCase();
    const cuentas = this.leerCuentasAuth();
    const cuenta = cuentas.find((item) => item.identificador === identificador);

    if (cuenta) {
      if (cuenta.contrasena !== actual) {
        return of(false).pipe(delay(this.mockDelayMs));
      }

      this.storage.guardarLista(
        this.authAccountsKey,
        cuentas.map((item) =>
          item.identificador === identificador ? { ...item, contrasena: nueva } : item,
        ),
      );
      return of(true).pipe(delay(this.mockDelayMs));
    }

    const cuentaBase = MOCK_AUTH_USERS.find(
      (item) => item.identificador === identificador && item.contrasena === actual,
    );

    if (!cuentaBase) {
      return of(false).pipe(delay(this.mockDelayMs));
    }

    this.guardarCuentaAuth({
      identificador,
      contrasena: nueva,
      token: cuentaBase.token,
      usuario: cuentaBase.usuario,
    });
    return of(true).pipe(delay(this.mockDelayMs));
  }

  private leerUsuarios(): Usuario[] {
    const usuarios = this.storage.obtenerLista(this.storageKey, USUARIOS_MOCK);
    const normalizados = usuarios
      .filter((usuario) => ['ADMIN', 'GERENTE', 'OPERADOR'].includes(usuario.roles))
      .map((usuario) => this.normalizarUsuario(usuario));

    if (normalizados.length !== usuarios.length) {
      this.guardarUsuarios(normalizados);
    }

    return normalizados;
  }

  private guardarUsuarios(usuarios: Usuario[]): void {
    this.storage.guardarLista(this.storageKey, usuarios);
  }

  private obtenerSiguienteId(usuarios: Usuario[]): number {
    return Math.max(0, ...usuarios.map((usuario) => usuario.id)) + 1;
  }

  private normalizarUsuario(usuario: Usuario): Usuario {
    const sedeId = this.obtenerSedeUsuario(usuario.roles, usuario.sedeId);

    return {
      ...usuario,
      sedeId,
      sedeNombre: usuario.sedeNombre ?? this.obtenerNombreSede(sedeId),
    };
  }

  private obtenerSedeUsuario(roles: string, sedeId: number | null): number | null {
    if (roles.includes('ADMIN')) {
      return null;
    }

    return sedeId ?? this.obtenerSedesDisponibles()[0].id;
  }

  private obtenerNombreSede(sedeId: number | null): string {
    if (sedeId === null) {
      return 'Todas las sedes';
    }

    return this.obtenerSedesDisponibles().find((sede) => sede.id === sedeId)?.nombre ?? 'Sede asignada';
  }

  private obtenerSedesDisponibles() {
    return this.storage.obtenerLista(this.sedesKey, SEDES_MOCK);
  }

  private existeCorreo(correo: string): boolean {
    return this.leerUsuarios().some((usuario) => usuario.correo.toLowerCase() === correo)
      || this.leerCuentasAuth().some((cuenta) => cuenta.identificador === correo)
      || MOCK_AUTH_USERS.some((cuenta) => cuenta.identificador === correo);
  }

  private leerCuentasAuth(): LocalAuthAccount[] {
    const cuentas = this.storage.obtenerLista<LocalAuthAccount>(this.authAccountsKey, []);
    const cuentasValidas = cuentas.filter((cuenta) =>
      ['ADMIN', 'GERENTE', 'OPERADOR'].includes(cuenta.usuario.roles),
    );

    if (cuentasValidas.length !== cuentas.length) {
      this.storage.guardarLista(this.authAccountsKey, cuentasValidas);
    }

    return cuentasValidas;
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
