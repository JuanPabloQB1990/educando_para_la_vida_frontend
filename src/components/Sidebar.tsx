import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { RolNombre } from '../types/auth';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const adminNav: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: <IconGrid /> },
  { label: 'Usuarios', to: '/admin/usuarios', icon: <IconUsers /> },
  { label: 'Años Electivos', to: '/admin/anios', icon: <IconCalendar /> },
  { label: 'Matrículas', to: '/admin/matriculas', icon: <IconClipboard /> },
  { label: 'Cargas Académicas', to: '/admin/cargas', icon: <IconBook /> },
  { label: 'Notas y Asistencias', to: '/admin/notas', icon: <IconChart /> },
  { label: 'Pagos y Rubros', to: '/admin/pagos', icon: <IconCash /> },
];

const profesorNav: NavItem[] = [
  { label: 'Dashboard', to: '/profesor', icon: <IconGrid /> },
  { label: 'Carga Académica', to: '/profesor/cargas', icon: <IconBook /> },
  { label: 'Calificaciones', to: '/profesor/calificaciones', icon: <IconChart /> },
  { label: 'Asistencia', to: '/profesor/asistencia', icon: <IconClipboard /> },
  { label: 'Classroom', to: '/profesor/classroom', icon: <IconFolder /> },
  { label: 'Link Clase Virtual', to: '/profesor/clase-virtual', icon: <IconLink /> },
];

const estudianteNav: NavItem[] = [
  { label: 'Dashboard', to: '/estudiante', icon: <IconGrid /> },
  { label: 'Mis Notas', to: '/estudiante/notas', icon: <IconChart /> },
  { label: 'Asistencia', to: '/estudiante/asistencia', icon: <IconClipboard /> },
  { label: 'Pagos', to: '/estudiante/pagos', icon: <IconCash /> },
  { label: 'Classroom', to: '/estudiante/classroom', icon: <IconFolder /> },
];

const navByRole: Record<RolNombre, NavItem[]> = {
  admin: adminNav,
  profesor: profesorNav,
  estudiante: estudianteNav,
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: Props) {
  const { user } = useAuth();
  const items = user ? navByRole[user.nombreRol] : [];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-indigo-900 text-white flex flex-col transition-transform duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-indigo-700 shrink-0">
        <span className="font-bold text-lg leading-tight">Educando Para<br />La Vida</span>
        <button
          onClick={onClose}
          className="ml-auto lg:hidden text-indigo-300 hover:text-white"
          aria-label="Cerrar menú"
        >
          <IconX />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/admin' || item.to === '/profesor' || item.to === '/estudiante'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                  }`
                }
              >
                <span className="shrink-0 w-5 h-5">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Role badge */}
      {user && (
        <div className="px-6 py-4 border-t border-indigo-700 text-xs text-indigo-300 capitalize">
          Rol: {user.nombreRol}
        </div>
      )}
    </aside>
  );
}

// Inline SVG icons
function IconGrid() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-full h-full">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-full h-full">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-full h-full">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function IconClipboard() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-full h-full">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-full h-full">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-full h-full">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  );
}
function IconCash() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-full h-full">
      <rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}
function IconFolder() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-full h-full">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  );
}
function IconLink() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-full h-full">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}
function IconX() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
