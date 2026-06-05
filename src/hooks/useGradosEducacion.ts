import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import gradoEducacionService from '../services/gradoEducacionService';

const QK = 'gradosEducacion';

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { data?: { error?: { message?: string } } } };
    return e.response?.data?.error?.message ?? fallback;
  }
  return fallback;
}

export function useGradosEducacion() {
  return useQuery({ queryKey: [QK], queryFn: gradoEducacionService.getAll });
}

export function useCreateGradoEducacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nombre: string) => gradoEducacionService.create(nombre),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Grado creado exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al crear el grado'));
    },
  });
}

export function useUpdateGradoEducacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nombre }: { id: string; nombre: string }) =>
      gradoEducacionService.update(id, nombre),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Grado actualizado exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al actualizar el grado'));
    },
  });
}

export function useDeleteGradoEducacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gradoEducacionService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Grado eliminado exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al eliminar el grado'));
    },
  });
}
