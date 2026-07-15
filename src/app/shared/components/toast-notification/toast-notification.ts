import { Component, inject } from '@angular/core';

import { Notificacion, NotificacionService } from '../../../core/services/notificacion.service';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  templateUrl: './toast-notification.html',
  styleUrl: './toast-notification.scss',
})
export class ToastNotification {
  private readonly notificacionService = inject(NotificacionService);

  readonly notificaciones = this.notificacionService.notificaciones;

  cerrar(id: number): void {
    this.notificacionService.limpiar(id);
  }

  icono(notificacion: Notificacion): string {
    switch (notificacion.tipo) {
      case 'exito':
        return '✓';
      case 'error':
        return '!';
      case 'advertencia':
        return '!';
      default:
        return 'i';
    }
  }

}
