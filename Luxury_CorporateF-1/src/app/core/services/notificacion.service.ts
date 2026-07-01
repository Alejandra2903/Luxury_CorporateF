import { Injectable, signal } from '@angular/core';

export type TipoNotificacion = 'exito' | 'error' | 'advertencia' | 'info';

export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  mensaje: string;
}

/**
 * Servicio minimo de notificaciones tipo "toast". Expone un signal con
 * la notificacion activa para que un componente visual (a crear en
 * shared/components en un paso posterior) la renderice. Se mantiene
 * deliberadamente simple en este paso: solo lo necesario para que
 * error.interceptor.ts pueda comunicar errores 403/500 a la UI.
 */
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
