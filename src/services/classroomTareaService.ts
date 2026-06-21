import { ENDPOINTS } from '../config';
import type { ClassroomTarea, ClassroomTareaAdjunto, CreateClassroomTareaDto, UpdateClassroomTareaDto } from '../types/classroomTarea';
import { apiGet, apiPost, apiPut, apiVoidDelete } from '../utils/apiHelpers';

const classroomTareaService = {
  async listByCarga(idCargaAcademica: string): Promise<ClassroomTarea[]> {
    const qs = new URLSearchParams({ idCargaAcademica });
    return apiGet<ClassroomTarea[]>(`${ENDPOINTS.docente.classroomTarea}?${qs}`);
  },

  async listForEstudiante(): Promise<ClassroomTarea[]> {
    return apiGet<ClassroomTarea[]>(ENDPOINTS.estudiante.classroomTareas);
  },

  async create(data: CreateClassroomTareaDto): Promise<ClassroomTarea> {
    return apiPost<ClassroomTarea, CreateClassroomTareaDto>(ENDPOINTS.docente.classroomTarea, data);
  },

  async update(id: string, data: UpdateClassroomTareaDto): Promise<ClassroomTarea> {
    return apiPut<ClassroomTarea, UpdateClassroomTareaDto>(`${ENDPOINTS.docente.classroomTarea}/${id}`, data);
  },

  async remove(id: string): Promise<void> {
    return apiVoidDelete(`${ENDPOINTS.docente.classroomTarea}/${id}`);
  },

  async getAdjuntos(idTarea: string): Promise<ClassroomTareaAdjunto[]> {
    return apiGet<ClassroomTareaAdjunto[]>(`${ENDPOINTS.docente.classroomTarea}/${idTarea}/adjuntos`);
  },

  async uploadAdjuntos(idTarea: string, files: File[]): Promise<ClassroomTareaAdjunto[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return apiPost<ClassroomTareaAdjunto[], FormData>(
      `${ENDPOINTS.docente.classroomTarea}/${idTarea}/adjuntos`,
      formData
    );
  },

  async removeAdjunto(idTarea: string, adjuntoId: string): Promise<void> {
    return apiVoidDelete(`${ENDPOINTS.docente.classroomTarea}/${idTarea}/adjuntos/${adjuntoId}`);
  },
};

export default classroomTareaService;
