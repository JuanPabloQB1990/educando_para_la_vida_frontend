import { ENDPOINTS } from '../config';
import type { Rubro } from '../types/rubro';
import { apiGet, apiPost, apiPut, apiVoidDelete } from '../utils/apiHelpers';

export interface RubroDto {
  nombre: string;
  montoBase: number;
  descripcion?: string;
}

const rubroService = {
  async getAll(): Promise<Rubro[]> {
    return apiGet<Rubro[]>(ENDPOINTS.gestion.rubro);
  },

  async create(dto: RubroDto): Promise<Rubro> {
    return apiPost<Rubro, RubroDto>(ENDPOINTS.gestion.rubro, dto);
  },

  async update(id: string, dto: RubroDto): Promise<Rubro> {
    return apiPut<Rubro, RubroDto>(`${ENDPOINTS.gestion.rubro}/${id}`, dto);
  },

  async remove(id: string): Promise<void> {
    return apiVoidDelete(`${ENDPOINTS.gestion.rubro}/${id}`);
  },
};

export default rubroService;
