import http from './http';
import type { TiempoValidacion } from '../types/tiempoValidacion';

const tiempoValidacionService = {
  async getAll(): Promise<TiempoValidacion[]> {
    const res = await http.get('/academico/tiempo_validacion');
    return res.data.data;
  },
  async create(tiempo: number): Promise<TiempoValidacion> {
    const res = await http.post('/academico/tiempo_validacion', { tiempo });
    return res.data.data;
  },
  async update(id: string, tiempo: number): Promise<TiempoValidacion> {
    const res = await http.put(`/academico/tiempo_validacion/${id}`, { tiempo });
    return res.data.data;
  },
  async remove(id: string): Promise<void> {
    await http.delete(`/academico/tiempo_validacion/${id}`);
  },
};

export default tiempoValidacionService;
