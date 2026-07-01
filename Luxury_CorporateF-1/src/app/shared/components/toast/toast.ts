import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { Notificacion } from '../../../core/services/notificacion.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  private readonly notificacionService = inject(NotificacionService);
  readonly notificacion = this.notificacionService.actual;

  constructor() {
    effect(() => {
      const actual = this.notificacion();
      if (actual) {
        setTimeout(() => this.notificacionService.limpiar(), 3500);
      }
    });
  }

  cerrar(): void {
    this.notificacionService.limpiar();
  }
}