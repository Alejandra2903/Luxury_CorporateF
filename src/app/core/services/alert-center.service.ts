import { Injectable, computed, signal } from '@angular/core';

import { NombreRol } from '../models/role.model';

export type AlertCenterType = 'Usuario' | 'Alerta' | 'Consumo' | 'Sistema';

export interface AlertCenterItem {
  id: number;
  tipo: AlertCenterType;
  titulo: string;
  detalle: string;
  fecha: string;
  leida: boolean;
  roles: NombreRol[];
}

const STORAGE_KEY = 'luxury_alert_center';

@Injectable({ providedIn: 'root' })
export class AlertCenterService {
  private readonly itemsSignal = signal<AlertCenterItem[]>(this.leer());

  readonly items = this.itemsSignal.asReadonly();
  readonly pendientesAdmin = computed(
    () => this.items().filter((item) => item.roles.includes('ADMIN') && !item.leida).length,
  );

  crearParaAdmin(tipo: AlertCenterType, titulo: string, detalle: string): void {
    const item: AlertCenterItem = {
      id: Date.now(),
      tipo,
      titulo,
      detalle,
      fecha: new Date().toISOString(),
      leida: false,
      roles: ['ADMIN'],
    };
    this.guardar([item, ...this.itemsSignal()].slice(0, 30));
  }

  obtenerPorRoles(roles: NombreRol[]): AlertCenterItem[] {
    return this.items().filter((item) => item.roles.some((rol) => roles.includes(rol)));
  }

  marcarLeida(id: number): void {
    this.guardar(
      this.itemsSignal().map((item) => (item.id === id ? { ...item, leida: true } : item)),
    );
  }

  marcarLeidasPorRoles(roles: NombreRol[]): void {
    this.guardar(
      this.itemsSignal().map((item) =>
        item.roles.some((rol) => roles.includes(rol)) ? { ...item, leida: true } : item,
      ),
    );
  }

  private leer(): AlertCenterItem[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [
        {
          id: 1,
          tipo: 'Sistema',
          titulo: 'Centro de avisos activo',
          detalle: 'Aqui se mostraran registros nuevos, alertas y consumos observados.',
          fecha: new Date().toISOString(),
          leida: true,
          roles: ['ADMIN'],
        },
      ];
    }

    try {
      return JSON.parse(raw) as AlertCenterItem[];
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }

  private guardar(items: AlertCenterItem[]): void {
    this.itemsSignal.set(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}
