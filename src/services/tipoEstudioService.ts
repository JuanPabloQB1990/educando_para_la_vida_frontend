import http from './http';
import type { TipoEstudio } from '../types/tipoEstudio';

const tipoEstudioService = {
  async getAll(): Promise<TipoEstudio[]> {
    const res = await http.get('/academico/tipo_estudio');
    return res.data.data;
  },
  async create(nombre: string): Promise<TipoEstudio> {
    const res = await http.post('/academico/tipo_estudio', { nombre });
    return res.data.data;
  },
  async update(id: string, nombre: string): Promise<TipoEstudio> {
    const res = await http.put(`/academico/tipo_estudio/${id}`, { nombre });
    return res.data.data;
  },
  async remove(id: string): Promise<void> {
    await http.delete(`/academico/tipo_estudio/${id}`);
  },
};

export default tipoEstudioService;
