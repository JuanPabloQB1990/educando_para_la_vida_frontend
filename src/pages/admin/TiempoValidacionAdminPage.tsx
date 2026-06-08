import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useTiemposValidacion,
  useCreateTiempoValidacion,
  useUpdateTiempoValidacion,
  useDeleteTiempoValidacion,
} from '../../hooks/useTiempoValidacion';
import type { TiempoValidacion } from '../../types/tiempoValidacion';

const schema = z.object({
  tiempo: z.number().int('Debe ser un número entero').min(1, 'Mínimo 1 mes').max(120, 'Máximo 120 meses'),
});
type FormValues = z.infer<typeof schema>;

const inputCls =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

function SkeletonRow() {
  return (
    <tr>
      {[1, 2].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: i === 1 ? '40%' : '20%' }} />
        </td>
      ))}
    </tr>
  );
}

interface ModalCrearProps {
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
  isPending: boolean;
}

function ModalCrear({ onClose, onSubmit, isPending }: ModalCrearProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Nuevo tiempo de validación</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de meses</label>
            <input
              type="number"
              {...register('tiempo', { valueAsNumber: true })}
              className={inputCls}
              placeholder="Ej: 9"
              autoFocus
            />
            {errors.tiempo && <p className="mt-1 text-xs text-red-500">{errors.tiempo.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isPending ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ModalEditarProps {
  item: TiempoValidacion;
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
  isPending: boolean;
}

function ModalEditar({ item, onClose, onSubmit, isPending }: ModalEditarProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tiempo: item.tiempo },
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Editar tiempo de validación</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de meses</label>
            <input
              type="number"
              {...register('tiempo', { valueAsNumber: true })}
              className={inputCls}
            />
            {errors.tiempo && <p className="mt-1 text-xs text-red-500">{errors.tiempo.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ModalConfirmarProps {
  tiempo: number;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

function ModalConfirmar({ tiempo, onClose, onConfirm, isPending }: ModalConfirmarProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">Confirmar eliminación</h2>
        <p className="text-sm text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar el tiempo de validación de{' '}
          <span className="font-medium">{tiempo} meses</span>? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TiempoValidacionAdminPage() {
  const [showCrear, setShowCrear] = useState(false);
  const [editando, setEditando] = useState<TiempoValidacion | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const { data: tiempos, isLoading, isError } = useTiemposValidacion();
  const createMutation = useCreateTiempoValidacion();
  const updateMutation = useUpdateTiempoValidacion();
  const deleteMutation = useDeleteTiempoValidacion();

  const itemEliminando = tiempos?.find((t) => t.id === eliminandoId);

  const handleCrear = async (form: FormValues) => {
    await createMutation.mutateAsync(form.tiempo);
    setShowCrear(false);
  };

  const handleEditar = async (form: FormValues) => {
    if (!editando) return;
    await updateMutation.mutateAsync({ id: editando.id, tiempo: form.tiempo });
    setEditando(null);
  };

  const handleEliminar = async () => {
    if (!eliminandoId) return;
    await deleteMutation.mutateAsync(eliminandoId);
    setEliminandoId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tiempos de Validación</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestión de tiempos de validación en meses.</p>
        </div>
        <button
          onClick={() => setShowCrear(true)}
          className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          + Nuevo tiempo
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        {isError ? (
          <div className="p-8 text-center text-sm text-red-500">Error al cargar los tiempos de validación.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Meses</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : !tiempos?.length ? (
                <tr>
                  <td colSpan={2} className="px-6 py-10 text-center text-gray-400">
                    No hay tiempos de validación registrados.
                  </td>
                </tr>
              ) : (
                tiempos.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{t.tiempo} meses</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => setEditando(t)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setEliminandoId(t.id)}
                          className="text-red-500 hover:text-red-700 font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showCrear && (
        <ModalCrear
          onClose={() => setShowCrear(false)}
          onSubmit={handleCrear}
          isPending={createMutation.isPending}
        />
      )}

      {editando && (
        <ModalEditar
          item={editando}
          onClose={() => setEditando(null)}
          onSubmit={handleEditar}
          isPending={updateMutation.isPending}
        />
      )}

      {eliminandoId && itemEliminando && (
        <ModalConfirmar
          tiempo={itemEliminando.tiempo}
          onClose={() => setEliminandoId(null)}
          onConfirm={handleEliminar}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
