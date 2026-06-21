import { ENDPOINTS } from '../config';
import type { PagosEstudianteData } from '../types/pagosEstudiante';
import { apiGet, apiVoidPost } from '../utils/apiHelpers';

const pagosEstudianteService = {
  async getPagos(): Promise<PagosEstudianteData> {
    return apiGet<PagosEstudianteData>(ENDPOINTS.estudiante.pagos);
  },

  async subirComprobante(idObligacionPago: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('idObligacionPago', idObligacionPago);
    formData.append('comprobante', file);
    return apiVoidPost<FormData>(ENDPOINTS.estudiante.pagosComprobante, formData);
  },
};

export default pagosEstudianteService;
