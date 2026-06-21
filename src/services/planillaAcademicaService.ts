import { ENDPOINTS } from '../config';
import type { PlanillaAcademica } from '../types/planillaAcademica';
import { apiGet } from '../utils/apiHelpers';

const planillaAcademicaService = {
  async get(params: {
    idGradoEducacion: string;
    idAnioElectivo: string;
    idPeriodo: string;
  }): Promise<PlanillaAcademica> {
    const qs = new URLSearchParams(params);
    return apiGet<PlanillaAcademica>(`${ENDPOINTS.docente.planillaAcademica}?${qs}`);
  },
};

export default planillaAcademicaService;
