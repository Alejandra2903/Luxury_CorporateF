import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { REPORTES_MENSUALES_MOCK, REPORTES_SEDE_MOCK } from '../mocks/reports.mock';
import { ReporteMensual, ReporteSede } from '../models/reports.model';
import { LocalStorageDataService } from './local-storage-data.service';
import { AccessScopeService } from './access-scope.service';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(LocalStorageDataService);
  private readonly accessScope = inject(AccessScopeService);
  private readonly apiUrl = `${environment.apiBaseUrl}/reportes`;
  private readonly mockDelayMs = 450;
  private readonly monthlyKey = 'luxury_reports_monthly';
  private readonly siteKey = 'luxury_reports_sites';

  obtenerReporteMensual(periodo: string): Observable<ReporteMensual> {
    if (environment.useMocks) {
      const reportes = this.storage.obtenerLista(this.monthlyKey, REPORTES_MENSUALES_MOCK);
      const reporte = reportes.find((item) => item.periodo === periodo);
      return reporte
        ? of(this.aplicarAlcanceMensual(reporte)).pipe(delay(this.mockDelayMs))
        : throwError(() => new Error(`No existe un reporte para el periodo ${periodo}.`));
    }

    const params = new HttpParams().set('periodo', periodo);
    return this.http.get<ReporteMensual>(`${this.apiUrl}/mensual`, { params });
  }

  obtenerReportePorSede(idSede: number): Observable<ReporteSede> {
    if (environment.useMocks) {
      const reportes = this.storage.obtenerLista(this.siteKey, REPORTES_SEDE_MOCK);
      const reporte = reportes.find((item) => item.sedeId === idSede);
      if (reporte && !this.accessScope.puedeVerSede(reporte.sedeId)) {
        return throwError(() => new Error('No tienes permisos para consultar esta sede.'));
      }

      return reporte
        ? of(reporte).pipe(delay(this.mockDelayMs))
        : throwError(() => new Error(`No existe un reporte para la sede ${idSede}.`));
    }

    return this.http.get<ReporteSede>(`${this.apiUrl}/sede/${idSede}`);
  }

  descargarReporteMensualPdf(periodo: string): Observable<Blob> {
    if (environment.useMocks) {
      const reportes = this.storage.obtenerLista(this.monthlyKey, REPORTES_MENSUALES_MOCK);
      const reporte = reportes.find((item) => item.periodo === periodo);
      if (!reporte) {
        return throwError(() => new Error(`No existe un PDF para el periodo ${periodo}.`));
      }

      return of(this.crearPdfMock(this.aplicarAlcanceMensual(reporte))).pipe(delay(650));
    }

    const params = new HttpParams().set('periodo', periodo);
    return this.http.get(`${this.apiUrl}/mensual/pdf`, {
      params,
      responseType: 'blob',
    });
  }

  private aplicarAlcanceMensual(reporte: ReporteMensual): ReporteMensual {
    if (this.accessScope.esAdmin()) {
      return reporte;
    }

    const sedes = this.accessScope.filtrarPorSede(reporte.sedes);
    const costoTotal = sedes.reduce((total, sede) => total + sede.costoTotal, 0);
    const alertasDetectadas = sedes.reduce((total, sede) => total + sede.alertas, 0);
    const cumplimientoTotal = sedes.reduce(
      (total, sede) => total + sede.cumplimientoPorcentaje,
      0,
    );
    const cumplimientoPromedio = sedes.length > 0 ? cumplimientoTotal / sedes.length : 0;

    return {
      ...reporte,
      sedes,
      costoTotal,
      sedesEvaluadas: sedes.length,
      alertasDetectadas,
      cumplimientoPromedioPorcentaje: cumplimientoPromedio,
    };
  }

  private crearPdfMock(reporte: ReporteMensual): Blob {
    const stream: string[] = [];
    const maxCostoSede = Math.max(...reporte.sedes.map((sede) => sede.costoTotal), 1);

    this.rect(stream, 0, 0, 612, 792, '0.965 0.96 0.94');
    this.rect(stream, 42, 694, 528, 56, '1 1 1');
    this.rect(stream, 42, 694, 528, 2, '0.94 0.36 0.12');
    this.rect(stream, 56, 715, 26, 26, '0.94 0.36 0.12');
    this.text(stream, 'L', 65, 723, 13, 'F2', '1 1 1');
    this.text(stream, 'Luxury', 94, 731, 18, 'F2', '0.06 0.06 0.06');
    this.text(stream, 'Reporte mensual ejecutivo', 94, 713, 10, 'F1', '0.38 0.38 0.36');
    this.text(stream, `Periodo ${reporte.periodo}`, 455, 731, 10, 'F2', '0.94 0.36 0.12');
    this.text(stream, `Generado ${this.formatearFecha(reporte.fechaGeneracion)}`, 417, 713, 8, 'F1', '0.45 0.45 0.42');

    this.text(stream, 'Resumen general', 42, 660, 16, 'F2', '0.06 0.06 0.06');
    this.text(
      stream,
      'Indicadores consolidados de consumo, costo, cumplimiento y alertas por sede.',
      42,
      642,
      9,
      'F1',
      '0.38 0.38 0.36',
    );

    const cards = [
      ['Costo total', this.formatearMoneda(reporte.costoTotal), `${reporte.variacionCostoPorcentaje.toFixed(1)}% vs mes anterior`],
      ['Sedes evaluadas', reporte.sedesEvaluadas.toString(), 'Sedes incluidas'],
      ['Alertas', reporte.alertasDetectadas.toString(), 'Eventos detectados'],
      ['Cumplimiento', `${reporte.cumplimientoPromedioPorcentaje.toFixed(1)}%`, `Tendencia ${reporte.tendencia}`],
    ];
    cards.forEach((card, index) => {
      const x = 42 + index * 132;
      this.rect(stream, x, 575, 120, 52, '1 1 1');
      this.strokeRect(stream, x, 575, 120, 52, '0.86 0.84 0.8');
      this.text(stream, card[0], x + 12, 611, 8, 'F2', '0.94 0.36 0.12');
      this.text(stream, card[1], x + 12, 592, 15, 'F2', '0.06 0.06 0.06');
      this.text(stream, card[2], x + 12, 581, 7, 'F1', '0.42 0.42 0.39');
    });

    this.text(stream, 'Detalle por recurso', 42, 540, 13, 'F2', '0.06 0.06 0.06');
    this.tableHeader(stream, 42, 512, ['Recurso', 'Consumo', 'Costo', 'Participacion', 'Variacion'], [130, 95, 95, 95, 90]);
    reporte.recursos.forEach((recurso, index) => {
      const y = 488 - index * 24;
      this.tableRow(stream, 42, y, [130, 95, 95, 95, 90]);
      this.text(stream, recurso.nombre, 52, y + 8, 8, 'F2', '0.08 0.08 0.08');
      this.text(stream, `${this.formatearNumero(recurso.consumo)} ${recurso.unidad}`, 182, y + 8, 8, 'F1', '0.18 0.18 0.18');
      this.text(stream, this.formatearMoneda(recurso.costo), 277, y + 8, 8, 'F1', '0.18 0.18 0.18');
      this.text(stream, `${recurso.participacionPorcentaje.toFixed(1)}%`, 372, y + 8, 8, 'F1', '0.18 0.18 0.18');
      this.text(stream, `${recurso.variacionPorcentaje.toFixed(1)}%`, 467, y + 8, 8, 'F1', '0.18 0.18 0.18');
    });

    this.text(stream, 'Evaluacion por sede', 42, 415, 13, 'F2', '0.06 0.06 0.06');
    this.tableHeader(stream, 42, 387, ['Sede', 'Ciudad', 'Costo', 'Cumplimiento', 'Alertas'], [170, 70, 90, 100, 70]);
    reporte.sedes.forEach((sede, index) => {
      const y = 363 - index * 25;
      const barWidth = Math.max(18, (sede.costoTotal / maxCostoSede) * 76);
      this.tableRow(stream, 42, y, [170, 70, 90, 100, 70]);
      this.text(stream, sede.sedeNombre, 52, y + 9, 8, 'F2', '0.08 0.08 0.08');
      this.text(stream, sede.ciudad, 222, y + 9, 8, 'F1', '0.22 0.22 0.22');
      this.text(stream, this.formatearMoneda(sede.costoTotal), 292, y + 9, 8, 'F1', '0.22 0.22 0.22');
      this.rect(stream, 382, y + 8, 76, 5, '0.93 0.91 0.87');
      this.rect(stream, 382, y + 8, barWidth, 5, sede.cumplimientoPorcentaje >= 90 ? '0.24 0.68 0.33' : '0.94 0.36 0.12');
      this.text(stream, `${sede.cumplimientoPorcentaje.toFixed(0)}%`, 464, y + 6, 7, 'F1', '0.28 0.28 0.25');
      this.text(stream, sede.alertas.toString(), 522, y + 9, 8, 'F2', sede.alertas > 0 ? '0.94 0.36 0.12' : '0.24 0.68 0.33');
    });

    this.rect(stream, 42, 88, 528, 48, '1 0.965 0.94');
    this.strokeRect(stream, 42, 88, 528, 48, '0.94 0.82 0.74');
    this.text(stream, 'Observacion ejecutiva', 56, 118, 10, 'F2', '0.94 0.36 0.12');
    this.text(
      stream,
      `El periodo ${reporte.periodo} presenta ${reporte.alertasDetectadas} alertas y un cumplimiento promedio de ${reporte.cumplimientoPromedioPorcentaje.toFixed(1)}%.`,
      56,
      102,
      8,
      'F1',
      '0.18 0.18 0.18',
    );

    this.text(stream, 'Luxury Corporate Resource & Financial Optimizer', 42, 52, 8, 'F1', '0.42 0.42 0.39');
    this.text(stream, 'Documento generado para uso interno.', 410, 52, 8, 'F1', '0.42 0.42 0.39');

    const contenido = stream.join('\n');
    const objetos = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
      `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    ];

    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objetos.forEach((objeto, index) => {
      offsets.push(pdf.length);
      pdf += `${index + 1} 0 obj\n${objeto}\nendobj\n`;
    });
    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => {
      pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return new Blob([pdf], { type: 'application/pdf' });
  }

  private text(
    stream: string[],
    valor: string,
    x: number,
    y: number,
    size: number,
    font: 'F1' | 'F2',
    color: string,
  ): void {
    stream.push(`${color} rg BT /${font} ${size} Tf ${x} ${y} Td (${this.escaparPdf(valor)}) Tj ET`);
  }

  private rect(stream: string[], x: number, y: number, width: number, height: number, color: string): void {
    stream.push(`${color} rg ${x} ${y} ${width} ${height} re f`);
  }

  private strokeRect(
    stream: string[],
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
  ): void {
    stream.push(`${color} RG 0.7 w ${x} ${y} ${width} ${height} re S`);
  }

  private tableHeader(stream: string[], x: number, y: number, headers: string[], widths: number[]): void {
    this.rect(stream, x, y, widths.reduce((total, width) => total + width, 0), 20, '0.09 0.09 0.08');
    let cursor = x;
    headers.forEach((header, index) => {
      this.text(stream, header, cursor + 10, y + 7, 7, 'F2', '1 1 1');
      cursor += widths[index];
    });
  }

  private tableRow(stream: string[], x: number, y: number, widths: number[]): void {
    const totalWidth = widths.reduce((total, width) => total + width, 0);
    this.rect(stream, x, y, totalWidth, 22, '1 1 1');
    this.strokeRect(stream, x, y, totalWidth, 22, '0.88 0.86 0.82');
  }

  private formatearMoneda(valor: number): string {
    return `S/ ${valor.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`;
  }

  private formatearNumero(valor: number): string {
    return valor.toLocaleString('es-PE', { maximumFractionDigits: 0 });
  }

  private formatearFecha(fecha: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(fecha));
  }

  private escaparPdf(valor: string): string {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }
}
