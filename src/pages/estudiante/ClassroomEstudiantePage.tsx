import React, { useState, useMemo } from 'react';
import { useTareasEstudiante, useAdjuntosByTarea } from '../../hooks/useClassroomTarea';
import { usePagosEstudiante } from '../../hooks/usePagosEstudiante';
import { useAniosElectivos } from '../../hooks/useAnioElectivo';
import { usePeriodosByAnio } from '../../hooks/usePeriodo';
import type { ClassroomTarea, ClassroomTareaAdjunto } from '../../types/classroomTarea';

const ANIO_ACTUAL = new Date().getFullYear();

function formatFecha(val: string): string {
  const clean = val.split('T')[0];
  const [anio, mes, dia] = clean.split('-').map(Number);
  return new Date(anio, mes - 1, dia).toLocaleDateString('es', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function esFechaVencida(val: string): boolean {
  return new Date(val.split('T')[0]) < new Date(new Date().toISOString().split('T')[0]);
}

function getExtIcon(nombre: string): string {
  const ext = nombre.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return '📄';
  if (['jpg', 'jpeg', 'png'].includes(ext)) return '🖼️';
  if (ext === 'docx') return '📝';
  return '📎';
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
      <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  );
}

interface AdjuntosProps {
  idTarea: string;
  bloqueado: boolean;
}

function AdjuntosTarea({ idTarea, bloqueado }: AdjuntosProps) {
  const { data: adjuntos = [], isLoading } = useAdjuntosByTarea(idTarea);

  if (bloqueado) {
    return (
      <p className="text-xs text-red-500 mt-2">
        Tienes una mensualidad vencida. No puedes ver ni descargar los archivos.
      </p>
    );
  }

  if (isLoading) return <p className="text-xs text-gray-400 mt-2">Cargando archivos…</p>;

  if (adjuntos.length === 0) return <p className="text-xs text-gray-400 mt-2">Sin archivos adjuntos.</p>;

  return (
    <ul className="mt-2 space-y-1">
      {adjuntos.map((adj: ClassroomTareaAdjunto) => (
        <li key={adj.id}>
          <a
            href={adj.urlArchivo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:underline"
          >
            <span>{getExtIcon(adj.nombreArchivo)}</span>
            <span>{adj.nombreArchivo}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

interface TareaCardProps {
  tarea: ClassroomTarea;
  bloqueado: boolean;
}

function TareaCard({ tarea, bloqueado }: TareaCardProps) {
  const [verAdjuntos, setVerAdjuntos] = useState(false);
  const vencida = esFechaVencida(tarea.fechaLimite);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-800 truncate">{tarea.titulo}</h3>
          <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-gray-500">
            {tarea.nombreMateria && <span>{tarea.nombreMateria}</span>}
            {tarea.nombreGrado && <span>· {tarea.nombreGrado}</span>}
            {tarea.numeroPeriodo != null && <span>· Período {tarea.numeroPeriodo}</span>}
          </div>
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded ${
            vencida ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {vencida ? 'Vencida' : 'Activa'}
        </span>
      </div>

      <p className="mt-3 text-xs text-gray-600 leading-relaxed">{tarea.instrucciones}</p>

      <p className="mt-2 text-xs text-gray-400">
        Fecha límite:{' '}
        <span className="font-medium text-gray-600">{formatFecha(tarea.fechaLimite)}</span>
      </p>

      <button
        onClick={() => setVerAdjuntos((v) => !v)}
        className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
      >
        {verAdjuntos ? 'Ocultar archivos' : 'Ver archivos del profesor'}
      </button>

      {verAdjuntos && <AdjuntosTarea idTarea={tarea.id} bloqueado={bloqueado} />}
    </div>
  );
}

export default function ClassroomEstudiantePage() {
  const [idPeriodoFiltro, setIdPeriodoFiltro] = useState('');

  const { data: tareas = [], isLoading: loadingTareas, isError, error } = useTareasEstudiante();
  const { data: pagosData } = usePagosEstudiante();
  const { data: anios = [] } = useAniosElectivos();

  const anioActual = useMemo(
    () => anios.find((a) => a.anio === ANIO_ACTUAL) ?? null,
    [anios]
  );

  const { data: periodos = [] } = usePeriodosByAnio(anioActual?.id);

  const tareasFiltradas = useMemo(() => {
    if (!idPeriodoFiltro) return tareas;
    return tareas.filter((t) => t.idPeriodo === idPeriodoFiltro);
  }, [tareas, idPeriodoFiltro]);

  const tieneVencida = (pagosData?.obligaciones ?? []).some(
    (ob) => ob.estadoObligacion === 'vencido'
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Classroom</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tareas asignadas a tu grado</p>
        </div>

        {periodos.length > 0 && (
          <select
            value={idPeriodoFiltro}
            onChange={(e) => setIdPeriodoFiltro(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos los períodos</option>
            {periodos.map((p) => (
              <option key={p.id} value={p.id}>
                Período {p.numeroPeriodo}
              </option>
            ))}
          </select>
        )}
      </div>

      {tieneVencida && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <span className="text-red-500 text-lg shrink-0">⚠️</span>
          <p className="text-sm text-red-700">
            Tienes una o más mensualidades vencidas. No puedes ver ni descargar los archivos de
            actividades hasta que regularices tu situación de pago.
          </p>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700">
            {(error as any)?.response?.data?.error?.message ?? 'Error al cargar las tareas.'}
          </p>
        </div>
      )}

      {loadingTareas ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((k) => (
            <SkeletonCard key={k} />
          ))}
        </div>
      ) : tareasFiltradas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-400">
            {idPeriodoFiltro
              ? 'No hay tareas para el período seleccionado.'
              : 'No hay tareas asignadas a tu grado.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tareasFiltradas.map((tarea: ClassroomTarea) => (
            <TareaCard key={tarea.id} tarea={tarea} bloqueado={tieneVencida} />
          ))}
        </div>
      )}
    </div>
  );
}
