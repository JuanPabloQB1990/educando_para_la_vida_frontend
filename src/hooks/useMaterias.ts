import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import materiaService from '../services/materiaService';

const QK = 'materias';

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { data?: { error?: { message?: string } } } };
    return e.response?.data?.error?.message ?? fallback;
  }
  return fallback;
}

export function useMaterias() {
  return useQuery({ queryKey: [QK], queryFn: materiaService.getAll });
}

export function useCreateMateria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ nombreMateria, abreviatura }: { nombreMateria: string; abreviatura: string }) =>
      materiaService.create(nombreMateria, abreviatura),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Materia creada exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al crear la materia'));
    },
  });
}

export function useUpdateMateria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nombreMateria, abreviatura }: { id: string; nombreMateria: string; abreviatura: string }) =>
      materiaService.update(id, nombreMateria, abreviatura),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Materia actualizada exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al actualizar la materia'));
    },
  });
}

export function useDeleteMateria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => materiaService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Materia eliminada exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al eliminar la materia'));
    },
  });
}
