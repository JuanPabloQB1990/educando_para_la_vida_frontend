import React, { useState, useMemo } from 'react';
import { usePlanEstudio, useCreatePlanEstudio, useDeletePlanEstudio } from '../../hooks/usePlanEstudio';
import { useGradosEducacion } from '../../hooks/useGradosEducacion';
import { useMaterias } from '../../hooks/useMaterias';
import type { PlanEstudio } from '../../types/planEstudio';

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: i === 3 ? '15%' : '40%' }} />
        </td>
      ))}
    </tr>
  );
}

interface ModalCrearProps {
  onClose: () => void;
  onSubmit: (idGradoEducacion: string, idMateria: string) => void;
  isPending: boolean;
}

function ModalCrear({ onClose, onSubmit, isPending }: ModalCrearProps) {
  const { data: grados } = useGradosEducacion();
  const { data: materias } = useMaterias();
  const [idGrado, setIdGrado] = useState('');
  const [idMateria, setIdMateria] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idGrado || !idMateria) return;
    onSubmit(idGrado, idMateria);
  };

  const selectCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Agregar al plan de estudio</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grado</label>
            <select value={idGrado} onChange={(e) => setIdGrado(e.target.value)} className={selectCls} required>
              <option value="">Seleccionar grado...</option>
              {grados?.map((g) => (
                <option key={g.id} value={g.id}>{g.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Materia</label>
            <select value={idMateria} onChange={(e) => setIdMateria(e.target.value)} className={selectCls} required>
              <option value="">Seleccionar materia...</option>
              {materias?.map((m) => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancelar
            </button>
            <button type="submit" disabled={isPending || !idGrado || !idMateria} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {isPending ? 'Guardando...' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ModalConfirmarProps {
  item: PlanEstudio;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

function ModalConfirmar({ item, onClose, onConfirm, isPending }: ModalConfirmarProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">Confirmar eliminación</h2>
        <p className="text-sm text-gray-600 mb-6">
          ¿Eliminar <span className="font-medium">{item.nombre}</span> del grado{' '}
          <span className="font-medium">{item.nombreGrado}</span>? Esta acción no se puede deshacer.
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

export default function PlanEstudioAdminPage() {
  const [showCrear, setShowCrear] = useState(false);
  const [eliminando, setEliminando] = useState<PlanEstudio | null>(null);
  const [filtroGrado, setFiltroGrado] = useState('');

  const { data: planes, isLoading, isError } = usePlanEstudio();
  const { data: grados } = useGradosEducacion();
  const createMutation = useCreatePlanEstudio();
  const deleteMutation = useDeletePlanEstudio();

  const planesVisibles = useMemo(() => {
    if (!planes) return [];
    if (!filtroGrado) return planes;
    return planes.filter((p) => p.idGradoEducacion === filtroGrado);
  }, [planes, filtroGrado]);

  const handleCrear = async (idGradoEducacion: string, idMateria: string) => {
    await createMutation.mutateAsync({ idGradoEducacion, idMateria });
    setShowCrear(false);
  };

  const handleEliminar = async () => {
    if (!eliminando) return;
    await deleteMutation.mutateAsync(eliminando.id);
    setEliminando(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Plan de Estudio</h1>
          <p className="text-sm text-gray-500 mt-0.5">Asignación de materias por grado educativo.</p>
        </div>
        <button
          onClick={() => setShowCrear(true)}
          className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          + Agregar
        </button>
      </div>

      <div className="mb-4">
        <select
          value={filtroGrado}
          onChange={(e) => setFiltroGrado(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Todos los grados</option>
          {grados?.map((g) => (
            <option key={g.id} value={g.id}>{g.nombre}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        {isError ? (
          <div className="p-8 text-center text-sm text-red-500">Error al cargar el plan de estudio.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Grado</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Materia</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : !planesVisibles.length ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-gray-400">
                    No hay entradas en el plan de estudio.
                  </td>
                </tr>
              ) : (
                planesVisibles.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{p.nombreGrado ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{p.nombreMateria ?? '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setEliminando(p)}
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

      {eliminando && (
        <ModalConfirmar
          item={eliminando}
          onClose={() => setEliminando(null)}
          onConfirm={handleEliminar}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
