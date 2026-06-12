import http from './http';
import type { ActividadMateria } from '../types/actividadMateria';

const actividadMateriaService = {
  async listByActividad(idActividad: string): Promise<ActividadMateria[]> {
    const res = await http.get('/docente/actividad_materia', {
      params: { idActividad },
    });
    return res.data.data;
  },

  async create(data: {
    idActividad: string;
    idMateria: string;
    idCargaAcademica: string;
  }): Promise<ActividadMateria> {
    const res = await http.post('/docente/actividad_materia', data);
    return res.data.data;
  },
};

export default actividadMateriaService;
