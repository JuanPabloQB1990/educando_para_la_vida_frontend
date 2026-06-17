import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { pagoAdminService } from '../services/pagoAdminService';
import { extractApiError } from '../utils/extractApiError';
import type { PagoAdminFilters, VerificarPagoDto, MatricularAnioDto, GradoMatriculado, ObligacionPagoEstudiante } from '../types/pago';

const QK_PAGOS = 'pagosAdmin';
const QK_RUBROS = 'rubros';

export function usePagosAdmin(filters: PagoAdminFilters) {
  return useQuery({
    queryKey: [QK_PAGOS, filters],
    queryFn: () => pagoAdminService.getPagosAdmin(filters),
  });
}

export function useRubros() {
  return useQuery({
    queryKey: [QK_RUBROS],
    queryFn: () => pagoAdminService.getRubros(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useVerificarPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: VerificarPagoDto }) =>
      pagoAdminService.verificar(id, dto),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [QK_PAGOS] });
      const accion = variables.dto.accion === 'aprobado' ? 'aprobado' : 'rechazado';
      toast.success(`Comprobante ${accion} exitosamente.`);
    },
    onError: (error: unknown) => {
      const msg = extractApiError(error, 'Error al verificar el comprobante');
      toast.error(msg);
    },
  });
}

export function useGradosByMatricula(idEstudianteMatricula: string | null) {
  return useQuery<GradoMatriculado[]>({
    queryKey: ['gradosByMatricula', idEstudianteMatricula],
    queryFn: () => pagoAdminService.getGradosByMatricula(idEstudianteMatricula!),
    enabled: !!idEstudianteMatricula,
  });
}

export function useObligacionesByMatricula(idEstudianteMatricula: string | null) {
  return useQuery<ObligacionPagoEstudiante[]>({
    queryKey: ['obligacionesByMatricula', idEstudianteMatricula],
    queryFn: () => pagoAdminService.getObligacionesByMatricula(idEstudianteMatricula!),
    enabled: !!idEstudianteMatricula,
  });
}

export function useMatricularAnio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: MatricularAnioDto }) =>
      pagoAdminService.matricularAnio(id, dto),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [QK_PAGOS] });
      qc.invalidateQueries({ queryKey: ['obligacionesByMatricula', variables.id] });
      toast.success('Obligaciones de pago creadas exitosamente.');
    },
    onError: (error: unknown) => {
      const msg = extractApiError(error, 'Error al matricular al estudiante');
      toast.error(msg);
    },
  });
}

export function useEstudianteMatricula(id: string | null) {
  return useQuery({
    queryKey: ['estudianteMatricula', id],
    queryFn: () => pagoAdminService.getEstudianteMatricula(id!),
    enabled: !!id,
  });
}

export function useUpdateEstudianteMatricula() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { id_tipo_estudio?: string | null; id_tiempo_validacion?: string | null } }) =>
      pagoAdminService.updateEstudianteMatricula(id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['estudianteMatricula', variables.id] });
      toast.success('Matrícula actualizada exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractApiError(error, 'Error al actualizar la matrícula'));
    },
  });
}

export function useCreateGradoPorMatricula() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id_estudiante_matricula: string; id_grado_educacion: string; estado: string }) =>
      pagoAdminService.createGradoPorMatricula(data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['gradosByMatricula', variables.id_estudiante_matricula] });
      toast.success('Grado agregado exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractApiError(error, 'Error al agregar el grado'));
    },
  });
}

export function useUpdateGradoPorMatricula() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idEstudianteMatricula, idGradoEducacion, estado }: { idEstudianteMatricula: string; idGradoEducacion: string; estado: string }) =>
      pagoAdminService.updateGradoPorMatricula(idEstudianteMatricula, idGradoEducacion, estado),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['gradosByMatricula', variables.idEstudianteMatricula] });
      toast.success('Estado del grado actualizado.');
    },
    onError: (error: unknown) => {
      toast.error(extractApiError(error, 'Error al actualizar el grado'));
    },
  });
}

export function useDeleteGradoPorMatricula() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idEstudianteMatricula, idGradoEducacion }: { idEstudianteMatricula: string; idGradoEducacion: string }) =>
      pagoAdminService.deleteGradoPorMatricula(idEstudianteMatricula, idGradoEducacion),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['gradosByMatricula', variables.idEstudianteMatricula] });
      toast.success('Grado eliminado.');
    },
    onError: (error: unknown) => {
      toast.error(extractApiError(error, 'Error al eliminar el grado'));
    },
  });
}

export function useEliminarObligacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; idEstudianteMatricula: string }) =>
      pagoAdminService.deleteObligacion(id),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['obligacionesByMatricula', variables.idEstudianteMatricula] });
      toast.success('Obligación eliminada.');
    },
    onError: (error: unknown) => {
      const msg = extractApiError(error, 'Error al eliminar la obligación');
      toast.error(msg);
    },
  });
}
