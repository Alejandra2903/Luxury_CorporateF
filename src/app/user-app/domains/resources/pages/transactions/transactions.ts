import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { forkJoin, startWith } from 'rxjs';

import { ResourcesService } from '../../../../../core/services/resources.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { Consumo, Sede, TipoRecurso } from '../../../../../core/models/resources.model';
import { ConsumptionTable } from '../../components/consumption-table/consumption-table';
import { ResourceStatCard } from '../../components/resource-stat-card/resource-stat-card';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [ConsumptionTable, ReactiveFormsModule, ResourceStatCard],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly resourcesService = inject(ResourcesService);
  private readonly periodoMinimoValor = this.fechaComoNumero(new Date(2020, 0, 1));
  private readonly periodoMaximoValor = this.fechaComoNumero(this.obtenerUltimoDiaMesActual());

  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly mensaje = signal('');
  readonly sedes = signal<Sede[]>([]);
  readonly tipos = signal<TipoRecurso[]>([]);
  readonly consumos = signal<Consumo[]>([]);
  readonly periodoMinimoInput = '2020-01';
  readonly periodoMaximoInput = this.obtenerPeriodoActualInput();
  readonly filtros = this.fb.nonNullable.group({
    sedeId: [0],
    tipoRecursoId: [0],
    periodo: ['2026-06'],
  });
  readonly registroForm = this.fb.nonNullable.group({
    sedeId: [1, [Validators.required]],
    tipoRecursoId: [1, [Validators.required]],
    periodo: [
      '2026-06',
      [
        Validators.required,
        this.periodoMinimoValidator(),
        this.periodoMaximoValidator(),
      ],
    ],
    cantidad: [
      0,
      [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1), Validators.max(999999)],
    ],
    costo: [
      0,
      [
        Validators.required,
        Validators.pattern(/^\d+(\.\d{1,2})?$/),
        Validators.min(0.01),
        Validators.max(9999999.99),
      ],
    ],
    observacion: [''],
  });

  readonly consumosFiltrados = signal<Consumo[]>([]);
  readonly puedeRegistrar = computed(() =>
    this.authService.tieneAlgunRol(['ADMIN', 'OPERADOR']),
  );
  readonly totalCosto = computed(() =>
    this.consumosFiltrados().reduce((total, consumo) => total + consumo.costo, 0),
  );
  readonly observados = computed(
    () => this.consumosFiltrados().filter((consumo) => consumo.estado === 'OBSERVADO').length,
  );

  constructor() {
    forkJoin({
      sedes: this.resourcesService.obtenerSedes(),
      tipos: this.resourcesService.obtenerTiposRecurso(),
      consumos: this.resourcesService.obtenerConsumos(),
    })
      .pipe(takeUntilDestroyed())
      .subscribe((data) => {
        this.sedes.set(data.sedes);
        this.tipos.set(data.tipos);
        this.consumos.set(data.consumos);
        this.cargando.set(false);
        this.aplicarFiltros(this.filtros.getRawValue());
      });

    this.filtros.valueChanges
      .pipe(startWith(this.filtros.getRawValue()))
      .pipe(takeUntilDestroyed())
      .subscribe((filtros) => this.aplicarFiltros(filtros));
  }

  formatearMonto(valor: number): string {
    return `S/ ${valor.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`;
  }

  registrarConsumo(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    const form = this.registroForm.getRawValue();
    this.guardando.set(true);
    this.mensaje.set('');
    this.resourcesService
      .crearConsumo({
        sedeId: Number(form.sedeId),
        tipoRecursoId: Number(form.tipoRecursoId),
        periodo: form.periodo,
        cantidad: Number(form.cantidad),
        costo: Number(form.costo),
        observacion: form.observacion.trim() || undefined,
      })
      .subscribe((consumo) => {
        this.consumos.update((consumos) => [consumo, ...consumos]);
        this.aplicarFiltros(this.filtros.getRawValue());
        this.guardando.set(false);
        this.mensaje.set(`Consumo registrado para ${consumo.sedeNombre}.`);
        this.registroForm.patchValue({
          cantidad: 0,
          costo: 0,
          observacion: '',
        });
        this.registroForm.controls.cantidad.markAsPristine();
        this.registroForm.controls.cantidad.markAsUntouched();
        this.registroForm.controls.costo.markAsPristine();
        this.registroForm.controls.costo.markAsUntouched();
      });
  }

  private aplicarFiltros(filtros: Partial<{ sedeId: number; tipoRecursoId: number; periodo: string }>): void {
    const sedeId = Number(filtros.sedeId ?? 0);
    const tipoRecursoId = Number(filtros.tipoRecursoId ?? 0);
    const periodo = filtros.periodo ?? '';

    this.consumosFiltrados.set(
      this.consumos().filter((consumo) => {
        const coincideSede = sedeId === 0 || consumo.sedeId === sedeId;
        const coincideTipo = tipoRecursoId === 0 || consumo.tipoRecursoId === tipoRecursoId;
        const coincidePeriodo = !periodo || consumo.periodo === periodo;
        return coincideSede && coincideTipo && coincidePeriodo;
      }),
    );
  }

  private periodoMinimoValidator(): ValidatorFn {
    return (control) => this.validarPeriodoCon(control, Validators.min(this.periodoMinimoValor));
  }

  private periodoMaximoValidator(): ValidatorFn {
    return (control) => this.validarPeriodoCon(control, Validators.max(this.periodoMaximoValor));
  }

  private validarPeriodoCon(control: AbstractControl, validator: ValidatorFn) {
    const valorPeriodo = this.normalizarPeriodo(control.value);
    if (valorPeriodo === null) {
      return null;
    }

    return validator({ value: valorPeriodo } as AbstractControl);
  }

  private normalizarPeriodo(valor: unknown): number | null {
    if (typeof valor !== 'string') {
      return null;
    }

    const partes = /^(\d{4})-(\d{2})$/.exec(valor);
    if (!partes) {
      return null;
    }

    const anio = Number(partes[1]);
    const mes = Number(partes[2]);
    if (mes < 1 || mes > 12) {
      return null;
    }

    return this.fechaComoNumero(new Date(anio, mes, 0));
  }

  private obtenerUltimoDiaMesActual(): Date {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  }

  private obtenerPeriodoActualInput(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
  }

  private fechaComoNumero(fecha: Date): number {
    return fecha.getFullYear() * 10000 + (fecha.getMonth() + 1) * 100 + fecha.getDate();
  }
}
