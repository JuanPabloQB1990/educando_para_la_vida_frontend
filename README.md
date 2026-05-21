# Frontend de Productos

Aplicación frontend en React + Vite para administrar productos a través de la API en `http://localhost:3000/api/products`.

## Características

- CRUD completo de productos
- Tabla con lista de productos
- Modal para crear y editar
- Confirmación para eliminar
- Estados de carga y error
- Arquitectura escalable con servicios, hooks y componentes

## Tecnologías

- React
- Vite
- Tailwind CSS
- Axios
- React Hook Form
- React Toastify

## Uso local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar en modo desarrollo:
   ```bash
   npm run dev
   ```

## Build y Docker

Construir producción:
```bash
npm run build
```

Construir imagen Docker:
```bash
docker build -t products-frontend .
```

Ejecutar contenedor:
```bash
docker run -p 80:80 products-frontend
```
