import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUsuarios, useRoles, useTiposDocumento, useCreateUsuario, useUpdateUsuario, useDeleteUsuario } from '../../hooks/useUsuarios';
import type { UsuarioAdmin, Rol, TipoDocumento } from '../../types/usuario';

// ─── Schemas ────────────────────────────────────────────────────────────────
const baseSchema = z.object({
  nombres: z.string().min(1, 'Requerido'),
  apellido1: z.string().min(1, 'Requerido'),
  apellido2: z.string().min(1, 'Requerido'),
  email: z.string().email('Email inválido'),
  contacto1: z.string().min(1, 'Requerido'),
  contacto2: z.string().optional(),
  id_tipo_documento: z.string().min(1, 'Seleccione tipo de documento'),
  no_documento: z.string().min(1, 'Requerido'),
  fecha_expedicion_documento: z.string().min(1, 'Requerido'),
  id_rol: z.string().min(1, 'Seleccione un rol'),
});

const crearSchema = baseSchema;
const editarSchema = baseSchema.extend({ estado: z.enum(['activo', 'inactivo']) });

type CrearForm = z.infer<typeof crearSchema>;
type EditarForm = z.infer<typeof editarSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function toDateInput(val: string | null | undefined): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

function rolesAdmin(roles: Rol[]): Rol[] {
  return roles.filter((r) => r.nombre !== 'estudiante');
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${55 + (i % 3) * 20}%` }} />
        </td>
      ))}
    </tr>
  );
}

function EstadoBadge({ estado }: { estado: UsuarioAdmin['estado'] }) {
  return estado === 'activo' ? (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Activo</span>
  ) : (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Inactivo</span>
  );
}

function CampoTexto({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

// ─── Modal Crear ─────────────────────────────────────────────────────────────
interface ModalCrearProps {
  roles: Rol[];
  tiposDocumento: TipoDocumento[];
  onClose: () => void;
  onSubmit: (data: CrearForm) => void;
  isPending: boolean;
}

function ModalCrear({ roles, tiposDocumento, onClose, onSubmit, isPending }: ModalCrearProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CrearForm>({
    resolver: zodResolver(crearSchema),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-800">Nuevo usuario</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <CampoTexto label="Nombres" error={errors.nombres?.message}>
                <input {...register('nombres')} className={inputCls} placeholder="Nombres" />
              </CampoTexto>
              <CampoTexto label="Primer apellido" error={errors.apellido1?.message}>
                <input {...register('apellido1')} className={inputCls} placeholder="Primer apellido" />
              </CampoTexto>
              <CampoTexto label="Segundo apellido" error={errors.apellido2?.message}>
                <input {...register('apellido2')} className={inputCls} placeholder="Segundo apellido" />
              </CampoTexto>
              <CampoTexto label="Correo electrónico" error={errors.email?.message}>
                <input {...register('email')} type="email" className={inputCls} placeholder="correo@ejemplo.com" />
              </CampoTexto>
              <CampoTexto label="Tipo de documento" error={errors.id_tipo_documento?.message}>
                <select {...register('id_tipo_documento')} className={inputCls}>
                  <option value="">Seleccione</option>
                  {tiposDocumento.map((t) => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
              </CampoTexto>
              <CampoTexto label="N° documento" error={errors.no_documento?.message}>
                <input {...register('no_documento')} className={inputCls} placeholder="Número de documento" />
              </CampoTexto>
              <CampoTexto label="Fecha expedición doc." error={errors.fecha_expedicion_documento?.message}>
                <input {...register('fecha_expedicion_documento')} type="date" className={inputCls} />
              </CampoTexto>
              <CampoTexto label="Rol" error={errors.id_rol?.message}>
                <select {...register('id_rol')} className={inputCls}>
                  <option value="">Seleccione un rol</option>
                  {rolesAdmin(roles).map((r) => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              </CampoTexto>
              <CampoTexto label="Contacto 1" error={errors.contacto1?.message}>
                <input {...register('contacto1')} className={inputCls} placeholder="Teléfono principal" />
              </CampoTexto>
              <CampoTexto label="Contacto 2 (opcional)" error={errors.contacto2?.message}>
                <input {...register('contacto2')} className={inputCls} placeholder="Teléfono alternativo" />
              </CampoTexto>
            </div>

            <p className="text-xs text-gray-400">
              Se generará una contraseña automáticamente y será enviada al correo especificado.
            </p>

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                Cancelar
              </button>
              <button type="submit" disabled={isPending} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {isPending ? 'Creando...' : 'Crear usuario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Editar ─────────────────────────────────────────────────────────────
interface ModalEditarProps {
  usuario: UsuarioAdmin;
  roles: Rol[];
  tiposDocumento: TipoDocumento[];
  onClose: () => void;
  onSubmit: (data: EditarForm) => void;
  isPending: boolean;
}

function ModalEditar({ usuario, roles, tiposDocumento, onClose, onSubmit, isPending }: ModalEditarProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<EditarForm>({
    resolver: zodResolver(editarSchema),
    defaultValues: {
      nombres: usuario.nombres,
      apellido1: usuario.apellido1,
      apellido2: usuario.apellido2 ?? '',
      email: usuario.email ?? '',
      contacto1: usuario.contacto1 ?? '',
      contacto2: usuario.contacto2 ?? '',
      id_tipo_documento: usuario.idTipoDocumento ?? '',
      no_documento: usuario.noDocumento ?? '',
      fecha_expedicion_documento: toDateInput(usuario.fechaExpedicionDocumento),
      id_rol: usuario.idRol ?? '',
      estado: usuario.estado,
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-800">Editar usuario</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <CampoTexto label="Nombres" error={errors.nombres?.message}>
                <input {...register('nombres')} className={inputCls} />
              </CampoTexto>
              <CampoTexto label="Primer apellido" error={errors.apellido1?.message}>
                <input {...register('apellido1')} className={inputCls} />
              </CampoTexto>
              <CampoTexto label="Segundo apellido" error={errors.apellido2?.message}>
                <input {...register('apellido2')} className={inputCls} />
              </CampoTexto>
              <CampoTexto label="Correo electrónico" error={errors.email?.message}>
                <input {...register('email')} type="email" className={inputCls} />
              </CampoTexto>
              <CampoTexto label="Tipo de documento" error={errors.id_tipo_documento?.message}>
                <select {...register('id_tipo_documento')} className={inputCls}>
                  <option value="">Seleccione</option>
                  {tiposDocumento.map((t) => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
              </CampoTexto>
              <CampoTexto label="N° documento" error={errors.no_documento?.message}>
                <input {...register('no_documento')} className={inputCls} />
              </CampoTexto>
              <CampoTexto label="Fecha expedición doc." error={errors.fecha_expedicion_documento?.message}>
                <input {...register('fecha_expedicion_documento')} type="date" className={inputCls} />
              </CampoTexto>
              <CampoTexto label="Rol" error={errors.id_rol?.message}>
                <select {...register('id_rol')} className={inputCls}>
                  <option value="">Seleccione un rol</option>
                  {rolesAdmin(roles).map((r) => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              </CampoTexto>
              <CampoTexto label="Contacto 1" error={errors.contacto1?.message}>
                <input {...register('contacto1')} className={inputCls} />
              </CampoTexto>
              <CampoTexto label="Contacto 2 (opcional)" error={errors.contacto2?.message}>
                <input {...register('contacto2')} className={inputCls} />
              </CampoTexto>
              <CampoTexto label="Estado" error={errors.estado?.message}>
                <select {...register('estado')} className={inputCls}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </CampoTexto>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                Cancelar
              </button>
              <button type="submit" disabled={isPending} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {isPending ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Confirmar Eliminar ─────────────────────────────────────────────────
interface ModalConfirmarProps {
  nombre: string;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

function ModalConfirmar({ nombre, onClose, onConfirm, isPending }: ModalConfirmarProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">Confirmar eliminación</h2>
        <p className="text-sm text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar al usuario <span className="font-medium">{nombre}</span>? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={isPending} className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
            {isPending ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Contraseña Generada ────────────────────────────────────────────────
interface ModalPasswordGeneradoProps {
  email: string;
  password: string;
  onClose: () => void;
}

function ModalPasswordGenerado({ email, password, onClose }: ModalPasswordGeneradoProps) {
  const [copiado, setCopiado] = useState(false);

  const copiar = () => {
    navigator.clipboard.writeText(password).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-gray-800">Usuario creado exitosamente</h2>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Las credenciales han sido enviadas al correo <span className="font-medium">{email}</span>.
        </p>

        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-500 mb-1">Contraseña generada</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono text-gray-800 break-all">{password}</code>
            <button
              onClick={copiar}
              className="shrink-0 px-2 py-1 text-xs text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100"
            >
              {copiado ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-4">
          Guarda esta contraseña. No podrás verla nuevamente desde el sistema.
        </p>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function UsuariosAdminPage() {
  const [showCrear, setShowCrear] = useState(false);
  const [editando, setEditando] = useState<UsuarioAdmin | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [passwordGenerado, setPasswordGenerado] = useState<{ email: string; password: string } | null>(null);

  const { data: usuarios, isLoading, isError } = useUsuarios();
  const { data: roles = [] } = useRoles();
  const { data: tiposDocumento = [] } = useTiposDocumento();
  const createMutation = useCreateUsuario();
  const updateMutation = useUpdateUsuario();
  const deleteMutation = useDeleteUsuario();

  const usuarioEliminando = usuarios?.find((u) => u.id === eliminandoId);

  const handleCrear = async (form: CrearForm) => {
    const result = await createMutation.mutateAsync(form);
    setShowCrear(false);
    setPasswordGenerado({ email: form.email, password: result.plainPassword });
  };

  const handleEditar = async (form: EditarForm) => {
    if (!editando) return;
    await updateMutation.mutateAsync({ id: editando.id, data: form });
    setEditando(null);
  };

  const handleEliminar = async () => {
    if (!eliminandoId) return;
    await deleteMutation.mutateAsync(eliminandoId);
    setEliminandoId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestión de administradores y profesores del sistema.</p>
        </div>
        <button
          onClick={() => setShowCrear(true)}
          className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          + Nuevo usuario
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        {isError ? (
          <div className="p-8 text-center text-sm text-red-500">Error al cargar los usuarios.</div>
        ) : (
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Rol</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Correo</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">N° Documento</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha Expedición</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Contacto 1</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Contacto 2</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : !usuarios?.length ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-gray-400">
                    No hay usuarios registrados.
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {u.nombres} {u.apellido1}{u.apellido2 ? ` ${u.apellido2}` : ''}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.nombreRol ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {u.nombreTipoDocumento ? `${u.nombreTipoDocumento} ` : ''}{u.noDocumento ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {u.fechaExpedicionDocumento ? toDateInput(u.fechaExpedicionDocumento) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.contacto1 ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{u.contacto2 ?? '—'}</td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={u.estado} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => setEditando(u)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setEliminandoId(u.id)}
                          className="text-red-500 hover:text-red-700 font-medium"
                        >
                          Eliminar
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

      {showCrear && (
        <ModalCrear
          roles={roles}
          tiposDocumento={tiposDocumento}
          onClose={() => setShowCrear(false)}
          onSubmit={handleCrear}
          isPending={createMutation.isPending}
        />
      )}

      {editando && (
        <ModalEditar
          usuario={editando}
          roles={roles}
          tiposDocumento={tiposDocumento}
          onClose={() => setEditando(null)}
          onSubmit={handleEditar}
          isPending={updateMutation.isPending}
        />
      )}

      {eliminandoId && usuarioEliminando && (
        <ModalConfirmar
          nombre={`${usuarioEliminando.nombres} ${usuarioEliminando.apellido1}`}
          onClose={() => setEliminandoId(null)}
          onConfirm={handleEliminar}
          isPending={deleteMutation.isPending}
        />
      )}

      {passwordGenerado && (
        <ModalPasswordGenerado
          email={passwordGenerado.email}
          password={passwordGenerado.password}
          onClose={() => setPasswordGenerado(null)}
        />
      )}
    </div>
  );
}
