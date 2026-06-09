import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import planillaAcademicaService from '../services/planillaAcademicaService';
import cargaAcademicaService from '../services/cargaAcademicaService';
import actividadService from '../services/actividadService';
import actividadMateriaService from '../services/actividadMateriaService';
import calificacionService from '../services/calificacionService';
import asistenciaService from '../services/asistenciaService';

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

export function useCreateActividad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      idPeriodo: string;
      idGradoEducacion: string;
      nombreActividad: string;
      semana: number;
      descripcion?: string;
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
      nombreActividad: string;
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
    onError: () => {
      toast.error('Error al registrar la calificación.');
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
      estadoAsistencia: string;
      observacion?: string;
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
