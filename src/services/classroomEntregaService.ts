import http from './http';
import type { ClassroomEntrega, ClassroomEntregaAdjunto, UpdateEstadoEntregaDto } from '../types/classroomEntrega';

const classroomEntregaService = {
  async listByCarga(idCargaAcademica: string, idPeriodo?: string): Promise<ClassroomEntrega[]> {
    const params: Record<string, string> = { idCargaAcademica };
    if (idPeriodo) params.idPeriodo = idPeriodo;
    const res = await http.get('/docente/classroom_entrega', { params });
    return res.data.data;
  },

  async getAdjuntos(idEntrega: string): Promise<ClassroomEntregaAdjunto[]> {
    const res = await http.get(`/docente/classroom_entrega/${idEntrega}/adjuntos`);
    return res.data.data;
  },

  async updateEstado(id: string, data: UpdateEstadoEntregaDto): Promise<ClassroomEntrega> {
    const res = await http.patch(`/docente/classroom_entrega/${id}/estado`, data);
    return res.data.data;
  },

  // Estudiante
  async listForEstudiante(): Promise<ClassroomEntrega[]> {
    const res = await http.get('/estudiante/classroom/entregas');
    return res.data.data;
  },

  async createForEstudiante(idClassroomTarea: string): Promise<ClassroomEntrega> {
    const res = await http.post('/estudiante/classroom/entregas', { idClassroomTarea });
    return res.data.data;
  },

  async uploadAdjuntos(idEntrega: string, files: File[]): Promise<ClassroomEntregaAdjunto[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const res = await http.post(`/estudiante/classroom/entregas/${idEntrega}/adjuntos`, formData);
    return res.data.data;
  },

  async getAdjuntosEstudiante(idEntrega: string): Promise<ClassroomEntregaAdjunto[]> {
    const res = await http.get(`/estudiante/classroom/entregas/${idEntrega}/adjuntos`);
    return res.data.data;
  },

  async deleteAdjuntoEstudiante(idEntrega: string, adjuntoId: string): Promise<void> {
    await http.delete(`/estudiante/classroom/entregas/${idEntrega}/adjuntos/${adjuntoId}`);
  },
};

export default classroomEntregaService;
