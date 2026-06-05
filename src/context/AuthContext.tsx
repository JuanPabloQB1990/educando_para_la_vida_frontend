import React, { createContext, useState, useCallback, useEffect } from 'react';
import type { AuthUser, LoginRequest } from '../types/auth';
import { authService } from '../services/authService';
import { clearTokens, getAccessToken, setTokens } from '../services/http';
import { decodeJwtPayload } from '../utils/jwt';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      const payload = decodeJwtPayload(token);
      if (payload && payload.exp * 1000 > Date.now()) {
        setUser({
          id: payload.id,
          idRol: payload.idRol,
          nombreRol: payload.nombreRol,
          email: payload.email,
        });
      } else {
        clearTokens();
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const { accessToken, refreshToken, usuario: userData } = await authService.login(credentials);
    setTokens(accessToken, refreshToken);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout().catch(() => {});
    clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
