export interface PagoAdmin {
  // pago
  idPago: string;
  idObligacionPago: string;
  montoPagado: string;
  fechaPagoReal: string | null;
  fileComprobante: string;
  observaciones: string | null;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  fechaVerificacion: string | null;
  // obligacion_pago
  idRubro: string;
  montoCuota: string;
  fechaVencimiento: string | null;
  estadoObligacion: 'pendiente' | 'pagado' | 'vencido';
  // rubro
  nombreRubro: string;
  // estudiante_periodo
  idEstudiantePeriodo: string;
  idEstudiante: string;
  fechaInscripcion: string | null;
  fileCompromiso: string;
  fileCertificadoGrados: string | null;
  nombreTipoEstudio: string | null;
  tiempoValidacion: number | null;
  // estudiante
  fechaNacimiento: string | null;
  edad: number | null;
  sexo: string | null;
  municipioNacimiento: string;
  departamentoNacimiento: string;
  paisNacimiento: string;
  religion: string;
  direccionActual: string;
  barrioVeredaActual: string;
  ciudadActual: string;
  departamentoActual: string;
  paisActual: string;
  fileFoto: string;
  fileDoc: string;
  fileDiagnostico: string | null;
  ref1Nombres: string;
  ref1Apellidos: string;
  ref1Tel: string;
  ref2Nombres: string;
  ref2Apellidos: string;
  ref2Tel: string;
  ref3Nombres: string;
  ref3Apellidos: string;
  ref3Tel: string;
  ref4Nombres: string;
  ref4Apellidos: string;
  ref4Tel: string;
  ref5Nombres: string;
  ref5Apellidos: string;
  ref5Tel: string;
  ref6Nombres: string;
  ref6Apellidos: string;
  ref6Tel: string;
  limitaciones: string | null;
  otrasLimitaciones: string | null;
  capacidades: string | null;
  ciPuntaje: string | null;
  padreApellido1: string;
  padreApellido2: string;
  padreNombre: string;
  padreCedula: string;
  padreContacto1: string;
  padreContacto2: string | null;
  padreFile: string;
  madreApellido1: string;
  madreApellido2: string;
  madreNombre: string;
  madreCedula: string;
  madreContacto1: string;
  madreContacto2: string | null;
  madreFile: string;
  acudienteApellido1: string;
  acudienteApellido2: string;
  acudienteNombre: string;
  acudienteCedula: string;
  acudienteContacto1: string;
  acudienteContacto2: string | null;
  acudienteFile: string;
  problemasalud: string | null;
  eps: string;
  ips: string;
  rh: string;
  observacionesEstudiante: string | null;
  // usuario
  nombres: string;
  apellido1: string;
  apellido2: string | null;
  noDocumento: string | null;
  email: string | null;
  contacto1: string | null;
  contacto2: string | null;
  estadoUsuario: 'activo' | 'inactivo';
  fechaExpedicionDocumento: string | null;
  nombreTipoDocumento: string | null;
}

export interface PagoAdminFilters {
  idRubro?: string;
  fechaPagoReal?: string;
  estado?: string;
  fechaVerificacion?: string;
  noDocumento?: string;
  padreCedula?: string;
  madreCedula?: string;
  acudienteCedula?: string;
}

export interface VerificarPagoDto {
  accion: 'aprobado' | 'rechazado';
  idObligacionPago?: string;
  montoPagado?: string;
  observaciones?: string;
}

export interface MatricularAnioDto {
  idAnioElectivo: string;
  idRubro: string;
  meses: number[];
}

export interface GradoMatriculado {
  idEstudiantePeriodo: string;
  idGradoEducacion: string;
  estado: 'finalizado' | 'pendiente' | 'retirado';
  nombreGrado: string;
}

export interface ObligacionPagoEstudiante {
  idObligacionPago: string;
  idRubro: string;
  montoCuota: string;
  fechaVencimiento: string | null;
  estado: 'pendiente' | 'pagado' | 'vencido';
  nombreRubro: string;
}
