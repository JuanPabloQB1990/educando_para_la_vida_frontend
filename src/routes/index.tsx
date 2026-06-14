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
import PeriodosAdminPage from '../pages/admin/PeriodosAdminPage';
import PagosAdminPage from '../pages/admin/PagosAdminPage';
import UsuariosAdminPage from '../pages/admin/UsuariosAdminPage';
import DashboardProfesorPage from '../pages/profesor/DashboardProfesorPage';
import DashboardEstudiantePage from '../pages/estudiante/DashboardEstudiantePage';
import DashboardSecretariaPage from '../pages/secretaria/DashboardSecretariaPage';
import MateriasAdminPage from '../pages/admin/MateriasAdminPage';
import GradosEducacionAdminPage from '../pages/admin/GradosEducacionAdminPage';
import PlanEstudioAdminPage from '../pages/admin/PlanEstudioAdminPage';
import CargasAdminPage from '../pages/admin/CargasAdminPage';
import TipoEstudioAdminPage from '../pages/admin/TipoEstudioAdminPage';
import DireccionGradoAdminPage from '../pages/admin/DireccionGradoAdminPage';
import TiempoValidacionAdminPage from '../pages/admin/TiempoValidacionAdminPage';
import RubrosAdminPage from '../pages/admin/RubrosAdminPage';
import NotasAdminPage from '../pages/admin/NotasAdminPage';
import ClassroomProfesorPage from '../pages/profesor/ClassroomProfesorPage';

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
              { path: 'usuarios', element: <UsuariosAdminPage /> },
              { path: 'anios', element: <AnioElectivoPage /> },
              { path: 'periodos', element: <PeriodosAdminPage /> },
              { path: 'materias', element: <MateriasAdminPage /> },
              { path: 'grados', element: <GradosEducacionAdminPage /> },
              { path: 'plan-estudio', element: <PlanEstudioAdminPage /> },
              { path: 'tipo-estudio', element: <TipoEstudioAdminPage /> },
              { path: 'tiempo-validacion', element: <TiempoValidacionAdminPage /> },
              { path: 'direccion-grado', element: <DireccionGradoAdminPage /> },
              { path: 'matriculas', element: <ComingSoon title="Matrículas" /> },
              { path: 'cargas', element: <CargasAdminPage /> },
              { path: 'notas', element: <NotasAdminPage /> },
              { path: 'rubros', element: <RubrosAdminPage /> },
              { path: 'pagos', element: <PagosAdminPage /> },
            ],
          },
        ],
      },
      // Secretaria

      {
        element: <RoleRoute roles={['secretari@']} />,
        children: [
          {
            path: '/secretaria',
            element: <DashboardLayout />,
            children: [
              { index: true, element: <DashboardSecretariaPage /> },
              { path: 'anios', element: <AnioElectivoPage /> },
              { path: 'periodos', element: <PeriodosAdminPage /> },
              { path: 'materias', element: <MateriasAdminPage /> },
              { path: 'grados', element: <GradosEducacionAdminPage /> },
              { path: 'tipo-estudio', element: <TipoEstudioAdminPage /> },
              { path: 'plan-estudio', element: <PlanEstudioAdminPage /> },
              { path: 'tiempo-validacion', element: <TiempoValidacionAdminPage /> },
              { path: 'direccion-grado', element: <DireccionGradoAdminPage /> },
              { path: 'matriculas', element: <ComingSoon title="Matrículas" /> },
              { path: 'cargas', element: <CargasAdminPage /> },
              { path: 'notas', element: <NotasAdminPage /> },
              { path: 'rubros', element: <RubrosAdminPage /> },
              { path: 'pagos', element: <PagosAdminPage /> },
            ],
          },
        ],
      },
      // Profesor
      {
        element: <RoleRoute roles={['profesor(a)']} />,
        children: [
          {
            path: '/profesor',
            element: <DashboardLayout />,
            children: [
              { index: true, element: <DashboardProfesorPage /> },
              { path: 'cargas', element: <ComingSoon title="Carga Académica" /> },
              { path: 'notas', element: <NotasAdminPage /> },
              { path: 'classroom', element: <ClassroomProfesorPage /> },
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
