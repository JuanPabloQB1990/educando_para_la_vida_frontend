import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import matriculasAdminService from '../services/matriculasAdminService';
import type { EstudianteAdminFilters } from '../types/matriculasAdmin';

function extractError(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { data?: { error?: { message?: string } } } };
    return e.response?.data?.error?.message ?? fallback;
  }
  return fallback;
}

export function useEstudiantesMatriculados(filters: EstudianteAdminFilters) {
  return useQuery({
    queryKey: ['estudiantesMatriculados', filters],
    queryFn: () => matriculasAdminService.getAll(filters),
  });
}

export function useDetalleEstudiante(idEstudiante: string | undefined) {
  return useQuery({
    queryKey: ['detalleEstudiante', idEstudiante],
    queryFn: () => matriculasAdminService.getDetalle(idEstudiante!),
    enabled: !!idEstudiante,
  });
}

export function useHistorialMatricula(idEstudiante: string | undefined) {
  return useQuery({
    queryKey: ['historialMatricula', idEstudiante],
    queryFn: () => matriculasAdminService.getHistorial(idEstudiante!),
    enabled: !!idEstudiante,
  });
}

export function usePatchMatriculaEstudio(idEstudiante: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, idTipoEstudio, idTiempoValidacion }: { id: string; idTipoEstudio: string; idTiempoValidacion: string | null }) =>
      matriculasAdminService.patchMatriculaEstudio(id, idTipoEstudio, idTiempoValidacion),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['historialMatricula', idEstudiante] });
      toast.success('Matrícula actualizada');
    },
    onError: (error: unknown) => toast.error(extractError(error, 'Error al actualizar la matrícula')),
  });
}

export function useAddGrado(idEstudiante: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idEstudianteMatricula, idGradoEducacion }: { idEstudianteMatricula: string; idGradoEducacion: string }) =>
      matriculasAdminService.addGrado(idEstudianteMatricula, idGradoEducacion),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['historialMatricula', idEstudiante] });
      toast.success('Grado agregado');
    },
    onError: (error: unknown) => toast.error(extractError(error, 'Error al agregar el grado')),
  });
}

export function useRemoveGrado(idEstudiante: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idEstudianteMatricula, idGradoEducacion }: { idEstudianteMatricula: string; idGradoEducacion: string }) =>
      matriculasAdminService.removeGrado(idEstudianteMatricula, idGradoEducacion),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['historialMatricula', idEstudiante] });
      toast.success('Grado eliminado');
    },
    onError: (error: unknown) => toast.error(extractError(error, 'Error al eliminar el grado')),
  });
}

export function useObligacionesMatricula(idEstudianteMatricula: string) {
  return useQuery({
    queryKey: ['obligacionesMatricula', idEstudianteMatricula],
    queryFn: () => matriculasAdminService.getObligacionesMatricula(idEstudianteMatricula),
    enabled: !!idEstudianteMatricula,
  });
}

export function useUpdateGradoEstado(idEstudiante: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idEstudianteMatricula, idGradoEducacion, estado }: { idEstudianteMatricula: string; idGradoEducacion: string; estado: string }) =>
      matriculasAdminService.updateGradoEstado(idEstudianteMatricula, idGradoEducacion, estado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['historialMatricula', idEstudiante] });
      toast.success('Estado actualizado');
    },
    onError: (error: unknown) => toast.error(extractError(error, 'Error al actualizar el estado')),
  });
}
