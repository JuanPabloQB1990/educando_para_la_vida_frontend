import http from './http';

const calificacionService = {
  async create(data: {
    idEstudiante: string;
    idActividadMateria: string;
    nota: number;
    observacion?: string;
  }): Promise<void> {
    await http.post('/docente/calificacion', data);
  },

  async update(id: string, data: { nota: number; observacion?: string | null }): Promise<void> {
    await http.put(`/docente/calificacion/${id}`, data);
  },
};

export default calificacionService;
