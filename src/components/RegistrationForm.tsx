import React, { useEffect, useMemo, useState } from 'react';
import { TiempoValidacion, TipoDocumento, TipoEstudio, TipoGrado } from '../types/registration';
import { getTipoDocumentos, getTipoEstudios, getGradosEducacion, getTiemposValidacion, submitRegistration } from '../services/api';

const RegistrationForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [studyType, setStudyType] = useState<string>('');
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [gradesError, setGradesError] = useState<string>('');
  const [docTypes, setDocTypes] = useState<TipoDocumento[]>([]);
  const [tipoEstudios, setTipoEstudios] = useState<TipoEstudio[]>([]);
  const [tipoGrados, setTipoGrados] = useState<TipoGrado[]>([]);
  const [tiemposValidacion, setTiemposValidacion] = useState<TiempoValidacion[]>([]);
  const [tiemposValidacionLoading, setTiemposValidacionLoading] = useState(false);
  const [tiemposValidacionError, setTiemposValidacionError] = useState<string | null>(null);
  const [selectedTiempoValidacion, setSelectedTiempoValidacion] = useState<string>('');
  const [tiempoSeleccionError, setTiempoSeleccionError] = useState<string>('');

  const idTipoEducacionFormal = useMemo(
    () => tipoEstudios.find((t) => t.nombre === 'Educacion formal')?.idTipoEstudio,
    [tipoEstudios]
  );

  const idTipoValidacionGrados = useMemo(
    () => tipoEstudios.find((t) => t.nombre === 'Validacion de grados')?.idTipoEstudio,
    [tipoEstudios]
  );

  // Cargar los tipos de documento al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        const [docs, estudios, grados] = await Promise.all([
          getTipoDocumentos(),
          getTipoEstudios(),
          getGradosEducacion(),
        ]);
        
        setDocTypes(docs);
        setTipoEstudios(estudios);
        setTipoGrados(grados);
      } catch (err) {
        console.error('Error cargando datos de la API:', err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadTiempos = async () => {
      setTiemposValidacionLoading(true);
      setTiemposValidacionError(null);
      try {
        const rows = await getTiemposValidacion();
        if (!cancelled) {
          setTiemposValidacion(rows);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error cargando tiempos de validación:', err);
          setTiemposValidacionError(
            err instanceof Error ? err.message : 'No se pudieron cargar los tiempos de validación.'
          );
        }
      } finally {
        if (!cancelled) {
          setTiemposValidacionLoading(false);
        }
      }
    };
    loadTiempos();
    return () => {
      cancelled = true;
    };
  }, [studyType, idTipoValidacionGrados]);

  const handleGradeChange = (grade: string, checked: boolean) => {
    if (checked) {
      setSelectedGrades(prev => [...prev, grade]);
      setGradesError('');
    } else {
      setSelectedGrades(prev => prev.filter(g => g !== grade));
    }
  };

  const [selectedLimitaciones, setSelectedLimitaciones] = useState<string[]>([]);
  const [selectedCapacidades, setSelectedCapacidades] = useState<string[]>([]);

  const handleLimitacionChange = (value: string, checked: boolean) => {
    if (checked) setSelectedLimitaciones(prev => [...prev, value]);
    else setSelectedLimitaciones(prev => prev.filter(v => v !== value));
  };

  const handleCapacidadChange = (value: string, checked: boolean) => {
    if (checked) setSelectedCapacidades(prev => [...prev, value]);
    else setSelectedCapacidades(prev => prev.filter(v => v !== value));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    // Añadir arrays de limitaciones y capacidades como campos repetidos para que multer los reciba como arrays
    selectedLimitaciones.forEach((limitacion) => {
      formData.append('limitaciones', limitacion);
    });
    selectedCapacidades.forEach((capacidad) => {
      formData.append('capacidades', capacidad);
    });

    // Asegurar que `id_grado_educacion` siempre se envíe como array (JSON)
    try {
      let gradosArray: string[] = [];
      // caso: validación de grados (varios seleccionados)
      if (idTipoValidacionGrados !== undefined && studyType === idTipoValidacionGrados) {
        gradosArray = selectedGrades.map(String);
      } else if (idTipoEducacionFormal !== undefined && studyType === idTipoEducacionFormal) {
        // caso: educación formal (select único) — tomar valor del form y convertir a array
        const single = formData.get('id_grado_educacion');
        if (single) gradosArray = [String(single)];
      }
      // Reemplazar/añadir en FormData como JSON
      formData.set('id_grado_educacion', JSON.stringify(gradosArray));
    } catch (err) {
      console.warn('No fue posible normalizar id_grado_educacion como array', err);
    }

    // Validación personalizada para validación de grados
    if (
      idTipoValidacionGrados !== undefined &&
      studyType === idTipoValidacionGrados
    ) {
      if (selectedGrades.length === 0) {
        setGradesError('Debe seleccionar al menos un grado para validar.');
        setLoading(false);
        return;
      }
      setGradesError('');
      if (tiemposValidacion.length > 0 && !selectedTiempoValidacion) {
        setTiempoSeleccionError('Debe seleccionar un tiempo de validación.');
        setLoading(false);
        return;
      }
      setTiempoSeleccionError('');
    }

    try {
     
      await submitRegistration(formData);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      setStudyType('');
      setSelectedGrades([]);
      setSelectedLimitaciones([]);
      setSelectedCapacidades([]);
      setGradesError('');
      setSelectedTiempoValidacion('');
      setTiempoSeleccionError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el formulario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Header Institucional */}
      <header className="bg-blue-950 text-white p-8 border-b-8 border-yellow-600 text-center shadow-lg">
        <h1 className="text-4xl font-bold uppercase tracking-wider">Sistema de Matrícula Electrónica</h1>
        <h2 className="text-2xl mt-3 font-semibold">Institución Educativa "Educando Para la Vida"</h2>
        <p className="text-sm opacity-85 mt-2">Respaldado por el Gobierno Nacional</p>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-10 pb-20">
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-lg shadow-sm">
            ¡Inscripción realizada con éxito! Nos pondremos en contacto pronto.
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-lg shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8">
          {/* Sección 1: Información del Alumno */}
          <section className="bg-white p-8 rounded-lg shadow-md border-t-4 border-blue-950">
            <h3 className="text-blue-950 text-2xl font-bold uppercase border-b-2 border-gray-200 pb-3 mb-6">
              Información Actual del Alumno
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block font-semibold mb-2">
                  Primer Apellido <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="apellido1"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">
                  Segundo Apellido <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="apellido2"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">
                  Nombre Completo <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="nombres"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Identificación */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block font-semibold mb-2">
                  Tipo de Identificación <span className="text-red-600">*</span>
                </label>
                <div className="space-y-2">
                  {docTypes.map((type) => (
                    <label key={type.idTipoDocumento} className="flex items-center">
                      <input
                        type="radio"
                        name="id_tipo_documento"
                        value={type.idTipoDocumento}
                        required
                        className="mr-2 cursor-pointer"
                      />
                      <span className="cursor-pointer">{type.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-2">
                  N° de Identificación <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="no_documento"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">
                  Correo Electrónico <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block font-semibold mb-2">
                  Fecha de Expedición del Documento <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  name="fecha_expedicion_documento"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">
                  Fecha de Nacimiento <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-2">
                      Edad <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      name="edad"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2">
                      Sexo <span className="text-red-600">*</span>
                    </label>
                    <div className="space-y-1">
                      {[
                        { value: 'Femenino', label: 'Femenino' },
                        { value: 'Masculino', label: 'Masculino' },
                      ].map((option, index) => (
                        <label key={index} className="flex items-center">
                          <input
                            type="radio"
                            name="sexo"
                            value={option.value}
                            required
                            className="mr-2 cursor-pointer"
                          />
                          <span className="cursor-pointer text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lugar de Nacimiento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block font-semibold mb-2">
                  Municipio de Nacimiento <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="municipio_nacimiento"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">
                  Departamento de Nacimiento <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="departamento_nacimiento"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">
                  País de Nacimiento <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="pais_nacimiento"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Religión */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block font-semibold mb-2">
                  Denominación Cristiana/Religión <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="religion"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
              </div>
            </div>
          </section>

          {/* Sección 2: Ubicación Actual */}
          <section className="bg-white p-8 rounded-lg shadow-md border-t-4 border-blue-950">
            <h3 className="text-blue-950 text-2xl font-bold uppercase border-b-2 border-gray-200 pb-3 mb-6">
              Ubicación Actual del Alumno
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block font-semibold mb-2">
                  Dirección <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="direccion_actual"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">
                  Barrio/Vereda <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="barrio_vereda_actual"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">
                  Municipio/Ciudad <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="ciudad_actual"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block font-semibold mb-2">
                  Departamento <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="departamento_actual"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">
                  País <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="pais_actual"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-2">
                    Contacto N°1 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contacto1"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Contacto N°2</label>
                  <input
                    type="tel"
                    name="contacto2"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Sección 3: Grado y Documentación */}
          <section className="bg-white p-8 rounded-lg shadow-md border-t-4 border-blue-950">
            <h3 className="text-blue-950 text-2xl font-bold uppercase border-b-2 border-gray-200 pb-3 mb-6">
              Grado y Documentación
            </h3>

            {/* Tipo de Estudio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block font-semibold mb-2">
                  Tipo de Estudio <span className="text-red-600">*</span>
                </label>
                <select
                  name="id_tipo_estudio"
                  value={studyType === '' ? '' : String(studyType)}
                  onChange={(e) => {
                    const raw = e.target.value;

                    setStudyType(raw === '' ? '' : String(raw));
                    setSelectedGrades([]);
                    setGradesError('');
                    setSelectedTiempoValidacion('');
                    setTiempoSeleccionError('');
                  }}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                >
                  <option value="">Seleccione...</option>
                  {tipoEstudios.length && (
                    tipoEstudios.map((te) => (
                      <option key={te.idTipoEstudio} value={te.idTipoEstudio}>
                        {te.nombre}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
            {/* Educación Formal - Select único */}
            {idTipoEducacionFormal !== undefined && studyType === idTipoEducacionFormal && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block font-semibold mb-2">
                    Seleccione el Grado a Matricular <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="id_grado_educacion"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                  >
                    <option value="">Seleccione...</option>
                    {tipoGrados.length && (
                      tipoGrados.map((g) => (
                        <option key={g.idGradoEducacion} value={g.idGradoEducacion}>
                          {g.nombre}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            )}

            {/* Validación de Grados - Checkboxes múltiples */}
            {idTipoValidacionGrados !== undefined && studyType === idTipoValidacionGrados && (
              <div className="mb-6 space-y-6">
                <div>
                  <label className="block font-semibold mb-4">
                    Seleccione los Grados a Validar <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {tipoGrados.length && (
                      tipoGrados.map((g) => (
                        <label key={g.idGradoEducacion} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="id_grado_educacion"
                            value={g.idGradoEducacion}
                            checked={selectedGrades.includes(g.idGradoEducacion)}
                            onChange={(e) => handleGradeChange(g.idGradoEducacion, e.target.checked)}
                            className="mr-2 cursor-pointer"
                          />
                          <span className="text-gray-700">{g.nombre}</span>
                        </label>
                      ))
                    )}
                  </div>
                  {gradesError && (
                    <p className="text-red-600 text-sm mt-2">{gradesError}</p>
                  )}
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50/80 p-4">
                  <h4 className="font-semibold text-blue-950 mb-2">
                    Tiempo de validación <span className="text-red-600">*</span>
                  </h4>
                  {tiemposValidacionLoading && (
                    <p className="text-sm text-gray-600">Cargando tiempos...</p>
                  )}
                  {tiemposValidacionError && (
                    <p className="text-sm text-red-600">{tiemposValidacionError}</p>
                  )}
                  {!tiemposValidacionLoading && !tiemposValidacionError && tiemposValidacion.length > 0 && (
                    <div className="space-y-2">
                      {tiemposValidacion.map((t, idx) => (
                        <label
                          key={t.idTiempoValidacion}
                          className="flex items-center cursor-pointer text-sm text-gray-800"
                        >
                          <input
                            type="radio"
                            name="id_tiempo_validacion"
                            value={t.idTiempoValidacion}
                            required={idx === 0}
                            checked={selectedTiempoValidacion === t.idTiempoValidacion}
                            onChange={() => {
                              setSelectedTiempoValidacion(t.idTiempoValidacion);
                              setTiempoSeleccionError('');
                            }}
                            className="mr-2 cursor-pointer"
                          />
                          <span className="cursor-pointer">{t.tiempo}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {tiempoSeleccionError && (
                    <p className="text-red-600 text-sm mt-2">{tiempoSeleccionError}</p>
                  )}
                  {!tiemposValidacionLoading && !tiemposValidacionError && tiemposValidacion.length === 0 && (
                    <p className="text-sm text-gray-600">No hay tiempos registrados en el sistema.</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2">
                  Documento de Identidad Escaneado (100% por ambos lados en un solo archivo) <span className="text-red-600">*</span>
                </label>
                <input
                  type="file"
                  name="file_doc"
                  accept="image/*,.pdf"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition file:mr-3 file:py-1 file:px-2 file:rounded file:border file:border-gray-300 file:bg-gray-50 file:cursor-pointer"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">
                  Foto del Estudiante (Fondo Azul) <span className="text-red-600">*</span>
                </label>
                <input
                  type="file"
                  name="file_foto"
                  accept="image/*"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition file:mr-3 file:py-1 file:px-2 file:rounded file:border file:border-gray-300 file:bg-gray-50 file:cursor-pointer"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">
                  Certificado Último Grado o Notas de la anterior institución (Un solo archivo) <span className="text-red-600">*</span>
                </label>
                <input
                  type="file"
                  name="file_certificado_grados"
                  accept=".pdf,image/*"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition file:mr-3 file:py-1 file:px-2 file:rounded file:border file:border-gray-300 file:bg-gray-50 file:cursor-pointer"
                />
              </div>
            </div>
          </section>

          {/* Sección 5: Limitaciones y Capacidades */}
          <section className="bg-white p-8 rounded-lg shadow-md border-t-4 border-blue-950">
            <h3 className="text-blue-950 text-2xl font-bold uppercase border-b-2 border-gray-200 pb-3 mb-6">
              Limitaciones o Capacidades Excepcionales
            </h3>

            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-700 mb-4 bg-gray-100 p-3 rounded">
                Limitaciones
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-3">
                {[
                  'Down',
                  'Retardo',
                  'Sordera',
                  'Autismo',
                  'Baja visión',
                  'Ceguera',
                  'Parálisis Cerebral',
                  'Lesión Neuromuscular',
                  'Multi-impedido',
                ].map((limitacion, idx) => (
                  <label key={`${limitacion}-${idx}`} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value={limitacion}
                      checked={selectedLimitaciones.includes(limitacion)}
                      onChange={(e) => handleLimitacionChange(limitacion, e.target.checked)}
                      className="mr-3 cursor-pointer"
                    />
                    <span className="text-gray-700">{limitacion}</span>
                  </label>
                ))}
              </div>
              
            </div>
            <div className="mb-8">
              <label className="block font-semibold mb-3">
                Otras Limitaciones <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="otras_limitaciones"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
              />
            </div>

            <div className="mb-8">
              <label className="block font-semibold mb-3">
                Diagnósticos Escaneados (Un solo archivo) <span className="text-red-600">*</span>
              </label>
              <input
                type="file"
                name="file_diagnostico"
                accept=".pdf,image/*"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition file:mr-3 file:py-1 file:px-2 file:rounded file:border file:border-gray-300 file:bg-gray-50 file:cursor-pointer"
              />
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-4 bg-gray-100 p-3 rounded">
                Capacidades Excepcionales
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 px-3 mb-6">
                {['Superdotado', 'Artístico', 'Científico', 'Tecnológico', 'Deportivo'].map(
                  (capacidad, idx) => (
                    <label key={`${capacidad}-${idx}`} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        value={capacidad}
                        checked={selectedCapacidades.includes(capacidad)}
                        onChange={(e) => handleCapacidadChange(capacidad, e.target.checked)}
                        className="mr-3 cursor-pointer"
                      />
                      <span className="text-gray-700">{capacidad}</span>
                    </label>
                  )
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block font-semibold mb-2">
                    Puntaje Coeficiente Intelectual <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="ci_puntaje"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Sección 7: Información de Salud */}
          <section className="bg-white p-8 rounded-lg shadow-md border-t-4 border-blue-950">
            <h3 className="text-blue-950 text-2xl font-bold uppercase border-b-2 border-gray-200 pb-3 mb-6">
              Información de Salud
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block font-semibold mb-2">
                  Problemas de Salud Presentados
                </label>
                <input
                  type="text"
                  name="problemasalud"
                  placeholder="Describa cualquier problema de salud relevante"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block font-semibold mb-2">
                  EPS <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="eps"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">IPS</label>
                <input
                  type="text"
                  name="ips"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">
                  Grupo Sanguíneo y RH <span className="text-red-600">*</span>
                </label>
                <select
                  name="rh"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                >
                  <option value="">Seleccione...</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2">Observaciones</label>
              <textarea
                name="observaciones"
                rows={4}
                placeholder="Información adicional sobre la salud del estudiante"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
              />
            </div>
          </section>

          {/* Sección 8: Archivos Requeridos */}
          <section className="bg-white p-8 rounded-lg shadow-md border-t-4 border-blue-950">
            <h3 className="text-blue-950 text-2xl font-bold uppercase border-b-2 border-gray-200 pb-3 mb-6">
              Archivos Requeridos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2">
                  Formulario de Compromiso (PDF o imagen) <span className="text-red-600">*</span>
                </label>
                <input
                  type="file"
                  name="file_compromiso"
                  accept=".pdf,image/*"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition file:mr-3 file:py-1 file:px-2 file:rounded file:border file:border-gray-300 file:bg-gray-50 file:cursor-pointer"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">
                  Comprobante de Pago (PDF o imagen) <span className="text-red-600">*</span>
                </label>
                <input
                  type="file"
                  name="file_comprobante_pago"
                  accept=".pdf,image/*"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition file:mr-3 file:py-1 file:px-2 file:rounded file:border file:border-gray-300 file:bg-gray-50 file:cursor-pointer"
                />
              </div>
            </div>
          </section>

          {/* Sección 6: Información de Padres y Acudientes */}
          <section className="bg-white p-8 rounded-lg shadow-md border-t-4 border-blue-950">
            <h3 className="text-blue-950 text-2xl font-bold uppercase border-b-2 border-gray-200 pb-3 mb-6">
              Información de Padres y Acudientes
            </h3>

            {/* Datos del Padre */}
            <div className="mb-10">
              <h4 className="text-lg font-bold text-gray-800 mb-4 bg-gray-100 p-3 rounded uppercase">
                Datos del Padre
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <input
                  type="text"
                  name="padre_apellido1"
                  placeholder="Primer Apellido"
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
                <input
                  type="text"
                  name="padre_apellido2"
                  placeholder="Segundo Apellido"
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
                <input
                  type="text"
                  name="padre_nombre"
                  placeholder="Nombres Completos"
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
                <input
                  type="number"
                  name="padre_cedula"
                  placeholder="No. Cédula"
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
                <div className="md:col-span-2">
                  <label className="block font-semibold mb-2">
                    Documento del Padre Escaneado (100% por ambos lados en un solo archivo) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="file"
                    name="padre_file"
                    accept="image/*,.pdf"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition file:mr-3 file:py-1 file:px-2 file:rounded file:border file:border-gray-300 file:bg-gray-50 file:cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Contacto N°1 Padre <span className="text-red-600">*</span></label>
                  <input
                    type="tel"
                    name="padre_contacto1"
                    required
                    placeholder="Teléfono o Celular"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Contacto N°2 Padre</label>
                  <input
                    type="tel"
                    name="padre_contacto2"
                    placeholder="Teléfono o Celular"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Datos de la Madre */}
            <div className="mb-10">
              <h4 className="text-lg font-bold text-gray-800 mb-4 bg-gray-100 p-3 rounded uppercase">
                Datos de la Madre
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <input
                  type="text"
                  name="madre_apellido1"
                  placeholder="Primer Apellido"
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
                <input
                  type="text"
                  name="madre_apellido2"
                  placeholder="Segundo Apellido"
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
                <input
                  type="text"
                  name="madre_nombre"
                  placeholder="Nombres Completos"
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
                <input
                  type="number"
                  name="madre_cedula"
                  placeholder="No. Cédula"
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
                <div className="md:col-span-2">
                  <label className="block font-semibold mb-2">
                    Documento de la Madre Escaneado (100% por ambos lados en un solo archivo) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="file"
                    name="madre_file"
                    accept="image/*,.pdf"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition file:mr-3 file:py-1 file:px-2 file:rounded file:border file:border-gray-300 file:bg-gray-50 file:cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Contacto N°1 Madre <span className="text-red-600">*</span></label>
                  <input
                    type="tel"
                    name="madre_contacto1"
                    required
                    placeholder="Teléfono o Celular"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Contacto N°2 Madre</label>
                  <input
                    type="tel"
                    name="madre_contacto2"
                    placeholder="Teléfono o Celular"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Datos del Acudiente */}
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-4 bg-gray-100 p-3 rounded uppercase">
                Datos del Acudiente
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <input
                  type="text"
                  name="acudiente_apellido1"
                  placeholder="Primer Apellido"
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
                <input
                  type="text"
                  name="acudiente_apellido2"
                  placeholder="Segundo Apellido"
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
                <input
                  type="text"
                  name="acudiente_nombre"
                  placeholder="Nombres Completos"
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
                <input
                  type="number"
                  name="acudiente_cedula"
                  placeholder="No. Cédula"
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
                <div className="md:col-span-2">
                  <label className="block font-semibold mb-2">
                    Documento del Acudiente Escaneado (100% por ambos lados en un solo archivo) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="file"
                    name="acudiente_file"
                    accept="image/*,.pdf"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition file:mr-3 file:py-1 file:px-2 file:rounded file:border file:border-gray-300 file:bg-gray-50 file:cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Contacto N°1 Acudiente <span className="text-red-600">*</span></label>
                  <input
                    type="tel"
                    name="acudiente_contacto1"
                    required
                    placeholder="Teléfono o Celular"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Contacto N°2 Acudiente</label>
                  <input
                    type="tel"
                    name="acudiente_contacto2"
                    placeholder="Teléfono o Celular"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Sección 4: Referencias de Contacto */}
          <section className="bg-white p-8 rounded-lg shadow-md border-t-4 border-blue-950">
            <h3 className="text-blue-950 text-2xl font-bold uppercase border-b-2 border-gray-200 pb-3 mb-6">
              Referencias de Contacto (6 Obligatorias)
            </h3>
            <p className="text-gray-600 mb-6 font-semibold">
              Complete al menos 6 referencias familiares o amigos
            </p>

            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={num} className="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
                <h4 className="font-semibold text-blue-950 mb-3">Referencia {num}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    name={`ref${num}_nombres`}
                    placeholder="Nombres Completos"
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                  />
                  <input
                    type="text"
                    name={`ref${num}_apellidos`}
                    placeholder="Apellidos Completos"
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                  />
                  <input
                    type="tel"
                    name={`ref${num}_tel`}
                    placeholder="Celular/WhatsApp"
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>
            ))}
          </section>

          {/* Términos y Condiciones */}
          <section className="bg-yellow-50 border border-yellow-200 p-8 rounded-lg">
            <div className="mb-6">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  name="accept_terms"
                  required
                  className="mr-3 mt-1 cursor-pointer"
                />
                <span className="font-bold text-gray-800">
                  ACEPTAMOS CUMPLIR CON EL PROYECTO EDUCATIVO INSTITUCIONAL (PEI) Y EL MANUAL DE
                  CONVIVENCIA Y DEMÁS DISPOSICIONES. SI EL ALUMNO SE RETIRA NO SE HARÁ DEVOLUCIÓN DE
                  DINERO. PARA ESTUDIANTES DE GRADO 10° Y 11° ES OBLIGATORIO EL CURSO DEL PREICFES Y LA
                  MEDIA TÉCNICA.
                </span>
              </label>
            </div>

            <div className="space-y-3">
              <p className="text-red-600 font-bold">
                * AVISO: Para grados 10° y 11° es obligatorio el PREICFES y la Media Técnica.
              </p>
              <p className="text-gray-700 text-sm">
                <b>NOTA:</b> Debe anexar copias al 100% y foto con fondo azul. ATT. "Educando Para la
                Vida"
              </p>
            </div>
          </section>

          {/* Botón Submit */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-1/2 bg-blue-950 hover:bg-blue-900 text-white font-bold py-4 px-8 rounded-lg text-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? 'Enviando...' : 'REALIZAR INSCRIPCIÓN OFICIAL'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default RegistrationForm;
