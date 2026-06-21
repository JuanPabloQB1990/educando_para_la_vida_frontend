import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useHistorialMatricula,
  usePatchMatriculaEstudio,
  useAddGrado,
  useRemoveGrado,
  useUpdateGradoEstado,
  useObligacionesMatricula,
} from '../../hooks/useMatriculasAdmin';
import { useTiposEstudio } from '../../hooks/useTipoEstudio';
import { useTiemposValidacion } from '../../hooks/useTiempoValidacion';
import { useGradosEducacion } from '../../hooks/useGradosEducacion';
import type { GradoMatricula, MatriculaInfo } from '../../types/pagosEstudiante';
import type { TipoEstudio } from '../../types/tipoEstudio';
import type { TiempoValidacion } from '../../types/tiempoValidacion';
import type { GradoEducacion } from '../../types/gradoEducacion';

type GradoEstado = GradoMatricula['estado'];
const GRADO_ESTADOS: GradoEstado[] = ['pendiente', 'aprobado', 'reprobado', 'retirado'];

const OBLIGACION_BADGE: Record<'pendiente' | 'pagado' | 'vencido', string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  pagado: 'bg-green-100 text-green-700',
  vencido: 'bg-red-100 text-red-700',
};

function formatFecha(fecha: string | null) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function AnioEstadoBadge({ estado }: { estado: 'activo' | 'cerrado' | null }) {
  if (!estado) return <span className="text-gray-400 text-xs">—</span>;
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
        estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
}

function FileLink({ label, url }: { label: string; url: string | null | undefined }) {
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
      {label}
    </a>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4 animate-pulse">
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1 flex-1">
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        ))}
      </div>
      <div className="h-16 bg-gray-100 rounded-lg" />
    </div>
  );
}

interface MatriculaCardProps {
  matricula: MatriculaInfo;
  grados: GradoMatricula[];
  idx: number;
  idEstudiante: string;
  tiposEstudio: TipoEstudio[];
  tiemposValidacion: TiempoValidacion[];
  gradosEducacion: GradoEducacion[];
}

