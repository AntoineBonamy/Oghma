import apiClient from "./client";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}


// ---

export const loginApi = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
  return data;
};

export const registerApi = async (payload: RegisterPayload): Promise<AuthUser> => {
  const { data } = await apiClient.post<AuthUser>("/auth/register", payload);
  return data;
};

export const logoutApi = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};

export const refreshApi = async (refreshToken: string): Promise<RefreshResponse> => {
  // Appel direct sans apiClient pour éviter la boucle infinie d'intercepteur
  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
 
  if (!response.ok) {
    throw new Error("Refresh échoué");
  }
 
  return response.json();
};