import { ENDPOINTS } from '../config';
import type { PlanEstudio } from '../types/planEstudio';
import { apiGet, apiPost, apiVoidDelete } from '../utils/apiHelpers';

const planEstudioService = {
  async getAll(): Promise<PlanEstudio[]> {
    return apiGet<PlanEstudio[]>(ENDPOINTS.catalogo.planEstudio);
  },

  async getByGrado(idGradoEducacion: string): Promise<PlanEstudio[]> {
    const qs = new URLSearchParams({ idGradoEducacion });
    return apiGet<PlanEstudio[]>(`${ENDPOINTS.catalogo.planEstudio}?${qs}`);
  },

  async create(idGradoEducacion: string, idMateria: string): Promise<PlanEstudio> {
    return apiPost<PlanEstudio, { idGradoEducacion: string; idMateria: string }>(
      ENDPOINTS.catalogo.planEstudio,
      { idGradoEducacion, idMateria }
    );
  },

  async remove(id: string): Promise<void> {
    return apiVoidDelete(`${ENDPOINTS.catalogo.planEstudio}/${id}`);
  },
};

export default planEstudioService;
