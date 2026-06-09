import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import periodoService from '../services/periodoService';
import type { PeriodoEstado } from '../types/periodo';

export function usePeriodosByAnio(idAnioElectivo?: string) {
  return useQuery({
    queryKey: ['periodos', idAnioElectivo],
    queryFn: () => periodoService.getByAnio(idAnioElectivo!),
    enabled: !!idAnioElectivo,
  });
}

export function useUpdatePeriodoEstado(idAnioElectivo: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: PeriodoEstado }) =>
      periodoService.updateEstado(id, estado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['periodos', idAnioElectivo] });
      toast.success('Estado del periodo actualizado.');
    },
    onError: () => {
      toast.error('Error al actualizar el estado del periodo.');
    },
  });
}
