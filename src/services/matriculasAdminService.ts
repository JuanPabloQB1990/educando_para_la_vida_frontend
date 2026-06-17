import http from './http';
import type { EstudianteAdmin, EstudianteAdminFilters, MatriculaConGrados } from '../types/matriculasAdmin';
import type { PerfilEstudiante } from '../types/perfilEstudiante';

const matriculasAdminService = {
  async getAll(filters: EstudianteAdminFilters): Promise<EstudianteAdmin[]> {
    const params = new URLSearchParams();
    if (filters.noDocumento) params.append('noDocumento', filters.noDocumento);
    if (filters.padreCedula) params.append('padreCedula', filters.padreCedula);
    if (filters.madreCedula) params.append('madreCedula', filters.madreCedula);
    if (filters.acudienteCedula) params.append('acudienteCedula', filters.acudienteCedula);
    const query = params.toString();
    const res = await http.get<{ success: boolean; data: EstudianteAdmin[] }>(
      `/gestion/estudiante/admin${query ? `?${query}` : ''}`
    );
    return res.data.data;
  },

  async getDetalle(idEstudiante: string): Promise<PerfilEstudiante> {
    const res = await http.get<{ success: boolean; data: PerfilEstudiante }>(
      `/gestion/estudiante/${idEstudiante}`
    );
    return res.data.data;
  },

  async getHistorial(idEstudiante: string): Promise<MatriculaConGrados[]> {
    const res = await http.get<{ success: boolean; data: MatriculaConGrados[] }>(
      `/gestion/estudiante/${idEstudiante}/historial`
    );
    return res.data.data;
  },
};

export default matriculasAdminService;
