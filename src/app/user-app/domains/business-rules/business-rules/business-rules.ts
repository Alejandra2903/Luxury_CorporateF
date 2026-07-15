import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { BusinessRulesService } from '../../../../core/services/business-rules.service';
import { FinancialExchangeService } from '../../../../core/services/financial-exchange.service';
import { ResourcesService } from '../../../../core/services/resources.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { SessionMonitoringService } from '../../../../core/services/session-monitoring.service';
import {
  Alerta,
  BusinessRulesResumen,
  Tarifa,
  Umbral,
} from '../../../../core/models/business-rules.model';
import { Moneda } from '../../../../core/models/financial-exchange.model';
import { Sede, TipoRecurso } from '../../../../core/models/resources.model';

@Component({
  selector: 'app-business-rules',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './business-rules.html',
  styleUrl: './business-rules.scss',
})
export class BusinessRules {
  private readonly fb = inject(FormBuilder);
  private readonly businessRulesService = inject(BusinessRulesService);
  private readonly resourcesService = inject(ResourcesService);
  private readonly exchangeService = inject(FinancialExchangeService);
  private readonly authService = inject(AuthService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly sessionMonitoringService = inject(SessionMonitoringService);

  readonly cargando = signal(true);
  readonly guardandoTarifa = signal(false);
  readonly guardandoUmbral = signal(false);
  readonly resumen = signal<BusinessRulesResumen | null>(null);
  readonly sedes = signal<Sede[]>([]);
  readonly tipos = signal<TipoRecurso[]>([]);
  readonly monedas = signal<Moneda[]>([]);
  readonly tarifas = signal<Tarifa[]>([]);
  readonly umbrales = signal<Umbral[]>([]);
  readonly alertas = signal<Alerta[]>([]);

  readonly alertasPendientes = computed(() => this.alertas().filter((alerta) => !alerta.atendida));
  readonly tarifasVigentes = computed(() => this.tarifas().filter((tarifa) => tarifa.vigente));
  readonly umbralesActivos = computed(() => this.umbrales().filter((umbral) => umbral.activo));
  readonly puedeGestionarTarifas = computed(() => this.authService.roles().includes('ADMIN'));

  readonly tarifaForm = this.fb.nonNullable.group({
    sedeId: [1, [Validators.required]],
    tipoRecursoId: [1, [Validators.required]],
    monedaId: [1, [Validators.required]],
    costoUnitario: [0.45, [Validators.required, Validators.min(0.0001)]],
    fechaInicio: ['2026-06-21', [Validators.required]],
    fechaFin: [''],
  });

  readonly umbralForm = this.fb.nonNullable.group({
    sedeId: [1, [Validators.required]],
    tipoRecursoId: [1, [Validators.required]],
    minimo: [45000, [Validators.required, Validators.min(0)]],
    maximo: [76000, [Validators.required, Validators.min(1)]],
    periodo: ['MENSUAL' as Umbral['periodo'], [Validators.required]],
  });

  constructor() {
    forkJoin({
      resumen: this.businessRulesService.obtenerResumen(),
      sedes: this.resourcesService.obtenerSedes(),
      tipos: this.resourcesService.obtenerTiposRecurso(),
      monedas: this.exchangeService.obtenerMonedas(),
      tarifas: this.businessRulesService.obtenerTarifas(),
      umbrales: this.businessRulesService.obtenerUmbrales(),
      alertas: this.businessRulesService.obtenerAlertas(),
    })
      .pipe(takeUntilDestroyed())
      .subscribe((data) => {
        this.resumen.set(data.resumen);
        this.sedes.set(data.sedes);
        this.tipos.set(data.tipos);
        this.monedas.set(data.monedas);
        this.tarifas.set(data.tarifas);
        this.umbrales.set(data.umbrales);
        this.alertas.set(data.alertas);
        this.configurarSedeInicial(data.sedes);
        this.cargando.set(false);
      });
  }

  crearTarifa(): void {
    if (!this.puedeGestionarTarifas()) {
      this.notificacionService.advertencia('Solo ADMIN puede cambiar tarifas.');
      return;
    }

    if (this.tarifaForm.invalid) {
      this.tarifaForm.markAllAsTouched();
      return;
    }

    const form = this.tarifaForm.getRawValue();
    this.guardandoTarifa.set(true);
    this.businessRulesService
      .crearTarifa({
        ...form,
        sedeId: Number(form.sedeId),
        tipoRecursoId: Number(form.tipoRecursoId),
        monedaId: Number(form.monedaId),
        costoUnitario: Number(form.costoUnitario),
        fechaFin: form.fechaFin || undefined,
      })
      .subscribe((tarifa) => {
        this.tarifas.update((tarifas) => [tarifa, ...tarifas]);
        this.guardandoTarifa.set(false);
        this.notificacionService.exito(`Tarifa creada para ${tarifa.sedeNombre}.`);
        this.sessionMonitoringService.registrarActividadUsuario(
          'GESTION_REGLAS',
          `Creacion de tarifa para ${tarifa.tipoRecursoNombre} en ${tarifa.sedeNombre}.`,
          {
            tarifaId: tarifa.id,
            sede: tarifa.sedeNombre,
            recurso: tarifa.tipoRecursoNombre,
            costoUnitario: tarifa.costoUnitario,
          },
        );
      });
  }

  crearUmbral(): void {
    if (this.umbralForm.invalid) {
      this.umbralForm.markAllAsTouched();
      return;
    }

    const form = this.umbralForm.getRawValue();
    this.guardandoUmbral.set(true);
    this.businessRulesService
      .crearUmbral({
        ...form,
        sedeId: Number(form.sedeId),
        tipoRecursoId: Number(form.tipoRecursoId),
        minimo: Number(form.minimo),
        maximo: Number(form.maximo),
      })
      .subscribe((umbral) => {
        this.umbrales.update((umbrales) => [umbral, ...umbrales]);
        this.guardandoUmbral.set(false);
        this.notificacionService.exito(`Umbral creado para ${umbral.tipoRecursoNombre}.`);
        this.sessionMonitoringService.registrarActividadUsuario(
          'GESTION_REGLAS',
          `Creacion de umbral para ${umbral.tipoRecursoNombre} en ${umbral.sedeNombre}.`,
          {
            umbralId: umbral.id,
            sede: umbral.sedeNombre,
            recurso: umbral.tipoRecursoNombre,
            minimo: umbral.minimo,
            maximo: umbral.maximo,
          },
        );
      });
  }

  atenderAlerta(alerta: Alerta): void {
    this.businessRulesService.atenderAlerta(alerta.id).subscribe((atendida) => {
      this.alertas.update((alertas) =>
        alertas.map((item) =>
          item.id === alerta.id
            ? { ...item, atendida: true, atendidaPor: atendida.atendidaPor }
            : item,
        ),
      );
      this.notificacionService.exito(`Alerta ${alerta.id} atendida.`);
      this.sessionMonitoringService.registrarActividadUsuario(
        'GESTION_REGLAS',
        `Atencion de alerta ${alerta.id} en ${alerta.sedeNombre}.`,
        {
          alertaId: alerta.id,
          severidad: alerta.severidad,
          sede: alerta.sedeNombre,
        },
      );
    });
  }

  eliminarUmbral(umbral: Umbral): void {
    this.businessRulesService.eliminarUmbral(umbral.id).subscribe(() => {
      this.umbrales.update((umbrales) => umbrales.filter((item) => item.id !== umbral.id));
      this.notificacionService.exito(`Umbral ${umbral.id} retirado.`);
      this.sessionMonitoringService.registrarActividadUsuario(
        'GESTION_REGLAS',
        `Retiro de umbral para ${umbral.tipoRecursoNombre} en ${umbral.sedeNombre}.`,
        {
          umbralId: umbral.id,
          sede: umbral.sedeNombre,
          recurso: umbral.tipoRecursoNombre,
        },
      );
    });
  }

  formatearMonto(valor: number): string {
    return `S/ ${valor.toLocaleString('es-PE', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    })}`;
  }

  formatearNumero(valor: number): string {
    return valor.toLocaleString('es-PE', { maximumFractionDigits: 0 });
  }

  claseSeveridad(severidad: Alerta['severidad']): string {
    return `severity severity--${severidad.toLowerCase()}`;
  }

  private configurarSedeInicial(sedes: Sede[]): void {
    const primeraSede = sedes[0];
    if (!primeraSede) {
      return;
    }

    this.tarifaForm.patchValue({ sedeId: primeraSede.id });
    this.umbralForm.patchValue({ sedeId: primeraSede.id });
  }
}
