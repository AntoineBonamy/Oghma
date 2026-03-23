import apiClient from "./client";

////////////////////
// TYPES
////////////////////

export interface World {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface WorldMember {
  id: string;
  worldId: string;
  userId: string;
  role: "MJ" | "PLAYER";
  joinedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface Campaign {
  id: string;
  worldId: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorldPayload {
  name: string;
  description?: string;
}

export interface UpdateWorldPayload {
  name?: string;
  description?: string;
}

////////////////////
// API CALLS
////////////////////

export const getWorldsApi = async (): Promise<World[]> => {
  const { data } = await apiClient.get<World[]>("/worlds");
  return data;
};

export const getWorldByIdApi = async (worldId: string): Promise<World> => {
  const { data } = await apiClient.get<World>(`/worlds/${worldId}`);
  return data;
};

export const createWorldApi = async (payload: CreateWorldPayload): Promise<World> => {
  const { data } = await apiClient.post<World>("/worlds", payload);
  return data;
};

export const updateWorldApi = async (
  worldId: string,
  payload: UpdateWorldPayload
): Promise<World> => {
  const { data } = await apiClient.patch<World>(`/worlds/${worldId}`, payload);
  return data;
};

export const deleteWorldApi = async (worldId: string): Promise<void> => {
  await apiClient.delete(`/worlds/${worldId}`);
};

export const getWorldMembersApi = async (worldId: string): Promise<WorldMember[]> => {
  const { data } = await apiClient.get<WorldMember[]>(`/worlds/${worldId}/members`);
  return data;
};

export const getWorldCampaignsApi = async (worldId: string): Promise<Campaign[]> => {
  const { data } = await apiClient.get<Campaign[]>(`/worlds/${worldId}/campaigns`);
  return data;
};

export const removeMemberApi = async (
  worldId: string,
  userId: string
): Promise<void> => {
  await apiClient.delete(`/worlds/${worldId}/members/${userId}`);
};
 