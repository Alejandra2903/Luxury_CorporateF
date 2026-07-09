import { Injectable, signal } from '@angular/core';

export type TipoNotificacion = 'exito' | 'error' | 'advertencia' | 'info';

export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  mensaje: string;
}


@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private contador = 0;
  readonly actual = signal<Notificacion | null>(null);

  mostrar(mensaje: string, tipo: TipoNotificacion = 'info'): void {
    this.actual.set({ id: ++this.contador, tipo, mensaje });
  }

  error(mensaje: string): void {
    this.mostrar(mensaje, 'error');
  }

  limpiar(): void {
    this.actual.set(null);
  }
}
