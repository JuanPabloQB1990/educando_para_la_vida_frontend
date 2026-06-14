import React, { useState, useMemo, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAniosElectivos } from '../../hooks/useAnioElectivo';
import { usePeriodosByAnio } from '../../hooks/usePeriodo';
import { useCargasProfesor } from '../../hooks/usePlanillaAcademica';
import {
  useTareasByCarga,
  useCreateTarea,
  useUpdateTarea,
  useDeleteTarea,
  useAdjuntosByTarea,
  useUploadAdjuntos,
  useDeleteAdjunto,
} from '../../hooks/useClassroomTarea';
import type { Periodo } from '../../types/periodo';
import type { ClassroomTarea, ClassroomTareaAdjunto } from '../../types/classroomTarea';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFecha(fechaStr: string): string {
  const clean = fechaStr.split('T')[0];
  const [anio, mes, dia] = clean.split('-').map(Number);
  const d = new Date(anio, mes - 1, dia);
  return d.toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' });
}

function esFechaVencida(fecha: string): boolean {
  return new Date(fecha.split('T')[0]) < new Date(new Date().toISOString().split('T')[0]);
}

function getExtIcon(nombre: string): string {
  const ext = nombre.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return '📄';
  if (['jpg', 'jpeg', 'png'].includes(ext)) return '🖼️';
  if (ext === 'docx') return '📝';
  return '📎';
}

// ─── Modal: Nueva Tarea ───────────────────────────────────────────────────────

interface ModalNuevaTareaProps {
  idCargaAcademica: string;
  idPeriodoPreseleccionado: string;
  periodos: Periodo[];
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: {
    idCargaAcademica: string;
    idPeriodo: string;
    titulo: string;
    instrucciones: string;
    fechaLimite: string;
  }) => Promise<void>;
}

