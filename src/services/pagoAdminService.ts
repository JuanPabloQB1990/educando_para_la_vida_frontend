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

  async matricularAnio(idEstudiantePeriodo: string, dto: MatricularAnioDto): Promise<void> {
    await http.post(`/gestion/estudiante_periodo/${idEstudiantePeriodo}/matricular-anio`, dto);
  },

  async getGradosByPeriodo(idEstudiantePeriodo: string): Promise<GradoMatriculado[]> {
    const res = await http.get<{ success: boolean; data: GradoMatriculado[] }>(
      `/gestion/estudiante_periodo/${idEstudiantePeriodo}/grados`
    );
    return res.data.data;
  },

  async getObligacionesByPeriodo(idEstudiantePeriodo: string): Promise<ObligacionPagoEstudiante[]> {
    const res = await http.get<{ success: boolean; data: ObligacionPagoEstudiante[] }>(
      `/gestion/estudiante_periodo/${idEstudiantePeriodo}/obligaciones`
    );
    return res.data.data;
  },
};
