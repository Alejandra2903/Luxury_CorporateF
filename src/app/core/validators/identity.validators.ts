import { AbstractControl, ValidationErrors } from '@angular/forms';

export function normalizarCelularPeruano(valor: string): string {
  return valor.trim().replace(/[\s-]/g, '').replace(/^\+51/, '').replace(/^51/, '');
}

export function esCelularPeruanoValido(valor: string): boolean {
  return /^9\d{8}$/.test(normalizarCelularPeruano(valor));
}

export function celularPeruanoValidator(control: AbstractControl): ValidationErrors | null {
  const valor = String(control.value ?? '');
  return esCelularPeruanoValido(valor) ? null : { celularPeruano: true };
}

export function documentoIdentidadValidator(control: AbstractControl): ValidationErrors | null {
  const tipoDocumento = control.parent?.get('tipoDocumento')?.value;
  const valor = String(control.value ?? '').trim().toUpperCase();

  if (tipoDocumento === 'DNI') {
    return /^\d{8}$/.test(valor) ? null : { dni: true };
  }

  if (tipoDocumento === 'CE') {
    return /^[A-Z0-9]{9,12}$/.test(valor) ? null : { ce: true };
  }

  return null;
}
