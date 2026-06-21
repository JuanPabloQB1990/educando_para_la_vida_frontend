import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useDashboardStats } from '../../hooks/useDashboard';

function StatCard({
  label,
  value,
  color,
  isLoading,
}: {
  label: string;
  value: string | number;
  color: string;
  isLoading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className={`w-10 h-10 ${color} rounded-lg mb-3`} />
      {isLoading ? (
        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-1" />
      ) : (
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      )}
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export default function DashboardSecretariaPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

  const cards = [
    { label: 'Pagos pendientes', color: 'bg-yellow-500', value: stats?.pagosPendientes ?? '—' },
    { label: 'Obligaciones vencidas', color: 'bg-red-500', value: stats?.obligacionesVencidas ?? '—' },
    { label: 'Año electivo activo', color: 'bg-indigo-500', value: stats?.anioElectivoActivo ?? '—' },
    { label: 'Estudiantes', color: 'bg-blue-500', value: stats?.totalEstudiantes ?? '—' },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">
        Bienvenido/a, secretaria
      </h1>
      <p className="text-sm text-gray-500 mb-6">{user?.email}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, color, value }) => (
          <StatCard key={label} label={label} color={color} value={value} isLoading={isLoading} />
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
