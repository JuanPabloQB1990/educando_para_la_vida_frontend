import { useQuery } from '@tanstack/react-query';
import pagosEstudianteService from '../services/pagosEstudianteService';

export function usePagosEstudiante() {
  return useQuery({
    queryKey: ['pagosEstudiante'],
    queryFn: () => pagosEstudianteService.getPagos(),
  });
}
