import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { refreshApi } from "./auth";

// Flag pour éviter les boucles infinies de refresh
let isRefreshing = false;
// File d'attente des requêtes bloquées pendant le refresh
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];
 
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
};
 
// ---

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
})

// Injecte le token dans chaque requête si disponible
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

// Intercepteur réponse — gère les 401 avec refresh silencieux
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
 
    // Si ce n'est pas un 401, ou si c'est déjà une retry, on propage l'erreur
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
 
    // Si la route qui a échoué est /auth/refresh elle-même → logout immédiat
    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }
 
    if (isRefreshing) {
      // Une autre requête est déjà en train de refresh — on met en attente
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
        }
        return apiClient(originalRequest);
      });
    }
 
    originalRequest._retry = true;
    isRefreshing = true;
 
    const storedRefreshToken = localStorage.getItem("refreshToken");
 
    if (!storedRefreshToken) {
      // Pas de refresh token → logout
      isRefreshing = false;
      processQueue(error, null);
      window.dispatchEvent(new Event("auth:logout"));
      return Promise.reject(error);
    }
 
    try {
      const { accessToken, refreshToken } = await refreshApi(storedRefreshToken);
 
      // Mise à jour du localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
 
      // Notifie le contexte React de la mise à jour des tokens
      window.dispatchEvent(
        new CustomEvent("auth:tokensUpdated", {
          detail: { accessToken, refreshToken },
        })
      );
 
      // Rejoue toutes les requêtes en attente avec le nouveau token
      processQueue(null, accessToken);
 
      // Rejoue la requête originale
      if (originalRequest.headers) {
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      // Refresh échoué → logout
      window.dispatchEvent(new Event("auth:logout"));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient