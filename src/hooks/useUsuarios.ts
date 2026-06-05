import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { usuarioService } from '../services/usuarioService';
import type { CreateUsuarioDto, UpdateUsuarioDto } from '../types/usuario';

const QK = 'usuarios';

export function useUsuarios() {
  return useQuery({
    queryKey: [QK],
    queryFn: () => usuarioService.getAll(),
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => usuarioService.getRoles(),
    staleTime: 1000 * 60 * 30,
  });
}

export function useTiposDocumento() {
  return useQuery({
    queryKey: ['tiposDocumento'],
    queryFn: () => usuarioService.getTiposDocumento(),
    staleTime: 1000 * 60 * 30,
  });
}

export function useCreateUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUsuarioDto) => usuarioService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al crear el usuario'));
    },
  });
}

export function useUpdateUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUsuarioDto }) =>
      usuarioService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Usuario actualizado exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al actualizar el usuario'));
    },
  });
}

export function useDeleteUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usuarioService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Usuario eliminado exitosamente.');
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Error al eliminar el usuario'));
    },
  });
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { data?: { error?: { message?: string } } } };
    return e.response?.data?.error?.message ?? fallback;
  }
  return fallback;
}
