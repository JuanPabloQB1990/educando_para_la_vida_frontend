import React, { useRef, useState } from 'react';
import { usePerfilEstudiante, useUpdatePerfilEstudiante, useUpdateArchivoEstudiante } from '../../hooks/usePerfilEstudiante';
import { useTiposDocumento } from '../../hooks/useUsuarios';
import type { PerfilEstudiante } from '../../types/perfilEstudiante';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function driveViewUrl(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match ? `https://drive.google.com/uc?export=view&id=${match[1]}` : null;
}

function parseJsonList(value?: string | null): string {
  if (!value) return '—';
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.join(', ') || '—';
  } catch {
    // not JSON, return as-is
  }
  return value;
}

function Field({ label, value, json }: { label: string; value?: string | number | null; json?: boolean }) {
  const display = json ? parseJsonList(value as string | null) : (value ?? '—');
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{display}</p>
    </div>
  );
}

function InputField({
  label, name, value, onChange, type = 'text', required,
}: {
  label: string; name: string; value: string; onChange: (n: string, v: string) => void;
  type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}{required && ' *'}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
    </div>
  );
}

// ─── SectionCard ─────────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  viewContent: React.ReactNode;
  editContent: React.ReactNode;
}

function SectionCard({ title, isEditing, onEdit, onCancel, onSave, isSaving, viewContent, editContent }: SectionCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        {!isEditing && (
          <button
            type="button"
            onClick={onEdit}
            className="text-xs text-violet-600 hover:text-violet-700 font-medium"
          >
            Editar
          </button>
        )}
      </div>
      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{editContent}</div>
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg py-2"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="flex-1 text-sm text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg py-2 font-medium"
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{viewContent}</div>
      )}
    </div>
  );
}

// ─── DocumentItem ─────────────────────────────────────────────────────────────

function DocumentItem({
  label, campo, url, onUpdate, isUpdating,
}: {
  label: string; campo: string; url: string | null;
  onUpdate: (campo: string, file: File) => void; isUpdating: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium text-gray-700">{label}</p>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="text-xs text-violet-600 hover:underline truncate block"
          title={url}>
          Ver archivo
        </a>
      ) : (
        <p className="text-xs text-gray-400">Sin archivo</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.docx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) { onUpdate(campo, file); e.target.value = ''; }
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUpdating}
        className="text-xs text-violet-600 bg-violet-50 hover:bg-violet-100 disabled:opacity-50 rounded-lg py-1.5 px-2 font-medium"
      >
        {isUpdating ? 'Subiendo...' : url ? 'Cambiar' : 'Subir'}
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

type Section = 'personal' | 'nacimiento' | 'residencia' | 'salud' | 'padre' | 'madre' | 'acudiente' | 'referencias';

