export type RolNombre = 'admin' | 'profesor(a)' | 'estudiante' | 'secretari@';

export interface JwtPayload {
  id: string;
  idRol: string;
  nombreRol: RolNombre;
  email: string;
  exp: number;
  iat: number;
}

export interface AuthUser {
  id: string;
  idRol: string;
  nombreRol: RolNombre;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  usuario: AuthUser;
}
