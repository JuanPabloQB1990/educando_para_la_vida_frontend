import { ENDPOINTS } from '../config';
import { apiVoidPost, apiVoidPatch } from '../utils/apiHelpers';

const asistenciaService = {
  async updateFecha(data: {
    idActividad: string;
    fechaActual: string;
    fechaNueva: string;
  }): Promise<void> {
    return apiVoidPatch<typeof data>(ENDPOINTS.docente.asistenciaFecha, data);
  },

  async upsert(data: {
    idEstudiante: string;
    idActividad: string;
    fecha: string;
    estadoAsistencia: string | null;
    observacion?: string | null;
  }): Promise<void> {
    return apiVoidPost<typeof data>(ENDPOINTS.docente.asistenciaUpsert, data);
  },
};

export default asistenciaService;
