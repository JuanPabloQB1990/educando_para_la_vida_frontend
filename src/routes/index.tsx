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
import PerfilEstudiantePage from '../pages/estudiante/PerfilEstudiantePage';
import PagosEstudiantePage from '../pages/estudiante/PagosEstudiantePage';
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
import ClaseVirtualProfesorPage from '../pages/profesor/ClaseVirtualProfesorPage';
import ClassroomEstudiantePage from '../pages/estudiante/ClassroomEstudiantePage';
import ClaseVirtualEstudiantePage from '../pages/estudiante/ClaseVirtualEstudiantePage';
import MatriculasAdminPage from '../pages/admin/MatriculasAdminPage';
import DetalleEstudiantePage from '../pages/admin/DetalleEstudiantePage';
import HistorialMatriculaPage from '../pages/admin/HistorialMatriculaPage';
import MatricularAnioPage from '../pages/admin/MatricularAnioPage';

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
              { path: 'matriculas', element: <MatriculasAdminPage /> },
              { path: 'matriculas/:idEstudiante/detalle', element: <DetalleEstudiantePage /> },
              { path: 'matriculas/:idEstudiante/historial', element: <HistorialMatriculaPage /> },
              { path: 'cargas', element: <CargasAdminPage /> },
              { path: 'notas', element: <NotasAdminPage /> },
              { path: 'rubros', element: <RubrosAdminPage /> },
              { path: 'pagos', element: <PagosAdminPage /> },
              { path: 'pagos/matricular/:idEstudianteMatricula', element: <MatricularAnioPage /> },
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
              { path: 'matriculas', element: <MatriculasAdminPage /> },
              { path: 'matriculas/:idEstudiante/detalle', element: <DetalleEstudiantePage /> },
              { path: 'matriculas/:idEstudiante/historial', element: <HistorialMatriculaPage /> },
              { path: 'cargas', element: <CargasAdminPage /> },
              { path: 'notas', element: <NotasAdminPage /> },
              { path: 'rubros', element: <RubrosAdminPage /> },
              { path: 'pagos', element: <PagosAdminPage /> },
              { path: 'pagos/matricular/:idEstudianteMatricula', element: <MatricularAnioPage /> },
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
              { path: 'notas', element: <NotasAdminPage /> },
              { path: 'classroom', element: <ClassroomProfesorPage /> },
              { path: 'clase-virtual', element: <ClaseVirtualProfesorPage /> },
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
              { path: 'perfil', element: <PerfilEstudiantePage /> },
              { path: 'pagos', element: <PagosEstudiantePage /> },
              { path: 'classroom', element: <ClassroomEstudiantePage /> },
              { path: 'clase-virtual', element: <ClaseVirtualEstudiantePage /> },
            ],
          },
        ],
      },
    ],
  },

  // Fallback
  { path: '*', element: <Navigate to="/" replace /> },
];

export default routes;
