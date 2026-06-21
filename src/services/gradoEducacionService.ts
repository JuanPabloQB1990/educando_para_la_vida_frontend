import { ENDPOINTS } from '../config';
import type { GradoEducacion } from '../types/gradoEducacion';
import { apiGet, apiPost, apiPut, apiVoidDelete } from '../utils/apiHelpers';

const gradoEducacionService = {
  async getAll(): Promise<GradoEducacion[]> {
    return apiGet<GradoEducacion[]>(ENDPOINTS.academico.gradoEducacion);
  },

  async create(nombre: string): Promise<GradoEducacion> {
    return apiPost<GradoEducacion, { nombre: string }>(ENDPOINTS.academico.gradoEducacion, { nombre });
  },

  async update(id: string, nombre: string): Promise<GradoEducacion> {
    return apiPut<GradoEducacion, { nombre: string }>(`${ENDPOINTS.academico.gradoEducacion}/${id}`, { nombre });
  },

  async remove(id: string): Promise<void> {
    return apiVoidDelete(`${ENDPOINTS.academico.gradoEducacion}/${id}`);
  },
};

export default gradoEducacionService;
