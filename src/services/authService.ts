import { ENDPOINTS } from '../config';
import type { LoginRequest, LoginResponse } from '../types/auth';
import { apiPost, apiVoidPost } from '../utils/apiHelpers';

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    return apiPost<LoginResponse, LoginRequest>(ENDPOINTS.auth.login, data);
  },

  async logout(): Promise<void> {
    return apiVoidPost(ENDPOINTS.auth.logout);
  },

  async solicitarRecuperacion(email: string): Promise<void> {
    return apiVoidPost(ENDPOINTS.auth.recuperarPassword, { email });
  },

  async verificarCodigo(email: string, code: string): Promise<void> {
    return apiVoidPost(ENDPOINTS.auth.verificarCodigo, { email, code });
  },

  async nuevaPassword(email: string, code: string, newPassword: string): Promise<void> {
    return apiVoidPost(ENDPOINTS.auth.nuevaPassword, { email, code, newPassword });
  },
};
