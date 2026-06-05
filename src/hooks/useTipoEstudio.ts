import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import tipoEstudioService from '../services/tipoEstudioService';

const QK = 'tiposEstudio';

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { data?: { error?: { message?: string } } } };
    return e.response?.data?.error?.message ?? fallback;
  }
  return fallback;
}

export function useTiposEstudio() {
  return useQuery({ queryKey: [QK], queryFn: tipoEstudioService.getAll });
}

export function useCreateTipoEstudio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nombre: string) => tipoEstudioService.create(nombre),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Tipo de estudio creado exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al crear el tipo de estudio'));
    },
  });
}

export function useUpdateTipoEstudio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nombre }: { id: string; nombre: string }) =>
      tipoEstudioService.update(id, nombre),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Tipo de estudio actualizado exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al actualizar el tipo de estudio'));
    },
  });
}

export function useDeleteTipoEstudio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tipoEstudioService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Tipo de estudio eliminado exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al eliminar el tipo de estudio'));
    },
  });
}
