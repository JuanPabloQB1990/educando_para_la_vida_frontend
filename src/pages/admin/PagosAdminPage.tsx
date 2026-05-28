import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePagosAdmin, useRubros, useVerificarPago } from '../../hooks/usePagosAdmin';
import type { PagoAdmin, PagoAdminFilters } from '../../types/pago';

// ─── Schemas ────────────────────────────────────────────────────────────────
const verificarSchema = z.object({
  observaciones: z.string().optional(),
});
type VerificarForm = z.infer<typeof verificarSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatFecha(fecha: string | null) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function parseArrayField(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return (parsed as string[]).join(', ');
  } catch {
    // no era JSON válido
  }
  return value;
}

function formatMonto(monto: string | null) {
  if (!monto) return '—';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(
    Number(monto)
  );
}

// ─── Badges ──────────────────────────────────────────────────────────────────
function EstadoPagoBadge({ estado }: { estado: PagoAdmin['estado'] }) {
  const map: Record<PagoAdmin['estado'], string> = {
    pendiente: 'bg-yellow-100 text-yellow-700',
    aprobado: 'bg-green-100 text-green-700',
    rechazado: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${map[estado]}`}>
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
}

function EstadoObligacionBadge({ estado }: { estado: PagoAdmin['estadoObligacion'] }) {
  const map: Record<PagoAdmin['estadoObligacion'], string> = {
    pendiente: 'bg-yellow-100 text-yellow-700',
    pagado: 'bg-green-100 text-green-700',
    vencido: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${map[estado]}`}>
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 13 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3.5 bg-gray-200 rounded animate-pulse" style={{ width: `${60 + (i % 3) * 20}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Helpers modal ───────────────────────────────────────────────────────────
function InfoField({
  label,
  value,
  colSpan,
}: {
  label: string;
  value: string | number | React.ReactNode | null | undefined;
  colSpan?: boolean;
}) {
  return (
    <div className={colSpan ? 'col-span-2' : ''}>
      <span className="block text-xs text-gray-400 mb-0.5">{label}</span>
      <span className="block text-gray-800 font-medium">
        {value != null && value !== '' ? value : <span className="text-gray-400 font-normal">—</span>}
      </span>
    </div>
  );
}

function SeccionTitulo({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 pt-1 border-t border-gray-100 first:border-t-0 first:pt-0">
      {children}
    </h3>
  );
}

function FileLink({ href, label }: { href: string | null | undefined; label: string }) {
  if (!href) return <span className="text-gray-400 italic text-xs">No adjunto</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-600 hover:text-indigo-800 underline text-xs font-medium"
    >
      {label}
    </a>
  );
}

