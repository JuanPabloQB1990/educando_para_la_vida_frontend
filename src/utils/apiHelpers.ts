import axios, { AxiosResponse } from 'axios';
import { ApiResponse } from '../types/api';
import http from '../services/http';

export const getResponseData = <T>(
  response: AxiosResponse<ApiResponse<T>>
): T => {
  const { success, data, error } = response.data;

  if (!success) {
    throw new Error(error || 'Error desconocido de la API');
  }

  if (data === undefined || data === null) {
    throw new Error('La API no retornó datos');
  }

  return data;
};

export const handleApiError = (
  error: unknown
): never => {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Error de comunicación con el servidor';

    throw new Error(message);
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error('Error inesperado');
};

export const apiGet = async <T>(url: string): Promise<T> => {
  try {
    const response = await http.get<ApiResponse<T>>(url);
    return getResponseData(response);
  } catch (error) {
    return handleApiError(error);
  }
};

export const apiPost = async <T, D>(
  url: string,
  body: D
): Promise<T> => {
  try {
    const response = await http.post<ApiResponse<T>>(
      url,
      body
    );

    return getResponseData(response);
  } catch (error) {
    return handleApiError(error);
  }
};

export const apiPut = async <T, D>(
  url: string,
  body: D
): Promise<T> => {
  try {
    const response = await http.put<ApiResponse<T>>(
      url,
      body
    );

    return getResponseData(response);
  } catch (error) {
    return handleApiError(error);
  }
};

export const apiDelete = async <T>(
  url: string
): Promise<T> => {
  try {
    const response = await http.delete<ApiResponse<T>>(url);
    return getResponseData(response);
  } catch (error) {
    return handleApiError(error);
  }
};

export const apiPatch = async <T, D>(
  url: string,
  body: D
): Promise<T> => {
  try {
    const response = await http.patch<ApiResponse<T>>(url, body);
    return getResponseData(response);
  } catch (error) {
    return handleApiError(error);
  }
};

export const apiVoidPost = async <D>(
  url: string,
  body?: D
): Promise<void> => {
  try {
    const res = await http.post<ApiResponse<unknown>>(url, body);
    if (!res.data.success) throw new Error(res.data.error || 'Error desconocido de la API');
  } catch (error) {
    return handleApiError(error);
  }
};

export const apiVoidPut = async <D>(
  url: string,
  body: D
): Promise<void> => {
  try {
    const res = await http.put<ApiResponse<unknown>>(url, body);
    if (!res.data.success) throw new Error(res.data.error || 'Error desconocido de la API');
  } catch (error) {
    return handleApiError(error);
  }
};

export const apiVoidPatch = async <D>(
  url: string,
  body: D
): Promise<void> => {
  try {
    const res = await http.patch<ApiResponse<unknown>>(url, body);
    if (!res.data.success) throw new Error(res.data.error || 'Error desconocido de la API');
  } catch (error) {
    return handleApiError(error);
  }
};

export const apiVoidDelete = async (url: string): Promise<void> => {
  try {
    const res = await http.delete<ApiResponse<unknown>>(url);
    if (!res.data.success) throw new Error(res.data.error || 'Error desconocido de la API');
  } catch (error) {
    return handleApiError(error);
  }
};

