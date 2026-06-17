import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useDireccionesGrado,
  useCreateDireccionGrado,
  useUpdateDireccionGrado,
  useDeleteDireccionGrado,
} from '../../hooks/useDireccionGrado';
import { useGradosEducacion } from '../../hooks/useGradosEducacion';
import { useAniosElectivos } from '../../hooks/useAnioElectivo';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useBloques } from '../../hooks/useBloque';
import type { DireccionGrado } from '../../types/direccionGrado';
import type { Bloque } from '../../types/bloque';

const schema = z.object({
  idUsuario: z.string().min(1, 'Selecciona un profesor'),
  idGradoEducacion: z.string().optional(),
  idAnioElectivo: z.string().min(1, 'Selecciona un año electivo'),
  idBloque: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const selectCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white';

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: i === 4 ? '20%' : '70%' }} />
        </td>
      ))}
    </tr>
  );
}

interface FormFieldsProps {
  register: ReturnType<typeof useForm<FormValues>>['register'];
  errors: ReturnType<typeof useForm<FormValues>>['formState']['errors'];
  profesores: { id: string; nombres: string; apellido1: string }[];
  grados: { id: string; nombre: string }[];
  anios: { id: string; anio: number }[];
  bloques: Bloque[];
}

function FormFields({ register, errors, profesores, grados, anios, bloques }: FormFieldsProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Profesor</label>
        <select {...register('idUsuario')} className={selectCls}>
          <option value="">Selecciona un profesor</option>
          {profesores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombres} {p.apellido1}
            </option>
          ))}
        </select>
        {errors.idUsuario && <p className="mt-1 text-xs text-red-500">{errors.idUsuario.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Grado <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <select {...register('idGradoEducacion')} className={selectCls}>
          <option value="">Sin grado asignado</option>
          {grados.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Año Electivo</label>
        <select {...register('idAnioElectivo')} className={selectCls}>
          <option value="">Selecciona un año electivo</option>
          {anios.map((a) => (
            <option key={a.id} value={a.id}>
              {a.anio}
            </option>
          ))}
        </select>
        {errors.idAnioElectivo && <p className="mt-1 text-xs text-red-500">{errors.idAnioElectivo.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bloque <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <select {...register('idBloque')} className={selectCls}>
          <option value="">Sin bloque</option>
          {bloques.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nombre}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

interface ModalCrearProps {
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
  isPending: boolean;
  profesores: FormFieldsProps['profesores'];
  grados: FormFieldsProps['grados'];
  anios: FormFieldsProps['anios'];
  bloques: Bloque[];
}

function ModalCrear({ onClose, onSubmit, isPending, profesores, grados, anios, bloques }: ModalCrearProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Nuevo director de grado</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <FormFields register={register} errors={errors} profesores={profesores} grados={grados} anios={anios} bloques={bloques} />
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {isPending ? 'Asignando...' : 'Asignar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ModalEditarProps {
  item: DireccionGrado;
  onClose: () => void;
  onSubmit: (data: FormValues) => void;
  isPending: boolean;
  profesores: FormFieldsProps['profesores'];
  grados: FormFieldsProps['grados'];
  anios: FormFieldsProps['anios'];
  bloques: Bloque[];
}

function ModalEditar({ item, onClose, onSubmit, isPending, profesores, grados, anios, bloques }: ModalEditarProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      idUsuario: item.idUsuario,
      idGradoEducacion: item.idGradoEducacion ?? undefined,
      idAnioElectivo: item.idAnioElectivo,
      idBloque: item.idBloque ?? '',
    },
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Editar director de grado</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <FormFields register={register} errors={errors} profesores={profesores} grados={grados} anios={anios} bloques={bloques} />
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
  );
}

interface ModalConfirmarProps {
  nombreProfesor: string;
  nombreGrado: string;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

function ModalConfirmar({ nombreProfesor, nombreGrado, onClose, onConfirm, isPending }: ModalConfirmarProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">Confirmar eliminación</h2>
        <p className="text-sm text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar a <span className="font-medium">{nombreProfesor}</span> como
          director del grado <span className="font-medium">{nombreGrado}</span>?
          Esta acción no se puede deshacer.
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

export default function DireccionGradoAdminPage() {
  const [showCrear, setShowCrear] = useState(false);
  const [editando, setEditando] = useState<DireccionGrado | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [filtroProfesor, setFiltroProfesor] = useState('');
  const [filtroGrado, setFiltroGrado] = useState('');

  const { data: direcciones, isLoading, isError } = useDireccionesGrado();
  const { data: todosUsuarios } = useUsuarios();
  const { data: grados } = useGradosEducacion();
  const { data: anios } = useAniosElectivos();
  const { data: bloques } = useBloques();

  const createMutation = useCreateDireccionGrado();
  const updateMutation = useUpdateDireccionGrado();
  const deleteMutation = useDeleteDireccionGrado();

  const profesores = (todosUsuarios ?? []).filter((u) => u.nombreRol === 'profesor(a)');
  const gradosList = grados ?? [];
  const aniosList = anios ?? [];
  const bloquesList = bloques ?? [];

  const direccionesFiltradas = (direcciones ?? []).filter((d) => {
    const coincideProfesor = !filtroProfesor || d.idUsuario === filtroProfesor;
    const coincideGrado = !filtroGrado || d.idGradoEducacion === filtroGrado;
    return coincideProfesor && coincideGrado;
  });

  const itemEliminando = direcciones?.find((d) => d.id === eliminandoId);

  const handleCrear = async (form: FormValues) => {
    await createMutation.mutateAsync({ ...form, idBloque: form.idBloque || null });
    setShowCrear(false);
  };

  const handleEditar = async (form: FormValues) => {
    if (!editando) return;
    await updateMutation.mutateAsync({ id: editando.id, data: { ...form, idBloque: form.idBloque || null } });
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
          <h1 className="text-xl font-bold text-gray-900">Dirección de Grado</h1>
          <p className="text-sm text-gray-500 mt-0.5">Asignación de profesores como directores de grado.</p>
        </div>
        <button
          onClick={() => setShowCrear(true)}
          className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          + Asignar director
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <select
          value={filtroProfesor}
          onChange={(e) => setFiltroProfesor(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Todos los profesores</option>
          {profesores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombres} {p.apellido1}
            </option>
          ))}
        </select>
        <select
          value={filtroGrado}
          onChange={(e) => setFiltroGrado(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Todos los grados</option>
          {gradosList.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nombre}
            </option>
          ))}
        </select>
        {(filtroProfesor || filtroGrado) && (
          <button
            onClick={() => { setFiltroProfesor(''); setFiltroGrado(''); }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        {isError ? (
          <div className="p-8 text-center text-sm text-red-500">Error al cargar las direcciones de grado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Profesor</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Grado</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Bloque</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Año Electivo</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : !direccionesFiltradas.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    {filtroProfesor || filtroGrado ? 'No hay resultados para los filtros aplicados.' : 'No hay directores de grado asignados.'}
                  </td>
                </tr>
              ) : (
                direccionesFiltradas.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{d.nombreUsuario ?? d.idUsuario}</td>
                    <td className="px-4 py-3 text-gray-700">{d.nombreGrado ?? d.idGradoEducacion}</td>
                    <td className="px-4 py-3 text-gray-500">{d.nombreBloque ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{d.anio ?? d.idAnioElectivo}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => setEditando(d)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setEliminandoId(d.id)}
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
          onClose={() => setShowCrear(false)}
          onSubmit={handleCrear}
          isPending={createMutation.isPending}
          profesores={profesores}
          grados={gradosList}
          anios={aniosList}
          bloques={bloquesList}
        />
      )}

      {editando && (
        <ModalEditar
          item={editando}
          onClose={() => setEditando(null)}
          onSubmit={handleEditar}
          isPending={updateMutation.isPending}
          profesores={profesores}
          grados={gradosList}
          anios={aniosList}
          bloques={bloquesList}
        />
      )}

      {eliminandoId && itemEliminando && (
        <ModalConfirmar
          nombreProfesor={itemEliminando.nombreUsuario ?? itemEliminando.idUsuario}
          nombreGrado={itemEliminando.nombreGrado ?? itemEliminando.idGradoEducacion ?? 'Sin grado'}
          onClose={() => setEliminandoId(null)}
          onConfirm={handleEliminar}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
