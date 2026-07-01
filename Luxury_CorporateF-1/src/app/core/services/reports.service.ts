import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { REPORTES_MENSUALES_MOCK, REPORTES_SEDE_MOCK } from '../mocks/reports.mock';
import { ReporteMensual, ReporteSede } from '../models/reports.model';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/reportes`;
  private readonly mockDelayMs = 450;

  obtenerReporteMensual(periodo: string): Observable<ReporteMensual> {
    if (environment.useMocks) {
      const reporte = REPORTES_MENSUALES_MOCK.find((item) => item.periodo === periodo);
      return reporte
        ? of(reporte).pipe(delay(this.mockDelayMs))
        : throwError(() => new Error(`No existe un reporte mock para el periodo ${periodo}.`));
    }

    const params = new HttpParams().set('periodo', periodo);
    return this.http.get<ReporteMensual>(`${this.apiUrl}/mensual`, { params });
  }

  obtenerReportePorSede(idSede: number): Observable<ReporteSede> {
    if (environment.useMocks) {
      const reporte = REPORTES_SEDE_MOCK.find((item) => item.sedeId === idSede);
      return reporte
        ? of(reporte).pipe(delay(this.mockDelayMs))
        : throwError(() => new Error(`No existe un reporte mock para la sede ${idSede}.`));
    }

    return this.http.get<ReporteSede>(`${this.apiUrl}/sede/${idSede}`);
  }

  descargarReporteMensualPdf(periodo: string): Observable<Blob> {
    if (environment.useMocks) {
      const reporte = REPORTES_MENSUALES_MOCK.find((item) => item.periodo === periodo);
      if (!reporte) {
        return throwError(() => new Error(`No existe un PDF mock para el periodo ${periodo}.`));
      }

      return of(this.crearPdfMock(reporte)).pipe(delay(650));
    }

    const params = new HttpParams().set('periodo', periodo);
    return this.http.get(`${this.apiUrl}/mensual/pdf`, {
      params,
      responseType: 'blob',
    });
  }

  private crearPdfMock(reporte: ReporteMensual): Blob {
    const lineas = [
      'LUXURY - REPORTE MENSUAL',
      `Periodo: ${reporte.periodo}`,
      `Costo total: S/ ${reporte.costoTotal.toFixed(2)}`,
      `Sedes evaluadas: ${reporte.sedesEvaluadas}`,
      `Alertas detectadas: ${reporte.alertasDetectadas}`,
      `Cumplimiento promedio: ${reporte.cumplimientoPromedioPorcentaje.toFixed(1)}%`,
      '',
      'Documento generado en modo mock.',
    ];
    const contenido = lineas
      .map(
        (linea, index) =>
          `BT /F1 ${index === 0 ? 18 : 11} Tf 72 ${760 - index * 34} Td (${this.escaparPdf(linea)}) Tj ET`,
      )
      .join('\n');
    const objetos = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
      `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
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

  private escaparPdf(valor: string): string {
    return valor.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }
}

