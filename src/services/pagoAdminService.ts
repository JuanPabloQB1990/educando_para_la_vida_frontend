import http from './http';
import type { PagoAdmin, PagoAdminFilters, VerificarPagoDto, MatricularAnioDto, GradoMatriculado, ObligacionPagoEstudiante } from '../types/pago';
import type { Rubro } from '../types/rubro';

export const pagoAdminService = {
  async getPagosAdmin(filters: PagoAdminFilters = {}): Promise<PagoAdmin[]> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined)
    );
    const res = await http.get<{ success: boolean; data: PagoAdmin[] }>('/gestion/pago/admin', { params });
    return res.data.data;
  },

  async verificar(id: string, dto: VerificarPagoDto): Promise<void> {
    await http.patch(`/gestion/pago/${id}/verificar`, dto);
  },

  async getRubros(): Promise<Rubro[]> {
    const res = await http.get<{ success: boolean; data: Rubro[] }>('/gestion/rubro');
    return res.data.data;
  },

  async matricularAnio(idEstudianteMatricula: string, dto: MatricularAnioDto): Promise<void> {
    await http.post(`/gestion/estudiante_matricula/${idEstudianteMatricula}/matricular-anio`, dto);
  },

  async getGradosByMatricula(idEstudianteMatricula: string): Promise<GradoMatriculado[]> {
    const res = await http.get<{ success: boolean; data: GradoMatriculado[] }>(
      `/gestion/estudiante_matricula/${idEstudianteMatricula}/grados`
    );
    return res.data.data;
  },

  async getObligacionesByMatricula(idEstudianteMatricula: string): Promise<ObligacionPagoEstudiante[]> {
    const res = await http.get<{ success: boolean; data: ObligacionPagoEstudiante[] }>(
      `/gestion/estudiante_matricula/${idEstudianteMatricula}/obligaciones`
    );
    return res.data.data;
  },

  async deleteObligacion(id: string): Promise<void> {
    await http.delete(`/gestion/obligacion_pago/${id}`);
  },
};
