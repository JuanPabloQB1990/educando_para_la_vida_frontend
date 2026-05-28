import http from './http';
import type { LoginRequest, LoginResponse } from '../types/auth';

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await http.post<{ success: boolean; data: LoginResponse }>('/auth/login', data);
    console.log(res.data.data);
    
    return res.data.data;
  },

  async logout(): Promise<void> {
    await http.post('/auth/logout');
  },

  async solicitarRecuperacion(email: string): Promise<void> {
    await http.post('/auth/recuperar-password', { email });
  },

  async verificarCodigo(email: string, code: string): Promise<void> {
    await http.post('/auth/verificar-codigo', { email, code });
  },

  async nuevaPassword(email: string, code: string, newPassword: string): Promise<void> {
    await http.post('/auth/nueva-password', { email, code, newPassword });
  },
};
