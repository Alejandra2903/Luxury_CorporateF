import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Tema = 'dark' | 'light';

const THEME_KEY = 'luxury_theme';

/**
 * Maneja el tema visual (dark/light) de toda la aplicacion. El tema
 * se aplica como atributo [data-theme] en <html>, que activa las
 * variables CSS correspondientes definidas en styles/_tokens.css.
 *
 * Nota sobre localStorage: la preferencia de tema es informacion no sensible y se
 * beneficia de persistir entre sesiones de navegador, por lo que usa
 * localStorage deliberadamente.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private temaSubject = new BehaviorSubject<Tema>(this.resolverTemaInicial());
  public tema$ = this.temaSubject.asObservable();

  get temaActual(): Tema {
    return this.temaSubject.value;
  }

  constructor() {
    this.aplicarTema(this.temaActual);
  }

  toggleTheme(): void {
    this.alternar();
  }

  alternar(): void {
    const nuevo: Tema = this.temaActual === 'dark' ? 'light' : 'dark';
    this.setTheme(nuevo);
  }

  setTheme(tema: Tema): void {
    this.establecer(tema);
  }

  establecer(tema: Tema): void {
    this.temaSubject.next(tema);
    this.aplicarTema(tema);
    localStorage.setItem(THEME_KEY, tema);
  }

  loadTheme(): Tema {
    const tema = this.resolverTemaInicial();
    this.establecer(tema);
    return tema;
  }

  private aplicarTema(tema: Tema): void {
    const root = document.documentElement;
    root.setAttribute('data-theme', tema);
    root.classList.toggle('theme-light', tema === 'light');
    root.classList.toggle('theme-dark', tema === 'dark');
    document.body?.classList.toggle('theme-light', tema === 'light');
    document.body?.classList.toggle('theme-dark', tema === 'dark');
  }

  private resolverTemaInicial(): Tema {
    const guardado = localStorage.getItem(THEME_KEY) as Tema | null;
    if (guardado === 'dark' || guardado === 'light') {
      return guardado;
    }
    return 'light';
  }
}
