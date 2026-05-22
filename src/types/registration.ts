// Tipos para el CRUD de Documentos
export interface TipoDocumento {
  idTipoDocumento: string;
  nombre: string;
}

// Interfaz para la respuesta de la API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
}

export interface TipoEstudio {
  idTipoEstudio: string;
  nombre: string;
}

export interface TipoGrado {
  idGradoEducacion: string;
  nombre: string;
}

export interface TiempoValidacion {
  idTiempoValidacion: string;
  tiempo: string;
}
