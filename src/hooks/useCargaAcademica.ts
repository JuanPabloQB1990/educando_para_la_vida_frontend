import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import cargaAcademicaService from '../services/cargaAcademicaService';

const QK = 'cargasAcademicas';

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { data?: { error?: { message?: string } } } };
    return e.response?.data?.error?.message ?? fallback;
  }
  return fallback;
}

export function useCargasAcademicas() {
  return useQuery({ queryKey: [QK], queryFn: cargaAcademicaService.getAll });
}

export function useCreateCargaAcademica() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      idUsuario: string;
      idMateria: string;
      idGradoEducacion: string;
      idAnioElectivo: string;
    }) => cargaAcademicaService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Carga académica agregada.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al agregar la carga académica'));
    },
  });
}

export function useDeleteCargaAcademica() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cargaAcademicaService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Carga académica eliminada.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al eliminar la carga académica'));
    },
  });
}
