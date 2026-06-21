import { ENDPOINTS } from '../config';
import type { Materia } from '../types/materia';
import { apiGet, apiPost, apiPut, apiVoidDelete } from '../utils/apiHelpers';

const materiaService = {
  async getAll(): Promise<Materia[]> {
    return apiGet<Materia[]>(ENDPOINTS.catalogo.materia);
  },

  async create(nombreMateria: string, abreviatura: string): Promise<Materia> {
    return apiPost<Materia, { nombreMateria: string; abreviatura: string }>(
      ENDPOINTS.catalogo.materia,
      { nombreMateria, abreviatura }
    );
  },

  async update(id: string, nombreMateria: string, abreviatura: string): Promise<Materia> {
    return apiPut<Materia, { nombreMateria: string; abreviatura: string }>(
      `${ENDPOINTS.catalogo.materia}/${id}`,
      { nombreMateria, abreviatura }
    );
  },

  async remove(id: string): Promise<void> {
    return apiVoidDelete(`${ENDPOINTS.catalogo.materia}/${id}`);
  },
};

export default materiaService;
