import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario } from '../../core/models/usuario.model';
import { ROLES_SISTEMA } from '../../core/models/role.model';
import { obtenerUsuariosMock, registrarMock, actualizarUsuarioMock } from '../../core/mocks/auth.mock';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  
  roles = ROLES_SISTEMA;

  // Filtros
  filtroTexto: string = '';
  filtroRol: string = '';

  // Modal
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  usuarioEditandoId: number | null = null;
  
  usuarioForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.usuarioForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required],
      rol: ['GERENTE', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    const mocks = obtenerUsuariosMock();
    this.usuarios = mocks.map((m: any) => m.usuario);
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    this.usuariosFiltrados = this.usuarios.filter(u => {
      const matchTexto = this.filtroTexto === '' || 
        u.nombreCompleto.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        u.correo.toLowerCase().includes(this.filtroTexto.toLowerCase());
      
      const matchRol = this.filtroRol === '' || u.roles.includes(this.filtroRol);
      
      return matchTexto && matchRol;
    });
  }

  onFiltroTexto(event: Event): void {
    this.filtroTexto = (event.target as HTMLInputElement).value;
    this.aplicarFiltros();
  }

  onFiltroRol(event: Event): void {
    this.filtroRol = (event.target as HTMLSelectElement).value;
    this.aplicarFiltros();
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.usuarioEditandoId = null;
    this.usuarioForm.reset({ rol: 'GERENTE' });
    this.usuarioForm.get('contrasena')?.setValidators([Validators.required]);
    this.usuarioForm.get('contrasena')?.updateValueAndValidity();
    this.mostrarModal = true;
  }

  abrirModalEditar(usuario: Usuario): void {
    this.modoEdicion = true;
    this.usuarioEditandoId = usuario.id;
    this.usuarioForm.patchValue({
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      contrasena: '', // No mostrar la contraseña actual
      rol: usuario.roles.split(',')[0].trim()
    });
    // La contraseña es opcional al editar
    this.usuarioForm.get('contrasena')?.clearValidators();
    this.usuarioForm.get('contrasena')?.updateValueAndValidity();
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const formValue = this.usuarioForm.value;

    try {
      if (this.modoEdicion && this.usuarioEditandoId) {
        actualizarUsuarioMock(this.usuarioEditandoId, {
          nombres: formValue.nombres,
          apellidos: formValue.apellidos,
          correo: formValue.correo,
          contrasena: formValue.contrasena ? formValue.contrasena : undefined,
          roles: formValue.rol
        });
      } else {
        const nuevo = registrarMock({
          nombres: formValue.nombres,
          apellidos: formValue.apellidos,
          correo: formValue.correo,
          contrasena: formValue.contrasena,
          tipoDocumento: 'DNI',
          numeroDocumento: '00000000',
          telefono: ''
        });
        // Actualizamos el rol directamente porque registrarMock asigna OPERADOR por defecto
        actualizarUsuarioMock(nuevo.id, { roles: formValue.rol });
      }
      
      this.cerrarModal();
      this.cargarUsuarios();
    } catch (e: any) {
      alert(e.message || 'Error al guardar el usuario');
    }
  }

  toggleEstado(usuario: Usuario): void {
    actualizarUsuarioMock(usuario.id, { activo: !usuario.activo });
    this.cargarUsuarios();
  }
}
