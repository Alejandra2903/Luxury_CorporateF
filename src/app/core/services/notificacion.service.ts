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
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  readonly notificaciones = signal<Notificacion[]>([]);

  mostrar(mensaje: string, tipo: TipoNotificacion = 'info'): void {
    const id = ++this.contador;
    const notificacion: Notificacion = { id, tipo, mensaje };

    this.notificaciones.update((items) => [notificacion, ...items].slice(0, 4));
    this.timers.set(
      id,
      setTimeout(() => this.limpiar(id), 4000),
    );
  }

  exito(mensaje: string): void {
    this.mostrar(mensaje, 'exito');
  }

  error(mensaje: string): void {
    this.mostrar(mensaje, 'error');
  }

  advertencia(mensaje: string): void {
    this.mostrar(mensaje, 'advertencia');
  }

  limpiar(id: number): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    this.notificaciones.update((items) => items.filter((item) => item.id !== id));
  }

  limpiarTodo(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.notificaciones.set([]);
  }
}
