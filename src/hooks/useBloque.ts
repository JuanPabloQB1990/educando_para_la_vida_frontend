import { useQuery } from '@tanstack/react-query';
import bloqueService from '../services/bloqueService';

export function useBloques() {
  return useQuery({ queryKey: ['bloques'], queryFn: bloqueService.getAll });
}