function MatriculaCard({
  matricula, grados, idx, idEstudiante,
  tiposEstudio, tiemposValidacion, gradosEducacion,
}: MatriculaCardProps) {
  const [idTipoEstudio, setIdTipoEstudio] = useState(matricula.idTipoEstudio ?? '');
  const [idTiempoValidacion, setIdTiempoValidacion] = useState(matricula.idTiempoValidacion ?? '');
  const [gradoEstadoEdits, setGradoEstadoEdits] = useState<Record<string, GradoEstado>>({});
  const [nuevoIdGrado, setNuevoIdGrado] = useState('');
  const [nuevoEstadoGrado, setNuevoEstadoGrado] = useState<GradoEstado>('pendiente');

  const patchEstudio = usePatchMatriculaEstudio(idEstudiante);
  const addGradoMut = useAddGrado(idEstudiante);
  const removeGradoMut = useRemoveGrado(idEstudiante);
  const updateEstadoMut = useUpdateGradoEstado(idEstudiante);
  const { data: obligaciones = [], isLoading: loadingObligaciones } = useObligacionesMatricula(matricula.id);

  useEffect(() => {
    setIdTipoEstudio(matricula.idTipoEstudio ?? '');
    setIdTiempoValidacion(matricula.idTiempoValidacion ?? '');
  }, [matricula.idTipoEstudio, matricula.idTiempoValidacion]);

  const tipoSeleccionado = tiposEstudio.find(t => t.id === idTipoEstudio);
  const esValidacionGrados = tipoSeleccionado?.nombre?.toLowerCase().includes('validac') ?? false;

  const gradosAgregados = new Set(grados.map(g => g.idGradoEducacion));
  const gradosDisponibles = gradosEducacion.filter(g => !gradosAgregados.has(g.id));

  function handleGuardarMatricula(e: React.FormEvent) {
    e.preventDefault();
    patchEstudio.mutate({
      id: matricula.id,
      idTipoEstudio: idTipoEstudio || '',
      idTiempoValidacion: esValidacionGrados ? (idTiempoValidacion || null) : null,
    });
  }

  function handleGuardarEstadoGrado(idGradoEducacion: string) {
    const estado = gradoEstadoEdits[idGradoEducacion];
    if (!estado) return;
    updateEstadoMut.mutate(
      { idEstudianteMatricula: matricula.id, idGradoEducacion, estado },
      {
        onSuccess: () =>
          setGradoEstadoEdits(prev => {
            const next = { ...prev };
            delete next[idGradoEducacion];
            return next;
          }),
      }
    );
  }

  function handleEliminarGrado(idGradoEducacion: string) {
    if (!window.confirm('¿Eliminar este grado de la matrícula?')) return;
    removeGradoMut.mutate({ idEstudianteMatricula: matricula.id, idGradoEducacion });
  }

  function handleAgregarGrado(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoIdGrado) return;
    addGradoMut.mutate(
      { idEstudianteMatricula: matricula.id, idGradoEducacion: nuevoIdGrado },
      {
        onSuccess: () => {
          setNuevoIdGrado('');
          setNuevoEstadoGrado('pendiente');
        },
      }
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800">Matrícula #{idx + 1}</h2>
        <AnioEstadoBadge estado={matricula.anioElectivoEstado ?? null} />
      </div>

      {/* INFORMACIÓN DEL ESTUDIANTE */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Información de la matrícula
        </h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
          <div>
            <span className="text-gray-400">Año electivo: </span>
            <span className="font-medium text-gray-800">{matricula.anioElectivoAnio ?? '—'}</span>
          </div>
          <div>
            <span className="text-gray-400">Tipo de estudio: </span>
            <span className="font-medium text-gray-800">{matricula.nombreTipoEstudio ?? '—'}</span>
          </div>
          <div>
            <span className="text-gray-400">Meses de validación: </span>
            <span className="font-medium text-gray-800">
              {matricula.mesesTiempoValidacion != null ? `${matricula.mesesTiempoValidacion} meses` : '—'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Fecha inscripción: </span>
            <span className="font-medium text-gray-800">{formatFecha(matricula.fechaInscripcion)}</span>
          </div>
        </div>
        <div className="flex gap-4 mt-2">
          <FileLink label="Compromiso" url={matricula.fileCompromiso} />
          <FileLink label="Cert. grados" url={matricula.fileCertificadoGrados} />
        </div>
      </div>

      {/* EDITAR MATRÍCULA */}
      <div className="border-t border-gray-100 pt-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Editar matrícula
        </h3>
        <form onSubmit={handleGuardarMatricula} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de estudio</label>
            <select
              value={idTipoEstudio}
              onChange={(e) => {
                setIdTipoEstudio(e.target.value);
                setIdTiempoValidacion('');
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Sin tipo de estudio</option>
              {tiposEstudio.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>

          {esValidacionGrados && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo de validación</label>
              <select
                value={idTiempoValidacion}
                onChange={(e) => setIdTiempoValidacion(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Sin tiempo de validación</option>
                {tiemposValidacion.map(tv => (
                  <option key={tv.id} value={tv.id}>{tv.tiempo} meses</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={patchEstudio.isPending}
              className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {patchEstudio.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>

      {/* GRADOS MATRICULADOS */}
      <div className="border-t border-gray-100 pt-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Grados matriculados
        </h3>

        {grados.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Sin grados matriculados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="text-left px-3 py-2 font-medium text-xs">Grado</th>
                  <th className="text-left px-3 py-2 font-medium text-xs">Estado</th>
                  <th className="text-left px-3 py-2 font-medium text-xs">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grados.map(g => {
                  const estadoEditing = gradoEstadoEdits[g.idGradoEducacion] ?? (g.estado as GradoEstado);
                  const changed = gradoEstadoEdits[g.idGradoEducacion] !== undefined;
                  return (
                    <tr key={g.idGradoEducacion}>
                      <td className="px-3 py-2 text-gray-700 font-medium">{g.nombreGrado}</td>
                      <td className="px-3 py-2">
                        <select
                          value={estadoEditing}
                          onChange={(e) =>
                            setGradoEstadoEdits(prev => ({
                              ...prev,
                              [g.idGradoEducacion]: e.target.value as GradoEstado,
                            }))
                          }
                          className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        >
                          {GRADO_ESTADOS.map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-3">
                          {changed && (
                            <button
                              type="button"
                              onClick={() => handleGuardarEstadoGrado(g.idGradoEducacion)}
                              disabled={updateEstadoMut.isPending}
                              className="text-indigo-600 hover:text-indigo-800 text-xs font-medium disabled:opacity-50"
                            >
                              Guardar
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleEliminarGrado(g.idGradoEducacion)}
                            disabled={removeGradoMut.isPending}
                            className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Agregar grado */}
        {gradosDisponibles.length > 0 && (
          <form onSubmit={handleAgregarGrado} className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Agregar grado</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <select
                  value={nuevoIdGrado}
                  onChange={(e) => setNuevoIdGrado(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Seleccione un grado</option>
                  {gradosDisponibles.map(g => (
                    <option key={g.id} value={g.id}>{g.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={nuevoEstadoGrado}
                  onChange={(e) => setNuevoEstadoGrado(e.target.value as GradoEstado)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {GRADO_ESTADOS.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={addGradoMut.isPending || !nuevoIdGrado}
                className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
              >
                {addGradoMut.isPending ? 'Agregando...' : 'Agregar grado'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* OBLIGACIONES DE PAGO */}
      <div className="border-t border-gray-100 pt-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Obligaciones de pago
        </h3>

        {loadingObligaciones ? (
          <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        ) : obligaciones.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Sin obligaciones de pago.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="text-left px-3 py-2 font-medium text-xs">Rubro</th>
                  <th className="text-left px-3 py-2 font-medium text-xs">Monto</th>
                  <th className="text-left px-3 py-2 font-medium text-xs">Vencimiento</th>
                  <th className="text-left px-3 py-2 font-medium text-xs">Estado</th>
                  <th className="text-left px-3 py-2 font-medium text-xs">Verificado por</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {obligaciones.map(ob => {
                  const verificador = ob.verificadoPorNombres
                    ? [ob.verificadoPorNombres, ob.verificadoPorApellido1, ob.verificadoPorApellido2].filter(Boolean).join(' ')
                    : null;
                  return (
                  <tr key={ob.idObligacionPago}>
                    <td className="px-3 py-2 text-gray-700 font-medium">{ob.nombreRubro}</td>
                    <td className="px-3 py-2 text-gray-600">
                      {ob.montoCuota.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                    </td>
                    <td className="px-3 py-2 text-gray-600">{formatFecha(ob.fechaVencimiento)}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${OBLIGACION_BADGE[ob.estado]}`}>
                        {ob.estado.charAt(0).toUpperCase() + ob.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600 text-xs">{verificador ?? '—'}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HistorialMatriculaPage() {
  const { idEstudiante } = useParams<{ idEstudiante: string }>();
  const navigate = useNavigate();

  const { data = [], isLoading, isError } = useHistorialMatricula(idEstudiante);
  const { data: tiposEstudio = [] } = useTiposEstudio();
  const { data: tiemposValidacion = [] } = useTiemposValidacion();
  const { data: gradosEducacion = [] } = useGradosEducacion();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-700 text-sm transition"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Historial de Matrículas</h1>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-600 text-sm">
          Error al cargar el historial de matrículas.
        </div>
      )}

      {isLoading && (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      )}

      {!isLoading && !isError && data.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-400 text-sm italic">
          Este estudiante no tiene matrículas registradas.
        </div>
      )}

      {!isLoading &&
        !isError &&
        data.map(({ matricula, grados }, idx) => (
          <MatriculaCard
            key={matricula.id}
            matricula={matricula}
            grados={grados}
            idx={idx}
            idEstudiante={idEstudiante!}
            tiposEstudio={tiposEstudio}
            tiemposValidacion={tiemposValidacion}
            gradosEducacion={gradosEducacion}
          />
        ))}
    </div>
  );
}
