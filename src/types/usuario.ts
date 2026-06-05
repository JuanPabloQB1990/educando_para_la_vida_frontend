export interface UsuarioAdmin {
  id: string;
  nombres: string;
  apellido1: string;
  apellido2: string | null;
  contacto1: string | null;
  contacto2: string | null;
  email: string | null;
  estado: 'activo' | 'inactivo';
  idTipoDocumento: string | null;
  idRol: string | null;
  noDocumento: string | null;
  fechaExpedicionDocumento: string | null;
  nombreRol: string | null;
  nombreTipoDocumento: string | null;
}

export interface CreateUsuarioDto {
  nombres: string;
  apellido1: string;
  apellido2: string;
  email: string;
  contacto1: string;
  contacto2?: string;
  id_tipo_documento: string;
  no_documento: string;
  fecha_expedicion_documento: string;
  id_rol: string;
}

export interface UpdateUsuarioDto extends CreateUsuarioDto {
  estado: 'activo' | 'inactivo';
}

export interface CreateUsuarioResponse {
  plainPassword: string;
  id: string;
}

export interface Rol {
  id: string;
  nombre: string;
}

export interface TipoDocumento {
  id: string;
  nombre: string;
}
