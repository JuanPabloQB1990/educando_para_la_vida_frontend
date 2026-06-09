import http from './http';
import type { Actividad } from '../types/actividad';

const actividadService = {
  async list(idGradoEducacion: string, idPeriodo: string): Promise<Actividad[]> {
    const res = await http.get('/docente/actividad', {
      params: { idGradoEducacion, idPeriodo },
    });
    return res.data.data;
  },

  async create(data: {
    idPeriodo: string;
    idGradoEducacion: string;
    nombreActividad: string;
    semana: number;
    descripcion?: string;
  }): Promise<Actividad> {
    const res = await http.post('/docente/actividad', data);
    return res.data.data;
  },
};

export default actividadService;
