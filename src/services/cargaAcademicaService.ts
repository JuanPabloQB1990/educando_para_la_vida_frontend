import { ENDPOINTS } from '../config';
import type { CargaAcademica } from '../types/cargaAcademica';
import { apiGet, apiPost, apiVoidDelete } from '../utils/apiHelpers';

const cargaAcademicaService = {
  async getAll(): Promise<CargaAcademica[]> {
    return apiGet<CargaAcademica[]>(ENDPOINTS.docente.cargaAcademica);
  },

  async getByProfesor(idUsuario: string, idAnioElectivo?: string): Promise<CargaAcademica[]> {
    const qs = new URLSearchParams({ idUsuario });
    if (idAnioElectivo) qs.set('idAnioElectivo', idAnioElectivo);
    return apiGet<CargaAcademica[]>(`${ENDPOINTS.docente.cargaAcademica}?${qs}`);
  },

  async create(data: {
    idUsuario: string;
    idMateria: string;
    idGradoEducacion: string;
    idAnioElectivo: string;
    idBloque?: string | null;
  }): Promise<CargaAcademica> {
    return apiPost<CargaAcademica, typeof data>(ENDPOINTS.docente.cargaAcademica, data);
  },

  async remove(id: string): Promise<void> {
    return apiVoidDelete(`${ENDPOINTS.docente.cargaAcademica}/${id}`);
  },
};

export default cargaAcademicaService;
