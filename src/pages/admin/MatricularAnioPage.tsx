import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  useGradosByMatricula,
  useObligacionesByMatricula,
  useMatricularAnio,
  useEliminarObligacion,
  useRubros,
  useEstudianteMatricula,
  useUpdateEstudianteMatricula,
  useCreateGradoPorMatricula,
  useUpdateGradoPorMatricula,
  useDeleteGradoPorMatricula,
} from '../../hooks/usePagosAdmin';
import { useAniosElectivos } from '../../hooks/useAnioElectivo';
import { useTiposEstudio } from '../../hooks/useTipoEstudio';
import { useTiemposValidacion } from '../../hooks/useTiempoValidacion';
import { useGradosEducacion } from '../../hooks/useGradosEducacion';
import type { PagoAdmin, MatricularAnioDto } from '../../types/pago';

const MESES = [
  { index: 0, nombre: 'Enero' },
  { index: 1, nombre: 'Febrero' },
  { index: 2, nombre: 'Marzo' },
  { index: 3, nombre: 'Abril' },
  { index: 4, nombre: 'Mayo' },
  { index: 5, nombre: 'Junio' },
  { index: 6, nombre: 'Julio' },
  { index: 7, nombre: 'Agosto' },
  { index: 8, nombre: 'Septiembre' },
  { index: 9, nombre: 'Octubre' },
  { index: 10, nombre: 'Noviembre' },
  { index: 11, nombre: 'Diciembre' },
];

function formatMonto(monto: string | null) {
  if (!monto) return '—';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(monto));
}

type GradoEstado = 'pendiente' | 'aprobado' | 'reprobado' | 'retirado';
const GRADO_ESTADOS: GradoEstado[] = ['pendiente', 'aprobado', 'reprobado', 'retirado'];

const GRADO_BADGE: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  cursando: 'bg-blue-100 text-blue-700',
  aprobado: 'bg-green-100 text-green-700',
  reprobado: 'bg-red-100 text-red-700',
  retirado: 'bg-orange-100 text-orange-700',
};

const OBLIGACION_BADGE: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  pagado: 'bg-green-100 text-green-700',
  vencido: 'bg-red-100 text-red-700',
};

