import apiClient from "./client";

////////////////////
// TYPES
////////////////////

export interface Campaign {
  id: string;
  worldId: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignPayload {
  name: string;
  description?: string;
}

export interface UpdateCampaignPayload {
  name?: string;
  description?: string;
}

////////////////////
// API CALLS
////////////////////

export const getCampaignsApi = async (worldId: string): Promise<Campaign[]> => {
    const { data } = await apiClient.get<Campaign[]>(`/worlds/${worldId}/campaigns`);
    return data;
};

export const getCampaignByIdApi = async (
  worldId: string,
  campaignId: string
): Promise<Campaign> => {
  const { data } = await apiClient.get<Campaign>(
    `/worlds/${worldId}/campaigns/${campaignId}`
  );
  return data;
};

export const getActiveCampaignApi = async (worldId: string): Promise<Campaign> => {
  const { data } = await apiClient.get<Campaign>(`/worlds/${worldId}/campaigns/active`);
  return data;
};

export const createCampaignApi = async (
  worldId: string,
  payload: CreateCampaignPayload
): Promise<Campaign> => {
  const { data } = await apiClient.post<Campaign>(
    `/worlds/${worldId}/campaigns`,
    payload
  );
  return data;
};

export const updateCampaignApi = async (
  worldId: string,
  campaignId: string,
  payload: UpdateCampaignPayload
): Promise<Campaign> => {
  const { data } = await apiClient.patch<Campaign>(
    `/worlds/${worldId}/campaigns/${campaignId}`,
    payload
  );
  return data;
};

export const activateCampaignApi = async (
  worldId: string,
  campaignId: string
): Promise<void> => {
  await apiClient.patch(`/worlds/${worldId}/campaigns/${campaignId}/activate`);
};

export const deleteCampaignApi = async (
  worldId: string,
  campaignId: string
): Promise<void> => {
  await apiClient.delete(`/worlds/${worldId}/campaigns/${campaignId}`);
};