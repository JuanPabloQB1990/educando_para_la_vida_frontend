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
};

export default calificacionService;