export default function PerfilEstudiantePage() {
  const { data: perfil, isLoading, isError } = usePerfilEstudiante();
  const { data: tiposDocumento = [] } = useTiposDocumento();
  const updatePerfil = useUpdatePerfilEstudiante();
  const updateArchivo = useUpdateArchivoEstudiante();

  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const handleEdit = (section: Section, initial: Record<string, string>) => {
    setForm(initial);
    setEditingSection(section);
  };
  const handleCancel = () => setEditingSection(null);
  const handleChange = (name: string, value: string) => setForm((f) => ({ ...f, [name]: value }));

  const handleSave = async () => {
    await updatePerfil.mutateAsync(form);
    setEditingSection(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((j) => <div key={j} className="h-10 bg-gray-100 rounded" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError || !perfil) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center text-sm text-red-500">
        Error al cargar el perfil. Intenta de nuevo.
      </div>
    );
  }

  const isSaving = updatePerfil.isPending;
  const isUpdatingFile = updateArchivo.isPending;

  const nombreCompleto = [perfil.usuarioNombres, perfil.usuarioApellido1, perfil.usuarioApellido2]
    .filter(Boolean).join(' ');

  const tipoDocNombre = tiposDocumento.find((t) => t.id === perfil.usuarioIdTipoDocumento)?.nombre ?? perfil.usuarioIdTipoDocumento;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
        {driveViewUrl(perfil.fileFoto) ? (
          <img src={driveViewUrl(perfil.fileFoto)!} alt="Foto"
            className="w-16 h-16 rounded-full object-cover border-2 border-violet-200" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-2xl font-bold">
            {perfil.usuarioNombres?.[0] ?? '?'}
          </div>
        )}
        <div>
          <h1 className="text-lg font-bold text-gray-800">{nombreCompleto}</h1>
          <p className="text-sm text-gray-400">{perfil.usuarioEmail}</p>
          <span className="text-xs text-gray-500">{tipoDocNombre} · {perfil.usuarioNoDocumento}</span>
        </div>
      </div>

      {/* Datos personales */}
      <SectionCard
        title="Datos personales"
        isEditing={editingSection === 'personal'}
        isSaving={isSaving}
        onEdit={() => handleEdit('personal', {
          nombres: perfil.usuarioNombres ?? '',
          apellido1: perfil.usuarioApellido1 ?? '',
          apellido2: perfil.usuarioApellido2 ?? '',
          contacto1: perfil.usuarioContacto1 ?? '',
          contacto2: perfil.usuarioContacto2 ?? '',
          email: perfil.usuarioEmail ?? '',
          no_documento: perfil.usuarioNoDocumento ?? '',
          fecha_expedicion_documento: perfil.usuarioFechaExpedicionDocumento?.split('T')[0] ?? '',
          sexo: perfil.sexo ?? '',
          religion: perfil.religion ?? '',
        })}
        onCancel={handleCancel}
        onSave={handleSave}
        viewContent={<>
          <Field label="Nombres" value={perfil.usuarioNombres} />
          <Field label="Primer apellido" value={perfil.usuarioApellido1} />
          <Field label="Segundo apellido" value={perfil.usuarioApellido2} />
          <Field label="Email" value={perfil.usuarioEmail} />
          <Field label="Contacto 1" value={perfil.usuarioContacto1} />
          <Field label="Contacto 2" value={perfil.usuarioContacto2} />
          <Field label="Tipo documento" value={tipoDocNombre} />
          <Field label="N° documento" value={perfil.usuarioNoDocumento} />
          <Field label="Fecha expedición" value={perfil.usuarioFechaExpedicionDocumento?.split('T')[0]} />
          <Field label="Sexo" value={perfil.sexo} />
          <Field label="Religión" value={perfil.religion} />
        </>}
        editContent={<>
          <InputField label="Nombres" name="nombres" value={form.nombres ?? ''} onChange={handleChange} required />
          <InputField label="Primer apellido" name="apellido1" value={form.apellido1 ?? ''} onChange={handleChange} required />
          <InputField label="Segundo apellido" name="apellido2" value={form.apellido2 ?? ''} onChange={handleChange} />
          <InputField label="Email" name="email" value={form.email ?? ''} onChange={handleChange} type="email" />
          <InputField label="Contacto 1" name="contacto1" value={form.contacto1 ?? ''} onChange={handleChange} />
          <InputField label="Contacto 2" name="contacto2" value={form.contacto2 ?? ''} onChange={handleChange} />
          <InputField label="N° documento" name="no_documento" value={form.no_documento ?? ''} onChange={handleChange} />
          <InputField label="Fecha expedición documento" name="fecha_expedicion_documento" value={form.fecha_expedicion_documento ?? ''} onChange={handleChange} type="date" />
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Sexo</label>
            <select value={form.sexo ?? ''} onChange={(e) => handleChange('sexo', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="">Seleccionar</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <InputField label="Religión" name="religion" value={form.religion ?? ''} onChange={handleChange} />
        </>}
      />

      {/* Nacimiento */}
      <SectionCard
        title="Lugar de nacimiento"
        isEditing={editingSection === 'nacimiento'}
        isSaving={isSaving}
        onEdit={() => handleEdit('nacimiento', {
          fecha_nacimiento: perfil.fechaNacimiento?.split('T')[0] ?? '',
          edad: String(perfil.edad ?? ''),
          municipio_nacimiento: perfil.municipioNacimiento ?? '',
          departamento_nacimiento: perfil.departamentoNacimiento ?? '',
          pais_nacimiento: perfil.paisNacimiento ?? '',
        })}
        onCancel={handleCancel}
        onSave={handleSave}
        viewContent={<>
          <Field label="Fecha nacimiento" value={perfil.fechaNacimiento?.split('T')[0]} />
          <Field label="Edad" value={perfil.edad} />
          <Field label="Municipio" value={perfil.municipioNacimiento} />
          <Field label="Departamento" value={perfil.departamentoNacimiento} />
          <Field label="País" value={perfil.paisNacimiento} />
        </>}
        editContent={<>
          <InputField label="Fecha de nacimiento" name="fecha_nacimiento" value={form.fecha_nacimiento ?? ''} onChange={handleChange} type="date" />
          <InputField label="Edad" name="edad" value={form.edad ?? ''} onChange={handleChange} type="number" />
          <InputField label="Municipio de nacimiento" name="municipio_nacimiento" value={form.municipio_nacimiento ?? ''} onChange={handleChange} />
          <InputField label="Departamento de nacimiento" name="departamento_nacimiento" value={form.departamento_nacimiento ?? ''} onChange={handleChange} />
          <InputField label="País de nacimiento" name="pais_nacimiento" value={form.pais_nacimiento ?? ''} onChange={handleChange} />
        </>}
      />

      {/* Residencia */}
      <SectionCard
        title="Residencia actual"
        isEditing={editingSection === 'residencia'}
        isSaving={isSaving}
        onEdit={() => handleEdit('residencia', {
          direccion_actual: perfil.direccionActual ?? '',
          barrio_vereda_actual: perfil.barrioVeredaActual ?? '',
          ciudad_actual: perfil.ciudadActual ?? '',
          departamento_actual: perfil.departamentoActual ?? '',
          pais_actual: perfil.paisActual ?? '',
        })}
        onCancel={handleCancel}
        onSave={handleSave}
        viewContent={<>
          <Field label="Dirección" value={perfil.direccionActual} />
          <Field label="Barrio / Vereda" value={perfil.barrioVeredaActual} />
          <Field label="Ciudad" value={perfil.ciudadActual} />
          <Field label="Departamento" value={perfil.departamentoActual} />
          <Field label="País" value={perfil.paisActual} />
        </>}
        editContent={<>
          <InputField label="Dirección actual" name="direccion_actual" value={form.direccion_actual ?? ''} onChange={handleChange} />
          <InputField label="Barrio / Vereda" name="barrio_vereda_actual" value={form.barrio_vereda_actual ?? ''} onChange={handleChange} />
          <InputField label="Ciudad actual" name="ciudad_actual" value={form.ciudad_actual ?? ''} onChange={handleChange} />
          <InputField label="Departamento actual" name="departamento_actual" value={form.departamento_actual ?? ''} onChange={handleChange} />
          <InputField label="País actual" name="pais_actual" value={form.pais_actual ?? ''} onChange={handleChange} />
        </>}
      />

      {/* Salud */}
      <SectionCard
        title="Información médica"
        isEditing={editingSection === 'salud'}
        isSaving={isSaving}
        onEdit={() => handleEdit('salud', {
          problemasalud: perfil.problemasalud ?? '',
          eps: perfil.eps ?? '',
          ips: perfil.ips ?? '',
          rh: perfil.rh ?? '',
          limitaciones: parseJsonList(perfil.limitaciones),
          otras_limitaciones: perfil.otrasLimitaciones ?? '',
          capacidades: parseJsonList(perfil.capacidades),
          ci_puntaje: String(perfil.ciPuntaje ?? ''),
          observaciones: perfil.observaciones ?? '',
        })}
        onCancel={handleCancel}
        onSave={handleSave}
        viewContent={<>
          <Field label="Problema de salud" value={perfil.problemasalud} />
          <Field label="EPS" value={perfil.eps} />
          <Field label="IPS" value={perfil.ips} />
          <Field label="RH" value={perfil.rh} />
          <Field label="Limitaciones" value={perfil.limitaciones} json />
          <Field label="Otras limitaciones" value={perfil.otrasLimitaciones} />
          <Field label="Capacidades" value={perfil.capacidades} json />
          <Field label="CI / Puntaje" value={perfil.ciPuntaje} />
          <Field label="Observaciones" value={perfil.observaciones} />
        </>}
        editContent={<>
          <InputField label="Problema de salud" name="problemasalud" value={form.problemasalud ?? ''} onChange={handleChange} />
          <InputField label="EPS" name="eps" value={form.eps ?? ''} onChange={handleChange} />
          <InputField label="IPS" name="ips" value={form.ips ?? ''} onChange={handleChange} />
          <InputField label="RH" name="rh" value={form.rh ?? ''} onChange={handleChange} />
          <InputField label="Limitaciones" name="limitaciones" value={form.limitaciones ?? ''} onChange={handleChange} />
          <InputField label="Otras limitaciones" name="otras_limitaciones" value={form.otras_limitaciones ?? ''} onChange={handleChange} />
          <InputField label="Capacidades" name="capacidades" value={form.capacidades ?? ''} onChange={handleChange} />
          <InputField label="CI / Puntaje" name="ci_puntaje" value={form.ci_puntaje ?? ''} onChange={handleChange} type="number" />
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              value={form.observaciones ?? ''}
              onChange={(e) => handleChange('observaciones', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </>}
      />

      {/* Padre */}
      <SectionCard
        title="Datos del padre"
        isEditing={editingSection === 'padre'}
        isSaving={isSaving}
        onEdit={() => handleEdit('padre', {
          padre_apellido1: perfil.padreApellido1 ?? '',
          padre_apellido2: perfil.padreApellido2 ?? '',
          padre_nombre: perfil.padreNombre ?? '',
          padre_cedula: perfil.padreCedula ?? '',
          padre_contacto1: perfil.padreContacto1 ?? '',
          padre_contacto2: perfil.padreContacto2 ?? '',
        })}
        onCancel={handleCancel}
        onSave={handleSave}
        viewContent={<>
          <Field label="Nombre" value={perfil.padreNombre} />
          <Field label="Primer apellido" value={perfil.padreApellido1} />
          <Field label="Segundo apellido" value={perfil.padreApellido2} />
          <Field label="Cédula" value={perfil.padreCedula} />
          <Field label="Contacto 1" value={perfil.padreContacto1} />
          <Field label="Contacto 2" value={perfil.padreContacto2} />
        </>}
        editContent={<>
          <InputField label="Nombre del padre" name="padre_nombre" value={form.padre_nombre ?? ''} onChange={handleChange} />
          <InputField label="Primer apellido" name="padre_apellido1" value={form.padre_apellido1 ?? ''} onChange={handleChange} />
          <InputField label="Segundo apellido" name="padre_apellido2" value={form.padre_apellido2 ?? ''} onChange={handleChange} />
          <InputField label="Cédula" name="padre_cedula" value={form.padre_cedula ?? ''} onChange={handleChange} />
          <InputField label="Contacto 1" name="padre_contacto1" value={form.padre_contacto1 ?? ''} onChange={handleChange} />
          <InputField label="Contacto 2" name="padre_contacto2" value={form.padre_contacto2 ?? ''} onChange={handleChange} />
        </>}
      />

      {/* Madre */}
      <SectionCard
        title="Datos de la madre"
        isEditing={editingSection === 'madre'}
        isSaving={isSaving}
        onEdit={() => handleEdit('madre', {
          madre_apellido1: perfil.madreApellido1 ?? '',
          madre_apellido2: perfil.madreApellido2 ?? '',
          madre_nombre: perfil.madreNombre ?? '',
          madre_cedula: perfil.madreCedula ?? '',
          madre_contacto1: perfil.madreContacto1 ?? '',
          madre_contacto2: perfil.madreContacto2 ?? '',
        })}
        onCancel={handleCancel}
        onSave={handleSave}
        viewContent={<>
          <Field label="Nombre" value={perfil.madreNombre} />
          <Field label="Primer apellido" value={perfil.madreApellido1} />
          <Field label="Segundo apellido" value={perfil.madreApellido2} />
          <Field label="Cédula" value={perfil.madreCedula} />
          <Field label="Contacto 1" value={perfil.madreContacto1} />
          <Field label="Contacto 2" value={perfil.madreContacto2} />
        </>}
        editContent={<>
          <InputField label="Nombre de la madre" name="madre_nombre" value={form.madre_nombre ?? ''} onChange={handleChange} />
          <InputField label="Primer apellido" name="madre_apellido1" value={form.madre_apellido1 ?? ''} onChange={handleChange} />
          <InputField label="Segundo apellido" name="madre_apellido2" value={form.madre_apellido2 ?? ''} onChange={handleChange} />
          <InputField label="Cédula" name="madre_cedula" value={form.madre_cedula ?? ''} onChange={handleChange} />
          <InputField label="Contacto 1" name="madre_contacto1" value={form.madre_contacto1 ?? ''} onChange={handleChange} />
          <InputField label="Contacto 2" name="madre_contacto2" value={form.madre_contacto2 ?? ''} onChange={handleChange} />
        </>}
      />

      {/* Acudiente */}
      <SectionCard
        title="Datos del acudiente"
        isEditing={editingSection === 'acudiente'}
        isSaving={isSaving}
        onEdit={() => handleEdit('acudiente', {
          acudiente_apellido1: perfil.acudienteApellido1 ?? '',
          acudiente_apellido2: perfil.acudienteApellido2 ?? '',
          acudiente_nombre: perfil.acudienteNombre ?? '',
          acudiente_cedula: perfil.acudienteCedula ?? '',
          acudiente_contacto1: perfil.acudienteContacto1 ?? '',
          acudiente_contacto2: perfil.acudienteContacto2 ?? '',
        })}
        onCancel={handleCancel}
        onSave={handleSave}
        viewContent={<>
          <Field label="Nombre" value={perfil.acudienteNombre} />
          <Field label="Primer apellido" value={perfil.acudienteApellido1} />
          <Field label="Segundo apellido" value={perfil.acudienteApellido2} />
          <Field label="Cédula" value={perfil.acudienteCedula} />
          <Field label="Contacto 1" value={perfil.acudienteContacto1} />
          <Field label="Contacto 2" value={perfil.acudienteContacto2} />
        </>}
        editContent={<>
          <InputField label="Nombre del acudiente" name="acudiente_nombre" value={form.acudiente_nombre ?? ''} onChange={handleChange} />
          <InputField label="Primer apellido" name="acudiente_apellido1" value={form.acudiente_apellido1 ?? ''} onChange={handleChange} />
          <InputField label="Segundo apellido" name="acudiente_apellido2" value={form.acudiente_apellido2 ?? ''} onChange={handleChange} />
          <InputField label="Cédula" name="acudiente_cedula" value={form.acudiente_cedula ?? ''} onChange={handleChange} />
          <InputField label="Contacto 1" name="acudiente_contacto1" value={form.acudiente_contacto1 ?? ''} onChange={handleChange} />
          <InputField label="Contacto 2" name="acudiente_contacto2" value={form.acudiente_contacto2 ?? ''} onChange={handleChange} />
        </>}
      />

      {/* Referencias */}
      <SectionCard
        title="Referencias personales"
        isEditing={editingSection === 'referencias'}
        isSaving={isSaving}
        onEdit={() => handleEdit('referencias', {
          ref1_nombres: perfil.ref1Nombres ?? '', ref1_apellidos: perfil.ref1Apellidos ?? '', ref1_tel: perfil.ref1Tel ?? '',
          ref2_nombres: perfil.ref2Nombres ?? '', ref2_apellidos: perfil.ref2Apellidos ?? '', ref2_tel: perfil.ref2Tel ?? '',
          ref3_nombres: perfil.ref3Nombres ?? '', ref3_apellidos: perfil.ref3Apellidos ?? '', ref3_tel: perfil.ref3Tel ?? '',
          ref4_nombres: perfil.ref4Nombres ?? '', ref4_apellidos: perfil.ref4Apellidos ?? '', ref4_tel: perfil.ref4Tel ?? '',
          ref5_nombres: perfil.ref5Nombres ?? '', ref5_apellidos: perfil.ref5Apellidos ?? '', ref5_tel: perfil.ref5Tel ?? '',
          ref6_nombres: perfil.ref6Nombres ?? '', ref6_apellidos: perfil.ref6Apellidos ?? '', ref6_tel: perfil.ref6Tel ?? '',
        })}
        onCancel={handleCancel}
        onSave={handleSave}
        viewContent={<>
          {([1, 2, 3, 4, 5, 6] as const).map((n) => {
            const p = perfil as unknown as Record<string, string | null>;
            const nombres = p[`ref${n}Nombres`];
            const apellidos = p[`ref${n}Apellidos`];
            const tel = p[`ref${n}Tel`];
            return (
              <div key={n} className="col-span-1">
                <p className="text-xs text-gray-400 mb-0.5">Referencia {n}</p>
                <p className="text-sm text-gray-800 font-medium">{nombres} {apellidos}</p>
                <p className="text-xs text-gray-500">{tel}</p>
              </div>
            );
          })}
        </>}
        editContent={<>
          {([1, 2, 3, 4, 5, 6] as const).map((n) => (
            <React.Fragment key={n}>
              <InputField label={`Ref. ${n} — Nombres`} name={`ref${n}_nombres`} value={form[`ref${n}_nombres`] ?? ''} onChange={handleChange} />
              <InputField label={`Ref. ${n} — Apellidos`} name={`ref${n}_apellidos`} value={form[`ref${n}_apellidos`] ?? ''} onChange={handleChange} />
              <InputField label={`Ref. ${n} — Teléfono`} name={`ref${n}_tel`} value={form[`ref${n}_tel`] ?? ''} onChange={handleChange} />
            </React.Fragment>
          ))}
        </>}
      />

      {/* Documentos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Documentos y archivos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          <DocumentItem label="Foto del estudiante" campo="file_foto" url={perfil.fileFoto}
            onUpdate={(c, f) => updateArchivo.mutate({ campo: c, file: f })} isUpdating={isUpdatingFile} />
          <DocumentItem label="Documento de identidad" campo="file_doc" url={perfil.fileDoc}
            onUpdate={(c, f) => updateArchivo.mutate({ campo: c, file: f })} isUpdating={isUpdatingFile} />
          <DocumentItem label="Diagnóstico" campo="file_diagnostico" url={perfil.fileDiagnostico}
            onUpdate={(c, f) => updateArchivo.mutate({ campo: c, file: f })} isUpdating={isUpdatingFile} />
          <DocumentItem label="Documento del padre" campo="padre_file" url={perfil.padreFile}
            onUpdate={(c, f) => updateArchivo.mutate({ campo: c, file: f })} isUpdating={isUpdatingFile} />
          <DocumentItem label="Documento de la madre" campo="madre_file" url={perfil.madreFile}
            onUpdate={(c, f) => updateArchivo.mutate({ campo: c, file: f })} isUpdating={isUpdatingFile} />
          <DocumentItem label="Documento del acudiente" campo="acudiente_file" url={perfil.acudienteFile}
            onUpdate={(c, f) => updateArchivo.mutate({ campo: c, file: f })} isUpdating={isUpdatingFile} />
        </div>
      </div>
    </div>
  );
}
