import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import {
  celularPeruanoValidator,
  documentoIdentidadValidator,
} from '../../../core/validators/identity.validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: '../login/login.scss',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  readonly temaActual = this.themeService.tema;
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');

  readonly form = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    tipoDocumento: ['DNI' as 'DNI' | 'CE', [Validators.required]],
    numeroDocumento: ['', [Validators.required, documentoIdentidadValidator]],
    telefono: ['', [Validators.required, celularPeruanoValidator]],
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(6)]],
    confirmarContrasena: ['', [Validators.required]],
  });

  alternarTema(): void {
    this.themeService.alternar();
  }

  registrar(): void {
    if (this.form.invalid || !this.contrasenasCoinciden()) {
      this.form.markAllAsTouched();
      return;
    }

    const form = this.form.getRawValue();
    this.cargando.set(true);
    this.error.set('');
    this.exito.set('');

    this.authService
      .registrar({
        nombres: form.nombres,
        apellidos: form.apellidos,
        tipoDocumento: form.tipoDocumento,
        numeroDocumento: form.numeroDocumento,
        telefono: form.telefono,
        correo: form.correo,
        contrasena: form.contrasena,
      })
      .subscribe({
        next: () => {
          this.cargando.set(false);
          this.exito.set('Cuenta creada como Operador. Ahora puedes iniciar sesion.');
          setTimeout(() => this.router.navigate(['/login']), 900);
        },
        error: (error: unknown) => {
          this.cargando.set(false);
          this.error.set(error instanceof Error ? error.message : 'No se pudo crear la cuenta.');
        },
      });
  }

  contrasenasCoinciden(): boolean {
    const form = this.form.getRawValue();
    return form.contrasena === form.confirmarContrasena;
  }
}
