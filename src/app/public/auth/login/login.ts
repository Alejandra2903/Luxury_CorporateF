import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ApiError } from '../../../core/models/api-error.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly temaActual = this.themeService.tema;

  alternarTema(): void {
    this.themeService.alternar();
  }

  /** Mensaje de error de autenticación (401) a mostrar bajo el formulario. */
  readonly errorAutenticacion = signal<string | null>(null);

  /** Estado de carga mientras la petición de login está en curso. */
  readonly cargando = signal(false);

  readonly form = this.fb.nonNullable.group({
    identificador: ['', [Validators.required]],
    contrasena: ['', [Validators.required]],
  });

  get identificador() {
    return this.form.controls.identificador;
  }

  get contrasena() {
    return this.form.controls.contrasena;
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorAutenticacion.set(null);
    this.cargando.set(true);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.cargando.set(false);
        const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');
        this.router.navigateByUrl(redirectTo ?? this.obtenerRutaInicial(response.usuario.roles));
      },
      error: (error: ApiError) => {
        this.cargando.set(false);
        this.errorAutenticacion.set(
          error.status === 401
            ? 'Correo/documento o contraseña incorrectos.'
            : error.message || 'No se pudo iniciar sesión. Intenta nuevamente.',
        );
      },
    });
  }

  private obtenerRutaInicial(_roles: string): string {
    return '/panel';
  }
}
