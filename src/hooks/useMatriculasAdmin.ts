import { useQuery } from '@tanstack/react-query';
import matriculasAdminService from '../services/matriculasAdminService';
import type { EstudianteAdminFilters } from '../types/matriculasAdmin';

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
