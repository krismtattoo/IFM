import { toast } from "sonner";
import { API_BASE_URL, API_KEY } from '@/config';
import { ServerInfo, SERVER_TYPES } from "./types";

interface SessionInfo {
  id: string;
  name: string;
  maxUsers: number;
  userCount: number;
  type: number;
  worldType: number;
  minimumGradeLevel: number;
  minimumAppVersion: string;
  maximumAppVersion: string | null;
}

interface ServerResponse {
  errorCode: number;
  result: SessionInfo[];
}

// Get all available servers
export const getServers = async (): Promise<ServerInfo[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/sessions?apikey=${API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ServerResponse = await response.json();
    
    if (data.errorCode !== 0) {
      throw new Error(`API error! code: ${data.errorCode}`);
    }

    // Konvertiere die API-Antwort in unser ServerInfo-Format
    return data.result.map(session => ({
      id: session.id,
      name: session.name,
      type: getServerType(session.worldType),
      status: 'online',
      maxUsers: session.maxUsers,
      currentUsers: session.userCount
    }));
  } catch (error) {
    console.error('Error fetching servers:', error);
    throw error;
  }
};

// Hilfsfunktion zur Konvertierung des worldType in unseren Server-Typ
function getServerType(worldType: number): string {
  switch (worldType) {
    case 1:
      return 'Casual';
    case 2:
      return 'Training';
    case 3:
      return 'Expert';
    default:
      return 'Unknown';
  }
}

// Server ID Mapping
export const serverIdMap: { [key: string]: string } = {};

// Aktualisiere das Server ID Mapping
export const updateServerIdMap = (servers: ServerInfo[]) => {
  servers.forEach(server => {
    serverIdMap[server.name.toLowerCase()] = server.id;
  });
};

// Hole die Server ID anhand des Namens
export const getServerIdByName = (serverName: string): string | undefined => {
  return serverIdMap[serverName.toLowerCase()];
};

// Hole den Server-Namen anhand der ID
export const getServerNameById = (serverId: string): string | undefined => {
  // Konvertiere die ID in den Server-Namen
  const serverName = Object.entries(serverIdMap).find(([_, id]) => id === serverId)?.[0];
  return serverName;
};