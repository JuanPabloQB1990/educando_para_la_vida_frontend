# Frontend - Institución Educativa "Educando Para la Vida"

## 📋 Descripción

Frontend de la aplicación de matrícula electrónica construido con React, TypeScript, Tailwind CSS y React Router.

## 🚀 Instalación

### 1. Clonar el repositorio e instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.example .env.local
```

Editar `.env.local` y configurar la URL del backend:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:5173`

## 📂 Estructura del Proyecto

```
src/
├── pages/                  # Páginas/Vistas principales
│   ├── HomePage.tsx        # Página de inicio
│   └── RegistrationPage.tsx # Página de inscripción
├── components/             # Componentes reutilizables
│   └── RegistrationForm.tsx # Formulario de inscripción
├── routes/                 # Definición de rutas
│   └── index.tsx          # Configuración de React Router
├── services/               # Servicios de API
│   └── api.ts             # Cliente HTTP con axios
├── config/                 # Configuración centralizada
│   └── index.ts           # Variables de configuración
├── types/                  # Tipos TypeScript
│   └── registration.ts    # Tipos de registro
├── App.tsx                 # Componente raíz con Router
└── main.tsx               # Punto de entrada
```

## 🗺️ Rutas Disponibles

### Rutas Actuales

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | HomePage | Página de inicio con navegación |
| `/registro` | RegistrationPage | Formulario de inscripción |

### Rutas Futuras

Puedes agregar más rutas fácilmente en `src/routes/index.tsx`:

```typescript
{
  path: '/dashboard',
  element: <Dashboard />,
},
{
  path: '/estudiantes',
  element: <StudentManagement />,
},
```

## ⚙️ Configuración de la API

### URL Base

La URL base de la API se configura a través de la variable de entorno `VITE_API_URL` en `.env.local`.

Todos los servicios usan la configuración centralizada en `src/config/index.ts`:

```typescript
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 30000,
    endpoints: {
      inscripciones: '/inscripciones',
    },
  },
};
```

### Usar la Configuración en Servicios

```typescript
import config from '../config';

const response = await api.post(
  config.api.endpoints.inscripciones,
  data
);
```

## 🔑 Variables de Entorno

### Disponibles

- `VITE_API_URL` - URL base de la API backend

### Ejemplo .env.local

```env
# Desarrollo
VITE_API_URL=http://localhost:3000/api

# Producción (ejemplo)
# VITE_API_URL=https://api.tudominio.com/api
```

## 📦 Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Preview de la build de producción
npm run preview

# Análisis de tipos TypeScript
npm run type-check
```

## 🔧 Agregar Nueva Ruta

### 1. Crear página en `src/pages/`

```typescript
// src/pages/MiPagina.tsx
import React from 'react';

const MiPagina: React.FC = () => {
  return <div>Mi Página</div>;
};

export default MiPagina;
```

### 2. Importar en `src/routes/index.tsx`

```typescript
import MiPagina from '../pages/MiPagina';
```

### 3. Agregar ruta

```typescript
{
  path: '/mi-pagina',
  element: <MiPagina />,
},
```

### 4. Usar en navegación

```typescript
import { Link } from 'react-router-dom';

<Link to="/mi-pagina">Mi Página</Link>
```

## 🎨 Personalización de Estilos

Todos los estilos usan **Tailwind CSS**. Para personalizar:

1. Editar `tailwind.config.js` para cambios globales
2. Usar clases Tailwind directamente en los componentes
3. Crear componentes reutilizables con estilos predefinidos

Colores institucionales:
- **Azul oscuro**: `bg-blue-950` (#1e3a8a)
- **Oro**: `border-yellow-600` (#ca8a04)

## 📡 Llamadas a API

### Ejemplo: Enviar Inscripción

```typescript
import { submitRegistration } from '../services/api';

const handleSubmit = async (formData: FormData) => {
  try {
    const response = await submitRegistration(formData);
    console.log('Inscripción exitosa:', response);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 🧪 Testing

(Por configurar según necesidades)

## 📝 Notas

- La aplicación usa **React Router v6+** para manejo de rutas
- TypeScript está configurado para máxima seguridad de tipos
- Las variables de entorno se cargan desde `.env.local` (no incluido en git)
- El archivo `.env.example` muestra las variables necesarias

## 📞 Soporte

Para agregar nuevas características o rutas, consulta la estructura existente y sigue los patrones establecidos.

## 📄 Licencia

Todos los derechos reservados © 2026 Institución Educativa "Educando Para la Vida"