export default function MatricularAnioPage() {
  const { idEstudianteMatricula } = useParams<{ idEstudianteMatricula: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const pago = (location.state as { pago?: PagoAdmin } | null)?.pago;

  // ── Agregar obligaciones ──
  const [idAnioElectivo, setIdAnioElectivo] = useState('');
  const [idRubro, setIdRubro] = useState('');
  const [meses, setMeses] = useState<number[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ── Editar matrícula ──
  const [idTipoEstudio, setIdTipoEstudio] = useState('');
  const [idTiempoValidacion, setIdTiempoValidacion] = useState('');

  // ── Agregar grado ──
  const [nuevoIdGrado, setNuevoIdGrado] = useState('');
  const [nuevoEstadoGrado, setNuevoEstadoGrado] = useState<GradoEstado>('pendiente');

  // ── Editar estado grado inline ──
  const [editingGradoEstado, setEditingGradoEstado] = useState<Record<string, GradoEstado>>({});

  const { data: grados, isLoading: loadingGrados } = useGradosByMatricula(idEstudianteMatricula ?? null);
  const { data: obligaciones, isLoading: loadingObligaciones } = useObligacionesByMatricula(idEstudianteMatricula ?? null);
  const { data: anios } = useAniosElectivos();
  const { data: rubros } = useRubros();
  const { data: tiposEstudio } = useTiposEstudio();
  const { data: tiemposValidacion } = useTiemposValidacion();
  const { data: gradosEducacion } = useGradosEducacion();
  const { data: matriculaData } = useEstudianteMatricula(idEstudianteMatricula ?? null);
  const matricularMutation = useMatricularAnio();
  const eliminarObligacionMutation = useEliminarObligacion();
  const updateMatriculaMutation = useUpdateEstudianteMatricula();
  const createGradoMutation = useCreateGradoPorMatricula();
  const updateGradoMutation = useUpdateGradoPorMatricula();
  const deleteGradoMutation = useDeleteGradoPorMatricula();

  // Pre-cargar valores actuales de la matrícula
  useEffect(() => {
    if (matriculaData) {
      setIdTipoEstudio(matriculaData.idTipoEstudio ?? '');
      setIdTiempoValidacion(matriculaData.idTiempoValidacion ?? '');
    }
  }, [matriculaData]);

  const tipoSeleccionado = tiposEstudio?.find((t) => t.id === idTipoEstudio);
  const esValidacionGrados = tipoSeleccionado?.nombre?.toLowerCase().includes('validac') ?? false;

  const toggleMes = (index: number) => {
    setMeses((prev) =>
      prev.includes(index) ? prev.filter((m) => m !== index) : [...prev, index]
    );
  };

  const handleGuardarMatricula = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idEstudianteMatricula) return;
    await updateMatriculaMutation.mutateAsync({
      id: idEstudianteMatricula,
      data: {
        id_tipo_estudio: idTipoEstudio || null,
        id_tiempo_validacion: esValidacionGrados ? (idTiempoValidacion || null) : null,
      },
    });
  };

  const handleAgregarGrado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idEstudianteMatricula || !nuevoIdGrado) return;
    await createGradoMutation.mutateAsync({
      id_estudiante_matricula: idEstudianteMatricula,
      id_grado_educacion: nuevoIdGrado,
      estado: nuevoEstadoGrado,
    });
    setNuevoIdGrado('');
    setNuevoEstadoGrado('pendiente');
  };

  const handleGuardarEstadoGrado = async (idGradoEducacion: string) => {
    if (!idEstudianteMatricula) return;
    const estado = editingGradoEstado[idGradoEducacion];
    if (!estado) return;
    await updateGradoMutation.mutateAsync({
      idEstudianteMatricula,
      idGradoEducacion,
      estado,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!idAnioElectivo) errs.idAnioElectivo = 'Seleccione un año electivo';
    if (!idRubro) errs.idRubro = 'Seleccione un rubro';
    if (meses.length === 0) errs.meses = 'Seleccione al menos un mes';
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    const dto: MatricularAnioDto = {
      idAnioElectivo,
      idRubro,
      meses: [...meses].sort((a, b) => a - b),
    };
    await matricularMutation.mutateAsync({ id: idEstudianteMatricula!, dto });
    setIdAnioElectivo('');
    setIdRubro('');
    setMeses([]);
    setFormErrors({});
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-700 text-sm transition"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Agregar rubro al año electivo</h1>
      </div>

      {/* Info del estudiante */}
      {pago && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Información del estudiante
          </h2>
          <p className="text-base font-semibold text-gray-800">
            {pago.nombres} {pago.apellido1} {pago.apellido2 ?? ''}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
            <div>
              <span className="text-gray-400">Tipo de estudio: </span>
              <span className="font-medium">{pago.nombreTipoEstudio ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-400">Tiempo de validación: </span>
              <span className="font-medium">
                {pago.tiempoValidacion != null ? `${pago.tiempoValidacion} meses` : '—'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Editar matrícula */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Editar matrícula
        </h2>
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
              {tiposEstudio?.map((t) => (
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
                {tiemposValidacion?.map((tv) => (
                  <option key={tv.id} value={tv.id}>{tv.tiempo} meses</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateMatriculaMutation.isPending}
              className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {updateMatriculaMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>

      {/* Gestionar grados matriculados */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Grados matriculados
        </h2>

        {loadingGrados ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-9 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : grados && grados.length > 0 ? (
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
                {grados.map((g) => {
                  const estadoEditing = editingGradoEstado[g.idGradoEducacion] ?? (g.estado as GradoEstado);
                  const changed = editingGradoEstado[g.idGradoEducacion] !== undefined;
                  return (
                    <tr key={g.idGradoEducacion}>
                      <td className="px-3 py-2 text-gray-700 font-medium">{g.nombreGrado}</td>
                      <td className="px-3 py-2">
                        <select
                          value={estadoEditing}
                          onChange={(e) =>
                            setEditingGradoEstado((prev) => ({
                              ...prev,
                              [g.idGradoEducacion]: e.target.value as GradoEstado,
                            }))
                          }
                          className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        >
                          {GRADO_ESTADOS.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {changed && (
                            <button
                              type="button"
                              onClick={() => handleGuardarEstadoGrado(g.idGradoEducacion)}
                              disabled={updateGradoMutation.isPending}
                              className="text-indigo-600 hover:text-indigo-800 text-xs font-medium disabled:opacity-50"
                            >
                              Guardar
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              deleteGradoMutation.mutate({
                                idEstudianteMatricula: idEstudianteMatricula!,
                                idGradoEducacion: g.idGradoEducacion,
                              })
                            }
                            disabled={deleteGradoMutation.isPending}
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
        ) : (
          <p className="text-sm text-gray-400 italic">Sin grados matriculados.</p>
        )}

        {/* Formulario agregar grado */}
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
                {gradosEducacion?.map((g) => (
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
                {GRADO_ESTADOS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createGradoMutation.isPending || !nuevoIdGrado}
              className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
            >
              {createGradoMutation.isPending ? 'Agregando...' : 'Agregar grado'}
            </button>
          </div>
        </form>
      </div>

      {/* Obligaciones de pago */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Obligaciones de pago
        </h2>
        {loadingObligaciones ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : obligaciones && obligaciones.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="text-left px-3 py-2 font-medium text-xs">Rubro</th>
                  <th className="text-left px-3 py-2 font-medium text-xs">Vencimiento</th>
                  <th className="text-left px-3 py-2 font-medium text-xs">Estado</th>
                  <th className="text-left px-3 py-2 font-medium text-xs">Verificado por</th>
                  <th className="text-left px-3 py-2 font-medium text-xs">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {obligaciones.map((ob) => {
                  const verificador = ob.verificadoPorNombres
                    ? [ob.verificadoPorNombres, ob.verificadoPorApellido1, ob.verificadoPorApellido2].filter(Boolean).join(' ')
                    : null;
                  return (
                  <tr key={ob.idObligacionPago}>
                    <td className="px-3 py-2 text-gray-700">{ob.nombreRubro}</td>
                    <td className="px-3 py-2 text-gray-600">
                      {ob.fechaVencimiento ? ob.fechaVencimiento.slice(0, 10) : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${OBLIGACION_BADGE[ob.estado] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {ob.estado}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600 text-xs">{verificador ?? '—'}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() =>
                          eliminarObligacionMutation.mutate({
                            id: ob.idObligacionPago,
                            idEstudianteMatricula: idEstudianteMatricula!,
                          })
                        }
                        disabled={eliminarObligacionMutation.isPending}
                        className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">Sin obligaciones registradas.</p>
        )}
      </div>

      {/* Formulario agregar rubro */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Agregar obligaciones de pago
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Año electivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año electivo</label>
            <select
              value={idAnioElectivo}
              onChange={(e) => {
                setIdAnioElectivo(e.target.value);
                setFormErrors((p) => ({ ...p, idAnioElectivo: '' }));
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Seleccione un año</option>
              {anios?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.anio} — {a.estado}
                </option>
              ))}
            </select>
            {formErrors.idAnioElectivo && (
              <p className="mt-1 text-xs text-red-500">{formErrors.idAnioElectivo}</p>
            )}
          </div>

          {/* Rubro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rubro</label>
            <select
              value={idRubro}
              onChange={(e) => {
                setIdRubro(e.target.value);
                setFormErrors((p) => ({ ...p, idRubro: '' }));
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Seleccione un rubro</option>
              {rubros?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}{r.montoBase ? ` — ${formatMonto(r.montoBase)}` : ''}
                </option>
              ))}
            </select>
            {formErrors.idRubro && (
              <p className="mt-1 text-xs text-red-500">{formErrors.idRubro}</p>
            )}
          </div>

          {/* Meses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meses{' '}
              <span className="text-xs text-gray-400 font-normal">(vencimiento el día 27 de cada mes)</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {MESES.map((mes) => (
                <label key={mes.index} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={meses.includes(mes.index)}
                    onChange={() => {
                      toggleMes(mes.index);
                      setFormErrors((p) => ({ ...p, meses: '' }));
                    }}
                    className="cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{mes.nombre}</span>
                </label>
              ))}
            </div>
            {formErrors.meses && (
              <p className="mt-1 text-xs text-red-500">{formErrors.meses}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={matricularMutation.isPending}
              className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {matricularMutation.isPending ? 'Agregando...' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
