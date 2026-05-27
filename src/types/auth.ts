export type RolNombre = 'admin' | 'profesor' | 'estudiante';

export interface JwtPayload {
  idUsuario: string;
  idRol: string;
  nombreRol: RolNombre;
  email: string;
  exp: number;
  iat: number;
}

export interface AuthUser {
  idUsuario: string;
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
