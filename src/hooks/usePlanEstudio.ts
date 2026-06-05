import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import planEstudioService from '../services/planEstudioService';

const QK = 'planEstudio';

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { data?: { error?: { message?: string } } } };
    return e.response?.data?.error?.message ?? fallback;
  }
  return fallback;
}

export function usePlanEstudio() {
  return useQuery({ queryKey: [QK], queryFn: planEstudioService.getAll });
}

export function useCreatePlanEstudio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idGradoEducacion, idMateria }: { idGradoEducacion: string; idMateria: string }) =>
      planEstudioService.create(idGradoEducacion, idMateria),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Plan de estudio agregado.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al agregar el plan de estudio'));
    },
  });
}

export function useDeletePlanEstudio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => planEstudioService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Entrada eliminada del plan de estudio.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al eliminar'));
    },
  });
}
