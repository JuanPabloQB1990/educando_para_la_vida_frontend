import React, { useState, useMemo, useEffect } from 'react';
import { useAniosElectivos } from '../../hooks/useAnioElectivo';
import { useGradosEducacion } from '../../hooks/useGradosEducacion';
import { usePeriodosByAnio } from '../../hooks/usePeriodo';
import {
  usePlanillaAcademica,
  useCargasProfesor,
  useActividades,
  useCreateActividad,
  useUpdateActividad,
  useCreateActividadMateria,
  useCreateCalificacion,
  useUpdateCalificacion,
  useUpsertAsistencia,
  useUpdateFechaAsistencia,
  useUpsertAutoevaluacion,
} from '../../hooks/usePlanillaAcademica';
import { useAuth } from '../../hooks/useAuth';
import { PeriodoEstado } from '../../types/periodo';
import type { CargaAcademica } from '../../types/cargaAcademica';
import type { Actividad } from '../../types/actividad';
import type { PlanillaEstudiante, PlanillaActividad, PlanillaActividadMateria } from '../../types/planillaAcademica';

const ESTADO_BG: Record<string, string> = {
  asistio: 'bg-blue-200',
  falla: 'bg-red-200',
  falla_justificada: 'bg-yellow-200',
  retraso: 'bg-orange-200',
};

const ESTADO_LABEL: Record<string, string> = {
  asistio: 'A',
  falla: 'F',
  falla_justificada: 'FJ',
  retraso: 'R',
};

function formatFechaCorta(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const d = new Date(anio, mes - 1, dia);
  const diaSemana = d.toLocaleDateString('es', { weekday: 'long' });
  const mesNombre = d.toLocaleDateString('es', { month: 'long' });
  return `${diaSemana}, ${d.getDate()} de ${mesNombre}`;
}

// ─── Modal: Editar nombre de actividad ───────────────────────────────────────

interface ModalEditarActividadProps {
  actividad: PlanillaActividad;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (nombre: string) => Promise<void>;
}

function ModalEditarActividad({ actividad, isPending, onClose, onSubmit }: ModalEditarActividadProps) {
  const [nombre, setNombre] = useState(actividad.nombre);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || nombre.trim() === actividad.nombre) return;
    await onSubmit(nombre.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Editar nombre de actividad</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
              disabled={isPending || nombre.trim() === actividad.nombre}
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

// ─── Modal: Nueva Actividad ───────────────────────────────────────────────────

interface ModalNuevaActividadProps {
  selectedPeriodo: string;
  selectedGrado: string;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: {
    idPeriodo: string;
    idGradoEducacion: string;
    nombreActividad: string;
  }) => Promise<void>;
}

