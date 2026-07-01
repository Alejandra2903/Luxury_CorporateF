import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, forkJoin, of } from 'rxjs';

import { DashboardService } from '../../../../core/services/dashboard.service';
import {
  CodigoMoneda,
  ConsumoPorSede,
  CostosPorMes,
  DashboardAlerta,
  DashboardResumen,
  MonedaDashboard,
} from '../../../../core/models/dashboard.model';
import { AlertSummary } from '../components/alert-summary/alert-summary';
import { CostSummary } from '../components/cost-summary/cost-summary';
import { CurrencySelector } from '../components/currency-selector/currency-selector';
import { KpiCard } from '../components/kpi-card/kpi-card';
import { ResourceChart } from '../components/resource-chart/resource-chart';

@Component({
  selector: 'app-executive-dashboard',
  standalone: true,
  imports: [AlertSummary, CostSummary, CurrencySelector, KpiCard, ResourceChart],
  templateUrl: './executive-dashboard.html',
  styleUrl: './executive-dashboard.scss',
})
export class ExecutiveDashboard {
  private readonly dashboardService = inject(DashboardService);

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly resumen = signal<DashboardResumen | null>(null);
  readonly sedes = signal<ConsumoPorSede[]>([]);
  readonly costos = signal<CostosPorMes[]>([]);
  readonly alertas = signal<DashboardAlerta[]>([]);
  readonly monedas = signal<MonedaDashboard[]>([]);
  readonly monedaSeleccionada = signal<CodigoMoneda>('PEN');

  readonly monedaActual = computed<MonedaDashboard>(() => {
    return (
      this.monedas().find((moneda) => moneda.codigo === this.monedaSeleccionada()) ?? {
        codigo: 'PEN',
        simbolo: 'S/',
        nombre: 'Sol peruano',
        factorDesdePen: 1,
      }
    );
  });

  readonly resumenConvertido = computed(() => {
    const resumen = this.resumen();
    if (!resumen) {
      return null;
    }

    return {
      ...resumen,
      costoTotal: this.convertirMonto(resumen.costoTotal),
    };
  });

  readonly sedesConvertidas = computed(() =>
    this.sedes().map((sede) => ({
      ...sede,
      costoTotal: this.convertirMonto(sede.costoTotal),
    })),
  );

  readonly costosConvertidos = computed(() =>
    this.costos().map((item) => ({
      ...item,
      costoEnergia: this.convertirMonto(item.costoEnergia),
      costoAgua: this.convertirMonto(item.costoAgua),
      costoTotal: this.convertirMonto(item.costoTotal),
    })),
  );

  constructor() {
    forkJoin({
      resumen: this.dashboardService.obtenerResumen(),
      sedes: this.dashboardService.obtenerConsumoPorSede(),
      costos: this.dashboardService.obtenerCostosPorMes(),
      alertas: this.dashboardService.obtenerAlertasResumen(),
      monedas: this.dashboardService.obtenerMonedasDashboard(),
    })
      .pipe(
        takeUntilDestroyed(),
        catchError(() => {
          this.error.set('No se pudo cargar el dashboard. Intenta nuevamente.');
          return of(null);
        }),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe((data) => {
        if (!data) {
          return;
        }

        this.resumen.set(data.resumen);
        this.sedes.set(data.sedes);
        this.costos.set(data.costos);
        this.alertas.set(data.alertas);
        this.monedas.set(data.monedas);
        this.monedaSeleccionada.set(data.resumen.monedaBase);
      });
  }

  seleccionarMoneda(moneda: CodigoMoneda): void {
    this.monedaSeleccionada.set(moneda);
  }

  formatearMonto(valor: number): string {
    const moneda = this.monedaActual();
    return `${moneda.simbolo} ${valor.toLocaleString('es-PE', {
      maximumFractionDigits: 0,
    })}`;
  }

  formatearNumero(valor: number): string {
    return valor.toLocaleString('es-PE', { maximumFractionDigits: 0 });
  }

  formatearPorcentaje(valor: number): string {
    return `${valor.toLocaleString('es-PE', { maximumFractionDigits: 1 })}%`;
  }

  private convertirMonto(valorPen: number): number {
    return valorPen * this.monedaActual().factorDesdePen;
  }
}
