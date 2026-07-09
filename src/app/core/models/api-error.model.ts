
export interface ApiError {
  timestamp?: string;
  status: number;
  error: string;
  message: string;
  fields?: Record<string, string>;
}


export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'message' in value
  );
}
