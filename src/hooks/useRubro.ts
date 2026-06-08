import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import rubroService from '../services/rubroService';
import type { RubroDto } from '../services/rubroService';

const QK = 'rubros';

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { data?: { error?: { message?: string } } } };
    return e.response?.data?.error?.message ?? fallback;
  }
  return fallback;
}

export function useRubrosList() {
  return useQuery({ queryKey: [QK], queryFn: rubroService.getAll });
}

export function useCreateRubro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: RubroDto) => rubroService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Rubro creado exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al crear el rubro'));
    },
  });
}

export function useUpdateRubro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: RubroDto }) => rubroService.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Rubro actualizado exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al actualizar el rubro'));
    },
  });
}

export function useDeleteRubro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rubroService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Rubro eliminado exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al eliminar el rubro'));
    },
  });
}
