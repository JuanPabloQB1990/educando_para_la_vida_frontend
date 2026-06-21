import { ENDPOINTS } from '../config';
import type { PagoAdmin, PagoAdminFilters, VerificarPagoDto, MatricularAnioDto, GradoMatriculado, ObligacionPagoEstudiante } from '../types/pago';
import type { Rubro } from '../types/rubro';
import { apiGet, apiPost, apiVoidPost, apiVoidPut, apiVoidPatch, apiVoidDelete } from '../utils/apiHelpers';

export const pagoAdminService = {
  async getPagosAdmin(filters: PagoAdminFilters = {}): Promise<PagoAdmin[]> {
    const qs = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    });
    const query = qs.toString();
    return apiGet<PagoAdmin[]>(`${ENDPOINTS.gestion.pagoAdmin}${query ? `?${query}` : ''}`);
  },

  async verificar(id: string, dto: VerificarPagoDto): Promise<void> {
    return apiVoidPatch<VerificarPagoDto>(`${ENDPOINTS.gestion.pago}/${id}/verificar`, dto);
  },

  async getRubros(): Promise<Rubro[]> {
    return apiGet<Rubro[]>(ENDPOINTS.gestion.rubro);
  },

  async matricularAnio(idEstudianteMatricula: string, dto: MatricularAnioDto): Promise<void> {
    return apiVoidPost<MatricularAnioDto>(
      `${ENDPOINTS.gestion.estudianteMatricula}/${idEstudianteMatricula}/matricular-anio`,
      dto
    );
  },

  async getGradosByMatricula(idEstudianteMatricula: string): Promise<GradoMatriculado[]> {
    return apiGet<GradoMatriculado[]>(
      `${ENDPOINTS.gestion.estudianteMatricula}/${idEstudianteMatricula}/grados`
    );
  },

  async getObligacionesByMatricula(idEstudianteMatricula: string): Promise<ObligacionPagoEstudiante[]> {
    return apiGet<ObligacionPagoEstudiante[]>(
      `${ENDPOINTS.gestion.estudianteMatricula}/${idEstudianteMatricula}/obligaciones`
    );
  },

  async deleteObligacion(id: string): Promise<void> {
    return apiVoidDelete(`${ENDPOINTS.gestion.obligacionPago}/${id}`);
  },

  async getEstudianteMatricula(id: string): Promise<{ idTipoEstudio: string | null; idTiempoValidacion: string | null }> {
    return apiGet<{ idTipoEstudio: string | null; idTiempoValidacion: string | null }>(
      `${ENDPOINTS.gestion.estudianteMatricula}/${id}`
    );
  },

  async updateEstudianteMatricula(id: string, data: { id_tipo_estudio?: string | null; id_tiempo_validacion?: string | null }): Promise<void> {
    return apiVoidPut<typeof data>(`${ENDPOINTS.gestion.estudianteMatricula}/${id}`, data);
  },

  async createGradoPorMatricula(data: { id_estudiante_matricula: string; id_grado_educacion: string; estado: string }): Promise<void> {
    return apiVoidPost<typeof data>(ENDPOINTS.gestion.gradosPorMatricula, data);
  },

  async updateGradoPorMatricula(idEstudianteMatricula: string, idGradoEducacion: string, estado: string): Promise<void> {
    return apiVoidPut<{ estado: string }>(
      `${ENDPOINTS.gestion.gradosPorMatricula}/${idEstudianteMatricula}/${idGradoEducacion}`,
      { estado }
    );
  },

  async deleteGradoPorMatricula(idEstudianteMatricula: string, idGradoEducacion: string): Promise<void> {
    return apiVoidDelete(
      `${ENDPOINTS.gestion.gradosPorMatricula}/${idEstudianteMatricula}/${idGradoEducacion}`
    );
  },
};
