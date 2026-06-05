import http from './http';
import type { GradoEducacion } from '../types/gradoEducacion';

const gradoEducacionService = {
  async getAll(): Promise<GradoEducacion[]> {
    const res = await http.get('/academico/grado_educacion');
    return res.data.data;
  },
  async create(nombre: string): Promise<GradoEducacion> {
    const res = await http.post('/academico/grado_educacion', { nombre });
    return res.data.data;
  },
  async update(id: string, nombre: string): Promise<GradoEducacion> {
    const res = await http.put(`/academico/grado_educacion/${id}`, { nombre });
    return res.data.data;
  },
  async remove(id: string): Promise<void> {
    await http.delete(`/academico/grado_educacion/${id}`);
  },
};

export default gradoEducacionService;
