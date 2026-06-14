export type ClassroomEntregaEstado = 'pendiente' | 'aprovado' | 'corregido';

export interface ClassroomEntrega {
  id: string;
  idClassroomTarea: string;
  idEstudiante: string;
  fechaEntrega: string;
  estado: ClassroomEntregaEstado;
  observacionProfesor: string | null;
  tituloTarea?: string;
  nombreEstudiante?: string;
}

export interface ClassroomEntregaAdjunto {
  id: string;
  idClassroomEntrega: string;
  urlArchivo: string;
  nombreArchivo: string;
}

export interface UpdateEstadoEntregaDto {
  estadoEntrega: ClassroomEntregaEstado;
  observacionProfesor?: string;
}
