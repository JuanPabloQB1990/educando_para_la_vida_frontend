import { useQuery } from '@tanstack/react-query';
import dashboardService from '../services/dashboardService';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => dashboardService.getStats(),
    staleTime: 30_000,
  });
}
