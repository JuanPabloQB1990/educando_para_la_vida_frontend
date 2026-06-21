import { ENDPOINTS } from '../config';
import { apiGet } from '../utils/apiHelpers';

export interface DashboardStats {
  pagosPendientes: number;
  obligacionesVencidas: number;
  anioElectivoActivo: number | null;
  totalEstudiantes: number;
  totalIngresos: number;
}

const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return apiGet<DashboardStats>(ENDPOINTS.gestion.dashboardStats);
  },
};

export default dashboardService;
