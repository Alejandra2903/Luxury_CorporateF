import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { ResourcesService } from '../../../../../core/services/resources.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { NotificacionService } from '../../../../../core/services/notificacion.service';
import { SessionMonitoringService } from '../../../../../core/services/session-monitoring.service';
import {
  Consumo,
  ResourcesResumen,
  Sede,
  TipoRecurso,
} from '../../../../../core/models/resources.model';
import { ConsumptionTable } from '../../components/consumption-table/consumption-table';
import { ResourceStatCard } from '../../components/resource-stat-card/resource-stat-card';

@Component({
  selector: 'app-resources-overview',
  standalone: true,
  imports: [ConsumptionTable, ReactiveFormsModule, ResourceStatCard],
  templateUrl: './resources-overview.html',
  styleUrl: './resources-overview.scss',
})
export class ResourcesOverview {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly resourcesService = inject(ResourcesService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly sessionMonitoringService = inject(SessionMonitoringService);

  readonly cargando = signal(true);
  readonly guardandoSede = signal(false);
  readonly resumen = signal<ResourcesResumen | null>(null);
  readonly sedes = signal<Sede[]>([]);
  readonly tipos = signal<TipoRecurso[]>([]);
  readonly consumos = signal<Consumo[]>([]);
  readonly consumosRecientes = computed(() => this.consumos().slice(0, 6));
  readonly puedeCrearSede = computed(() => this.authService.roles().includes('ADMIN'));

  readonly sedeForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    codigo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
    ciudad: ['', [Validators.required, Validators.minLength(3)]],
    direccion: ['', [Validators.required, Validators.minLength(5)]],
    responsable: ['', [Validators.required, Validators.minLength(3)]],
  });

  constructor() {
    forkJoin({
      resumen: this.resourcesService.obtenerResumenRecursos(),
      sedes: this.resourcesService.obtenerSedes(),
      tipos: this.resourcesService.obtenerTiposRecurso(),
      consumos: this.resourcesService.obtenerConsumosPorPeriodo('2026-06'),
    })
      .pipe(takeUntilDestroyed())
      .subscribe((data) => {
        this.resumen.set(data.resumen);
        this.sedes.set(data.sedes);
        this.tipos.set(data.tipos);
        this.consumos.set(data.consumos);
        this.cargando.set(false);
      });
  }

  formatearMonto(valor: number): string {
    return `S/ ${valor.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`;
  }

  crearSede(): void {
    if (!this.puedeCrearSede()) {
      this.notificacionService.advertencia('Solo ADMIN puede crear sedes.');
      return;
    }

    if (this.sedeForm.invalid) {
      this.sedeForm.markAllAsTouched();
      return;
    }

    this.guardandoSede.set(true);
    this.resourcesService.crearSede(this.sedeForm.getRawValue()).subscribe((sede) => {
      this.sedes.update((sedes) => [sede, ...sedes]);
      this.resumen.update((resumen) =>
        resumen ? { ...resumen, sedesActivas: resumen.sedesActivas + 1 } : resumen,
      );
      this.guardandoSede.set(false);
      this.sedeForm.reset({
        nombre: '',
        codigo: '',
        ciudad: '',
        direccion: '',
        responsable: '',
      });
      this.notificacionService.exito(`Sede ${sede.nombre} creada.`);
      this.sessionMonitoringService.registrarActividadUsuario(
        'GESTION_SEDES',
        `Creacion de sede ${sede.nombre}.`,
        {
          sedeId: sede.id,
          codigo: sede.codigo,
          ciudad: sede.ciudad,
        },
      );
    });
  }
}
