import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import tiempoValidacionService from '../services/tiempoValidacionService';

const QK = 'tiemposValidacion';

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { data?: { error?: { message?: string } } } };
    return e.response?.data?.error?.message ?? fallback;
  }
  return fallback;
}

export function useTiemposValidacion() {
  return useQuery({ queryKey: [QK], queryFn: tiempoValidacionService.getAll });
}

export function useCreateTiempoValidacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tiempo: number) => tiempoValidacionService.create(tiempo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Tiempo de validación creado exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al crear el tiempo de validación'));
    },
  });
}

export function useUpdateTiempoValidacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tiempo }: { id: string; tiempo: number }) =>
      tiempoValidacionService.update(id, tiempo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Tiempo de validación actualizado exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al actualizar el tiempo de validación'));
    },
  });
}

export function useDeleteTiempoValidacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tiempoValidacionService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Tiempo de validación eliminado exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al eliminar el tiempo de validación'));
    },
  });
}
