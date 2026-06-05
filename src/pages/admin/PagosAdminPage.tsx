import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePagosAdmin, useRubros, useVerificarPago, useMatricularAnio, useGradosByMatricula, useObligacionesByMatricula, useEliminarObligacion } from '../../hooks/usePagosAdmin';
import { useAniosElectivos } from '../../hooks/useAnioElectivo';
import type { PagoAdmin, PagoAdminFilters, MatricularAnioDto } from '../../types/pago';
import type { AnioElectivo } from '../../types/anioElectivo';
import type { Rubro } from '../../types/rubro';

// ─── Schemas ────────────────────────────────────────────────────────────────
const verificarSchema = z.object({
  observaciones: z.string().optional(),
});
type VerificarForm = z.infer<typeof verificarSchema>;

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
  onClose: () => void;
  onConfirm: (dto: { accion: 'aprobado' | 'rechazado'; idObligacionPago?: string; montoPagado?: string; observaciones?: string }) => void;
  isPending: boolean;
}

function ModalVerificar({ pago, onClose, onConfirm, isPending }: ModalVerificarProps) {
  const [accion, setAccion] = useState<'aprobado' | 'rechazado'>(
    pago.estado === 'rechazado' ? 'rechazado' : 'aprobado'
  );
  const [idObligacionPago, setIdObligacionPago] = useState(pago.idObligacionPago);
  const [montoPagado, setMontoPagado] = useState(pago.montoPagado ?? '');
  const [observaciones, setObservaciones] = useState(pago.observaciones ?? '');

  const { data: obligaciones, isLoading: loadingObligaciones } = useObligacionesByMatricula(pago.idEstudianteMatricula);

  // Mostrar pendiente/vencido + la obligación actual aunque esté pagada
  const obligacionesFiltradas = obligaciones
    ? obligaciones.filter(
        (o) => o.estado === 'pendiente' || o.estado === 'vencido' || o.idObligacionPago === pago.idObligacionPago
      )
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      accion,
      idObligacionPago: idObligacionPago !== pago.idObligacionPago ? idObligacionPago : undefined,
      montoPagado: montoPagado !== pago.montoPagado ? montoPagado : undefined,
      observaciones: observaciones || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-800">Verificar comprobante</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <p className="text-sm text-gray-600 mb-5">
            <span className="font-medium text-gray-800">{pago.nombres} {pago.apellido1}</span>
            {pago.apellido2 ? ` ${pago.apellido2}` : ''}
            {pago.fileComprobante && (
              <a
                href={pago.fileComprobante}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 text-indigo-600 hover:text-indigo-800 underline text-xs font-medium"
              >
                Ver comprobante
              </a>
            )}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Obligación de pago</label>
              {loadingObligaciones ? (
                <div className="h-9 bg-gray-100 rounded-lg animate-pulse" />
              ) : (
                <select
                  value={idObligacionPago}
                  onChange={(e) => setIdObligacionPago(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {obligacionesFiltradas.map((o) => (
                    <option key={o.idObligacionPago} value={o.idObligacionPago}>
                      {o.nombreRubro}
                      {o.fechaVencimiento ? ` — vence ${o.fechaVencimiento.slice(0, 10)}` : ''}
                      {' '}({o.estado})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto pagado</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={montoPagado}
                onChange={(e) => setMontoPagado(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
                placeholder="Motivo del rechazo, nota, etc."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Acción</label>
              <select
                value={accion}
                onChange={(e) => setAccion(e.target.value as 'aprobado' | 'rechazado')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="aprobado">Aprobar</option>
                <option value="rechazado">Rechazar</option>
              </select>
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
                  accion === 'aprobado' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isPending ? 'Procesando...' : accion === 'aprobado' ? 'Aprobar' : 'Rechazar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Modal matricular año ─────────────────────────────────────────────────────
interface ModalMatricularAnioProps {
  pago: PagoAdmin;
  anios: AnioElectivo[];
  rubros: Rubro[];
  onClose: () => void;
  onConfirm: (dto: MatricularAnioDto) => Promise<void>;
  onEliminarObligacion: (id: string) => Promise<void>;
  isPending: boolean;
  isDeletingObligacion: boolean;
}

function ModalMatricularAnio({ pago, anios, rubros, onClose, onConfirm, onEliminarObligacion, isPending, isDeletingObligacion }: ModalMatricularAnioProps) {
  const [idAnioElectivo, setIdAnioElectivo] = useState('');
  const [idRubro, setIdRubro] = useState('');
  const [meses, setMeses] = useState<number[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: grados, isLoading: loadingGrados } = useGradosByMatricula(pago.idEstudianteMatricula);
  const { data: obligaciones, isLoading: loadingObligaciones } = useObligacionesByMatricula(pago.idEstudianteMatricula);
  
  const toggleMes = (index: number) => {
    setMeses((prev) =>
      prev.includes(index) ? prev.filter((m) => m !== index) : [...prev, index]
    );
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
    await onConfirm({ idAnioElectivo, idRubro, meses: [...meses].sort((a, b) => a - b) });
    setMeses([]);
  };

  const estadoGradoBadge: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-700',
    finalizado: 'bg-green-100 text-green-700',
    retirado: 'bg-red-100 text-red-700',
  };

  const estadoObligacionBadge: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-700',
    pagado: 'bg-green-100 text-green-700',
    vencido: 'bg-red-100 text-red-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-800">Matricular al año electivo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-5">
          {/* Info del estudiante */}
          <div>
            <p className="text-sm font-medium text-gray-800">
              {pago.nombres} {pago.apellido1} {pago.apellido2 ?? ''}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
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

          {/* Grados matriculados */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Grados matriculados</p>
            {loadingGrados ? (
              <div className="space-y-1.5">
                {[1, 2].map((i) => (
                  <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : grados && grados.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {grados.map((g) => (
                  <span
                    key={g.idGradoEducacion}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${estadoGradoBadge[g.estado] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {g.nombreGrado}
                    <span className="opacity-70 capitalize">· {g.estado}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Sin grados matriculados.</p>
            )}
          </div>

          {/* Obligaciones de pago */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Obligaciones de pago</p>
            {loadingObligaciones ? (
              <div className="space-y-1.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : obligaciones && obligaciones.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500">
                      <th className="text-left px-2 py-1.5 font-medium">Rubro</th>
                      <th className="text-left px-2 py-1.5 font-medium">Vencimiento</th>
                      <th className="text-left px-2 py-1.5 font-medium">Estado</th>
                      <th className="text-left px-2 py-1.5 font-medium">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {obligaciones.map((ob) => (
                      <tr key={ob.idObligacionPago}>
                        <td className="px-2 py-1.5 text-gray-700">{ob.nombreRubro}</td>
                        <td className="px-2 py-1.5 text-gray-600">
                          {ob.fechaVencimiento ? ob.fechaVencimiento.slice(0, 10) : '—'}
                        </td>
                        <td className="px-2 py-1.5">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-medium capitalize ${estadoObligacionBadge[ob.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                            {ob.estado}
                          </span>
                        </td>
                        <td className="px-2 py-1.5">
                          <button
                            type="button"
                            onClick={() => onEliminarObligacion(ob.idObligacionPago)}
                            disabled={isDeletingObligacion}
                            className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Sin obligaciones registradas.</p>
            )}
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                {anios.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.anio} — {a.estado}
                  </option>
                ))}
              </select>
              {formErrors.idAnioElectivo && (
                <p className="mt-1 text-xs text-red-500">{formErrors.idAnioElectivo}</p>
              )}
            </div>

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
                {rubros.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}{r.montoBase ? ` — ${formatMonto(r.montoBase)}` : ''}
                  </option>
                ))}
              </select>
              {formErrors.idRubro && (
                <p className="mt-1 text-xs text-red-500">{formErrors.idRubro}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meses{' '}
                <span className="text-xs text-gray-400 font-normal">(vencimiento el día 27 de cada mes)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
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
                {isPending ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function PagosAdminPage() {
  const [filters, setFilters] = useState<PagoAdminFilters>({});
  const [draft, setDraft] = useState<PagoAdminFilters>({});
  const [verificando, setVerificando] = useState<PagoAdmin | null>(null);
  const [infoEstudiante, setInfoEstudiante] = useState<PagoAdmin | null>(null);
  const [matriculando, setMatriculando] = useState<PagoAdmin | null>(null);

  const { data: pagos, isLoading, isError } = usePagosAdmin(filters);
  const { data: rubros } = useRubros();
  const { data: anios } = useAniosElectivos();
  const verificarMutation = useVerificarPago();
  const matricularMutation = useMatricularAnio();
  const eliminarObligacionMutation = useEliminarObligacion();

  const aplicarFiltros = () => setFilters({ ...draft });

  const limpiarFiltros = () => {
    setDraft({});
    setFilters({});
  };

  const handleVerificar = async (dto: { accion: 'aprobado' | 'rechazado'; idObligacionPago?: string; montoPagado?: string; observaciones?: string }) => {
    if (!verificando) return;
    await verificarMutation.mutateAsync({ id: verificando.idPago, dto });
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Rubro</label>
            <select
              value={draft.idRubro ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, idRubro: e.target.value || undefined }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos</option>
              {rubros?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">N° documento estudiante</label>
            <input
              type="text"
              placeholder="Buscar por documento"
              value={draft.noDocumento ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, noDocumento: e.target.value || undefined }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cédula del padre</label>
            <input
              type="text"
              placeholder="Buscar por cédula"
              value={draft.padreCedula ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, padreCedula: e.target.value || undefined }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cédula de la madre</label>
            <input
              type="text"
              placeholder="Buscar por cédula"
              value={draft.madreCedula ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, madreCedula: e.target.value || undefined }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cédula del acudiente</label>
            <input
              type="text"
              placeholder="Buscar por cédula"
              value={draft.acudienteCedula ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, acudienteCedula: e.target.value || undefined }))}
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
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Monto pagado</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha pago</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Estado pago</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Estado cuota</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Info</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">F. inscripción</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">F. verificación</th>
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
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                      >
                        Ver info
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatFecha(p.fechaInscripcion)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatFecha(p.fechaVerificacion)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => setVerificando(p)}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-medium text-left"
                        >
                          Verificar
                        </button>
                        <button
                          onClick={() => setMatriculando(p)}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-medium text-left"
                        >
                          Agregar rubro
                        </button>
                      </div>
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
          pago={verificando}
          onClose={() => setVerificando(null)}
          onConfirm={handleVerificar}
          isPending={verificarMutation.isPending}
        />
      )}

      {matriculando && (
        <ModalMatricularAnio
          pago={matriculando}
          anios={anios ?? []}
          rubros={rubros ?? []}
          onClose={() => setMatriculando(null)}
          onConfirm={async (dto) => {
            await matricularMutation.mutateAsync({
              id: matriculando.idEstudianteMatricula,
              dto,
            });
          }}
          onEliminarObligacion={async (id) => {
            await eliminarObligacionMutation.mutateAsync({
              id,
              idEstudianteMatricula: matriculando.idEstudianteMatricula,
            });
          }}
          isPending={matricularMutation.isPending}
          isDeletingObligacion={eliminarObligacionMutation.isPending}
        />
      )}
    </div>
  );
}
