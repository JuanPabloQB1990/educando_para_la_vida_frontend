import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import direccionGradoService, { type CreateDireccionGradoDto } from '../services/direccionGradoService';

const QK = 'direccionesGrado';

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { data?: { error?: { message?: string } } } };
    return e.response?.data?.error?.message ?? fallback;
  }
  return fallback;
}

export function useDireccionesGrado() {
  return useQuery({ queryKey: [QK], queryFn: direccionGradoService.getAll });
}

export function useDireccionesGradoByProfesor(idUsuario?: string, idAnioElectivo?: string) {
  return useQuery({
    queryKey: [QK, 'profesor', idUsuario, idAnioElectivo ?? ''],
    queryFn: () => direccionGradoService.getByProfesor(idUsuario!, idAnioElectivo),
    enabled: !!idUsuario,
  });
}

export function useUpdateLinkClaseVirtual(idUsuario?: string, idAnioElectivo?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, link }: { id: string; link: string }) =>
      direccionGradoService.updateLink(id, link),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK, 'profesor', idUsuario, idAnioElectivo ?? ''] });
      toast.success('Link de clase virtual actualizado.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al actualizar el link.'));
    },
  });
}

export function useCreateDireccionGrado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDireccionGradoDto) => direccionGradoService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Director de grado asignado exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al asignar director de grado'));
    },
  });
}

export function useUpdateDireccionGrado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateDireccionGradoDto }) =>
      direccionGradoService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Director de grado actualizado exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al actualizar director de grado'));
    },
  });
}

export function useDireccionGradoEstudiante() {
  return useQuery({
    queryKey: [QK, 'estudiante'],
    queryFn: () => direccionGradoService.getForEstudiante(),
  });
}

export function useDeleteDireccionGrado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => direccionGradoService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Director de grado eliminado exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al eliminar director de grado'));
    },
  });
}
