import http from './http';
import type { Periodo, PeriodoEstado } from '../types/periodo';

export type { Periodo };

const periodoService = {
  async getByAnio(idAnioElectivo: string): Promise<Periodo[]> {
    const res = await http.get('/docente/periodo', { params: { idAnioElectivo } });
    return res.data.data;
  },

  async updateEstado(id: string, estado: PeriodoEstado): Promise<void> {
    await http.patch(`/docente/periodo/${id}/estado`, { estado });
  },
};

export default periodoService;
