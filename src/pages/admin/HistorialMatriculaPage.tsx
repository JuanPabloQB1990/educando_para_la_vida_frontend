import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHistorialMatricula } from '../../hooks/useMatriculasAdmin';
import type { GradoMatricula } from '../../types/pagosEstudiante';

type GradoEstado = GradoMatricula['estado'];

const GRADO_ESTADO_MAP: Record<GradoEstado, string> = {
  pendiente: 'bg-gray-100 text-gray-600',
  cursando: 'bg-blue-100 text-blue-700',
  aprobado: 'bg-green-100 text-green-700',
  reprobado: 'bg-red-100 text-red-700',
  retirado: 'bg-orange-100 text-orange-700',
};

function GradoBadge({ estado }: { estado: GradoEstado }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${GRADO_ESTADO_MAP[estado]}`}>
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
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
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="text-xs text-blue-600 hover:underline"
    >
      {label}
    </a>
  );
}

function formatFecha(fecha: string | null) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

export default function HistorialMatriculaPage() {
  const { idEstudiante } = useParams<{ idEstudiante: string }>();
  const navigate = useNavigate();
  const { data = [], isLoading, isError } = useHistorialMatricula(idEstudiante);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 transition"
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-400 text-sm">
          Este estudiante no tiene matrículas registradas.
        </div>
      )}

      {!isLoading &&
        !isError &&
        data.map(({ matricula, grados }, idx) => (
          <div key={matricula.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            {/* Header de la matrícula */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">
                Matrícula #{idx + 1}
              </h2>
              <AnioEstadoBadge estado={matricula.anioElectivoEstado ?? null} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">Año electivo</p>
                <p className="text-sm text-gray-800 font-semibold mt-0.5">
                  {matricula.anioElectivoAnio ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Tipo de estudio</p>
                <p className="text-sm text-gray-800 mt-0.5">{matricula.nombreTipoEstudio ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Meses de validación</p>
                <p className="text-sm text-gray-800 mt-0.5">
                  {matricula.mesesTiempoValidacion != null ? `${matricula.mesesTiempoValidacion} meses` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Fecha inscripción</p>
                <p className="text-sm text-gray-800 mt-0.5">{formatFecha(matricula.fechaInscripcion)}</p>
              </div>
            </div>

            {/* Archivos */}
            <div className="flex gap-4 flex-wrap">
              <FileLink label="Compromiso" url={matricula.fileCompromiso} />
              <FileLink label="Cert. grados" url={matricula.fileCertificadoGrados} />
            </div>

            {/* Grados */}
            <div>
              <p className="text-xs text-gray-500 font-medium mb-2">Grados</p>
              {grados.length === 0 ? (
                <p className="text-sm text-gray-400">Sin grados registrados.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {grados.map((g) => (
                    <div
                      key={g.idGradoEducacion}
                      className="flex items-center gap-2 border border-gray-100 rounded-lg px-3 py-2 text-sm"
                    >
                      <span className="text-gray-700">{g.nombreGrado}</span>
                      <GradoBadge estado={g.estado} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
