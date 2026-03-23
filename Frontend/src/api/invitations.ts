import apiClient from "./client";
 
////////////////////
// TYPES
////////////////////

export type InvitationRole = "PLAYER" | "MJ";
export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface Invitation {
  id: string;
  code: string;
  email: string;
  role: InvitationRole;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  worldId: string;
  world?: {
    id: string;
    name: string;
  };
}

export interface SendInvitationPayload {
  email: string;
  role?: InvitationRole;
}

////////////////////
// CALLS
////////////////////

// MJ : envoyer une invitation
export const sendInvitation = async (
  worldId: string,
  payload: SendInvitationPayload
): Promise<Invitation> => {
  const { data } = await apiClient.post(
    `/worlds/${worldId}/invitations`,
    payload
  );
  return data;
};

// MJ : voir les invitations d'un monde
export const getWorldInvitations = async (
  worldId: string
): Promise<Invitation[]> => {
  const { data } = await apiClient.get(`/worlds/${worldId}/invitations`);
  return data;
};

// Joueur : voir ses invitations reçues
export const getMyInvitations = async (): Promise<Invitation[]> => {
  const { data } = await apiClient.get("/invitations/me");
  return data;
};

// Joueur : accepter une invitation
export const acceptInvitation = async (code: string): Promise<void> => {
  await apiClient.post(`/invitations/${code}/accept`);
};

// Joueur : refuser une invitation
export const declineInvitation = async (code: string): Promise<void> => {
  await apiClient.post(`/invitations/${code}/decline`);
};