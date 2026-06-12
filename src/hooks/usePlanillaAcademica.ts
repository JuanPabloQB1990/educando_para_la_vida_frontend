import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import planillaAcademicaService from '../services/planillaAcademicaService';
import cargaAcademicaService from '../services/cargaAcademicaService';
import actividadService from '../services/actividadService';
import actividadMateriaService from '../services/actividadMateriaService';
import calificacionService from '../services/calificacionService';
import asistenciaService from '../services/asistenciaService';
import autoevaluacionService from '../services/autoevaluacionService';

export function usePlanillaAcademica(params: {
  idGradoEducacion?: string;
  idAnioElectivo?: string;
  idPeriodo?: string;
}) {
  const enabled =
    !!params.idGradoEducacion && !!params.idAnioElectivo && !!params.idPeriodo;

  return useQuery({
    queryKey: ['planillaAcademica', params.idGradoEducacion, params.idAnioElectivo, params.idPeriodo],
    queryFn: () =>
      planillaAcademicaService.get({
        idGradoEducacion: params.idGradoEducacion!,
        idAnioElectivo: params.idAnioElectivo!,
        idPeriodo: params.idPeriodo!,
      }),
    enabled,
  });
}

export function useCargasProfesor(idUsuario?: string, idAnioElectivo?: string) {
  return useQuery({
    queryKey: ['cargasProfesor', idUsuario, idAnioElectivo],
    queryFn: () => cargaAcademicaService.getByProfesor(idUsuario!, idAnioElectivo),
    enabled: !!idUsuario,
  });
}

export function useActividades(idGradoEducacion?: string, idPeriodo?: string) {
  return useQuery({
    queryKey: ['actividades', idGradoEducacion, idPeriodo],
    queryFn: () => actividadService.list(idGradoEducacion!, idPeriodo!),
    enabled: !!idGradoEducacion && !!idPeriodo,
  });
}

export function useActividadMaterias(idActividad?: string) {
  return useQuery({
    queryKey: ['actividadMaterias', idActividad],
    queryFn: () => actividadMateriaService.listByActividad(idActividad!),
    enabled: !!idActividad,
  });
}

export function useUpdateActividad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nombre }: { id: string; nombre: string }) =>
      actividadService.update(id, nombre),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['actividades'] });
      qc.invalidateQueries({ queryKey: ['planillaAcademica'] });
      toast.success('Actividad actualizada.');
    },
    onError: () => {
      toast.error('Error al actualizar la actividad.');
    },
  });
}

export function useCreateActividad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      idPeriodo: string;
      idGradoEducacion: string;
      nombreActividad: string;
    }) => actividadService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['actividades'] });
      qc.invalidateQueries({ queryKey: ['planillaAcademica'] });
      toast.success('Actividad creada.');
    },
    onError: () => {
      toast.error('Error al crear la actividad.');
    },
  });
}

export function useCreateActividadMateria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      idActividad: string;
      idMateria: string;
      idCargaAcademica: string;
    }) => actividadMateriaService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['actividadMaterias'] });
      qc.invalidateQueries({ queryKey: ['planillaAcademica'] });
      toast.success('Materia de actividad guardada.');
    },
    onError: () => {
      toast.error('Error al crear la materia de actividad.');
    },
  });
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  return (error as any)?.response?.data?.error?.message || fallback;
}

export function useCreateCalificacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      idEstudiante: string;
      idActividadMateria: string;
      nota: number;
      observacion?: string;
    }) => calificacionService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['planillaAcademica'] });
      toast.success('Calificación registrada.');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Error al registrar la calificación.'));
    },
  });
}

export function useUpdateCalificacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { nota: number; observacion?: string | null } }) =>
      calificacionService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['planillaAcademica'] });
      toast.success('Calificación actualizada.');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Error al actualizar la calificación.'));
    },
  });
}

export function useUpdateFechaAsistencia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { idActividad: string; fechaActual: string; fechaNueva: string }) =>
      asistenciaService.updateFecha(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['planillaAcademica'] });
      toast.success('Fecha de sesión actualizada.');
    },
    onError: () => {
      toast.error('Error al actualizar la fecha.');
    },
  });
}

export function useUpsertAsistencia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      idEstudiante: string;
      idActividad: string;
      fecha: string;
      estadoAsistencia: string | null;
      observacion?: string | null;
    }) => asistenciaService.upsert(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['planillaAcademica'] });
      toast.success('Asistencia guardada.');
    },
    onError: () => {
      toast.error('Error al guardar la asistencia.');
    },
  });
}

export function useUpsertAutoevaluacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      idEstudiante: string;
      idPeriodo: string;
      idGradoEducacion: string;
      nota: number;
      observacion?: string | null;
    }) => autoevaluacionService.upsert(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['planillaAcademica'] });
      toast.success('Autoevaluación guardada.');
    },
    onError: () => {
      toast.error('Error al guardar la autoevaluación.');
    },
  });
}
