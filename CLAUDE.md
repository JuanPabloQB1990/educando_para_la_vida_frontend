# Frontend - Sistema Gestión Académica

## Descripción General
Frontend profesional, modular y de alta fidelidad para la institución educativa "Educando Para La Vida", desarrollado con React, TypeScript estricto y un sistema de diseño responsivo basado en Tailwind CSS.

Responsable de la interfaz pública (Landing & Matrículas), el flujo de autenticación y tres Dashboards independientes protegidos por rol (Admin, Profesor, Estudiante).

Debe incluir:

- Landing page institucional pública.
- Formulario de matrículas.
- Dashboard administrativo.
- Dashboard profesor.
- Dashboard estudiante.
- Sistema de autenticación.
- Rutas protegidas.
- Gestión académica.

# Stack Tecnológico

- React 18+ (Functional Components & Hooks)
- Vite (Herramienta de construcción rápida)
- TypeScript (Tipado estricto para componentes, DTOs y respuestas de la API)
- Tailwind CSS (Diseño responsivo y utilitario)
- Axios (Instancia centralizada con interceptores para inyección de JWT y manejo de errores)
- TanStack Query v5 (React Query para la gestión del estado del servidor, cachés y estados de carga/error)
- React Router DOM v6 (Enrutamiento declarativo y guards de protección)
- React Hook Form + Zod (Validación estricta de formularios en cliente)
- React Toastify (Notificaciones push flotantes en Español)

# Arquitectura Frontend

src/
│
├── assets/          # Imágenes, logotipos y recursos estáticos
├── config/          # Configuración de variables de entorno e instancias de Axios
├── constants/       # Constantes globales (rutas, endpoints, textos fijos)
├── types/           # Interfaces y tipos TypeScript (sincronizados con el Backend)
├── utils/           # Funciones utilitarias (formateadores de fechas, dinero, etc.)
├── api/ or services/# Funciones puras de llamadas HTTP organizadas por dominio
├── hooks/           # Custom Hooks de React Query (useAuth, useEstudiantes, etc.)
├── context/         # Contextos globales mínimos (AuthContext para estado de sesión)
├── components/      # Componentes atómicos y reutilizables (Button, Input, Modal, Skeleton)
├── layouts/         # Estructuras de página compartidas (AdminLayout, PublicLayout)
├── pages/           # Componentes de página de nivel superior (vistas de rutas)
├── routes/          # Configuración del enrutador, ProtectedRoute y RoleRoute
├── App.tsx          # Componente raíz y proveedor de contextos/query-client
└── main.tsx         # Punto de entrada de la aplicación y renderizado en el DOM

# Arquitectura de la Interfaz (UI) y Vistas

# Zona Pública
Landing Page: Identidad institucional, Misión, Visión, Programas académicos y Beneficios.


Formulario de Matrícula: Flujo guiado por pasos (Wizard) para la inscripción y carga de documentos adjuntos obligatorios. (ya implementado)

Login: Formulario de acceso con manejo de estados de carga.

## Formularios

Usar:

- React Hook Form
- Validaciones reutilizables

2. Zona Privada (Dashboards con Sidebar Dinámico según Rol)
Dashboard Administrativo: Gestión de usuarios (CRUD), asignación de profesores a cargas académicas, control de estado financiero de estudiantes, reportes generales y configuración del año electivo.

Dashboard Profesor: Visualización de carga académica, planilla de calificaciones por actividad, control de asistencia diario, carga de tareas y documentos en el Classroom.

Dashboard Estudiante: Consulta de calificaciones en tiempo real, histórico de asistencias, visualización de deudas/obligaciones de pago, pasarela de subida para comprobantes de pago y módulo de Classroom para descargar tareas y cargar entregas con archivos.

Flujo de Autenticación y Seguridad en Rutas
JWT: El Access Token se almacena en el estado de la aplicación y en sessionStorage/localStorage bajo criterio seguro y se inyecta automáticamente en cada petición mediante un interceptor de Axios, se elimina del sessionStorage/localStorage cuando expira.

Guards de Enrutamiento:

ProtectedRoute: Bloquea el acceso a usuarios no autenticados y los redirige al /login.

RoleRoute: Valida el rol del usuario almacenado en el token (admin, profesor, estudiante). Si no cuenta con el permiso requerido, redirige a una página de 403 Access Denied.

Restricciones de Desarrollo Estrictas
TypeScript Obligatorio: Prohibido el uso de archivos .js o .jsx. Todo componente, hook y servicio debe usar .ts o .tsx. Prohibido el tipo any.

Desacoplamiento HTTP: Ningún componente de la carpeta pages/ o components/ puede realizar llamadas de Axios directas. Deben consumir los Custom Hooks de la carpeta hooks/ (los cuales encapsulan a React Query y los servicios).

Componentes Limpios: Los componentes de UI solo manejan la renderización y estados locales visuales (modales abiertos, toggles). La lógica compleja de mutación de datos o consultas pesadas debe vivir en los hooks.

Feedback Visual: Es mandatorio que cada tabla, formulario o lista cuente con estados visuales definidos para: Cargando (Skeleton Loaders), Error de red o permisos (Error States), y Confirmaciones explícitas mediante modales antes de realizar acciones destructivas (como eliminar o inactivar registros).

# UI/UX
- Responsive design.
- Modales
- Skeleton loaders
- Loading states.
- Error states.
- Confirmaciones.
- Toast notifications.
- Formularios validados.

# Restricciones

- No lógica compleja en componentes.
- No llamadas HTTP directas en páginas.
- No componentes gigantes.
- No estados globales innecesarios.

# Dashboard

Cada rol debe tener:

- Sidebar dinámico.
- Rutas protegidas.
- Menú según permisos.

# Servicios requeridos
- authService
- usuarioService
- matriculaService
- academicoService
- pagoService
- calificacionService
- asistenciaService
- uploadService









