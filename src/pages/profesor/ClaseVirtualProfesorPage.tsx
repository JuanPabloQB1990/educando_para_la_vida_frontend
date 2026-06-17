import React, { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAniosElectivos } from '../../hooks/useAnioElectivo';
import { useDireccionesGradoByProfesor, useUpdateLinkClaseVirtual } from '../../hooks/useDireccionGrado';
import type { DireccionGrado } from '../../types/direccionGrado';

// ─── Tarjeta de grado ─────────────────────────────────────────────────────────

interface GradoCardProps {
  grado: DireccionGrado;
  onSave: (id: string, link: string) => Promise<void>;
  isSaving: boolean;
}

function GradoCard({ grado, onSave, isSaving }: GradoCardProps) {
  const [link, setLink] = useState(grado.linkClaseVirtual ?? '');
  const [editando, setEditando] = useState(false);

  const handleSave = async () => {
    const trimmed = link.trim();
    if (!trimmed) return;
    await onSave(grado.id, trimmed);
    setEditando(false);
  };

  const handleCancel = () => {
    setLink(grado.linkClaseVirtual ?? '');
    setEditando(false);
  };

  const ultimaActualizacion = grado.ultimaActualizacionLink
    ? new Date(grado.ultimaActualizacionLink).toLocaleDateString('es', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            {grado.nombreGrado ?? 'Sin grado'}
            {grado.nombreBloque && (
              <span className="ml-2 text-xs font-normal text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                {grado.nombreBloque}
              </span>
            )}
          </h3>
          {ultimaActualizacion && (
            <p className="text-xs text-gray-400 mt-0.5">Actualizado: {ultimaActualizacion}</p>
          )}
        </div>
        {grado.linkClaseVirtual ? (
          <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0">
            Link activo
          </span>
        ) : (
          <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">
            Sin link
          </span>
        )}
      </div>

      {!editando ? (
        <div className="space-y-3">
          {grado.linkClaseVirtual ? (
            <a
              href={grado.linkClaseVirtual}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-violet-600 hover:underline truncate"
              title={grado.linkClaseVirtual}
            >
              {grado.linkClaseVirtual}
            </a>
          ) : (
            <p className="text-xs text-gray-400">No hay link asignado para este grado.</p>
          )}
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="w-full text-sm text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg py-2 font-medium"
          >
            {grado.linkClaseVirtual ? 'Actualizar link' : 'Agregar link'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              URL de la clase virtual *
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              autoFocus
              placeholder="https://meet.google.com/..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg py-2"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !link.trim()}
              className="flex-1 text-sm text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg py-2 font-medium"
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ClaseVirtualProfesorPage() {
  const { user } = useAuth();

  const anioActual = new Date().getFullYear();
  const { data: anios = [] } = useAniosElectivos();
  const idAnioActual = useMemo(
    () => anios.find((a) => a.anio === anioActual)?.id ?? '',
    [anios, anioActual]
  );

  const { data: grados = [], isLoading, isError } = useDireccionesGradoByProfesor(
    user?.id,
    idAnioActual || undefined
  );

  const updateLink = useUpdateLinkClaseVirtual(user?.id, idAnioActual || undefined);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Clase Virtual</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Gestiona los links de clase virtual para los grados que diriges.
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/3 mb-4" />
              <div className="h-8 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-sm text-red-500">
          Error al cargar los grados. Intenta de nuevo.
        </div>
      )}

      {!isLoading && !isError && grados.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-sm text-gray-400">
          No estás asignado como director de grado en el año electivo actual.
        </div>
      )}

      {!isLoading && !isError && grados.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {grados.map((grado) => (
            <GradoCard
              key={grado.id}
              grado={grado}
              isSaving={updateLink.isPending}
              onSave={async (id, link) => {
                await updateLink.mutateAsync({ id, link });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
