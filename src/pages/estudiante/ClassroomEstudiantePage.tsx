import { useState, useMemo, useRef } from 'react';
import { useTareasEstudiante, useAdjuntosByTarea } from '../../hooks/useClassroomTarea';
import {
  useEntregasEstudiante,
  useCreateEntregaEstudiante,
  useUploadAdjuntosEntrega,
  useDeleteAdjuntoEntregaEstudiante,
} from '../../hooks/useClassroomEntrega';
import { usePagosEstudiante } from '../../hooks/usePagosEstudiante';
import { useAniosElectivos } from '../../hooks/useAnioElectivo';
import { usePeriodosByAnio } from '../../hooks/usePeriodo';
import type { ClassroomTarea, ClassroomTareaAdjunto } from '../../types/classroomTarea';
import type { ClassroomEntrega, ClassroomEntregaAdjunto } from '../../types/classroomEntrega';

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

const ESTADO_BADGE: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  aprovado: 'bg-green-100 text-green-700',
  corregido: 'bg-blue-100 text-blue-700',
};
const ESTADO_LABEL: Record<string, string> = {
  pendiente: 'Pendiente revisión',
  aprovado: 'Aprobado',
  corregido: 'Corregido',
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
      <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  );
}

// ─── Adjuntos del profesor ────────────────────────────────────────────────────

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

// ─── Sección de entrega del estudiante ───────────────────────────────────────

interface EntregaSeccionProps {
  tarea: ClassroomTarea;
  entrega: ClassroomEntrega | undefined;
  bloqueado: boolean;
}

function EntregaSeccion({ tarea, entrega, bloqueado }: EntregaSeccionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [adjuntosEntregaId, setAdjuntosEntregaId] = useState<string | null>(entrega?.id ?? null);

  const createEntrega = useCreateEntregaEstudiante();
  const uploadAdjuntos = useUploadAdjuntosEntrega();
  const deleteAdjunto = useDeleteAdjuntoEntregaEstudiante();

  const idEntrega = adjuntosEntregaId ?? entrega?.id;

  // adjuntos de la entrega (solo si ya existe)
  const { data: adjuntosEntrega = [] } = useEntregaAdjuntosLocal(idEntrega);

  const handleCrearEntrega = async () => {
    const res = await createEntrega.mutateAsync(tarea.id);
    setAdjuntosEntregaId(res.id);
  };

  const handleUpload = async () => {
    if (!idEntrega || selectedFiles.length === 0) return;
    await uploadAdjuntos.mutateAsync({ idEntrega, files: selectedFiles });
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (bloqueado) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-red-500 font-medium">
          No puedes entregar tareas mientras tengas obligaciones vencidas.
        </p>
      </div>
    );
  }

  // Sin entrega creada aún
  if (!idEntrega) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-2">Aún no has entregado esta tarea.</p>
        <button
          type="button"
          onClick={handleCrearEntrega}
          disabled={createEntrega.isPending}
          className="w-full text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg py-2 transition"
        >
          {createEntrega.isPending ? 'Registrando…' : 'Iniciar entrega'}
        </button>
      </div>
    );
  }

  const estado = entrega?.estado ?? 'pendiente';

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">Mi entrega</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ESTADO_BADGE[estado] ?? 'bg-gray-100 text-gray-600'}`}>
          {ESTADO_LABEL[estado] ?? estado}
        </span>
      </div>

      {entrega?.observacionProfesor && (
        <div className="bg-blue-50 rounded-lg px-3 py-2">
          <p className="text-xs text-blue-700 font-medium mb-0.5">Observación del profesor</p>
          <p className="text-xs text-blue-600">{entrega.observacionProfesor}</p>
        </div>
      )}

      {/* Adjuntos ya subidos */}
      {adjuntosEntrega.length > 0 && (
        <ul className="space-y-1">
          {adjuntosEntrega.map((adj) => (
            <li key={adj.id} className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
              <a
                href={adj.urlArchivo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:underline truncate"
              >
                <span>{getExtIcon(adj.nombreArchivo)}</span>
                <span className="truncate">{adj.nombreArchivo}</span>
              </a>
              <button
                type="button"
                onClick={() => deleteAdjunto.mutate({ idEntrega: idEntrega!, adjuntoId: adj.id })}
                disabled={deleteAdjunto.isPending}
                className="shrink-0 text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Subir archivos */}
      <div className="space-y-2">
        <p className="text-xs text-gray-400">PDF, JPG, JPEG, PNG, DOCX · Máx. 10 MB</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.docx"
          onChange={(e) => setSelectedFiles(Array.from(e.target.files ?? []))}
          className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {selectedFiles.length > 0 && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploadAdjuntos.isPending}
            className="w-full text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg py-2 transition"
          >
            {uploadAdjuntos.isPending ? 'Subiendo…' : `Subir ${selectedFiles.length} archivo${selectedFiles.length !== 1 ? 's' : ''}`}
          </button>
        )}
      </div>
    </div>
  );
}

// hook local para adjuntos de entrega del estudiante
function useEntregaAdjuntosLocal(idEntrega: string | undefined | null) {
  const { data: adjuntos = [], ...rest } = useAdjuntosByEntregaEstudiante(idEntrega ?? undefined);
  return { data: adjuntos as ClassroomEntregaAdjunto[], ...rest };
}

import { useQuery } from '@tanstack/react-query';
import classroomEntregaService from '../../services/classroomEntregaService';

function useAdjuntosByEntregaEstudiante(idEntrega?: string) {
  return useQuery({
    queryKey: ['classroomEntregaAdjuntosEst', idEntrega],
    queryFn: () => classroomEntregaService.getAdjuntosEstudiante(idEntrega!),
    enabled: !!idEntrega,
  });
}

// ─── Tarjeta de tarea ─────────────────────────────────────────────────────────

interface TareaCardProps {
  tarea: ClassroomTarea;
  entrega: ClassroomEntrega | undefined;
  bloqueado: boolean;
}

function TareaCard({ tarea, entrega, bloqueado }: TareaCardProps) {
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

      <EntregaSeccion tarea={tarea} entrega={entrega} bloqueado={bloqueado} />
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ClassroomEstudiantePage() {
  const [idPeriodoFiltro, setIdPeriodoFiltro] = useState('');

  const { data: tareas = [], isLoading: loadingTareas, isError, error } = useTareasEstudiante();
  const { data: entregas = [] } = useEntregasEstudiante();
  const { data: pagosData } = usePagosEstudiante();
  const { data: anios = [] } = useAniosElectivos();

  const anioActual = useMemo(
    () => anios.find((a) => a.anio === ANIO_ACTUAL) ?? null,
    [anios]
  );

  const { data: periodos = [] } = usePeriodosByAnio(anioActual?.id);

  const entregasByTarea = useMemo(() => {
    const map = new Map<string, ClassroomEntrega>();
    for (const e of entregas) map.set(e.idClassroomTarea, e);
    return map;
  }, [entregas]);

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
            Tienes una o más mensualidades vencidas. No puedes entregar tareas ni subir archivos
            hasta que regularices tu situación de pago.
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
            <TareaCard
              key={tarea.id}
              tarea={tarea}
              entrega={entregasByTarea.get(tarea.id)}
              bloqueado={tieneVencida}
            />
          ))}
        </div>
      )}
    </div>
  );
}
