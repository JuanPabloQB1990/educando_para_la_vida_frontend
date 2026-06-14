import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import classroomTareaService from '../services/classroomTareaService';
import type { CreateClassroomTareaDto, UpdateClassroomTareaDto } from '../types/classroomTarea';

const QK_ADJUNTOS = 'classroomAdjuntos';

const QK = 'classroomTareas';

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { data?: { error?: { message?: string } } } };
    return e.response?.data?.error?.message ?? fallback;
  }
  return fallback;
}

export function useTareasByCarga(idCargaAcademica?: string) {
  return useQuery({
    queryKey: [QK, idCargaAcademica],
    queryFn: () => classroomTareaService.listByCarga(idCargaAcademica!),
    enabled: !!idCargaAcademica,
  });
}

export function useCreateTarea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClassroomTareaDto) => classroomTareaService.create(data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [QK, vars.idCargaAcademica] });
      toast.success('Tarea creada correctamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al crear la tarea.'));
    },
  });
}

export function useUpdateTarea(idCargaAcademica: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClassroomTareaDto }) =>
      classroomTareaService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK, idCargaAcademica] });
      toast.success('Tarea actualizada.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al actualizar la tarea.'));
    },
  });
}

export function useDeleteTarea(idCargaAcademica: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => classroomTareaService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK, idCargaAcademica] });
      toast.success('Tarea eliminada.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al eliminar la tarea.'));
    },
  });
}

export function useAdjuntosByTarea(idTarea?: string) {
  return useQuery({
    queryKey: [QK_ADJUNTOS, idTarea],
    queryFn: () => classroomTareaService.getAdjuntos(idTarea!),
    enabled: !!idTarea,
  });
}

export function useUploadAdjuntos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idTarea, files }: { idTarea: string; files: File[] }) =>
      classroomTareaService.uploadAdjuntos(idTarea, files),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [QK_ADJUNTOS, vars.idTarea] });
      toast.success('Documentos subidos correctamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al subir los documentos.'));
    },
  });
}

export function useDeleteAdjunto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idTarea, adjuntoId }: { idTarea: string; adjuntoId: string }) =>
      classroomTareaService.removeAdjunto(idTarea, adjuntoId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [QK_ADJUNTOS, vars.idTarea] });
      toast.success('Documento eliminado.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al eliminar el documento.'));
    },
  });
}
