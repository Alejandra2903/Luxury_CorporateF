import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalStorageDataService {
  obtenerLista<T>(clave: string, datosIniciales: T[]): T[] {
    const raw = localStorage.getItem(clave);

    if (!raw) {
      this.guardarLista(clave, datosIniciales);
      return [...datosIniciales];
    }

    try {
      return JSON.parse(raw) as T[];
    } catch {
      this.guardarLista(clave, datosIniciales);
      return [...datosIniciales];
    }
  }

  guardarLista<T>(clave: string, datos: T[]): void {
    localStorage.setItem(clave, JSON.stringify(datos));
  }
}

