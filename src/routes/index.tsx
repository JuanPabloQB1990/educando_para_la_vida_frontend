import React from 'react';
import { RouteObject } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import RegistrationPage from '../pages/RegistrationPage';

// Importar más páginas conforme se vayan creando
// import Dashboard from '../pages/Dashboard';
// import StudentManagement from '../pages/StudentManagement';

/**
 * Definición de todas las rutas de la aplicación
 * Las rutas se organizan por secciones principales:
 * - / - Página de inicio
 * - /registro - Formulario de inscripción
 * - /dashboard - Panel de control (futuro)
 * - /estudiantes - Gestión de estudiantes (futuro)
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/registro',
    element: <RegistrationPage />,
  },
  // Aquí irán más rutas en el futuro
  // {
  //   path: '/dashboard',
  //   element: <Dashboard />,
  // },
  // {
  //   path: '/estudiantes',
  //   element: <StudentManagement />,
  // },
];

export default routes;
