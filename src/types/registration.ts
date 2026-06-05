// Tipos para el CRUD de Documentos
export interface TipoDocumento {
  id: string;
  nombre: string;
}

// Interfaz para la respuesta de la API
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: string | null;
}

export interface TipoEstudio {
  id: string;
  nombre: string;
}

export interface TipoGrado {
  id: string;
  nombre: string;
}

export interface TiempoValidacion {
  id: string;
  tiempo: string;
}
