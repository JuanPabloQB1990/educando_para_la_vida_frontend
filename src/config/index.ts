export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 30000,
  },
  app: {
    name: 'Institución Educativa "Educando Para la Vida"',
    description: 'Sistema de Matrícula Electrónica',
  },
} as const;

export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    recuperarPassword: '/auth/recuperar-password',
    verificarCodigo: '/auth/verificar-codigo',
    nuevaPassword: '/auth/nueva-password',
  },
  academico: {
    bloque: '/academico/bloque',
    gradoEducacion: '/academico/grado_educacion',
    tiempoValidacion: '/academico/tiempo_validacion',
    tipoEstudio: '/academico/tipo_estudio',
  },
  catalogo: {
    materia: '/catalogo/materia',
    planEstudio: '/catalogo/plan_estudio',
  },
  docente: {
    actividad: '/docente/actividad',
    actividadMateria: '/docente/actividad_materia',
    asistenciaFecha: '/docente/asistencia/fecha',
    asistenciaUpsert: '/docente/asistencia/upsert',
    autoevaluacionUpsert: '/docente/autoevaluacion/upsert',
    autoevaluacion: '/docente/autoevaluacion',
    calificacion: '/docente/calificacion',
    cargaAcademica: '/docente/carga_academica',
    classroomEntrega: '/docente/classroom_entrega',
    classroomTarea: '/docente/classroom_tarea',
    direccionGrado: '/docente/direccion_grado',
    periodo: '/docente/periodo',
    planillaAcademica: '/docente/planilla_academica',
  },
  estudiante: {
    claseVirtual: '/estudiante/clase-virtual',
    classroomEntregas: '/estudiante/classroom/entregas',
    classroomTareas: '/estudiante/classroom/tareas',
    pagos: '/estudiante/pagos',
    pagosComprobante: '/estudiante/pagos/comprobante',
    perfil: '/estudiante/perfil',
    perfilArchivo: '/estudiante/perfil/archivo',
  },
  gestion: {
    anioElectivo: '/gestion/anio_electivo',
    dashboardStats: '/gestion/dashboard/stats',
    estudianteAdmin: '/gestion/estudiante/admin',
    estudiante: '/gestion/estudiante',
    estudianteMatricula: '/gestion/estudiante_matricula',
    gradosPorMatricula: '/gestion/grados_por_matricula',
    obligacionPago: '/gestion/obligacion_pago',
    pagoAdmin: '/gestion/pago/admin',
    pago: '/gestion/pago',
    rubro: '/gestion/rubro',
  },
  matricula: '/matriculas',
  usuario: {
    usuario: '/usuario/usuario',
    rol: '/usuario/rol',
    tipoDocumento: '/usuario/tipo_documento',
  },
} as const;

export default config;
