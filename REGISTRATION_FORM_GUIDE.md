# Componente RegistrationForm - Guía de Uso

## 📋 Descripción

El componente `RegistrationForm` es un formulario completo de inscripción para estudiantes en la institución educativa "Educando Para la Vida". Está completamente desarrollado en TypeScript con estilos de **Tailwind CSS** (sin Bootstrap).

## 🎯 Características

✅ **7 secciones principales:**
1. **Información del Alumno** - Datos personales básicos
2. **Ubicación Actual** - Dirección y contacto
3. **Grado y Documentación** - Grado a matricularse y archivos requeridos
4. **Referencias de Contacto** - 6 referencias obligatorias
5. **Limitaciones y Capacidades** - Situaciones especiales del estudiante
6. **Información de Padres/Acudientes** - Datos de padre, madre y acudiente
7. **Información de Salud** - EPS, grupo sanguíneo, observaciones

✅ **Validación:**
- Campos requeridos marcados con asterisco rojo `*`
- Validación HTML5 nativa
- Manejo de errores y mensajes de éxito

✅ **Manejo de Archivos:**
- Soporte completo para `multipart/form-data`
- Múltiples tipos de documentos (ID, foto, certificados, diagnósticos)

✅ **Diseño Responsivo:**
- Adaptable a móviles, tablets y desktops
- Grid system con Tailwind CSS

## 🚀 Instalación y Configuración

### 1. Asegúrate de tener las dependencias instaladas:

```bash
npm install
```

El proyecto ya incluye Tailwind CSS configurado en `tailwind.config.js`.

### 2. Verifica que los archivos estén en su lugar:

```
src/
├── components/
│   └── RegistrationForm.tsx  ← El componente principal
├── services/
│   └── api.ts                ← Servicio de API
├── types/
│   └── registration.ts       ← Interfaces TypeScript
├── App.tsx                   ← Renderiza el componente
└── index.css                 ← Estilos Tailwind
```

### 3. Asegúrate de que `App.tsx` renderice el componente:

```tsx
import RegistrationForm from './components/RegistrationForm';

function App() {
  return <RegistrationForm />;
}

export default App;
```

## 🔧 Configuración de API

El componente envía datos a: `http://localhost:3001/api/inscripciones`

Para cambiar la URL base, edita el archivo `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:3001/api'; // ← Cambiar aquí
```

### Formato de respuesta esperada:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
}
```

**Ejemplo de respuesta exitosa:**
```json
{
  "success": true,
  "data": { "id": "123456" },
  "error": null
}
```

## 📝 Estructura de Datos TypeScript

El componente usa las siguientes interfaces (definidas en `src/types/registration.ts`):

```typescript
// Alumno
interface StudentInfo {
  apellido1: string;
  apellido2: string;
  nombre_estudiante: string;
  tipo_id: 'T.I' | 'C.C' | 'D.E';
  id_num: number;
  email: string;
  fecha_exp: string;
  fecha_nac: string;
  edad: number;
  sexo: 'F' | 'M';
  // ... más campos
}

// Ubicación
interface CurrentLocation {
  direccion_actual: string;
  'barrio/vereda': string;
  ciudad: string;
  // ... más campos
}

// Completo
interface RegistrationData extends StudentInfo, CurrentLocation, /* ... */ {
  accept_terms: boolean;
}
```

## 🎨 Personalización de Estilos

Los estilos están completamente en Tailwind CSS. Para personalizar:

### Colores de la institución:
- **Azul oscuro**: `bg-blue-950` (equivalente a #002d55)
- **Oro**: `border-yellow-600` (equivalente a #d4af37)

Edita `src/components/RegistrationForm.tsx` para cambiar clases Tailwind:

```tsx
// Encabezado - línea ~56
<header className="bg-blue-950 text-white p-8 border-b-8 border-yellow-600">

// Bordes de secciones - línea ~80+
<section className="bg-white p-8 rounded-lg shadow-md border-t-4 border-blue-950">
```

## 📤 Envío de Datos

El componente maneja automáticamente:

1. **Recolección de datos** del formulario en FormData
2. **Validación básica** con atributo `required` de HTML5
3. **Envío POST** multipart/form-data
4. **Mensajes de éxito/error** visuales

### Para detectar envío exitoso:

```tsx
// En el componente, el estado `success` se activa:
{success && (
  <div className="bg-green-50 border border-green-200 ...">
    ¡Inscripción realizada con éxito!
  </div>
)}
```

## ⚠️ Notas Importantes

1. **Campo especial**: `barrio/vereda` mantiene el nombre con barra diagonal para compatibilidad con el backend
2. **Archivos requeridos**:
   - Documento ID estudiante
   - Foto estudiante (fondo azul)
   - Documentos de padre, madre y acudiente
3. **Referencias**: Las 6 referencias de contacto son obligatorias
4. **Términos**: El checkbox de términos y condiciones es obligatorio
5. **Base de datos**: Para grados 10° y 11°, el PREICFES y Media Técnica son obligatorios

## 🧪 Desarrollo Local

### Inicia el servidor de desarrollo:

```bash
npm run dev
```

### Construir para producción:

```bash
npm run build
```

### Preview de la build:

```bash
npm run preview
```

## 📱 Responsividad

El componente es completamente responsivo:
- **Móvil**: 1 columna
- **Tablet**: 2-3 columnas (`md:grid-cols-2`, `md:grid-cols-3`)
- **Desktop**: 3-4 columnas según la sección

## 🔍 Validación de Campos

### Requeridos (`required`):
- Nombres y apellidos
- Email
- Fechas
- Tipo y número de ID
- Dirección
- Grado
- Archivos (ID, foto, documentos)
- 6 referencias completas
- Datos de padres y acudientes
- EPS, grupo sanguíneo, RH
- Términos de aceptación

### Opcionales:
- Segundo teléfono
- Certificado de último grado
- Diagnósticos
- Problemas de salud
- Observaciones

## 🐛 Troubleshooting

### Problema: Estilos Tailwind no se aplican

**Solución**: Verifica que `src/index.css` contenga:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Problema: Error de conexión a API

**Solución**: Verifica que el servidor backend esté corriendo en `http://localhost:3001` o actualiza `API_BASE_URL` en `src/services/api.ts`

### Problema: Archivos no se envían

**Solución**: Asegúrate de que el encabezado `Content-Type: multipart/form-data` esté en la solicitud (ya está configurado en `api.ts`)

## 📞 Contacto y Soporte

Para cambios o mejoras, revisa los archivos:
- `src/components/RegistrationForm.tsx` - Componente
- `src/services/api.ts` - Lógica de API
- `src/types/registration.ts` - Definiciones TypeScript
