import { ENDPOINTS } from '../config';
import type {
  UsuarioAdmin,
  CreateUsuarioDto,
  UpdateUsuarioDto,
  CreateUsuarioResponse,
  Rol,
  TipoDocumento,
} from '../types/usuario';
import { apiGet, apiPost, apiVoidPut, apiVoidDelete } from '../utils/apiHelpers';

export const usuarioService = {
  async getAll(): Promise<UsuarioAdmin[]> {
    return apiGet<UsuarioAdmin[]>(ENDPOINTS.usuario.usuario);
  },

  async create(data: CreateUsuarioDto): Promise<CreateUsuarioResponse> {
    return apiPost<CreateUsuarioResponse, CreateUsuarioDto>(ENDPOINTS.usuario.usuario, data);
  },

  async update(id: string, data: UpdateUsuarioDto): Promise<void> {
    return apiVoidPut<UpdateUsuarioDto>(`${ENDPOINTS.usuario.usuario}/${id}`, data);
  },

  async remove(id: string): Promise<void> {
    return apiVoidDelete(`${ENDPOINTS.usuario.usuario}/${id}`);
  },

  async getRoles(): Promise<Rol[]> {
    return apiGet<Rol[]>(ENDPOINTS.usuario.rol);
  },

  async getTiposDocumento(): Promise<TipoDocumento[]> {
    return apiGet<TipoDocumento[]>(ENDPOINTS.usuario.tipoDocumento);
  },
};
