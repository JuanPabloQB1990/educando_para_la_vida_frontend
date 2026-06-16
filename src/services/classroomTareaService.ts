import http from './http';
import type { ClassroomTarea, ClassroomTareaAdjunto, CreateClassroomTareaDto, UpdateClassroomTareaDto } from '../types/classroomTarea';

const classroomTareaService = {
  async listByCarga(idCargaAcademica: string): Promise<ClassroomTarea[]> {
    const res = await http.get('/docente/classroom_tarea', { params: { idCargaAcademica } });
    return res.data.data;
  },

  async listForEstudiante(): Promise<ClassroomTarea[]> {
    const res = await http.get('/estudiante/classroom/tareas');
    return res.data.data;
  },

  async create(data: CreateClassroomTareaDto): Promise<ClassroomTarea> {
    const res = await http.post('/docente/classroom_tarea', data);
    return res.data.data;
  },

  async update(id: string, data: UpdateClassroomTareaDto): Promise<ClassroomTarea> {
    const res = await http.put(`/docente/classroom_tarea/${id}`, data);
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/docente/classroom_tarea/${id}`);
  },

  async getAdjuntos(idTarea: string): Promise<ClassroomTareaAdjunto[]> {
    const res = await http.get(`/docente/classroom_tarea/${idTarea}/adjuntos`);
    return res.data.data;
  },

  async uploadAdjuntos(idTarea: string, files: File[]): Promise<ClassroomTareaAdjunto[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const res = await http.post(`/docente/classroom_tarea/${idTarea}/adjuntos`, formData);
    return res.data.data;
  },

  async removeAdjunto(idTarea: string, adjuntoId: string): Promise<void> {
    await http.delete(`/docente/classroom_tarea/${idTarea}/adjuntos/${adjuntoId}`);
  },
};

export default classroomTareaService;
