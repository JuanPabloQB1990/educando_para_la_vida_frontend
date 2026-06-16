import http from './http';
import type { DireccionGrado } from '../types/direccionGrado';

export interface CreateDireccionGradoDto {
  idGradoEducacion: string;
  idUsuario: string;
  idAnioElectivo: string;
  idBloque?: string | null;
}

const direccionGradoService = {
  async getAll(): Promise<DireccionGrado[]> {
    const res = await http.get('/docente/direccion_grado');
    return res.data.data;
  },
  async getByProfesor(idUsuario: string, idAnioElectivo?: string): Promise<DireccionGrado[]> {
    const params: Record<string, string> = { idUsuario };
    if (idAnioElectivo) params.idAnioElectivo = idAnioElectivo;
    const res = await http.get('/docente/direccion_grado', { params });
    return res.data.data;
  },
  async updateLink(id: string, linkClaseVirtual: string): Promise<DireccionGrado> {
    const res = await http.patch(`/docente/direccion_grado/${id}/link`, { linkClaseVirtual });
    return res.data.data;
  },
  async create(data: CreateDireccionGradoDto): Promise<DireccionGrado> {
    const res = await http.post('/docente/direccion_grado', data);
    return res.data.data;
  },
  async update(id: string, data: CreateDireccionGradoDto): Promise<DireccionGrado> {
    const res = await http.put(`/docente/direccion_grado/${id}`, data);
    return res.data.data;
  },
  async remove(id: string): Promise<void> {
    await http.delete(`/docente/direccion_grado/${id}`);
  },

  async getForEstudiante(): Promise<DireccionGrado | null> {
    const res = await http.get('/estudiante/clase-virtual');
    return res.data.data;
  },
};

export default direccionGradoService;
