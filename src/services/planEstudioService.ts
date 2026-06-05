import http from './http';
import type { PlanEstudio } from '../types/planEstudio';

const planEstudioService = {
  async getAll(): Promise<PlanEstudio[]> {
    const res = await http.get('/catalogo/plan_estudio');
    return res.data.data;
  },
  async getByGrado(idGradoEducacion: string): Promise<PlanEstudio[]> {
    const res = await http.get('/catalogo/plan_estudio', { params: { idGradoEducacion } });
    return res.data.data;
  },
  async create(idGradoEducacion: string, idMateria: string): Promise<PlanEstudio> {
    const res = await http.post('/catalogo/plan_estudio', { idGradoEducacion, idMateria });
    return res.data.data;
  },
  async remove(id: string): Promise<void> {
    await http.delete(`/catalogo/plan_estudio/${id}`);
  },
};

export default planEstudioService;
