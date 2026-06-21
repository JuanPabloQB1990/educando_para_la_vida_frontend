import { ENDPOINTS } from '../config';
import type { Bloque } from '../types/bloque';
import { apiGet } from '../utils/apiHelpers';

const bloqueService = {
  async getAll(): Promise<Bloque[]> {
    return apiGet<Bloque[]>(ENDPOINTS.academico.bloque);
  },
};

export default bloqueService;
