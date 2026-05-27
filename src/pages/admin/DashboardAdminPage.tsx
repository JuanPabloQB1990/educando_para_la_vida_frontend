import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const cards = [
  { label: 'Usuarios', color: 'bg-blue-500', placeholder: '—' },
  { label: 'Matrículas activas', color: 'bg-green-500', placeholder: '—' },
  { label: 'Pagos pendientes', color: 'bg-yellow-500', placeholder: '—' },
  { label: 'Año electivo activo', color: 'bg-indigo-500', placeholder: '—' },
];

export default function DashboardAdminPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">
        Bienvenido, administrador
      </h1>
      <p className="text-sm text-gray-500 mb-6">{user?.email}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, color, placeholder }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm p-5">
            <div className={`w-10 h-10 ${color} rounded-lg mb-3`} />
            <p className="text-2xl font-bold text-gray-800">{placeholder}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Accesos rápidos</h2>
        <p className="text-sm text-gray-400">
          Utilice el menú lateral para navegar entre los módulos disponibles.
        </p>
      </div>
    </div>
  );
}
