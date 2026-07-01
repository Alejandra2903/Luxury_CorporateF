import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NombreRol } from '../../core/models/role.model';
import { Usuario } from '../../core/models/usuario.model';
import { UsersService } from '../../core/services/users.service';

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

  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly mensaje = signal('');
  readonly usuarios = signal<Usuario[]>([]);
  readonly editandoId = signal<number | null>(null);
  readonly roles: NombreRol[] = ['ADMIN', 'GERENTE', 'AUDITOR', 'ANALISTA', 'OPERADOR'];

  readonly usuarioForm = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    tipoDocumento: ['DNI' as Usuario['tipoDocumento'], [Validators.required]],
    numeroDocumento: ['', [Validators.required, Validators.minLength(8)]],
    telefono: ['', [Validators.required]],
    correo: ['', [Validators.required, Validators.email]],
    roles: ['OPERADOR', [Validators.required]],
  });

  constructor() {
    this.cargarUsuarios();
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
          ...form,
        })
      : this.usersService.crearUsuario(form);

    request$.subscribe((usuario) => {
      this.usuarios.update((usuarios) =>
        editandoId
          ? usuarios.map((item) => (item.id === usuario.id ? usuario : item))
          : [usuario, ...usuarios],
      );
      this.guardando.set(false);
      this.mensaje.set(editandoId ? 'Usuario actualizado.' : 'Usuario creado.');
      this.cancelarEdicion();
    });
  }

  editarUsuario(usuario: Usuario): void {
    this.editandoId.set(usuario.id);
    this.usuarioForm.setValue({
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      tipoDocumento: usuario.tipoDocumento,
      numeroDocumento: usuario.numeroDocumento,
      telefono: usuario.telefono,
      correo: usuario.correo,
      roles: usuario.roles,
    });
  }

  cambiarEstado(usuario: Usuario): void {
    this.usersService
      .cambiarEstadoUsuario({ id: usuario.id, activo: !usuario.activo })
      .subscribe((actualizado) => {
        this.usuarios.update((usuarios) =>
          usuarios.map((item) => (item.id === actualizado.id ? actualizado : item)),
        );
        this.mensaje.set(`Usuario ${actualizado.estado.toLowerCase()}.`);
      });
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.usuarioForm.reset({
      nombres: '',
      apellidos: '',
      tipoDocumento: 'DNI',
      numeroDocumento: '',
      telefono: '',
      correo: '',
      roles: 'OPERADOR',
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
