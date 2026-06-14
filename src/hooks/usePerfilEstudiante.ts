import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import perfilEstudianteService from '../services/perfilEstudianteService';

const QK = 'perfilEstudiante';

function extractError(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { data?: { error?: { message?: string } } } };
    return e.response?.data?.error?.message ?? fallback;
  }
  return fallback;
}

export function usePerfilEstudiante() {
  return useQuery({
    queryKey: [QK],
    queryFn: () => perfilEstudianteService.getPerfil(),
  });
}

export function useUpdatePerfilEstudiante() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => perfilEstudianteService.updatePerfil(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Datos actualizados exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, 'Error al actualizar los datos.'));
    },
  });
}

export function useUpdateArchivoEstudiante() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ campo, file }: { campo: string; file: File }) =>
      perfilEstudianteService.updateArchivo(campo, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Archivo actualizado exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, 'Error al actualizar el archivo.'));
    },
  });
}
