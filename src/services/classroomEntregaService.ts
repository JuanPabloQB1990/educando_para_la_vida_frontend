import { ENDPOINTS } from '../config';
import type { ClassroomEntrega, ClassroomEntregaAdjunto, UpdateEstadoEntregaDto } from '../types/classroomEntrega';
import { apiGet, apiPost, apiPatch, apiVoidDelete } from '../utils/apiHelpers';

const classroomEntregaService = {
  async listByCarga(idCargaAcademica: string, idPeriodo?: string): Promise<ClassroomEntrega[]> {
    const qs = new URLSearchParams({ idCargaAcademica });
    if (idPeriodo) qs.set('idPeriodo', idPeriodo);
    return apiGet<ClassroomEntrega[]>(`${ENDPOINTS.docente.classroomEntrega}?${qs}`);
  },

  async getAdjuntos(idEntrega: string): Promise<ClassroomEntregaAdjunto[]> {
    return apiGet<ClassroomEntregaAdjunto[]>(`${ENDPOINTS.docente.classroomEntrega}/${idEntrega}/adjuntos`);
  },

  async updateEstado(id: string, data: UpdateEstadoEntregaDto): Promise<ClassroomEntrega> {
    return apiPatch<ClassroomEntrega, UpdateEstadoEntregaDto>(
      `${ENDPOINTS.docente.classroomEntrega}/${id}/estado`,
      data
    );
  },

  // Estudiante
  async listForEstudiante(): Promise<ClassroomEntrega[]> {
    return apiGet<ClassroomEntrega[]>(ENDPOINTS.estudiante.classroomEntregas);
  },

  async createForEstudiante(idClassroomTarea: string): Promise<ClassroomEntrega> {
    return apiPost<ClassroomEntrega, { idClassroomTarea: string }>(
      ENDPOINTS.estudiante.classroomEntregas,
      { idClassroomTarea }
    );
  },

  async uploadAdjuntos(idEntrega: string, files: File[]): Promise<ClassroomEntregaAdjunto[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return apiPost<ClassroomEntregaAdjunto[], FormData>(
      `${ENDPOINTS.estudiante.classroomEntregas}/${idEntrega}/adjuntos`,
      formData
    );
  },

  async getAdjuntosEstudiante(idEntrega: string): Promise<ClassroomEntregaAdjunto[]> {
    return apiGet<ClassroomEntregaAdjunto[]>(`${ENDPOINTS.estudiante.classroomEntregas}/${idEntrega}/adjuntos`);
  },

  async deleteAdjuntoEstudiante(idEntrega: string, adjuntoId: string): Promise<void> {
    return apiVoidDelete(`${ENDPOINTS.estudiante.classroomEntregas}/${idEntrega}/adjuntos/${adjuntoId}`);
  },
};

export default classroomEntregaService;
