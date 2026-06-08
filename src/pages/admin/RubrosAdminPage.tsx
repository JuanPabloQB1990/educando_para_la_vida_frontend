import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRubrosList, useCreateRubro, useUpdateRubro, useDeleteRubro } from '../../hooks/useRubro';
import type { Rubro } from '../../types/rubro';

const schema = z.object({
  nombre: z.string().min(1, 'Requerido').max(200, 'Máximo 200 caracteres'),
  montoBase: z.number().min(0, 'No puede ser negativo'),
  descripcion: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const inputCls =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

function formatCOP(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(num);
}

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: i === 1 ? '50%' : i === 2 ? '30%' : i === 3 ? '60%' : '20%' }} />
        </td>
      ))}
    </tr>
  );
}

interface ModalFormProps {
  title: string;
  defaultValues?: FormValues;
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
  isPending: boolean;
  submitLabel: string;
}

function ModalForm({ title, defaultValues, onClose, onSubmit, isPending, submitLabel }: ModalFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input {...register('nombre')} className={inputCls} placeholder="Ej: Mensualidad 1° a 5°" autoFocus />
            {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto base (COP)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('montoBase', { valueAsNumber: true })}
              className={inputCls}
              placeholder="Ej: 117000"
            />
            {errors.montoBase && <p className="mt-1 text-xs text-red-500">{errors.montoBase.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-gray-400 font-normal">(opcional)</span></label>
            <textarea
              {...register('descripcion')}
              rows={3}
              className={inputCls}
              placeholder="Descripción del rubro..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {isPending ? 'Guardando...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ModalConfirmarProps {
  nombre: string;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

function ModalConfirmar({ nombre, onClose, onConfirm, isPending }: ModalConfirmarProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">Confirmar eliminación</h2>
        <p className="text-sm text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar el rubro <span className="font-medium">{nombre}</span>?
          Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={isPending} className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
            {isPending ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RubrosAdminPage() {
  const [showCrear, setShowCrear] = useState(false);
  const [editando, setEditando] = useState<Rubro | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const { data: rubros, isLoading, isError } = useRubrosList();
  const createMutation = useCreateRubro();
  const updateMutation = useUpdateRubro();
  const deleteMutation = useDeleteRubro();

  const itemEliminando = rubros?.find((r) => r.id === eliminandoId);

  const handleCrear = async (form: FormValues) => {
    await createMutation.mutateAsync({
      nombre: form.nombre,
      montoBase: form.montoBase,
      descripcion: form.descripcion,
    });
    setShowCrear(false);
  };

  const handleEditar = async (form: FormValues) => {
    if (!editando) return;
    await updateMutation.mutateAsync({
      id: editando.id,
      dto: { nombre: form.nombre, montoBase: form.montoBase, descripcion: form.descripcion },
    });
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
          <h1 className="text-xl font-bold text-gray-900">Rubros</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestión de rubros de pago del sistema.</p>
        </div>
        <button
          onClick={() => setShowCrear(true)}
          className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          + Nuevo rubro
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        {isError ? (
          <div className="p-8 text-center text-sm text-red-500">Error al cargar los rubros.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Monto base</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Descripción</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : !rubros?.length ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                    No hay rubros registrados.
                  </td>
                </tr>
              ) : (
                rubros.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.nombre}</td>
                    <td className="px-4 py-3 text-gray-700">{formatCOP(r.montoBase)}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{r.descripcion ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => setEditando(r)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setEliminandoId(r.id)}
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
        <ModalForm
          title="Nuevo rubro"
          onClose={() => setShowCrear(false)}
          onSubmit={handleCrear}
          isPending={createMutation.isPending}
          submitLabel="Crear"
        />
      )}

      {editando && (
        <ModalForm
          title="Editar rubro"
          defaultValues={{
            nombre: editando.nombre,
            montoBase: editando.montoBase ? parseFloat(editando.montoBase) : 0,
            descripcion: editando.descripcion ?? '',
          }}
          onClose={() => setEditando(null)}
          onSubmit={handleEditar}
          isPending={updateMutation.isPending}
          submitLabel="Guardar cambios"
        />
      )}

      {eliminandoId && itemEliminando && (
        <ModalConfirmar
          nombre={itemEliminando.nombre}
          onClose={() => setEliminandoId(null)}
          onConfirm={handleEliminar}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
