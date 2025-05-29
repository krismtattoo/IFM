import { toast } from "sonner";
import { API_KEY, BASE_URL, FlightEntry, FlightInfo } from "./types";
import { getServers, getServerIdByName, serverIdMap } from "./serverService";
import { API_BASE_URL } from '@/config';

interface FlightResponse {
  errorCode: number;
  result: FlightInfo[];
}

// Get all flights for a specific server
export const getFlights = async (serverId: string): Promise<FlightInfo[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/sessions/${serverId}/flights?apikey=${API_KEY}`,
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

    const data: FlightResponse = await response.json();
    
    if (data.errorCode !== 0) {
      throw new Error(`API error! code: ${data.errorCode}`);
    }

    return data.result;
  } catch (error) {
    console.error('Error fetching flights:', error);
    throw error;
  }
};

// Get user details
export async function getUserDetails(serverName: string, userId: string) {
  try {
    // Ensure we have server IDs
    if (Object.keys(serverIdMap).length === 0) {
      console.log("No server IDs available, fetching servers first");
      await getServers();
    }
    
    // Get the actual server ID
    const serverId = getServerIdByName(serverName);
    
    if (!serverId) {
      console.error(`No ID found for server: ${serverName}`);
      toast.error(`Server information not available for ${serverName}. Try refreshing the page.`);
      return null;
    }
    
    // Try multiple endpoint patterns for user details too
    const userEndpoints = [
      `${BASE_URL}/users/${serverId}/${userId}`,
      `${BASE_URL}/sessions/${serverId}/users/${userId}`
    ];
    
    for (const endpoint of userEndpoints) {
      try {
        console.log(`Attempting to fetch user details from: ${endpoint}`);
        console.log(`Using API Key for user details: ${API_KEY ? 'Present' : 'Missing'}`);
        
        const response = await fetch(endpoint, {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.result) {
            console.log("User details retrieved successfully");
            return data.result;
          }
        } else if (response.status === 401) {
          console.error("Unauthorized - API Key may be invalid");
          toast.error("API authorization failed. Please check your API key.");
          return null;
        } else if (response.status === 403) {
          console.error("Forbidden - API Key may lack permissions");
          toast.error("API access forbidden. Please check your API key permissions.");
          return null;
        } else {
          console.log(`User endpoint ${endpoint} returned status ${response.status}`);
        }
      } catch (endpointError) {
        console.error(`Error trying user endpoint ${endpoint}:`, endpointError);
        // Continue to try next endpoint
      }
    }
    
    console.log("Failed to retrieve user details from all endpoints");
    return null;
  } catch (error) {
    console.error("Failed to fetch user details:", error);
    toast.error("Failed to load user details. Please try again.");
    return null;
  }
}
