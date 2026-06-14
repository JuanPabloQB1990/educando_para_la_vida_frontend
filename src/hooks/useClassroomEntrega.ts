import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import classroomEntregaService from '../services/classroomEntregaService';
import type { UpdateEstadoEntregaDto } from '../types/classroomEntrega';

const QK = 'classroomEntregas';
const QK_ADJ = 'classroomEntregaAdjuntos';

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { data?: { error?: { message?: string } } } };
    return e.response?.data?.error?.message ?? fallback;
  }
  return fallback;
}

export function useEntregasByCarga(idCargaAcademica?: string, idPeriodo?: string) {
  return useQuery({
    queryKey: [QK, idCargaAcademica, idPeriodo ?? ''],
    queryFn: () => classroomEntregaService.listByCarga(idCargaAcademica!, idPeriodo),
    enabled: !!idCargaAcademica,
  });
}

export function useAdjuntosByEntrega(idEntrega?: string) {
  return useQuery({
    queryKey: [QK_ADJ, idEntrega],
    queryFn: () => classroomEntregaService.getAdjuntos(idEntrega!),
    enabled: !!idEntrega,
  });
}

export function useUpdateEstadoEntrega(idCargaAcademica: string, idPeriodo?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEstadoEntregaDto }) =>
      classroomEntregaService.updateEstado(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK, idCargaAcademica, idPeriodo ?? ''] });
      toast.success('Estado de entrega actualizado.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al actualizar el estado.'));
    },
  });
}
