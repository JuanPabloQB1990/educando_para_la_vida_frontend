import { ENDPOINTS } from '../config';
import type { Periodo, PeriodoEstado } from '../types/periodo';
import { apiGet, apiVoidPatch } from '../utils/apiHelpers';

export type { Periodo };

const periodoService = {
  async getByAnio(idAnioElectivo: string): Promise<Periodo[]> {
    const qs = new URLSearchParams({ idAnioElectivo });
    return apiGet<Periodo[]>(`${ENDPOINTS.docente.periodo}?${qs}`);
  },

  async updateEstado(id: string, estado: PeriodoEstado): Promise<void> {
    return apiVoidPatch<{ estado: PeriodoEstado }>(`${ENDPOINTS.docente.periodo}/${id}/estado`, { estado });
  },
};

export default periodoService;
