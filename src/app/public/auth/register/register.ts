import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

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

  readonly form = this.fb.nonNullable.group(
    {
      nombres: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/),
        ],
      ],
      apellidos: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/),
        ],
      ],
      tipoDocumento: ['DNI' as 'DNI' | 'CE', [Validators.required]],
      numeroDocumento: ['', [Validators.required, this.documentoValidator()]],
      telefono: [
        '',
        [
          Validators.required,
          Validators.minLength(7),
          Validators.maxLength(15),
          Validators.pattern(/^\d+$/),
        ],
      ],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      contrasena: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(50),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/),
        ],
      ],
      confirmarContrasena: ['', [Validators.required]],
    },
    { validators: this.contrasenasCoincidenValidator() },
  );

  constructor() {
    this.form.controls.tipoDocumento.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.numeroDocumento.updateValueAndValidity());
  }

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

  private documentoValidator(): ValidatorFn {
    return (control): ValidationErrors | null => {
      const tipoDocumento = control.parent?.get('tipoDocumento')?.value;
      const valor = control.value;
      if (!valor || !tipoDocumento) {
        return null;
      }

      if (tipoDocumento === 'DNI') {
        return /^\d{8}$/.test(valor) ? null : { documentoInvalido: true };
      }

      return /^[A-Za-z0-9]+$/.test(valor) ? null : { documentoInvalido: true };
    };
  }

  private contrasenasCoincidenValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const contrasena = control.get('contrasena')?.value;
      const confirmarContrasena = control.get('confirmarContrasena')?.value;
      if (!contrasena || !confirmarContrasena) {
        return null;
      }

      return contrasena === confirmarContrasena ? null : { contrasenasNoCoinciden: true };
    };
  }
}

