import { ENDPOINTS } from '../config';
import type { TiempoValidacion } from '../types/tiempoValidacion';
import { apiGet, apiPost, apiPut, apiVoidDelete } from '../utils/apiHelpers';

const tiempoValidacionService = {
  async getAll(): Promise<TiempoValidacion[]> {
    return apiGet<TiempoValidacion[]>(ENDPOINTS.academico.tiempoValidacion);
  },

  async create(tiempo: number): Promise<TiempoValidacion> {
    return apiPost<TiempoValidacion, { tiempo: number }>(ENDPOINTS.academico.tiempoValidacion, { tiempo });
  },

  async update(id: string, tiempo: number): Promise<TiempoValidacion> {
    return apiPut<TiempoValidacion, { tiempo: number }>(`${ENDPOINTS.academico.tiempoValidacion}/${id}`, { tiempo });
  },

  async remove(id: string): Promise<void> {
    return apiVoidDelete(`${ENDPOINTS.academico.tiempoValidacion}/${id}`);
  },
};

export default tiempoValidacionService;
