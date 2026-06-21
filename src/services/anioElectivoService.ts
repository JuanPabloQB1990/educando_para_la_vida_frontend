import { ENDPOINTS } from '../config';
import type { AnioElectivo, CreateAnioElectivoDto, UpdateAnioElectivoDto } from '../types/anioElectivo';
import { apiGet, apiPost, apiPut, apiVoidDelete } from '../utils/apiHelpers';

export const anioElectivoService = {
  async getAll(): Promise<AnioElectivo[]> {
    return apiGet<AnioElectivo[]>(ENDPOINTS.gestion.anioElectivo);
  },

  async create(data: CreateAnioElectivoDto): Promise<string> {
    return apiPost<string, CreateAnioElectivoDto>(ENDPOINTS.gestion.anioElectivo, data);
  },

  async update(id: string, data: UpdateAnioElectivoDto): Promise<AnioElectivo> {
    return apiPut<AnioElectivo, UpdateAnioElectivoDto>(`${ENDPOINTS.gestion.anioElectivo}/${id}`, data);
  },

  async remove(id: string): Promise<void> {
    return apiVoidDelete(`${ENDPOINTS.gestion.anioElectivo}/${id}`);
  },
};
