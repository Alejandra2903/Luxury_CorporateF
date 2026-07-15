import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NombreRol } from '../../core/models/role.model';
import { Usuario } from '../../core/models/usuario.model';
import { Sede } from '../../core/models/resources.model';
import { UsersService } from '../../core/services/users.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { SessionMonitoringService } from '../../core/services/session-monitoring.service';
import { ResourcesService } from '../../core/services/resources.service';
import {
  celularPeruanoValidator,
  documentoIdentidadValidator,
} from '../../core/validators/identity.validators';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly sessionMonitoringService = inject(SessionMonitoringService);
  private readonly resourcesService = inject(ResourcesService);

  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly usuarios = signal<Usuario[]>([]);
  readonly sedes = signal<Sede[]>([]);
  readonly editandoId = signal<number | null>(null);
  readonly roles: NombreRol[] = ['ADMIN', 'GERENTE', 'OPERADOR'];

  readonly usuarioForm = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    tipoDocumento: ['DNI' as Usuario['tipoDocumento'], [Validators.required]],
    numeroDocumento: ['', [Validators.required, documentoIdentidadValidator]],
    telefono: ['', [Validators.required, celularPeruanoValidator]],
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(6)]],
    roles: ['OPERADOR', [Validators.required]],
    sedeId: [5],
  });

  constructor() {
    this.cargarUsuarios();
    this.resourcesService.obtenerSedes().pipe(takeUntilDestroyed()).subscribe((sedes) => {
      this.sedes.set(sedes);
    });
  }

  cargarUsuarios(): void {
    this.usersService
      .obtenerUsuarios()
      .pipe(takeUntilDestroyed())
      .subscribe((usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      });
  }

  guardarUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const form = this.usuarioForm.getRawValue();
    const editandoId = this.editandoId();
    this.guardando.set(true);

    const request$ = editandoId
      ? this.usersService.actualizarUsuario({
          id: editandoId,
          activo: this.usuarios().find((usuario) => usuario.id === editandoId)?.activo ?? true,
          nombres: form.nombres,
          apellidos: form.apellidos,
          tipoDocumento: form.tipoDocumento,
          numeroDocumento: form.numeroDocumento,
          telefono: form.telefono,
          correo: form.correo,
          roles: form.roles,
          sedeId: form.sedeId,
        })
      : this.usersService.crearUsuario(form);

    request$.subscribe({
      next: (usuario) => {
        this.usuarios.update((usuarios) =>
          editandoId
            ? usuarios.map((item) => (item.id === usuario.id ? usuario : item))
            : [usuario, ...usuarios],
        );
        this.guardando.set(false);
        this.notificacionService.exito(editandoId ? 'Usuario actualizado.' : 'Usuario creado.');
        this.sessionMonitoringService.registrarActividadUsuario(
          'GESTION_USUARIOS',
          editandoId
            ? `Actualizacion de usuario ${usuario.nombreCompleto}.`
            : `Creacion de usuario ${usuario.nombreCompleto}.`,
          {
            usuarioId: usuario.id,
            rol: usuario.roles,
            sede: usuario.sedeNombre,
          },
        );
        this.cancelarEdicion();
      },
      error: (error: Error) => {
        this.guardando.set(false);
        this.notificacionService.error(error.message);
      },
    });
  }

  editarUsuario(usuario: Usuario): void {
    this.editandoId.set(usuario.id);
    this.usuarioForm.controls.contrasena.clearValidators();
    this.usuarioForm.controls.contrasena.updateValueAndValidity();
    this.usuarioForm.setValue({
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      tipoDocumento: usuario.tipoDocumento,
      numeroDocumento: usuario.numeroDocumento,
      telefono: usuario.telefono,
      correo: usuario.correo,
      contrasena: '',
      roles: usuario.roles,
      sedeId: usuario.sedeId ?? 1,
    });
  }

  cambiarEstado(usuario: Usuario): void {
    this.usersService
      .cambiarEstadoUsuario({ id: usuario.id, activo: !usuario.activo })
      .subscribe((actualizado) => {
        this.usuarios.update((usuarios) =>
          usuarios.map((item) => (item.id === actualizado.id ? actualizado : item)),
        );
        this.notificacionService.exito(`Usuario ${actualizado.estado.toLowerCase()}.`);
        this.sessionMonitoringService.registrarActividadUsuario(
          'GESTION_USUARIOS',
          `Cambio de estado del usuario ${actualizado.nombreCompleto} a ${actualizado.estado}.`,
          {
            usuarioId: actualizado.id,
            estado: actualizado.estado,
            rol: actualizado.roles,
          },
        );
      });
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.usuarioForm.controls.contrasena.setValidators([Validators.required, Validators.minLength(6)]);
    this.usuarioForm.controls.contrasena.updateValueAndValidity();
    this.usuarioForm.reset({
      nombres: '',
      apellidos: '',
      tipoDocumento: 'DNI',
      numeroDocumento: '',
      telefono: '',
      correo: '',
      contrasena: '',
      roles: 'OPERADOR',
      sedeId: 5,
    });
  }

  formatearFecha(fecha: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(fecha));
  }
}
