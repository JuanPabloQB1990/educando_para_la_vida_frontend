import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Página de Inicio
 * Página principal con navegación a otras secciones
 */
const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-blue-950 text-white p-8 shadow-lg">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold uppercase mb-2">
            Institución Educativa "Educando Para la Vida"
          </h1>
          <p className="text-xl opacity-90">Sistema de Matrícula Electrónica</p>
          <p className="text-sm opacity-75 mt-2">Respaldado por el Gobierno Nacional</p>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tarjeta de Bienvenida */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-blue-950 mb-4">¡Bienvenido!</h2>
            <p className="text-gray-700 mb-6">
              Estamos encantados de recibirte en nuestro sistema de matrícula electrónica. 
              Aquí podrás inscribir a tus estudiantes de manera rápida y segura.
            </p>
            <p className="text-gray-600 mb-8">
              Contamos con un proceso de inscripción completo y seguro que te guiará paso 
              a paso a través de todos los requisitos necesarios.
            </p>
            <Link
              to="/matricula"
              className="inline-block bg-blue-950 hover:bg-blue-900 text-white font-bold py-3 px-8 rounded-lg transition duration-200"
            >
              Iniciar Inscripción →
            </Link>
          </div>

          {/* Tarjeta de Información */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-blue-950 mb-3 flex items-center">
                <span className="bg-yellow-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">
                  1
                </span>
                Requisitos
              </h3>
              <ul className="text-gray-700 space-y-2 text-sm">
                <li>✓ Documento de identidad del estudiante</li>
                <li>✓ Foto a color (fondo azul)</li>
                <li>✓ Documentos de padres/acudientes</li>
                <li>✓ Información de contacto completa</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-blue-950 mb-3 flex items-center">
                <span className="bg-yellow-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">
                  2
                </span>
                Secciones del Formulario
              </h3>
              <p className="text-gray-700 text-sm">
                El formulario está organizado en 7 secciones que cubren toda la información 
                necesaria para la inscripción completa del estudiante.
              </p>
            </div>
          </div>
        </div>

        {/* Sección de Características */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-blue-950 mb-8 text-center">
            ¿Por qué usar nuestro sistema?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-bold text-gray-800 mb-2">Seguridad</h3>
              <p className="text-gray-600 text-sm">
                Tus datos están protegidos con encriptación de nivel profesional
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-bold text-gray-800 mb-2">Rapidez</h3>
              <p className="text-gray-600 text-sm">
                Completa la inscripción en minutos desde cualquier dispositivo
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="font-bold text-gray-800 mb-2">Precisión</h3>
              <p className="text-gray-600 text-sm">
                Validación automática de datos para evitar errores
              </p>
            </div>
          </div>
        </div>

        {/* Llamada a la Acción */}
        <div className="mt-12 text-center">
          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded">
            <p className="text-gray-800 font-semibold mb-4">
              ¿Listo para inscribir a tu estudiante?
            </p>
            <Link
              to="/registro"
              className="inline-block bg-blue-950 hover:bg-blue-900 text-white font-bold py-3 px-10 rounded-lg transition duration-200"
            >
              Ir al Formulario de Inscripción
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-6 mt-16">
        <p className="opacity-75">
          © 2026 Institución Educativa "Educando Para la Vida" - Todos los derechos reservados
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
