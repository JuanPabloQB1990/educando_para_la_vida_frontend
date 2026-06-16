import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import classroomEntregaService from '../services/classroomEntregaService';
import type { UpdateEstadoEntregaDto } from '../types/classroomEntrega';

const QK = 'classroomEntregas';
const QK_ADJ = 'classroomEntregaAdjuntos';

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { data?: { error?: { message?: string } } } };
    return e.response?.data?.error?.message ?? fallback;
  }
  return fallback;
}

export function useEntregasByCarga(idCargaAcademica?: string, idPeriodo?: string) {
  return useQuery({
    queryKey: [QK, idCargaAcademica, idPeriodo ?? ''],
    queryFn: () => classroomEntregaService.listByCarga(idCargaAcademica!, idPeriodo),
    enabled: !!idCargaAcademica,
  });
}

export function useAdjuntosByEntrega(idEntrega?: string) {
  return useQuery({
    queryKey: [QK_ADJ, idEntrega],
    queryFn: () => classroomEntregaService.getAdjuntos(idEntrega!),
    enabled: !!idEntrega,
  });
}

export function useUpdateEstadoEntrega(idCargaAcademica: string, idPeriodo?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEstadoEntregaDto }) =>
      classroomEntregaService.updateEstado(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK, idCargaAcademica, idPeriodo ?? ''] });
      toast.success('Estado de entrega actualizado.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al actualizar el estado.'));
    },
  });
}

const QK_EST = 'classroomEntregasEstudiante';

export function useEntregasEstudiante() {
  return useQuery({
    queryKey: [QK_EST],
    queryFn: () => classroomEntregaService.listForEstudiante(),
  });
}

export function useCreateEntregaEstudiante() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idClassroomTarea: string) => classroomEntregaService.createForEstudiante(idClassroomTarea),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK_EST] });
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al registrar la entrega.'));
    },
  });
}

export function useUploadAdjuntosEntrega() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idEntrega, files }: { idEntrega: string; files: File[] }) =>
      classroomEntregaService.uploadAdjuntos(idEntrega, files),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [QK_ADJ, vars.idEntrega] });
      toast.success('Archivos subidos correctamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al subir los archivos.'));
    },
  });
}

export function useDeleteAdjuntoEntregaEstudiante() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idEntrega, adjuntoId }: { idEntrega: string; adjuntoId: string }) =>
      classroomEntregaService.deleteAdjuntoEstudiante(idEntrega, adjuntoId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [QK_ADJ, vars.idEntrega] });
      toast.success('Archivo eliminado.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al eliminar el archivo.'));
    },
  });
}
