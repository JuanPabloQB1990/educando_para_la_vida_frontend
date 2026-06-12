import http from './http';
import type { Materia } from '../types/materia';

const materiaService = {
  async getAll(): Promise<Materia[]> {
    const res = await http.get('/catalogo/materia');
    return res.data.data;
  },

  async create(nombreMateria: string, abreviatura: string): Promise<Materia> {
    const res = await http.post('/catalogo/materia', { nombreMateria, abreviatura });
    return res.data.data;
  },

  async update(id: string, nombreMateria: string, abreviatura: string): Promise<Materia> {
    const res = await http.put(`/catalogo/materia/${id}`, { nombreMateria, abreviatura });
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/catalogo/materia/${id}`);
  },
};

export default materiaService;
