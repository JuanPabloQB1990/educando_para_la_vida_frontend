import { ENDPOINTS } from '../config';
import type { Actividad } from '../types/actividad';
import { apiGet, apiPost, apiPut } from '../utils/apiHelpers';

const actividadService = {
  async list(idGradoEducacion: string, idPeriodo: string): Promise<Actividad[]> {
    const qs = new URLSearchParams({ idGradoEducacion, idPeriodo });
    return apiGet<Actividad[]>(`${ENDPOINTS.docente.actividad}?${qs}`);
  },

  async create(data: {
    idPeriodo: string;
    idGradoEducacion: string;
    nombreActividad: string;
  }): Promise<Actividad> {
    return apiPost<Actividad, typeof data>(ENDPOINTS.docente.actividad, data);
  },

  async update(id: string, nombreActividad: string): Promise<Actividad> {
    return apiPut<Actividad, { nombreActividad: string }>(
      `${ENDPOINTS.docente.actividad}/${id}`,
      { nombreActividad }
    );
  },
};

export default actividadService;
