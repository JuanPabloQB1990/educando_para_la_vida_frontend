import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';

interface Props {
  onMenuClick: () => void;
  sidebarCollapsed?: boolean;
}

export function DashboardHeader({ onMenuClick, sidebarCollapsed = false }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
    toast.info('Sesión cerrada.');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 gap-4 shrink-0">
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className={`p-1 rounded text-gray-500 hover:bg-gray-100 ${sidebarCollapsed ? '' : 'lg:hidden'}`}
        aria-label="Abrir menú"
      >
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <span className="font-semibold text-gray-800 text-sm hidden sm:block">
        Sistema de Gestión Académica
      </span>

      <div className="ml-auto flex items-center gap-3">
        <span className="text-sm text-gray-600 hidden sm:block">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
