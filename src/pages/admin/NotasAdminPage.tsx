import React, { useState, useMemo, useEffect } from 'react';
import { useAniosElectivos } from '../../hooks/useAnioElectivo';
import { useGradosEducacion } from '../../hooks/useGradosEducacion';
import { usePeriodosByAnio } from '../../hooks/usePeriodo';
import {
  usePlanillaAcademica,
  useCargasProfesor,
  useActividades,
  useActividadMaterias,
  useCreateActividad,
  useCreateActividadMateria,
  useCreateCalificacion,
  useUpsertAsistencia,
} from '../../hooks/usePlanillaAcademica';
import { useAuth } from '../../hooks/useAuth';
import { PeriodoEstado } from '../../types/periodo';
import type { CargaAcademica } from '../../types/cargaAcademica';
import type { Actividad } from '../../types/actividad';
import type { ActividadMateria } from '../../types/actividadMateria';
import type { PlanillaEstudiante } from '../../types/planillaAcademica';

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
    semana: number;
    descripcion?: string;
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
  const [semana, setSemana] = useState('1');
  const [descripcion, setDescripcion] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !semana) return;
    await onSubmit({
      idPeriodo: selectedPeriodo,
      idGradoEducacion: selectedGrado,
      nombreActividad: nombre.trim(),
      semana: Number(semana),
      descripcion: descripcion.trim() || undefined,
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semana *</label>
            <input
              type="number"
              min={1}
              value={semana}
              onChange={(e) => setSemana(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
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
    nombreActividad: string;
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
  const [nombre, setNombre] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idActividad || !idCarga || !nombre.trim()) return;
    const carga = cargasProfesor.find((c) => c.id === idCarga);
    if (!carga) return;
    await onSubmit({
      idActividad,
      idMateria: carga.idMateria,
      idCargaAcademica: carga.id,
      nombreActividad: nombre.trim(),
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
                  Sem. {a.semana} — {a.nombre}
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

// ─── Modal: Nueva Calificación ────────────────────────────────────────────────

interface ModalNuevaCalificacionProps {
  actividades: Actividad[];
  estudiantes: PlanillaEstudiante[];
  cargasProfesor: CargaAcademica[];
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: {
    idEstudiante: string;
    idActividadMateria: string;
    nota: number;
    observacion?: string;
  }) => Promise<void>;
}

function ModalNuevaCalificacion({
  actividades,
  estudiantes,
  cargasProfesor,
  isPending,
  onClose,
  onSubmit,
}: ModalNuevaCalificacionProps) {
  const [idEstudiante, setIdEstudiante] = useState('');
  const [idActividad, setIdActividad] = useState('');
  const [idActividadMateria, setIdActividadMateria] = useState('');
  const [nota, setNota] = useState('');
  const [observacion, setObservacion] = useState('');

  const { data: actividadMaterias = [] } = useActividadMaterias(idActividad || undefined);

  const cargasIds = useMemo(() => new Set(cargasProfesor.map((c) => c.id)), [cargasProfesor]);
  const actividadMateriasFiltradas = useMemo<ActividadMateria[]>(
    () => actividadMaterias.filter((am) => cargasIds.has(am.idCargaAcademica)),
    [actividadMaterias, cargasIds]
  );

  const handleActividadChange = (id: string) => {
    setIdActividad(id);
    setIdActividadMateria('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idEstudiante || !idActividadMateria || !nota) return;
    const notaNum = parseFloat(nota);
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) return;
    await onSubmit({
      idEstudiante,
      idActividadMateria,
      nota: notaNum,
      observacion: observacion.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Nueva Calificación</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante *</label>
            <select
              value={idEstudiante}
              onChange={(e) => setIdEstudiante(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Seleccionar estudiante</option>
              {estudiantes.map((est) => (
                <option key={est.id} value={est.id}>
                  {est.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Actividad *</label>
            <select
              value={idActividad}
              onChange={(e) => handleActividadChange(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Seleccionar actividad</option>
              {actividades.map((a) => (
                <option key={a.id} value={a.id}>
                  Sem. {a.semana} — {a.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Materia de actividad *
            </label>
            <select
              value={idActividadMateria}
              onChange={(e) => setIdActividadMateria(e.target.value)}
              required
              disabled={!idActividad}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="">
                {idActividad ? 'Seleccionar materia' : 'Selecciona una actividad primero'}
              </option>
              {actividadMateriasFiltradas.map((am) => (
                <option key={am.id} value={am.id}>
                  {am.nombre} — {am.nombreMateria}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nota *</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              required
              placeholder="ej: 4.5"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observación</label>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              rows={2}
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

// ─── Modal: Nueva Asistencia ──────────────────────────────────────────────────

const ESTADOS_ASISTENCIA = [
  { value: 'asistio', label: 'Asistió' },
  { value: 'falla', label: 'Falla' },
  { value: 'falla_justificada', label: 'Falla justificada' },
  { value: 'retraso', label: 'Retraso' },
];

interface ModalNuevaAsistenciaProps {
  actividades: Actividad[];
  estudiantes: PlanillaEstudiante[];
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: {
    idEstudiante: string;
    idActividad: string;
    fecha: string;
    estadoAsistencia: string;
    observacion?: string;
  }) => Promise<void>;
}

function ModalNuevaAsistencia({
  actividades,
  estudiantes,
  isPending,
  onClose,
  onSubmit,
}: ModalNuevaAsistenciaProps) {
  const [idEstudiante, setIdEstudiante] = useState('');
  const [idActividad, setIdActividad] = useState('');
  const [fecha, setFecha] = useState('');
  const [estadoAsistencia, setEstadoAsistencia] = useState('asistio');
  const [observacion, setObservacion] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idEstudiante || !idActividad || !fecha) return;
    await onSubmit({
      idEstudiante,
      idActividad,
      fecha,
      estadoAsistencia,
      observacion: observacion.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Registrar Asistencia</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante *</label>
            <select
              value={idEstudiante}
              onChange={(e) => setIdEstudiante(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Seleccionar estudiante</option>
              {estudiantes.map((est) => (
                <option key={est.id} value={est.id}>
                  {est.nombre}
                </option>
              ))}
            </select>
          </div>
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
                  Sem. {a.semana} — {a.nombre}
                </option>
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
            <select
              value={estadoAsistencia}
              onChange={(e) => setEstadoAsistencia(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {ESTADOS_ASISTENCIA.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observación</label>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              rows={2}
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

// ─── Página principal ─────────────────────────────────────────────────────────

export default function NotasAdminPage() {
  const { user } = useAuth();
  const esProfesor = user?.nombreRol === 'profesor(a)';

  const [selectedAnio, setSelectedAnio] = useState<string>('');
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
  const [selectedGrado, setSelectedGrado] = useState<string>('');
  const [showModalActividad, setShowModalActividad] = useState(false);
  const [showModalActividadMateria, setShowModalActividadMateria] = useState(false);
  const [showModalCalificacion, setShowModalCalificacion] = useState(false);
  const [showModalAsistencia, setShowModalAsistencia] = useState(false);

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
  const createActividadMateria = useCreateActividadMateria();
  const createCalificacion = useCreateCalificacion();
  const upsertAsistencia = useUpsertAsistencia();

  const filtersComplete = !!selectedAnio && !!selectedPeriodo && !!selectedGrado;

  const { data: planilla, isLoading, isError } = usePlanillaAcademica({
    idGradoEducacion: selectedGrado,
    idAnioElectivo: selectedAnio,
    idPeriodo: selectedPeriodo,
  });

  const totalColumnas =
    3 +
    (planilla?.actividades.reduce((s, a) => s + a.materias.length, 0) ?? 0) +
    (planilla?.fechasAsistencia.length ?? 0) +
    2;

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
              onClick={() => setShowModalCalificacion(true)}
              className="px-3 py-2 text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
            >
              + Calificación
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

                  {planilla.actividades.map((act) =>
                    act.materias.length > 0 ? (
                      <th
                        key={act.id}
                        colSpan={act.materias.length}
                        className="border border-gray-200 px-2 py-1 text-center font-semibold text-indigo-700 bg-indigo-100 whitespace-nowrap"
                      >
                        {act.nombre}
                      </th>
                    ) : null
                  )}

                  {planilla.fechasAsistencia.length > 0 && (
                    <th
                      colSpan={planilla.fechasAsistencia.length}
                      className="border border-gray-200 px-2 py-1 text-center font-semibold text-emerald-700 bg-emerald-50 whitespace-nowrap"
                    >
                      Asistencia
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
                  {planilla.actividades.flatMap((act) =>
                    act.materias.map((m) => (
                      <th
                        key={m.id}
                        title={m.nombreMateria}
                        className="border border-gray-200 px-1 py-1 text-center font-medium text-gray-600 whitespace-nowrap cursor-help"
                      >
                        {m.nombre}
                      </th>
                    ))
                  )}
                  {planilla.fechasAsistencia.map((fecha) => (
                    <th
                      key={fecha}
                      className="border border-gray-200 px-1 py-1 text-center font-medium text-gray-600 whitespace-nowrap"
                    >
                      {formatFechaCorta(fecha)}
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

                      {/* Notas */}
                      {planilla.actividades.flatMap((act) =>
                        act.materias.map((m) => {
                          const cal = est.calificaciones[m.id];
                          return (
                            <td
                              key={m.id}
                              className="border border-gray-200 px-1 py-1 text-center relative group"
                            >
                              {cal ? (
                                <>
                                  <span
                                    className={
                                      cal.observacion
                                        ? 'underline decoration-dotted cursor-help'
                                        : ''
                                    }
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
                        })
                      )}

                      {/* Asistencias */}
                      {planilla.fechasAsistencia.map((fecha) => {
                        const as = est.asistencias[fecha];
                        return (
                          <td
                            key={fecha}
                            className={`border border-gray-200 px-1 py-1 text-center relative group ${
                              as ? (ESTADO_BG[as.estado] ?? 'bg-gray-100') : ''
                            }`}
                          >
                            {as ? (
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
                            ) : null}
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
          {planilla.fechasAsistencia.length > 0 && (
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

      {showModalCalificacion && (
        <ModalNuevaCalificacion
          actividades={actividades}
          estudiantes={planilla?.estudiantes ?? []}
          cargasProfesor={cargasProfesor}
          isPending={createCalificacion.isPending}
          onClose={() => setShowModalCalificacion(false)}
          onSubmit={async (data) => {
            await createCalificacion.mutateAsync(data);
            setShowModalCalificacion(false);
          }}
        />
      )}

      {showModalAsistencia && (
        <ModalNuevaAsistencia
          actividades={actividades}
          estudiantes={planilla?.estudiantes ?? []}
          isPending={upsertAsistencia.isPending}
          onClose={() => setShowModalAsistencia(false)}
          onSubmit={async (data) => {
            await upsertAsistencia.mutateAsync(data);
            setShowModalAsistencia(false);
          }}
        />
      )}
    </div>
  );
}
