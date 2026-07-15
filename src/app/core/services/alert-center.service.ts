import { Injectable, computed, signal } from '@angular/core';

import { NombreRol } from '../models/role.model';

export type AlertCenterType = 'Usuario' | 'Alerta' | 'Consumo' | 'Sistema';
export type NotificationEventType =
  | 'USER_REGISTERED'
  | 'RESOURCE_REGISTERED'
  | 'BUDGET_EXCEEDED'
  | 'RATE_CHANGED';

export interface AlertCenterItem {
  id: number;
  tipo: AlertCenterType;
  titulo: string;
  detalle: string;
  fecha: string;
  leida: boolean;
  roles: NombreRol[];
  sedeId: number | null;
}

const STORAGE_KEY = 'luxury_alert_center';
const NOTIFICATION_RULES: Record<NotificationEventType, NombreRol[]> = {
  USER_REGISTERED: ['ADMIN'],
  RESOURCE_REGISTERED: ['ADMIN', 'GERENTE'],
  BUDGET_EXCEEDED: ['ADMIN', 'GERENTE'],
  RATE_CHANGED: ['ADMIN'],
};

@Injectable({ providedIn: 'root' })
export class AlertCenterService {
  private readonly itemsSignal = signal<AlertCenterItem[]>(this.leer());

  readonly items = this.itemsSignal.asReadonly();
  readonly pendientesAdmin = computed(
    () => this.items().filter((item) => item.roles.includes('ADMIN') && !item.leida).length,
  );

  crearParaAdmin(tipo: AlertCenterType, titulo: string, detalle: string): void {
    this.crearPorEvento('USER_REGISTERED', tipo, titulo, detalle, null);
  }

  crearPorEvento(
    evento: NotificationEventType,
    tipo: AlertCenterType,
    titulo: string,
    detalle: string,
    sedeId: number | null,
  ): void {
    const item: AlertCenterItem = {
      id: Date.now(),
      tipo,
      titulo,
      detalle,
      fecha: new Date().toISOString(),
      leida: false,
      roles: NOTIFICATION_RULES[evento],
      sedeId,
    };
    this.guardar([item, ...this.itemsSignal()].slice(0, 30));
  }

  obtenerPorPerfil(roles: NombreRol[], sedeId: number | null): AlertCenterItem[] {
    const esAdmin = roles.includes('ADMIN');
    const resultado: AlertCenterItem[] = [];

    for (const item of this.items()) {
      const coincideRol = item.roles.some((rol) => roles.includes(rol));
      const coincideSede = esAdmin || item.sedeId === null || item.sedeId === sedeId;

      if (coincideRol && coincideSede) {
        resultado.push(item);
      }
    }

    return resultado;
  }

  obtenerPorRoles(roles: NombreRol[]): AlertCenterItem[] {
    return this.obtenerPorPerfil(roles, null);
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
      return [];
    }

    try {
      const items = JSON.parse(raw) as AlertCenterItem[];
      const filtrados = items.filter((item) => item.titulo !== 'Evento de sesion detectado');

      if (filtrados.length !== items.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrados));
      }

      return filtrados;
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