// ─── Modal info estudiante ────────────────────────────────────────────────────
function ModalInfoEstudiante({ pago, onClose }: { pago: PagoAdmin; onClose: () => void }) {
  const nombreCompleto = [pago.nombres, pago.apellido1, pago.apellido2].filter(Boolean).join(' ');
  const refs = [
    { n: pago.ref1Nombres, a: pago.ref1Apellidos, t: pago.ref1Tel },
    { n: pago.ref2Nombres, a: pago.ref2Apellidos, t: pago.ref2Tel },
    { n: pago.ref3Nombres, a: pago.ref3Apellidos, t: pago.ref3Tel },
    { n: pago.ref4Nombres, a: pago.ref4Apellidos, t: pago.ref4Tel },
    { n: pago.ref5Nombres, a: pago.ref5Apellidos, t: pago.ref5Tel },
    { n: pago.ref6Nombres, a: pago.ref6Apellidos, t: pago.ref6Tel },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-800">Información del estudiante</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Contenido scrollable */}
        <div className="overflow-y-auto px-6 py-5 space-y-5 text-sm">

          {/* Foto + datos básicos */}
          <section className="flex gap-5">
            <div className="shrink-0">
              {pago.fileFoto ? (
                <img
                  src={pago.fileFoto}
                  alt="Foto estudiante"
                  className="w-24 h-32 object-cover rounded border border-gray-200 shadow-sm"
                />
              ) : (
                <div className="w-24 h-32 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-400 text-xs text-center px-1">
                  Sin foto
                </div>
              )}
            </div>
            <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-2">
              <InfoField label="Nombre completo" value={nombreCompleto} colSpan />
              <InfoField label="Tipo de documento" value={pago.nombreTipoDocumento} />
              <InfoField label="N° documento" value={pago.noDocumento} />
              <InfoField label="Fecha expedición" value={formatFecha(pago.fechaExpedicionDocumento)} />
              <InfoField label="Fecha nacimiento" value={formatFecha(pago.fechaNacimiento)} />
              <InfoField label="Edad" value={pago.edad != null ? `${pago.edad} años` : null} />
              <InfoField label="Sexo" value={pago.sexo} />
              <InfoField label="Religión" value={pago.religion} />
              <InfoField label="RH" value={pago.rh} />
              <InfoField
                label="Estado cuenta"
                value={
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${pago.estadoUsuario === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {pago.estadoUsuario}
                  </span>
                }
              />
            </div>
          </section>

          {/* Contacto */}
          <section>
            <SeccionTitulo>Contacto</SeccionTitulo>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <InfoField label="Correo" value={pago.email} colSpan />
              <InfoField label="Contacto 1" value={pago.contacto1} />
              <InfoField label="Contacto 2" value={pago.contacto2} />
            </div>
          </section>

          {/* Ubicación */}
          <section>
            <SeccionTitulo>Lugar de nacimiento</SeccionTitulo>
            <div className="grid grid-cols-3 gap-x-6 gap-y-2">
              <InfoField label="Municipio" value={pago.municipioNacimiento} />
              <InfoField label="Departamento" value={pago.departamentoNacimiento} />
              <InfoField label="País" value={pago.paisNacimiento} />
            </div>
          </section>

          <section>
            <SeccionTitulo>Dirección actual</SeccionTitulo>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <InfoField label="Dirección" value={pago.direccionActual} colSpan />
              <InfoField label="Barrio / Vereda" value={pago.barrioVeredaActual} />
              <InfoField label="Ciudad" value={pago.ciudadActual} />
              <InfoField label="Departamento" value={pago.departamentoActual} />
              <InfoField label="País" value={pago.paisActual} />
            </div>
          </section>

          {/* Salud */}
          <section>
            <SeccionTitulo>Salud</SeccionTitulo>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <InfoField label="EPS" value={pago.eps} />
              <InfoField label="IPS" value={pago.ips} />
              <InfoField label="Problema de salud" value={pago.problemasalud} colSpan />
              <InfoField label="Limitaciones" value={parseArrayField(pago.limitaciones)} colSpan />
              <InfoField label="Otras limitaciones" value={parseArrayField(pago.otrasLimitaciones)} colSpan />
              <InfoField label="Capacidades" value={parseArrayField(pago.capacidades)} colSpan />
              <InfoField label="CI / Puntaje" value={pago.ciPuntaje} />
            </div>
          </section>

          {/* Observaciones */}
          {pago.observacionesEstudiante && (
            <section>
              <SeccionTitulo>Observaciones</SeccionTitulo>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-3 leading-relaxed">
                {pago.observacionesEstudiante}
              </p>
            </section>
          )}

          {/* Padre */}
          <section>
            <SeccionTitulo>Padre</SeccionTitulo>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <InfoField label="Nombre" value={`${pago.padreNombre} ${pago.padreApellido1} ${pago.padreApellido2}`} colSpan />
              <InfoField label="Cédula" value={pago.padreCedula} />
              <InfoField label="Contacto 1" value={pago.padreContacto1} />
              <InfoField label="Contacto 2" value={pago.padreContacto2} />
              <div>
                <span className="block text-xs text-gray-400 mb-0.5">Documento</span>
                <FileLink href={pago.padreFile} label="Abrir archivo" />
              </div>
            </div>
          </section>

          {/* Madre */}
          <section>
            <SeccionTitulo>Madre</SeccionTitulo>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <InfoField label="Nombre" value={`${pago.madreNombre} ${pago.madreApellido1} ${pago.madreApellido2}`} colSpan />
              <InfoField label="Cédula" value={pago.madreCedula} />
              <InfoField label="Contacto 1" value={pago.madreContacto1} />
              <InfoField label="Contacto 2" value={pago.madreContacto2} />
              <div>
                <span className="block text-xs text-gray-400 mb-0.5">Documento</span>
                <FileLink href={pago.madreFile} label="Abrir archivo" />
              </div>
            </div>
          </section>

          {/* Acudiente */}
          <section>
            <SeccionTitulo>Acudiente</SeccionTitulo>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <InfoField label="Nombre" value={`${pago.acudienteNombre} ${pago.acudienteApellido1} ${pago.acudienteApellido2}`} colSpan />
              <InfoField label="Cédula" value={pago.acudienteCedula} />
              <InfoField label="Contacto 1" value={pago.acudienteContacto1} />
              <InfoField label="Contacto 2" value={pago.acudienteContacto2} />
              <div>
                <span className="block text-xs text-gray-400 mb-0.5">Documento</span>
                <FileLink href={pago.acudienteFile} label="Abrir archivo" />
              </div>
            </div>
          </section>

          {/* Referencias */}
          <section>
            <SeccionTitulo>Referencias</SeccionTitulo>
            <div className="grid grid-cols-2 gap-4">
              {refs.map((r, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Referencia {i + 1}</p>
                  <p className="text-gray-800 font-medium">{r.n} {r.a}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{r.t}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Documentos */}
          <section>
            <SeccionTitulo>Documentos</SeccionTitulo>
            <div className="space-y-2">
              {[
                { label: 'Documento de identidad', href: pago.fileDoc },
                { label: 'Diagnóstico de enfermedad', href: pago.fileDiagnostico },
                { label: 'Compromiso de matrícula', href: pago.fileCompromiso },
                { label: 'Certificado de grados', href: pago.fileCertificadoGrados },
              ].map(({ label, href }) => (
                <div key={label} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                  <span className="text-gray-600">{label}</span>
                  <FileLink href={href} label="Abrir archivo" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ─── Modal verificar ─────────────────────────────────────────────────────────
interface ModalVerificarProps {
  pago: PagoAdmin;
  accion: 'aprobado' | 'rechazado';
  onClose: () => void;
  onConfirm: (observaciones?: string) => void;
  isPending: boolean;
}

function ModalVerificar({ pago, accion, onClose, onConfirm, isPending }: ModalVerificarProps) {
  const { register, handleSubmit } = useForm<VerificarForm>({
    resolver: zodResolver(verificarSchema),
  });

  const submit = (form: VerificarForm) => {
    onConfirm(form.observaciones || undefined);
  };

  const esAprobar = accion === 'aprobado';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">
          {esAprobar ? 'Aprobar' : 'Rechazar'} comprobante
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {pago.nombres} {pago.apellido1} — {pago.nombreRubro} ({formatMonto(pago.montoPagado)})
        </p>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              {...register('observaciones')}
              rows={3}
              placeholder="Motivo del rechazo, nota, etc."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
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
              className={`px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 ${
                esAprobar
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isPending ? 'Procesando...' : esAprobar ? 'Aprobar' : 'Rechazar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function PagosAdminPage() {
  const [filters, setFilters] = useState<PagoAdminFilters>({});
  const [draft, setDraft] = useState<PagoAdminFilters>({});
  const [verificando, setVerificando] = useState<{ pago: PagoAdmin; accion: 'aprobado' | 'rechazado' } | null>(null);
  const [infoEstudiante, setInfoEstudiante] = useState<PagoAdmin | null>(null);

  const { data: pagos, isLoading, isError } = usePagosAdmin(filters);
  const { data: rubros } = useRubros();
  const verificarMutation = useVerificarPago();

  const aplicarFiltros = () => setFilters({ ...draft });

  const limpiarFiltros = () => {
    setDraft({});
    setFilters({});
  };

  const handleVerificar = async (observaciones?: string) => {
    if (!verificando) return;
    await verificarMutation.mutateAsync({
      id: verificando.pago.idPago,
      dto: { accion: verificando.accion, observaciones },
    });
    setVerificando(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Comprobantes de Pago</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Revisa y aprueba o rechaza los comprobantes adjuntados por los estudiantes.
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Rubro</label>
            <select
              value={draft.idRubro ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, idRubro: e.target.value || undefined }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos</option>
              {rubros?.map((r) => (
                <option key={r.idRubro} value={r.idRubro}>
                  {r.nombreRubro}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de pago</label>
            <input
              type="date"
              value={draft.fechaPagoReal ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, fechaPagoReal: e.target.value || undefined }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Estado del pago</label>
            <select
              value={draft.estado ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, estado: e.target.value || undefined }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha verificación</label>
            <input
              type="date"
              value={draft.fechaVerificacion ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, fechaVerificacion: e.target.value || undefined }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={limpiarFiltros}
            className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Limpiar
          </button>
          <button
            onClick={aplicarFiltros}
            className="px-3 py-1.5 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Filtrar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        {isError ? (
          <div className="p-8 text-center text-sm text-red-500">
            Error al cargar los comprobantes.
          </div>
        ) : (
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Estudiante</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Documento</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Rubro</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Cuota</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Monto pagado</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha pago</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Estado pago</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Estado cuota</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Info</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">F. inscripción</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">F. verificación</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Comprobante</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : !pagos?.length ? (
                <tr>
                  <td colSpan={13} className="px-6 py-10 text-center text-gray-400">
                    No hay comprobantes que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                pagos.map((p) => (
                  <tr key={p.idPago} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {p.nombres} {p.apellido1} {p.apellido2 ?? ''}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.noDocumento ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.nombreRubro}</td>
                    <td className="px-4 py-3 text-gray-600">{formatMonto(p.montoCuota)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatMonto(p.montoPagado)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatFecha(p.fechaPagoReal)}</td>
                    <td className="px-4 py-3">
                      <EstadoPagoBadge estado={p.estado} />
                    </td>
                    <td className="px-4 py-3">
                      <EstadoObligacionBadge estado={p.estadoObligacion} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setInfoEstudiante(p)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium underline"
                      >
                        Ver info
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatFecha(p.fechaInscripcion)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatFecha(p.fechaVerificacion)}</td>
                    <td className="px-4 py-3">
                      {p.fileComprobante ? (
                        <a
                          href={p.fileComprobante}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 underline"
                        >
                          Ver
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.estado === 'pendiente' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setVerificando({ pago: p, accion: 'aprobado' })}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => setVerificando({ pago: p, accion: 'rechazado' })}
                            className="text-red-500 hover:text-red-700 font-medium"
                          >
                            Rechazar
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic capitalize">{p.estado}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {infoEstudiante && (
        <ModalInfoEstudiante
          pago={infoEstudiante}
          onClose={() => setInfoEstudiante(null)}
        />
      )}

      {verificando && (
        <ModalVerificar
          pago={verificando.pago}
          accion={verificando.accion}
          onClose={() => setVerificando(null)}
          onConfirm={handleVerificar}
          isPending={verificarMutation.isPending}
        />
      )}
    </div>
  );
}
