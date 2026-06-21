import { ENDPOINTS } from '../config';
import type { EstudianteAdmin, EstudianteAdminFilters, MatriculaConGrados, ObligacionPagoAdmin } from '../types/matriculasAdmin';
import type { PerfilEstudiante } from '../types/perfilEstudiante';
import { apiGet, apiPost, apiVoidPut, apiVoidPatch, apiVoidDelete } from '../utils/apiHelpers';

const matriculasAdminService = {
  async getAll(filters: EstudianteAdminFilters): Promise<EstudianteAdmin[]> {
    const qs = new URLSearchParams();
    if (filters.noDocumento) qs.set('noDocumento', filters.noDocumento);
    if (filters.padreCedula) qs.set('padreCedula', filters.padreCedula);
    if (filters.madreCedula) qs.set('madreCedula', filters.madreCedula);
    if (filters.acudienteCedula) qs.set('acudienteCedula', filters.acudienteCedula);
    if (filters.conObligacionVencida) qs.set('conObligacionVencida', 'true');
    const query = qs.toString();
    return apiGet<EstudianteAdmin[]>(`${ENDPOINTS.gestion.estudianteAdmin}${query ? `?${query}` : ''}`);
  },

  async getDetalle(idEstudiante: string): Promise<PerfilEstudiante> {
    return apiGet<PerfilEstudiante>(`${ENDPOINTS.gestion.estudiante}/${idEstudiante}`);
  },

  async getHistorial(idEstudiante: string): Promise<MatriculaConGrados[]> {
    return apiGet<MatriculaConGrados[]>(`${ENDPOINTS.gestion.estudiante}/${idEstudiante}/historial`);
  },

  async patchMatriculaEstudio(id: string, idTipoEstudio: string, idTiempoValidacion: string | null): Promise<void> {
    return apiVoidPatch<{ idTipoEstudio: string; idTiempoValidacion: string | null }>(
      `${ENDPOINTS.gestion.estudianteMatricula}/${id}/estudio`,
      { idTipoEstudio, idTiempoValidacion }
    );
  },

  async addGrado(idEstudianteMatricula: string, idGradoEducacion: string): Promise<void> {
    return apiPost<null, object>(ENDPOINTS.gestion.gradosPorMatricula, {
      id_estudiante_matricula: idEstudianteMatricula,
      id_grado_educacion: idGradoEducacion,
      estado: 'pendiente',
    }).then(() => undefined);
  },

  async removeGrado(idEstudianteMatricula: string, idGradoEducacion: string): Promise<void> {
    return apiVoidDelete(
      `${ENDPOINTS.gestion.gradosPorMatricula}/${idEstudianteMatricula}/${idGradoEducacion}`
    );
  },

  async updateGradoEstado(idEstudianteMatricula: string, idGradoEducacion: string, estado: string): Promise<void> {
    return apiVoidPut<{ estado: string }>(
      `${ENDPOINTS.gestion.gradosPorMatricula}/${idEstudianteMatricula}/${idGradoEducacion}`,
      { estado }
    );
  },

  async getObligacionesMatricula(idEstudianteMatricula: string): Promise<ObligacionPagoAdmin[]> {
    return apiGet<ObligacionPagoAdmin[]>(
      `${ENDPOINTS.gestion.estudianteMatricula}/${idEstudianteMatricula}/obligaciones`
    );
  },
};

export default matriculasAdminService;
