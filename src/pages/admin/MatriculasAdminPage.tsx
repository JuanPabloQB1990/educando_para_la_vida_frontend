import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEstudiantesMatriculados } from '../../hooks/useMatriculasAdmin';
import type { EstudianteAdminFilters, EstudianteAdmin } from '../../types/matriculasAdmin';

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

function EstadoBadge({ estado }: { estado: EstudianteAdmin['usuarioEstado'] }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
        estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}
    >
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
}

const EMPTY_FILTERS: EstudianteAdminFilters = {
  noDocumento: '',
  padreCedula: '',
  madreCedula: '',
  acudienteCedula: '',
  conObligacionVencida: false,
};

export default function MatriculasAdminPage() {
  const [draft, setDraft] = useState<EstudianteAdminFilters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<EstudianteAdminFilters>({});

  const { data = [], isLoading, isError } = useEstudiantesMatriculados(applied);

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    const active: EstudianteAdminFilters = {};
    if (draft.noDocumento) active.noDocumento = draft.noDocumento;
    if (draft.padreCedula) active.padreCedula = draft.padreCedula;
    if (draft.madreCedula) active.madreCedula = draft.madreCedula;
    if (draft.acudienteCedula) active.acudienteCedula = draft.acudienteCedula;
    if (draft.conObligacionVencida) active.conObligacionVencida = true;
    setApplied(active);
  }

  function handleClear() {
    setDraft(EMPTY_FILTERS);
    setApplied({});
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Estudiantes Matriculados</h1>

      {/* Filtros */}
      <form
        onSubmit={handleFilter}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">N° documento estudiante</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Buscar por documento..."
              value={draft.noDocumento ?? ''}
              onChange={(e) => setDraft((p) => ({ ...p, noDocumento: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cédula padre</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Cédula del padre..."
              value={draft.padreCedula ?? ''}
              onChange={(e) => setDraft((p) => ({ ...p, padreCedula: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cédula madre</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Cédula de la madre..."
              value={draft.madreCedula ?? ''}
              onChange={(e) => setDraft((p) => ({ ...p, madreCedula: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cédula acudiente</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Cédula del acudiente..."
              value={draft.acudienteCedula ?? ''}
              onChange={(e) => setDraft((p) => ({ ...p, acudienteCedula: e.target.value }))}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={draft.conObligacionVencida ?? false}
              onChange={(e) => setDraft((p) => ({ ...p, conObligacionVencida: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-400"
            />
            <span className="text-sm text-gray-700 font-medium">Solo estudiantes con obligaciones vencidas</span>
          </label>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            Limpiar
          </button>
        </div>
      </form>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Documento</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Contacto</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Perfil</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Matrículas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

            {isError && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-red-500 text-sm">
                  Error al cargar los estudiantes. Intenta de nuevo.
                </td>
              </tr>
            )}

            {!isLoading && !isError && data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                  No se encontraron estudiantes matriculados.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              data.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {[e.usuarioNombres, e.usuarioApellido1, e.usuarioApellido2].filter(Boolean).join(' ')}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{e.usuarioNoDocumento ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{e.usuarioEmail ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{e.usuarioContacto1 ?? '—'}</td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={e.usuarioEstado} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      to={`${e.id}/detalle`}
                      className="inline-block text-blue-600 hover:text-blue-800 text-xs font-medium underline underline-offset-2"
                    >
                      Ver perfil
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      to={`${e.id}/historial`}
                      className="inline-block text-indigo-600 hover:text-indigo-800 text-xs font-medium underline underline-offset-2"
                    >
                      Ver matrículas
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {!isLoading && !isError && data.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            {data.length} estudiante{data.length !== 1 ? 's' : ''} encontrado{data.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
