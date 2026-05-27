import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { RolNombre } from '../types/auth';

const roleHome: Record<RolNombre, string> = {
  admin: '/admin',
  profesor: '/profesor',
  estudiante: '/estudiante',
};

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    if (user) navigate(roleHome[user.nombreRol]);
    else navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-indigo-300">403</p>
        <h1 className="text-2xl font-bold text-gray-800 mt-4">Acceso no autorizado</h1>
        <p className="text-gray-500 mt-2">No tiene permisos para acceder a esta sección.</p>
        <button
          onClick={handleBack}
          className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
