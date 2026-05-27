import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { RolNombre } from '../types/auth';

interface Props {
  roles: RolNombre[];
}

export function RoleRoute({ roles }: Props) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.nombreRol)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