function ModalNuevaTarea({
  idCargaAcademica,
  idPeriodoPreseleccionado,
  periodos,
  isPending,
  onClose,
  onSubmit,
}: ModalNuevaTareaProps) {
  const [titulo, setTitulo] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [idPeriodo, setIdPeriodo] = useState(idPeriodoPreseleccionado);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !instrucciones.trim() || !fechaLimite || !idPeriodo) return;
    await onSubmit({ idCargaAcademica, idPeriodo, titulo: titulo.trim(), instrucciones: instrucciones.trim(), fechaLimite });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Nueva Tarea</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!idPeriodoPreseleccionado && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Período *</label>
              <select
                value={idPeriodo}
                onChange={(e) => setIdPeriodo(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Seleccionar período</option>
                {periodos.map((p) => (
                  <option key={p.id} value={p.id}>Período {p.numeroPeriodo}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              autoFocus
              placeholder="Ej: Taller de comprensión lectora"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instrucciones *</label>
            <textarea
              value={instrucciones}
              onChange={(e) => setInstrucciones(e.target.value)}
              required
              rows={4}
              placeholder="Describe las instrucciones de la tarea..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite *</label>
            <input
              type="date"
              value={fechaLimite}
              onChange={(e) => setFechaLimite(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="px-4 py-2 text-sm text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50">
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal: Editar Tarea ──────────────────────────────────────────────────────

interface ModalEditarTareaProps {
  tarea: ClassroomTarea;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: { titulo: string; instrucciones: string; fechaLimite: string }) => Promise<void>;
}

function ModalEditarTarea({ tarea, isPending, onClose, onSubmit }: ModalEditarTareaProps) {
  const [titulo, setTitulo] = useState(tarea.titulo);
  const [instrucciones, setInstrucciones] = useState(tarea.instrucciones);
  const [fechaLimite, setFechaLimite] = useState(tarea.fechaLimite.split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !instrucciones.trim() || !fechaLimite) return;
    await onSubmit({ titulo: titulo.trim(), instrucciones: instrucciones.trim(), fechaLimite });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Editar Tarea</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instrucciones *</label>
            <textarea
              value={instrucciones}
              onChange={(e) => setInstrucciones(e.target.value)}
              required
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite *</label>
            <input
              type="date"
              value={fechaLimite}
              onChange={(e) => setFechaLimite(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="px-4 py-2 text-sm text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50">
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal: Confirmar eliminación ─────────────────────────────────────────────

interface ModalConfirmarEliminarProps {
  titulo: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

function ModalConfirmarEliminar({ titulo, isPending, onClose, onConfirm }: ModalConfirmarEliminarProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">Eliminar tarea</h2>
        <p className="text-sm text-gray-600 mb-4">
          ¿Eliminar la tarea <span className="font-semibold">"{titulo}"</span>? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
            Cancelar
          </button>
          <button
            type="button"
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

// ─── Modal: Gestionar Adjuntos ────────────────────────────────────────────────

interface ModalAdjuntosProps {
  tarea: ClassroomTarea;
  adjuntos: ClassroomTareaAdjunto[];
  isLoadingAdjuntos: boolean;
  isUploading: boolean;
  isDeletingAdjunto: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
  onDeleteAdjunto: (adjuntoId: string) => Promise<void>;
}

function ModalAdjuntos({
  tarea,
  adjuntos,
  isLoadingAdjuntos,
  isUploading,
  isDeletingAdjunto,
  onClose,
  onUpload,
  onDeleteAdjunto,
}: ModalAdjuntosProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(Array.from(e.target.files ?? []));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    await onUpload(selectedFiles);
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Adjuntos</h2>
            <p className="text-xs text-gray-400 mt-0.5">{tarea.titulo}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Lista de adjuntos existentes */}
        <div className="mb-4 space-y-2 max-h-52 overflow-y-auto">
          {isLoadingAdjuntos ? (
            <div className="text-sm text-gray-400 animate-pulse py-2">Cargando adjuntos...</div>
          ) : adjuntos.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">No hay documentos adjuntos aún.</p>
          ) : (
            adjuntos.map((adj) => (
              <div key={adj.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0">{getExtIcon(adj.nombreArchivo)}</span>
                  <a
                    href={adj.urlArchivo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-violet-600 hover:underline truncate"
                    title={adj.nombreArchivo}
                  >
                    {adj.nombreArchivo}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteAdjunto(adj.id)}
                  disabled={isDeletingAdjunto}
                  className="shrink-0 ml-2 text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
                >
                  Eliminar
                </button>
              </div>
            ))
          )}
        </div>

        {/* Subir nuevos archivos */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <label className="block text-sm font-medium text-gray-700">Subir documentos</label>
          <p className="text-xs text-gray-400">Formatos permitidos: PDF, JPG, JPEG, PNG, DOCX. Máximo 10 MB por archivo.</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.docx"
            onChange={handleFileChange}
            className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
          />
          {selectedFiles.length > 0 && (
            <ul className="text-xs text-gray-600 space-y-0.5 pl-1">
              {selectedFiles.map((f, i) => (
                <li key={i} className="truncate">• {f.name}</li>
              ))}
            </ul>
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || selectedFiles.length === 0}
              className="px-4 py-2 text-sm text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50"
            >
              {isUploading ? 'Subiendo...' : `Subir ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tarjeta de Tarea ─────────────────────────────────────────────────────────

interface TareaCardProps {
  tarea: ClassroomTarea;
  onEdit: () => void;
  onDelete: () => void;
  onAdjuntos: () => void;
}

function TareaCard({ tarea, onEdit, onDelete, onAdjuntos }: TareaCardProps) {
  const vencida = esFechaVencida(tarea.fechaLimite);
  const fechaLimiteStr = tarea.fechaLimite.split('T')[0];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-gray-800 leading-snug">{tarea.titulo}</h3>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
            vencida ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
          }`}
        >
          {vencida ? 'Vencida' : 'Activa'}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {tarea.nombreMateria && (
          <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium">
            {tarea.nombreMateria}
          </span>
        )}
        {tarea.nombreGrado && (
          <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
            {tarea.nombreGrado}
          </span>
        )}
        {tarea.numeroPeriodo && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            Período {tarea.numeroPeriodo}
          </span>
        )}
      </div>

      <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{tarea.instrucciones}</p>

      <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className={vencida ? 'text-red-500' : ''}>Límite: {formatFecha(fechaLimiteStr)}</span>
      </div>

      {/* Acciones */}
      <div className="flex gap-2 border-t border-gray-100 pt-3">
        <button
          onClick={onAdjuntos}
          className="flex-1 text-xs text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg px-2 py-1.5 font-medium"
        >
          Adjuntos
        </button>
        <button
          onClick={onEdit}
          className="flex-1 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-2 py-1.5 font-medium"
        >
          Editar
        </button>
        <button
          onClick={onDelete}
          className="flex-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg px-2 py-1.5 font-medium"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ClassroomProfesorPage() {
  const { user } = useAuth();

  const [selectedCarga, setSelectedCarga] = useState('');
  const [selectedPeriodo, setSelectedPeriodo] = useState('');
  const [showModalNuevaTarea, setShowModalNuevaTarea] = useState(false);
  const [editTarea, setEditTarea] = useState<ClassroomTarea | null>(null);
  const [deleteTareaTarget, setDeleteTareaTarget] = useState<ClassroomTarea | null>(null);
  const [adjuntosTarea, setAdjuntosTarea] = useState<ClassroomTarea | null>(null);

  // Año actual
  const anioActual = new Date().getFullYear();
  const { data: anios = [] } = useAniosElectivos();
  const idAnioActual = useMemo(
    () => anios.find((a) => a.anio === anioActual)?.id ?? '',
    [anios, anioActual]
  );

  const { data: periodos = [] } = usePeriodosByAnio(idAnioActual || undefined);
  const { data: cargas = [] } = useCargasProfesor(user?.id, idAnioActual || undefined);
  const { data: tareas = [], isLoading, isError } = useTareasByCarga(selectedCarga || undefined);

  const createTarea = useCreateTarea();
  const updateTarea = useUpdateTarea(selectedCarga);
  const deleteTarea = useDeleteTarea(selectedCarga);
  const uploadAdjuntos = useUploadAdjuntos();
  const deleteAdjunto = useDeleteAdjunto();

  const { data: adjuntos = [], isLoading: isLoadingAdjuntos } = useAdjuntosByTarea(
    adjuntosTarea?.id
  );

  // Filtrado client-side por periodo
  const tareasFiltradas = useMemo(() => {
    if (!selectedPeriodo) return tareas;
    return tareas.filter((t) => t.idPeriodo === selectedPeriodo);
  }, [tareas, selectedPeriodo]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Classroom</h1>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Carga académica</label>
          <select
            value={selectedCarga}
            onChange={(e) => setSelectedCarga(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 min-w-[220px]"
          >
            <option value="">Seleccionar carga</option>
            {cargas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombreMateria} — {c.nombreGrado}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Período (opcional)</label>
          <select
            value={selectedPeriodo}
            onChange={(e) => setSelectedPeriodo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Todos los períodos</option>
            {periodos.map((p) => (
              <option key={p.id} value={p.id}>Período {p.numeroPeriodo}</option>
            ))}
          </select>
        </div>

        {selectedCarga && (
          <button
            onClick={() => setShowModalNuevaTarea(true)}
            className="ml-auto px-4 py-2 text-sm text-white bg-violet-600 rounded-lg hover:bg-violet-700"
          >
            + Nueva Tarea
          </button>
        )}
      </div>

      {/* Estado vacío */}
      {!selectedCarga && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-sm text-gray-400">
          Selecciona una carga académica para ver las tareas.
        </div>
      )}

      {/* Loading skeleton */}
      {selectedCarga && isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full mb-1" />
              <div className="h-3 bg-gray-200 rounded w-5/6 mb-4" />
              <div className="h-8 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {selectedCarga && isError && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-sm text-red-500">
          Error al cargar las tareas. Intenta de nuevo.
        </div>
      )}

      {/* Sin tareas */}
      {selectedCarga && !isLoading && !isError && tareasFiltradas.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-sm text-gray-400">
          No hay tareas registradas{selectedPeriodo ? ' para el período seleccionado' : ''}.
        </div>
      )}

      {/* Grid de tareas */}
      {selectedCarga && !isLoading && !isError && tareasFiltradas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tareasFiltradas.map((tarea) => (
            <TareaCard
              key={tarea.id}
              tarea={tarea}
              onEdit={() => setEditTarea(tarea)}
              onDelete={() => setDeleteTareaTarget(tarea)}
              onAdjuntos={() => setAdjuntosTarea(tarea)}
            />
          ))}
        </div>
      )}

      {/* Modal: Nueva tarea */}
      {showModalNuevaTarea && (
        <ModalNuevaTarea
          idCargaAcademica={selectedCarga}
          idPeriodoPreseleccionado={selectedPeriodo}
          periodos={periodos}
          isPending={createTarea.isPending}
          onClose={() => setShowModalNuevaTarea(false)}
          onSubmit={async (data) => {
            await createTarea.mutateAsync(data);
            setShowModalNuevaTarea(false);
          }}
        />
      )}

      {/* Modal: Editar tarea */}
      {editTarea && (
        <ModalEditarTarea
          tarea={editTarea}
          isPending={updateTarea.isPending}
          onClose={() => setEditTarea(null)}
          onSubmit={async (data) => {
            await updateTarea.mutateAsync({ id: editTarea.id, data });
            setEditTarea(null);
          }}
        />
      )}

      {/* Modal: Confirmar eliminación */}
      {deleteTareaTarget && (
        <ModalConfirmarEliminar
          titulo={deleteTareaTarget.titulo}
          isPending={deleteTarea.isPending}
          onClose={() => setDeleteTareaTarget(null)}
          onConfirm={async () => {
            await deleteTarea.mutateAsync(deleteTareaTarget.id);
            setDeleteTareaTarget(null);
          }}
        />
      )}

      {/* Modal: Gestionar adjuntos */}
      {adjuntosTarea && (
        <ModalAdjuntos
          tarea={adjuntosTarea}
          adjuntos={adjuntos}
          isLoadingAdjuntos={isLoadingAdjuntos}
          isUploading={uploadAdjuntos.isPending}
          isDeletingAdjunto={deleteAdjunto.isPending}
          onClose={() => setAdjuntosTarea(null)}
          onUpload={async (files) => {
            await uploadAdjuntos.mutateAsync({ idTarea: adjuntosTarea.id, files });
          }}
          onDeleteAdjunto={async (adjuntoId) => {
            await deleteAdjunto.mutateAsync({ idTarea: adjuntosTarea.id, adjuntoId });
          }}
        />
      )}
    </div>
  );
}
