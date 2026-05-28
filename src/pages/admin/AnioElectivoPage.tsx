import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useAniosElectivos,
  useCreateAnioElectivo,
  useUpdateAnioElectivo,
  useDeleteAnioElectivo,
} from '../../hooks/useAnioElectivo';
import type { AnioElectivo } from '../../types/anioElectivo';

// ─── Schemas ────────────────────────────────────────────────────────────────
const crearSchema = z.object({
  anio: z
    .number()
    .int('Debe ser un número entero')
    .min(2000, 'Año inválido')
    .max(2100, 'Año inválido'),
});

const editarSchema = z.object({
  estado: z.enum(['activo', 'cerrado']),
});

type CrearForm = z.infer<typeof crearSchema>;
type EditarForm = z.infer<typeof editarSchema>;

// ─── Subcomponentes ──────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3].map((i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
        </td>
      ))}
    </tr>
  );
}

function EstadoBadge({ estado }: { estado: AnioElectivo['estado'] }) {
  const base = 'inline-block px-2 py-0.5 rounded-full text-xs font-semibold';
  return estado === 'activo' ? (
    <span className={`${base} bg-green-100 text-green-700`}>Activo</span>
  ) : (
    <span className={`${base} bg-gray-100 text-gray-600`}>Cerrado</span>
  );
}

interface ModalCrearProps {
  onClose: () => void;
  onSubmit: (data: CrearForm) => void;
  isPending: boolean;
}

function ModalCrear({ onClose, onSubmit, isPending }: ModalCrearProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CrearForm>({
    resolver: zodResolver(crearSchema),
    defaultValues: { anio: new Date().getFullYear() },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Nuevo año electivo</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <input
              type="number"
              {...register('anio', { valueAsNumber: true })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.anio && <p className="mt-1 text-xs text-red-500">{errors.anio.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
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
  anio: AnioElectivo;
  onClose: () => void;
  onSubmit: (data: EditarForm) => void;
  isPending: boolean;
}

function ModalEditar({ anio, onClose, onSubmit, isPending }: ModalEditarProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditarForm>({
    resolver: zodResolver(editarSchema),
    defaultValues: { estado: anio.estado },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">Editar estado</h2>
        <p className="text-sm text-gray-500 mb-4">Año {anio.anio}</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              {...register('estado')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="activo">Activo</option>
              <option value="cerrado">Cerrado</option>
            </select>
            {errors.estado && <p className="mt-1 text-xs text-red-500">{errors.estado.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
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
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ModalConfirmarProps {
  texto: string;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

function ModalConfirmar({ texto, onClose, onConfirm, isPending }: ModalConfirmarProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">Confirmar acción</h2>
        <p className="text-sm text-gray-600 mb-6">{texto}</p>
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

// ─── Página principal ────────────────────────────────────────────────────────
export default function AnioElectivoPage() {
  const [showCrear, setShowCrear] = useState(false);
  const [editando, setEditando] = useState<AnioElectivo | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const { data: anios, isLoading, isError } = useAniosElectivos();
  const createMutation = useCreateAnioElectivo();
  const updateMutation = useUpdateAnioElectivo();
  const deleteMutation = useDeleteAnioElectivo();

  const handleCrear = async (form: CrearForm) => {
    await createMutation.mutateAsync({ anio: form.anio, estado: 'activo' });
    setShowCrear(false);
  };

  const handleEditar = async (form: EditarForm) => {
    if (!editando) return;
    await updateMutation.mutateAsync({
      id: editando.idAnioElectivo,
      data: { anio: editando.anio, estado: form.estado },
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
          <h1 className="text-xl font-bold text-gray-900">Años Electivos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Al crear un año se generan 4 periodos automáticamente.
          </p>
        </div>
        <button
          onClick={() => setShowCrear(true)}
          className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          + Nuevo año electivo
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isError ? (
          <div className="p-8 text-center text-sm text-red-500">
            Error al cargar los años electivos.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Año</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Estado</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : !anios?.length ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-gray-400">
                    No hay años electivos registrados.
                  </td>
                </tr>
              ) : (
                anios.map((a) => (
                  <tr key={a.idAnioElectivo} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{a.anio}</td>
                    <td className="px-6 py-4">
                      <EstadoBadge estado={a.estado} />
                    </td>
                    <td className="px-6 py-4 flex gap-3">
                      <button
                        onClick={() => setEditando(a)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Editar estado
                      </button>
                      <button
                        onClick={() => setEliminandoId(a.idAnioElectivo)}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        Eliminar
                      </button>
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
          anio={editando}
          onClose={() => setEditando(null)}
          onSubmit={handleEditar}
          isPending={updateMutation.isPending}
        />
      )}

      {eliminandoId && (
        <ModalConfirmar
          texto="¿Estás seguro de que deseas eliminar este año electivo? Esta acción también eliminará los periodos asociados."
          onClose={() => setEliminandoId(null)}
          onConfirm={handleEliminar}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
