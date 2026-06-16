import { useDireccionGradoEstudiante } from '../../hooks/useDireccionGrado';
import { usePagosEstudiante } from '../../hooks/usePagosEstudiante';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse max-w-lg">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
      <div className="h-3 bg-gray-100 rounded w-1/2 mb-5" />
      <div className="h-8 bg-gray-100 rounded" />
    </div>
  );
}

export default function ClaseVirtualEstudiantePage() {
  const { data: direccion, isLoading, isError } = useDireccionGradoEstudiante();
  const { data: pagosData } = usePagosEstudiante();

  const tieneVencida = (pagosData?.obligaciones ?? []).some(
    (ob) => ob.estadoObligacion === 'vencido'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Clase Virtual</h1>
        <p className="text-sm text-gray-500 mt-0.5">Link de la clase virtual de tu grado</p>
      </div>

      {tieneVencida && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 max-w-lg">
          <span className="text-red-500 text-lg shrink-0">⚠️</span>
          <p className="text-sm text-red-700">
            Tienes una o más mensualidades vencidas. No puedes ver el link de la clase virtual
            hasta que regularices tu situación de pago.
          </p>
        </div>
      )}

      {isLoading && <SkeletonCard />}

      {isError && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-lg">
          <p className="text-sm text-gray-400 text-center">
            No se pudo obtener la información de tu grado.
          </p>
        </div>
      )}

      {!isLoading && !isError && !direccion && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-lg text-center">
          <p className="text-sm text-gray-400">
            No hay un director de grado asignado para tu grado en el año electivo actual.
          </p>
        </div>
      )}

      {!isLoading && !isError && direccion && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-lg">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">{direccion.nombreGrado}</h2>
              {direccion.nombreUsuario && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Director(a): {direccion.nombreUsuario}
                </p>
              )}
              {direccion.ultimaActualizacionLink && !tieneVencida && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Actualizado:{' '}
                  {new Date(direccion.ultimaActualizacionLink).toLocaleDateString('es', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
            {!tieneVencida && (
              direccion.linkClaseVirtual ? (
                <span className="shrink-0 text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Link activo
                </span>
              ) : (
                <span className="shrink-0 text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  Sin link
                </span>
              )
            )}
          </div>

          {tieneVencida ? (
            <div className="bg-red-50 rounded-lg px-4 py-3">
              <p className="text-xs text-red-600 font-medium">
                Link no disponible por mensualidad vencida.
              </p>
            </div>
          ) : direccion.linkClaseVirtual ? (
            <a
              href={direccion.linkClaseVirtual}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Unirme a la clase virtual
            </a>
          ) : (
            <p className="text-sm text-gray-400 text-center py-2">
              El profesor aún no ha asignado el link de la clase virtual.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
