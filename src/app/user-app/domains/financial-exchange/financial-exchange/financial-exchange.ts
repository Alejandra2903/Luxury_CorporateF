import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { forkJoin } from 'rxjs';

import { FinancialExchangeService } from '../../../../core/services/financial-exchange.service';
import { Moneda, TipoCambio } from '../../../../core/models/financial-exchange.model';
import { SessionMonitoringService } from '../../../../core/services/session-monitoring.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';

@Component({
  selector: 'app-financial-exchange',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './financial-exchange.html',
  styleUrl: './financial-exchange.scss',
})
export class FinancialExchange {
  private readonly fb = inject(FormBuilder);
  private readonly exchangeService = inject(FinancialExchangeService);
  private readonly sessionMonitoringService = inject(SessionMonitoringService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly fechaVigenciaMinimaValor = this.fechaComoNumero(new Date(2000, 0, 1));
  private readonly fechaVigenciaMaximaValor = this.fechaComoNumero(this.obtenerUltimoDiaAnioActual());

  readonly cargando = signal(true);
  readonly guardandoMoneda = signal(false);
  readonly guardandoCambio = signal(false);
  readonly monedas = signal<Moneda[]>([]);
  readonly tiposCambio = signal<TipoCambio[]>([]);
  readonly tipoCambioEditando = signal<TipoCambio | null>(null);
  readonly fechaVigenciaMinimaInput = '2000-01-01';
  readonly fechaVigenciaMaximaInput = this.obtenerUltimoDiaAnioActualInput();

  readonly monedasActivas = computed(() => this.monedas().filter((moneda) => moneda.activa));
  readonly tiposCambioActivos = computed(() =>
    this.tiposCambio().filter((tipoCambio) => tipoCambio.activo),
  );
  readonly tasaPromedioActiva = computed(() => {
    const activos = this.tiposCambioActivos();
    if (activos.length === 0) {
      return 0;
    }
    return activos.reduce((total, item) => total + item.tasa, 0) / activos.length;
  });

  readonly monedaForm = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    simbolo: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(6)]],
  });

  readonly tipoCambioForm = this.fb.nonNullable.group({
    monedaOrigenId: [2, [Validators.required]],
    monedaDestinoId: [1, [Validators.required]],
    tasa: [3.7, [Validators.required, Validators.min(0.0001), Validators.max(999999)]],
    fechaVigencia: [
      '2026-06-21',
      [
        Validators.required,
        this.fechaVigenciaMinimaValidator(),
        this.fechaVigenciaMaximaValidator(),
      ],
    ],
    fuente: ['SBS', [Validators.required, Validators.maxLength(50)]],
    activo: [true],
  });

  constructor() {
    forkJoin({
      monedas: this.exchangeService.obtenerMonedas(),
      tiposCambio: this.exchangeService.obtenerTiposCambio(),
    })
      .pipe(takeUntilDestroyed())
      .subscribe((data) => {
        this.monedas.set(data.monedas);
        this.tiposCambio.set(data.tiposCambio);
        this.cargando.set(false);
      });
  }

  crearMoneda(): void {
    if (this.monedaForm.invalid) {
      this.monedaForm.markAllAsTouched();
      return;
    }

    this.guardandoMoneda.set(true);
    this.exchangeService
      .crearMoneda(this.monedaForm.getRawValue())
      .subscribe((moneda) => {
        this.monedas.update((monedas) => [moneda, ...monedas]);
        this.monedaForm.reset({ codigo: '', nombre: '', simbolo: '' });
        this.guardandoMoneda.set(false);
        this.notificacionService.exito(`Moneda ${moneda.codigo} creada.`);
        this.sessionMonitoringService.registrarActividadUsuario(
          'GESTION_FINANCIERA',
          `Creacion de moneda ${moneda.codigo}.`,
          {
            entidad: 'moneda',
            accion: 'crear',
            codigo: moneda.codigo,
          },
        );
      });
  }

  guardarTipoCambio(): void {
    if (this.tipoCambioForm.invalid) {
      this.tipoCambioForm.markAllAsTouched();
      return;
    }

    const form = this.tipoCambioForm.getRawValue();
    const editando = this.tipoCambioEditando();
    const request = {
      ...form,
      monedaOrigenId: Number(form.monedaOrigenId),
      monedaDestinoId: Number(form.monedaDestinoId),
      tasa: Number(form.tasa),
    };

    this.guardandoCambio.set(true);
    const guardar$ = editando
      ? this.exchangeService.actualizarTipoCambio({ ...request, id: editando.id })
      : this.exchangeService.crearTipoCambio(request);

    guardar$.subscribe((tipoCambio) => {
      this.tiposCambio.update((items) => {
        if (!editando) {
          return [tipoCambio, ...items];
        }
        return items.map((item) => (item.id === tipoCambio.id ? tipoCambio : item));
      });
      this.tipoCambioEditando.set(null);
      this.guardandoCambio.set(false);
      this.notificacionService.exito(
        editando
          ? `Tipo de cambio ${tipoCambio.monedaOrigenCodigo}/${tipoCambio.monedaDestinoCodigo} actualizado.`
          : `Tipo de cambio ${tipoCambio.monedaOrigenCodigo}/${tipoCambio.monedaDestinoCodigo} creado.`,
      );
      this.sessionMonitoringService.registrarActividadUsuario(
        'GESTION_FINANCIERA',
        `${editando ? 'Actualizacion' : 'Creacion'} de tipo de cambio ${tipoCambio.monedaOrigenCodigo}/${tipoCambio.monedaDestinoCodigo}.`,
        {
          entidad: 'tipo-cambio',
          accion: editando ? 'actualizar' : 'crear',
          tasa: tipoCambio.tasa,
        },
      );
    });
  }

  editarTipoCambio(tipoCambio: TipoCambio): void {
    this.tipoCambioEditando.set(tipoCambio);
    this.tipoCambioForm.setValue({
      monedaOrigenId: tipoCambio.monedaOrigenId,
      monedaDestinoId: tipoCambio.monedaDestinoId,
      tasa: tipoCambio.tasa,
      fechaVigencia: tipoCambio.fechaVigencia,
      fuente: tipoCambio.fuente,
      activo: tipoCambio.activo,
    });
  }

  cancelarEdicion(): void {
    this.tipoCambioEditando.set(null);
    this.tipoCambioForm.reset({
      monedaOrigenId: 2,
      monedaDestinoId: 1,
      tasa: 3.7,
      fechaVigencia: '2026-06-21',
      fuente: 'SBS',
      activo: true,
    });
  }

  formatearTasa(valor: number): string {
    return valor.toLocaleString('es-PE', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });
  }

  private fechaVigenciaMinimaValidator(): ValidatorFn {
    return (control) =>
      this.validarFechaCon(control, Validators.min(this.fechaVigenciaMinimaValor));
  }

  private fechaVigenciaMaximaValidator(): ValidatorFn {
    return (control) =>
      this.validarFechaCon(control, Validators.max(this.fechaVigenciaMaximaValor));
  }

  private validarFechaCon(control: AbstractControl, validator: ValidatorFn) {
    const valorFecha = this.normalizarFecha(control.value);
    if (valorFecha === null) {
      return null;
    }

    return validator({ value: valorFecha } as AbstractControl);
  }

  private normalizarFecha(valor: unknown): number | null {
    if (typeof valor !== 'string') {
      return null;
    }

    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
    if (!partes) {
      return null;
    }

    const anio = Number(partes[1]);
    const mes = Number(partes[2]);
    const dia = Number(partes[3]);
    const fecha = new Date(anio, mes - 1, dia);
    if (
      fecha.getFullYear() !== anio ||
      fecha.getMonth() !== mes - 1 ||
      fecha.getDate() !== dia
    ) {
      return null;
    }

    return this.fechaComoNumero(fecha);
  }

  private obtenerUltimoDiaAnioActual(): Date {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), 11, 31);
  }

  private obtenerUltimoDiaAnioActualInput(): string {
    const ultimoDia = this.obtenerUltimoDiaAnioActual();
    return `${ultimoDia.getFullYear()}-12-31`;
  }

  private fechaComoNumero(fecha: Date): number {
    return fecha.getFullYear() * 10000 + (fecha.getMonth() + 1) * 100 + fecha.getDate();
  }
}
