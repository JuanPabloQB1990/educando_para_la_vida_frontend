import type { MatriculaInfo, GradoMatricula } from './pagosEstudiante';

export interface EstudianteAdminFilters {
  noDocumento?: string;
  padreCedula?: string;
  madreCedula?: string;
  acudienteCedula?: string;
}

export interface EstudianteAdmin {
  id: string;
  idUsuario: string;
  fileFoto: string | null;
  padreCedula: string | null;
  madreCedula: string | null;
  acudienteCedula: string | null;
  usuarioNombres: string;
  usuarioApellido1: string;
  usuarioApellido2: string | null;
  usuarioEmail: string | null;
  usuarioContacto1: string | null;
  usuarioContacto2: string | null;
  usuarioEstado: 'activo' | 'inactivo';
  usuarioNoDocumento: string | null;
  usuarioFechaExpedicionDocumento: string | null;
}

export interface MatriculaConGrados {
  matricula: MatriculaInfo;
  grados: GradoMatricula[];
}
