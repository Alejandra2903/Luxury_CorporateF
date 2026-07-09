import { Injectable, inject } from '@angular/core';

import { Sede } from '../models/resources.model';
import { Usuario } from '../models/usuario.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AccessScopeService {
  private readonly authService = inject(AuthService);

  obtenerUsuario(): Usuario | null {
    return this.authService.usuario();
  }

  esAdmin(): boolean {
    return this.authService.roles().includes('ADMIN');
  }

  obtenerSedeId(): number | null {
    return this.obtenerUsuario()?.sedeId ?? null;
  }

  puedeVerSede(sedeId: number): boolean {
    if (this.esAdmin()) {
      return true;
    }

    return this.obtenerSedeId() === sedeId;
  }

  filtrarPorSede<T extends { sedeId: number }>(items: T[]): T[] {
    if (this.esAdmin()) {
      return items;
    }

    const sedeId = this.obtenerSedeId();
    const resultado: T[] = [];

    for (const item of items) {
      if (item.sedeId === sedeId) {
        resultado.push(item);
      }
    }

    return resultado;
  }

  filtrarSedes(sedes: Sede[]): Sede[] {
    if (this.esAdmin()) {
      return sedes;
    }

    const sedeId = this.obtenerSedeId();
    const resultado: Sede[] = [];

    for (const sede of sedes) {
      if (sede.id === sedeId) {
        resultado.push(sede);
      }
    }

    return resultado;
  }
}
