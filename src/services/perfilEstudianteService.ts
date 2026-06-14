import http from './http';
import type { PerfilEstudiante } from '../types/perfilEstudiante';

const perfilEstudianteService = {
  async getPerfil(): Promise<PerfilEstudiante> {
    const res = await http.get('/estudiante/perfil');
    return res.data.data;
  },
  async updatePerfil(data: Record<string, unknown>): Promise<PerfilEstudiante> {
    const res = await http.put('/estudiante/perfil', data);
    return res.data.data;
  },
  async updateArchivo(campo: string, file: File): Promise<PerfilEstudiante> {
    const form = new FormData();
    form.append('archivo', file);
    form.append('campo', campo);
    const res = await http.patch('/estudiante/perfil/archivo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
};

export default perfilEstudianteService;
