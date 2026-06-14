export interface PagoInfo {
  id: string;
  montoPagado: number;
  fechaPagoReal: string | null;
  fileComprobante: string;
  observaciones: string | null;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  fechaVerificacion: string | null;
}

export interface ObligacionConPago {
  idObligacionPago: string;
  idRubro: string;
  nombreRubro: string;
  montoCuota: number;
  fechaVencimiento: string | null;
  estadoObligacion: 'pendiente' | 'pagado' | 'vencido';
  pago: PagoInfo | null;
}

export interface GradoMatricula {
  idEstudianteMatricula: string;
  idGradoEducacion: string;
  nombreGrado: string;
  estado: 'pendiente' | 'cursando' | 'aprobado' | 'reprobado' | 'retirado';
}

export interface MatriculaInfo {
  id: string;
  idEstudiante: string;
  idTipoEstudio: string | null;
  idTiempoValidacion: string | null;
  idAnioElectivo: string | null;
  fechaInscripcion: string | null;
  fileCertificadoGrados: string | null;
  fileCompromiso: string;
  createdAt: string | null;
  anioElectivoAnio: number | null;
  anioElectivoEstado: 'activo' | 'cerrado' | null;
  nombreTipoEstudio: string | null;
  mesesTiempoValidacion: number | null;
}

export interface PagosEstudianteData {
  matricula: MatriculaInfo;
  grados: GradoMatricula[];
  obligaciones: ObligacionConPago[];
}
