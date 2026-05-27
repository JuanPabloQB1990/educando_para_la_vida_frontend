/**
 * Configuración centralizada de la aplicación
 * Este archivo contiene todas las variables de configuración
 * que se utilizan en toda la aplicación
 */

export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 30000,
    endpoints: {
      // Agregar más endpoints conforme se necesiten
      inscripciones: '/matriculas',
      tipoDocumento: '/usuario/tipo_documento',
      tipoEstudio: '/academico/tipo_estudio',
      gradoEducacion: '/academico/grado_educacion',
      tiempoValidacion: '/academico/tiempo_validacion',
      // dashboard: '/dashboard',
    },
  },
  app: {
    name: 'Institución Educativa "Educando Para la Vida"',
    description: 'Sistema de Matrícula Electrónica',
  },
} as const;

export default config;
