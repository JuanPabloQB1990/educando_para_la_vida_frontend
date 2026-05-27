import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';

const schema = z
  .object({
    code: z.string().length(6, 'El código debe tener 6 dígitos'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  });

type FormValues = z.infer<typeof schema>;

export default function NuevaPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email ?? '';
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ code, password }: FormValues) => {
    setLoading(true);
    try {
      await authService.nuevaPassword(email, code, password);
      toast.success('Contraseña actualizada. Ya puede ingresar.');
      navigate('/login');
    } catch {
      toast.error('Código inválido o expirado.');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    navigate('/recuperar-password');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Nueva contraseña</h2>
        <p className="text-sm text-gray-500 mb-6">
          Ingrese el código enviado a <strong>{email}</strong> y su nueva contraseña.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {[
            { name: 'code', label: 'Código de verificación', type: 'text', placeholder: '123456' },
            { name: 'password', label: 'Nueva contraseña', type: 'password', placeholder: '••••••••' },
            { name: 'confirm', label: 'Confirmar contraseña', type: 'password', placeholder: '••••••••' },
          ].map(({ name, label, type, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                {...register(name as keyof FormValues)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors[name as keyof FormValues] && (
                <p className="text-xs text-red-500 mt-1">{errors[name as keyof FormValues]?.message}</p>
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Guardando...' : 'Establecer nueva contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
