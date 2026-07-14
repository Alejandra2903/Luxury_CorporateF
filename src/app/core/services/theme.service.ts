import { Injectable, signal } from '@angular/core';

export type Tema = 'dark' | 'light';

const THEME_KEY = 'luxury_theme';


@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly tema = signal<Tema>(this.resolverTemaInicial());
  readonly currentTheme = this.tema.asReadonly();

  constructor() {
    this.aplicarTema(this.tema());
  }

  toggleTheme(): void {
    this.alternar();
  }

  alternar(): void {
    const nuevo: Tema = this.tema() === 'dark' ? 'light' : 'dark';
    this.setTheme(nuevo);
  }

  setTheme(tema: Tema): void {
    this.establecer(tema);
  }

  establecer(tema: Tema): void {
    this.tema.set(tema);
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
