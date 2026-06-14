import http from './http';
import type { PagosEstudianteData } from '../types/pagosEstudiante';

const pagosEstudianteService = {
  async getPagos(): Promise<PagosEstudianteData> {
    const res = await http.get('/estudiante/pagos');
    return res.data.data;
  },

  async subirComprobante(idObligacionPago: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('idObligacionPago', idObligacionPago);
    formData.append('comprobante', file);
    await http.post('/estudiante/pagos/comprobante', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default pagosEstudianteService;
