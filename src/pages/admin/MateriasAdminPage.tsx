import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMaterias, useCreateMateria, useUpdateMateria, useDeleteMateria } from '../../hooks/useMaterias';
import type { Materia } from '../../types/materia';

const schema = z.object({
  nombreMateria: z.string().min(1, 'Requerido').max(255, 'Máximo 255 caracteres'),
  abreviatura: z.string().min(1, 'Requerido').max(255, 'Máximo 255 caracteres'),
});
type FormValues = z.infer<typeof schema>;

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

// ─── Skeletons ───────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: i === 1 ? '60%' : i === 2 ? '20%' : '15%' }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Modal Crear ─────────────────────────────────────────────────────────────
interface ModalCrearProps {
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
  isPending: boolean;
}

function ModalCrear({ onClose, onSubmit, isPending }: ModalCrearProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Nueva materia</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la materia</label>
            <input {...register('nombreMateria')} className={inputCls} placeholder="Ej: Matemáticas" autoFocus />
            {errors.nombreMateria && <p className="mt-1 text-xs text-red-500">{errors.nombreMateria.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Abreviatura</label>
            <input {...register('abreviatura')} className={inputCls} placeholder="Ej: MAT" />
            {errors.abreviatura && <p className="mt-1 text-xs text-red-500">{errors.abreviatura.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {isPending ? 'Creando...' : 'Crear materia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal Editar ─────────────────────────────────────────────────────────────
interface ModalEditarProps {
  materia: Materia;
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
  isPending: boolean;
}

function ModalEditar({ materia, onClose, onSubmit, isPending }: ModalEditarProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombreMateria: materia.nombre, abreviatura: materia.abreviatura },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Editar materia</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la materia</label>
            <input {...register('nombreMateria')} className={inputCls} />
            {errors.nombreMateria && <p className="mt-1 text-xs text-red-500">{errors.nombreMateria.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Abreviatura</label>
            <input {...register('abreviatura')} className={inputCls} />
            {errors.abreviatura && <p className="mt-1 text-xs text-red-500">{errors.abreviatura.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal Confirmar Eliminar ─────────────────────────────────────────────────
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
          ¿Estás seguro de que deseas eliminar la materia <span className="font-medium">{nombre}</span>?
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

// ─── Página principal ────────────────────────────────────────────────────────
export default function MateriasAdminPage() {
  const [showCrear, setShowCrear] = useState(false);
  const [editando, setEditando] = useState<Materia | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const { data: materias, isLoading, isError } = useMaterias();
  const createMutation = useCreateMateria();
  const updateMutation = useUpdateMateria();
  const deleteMutation = useDeleteMateria();

  const materiaEliminando = materias?.find((m) => m.id === eliminandoId);

  const handleCrear = async (form: FormValues) => {
    await createMutation.mutateAsync({ nombreMateria: form.nombreMateria, abreviatura: form.abreviatura });
    setShowCrear(false);
  };

  const handleEditar = async (form: FormValues) => {
    if (!editando) return;
    await updateMutation.mutateAsync({ id: editando.id, nombreMateria: form.nombreMateria, abreviatura: form.abreviatura });
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
          <h1 className="text-xl font-bold text-gray-900">Materias</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestión de materias académicas del sistema.</p>
        </div>
        <button
          onClick={() => setShowCrear(true)}
          className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          + Nueva materia
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        {isError ? (
          <div className="p-8 text-center text-sm text-red-500">Error al cargar las materias.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Abreviatura</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : !materias?.length ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-gray-400">
                    No hay materias registradas.
                  </td>
                </tr>
              ) : (
                materias.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{m.nombre}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{m.abreviatura}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => setEditando(m)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setEliminandoId(m.id)}
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
          materia={editando}
          onClose={() => setEditando(null)}
          onSubmit={handleEditar}
          isPending={updateMutation.isPending}
        />
      )}

      {eliminandoId && materiaEliminando && (
        <ModalConfirmar
          nombre={materiaEliminando.nombre}
          onClose={() => setEliminandoId(null)}
          onConfirm={handleEliminar}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
