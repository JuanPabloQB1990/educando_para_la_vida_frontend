import http from './http';
import type { PagoAdmin, PagoAdminFilters, VerificarPagoDto } from '../types/pago';
import type { Rubro } from '../types/rubro';

export const pagoAdminService = {
  async getPagosAdmin(filters: PagoAdminFilters = {}): Promise<PagoAdmin[]> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined)
    );
    const res = await http.get<{ success: boolean; data: PagoAdmin[] }>('/gestion/pago/admin', { params });
    return res.data.data;
  },

  async verificar(id: string, dto: VerificarPagoDto): Promise<void> {
    await http.patch(`/gestion/pago/${id}/verificar`, dto);
  },

  async getRubros(): Promise<Rubro[]> {
    const res = await http.get<{ success: boolean; data: Rubro[] }>('/gestion/rubro');
    return res.data.data;
  },
};
