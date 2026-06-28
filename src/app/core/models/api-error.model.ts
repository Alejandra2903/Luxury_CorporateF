/**
 * Forma exacta de los errores devueltos por GlobalExceptionHandler del
 * backend. "fields" solo viene presente en errores de validacion (400),
 * mapeando nombre de campo -> mensaje de error.
 */
export interface ApiError {
  timestamp?: string;
  status: number;
  error: string;
  message: string;
  fields?: Record<string, string>;
}

/** Type guard para distinguir un ApiError de un Error genérico de red/JS. */
export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'message' in value
  );
}
