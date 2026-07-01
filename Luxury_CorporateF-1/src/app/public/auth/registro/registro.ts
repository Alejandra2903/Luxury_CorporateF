import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  errorRegistro: string | null = null;
  cargando = false;
  exitoso = false;

  form = new FormGroup({
    nombres:         new FormControl('', [Validators.required, Validators.minLength(3)]),
    apellidos:       new FormControl('', [Validators.required, Validators.minLength(3)]),
    correo:          new FormControl('', [Validators.required, Validators.email]),
    contrasena:      new FormControl('', [Validators.required, Validators.minLength(6)]),
    tipoDocumento:   new FormControl('DNI'),
    numeroDocumento: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]{8}$')
    ]),
    rol:             new FormControl('OPERADOR', [Validators.required]),
  });

  constructor(private authService: AuthService, private router: Router) {}

  get nombres()         { return this.form.get('nombres'); }
  get apellidos()       { return this.form.get('apellidos'); }
  get correo()          { return this.form.get('correo'); }
  get contrasena()      { return this.form.get('contrasena'); }
  get numeroDocumento() { return this.form.get('numeroDocumento'); }
  get rol()             { return this.form.get('rol'); }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.errorRegistro = null;

    this.authService.registrar({
      nombres:         this.form.value.nombres!,
      apellidos:       this.form.value.apellidos!,
      correo:          this.form.value.correo!,
      contrasena:      this.form.value.contrasena!,
      tipoDocumento:   this.form.value.tipoDocumento! as 'DNI' | 'CE',
      numeroDocumento: this.form.value.numeroDocumento!,
      telefono:        '',
      rol:             this.form.value.rol!,
    }).subscribe({
      next: () => {
        this.cargando = false;
        this.exitoso = true;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.cargando = false;
        this.errorRegistro = err?.message || 'No se pudo completar el registro.';
      },
    });
  }
}