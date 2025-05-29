import { API_KEY, API_BASE_URL } from '@/config';
import { getServerIdByName, updateServerIdMap, getServers } from './serverService';

export interface ActiveATCFacility {
  frequencyId: string;
  userId: string;
  username: string | null;
  virtualOrganization: string | null;
  airportName: string;
  type: number;
  latitude: number;
  longitude: number;
  startTime: string;
}

export interface AirportStatus {
  airportIcao: string;
  airportName: string;
  inboundFlightsCount: number;
  inboundFlights: string[];
  outboundFlightsCount: number;
  outboundFlights: string[];
  atcFacilities: ActiveATCFacility[];
}

export interface WorldResponse {
  errorCode: number;
  result: AirportStatus[];
}

export async function getWorldStatus(serverName: string): Promise<AirportStatus[]> {
  try {
    // Aktualisiere die Server-ID-Map
    const servers = await getServers();
    updateServerIdMap(servers);
    
    const serverId = getServerIdByName(serverName);
    
    if (!serverId) {
      console.error(`Error: Server ID not found for: ${serverName}`);
      throw new Error(`Server ID not found for: ${serverName}`);
    }

    console.log(`Fetching world status for server: ${serverName} (${serverId})`);
    
    const response = await fetch(`${API_BASE_URL}/sessions/${serverId}/world?apikey=${API_KEY}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`World API HTTP error: ${response.status} for server ${serverName}`);
      throw new Error(`World API error: ${response.status}`);
    }

    const data: WorldResponse = await response.json();
    
    if (data.errorCode !== 0) {
      console.error(`World API returned error code: ${data.errorCode} for server ${serverName}`);
      throw new Error(`World API returned error code: ${data.errorCode}`);
    }

    console.log(`Found ${data.result.length} total airports`);
    return data.result;
    
  } catch (error) {
    console.error("Failed to fetch world status:", error);
    throw error;
  }
}

export { getWorldStatus as fetchWorldData };
