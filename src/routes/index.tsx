import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

import HomePage from '../pages/HomePage';
import RegistrationPage from '../pages/RegistrationPage';
import LoginPage from '../pages/LoginPage';
import RecuperarPasswordPage from '../pages/RecuperarPasswordPage';
import NuevaPasswordPage from '../pages/NuevaPasswordPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';

import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

import DashboardLayout from '../layouts/DashboardLayout';

import DashboardAdminPage from '../pages/admin/DashboardAdminPage';
import AnioElectivoPage from '../pages/admin/AnioElectivoPage';
import PagosAdminPage from '../pages/admin/PagosAdminPage';
import DashboardProfesorPage from '../pages/profesor/DashboardProfesorPage';
import DashboardEstudiantePage from '../pages/estudiante/DashboardEstudiantePage';

const routes: RouteObject[] = [
  // Públicas
  { path: '/', element: <HomePage /> },
  { path: '/matricula', element: <RegistrationPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/recuperar-password', element: <RecuperarPasswordPage /> },
  { path: '/nueva-password', element: <NuevaPasswordPage /> },
  { path: '/403', element: <UnauthorizedPage /> },

  // Rutas protegidas
  {
    element: <ProtectedRoute />,
    children: [
      // Admin
      {
        element: <RoleRoute roles={['admin']} />,
        children: [
          {
            path: '/admin',
            element: <DashboardLayout />,
            children: [
              { index: true, element: <DashboardAdminPage /> },
              { path: 'usuarios', element: <ComingSoon title="Usuarios" /> },
              { path: 'anios', element: <AnioElectivoPage /> },
              { path: 'matriculas', element: <ComingSoon title="Matrículas" /> },
              { path: 'cargas', element: <ComingSoon title="Cargas Académicas" /> },
              { path: 'notas', element: <ComingSoon title="Notas y Asistencias" /> },
              { path: 'pagos', element: <PagosAdminPage /> },
            ],
          },
        ],
      },
      // Profesor
      {
        element: <RoleRoute roles={['profesor']} />,
        children: [
          {
            path: '/profesor',
            element: <DashboardLayout />,
            children: [
              { index: true, element: <DashboardProfesorPage /> },
              { path: 'cargas', element: <ComingSoon title="Carga Académica" /> },
              { path: 'calificaciones', element: <ComingSoon title="Calificaciones" /> },
              { path: 'asistencia', element: <ComingSoon title="Asistencia" /> },
              { path: 'classroom', element: <ComingSoon title="Classroom" /> },
              { path: 'clase-virtual', element: <ComingSoon title="Link Clase Virtual" /> },
            ],
          },
        ],
      },
      // Estudiante
      {
        element: <RoleRoute roles={['estudiante']} />,
        children: [
          {
            path: '/estudiante',
            element: <DashboardLayout />,
            children: [
              { index: true, element: <DashboardEstudiantePage /> },
              { path: 'notas', element: <ComingSoon title="Mis Notas" /> },
              { path: 'asistencia', element: <ComingSoon title="Asistencia" /> },
              { path: 'pagos', element: <ComingSoon title="Pagos" /> },
              { path: 'classroom', element: <ComingSoon title="Classroom" /> },
            ],
          },
        ],
      },
    ],
  },

  // Fallback
  { path: '*', element: <Navigate to="/" replace /> },
];

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-sm text-gray-400">Módulo en construcción.</p>
    </div>
  );
}

export default routes;
