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
};

export default classroomEntregaService;
