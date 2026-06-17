import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDetalleEstudiante } from '../../hooks/useMatriculasAdmin';

function InfoField({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-sm text-gray-800 mt-0.5">{value ?? '—'}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </div>
  );
}

function FileLink({ label, url }: { label: string; url: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-blue-600 hover:underline mt-0.5 inline-block"
        >
          Ver archivo
        </a>
      ) : (
        <p className="text-sm text-gray-400 mt-0.5">—</p>
      )}
    </div>
  );
}

function SkeletonSection() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-32" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DetalleEstudiantePage() {
  const { idEstudiante } = useParams<{ idEstudiante: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useDetalleEstudiante(idEstudiante);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 transition"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Perfil del Estudiante</h1>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-600 text-sm">
          Error al cargar la información del estudiante.
        </div>
      )}

      {isLoading && (
        <>
          <SkeletonSection />
          <SkeletonSection />
          <SkeletonSection />
        </>
      )}

      {data && (
        <>
          {/* Header con foto */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-5">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              {data.fileFoto ? (
                <img src={data.fileFoto} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                  {data.usuarioNombres?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {[data.usuarioNombres, data.usuarioApellido1, data.usuarioApellido2].filter(Boolean).join(' ')}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Doc: {data.usuarioNoDocumento ?? '—'} &nbsp;|&nbsp; Email: {data.usuarioEmail ?? '—'}
              </p>
              <span
                className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  data.usuarioEstado === 'activo'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {data.usuarioEstado}
              </span>
            </div>
          </div>

          {/* Información personal */}
          <Section title="Información Personal">
            <InfoField label="Fecha de nacimiento" value={data.fechaNacimiento} />
            <InfoField label="Edad" value={data.edad} />
            <InfoField label="Sexo" value={data.sexo} />
            <InfoField label="País de nacimiento" value={data.paisNacimiento} />
            <InfoField label="Departamento de nacimiento" value={data.departamentoNacimiento} />
            <InfoField label="Municipio de nacimiento" value={data.municipioNacimiento} />
            <InfoField label="Religión" value={data.religion} />
            <InfoField label="EPS" value={data.eps} />
            <InfoField label="IPS" value={data.ips} />
            <InfoField label="RH" value={data.rh} />
            <InfoField label="Limitaciones" value={data.limitaciones} />
            <InfoField label="Capacidades" value={data.capacidades} />
            <InfoField label="Problema de salud" value={data.problemasalud} />
            <InfoField label="Observaciones" value={data.observaciones} />
          </Section>

          {/* Dirección actual */}
          <Section title="Dirección Actual">
            <InfoField label="Dirección" value={data.direccionActual} />
            <InfoField label="Barrio / Vereda" value={data.barrioVeredaActual} />
            <InfoField label="Ciudad" value={data.ciudadActual} />
            <InfoField label="Departamento" value={data.departamentoActual} />
            <InfoField label="País" value={data.paisActual} />
          </Section>

          {/* Contacto */}
          <Section title="Contacto">
            <InfoField label="Contacto 1" value={data.usuarioContacto1} />
            <InfoField label="Contacto 2" value={data.usuarioContacto2} />
            <InfoField label="Tipo documento" value={data.usuarioIdTipoDocumento} />
            <InfoField label="Fecha expedición doc." value={data.usuarioFechaExpedicionDocumento} />
          </Section>

          {/* Padre */}
          <Section title="Padre">
            <InfoField label="Nombre" value={[data.padreNombre, data.padreApellido1, data.padreApellido2].filter(Boolean).join(' ')} />
            <InfoField label="Cédula" value={data.padreCedula} />
            <InfoField label="Contacto 1" value={data.padreContacto1} />
            <InfoField label="Contacto 2" value={data.padreContacto2} />
            <FileLink label="Documento" url={data.padreFile} />
          </Section>

          {/* Madre */}
          <Section title="Madre">
            <InfoField label="Nombre" value={[data.madreNombre, data.madreApellido1, data.madreApellido2].filter(Boolean).join(' ')} />
            <InfoField label="Cédula" value={data.madreCedula} />
            <InfoField label="Contacto 1" value={data.madreContacto1} />
            <InfoField label="Contacto 2" value={data.madreContacto2} />
            <FileLink label="Documento" url={data.madreFile} />
          </Section>

          {/* Acudiente */}
          <Section title="Acudiente">
            <InfoField label="Nombre" value={[data.acudienteNombre, data.acudienteApellido1, data.acudienteApellido2].filter(Boolean).join(' ')} />
            <InfoField label="Cédula" value={data.acudienteCedula} />
            <InfoField label="Contacto 1" value={data.acudienteContacto1} />
            <InfoField label="Contacto 2" value={data.acudienteContacto2} />
            <FileLink label="Documento" url={data.acudienteFile} />
          </Section>

          {/* Referencias */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2">
              Referencias
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {([
                { nombre: [data.ref1Nombres, data.ref1Apellidos].filter(Boolean).join(' '), tel: data.ref1Tel },
                { nombre: [data.ref2Nombres, data.ref2Apellidos].filter(Boolean).join(' '), tel: data.ref2Tel },
                { nombre: [data.ref3Nombres, data.ref3Apellidos].filter(Boolean).join(' '), tel: data.ref3Tel },
                { nombre: [data.ref4Nombres, data.ref4Apellidos].filter(Boolean).join(' '), tel: data.ref4Tel },
                { nombre: [data.ref5Nombres, data.ref5Apellidos].filter(Boolean).join(' '), tel: data.ref5Tel },
                { nombre: [data.ref6Nombres, data.ref6Apellidos].filter(Boolean).join(' '), tel: data.ref6Tel },
              ] as { nombre: string; tel: string }[])
                .filter((r) => r.nombre.trim())
                .map((r, i) => (
                  <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-1">
                    <p className="text-sm font-medium text-gray-800">{r.nombre}</p>
                    <p className="text-xs text-gray-500">{r.tel || '—'}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* Documentos */}
          <Section title="Documentos">
            <FileLink label="Foto" url={data.fileFoto} />
            <FileLink label="Documento de identidad" url={data.fileDoc} />
            <FileLink label="Diagnóstico" url={data.fileDiagnostico} />
          </Section>
        </>
      )}
    </div>
  );
}
