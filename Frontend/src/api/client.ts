import axios from "axios";

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

export default apiClient