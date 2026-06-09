import React, { useState } from 'react';
import { useAniosElectivos } from '../../hooks/useAnioElectivo';
import { usePeriodosByAnio, useUpdatePeriodoEstado } from '../../hooks/usePeriodo';
import type { Periodo } from '../../types/periodo';
import { PeriodoEstado } from '../../types/periodo';

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

function EstadoBadge({ estado }: { estado: PeriodoEstado }) {
  const base = 'inline-block px-2 py-0.5 rounded-full text-xs font-semibold';
  return estado === PeriodoEstado.ACTIVO ? (
    <span className={`${base} bg-green-100 text-green-700`}>Activo</span>
  ) : (
    <span className={`${base} bg-gray-100 text-gray-600`}>Cerrado</span>
  );
}

interface ModalEditarProps {
  periodo: Periodo;
  onClose: () => void;
  onSubmit: (estado: PeriodoEstado) => void;
  isPending: boolean;
}

function ModalEditar({ periodo, onClose, onSubmit, isPending }: ModalEditarProps) {
  const [estado, setEstado] = useState<PeriodoEstado>(periodo.estado);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">Editar estado</h2>
        <p className="text-sm text-gray-500 mb-4">Periodo {periodo.numeroPeriodo}</p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as PeriodoEstado)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={PeriodoEstado.ACTIVO}>Activo</option>
            <option value={PeriodoEstado.CERRADO}>Cerrado</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => onSubmit(estado)}
            className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPending ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────

export default function PeriodosAdminPage() {
  const [idAnioSeleccionado, setIdAnioSeleccionado] = useState<string>('');
  const [editando, setEditando] = useState<Periodo | null>(null);

  const { data: anios, isLoading: loadingAnios } = useAniosElectivos();
  const { data: periodos, isLoading: loadingPeriodos, isError } = usePeriodosByAnio(
    idAnioSeleccionado || undefined
  );
  const updateMutation = useUpdatePeriodoEstado(idAnioSeleccionado);

  const handleEditar = async (estado: PeriodoEstado) => {
    if (!editando) return;
    await updateMutation.mutateAsync({ id: editando.id, estado });
    setEditando(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Periodos</h1>
        <p className="text-sm text-gray-500 mt-0.5">Filtra por año electivo y edita el estado de cada periodo.</p>
      </div>

      {/* Filtro */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">Año electivo</label>
        <select
          value={idAnioSeleccionado}
          onChange={(e) => setIdAnioSeleccionado(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
        >
          <option value="">Seleccionar año</option>
          {loadingAnios ? (
            <option disabled>Cargando...</option>
          ) : (
            anios?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.anio}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {!idAnioSeleccionado ? (
          <div className="p-10 text-center text-sm text-gray-400">
            Selecciona un año electivo para ver sus periodos.
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-red-500">Error al cargar los periodos.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Periodo</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Estado</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingPeriodos ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : !periodos?.length ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-gray-400">
                    No hay periodos registrados para este año.
                  </td>
                </tr>
              ) : (
                periodos.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">Periodo {p.numeroPeriodo}</td>
                    <td className="px-6 py-4">
                      <EstadoBadge estado={p.estado} />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setEditando(p)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Editar estado
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {editando && (
        <ModalEditar
          periodo={editando}
          onClose={() => setEditando(null)}
          onSubmit={handleEditar}
          isPending={updateMutation.isPending}
        />
      )}
    </div>
  );
}
