import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeService, Tema } from '../../../core/services/theme.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { ApiError } from '../../../core/models/api-error.model';
import { parseRoles } from '../../../core/models/usuario.model';
import { LoginRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  temaActual: Tema = 'light';
  errorAutenticacion: string | null = null;
  cargando = false;

  form!: FormGroup;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private notificacionService: NotificacionService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      identificador: new FormControl('', [Validators.required, Validators.minLength(5)]),
      contrasena: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });

    this.themeService.tema$.subscribe((tema) => {
      this.temaActual = tema;
    });
  }

  alternarTema(): void {
    this.themeService.alternar();
  }

  get identificador() {
    return this.form.get('identificador');
  }

  get contrasena() {
    return this.form.get('contrasena');
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorAutenticacion = null;
    this.cargando = true;

    const request = this.form.value as LoginRequest;

    this.authService.login(request).subscribe({
      next: (response) => {
        this.cargando = false;
        const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');
        this.router.navigateByUrl(redirectTo ?? this.obtenerRutaInicial(response.usuario.roles));
      },
      error: (error: ApiError) => {
        this.cargando = false;
        this.errorAutenticacion =
          error.status === 401
            ? 'Correo/documento o contrasena incorrectos.'
            : error.message || 'No se pudo iniciar sesion. Intenta nuevamente.';
        this.notificacionService.error(this.errorAutenticacion);
      },
    });
  }

  private obtenerRutaInicial(roles: string): string {
    const rolesUsuario = parseRoles(roles);
    const puedeVerDashboard = rolesUsuario.some((rol) =>
      ['ADMIN', 'GERENTE', 'AUDITOR', 'ANALISTA'].includes(rol),
    );

    return puedeVerDashboard ? '/dashboard' : '/resources';
  }
}
