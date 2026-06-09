export interface PlanillaActividadMateria {
  id: string;
  nombre: string;
  nombreMateria: string;
}

export interface PlanillaActividad {
  id: string;
  nombre: string;
  semana: number;
  materias: PlanillaActividadMateria[];
}

export interface PlanillaCalificacion {
  id: string;
  nota: number;
  observacion: string | null;
}

export interface PlanillaAsistencia {
  id: string;
  estado: string;
  observacion: string | null;
}

export interface PlanillaEstudiante {
  id: string;
  nombre: string;
  tipoDocumento: string;
  noDocumento: string;
  calificaciones: Record<string, PlanillaCalificacion>;
  asistencias: Record<string, PlanillaAsistencia>;
  totalPresente: number;
  porcentajeAsistencia: number;
}

export interface PlanillaAcademica {
  grado: { id: string; nombre: string };
  anio: number;
  periodo: { id: string; numeroPeriodo: number };
  director: string | null;
  actividades: PlanillaActividad[];
  fechasAsistencia: string[];
  estudiantes: PlanillaEstudiante[];
}
