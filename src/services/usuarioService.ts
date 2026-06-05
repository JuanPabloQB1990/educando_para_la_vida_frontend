import http from './http';
import type {
  UsuarioAdmin,
  CreateUsuarioDto,
  UpdateUsuarioDto,
  CreateUsuarioResponse,
  Rol,
  TipoDocumento,
} from '../types/usuario';

export const usuarioService = {
  async getAll(): Promise<UsuarioAdmin[]> {
    const res = await http.get<{ success: boolean; data: UsuarioAdmin[] }>('/usuario/usuario');
    return res.data.data;
  },

  async create(data: CreateUsuarioDto): Promise<CreateUsuarioResponse> {
    const res = await http.post<{ success: boolean; data: CreateUsuarioResponse }>('/usuario/usuario', data);
    return res.data.data;
  },

  async update(id: string, data: UpdateUsuarioDto): Promise<void> {
    await http.put(`/usuario/usuario/${id}`, data);
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/usuario/usuario/${id}`);
  },

  async getRoles(): Promise<Rol[]> {
    const res = await http.get<{ success: boolean; data: Rol[] }>('/usuario/rol');
    return res.data.data;
  },

  async getTiposDocumento(): Promise<TipoDocumento[]> {
    const res = await http.get<{ success: boolean; data: TipoDocumento[] }>('/usuario/tipo_documento');
    return res.data.data;
  },
};
