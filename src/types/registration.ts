// Tipos para el CRUD de Documentos
export interface TipoDocumento {
  id_tipo_documento: number;
  nombre: string;
}

// Interfaz para la respuesta de la API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
}

export interface TipoEstudio {
  id_tipo_estudio: number;
  nombre: string;
}

export interface TipoGrado {
  id_grado_educacion: number;
  nombre: string;
}

export interface TiempoValidacion {
  id_tiempo_validacion: number;
  tiempo: string;
}
