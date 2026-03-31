import apiClient from "./client";
 
////////////////////
// TYPES
////////////////////

export interface GameSession {
  id: string;
  campaignId: string;
  status: "OPEN" | "CLOSED";
  openedAt: string;
  closedAt: string | null;
  campaign: {
    id: string;
    name: string;
    worldId: string;
  };
  participants: SessionParticipant[];
}

export interface SessionParticipant {
  id: string;
  sessionId: string;
  userId: string;
  joinedAt: string;
  leftAt: string | null;
  user: {
    id: string;
    username: string;
  };
}

export interface SessionEvent {
  id: string;
  sessionId: string;
  userId: string;
  type: "DICE_ROLL";
  payload: Record<string, unknown>;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
}

export interface DiceRoll {
  id: string;
  worldId: string;
  sessionId: string | null;
  userId: string;
  characterId: string | null;
  diceType: string;
  result: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
  character: {
    id: string;
    name: string;
  } | null;
}

////////////////////
// API CALLS
////////////////////

// Ouvrir une session (MJ)
export const openSessionApi = async (
    worldId: string,
    campaignId: string
): Promise<GameSession> => {
    const { data } = await apiClient.post<GameSession>(`/worlds/${worldId}/campaigns/${campaignId}/sessions`);

    return data;
};

// Récupérer la session ouverte d'une campagne
export const getOpenSessionApi = async (
  worldId: string,
  campaignId: string
): Promise<GameSession> => {
  const { data } = await apiClient.get<GameSession>(
    `/worlds/${worldId}/campaigns/${campaignId}/sessions/open`
  );
  return data;
};

// Récupérer une session par ID
export const getSessionApi = async (sessionId: string): Promise<GameSession> => {
  const { data } = await apiClient.get<GameSession>(`/sessions/${sessionId}`);
  return data;
};
 
// Historique des sessions d'une campagne
export const getSessionsApi = async (
  worldId: string,
  campaignId: string
): Promise<GameSession[]> => {
  const { data } = await apiClient.get<GameSession[]>(
    `/worlds/${worldId}/campaigns/${campaignId}/sessions`
  );
  return data;
};
 
// Fermer une session (MJ)
export const closeSessionApi = async (sessionId: string): Promise<GameSession> => {
  const { data } = await apiClient.patch<GameSession>(`/sessions/${sessionId}/close`);
  return data;
};
 
// Lancer un dé (avec sessionId pour le broadcast)
export const rollDiceApi = async (
  worldId: string,
  diceType: string,
  sessionId: string,
  characterId?: string
): Promise<DiceRoll> => {
  const { data } = await apiClient.post<DiceRoll>(`/worlds/${worldId}/dice-rolls`, {
    diceType,
    sessionId,
    ...(characterId ? { characterId } : {}),
  });
  return data;
};