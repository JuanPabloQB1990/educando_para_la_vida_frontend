import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { anioElectivoService } from '../services/anioElectivoService';
import type { CreateAnioElectivoDto, UpdateAnioElectivoDto } from '../types/anioElectivo';

const QK = 'aniosElectivos';

export function useAniosElectivos() {
  return useQuery({
    queryKey: [QK],
    queryFn: () => anioElectivoService.getAll(),
  });
}

export function useCreateAnioElectivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAnioElectivoDto) => anioElectivoService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Año electivo creado. Se generaron 4 periodos automáticamente.');
    },
    onError: (error: unknown) => {
      const msg = extractErrorMessage(error, 'Error al crear el año electivo');
      toast.error(msg);
    },
  });
}

export function useUpdateAnioElectivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnioElectivoDto }) =>
      anioElectivoService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Estado actualizado correctamente.');
    },
    onError: (error: unknown) => {
      const msg = extractErrorMessage(error, 'Error al actualizar el año electivo');
      toast.error(msg);
    },
  });
}

export function useDeleteAnioElectivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => anioElectivoService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Año electivo eliminado.');
    },
    onError: (error: unknown) => {
      const msg = extractErrorMessage(error, 'Error al eliminar el año electivo');
      toast.error(msg);
    },
  });
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { data?: { error?: { message?: string } } } };
    return e.response?.data?.error?.message ?? fallback;
  }
  return fallback;
}
