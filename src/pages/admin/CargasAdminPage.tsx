import React, { useState, useMemo } from 'react';
import { useCargasAcademicas, useCreateCargaAcademica, useDeleteCargaAcademica } from '../../hooks/useCargaAcademica';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useGradosEducacion } from '../../hooks/useGradosEducacion';
import { useMaterias } from '../../hooks/useMaterias';
import { useAniosElectivos } from '../../hooks/useAnioElectivo';
import type { CargaAcademica } from '../../types/cargaAcademica';

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: i === 5 ? '15%' : '40%' }} />
        </td>
      ))}
    </tr>
  );
}

interface ModalCrearProps {
  onClose: () => void;
  onSubmit: (data: { idUsuario: string; idMateria: string; idGradoEducacion: string; idAnioElectivo: string }) => void;
  isPending: boolean;
}

function ModalCrear({ onClose, onSubmit, isPending }: ModalCrearProps) {
  const { data: usuarios } = useUsuarios();
  const { data: grados } = useGradosEducacion();
  const { data: materias } = useMaterias();
  const { data: anios } = useAniosElectivos();

  const profesores = useMemo(
    () => (usuarios ?? []).filter((u) => u.nombreRol === 'profesor'),
    [usuarios]
  );

  const [idUsuario, setIdUsuario] = useState('');
  const [idMateria, setIdMateria] = useState('');
  const [idGradoEducacion, setIdGradoEducacion] = useState('');
  const [idAnioElectivo, setIdAnioElectivo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idUsuario || !idMateria || !idGradoEducacion || !idAnioElectivo) return;
    onSubmit({ idUsuario, idMateria, idGradoEducacion, idAnioElectivo });
  };

  const selectCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const allFilled = idUsuario && idMateria && idGradoEducacion && idAnioElectivo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Agregar carga académica</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profesor</label>
            <select value={idUsuario} onChange={(e) => setIdUsuario(e.target.value)} className={selectCls} required>
              <option value="">Seleccionar profesor...</option>
              {profesores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombres} {p.apellido1}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grado</label>
            <select value={idGradoEducacion} onChange={(e) => setIdGradoEducacion(e.target.value)} className={selectCls} required>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año electivo</label>
            <select value={idAnioElectivo} onChange={(e) => setIdAnioElectivo(e.target.value)} className={selectCls} required>
              <option value="">Seleccionar año...</option>
              {anios?.map((a) => (
                <option key={a.id} value={a.id}>{a.anio}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || !allFilled}
              className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ModalConfirmarProps {
  item: CargaAcademica;
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
          ¿Eliminar la carga de <span className="font-medium">{item.nombre}</span> ({item.nombreGrado ?? '—'}) asignada a{' '}
          <span className="font-medium">{item.nombreUsuario}</span>? Esta acción no se puede deshacer.
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

export default function CargasAdminPage() {
  const [showCrear, setShowCrear] = useState(false);
  const [eliminando, setEliminando] = useState<CargaAcademica | null>(null);
  const [filtroProfesor, setFiltroProfesor] = useState('');
  const [filtroAnio, setFiltroAnio] = useState('');

  const { data: cargas, isLoading, isError } = useCargasAcademicas();
  const { data: usuarios } = useUsuarios();
  const { data: anios } = useAniosElectivos();
  const createMutation = useCreateCargaAcademica();
  const deleteMutation = useDeleteCargaAcademica();

  const profesores = useMemo(
    () => (usuarios ?? []).filter((u) => u.nombreRol === 'profesor'),
    [usuarios]
  );

  const cargasVisibles = useMemo(() => {
    if (!cargas) return [];
    return cargas.filter((c) => {
      if (filtroProfesor && c.idUsuario !== filtroProfesor) return false;
      if (filtroAnio && c.idAnioElectivo !== filtroAnio) return false;
      return true;
    });
  }, [cargas, filtroProfesor, filtroAnio]);

  const handleCrear = async (data: { idUsuario: string; idMateria: string; idGradoEducacion: string; idAnioElectivo: string }) => {
    await createMutation.mutateAsync(data);
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
          <h1 className="text-xl font-bold text-gray-900">Cargas Académicas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Asignación de materias y grados a profesores.</p>
        </div>
        <button
          onClick={() => setShowCrear(true)}
          className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          + Agregar
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filtroProfesor}
          onChange={(e) => setFiltroProfesor(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Todos los profesores</option>
          {profesores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombres} {p.apellido1}
            </option>
          ))}
        </select>
        <select
          value={filtroAnio}
          onChange={(e) => setFiltroAnio(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Todos los años</option>
          {anios?.map((a) => (
            <option key={a.id} value={a.id}>{a.anio}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        {isError ? (
          <div className="p-8 text-center text-sm text-red-500">Error al cargar las cargas académicas.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Profesor</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Grado</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Materia</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Año</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : !cargasVisibles.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    No hay cargas académicas registradas.
                  </td>
                </tr>
              ) : (
                cargasVisibles.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">{c.nombreUsuario ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{c.nombreGrado ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{c.nombre ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{c.anio ?? '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setEliminando(c)}
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
