// Infraestructura por módulo (criterio de Elena, 2026-10-04): import { api }
// from '.../infrastructure' y api.apiFetch(...); cache = TanStack Query.
export * as api from './api/apiClient';
export * as cache from './api/queryClient';
