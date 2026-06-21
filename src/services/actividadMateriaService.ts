import { ENDPOINTS } from '../config';
import type { ActividadMateria } from '../types/actividadMateria';
import { apiGet, apiPost } from '../utils/apiHelpers';

const actividadMateriaService = {
  async listByActividad(idActividad: string): Promise<ActividadMateria[]> {
    const qs = new URLSearchParams({ idActividad });
    return apiGet<ActividadMateria[]>(`${ENDPOINTS.docente.actividadMateria}?${qs}`);
  },

  async create(data: {
    idActividad: string;
    idMateria: string;
    idCargaAcademica: string;
  }): Promise<ActividadMateria> {
    return apiPost<ActividadMateria, typeof data>(ENDPOINTS.docente.actividadMateria, data);
  },
};

export default actividadMateriaService;
