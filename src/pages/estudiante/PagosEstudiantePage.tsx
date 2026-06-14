import React, { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { usePagosEstudiante } from '../../hooks/usePagosEstudiante';
import pagosEstudianteService from '../../services/pagosEstudianteService';
import type { ObligacionConPago } from '../../types/pagosEstudiante';

function formatDate(val: string | null | undefined): string {
  if (!val) return '—';
  return val.split('T')[0];
}

function formatMonto(val: number | null | undefined): string {
  if (val === null || val === undefined) return '—';
  return `$${Number(val).toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;
}

const estadoObligacionColor: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  pagado: 'bg-green-100 text-green-800',
  vencido: 'bg-red-100 text-red-800',
};

const estadoPagoColor: Record<string, string> = {
  pendiente: 'bg-blue-100 text-blue-800',
  aprobado: 'bg-green-100 text-green-800',
  rechazado: 'bg-red-100 text-red-800',
};

function Badge({ text, colorClass }: { text: string; colorClass: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${colorClass}`}>
      {text}
    </span>
  );
}

function ObligacionRow({ ob }: { ob: ObligacionConPago }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const canUpload = (ob.estadoObligacion === 'pendiente' || ob.estadoObligacion === 'vencido') && ob.pago === null;
  const canReupload = ob.pago !== null && ob.pago.estado === 'rechazado';

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await pagosEstudianteService.subirComprobante(ob.idObligacionPago, file);
      toast.success('Comprobante subido correctamente');
      queryClient.invalidateQueries({ queryKey: ['pagosEstudiante'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al subir el comprobante');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-700">{ob.nombreRubro}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{formatMonto(ob.montoCuota)}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{formatDate(ob.fechaVencimiento)}</td>
      <td className="px-4 py-3">
        <Badge
          text={ob.estadoObligacion}
          colorClass={estadoObligacionColor[ob.estadoObligacion] ?? 'bg-gray-100 text-gray-700'}
        />
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">
        {ob.pago ? formatDate(ob.pago.fechaPagoReal) : '—'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">
        {ob.pago ? formatMonto(ob.pago.montoPagado) : '—'}
      </td>
      <td className="px-4 py-3">
        {ob.pago ? (
          <Badge
            text={ob.pago.estado}
            colorClass={estadoPagoColor[ob.pago.estado] ?? 'bg-gray-100 text-gray-700'}
          />
        ) : (
          <span className="text-xs text-gray-400">Sin comprobante</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm">
        {ob.pago?.fileComprobante ? (
          <a
            href={ob.pago.fileComprobante}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline text-xs"
          >
            Ver comprobante
          </a>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px] truncate" title={ob.pago?.observaciones ?? ''}>
        {ob.pago?.observaciones || '—'}
      </td>
      <td className="px-4 py-3">
        {(canUpload || canReupload) && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={`text-xs px-2 py-1 rounded font-medium disabled:opacity-50 ${
                canReupload
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
            >
              {uploading ? 'Subiendo...' : canReupload ? 'Volver a cargar' : 'Subir comprobante'}
            </button>
          </>
        )}
      </td>
    </tr>
  );
}

export default function PagosEstudiantePage() {
  const { data, isLoading, isError, error } = usePagosEstudiante();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    const msg = (error as any)?.response?.data?.message ?? 'Error al cargar la información de pagos.';
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 text-sm">
        {msg}
      </div>
    );
  }

  if (!data) return null;

  const { matricula, grados, obligaciones } = data;

  const pendientes = obligaciones.filter(o => o.estadoObligacion === 'pendiente').length;
  const vencidas = obligaciones.filter(o => o.estadoObligacion === 'vencido').length;
  const pagadas = obligaciones.filter(o => o.estadoObligacion === 'pagado').length;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Mis Pagos</h1>

      {/* Resumen matrícula */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Información de Matrícula</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <Field label="Año Electivo" value={matricula.anioElectivoAnio?.toString() ?? '—'} />
          <Field label="Estado Año" value={matricula.anioElectivoEstado ?? '—'} capitalize />
          <Field label="Tipo de Estudio" value={matricula.nombreTipoEstudio ?? '—'} />
          <Field label="Fecha de Inscripción" value={formatDate(matricula.fechaInscripcion)} />
          {matricula.fileCertificadoGrados && (
            <div>
              <span className="text-gray-500 block mb-0.5">Certificado de Grados</span>
              <a
                href={matricula.fileCertificadoGrados}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                Ver archivo
              </a>
            </div>
          )}
          {matricula.fileCompromiso && (
            <div>
              <span className="text-gray-500 block mb-0.5">Compromiso</span>
              <a
                href={matricula.fileCompromiso}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                Ver archivo
              </a>
            </div>
          )}
        </div>

        {grados.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Grados</p>
            <div className="flex flex-wrap gap-2">
              {grados.map(g => (
                <span
                  key={g.idGradoEducacion}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
                >
                  {g.nombreGrado}
                  <Badge
                    text={g.estado}
                    colorClass="bg-indigo-100 text-indigo-800"
                  />
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resumen obligaciones */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Pendientes" count={pendientes} color="text-yellow-600" bg="bg-yellow-50" />
        <SummaryCard label="Vencidas" count={vencidas} color="text-red-600" bg="bg-red-50" />
        <SummaryCard label="Pagadas" count={pagadas} color="text-green-600" bg="bg-green-50" />
      </div>

      {/* Tabla obligaciones */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Obligaciones de Pago</h2>
        </div>
        {obligaciones.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400 text-center">No hay obligaciones de pago registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">Rubro</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Vencimiento</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha Pago</th>
                  <th className="px-4 py-3">Monto Pagado</th>
                  <th className="px-4 py-3">Estado Comprobante</th>
                  <th className="px-4 py-3">Comprobante</th>
                  <th className="px-4 py-3">Observaciones</th>
                  <th className="px-4 py-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                {obligaciones.map(ob => (
                  <ObligacionRow key={ob.idObligacionPago} ob={ob} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div>
      <span className="text-gray-500 text-xs block mb-0.5">{label}</span>
      <span className={`text-gray-800 font-medium ${capitalize ? 'capitalize' : ''}`}>{value}</span>
    </div>
  );
}

function SummaryCard({ label, count, color, bg }: { label: string; count: number; color: string; bg: string }) {
  return (
    <div className={`${bg} rounded-xl p-4 text-center`}>
      <p className={`text-2xl font-bold ${color}`}>{count}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
