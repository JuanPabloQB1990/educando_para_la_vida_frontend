import { ENDPOINTS } from '../config';
import type { PerfilEstudiante } from '../types/perfilEstudiante';
import { apiGet, apiPut, apiPatch } from '../utils/apiHelpers';

const perfilEstudianteService = {
  async getPerfil(): Promise<PerfilEstudiante> {
    return apiGet<PerfilEstudiante>(ENDPOINTS.estudiante.perfil);
  },

  async updatePerfil(data: Record<string, unknown>): Promise<PerfilEstudiante> {
    return apiPut<PerfilEstudiante, Record<string, unknown>>(ENDPOINTS.estudiante.perfil, data);
  },

  async updateArchivo(campo: string, file: File): Promise<PerfilEstudiante> {
    const form = new FormData();
    form.append('archivo', file);
    form.append('campo', campo);
    return apiPatch<PerfilEstudiante, FormData>(ENDPOINTS.estudiante.perfilArchivo, form);
  },
};

export default perfilEstudianteService;
