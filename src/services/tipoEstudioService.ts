import { ENDPOINTS } from '../config';
import type { TipoEstudio } from '../types/tipoEstudio';
import { apiGet, apiPost, apiPut, apiVoidDelete } from '../utils/apiHelpers';

const tipoEstudioService = {
  async getAll(): Promise<TipoEstudio[]> {
    return apiGet<TipoEstudio[]>(ENDPOINTS.academico.tipoEstudio);
  },

  async create(nombre: string): Promise<TipoEstudio> {
    return apiPost<TipoEstudio, { nombre: string }>(ENDPOINTS.academico.tipoEstudio, { nombre });
  },

  async update(id: string, nombre: string): Promise<TipoEstudio> {
    return apiPut<TipoEstudio, { nombre: string }>(`${ENDPOINTS.academico.tipoEstudio}/${id}`, { nombre });
  },

  async remove(id: string): Promise<void> {
    return apiVoidDelete(`${ENDPOINTS.academico.tipoEstudio}/${id}`);
  },
};

export default tipoEstudioService;
