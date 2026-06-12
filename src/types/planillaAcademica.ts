export interface PlanillaActividadMateria {
  id: string;
  idMateria: string;
  nombreMateria: string;
  abreviaturaMateria: string;
}

export interface PlanillaActividad {
  id: string;
  nombre: string;
  materias: PlanillaActividadMateria[];
  fechasAsistencia: string[];
}

export interface PlanillaCalificacion {
  id: string;
  nota: number;
  observacion: string | null;
}

export interface PlanillaAsistencia {
  id: string;
  estado: string | null;
  observacion: string | null;
}

export interface PlanillaEstudiante {
  id: string;
  nombre: string;
  tipoDocumento: string;
  noDocumento: string;
  calificaciones: Record<string, PlanillaCalificacion>;
  asistencias: Record<string, Record<string, PlanillaAsistencia>>;
  totalPresente: number;
  porcentajeAsistencia: number;
  autoevaluacion: number | null;
  autoevaluacionId: string | null;
  autoevaluacionObservacion: string | null;
}

export interface PlanillaAcademica {
  grado: { id: string; nombre: string };
  anio: number;
  periodo: { id: string; numeroPeriodo: number };
  director: string | null;
  actividades: PlanillaActividad[];
  estudiantes: PlanillaEstudiante[];
}
