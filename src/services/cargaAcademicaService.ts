import http from './http';
import type { CargaAcademica } from '../types/cargaAcademica';

const cargaAcademicaService = {
  async getAll(): Promise<CargaAcademica[]> {
    const res = await http.get('/docente/carga_academica');
    return res.data.data;
  },

  async getByProfesor(idUsuario: string, idAnioElectivo?: string): Promise<CargaAcademica[]> {
    const params: Record<string, string> = { idUsuario };
    if (idAnioElectivo) params.idAnioElectivo = idAnioElectivo;
    const res = await http.get('/docente/carga_academica', { params });
    return res.data.data;
  },

  async create(data: {
    idUsuario: string;
    idMateria: string;
    idGradoEducacion: string;
    idAnioElectivo: string;
  }): Promise<CargaAcademica> {
    const res = await http.post('/docente/carga_academica', data);
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/docente/carga_academica/${id}`);
  },
};

export default cargaAcademicaService;
