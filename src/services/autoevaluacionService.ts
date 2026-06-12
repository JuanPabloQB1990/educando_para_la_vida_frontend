import http from './http';

const autoevaluacionService = {
  async upsert(data: {
    idEstudiante: string;
    idPeriodo: string;
    idGradoEducacion: string;
    nota: number;
    observacion?: string | null;
  }): Promise<void> {
    await http.post('/docente/autoevaluacion/upsert', data);
  },

  async delete(id: string): Promise<void> {
    await http.delete(`/docente/autoevaluacion/${id}`);
  },
};

export default autoevaluacionService;
