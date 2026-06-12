import http from './http';

const asistenciaService = {
  async updateFecha(data: {
    idActividad: string;
    fechaActual: string;
    fechaNueva: string;
  }): Promise<void> {
    await http.patch('/docente/asistencia/fecha', data);
  },

  async upsert(data: {
    idEstudiante: string;
    idActividad: string;
    fecha: string;
    estadoAsistencia: string | null;
    observacion?: string | null;
  }): Promise<void> {
    await http.post('/docente/asistencia/upsert', data);
  },
};

export default asistenciaService;
