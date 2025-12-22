import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

// Base API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if it exists
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.info(`→ ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.info(`← ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const message = (error.response?.data as any)?.message || error.message;

    console.error(`← ${status} ${error.config?.url}`, message);

    // Handle specific status codes
    switch (status) {
      case 400:
        toast.error(`Erro de validação: ${message}`);
        break;
      case 401:
        toast.error('Não autorizado. Faça login novamente.');
        // Clear token and redirect to login
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
        break;
      case 403:
        toast.error('Acesso negado.');
        break;
      case 404:
        toast.error('Recurso não encontrado.');
        break;
      case 500:
        toast.error('Erro interno do servidor.');
        break;
      case 503:
        toast.error('Serviço indisponível. Tente novamente mais tarde.');
        break;
      default:
        if (error.code === 'ECONNABORTED') {
          toast.error('Timeout: A requisição demorou muito tempo.');
        } else if (error.code === 'ERR_NETWORK') {
          toast.error('Erro de rede. Verifique sua conexão.');
        } else {
          toast.error(`Erro: ${message}`);
        }
    }

    return Promise.reject(error);
  }
);

export default api;
