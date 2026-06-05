import axios, { AxiosInstance } from 'axios';
import config from '../config';
import { ApiResponse, TiempoValidacion, TipoDocumento, TipoEstudio, TipoGrado } from '../types/registration';

// API para inscripción - usando configuración centralizada
const registrationApi: AxiosInstance = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
});

const getResponseData = <T>(response: { data: ApiResponse<T> }): T => {
  if (!response.data.success) {
    throw new Error(response.data.error || 'Error desconocido de la API');
  }
  return response.data.data;
};

// Servicio para Tipos de Documento
export const getTipoDocumentos = async (): Promise<TipoDocumento[]> => {
  try {
    const response = await registrationApi.get<ApiResponse<TipoDocumento[]>>(config.api.endpoints.tipoDocumento);
    const data = getResponseData<TipoDocumento[]>(response);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message);
    }
    throw error;
  }
};

// Servicio para Tipos de Estudio
export const getTipoEstudios = async (): Promise<TipoEstudio[]> => {
  try {
    const response = await registrationApi.get<ApiResponse<TipoEstudio[]>>(config.api.endpoints.tipoEstudio);
    const data = getResponseData<TipoEstudio[]>(response);
    console.log('Tipos de Estudio obtenidos:', data);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message);
    }
    throw error;
  }
};

// Servicio para Grados de Educación
export const getGradosEducacion = async (): Promise<TipoGrado[]> => {
  try {
    const response = await registrationApi.get<ApiResponse<TipoGrado[]>>(config.api.endpoints.gradoEducacion);
    const data = getResponseData<TipoGrado[]>(response);
 
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message);
    }
    throw error;
  }
};

export const getTiemposValidacion = async (): Promise<TiempoValidacion[]> => {
  try {
    const response = await registrationApi.get<ApiResponse<TiempoValidacion[]>>(
      config.api.endpoints.tiempoValidacion
    );
    return getResponseData<TiempoValidacion[]>(response);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || error.message);
    }
    throw error;
  }
};

/**
 * Envía los datos de inscripción del estudiante al servidor
 * @param formData FormData con todos los campos del formulario
 * @returns Respuesta de la API
 */
export const submitRegistration = async (formData: FormData): Promise<{ id: string }> => {
  try {
    const response = await registrationApi.post<ApiResponse<{ id: string }>>(
      config.api.endpoints.inscripciones,
      formData
    );
    
    if (!response.data.success) {
      console.log(response.data.message);
      throw new Error(response.data.error || 'Error al procesar la inscripción');
    }
    console.log(response.data.message);
    
    return response.data.data;
  } catch (error) {
    
    if (axios.isAxiosError(error)) {
      console.log(error.response?.data?.error);
      const responseError = error.response?.data?.error;
      const message = typeof responseError === 'string'
        ? responseError
        : responseError?.message || error.response?.data?.message || error.message;
      throw new Error(message);
    }
    throw error;
  }
};

