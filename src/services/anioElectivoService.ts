import http from './http';
import type { AnioElectivo, CreateAnioElectivoDto, UpdateAnioElectivoDto } from '../types/anioElectivo';

export const anioElectivoService = {
  async getAll(): Promise<AnioElectivo[]> {
    const res = await http.get<{ success: boolean; data: AnioElectivo[] }>('/gestion/anio_electivo');
    return res.data.data;
  },

  async create(data: CreateAnioElectivoDto): Promise<string> {
    const res = await http.post<{ success: boolean; data: string }>('/gestion/anio_electivo', data);
    return res.data.data;
  },

  async update(id: string, data: UpdateAnioElectivoDto): Promise<AnioElectivo> {
    const res = await http.put<{ success: boolean; data: AnioElectivo }>(`/gestion/anio_electivo/${id}`, data);
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/gestion/anio_electivo/${id}`);
  },
};
