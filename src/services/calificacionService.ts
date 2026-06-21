import { ENDPOINTS } from '../config';
import { apiVoidPost, apiVoidPut } from '../utils/apiHelpers';

const calificacionService = {
  async create(data: {
    idEstudiante: string;
    idActividadMateria: string;
    nota: number;
    observacion?: string;
  }): Promise<void> {
    return apiVoidPost<typeof data>(ENDPOINTS.docente.calificacion, data);
  },

  async update(id: string, data: { nota: number; observacion?: string | null }): Promise<void> {
    return apiVoidPut<typeof data>(`${ENDPOINTS.docente.calificacion}/${id}`, data);
  },
};

export default calificacionService;
