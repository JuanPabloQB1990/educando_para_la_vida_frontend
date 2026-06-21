import http from './http';
import { ENDPOINTS } from '../config';
import type { ApiResponse } from '../types/api';
import type { DireccionGrado } from '../types/direccionGrado';
import { apiGet, apiPost, apiPut, apiPatch, apiVoidDelete } from '../utils/apiHelpers';
import { handleApiError } from '../utils/apiHelpers';

export interface CreateDireccionGradoDto {
  idGradoEducacion?: string | null;
  idUsuario: string;
  idAnioElectivo: string;
  idBloque?: string | null;
}

const direccionGradoService = {
  async getAll(): Promise<DireccionGrado[]> {
    return apiGet<DireccionGrado[]>(ENDPOINTS.docente.direccionGrado);
  },

  async getByProfesor(idUsuario: string, idAnioElectivo?: string): Promise<DireccionGrado[]> {
    const qs = new URLSearchParams({ idUsuario });
    if (idAnioElectivo) qs.set('idAnioElectivo', idAnioElectivo);
    return apiGet<DireccionGrado[]>(`${ENDPOINTS.docente.direccionGrado}?${qs}`);
  },

  async updateLink(id: string, linkClaseVirtual: string): Promise<DireccionGrado> {
    return apiPatch<DireccionGrado, { linkClaseVirtual: string }>(
      `${ENDPOINTS.docente.direccionGrado}/${id}/link`,
      { linkClaseVirtual }
    );
  },

  async create(data: CreateDireccionGradoDto): Promise<DireccionGrado> {
    return apiPost<DireccionGrado, CreateDireccionGradoDto>(ENDPOINTS.docente.direccionGrado, data);
  },

  async update(id: string, data: CreateDireccionGradoDto): Promise<DireccionGrado> {
    return apiPut<DireccionGrado, CreateDireccionGradoDto>(`${ENDPOINTS.docente.direccionGrado}/${id}`, data);
  },

  async remove(id: string): Promise<void> {
    return apiVoidDelete(`${ENDPOINTS.docente.direccionGrado}/${id}`);
  },

  // El recurso puede no existir: data puede ser null
  async getForEstudiante(): Promise<DireccionGrado | null> {
    try {
      const res = await http.get<ApiResponse<DireccionGrado | null>>(ENDPOINTS.estudiante.claseVirtual);
      if (!res.data.success) throw new Error(res.data.error || 'Error desconocido de la API');
      return res.data.data ?? null;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default direccionGradoService;