function ModalNuevaActividad({
  selectedPeriodo,
  selectedGrado,
  isPending,
  onClose,
  onSubmit,
}: ModalNuevaActividadProps) {
  const [nombre, setNombre] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    await onSubmit({
      idPeriodo: selectedPeriodo,
      idGradoEducacion: selectedGrado,
      nombreActividad: nombre.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Nueva Actividad</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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

// ─── Modal: Nueva Materia de Actividad ───────────────────────────────────────

interface ModalNuevaActividadMateriaProps {
  actividades: Actividad[];
  cargasProfesor: CargaAcademica[];
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: {
    idActividad: string;
    idMateria: string;
    idCargaAcademica: string;
  }) => Promise<void>;
}

function ModalNuevaActividadMateria({
  actividades,
  cargasProfesor,
  isPending,
  onClose,
  onSubmit,
}: ModalNuevaActividadMateriaProps) {
  const [idActividad, setIdActividad] = useState('');
  const [idCarga, setIdCarga] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idActividad || !idCarga) return;
    const carga = cargasProfesor.find((c) => c.id === idCarga);
    if (!carga) return;
    await onSubmit({
      idActividad,
      idMateria: carga.idMateria,
      idCargaAcademica: carga.id,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Nueva Materia de Actividad</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Actividad *</label>
            <select
              value={idActividad}
              onChange={(e) => setIdActividad(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Seleccionar actividad</option>
              {actividades.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Materia (carga académica) *
            </label>
            <select
              value={idCarga}
              onChange={(e) => setIdCarga(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Seleccionar materia</option>
              {cargasProfesor.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombreMateria} — {c.nombreGrado}
                </option>
              ))}
            </select>
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

// ─── Modal: Calificación por celda ───────────────────────────────────────────

interface CeldaCalificacionTarget {
  est: PlanillaEstudiante;
  act: PlanillaActividad;
  m: PlanillaActividadMateria;
}

interface ModalCalificacionCeldaProps {
  target: CeldaCalificacionTarget;
  isCreating: boolean;
  isUpdating: boolean;
  onClose: () => void;
  onCreate: (data: { idEstudiante: string; idActividadMateria: string; nota: number; observacion?: string }) => Promise<void>;
  onUpdate: (id: string, data: { nota: number; observacion?: string | null }) => Promise<void>;
}

function ModalCalificacionCelda({ target, isCreating, isUpdating, onClose, onCreate, onUpdate }: ModalCalificacionCeldaProps) {
  const calExistente = target.est.calificaciones[target.m.id];
  const [nota, setNota] = useState(calExistente ? String(calExistente.nota) : '');
  const [observacion, setObservacion] = useState(calExistente?.observacion ?? '');

  const isPending = isCreating || isUpdating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(nota);
    if (isNaN(num) || num < 0 || num > 10) return;
    if (calExistente) {
      await onUpdate(calExistente.id, { nota: num, observacion: observacion.trim() || null });
    } else {
      await onCreate({
        idEstudiante: target.est.id,
        idActividadMateria: target.m.id,
        nota: num,
        observacion: observacion.trim() || undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">
          {calExistente ? 'Editar Calificación' : 'Nueva Calificación'}
        </h2>
        <p className="text-sm text-gray-500 mb-1">{target.est.nombre}</p>
        <p className="text-xs text-gray-400 mb-4">
          {target.act.nombre} · {target.m.nombreMateria}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nota * (0 – 5.0)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              required
              placeholder="ej: 8.5"
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observación</label>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              rows={3}
              placeholder="Opcional..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
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

// ─── Modal: Registrar Asistencia (masivo) ────────────────────────────────────

const ESTADOS_ASISTENCIA = [
  { value: 'asistio', label: 'Asistió' },
  { value: 'falla', label: 'Falla' },
  { value: 'falla_justificada', label: 'Falla justificada' },
  { value: 'retraso', label: 'Retraso' },
];

interface AsistenciaBulkItem {
  idEstudiante: string;
  idActividad: string;
  fecha: string;
  estadoAsistencia: string | null;
  observacion?: string | null;
}

interface ModalNuevaAsistenciaProps {
  actividades: Actividad[];
  estudiantes: PlanillaEstudiante[];
  isPending: boolean;
  onClose: () => void;
  onSubmitBulk: (items: AsistenciaBulkItem[]) => Promise<void>;
}

function ModalNuevaAsistencia({
  actividades,
  estudiantes,
  isPending,
  onClose,
  onSubmitBulk,
}: ModalNuevaAsistenciaProps) {
  const [idActividad, setIdActividad] = useState('');
  const [fecha, setFecha] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idActividad || !fecha) return;
    await onSubmitBulk(
      estudiantes.map(est => ({
        idEstudiante: est.id,
        idActividad,
        fecha,
        estadoAsistencia: null,
      }))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Registrar Asistencia</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Actividad *</label>
            <select
              value={idActividad}
              onChange={(e) => setIdActividad(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Seleccionar actividad</option>
              {actividades.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <p className="text-sm text-gray-500">
            Se creará la columna de fecha para {estudiantes.length} estudiante(s).
            Luego edita el estado de cada uno haciendo clic en la celda.
          </p>
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
              className="px-4 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal: Asistencia por celda ─────────────────────────────────────────────

interface CeldaAsistenciaTarget {
  est: PlanillaEstudiante;
  act: PlanillaActividad;
  fecha: string;
}

interface ModalAsistenciaCeldaProps {
  target: CeldaAsistenciaTarget;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: AsistenciaBulkItem) => Promise<void>;
}

function ModalAsistenciaCelda({ target, isPending, onClose, onSubmit }: ModalAsistenciaCeldaProps) {
  const asExistente = target.est.asistencias[target.act.id]?.[target.fecha];
  const [estado, setEstado] = useState(asExistente?.estado ?? '');
  const [observacion, setObservacion] = useState(asExistente?.observacion ?? '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      idEstudiante: target.est.id,
      idActividad: target.act.id,
      fecha: target.fecha,
      estadoAsistencia: estado,
      observacion: observacion.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">
          {asExistente ? 'Editar Asistencia' : 'Registrar Asistencia'}
        </h2>
        <p className="text-sm text-gray-500 mb-1">{target.est.nombre}</p>
        <p className="text-xs text-gray-400 mb-4">
          {target.act.nombre} · {formatFechaCorta(target.fecha)}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              required
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Seleccionar estado</option>
              {ESTADOS_ASISTENCIA.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observación</label>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              rows={3}
              placeholder="Opcional..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
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
              className="px-4 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal: Editar fecha de sesión de asistencia ─────────────────────────────

interface SesionAsistenciaTarget {
  act: PlanillaActividad;
  fecha: string;
}

interface ModalEditarFechaSesionProps {
  target: SesionAsistenciaTarget;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (fechaNueva: string) => Promise<void>;
}

function ModalEditarFechaSesion({ target, isPending, onClose, onSubmit }: ModalEditarFechaSesionProps) {
  const [fechaNueva, setFechaNueva] = useState(target.fecha);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaNueva || fechaNueva === target.fecha) return;
    await onSubmit(fechaNueva);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">Editar fecha de sesión</h2>
        <p className="text-xs text-gray-400 mb-4">{target.act.nombre}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha actual</label>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              {formatFechaCorta(target.fecha)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva fecha *</label>
            <input
              type="date"
              value={fechaNueva}
              onChange={(e) => setFechaNueva(e.target.value)}
              required
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
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
              disabled={isPending || fechaNueva === target.fecha}
              className="px-4 py-2 text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal: Autoevaluación ────────────────────────────────────────────────────

interface ModalAutoevaluacionProps {
  estudiante: PlanillaEstudiante;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: { nota: number; observacion?: string | null }) => Promise<void>;
}

function ModalAutoevaluacion({ estudiante, isPending, onClose, onSubmit }: ModalAutoevaluacionProps) {
  const [nota, setNota] = useState(
    estudiante.autoevaluacion !== null ? String(estudiante.autoevaluacion) : ''
  );
  const [observacion, setObservacion] = useState(estudiante.autoevaluacionObservacion ?? '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(nota);
    if (isNaN(num) || num < 0 || num > 10) return;
    await onSubmit({ nota: num, observacion: observacion.trim() || null });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">Autoevaluación</h2>
        <p className="text-sm text-gray-500 mb-4">{estudiante.nombre}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nota * (0 – 10)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              required
              placeholder="ej: 8.5"
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observación</label>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              rows={3}
              placeholder="Opcional..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
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
              className="px-4 py-2 text-sm text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function NotasAdminPage() {
  const { user } = useAuth();
  const esProfesor = user?.nombreRol === 'profesor(a)';

  const [selectedAnio, setSelectedAnio] = useState<string>('');
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
  const [selectedGrado, setSelectedGrado] = useState<string>('');
  const [showModalActividad, setShowModalActividad] = useState(false);
  const [actividadEditar, setActividadEditar] = useState<PlanillaActividad | null>(null);
  const [showModalActividadMateria, setShowModalActividadMateria] = useState(false);
  const [showModalAsistencia, setShowModalAsistencia] = useState(false);
  const [celdaCal, setCeldaCal] = useState<CeldaCalificacionTarget | null>(null);
  const [celdaAsistencia, setCeldaAsistencia] = useState<CeldaAsistenciaTarget | null>(null);
  const [sesionFecha, setSesionFecha] = useState<SesionAsistenciaTarget | null>(null);
  const [estudianteAutoeval, setEstudianteAutoeval] = useState<PlanillaEstudiante | null>(null);

  const { data: anios = [] } = useAniosElectivos();
  const { data: periodos = [] } = usePeriodosByAnio(selectedAnio);
  const { data: todosGrados = [] } = useGradosEducacion();
  const { data: cargasProfesor = [] } = useCargasProfesor(
    esProfesor ? user?.id : undefined
  );

  // Default: año que coincide con el año actual
  useEffect(() => {
    if (anios.length && !selectedAnio) {
      const anioActual = new Date().getFullYear();
      const match = anios.find((a) => a.anio === anioActual);
      if (match) setSelectedAnio(match.id);
    }
  }, [anios, selectedAnio]);

  const handleAnioChange = (id: string) => {
    setSelectedAnio(id);
    setSelectedPeriodo('');
    setSelectedGrado('');
  };

  // Grados disponibles: todos para admin/secretaria, solo los asignados para profesor
  const gradosDisponibles = useMemo(() => {
    if (!esProfesor) return todosGrados;
    const ids = new Set(cargasProfesor.map((c) => c.idGradoEducacion));
    return todosGrados.filter((g) => ids.has(g.id));
  }, [esProfesor, todosGrados, cargasProfesor]);

  // Periodo actualmente seleccionado (con su estado)
  const periodoSeleccionado = useMemo(
    () => periodos.find((p) => p.id === selectedPeriodo) ?? null,
    [periodos, selectedPeriodo]
  );

  // Botones de acción solo visibles para profesor con periodo activo y grado seleccionado
  const periodoActivo =
    esProfesor &&
    periodoSeleccionado?.estado === PeriodoEstado.ACTIVO &&
    !!selectedGrado;

  // Actividades del periodo+grado seleccionado (usadas en los modales)
  const { data: actividades = [] } = useActividades(
    selectedGrado || undefined,
    selectedPeriodo || undefined
  );

  const createActividad = useCreateActividad();
  const updateActividad = useUpdateActividad();
  const createActividadMateria = useCreateActividadMateria();
  const createCalificacion = useCreateCalificacion();
  const updateCalificacion = useUpdateCalificacion();
  const upsertAsistencia = useUpsertAsistencia();
  const updateFechaAsistencia = useUpdateFechaAsistencia();
  const upsertAutoevaluacion = useUpsertAutoevaluacion();

  const filtersComplete = !!selectedAnio && !!selectedPeriodo && !!selectedGrado;

  const { data: planilla, isLoading, isError } = usePlanillaAcademica({
    idGradoEducacion: selectedGrado,
    idAnioElectivo: selectedAnio,
    idPeriodo: selectedPeriodo,
  });

  // Materias únicas en orden de primera aparición (para columnas de nota final)
  const materiasUnicas = useMemo(() => {
    if (!planilla) return [];
    const seen = new Map<string, { idMateria: string; nombre: string; abreviatura: string }>();
    for (const act of planilla.actividades) {
      for (const m of act.materias) {
        if (!seen.has(m.idMateria)) {
          seen.set(m.idMateria, {
            idMateria: m.idMateria,
            nombre: m.nombreMateria,
            abreviatura: m.abreviaturaMateria,
          });
        }
      }
    }
    return Array.from(seen.values());
  }, [planilla]);

  const totalColumnas =
    3 +
    (planilla?.actividades.reduce(
      (s, a) => s + a.materias.length + a.fechasAsistencia.length,
      0
    ) ?? 0) +
    1 + // Autoevaluación
    materiasUnicas.length +
    2;

  const hayAsistencias = planilla?.actividades.some((a) => a.fechasAsistencia.length > 0) ?? false;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Planilla Académica</h1>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-3 items-end">
        {!esProfesor && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Año Electivo</label>
            <select
              value={selectedAnio}
              onChange={(e) => handleAnioChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Seleccionar año</option>
              {anios.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.anio}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Período</label>
          <select
            value={selectedPeriodo}
            onChange={(e) => {
              setSelectedPeriodo(e.target.value);
              setSelectedGrado('');
            }}
            disabled={!selectedAnio}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <option value="">Seleccionar período</option>
            {periodos.map((p) => (
              <option key={p.id} value={p.id}>
                Período {p.numeroPeriodo}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Grado</label>
          <select
            value={selectedGrado}
            onChange={(e) => setSelectedGrado(e.target.value)}
            disabled={!selectedPeriodo}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <option value="">Seleccionar grado</option>
            {gradosDisponibles.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Botones de acción para profesor con periodo activo */}
        {periodoActivo && (
          <div className="flex gap-2 ml-auto flex-wrap">
            <button
              onClick={() => setShowModalActividad(true)}
              className="px-3 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              + Actividad
            </button>
            <button
              onClick={() => setShowModalActividadMateria(true)}
              className="px-3 py-2 text-sm text-white bg-violet-600 rounded-lg hover:bg-violet-700"
            >
              + Mat. Actividad
            </button>
            <button
              onClick={() => setShowModalAsistencia(true)}
              className="px-3 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700"
            >
              + Asistencia
            </button>
          </div>
        )}
      </div>

      {/* Estado vacío */}
      {!filtersComplete && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-sm text-gray-400">
          Selecciona año electivo, período y grado para ver la planilla.
        </div>
      )}

      {/* Loading */}
      {filtersComplete && isLoading && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-sm text-gray-400 animate-pulse">
          Cargando planilla académica...
        </div>
      )}

      {/* Error */}
      {filtersComplete && isError && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-sm text-red-500">
          Error al cargar la planilla. Verifica los datos seleccionados.
        </div>
      )}

      {/* Planilla */}
      {filtersComplete && planilla && !isLoading && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Encabezado info */}
          <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">Grado</span>
              <p className="text-gray-800 font-medium">{planilla.grado.nombre}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">Año Electivo</span>
              <p className="text-gray-800 font-medium">{planilla.anio}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">Período</span>
              <p className="text-gray-800 font-medium">{planilla.periodo.numeroPeriodo}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">Director(a) de Grado</span>
              <p className="text-gray-800 font-medium">{planilla.director ?? '—'}</p>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                {/* Fila 1: grupos de actividad */}
                <tr className="bg-indigo-50">
                  <th
                    rowSpan={2}
                    className="border border-gray-200 px-2 py-2 text-center font-semibold text-gray-700"
                  >
                    No.
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700 min-w-[180px] whitespace-nowrap"
                  >
                    Nombres y Apellidos
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-gray-200 px-2 py-2 text-center font-semibold text-gray-700 whitespace-nowrap"
                  >
                    Doc. Identidad
                  </th>

                  {planilla.actividades.map((act) => {
                    const span = act.materias.length + act.fechasAsistencia.length;
                    if (span === 0) return null;
                    const puedeEditarAct = periodoActivo;
                    return (
                      <th
                        key={act.id}
                        colSpan={span}
                        onClick={() => puedeEditarAct && setActividadEditar(act)}
                        title={puedeEditarAct ? 'Clic para editar el nombre de la actividad' : undefined}
                        className={`border border-gray-200 px-2 py-1 text-center font-semibold text-indigo-700 bg-indigo-100 whitespace-nowrap ${
                          puedeEditarAct ? 'cursor-pointer hover:bg-indigo-200' : ''
                        }`}
                      >
                        {act.nombre}
                        {puedeEditarAct && <span className="ml-1 text-[20px]">✎</span>}
                      </th>
                    );
                  })}

                  <th
                    rowSpan={2}
                    className="border border-gray-200 px-2 py-1 text-center font-semibold text-amber-700 bg-amber-50 whitespace-nowrap"
                  >
                    Autoevaluación
                  </th>

                  {materiasUnicas.length > 0 && (
                    <th
                      colSpan={materiasUnicas.length}
                      className="border border-gray-200 px-2 py-1 text-center font-semibold text-violet-700 bg-violet-50 whitespace-nowrap"
                    >
                      Nota Final
                    </th>
                  )}

                  <th
                    rowSpan={2}
                    className="border border-gray-200 px-2 py-2 text-center font-semibold text-gray-700 whitespace-nowrap"
                  >
                    Total
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-gray-200 px-2 py-2 text-center font-semibold text-gray-700"
                  >
                    %
                  </th>
                </tr>

                {/* Fila 2: sub-columnas */}
                <tr className="bg-gray-50">
                  {planilla.actividades.flatMap((act) => [
                    ...act.materias.map((m) => (
                      <th
                        key={m.id}
                        title={m.nombreMateria}
                        className="border border-gray-200 px-1 py-1 text-center font-medium text-gray-600 whitespace-nowrap cursor-help"
                      >
                        {m.abreviaturaMateria}
                      </th>
                    )),
                    ...act.fechasAsistencia.map((fecha) => {
                      const puedeEditarFecha = periodoActivo;
                      return (
                        <th
                          key={`${act.id}-${fecha}`}
                          onClick={() => puedeEditarFecha && setSesionFecha({ act, fecha })}
                          title={puedeEditarFecha ? 'Clic para cambiar la fecha de esta sesión' : undefined}
                          className={`border border-gray-200 px-1 py-1 text-center font-medium text-emerald-700 border-gray-200 whitespace-nowrap ${
                            puedeEditarFecha ? 'cursor-pointer hover:border-gray-100' : ''
                          }`}
                        >
                          {formatFechaCorta(fecha)}
                          {puedeEditarFecha && (
                            <span className="ml-1 text-[20px]">✎</span>
                          )}
                        </th>
                      );
                    }),
                  ])}
                  {materiasUnicas.map((mu) => (
                    <th
                      key={`final-${mu.idMateria}`}
                      title={mu.nombre}
                      className="border border-gray-200 px-1 py-1 text-center font-semibold text-violet-700 bg-violet-50 whitespace-nowrap cursor-help"
                    >
                      {mu.abreviatura}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {planilla.estudiantes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={totalColumnas}
                      className="border border-gray-200 px-4 py-8 text-center text-gray-400"
                    >
                      No hay estudiantes matriculados en este grado y año electivo.
                    </td>
                  </tr>
                ) : (
                  planilla.estudiantes.map((est, idx) => (
                    <tr key={est.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="border border-gray-200 px-2 py-1 text-center text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="border border-gray-200 px-3 py-1 text-gray-800 font-medium whitespace-nowrap">
                        {est.nombre}
                      </td>
                      <td className="border border-gray-200 px-2 py-1 text-center text-gray-600 whitespace-nowrap">
                        {est.tipoDocumento} {est.noDocumento}
                      </td>

                      {/* Notas y asistencias agrupadas por actividad */}
                      {planilla.actividades.flatMap((act) => [
                        ...act.materias.map((m) => {
                          const cal = est.calificaciones[m.id];
                          const puedeEditar = periodoActivo;
                          return (
                            <td
                              key={m.id}
                              onClick={() => puedeEditar && setCeldaCal({ est, act, m })}
                              title={puedeEditar ? (cal ? 'Clic para editar calificación' : 'Clic para registrar calificación') : undefined}
                              className={`border border-gray-200 px-1 py-1 text-center relative group ${
                                puedeEditar ? 'cursor-pointer hover:bg-indigo-50' : ''
                              }`}
                            >
                              {cal ? (
                                <>
                                  <span
                                    className={`${cal.nota >= 6 ? 'text-gray-800' : 'text-red-600'} font-medium${
                                      cal.observacion ? ' underline decoration-dotted cursor-help' : ''
                                    }`}
                                  >
                                    {cal.nota.toFixed(1)}
                                  </span>
                                  {cal.observacion && (
                                    <div className="absolute z-20 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white rounded whitespace-normal max-w-[180px] text-left shadow-lg pointer-events-none leading-tight">
                                      {cal.observacion}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>
                          );
                        }),
                        ...act.fechasAsistencia.map((fecha) => {
                          const as = est.asistencias[act.id]?.[fecha];
                          const puedeEditarAs = periodoActivo;
                          const bgColor = as?.estado ? (ESTADO_BG[as.estado] ?? 'bg-gray-100') : '';
                          return (
                            <td
                              key={`${act.id}-${fecha}`}
                              onClick={() => puedeEditarAs && setCeldaAsistencia({ est, act, fecha })}
                              title={puedeEditarAs ? (as?.estado ? 'Clic para editar asistencia' : 'Clic para registrar asistencia') : undefined}
                              className={`border border-gray-200 px-1 py-1 text-center relative group ${bgColor} ${puedeEditarAs ? 'cursor-pointer' : ''}`}
                            >
                              {as ? (
                                as.estado ? (
                                  <>
                                    <span className="font-bold text-gray-700">
                                      {ESTADO_LABEL[as.estado] ?? as.estado}
                                    </span>
                                    {as.observacion && (
                                      <div className="absolute z-20 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white rounded whitespace-normal max-w-[180px] text-left shadow-lg pointer-events-none leading-tight">
                                        {as.observacion}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )
                              ) : null}
                            </td>
                          );
                        }),
                      ])}

                      {/* Autoevaluación */}
                      <td
                        onClick={() => periodoActivo && setEstudianteAutoeval(est)}
                        title={periodoActivo ? 'Clic para registrar autoevaluación' : undefined}
                        className={`border border-gray-200 px-1 py-1 text-center bg-amber-50 font-semibold ${
                          periodoActivo ? 'cursor-pointer hover:bg-amber-100' : ''
                        } ${
                          est.autoevaluacion === null
                            ? 'text-gray-300'
                            : est.autoevaluacion >= 6
                            ? 'text-amber-700'
                            : 'text-red-600'
                        }`}
                      >
                        {est.autoevaluacion !== null ? est.autoevaluacion.toFixed(1) : '—'}
                      </td>

                      {/* Nota final por materia (incluye autoevaluación) */}
                      {materiasUnicas.map((mu) => {
                        const notas: number[] = [];
                        for (const act of planilla.actividades) {
                          for (const m of act.materias) {
                            if (m.idMateria === mu.idMateria) {
                              const cal = est.calificaciones[m.id];
                              if (cal) notas.push(cal.nota);
                            }
                          }
                        }
                        if (est.autoevaluacion !== null) notas.push(est.autoevaluacion);
                        const promedio =
                          notas.length > 0
                            ? notas.reduce((s, n) => s + n, 0) / notas.length
                            : null;
                        return (
                          <td
                            key={`final-${mu.idMateria}`}
                            className={`border border-gray-200 px-1 py-1 text-center font-semibold bg-violet-50 ${
                              promedio === null
                                ? 'text-gray-300'
                                : promedio >= 6
                                ? 'text-violet-700'
                                : 'text-red-600'
                            }`}
                          >
                            {promedio !== null ? promedio.toFixed(1) : '—'}
                          </td>
                        );
                      })}

                      {/* Resumen asistencia */}
                      <td className="border border-gray-200 px-2 py-1 text-center font-medium text-gray-700">
                        {est.totalPresente}
                      </td>
                      <td
                        className={`border border-gray-200 px-2 py-1 text-center font-semibold ${
                          est.porcentajeAsistencia >= 80
                            ? 'text-emerald-600'
                            : est.porcentajeAsistencia >= 50
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }`}
                      >
                        {est.porcentajeAsistencia}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Leyenda */}
          {hayAsistencias && (
            <div className="px-6 py-3 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
              <span className="font-semibold text-gray-600">Referencia:</span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-blue-200 inline-block" /> A = Asistió
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-red-200 inline-block" /> F = Falla
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-yellow-200 inline-block" /> FJ = Falla
                Justificada
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-orange-200 inline-block" /> R = Retraso
              </span>
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      {actividadEditar && (
        <ModalEditarActividad
          actividad={actividadEditar}
          isPending={updateActividad.isPending}
          onClose={() => setActividadEditar(null)}
          onSubmit={async (nombre) => {
            try {
              await updateActividad.mutateAsync({ id: actividadEditar.id, nombre });
              setActividadEditar(null);
            } catch { /* error manejado por onError del hook */ }
          }}
        />
      )}

      {showModalActividad && (
        <ModalNuevaActividad
          selectedPeriodo={selectedPeriodo}
          selectedGrado={selectedGrado}
          isPending={createActividad.isPending}
          onClose={() => setShowModalActividad(false)}
          onSubmit={async (data) => {
            await createActividad.mutateAsync(data);
            setShowModalActividad(false);
          }}
        />
      )}

      {showModalActividadMateria && (
        <ModalNuevaActividadMateria
          actividades={actividades}
          cargasProfesor={cargasProfesor}
          isPending={createActividadMateria.isPending}
          onClose={() => setShowModalActividadMateria(false)}
          onSubmit={async (data) => {
            await createActividadMateria.mutateAsync(data);
            setShowModalActividadMateria(false);
          }}
        />
      )}


      {celdaCal && (
        <ModalCalificacionCelda
          target={celdaCal}
          isCreating={createCalificacion.isPending}
          isUpdating={updateCalificacion.isPending}
          onClose={() => setCeldaCal(null)}
          onCreate={async (data) => {
            try {
              await createCalificacion.mutateAsync(data);
              setCeldaCal(null);
            } catch { /* error manejado por onError del hook */ }
          }}
          onUpdate={async (id, data) => {
            try {
              await updateCalificacion.mutateAsync({ id, data });
              setCeldaCal(null);
            } catch { /* error manejado por onError del hook */ }
          }}
        />
      )}

      {showModalAsistencia && (
        <ModalNuevaAsistencia
          actividades={actividades}
          estudiantes={planilla?.estudiantes ?? []}
          isPending={upsertAsistencia.isPending}
          onClose={() => setShowModalAsistencia(false)}
          onSubmitBulk={async (items) => {
            await Promise.all(items.map(item => upsertAsistencia.mutateAsync(item)));
            setShowModalAsistencia(false);
          }}
        />
      )}

      {celdaAsistencia && (
        <ModalAsistenciaCelda
          target={celdaAsistencia}
          isPending={upsertAsistencia.isPending}
          onClose={() => setCeldaAsistencia(null)}
          onSubmit={async (data) => {
            try {
              await upsertAsistencia.mutateAsync(data);
              setCeldaAsistencia(null);
            } catch { /* error manejado por onError del hook */ }
          }}
        />
      )}

      {sesionFecha && (
        <ModalEditarFechaSesion
          target={sesionFecha}
          isPending={updateFechaAsistencia.isPending}
          onClose={() => setSesionFecha(null)}
          onSubmit={async (fechaNueva) => {
            try {
              await updateFechaAsistencia.mutateAsync({
                idActividad: sesionFecha.act.id,
                fechaActual: sesionFecha.fecha,
                fechaNueva,
              });
              setSesionFecha(null);
            } catch { /* error manejado por onError del hook */ }
          }}
        />
      )}

      {estudianteAutoeval && (
        <ModalAutoevaluacion
          estudiante={estudianteAutoeval}
          isPending={upsertAutoevaluacion.isPending}
          onClose={() => setEstudianteAutoeval(null)}
          onSubmit={async ({ nota, observacion }) => {
            await upsertAutoevaluacion.mutateAsync({
              idEstudiante: estudianteAutoeval.id,
              idPeriodo: selectedPeriodo,
              idGradoEducacion: selectedGrado,
              nota,
              observacion,
            });
            setEstudianteAutoeval(null);
          }}
        />
      )}
    </div>
  );
}
