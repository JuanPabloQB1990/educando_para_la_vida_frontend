import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { pagoAdminService } from '../services/pagoAdminService';
import type { PagoAdminFilters, VerificarPagoDto } from '../types/pago';

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
      const msg = extractErrorMessage(error, 'Error al verificar el comprobante');
      toast.error(msg);
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
