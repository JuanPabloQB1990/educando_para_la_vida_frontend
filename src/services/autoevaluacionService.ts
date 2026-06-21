import { ENDPOINTS } from '../config';
import { apiVoidPost, apiVoidDelete } from '../utils/apiHelpers';

const autoevaluacionService = {
  async upsert(data: {
    idEstudiante: string;
    idPeriodo: string;
    idGradoEducacion: string;
    nota: number;
    observacion?: string | null;
  }): Promise<void> {
    return apiVoidPost<typeof data>(ENDPOINTS.docente.autoevaluacionUpsert, data);
  },

  async delete(id: string): Promise<void> {
    return apiVoidDelete(`${ENDPOINTS.docente.autoevaluacion}/${id}`);
  },
};

export default autoevaluacionService;
