import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';

const schema = z.object({ email: z.string().email('Correo inválido') });
type FormValues = z.infer<typeof schema>;

export default function RecuperarPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email }: FormValues) => {
    setLoading(true);
    try {
      await authService.solicitarRecuperacion(email);
      toast.success('Se envió un código de recuperación a su correo.');
      navigate('/nueva-password', { state: { email } });
    } catch {
      toast.error('No se encontró una cuenta con ese correo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Recuperar contraseña</h2>
        <p className="text-sm text-gray-500 mb-6">
          Ingrese su correo y le enviaremos un código de verificación.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="correo@ejemplo.com"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Enviando...' : 'Enviar código'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            Volver al inicio de sesión
          </button>
        </form>
      </div>
    </div>
  );
}
