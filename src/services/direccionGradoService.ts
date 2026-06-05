import http from './http';
import type { DireccionGrado } from '../types/direccionGrado';

export interface CreateDireccionGradoDto {
  idGradoEducacion: string;
  idUsuario: string;
  idAnioElectivo: string;
}

const direccionGradoService = {
  async getAll(): Promise<DireccionGrado[]> {
    const res = await http.get('/docente/direccion_grado');
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
};

export default direccionGradoService;
