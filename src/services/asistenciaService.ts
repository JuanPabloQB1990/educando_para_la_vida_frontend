import http from './http';

const asistenciaService = {
  async upsert(data: {
    idEstudiante: string;
    idActividad: string;
    fecha: string;
    estadoAsistencia: string;
    observacion?: string;
  }): Promise<void> {
    await http.post('/docente/asistencia/upsert', data);
  },
};

export default asistenciaService;
