import http from './http';
import type { PlanillaAcademica } from '../types/planillaAcademica';

const planillaAcademicaService = {
  async get(params: {
    idGradoEducacion: string;
    idAnioElectivo: string;
    idPeriodo: string;
  }): Promise<PlanillaAcademica> {
    const res = await http.get('/docente/planilla_academica', { params });
    return res.data.data;
  },
};

export default planillaAcademicaService;
