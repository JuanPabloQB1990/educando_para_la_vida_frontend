export interface ClassroomTarea {
  id: string;
  idCargaAcademica: string;
  idPeriodo: string;
  titulo: string;
  instrucciones: string;
  fechaLimite: string;
  fechaCreacion: string;
  nombreMateria?: string;
  nombreGrado?: string;
  numeroPeriodo?: number;
}

export interface CreateClassroomTareaDto {
  idCargaAcademica: string;
  idPeriodo: string;
  titulo: string;
  instrucciones: string;
  fechaLimite: string;
}

export interface UpdateClassroomTareaDto {
  titulo: string;
  instrucciones: string;
  fechaLimite: string;
}

export interface ClassroomTareaAdjunto {
  id: string;
  idClassroomTarea: string;
  urlArchivo: string;
  nombreArchivo: string;
}
