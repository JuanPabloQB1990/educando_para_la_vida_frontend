import http from './http';
import type { Rubro } from '../types/rubro';

export interface RubroDto {
  nombre: string;
  montoBase: number;
  descripcion?: string;
}

const rubroService = {
  async getAll(): Promise<Rubro[]> {
    const res = await http.get('/gestion/rubro');
    return res.data.data;
  },
  async create(dto: RubroDto): Promise<Rubro> {
    const res = await http.post('/gestion/rubro', dto);
    return res.data.data;
  },
  async update(id: string, dto: RubroDto): Promise<Rubro> {
    const res = await http.put(`/gestion/rubro/${id}`, dto);
    return res.data.data;
  },
  async remove(id: string): Promise<void> {
    await http.delete(`/gestion/rubro/${id}`);
  },
};

export default rubroService;
