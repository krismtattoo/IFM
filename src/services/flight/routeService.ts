import { toast } from "sonner";
import { FlightTrackPoint } from "./types";
import { getServers, getServerIdByName, updateServerIdMap } from "./serverService";
import { serverIdMap } from "./types";
import { getRouteEndpointPatterns } from "./routeEndpoints";
import { fetchFlownRouteFromEndpoint, fetchFlightPlanFromEndpoint } from "./routeFetcher";
import { API_BASE_URL, API_KEY } from '@/config';
import { PositionReport } from './types';

// Get flight route for a specific flight - fetch both flown route and flight plan separately
export async function getFlightRoute(serverName: string, flightId: string): Promise<{
  flownRoute: FlightTrackPoint[],
  flightPlan: FlightTrackPoint[]
}> {
  try {
    // Ensure we have server IDs
    if (Object.keys(serverIdMap).length === 0) {
      console.log("No server IDs available, fetching servers first");
      const servers = await getServers();
      updateServerIdMap(servers);
    }
    
    // Get the actual server ID (this is actually the sessionId)
    const sessionId = getServerIdByName(serverName);
    
    if (!sessionId) {
      console.error(`No ID found for server: ${serverName}`);
      // Versuche die Server-ID direkt zu verwenden, falls es sich um eine UUID handelt
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(serverName)) {
        console.log(`Using provided UUID as session ID: ${serverName}`);
        return await fetchRouteData(serverName, flightId);
      }
      
      toast.error(`Server information not available for ${serverName}. Try refreshing the page.`);
      return { flownRoute: [], flightPlan: [] };
    }
    
    return await fetchRouteData(sessionId, flightId);
  } catch (error) {
    console.error("Failed to fetch flight route:", error);
    toast.error("Failed to load flight route. Please try again.");
    return { flownRoute: [], flightPlan: [] };
  }
}

// Hilfsfunktion zum Abrufen der Routendaten
async function fetchRouteData(sessionId: string, flightId: string): Promise<{
  flownRoute: FlightTrackPoint[],
  flightPlan: FlightTrackPoint[]
}> {
  console.log(`Fetching flight route for flight ${flightId} on session ${sessionId}`);
  
  // Get endpoint patterns for both route types
  const endpointPatterns = getRouteEndpointPatterns(sessionId, flightId);
  
  let flownRoutePoints: FlightTrackPoint[] = [];
  let flightPlanPoints: FlightTrackPoint[] = [];
  
  // Try to fetch flown route (bunte Linie)
  console.log("Fetching flown route data...");
  for (const endpoint of endpointPatterns.flownRoute) {
    console.log(`Trying flown route endpoint: ${endpoint}`);
    const points = await fetchFlownRouteFromEndpoint(endpoint);
    
    if (points.length > 0) {
      console.log(`Found ${points.length} flown route points from endpoint: ${endpoint}`);
      flownRoutePoints = points;
      break; // Use first successful endpoint
    }
  }
  
  // Try to fetch flight plan (weiße Linie)
  console.log("Fetching flight plan data...");
  for (const endpoint of endpointPatterns.flightPlan) {
    console.log(`Trying flight plan endpoint: ${endpoint}`);
    const points = await fetchFlightPlanFromEndpoint(endpoint);
    
    if (points.length > 0) {
      console.log(`Found ${points.length} flight plan points from endpoint: ${endpoint}`);
      flightPlanPoints = points;
      break; // Use first successful endpoint
    }
  }
  
  console.log(`Final result - Flown route points: ${flownRoutePoints.length}, Flight plan points: ${flightPlanPoints.length}`);
  
  if (flownRoutePoints.length === 0 && flightPlanPoints.length === 0) {
    console.log("No route or flight plan data available for this flight from any API endpoint");
    toast.error("No route data available for this flight. The pilot may not have filed a flight plan, or the flight data is not yet available.");
  } else {
    const routeInfo = [];
    if (flownRoutePoints.length > 0) routeInfo.push(`${flownRoutePoints.length} flown route points`);
    if (flightPlanPoints.length > 0) routeInfo.push(`${flightPlanPoints.length} flight plan points`);
    console.log(`Successfully loaded: ${routeInfo.join(', ')}`);
  }
  
  return {
    flownRoute: flownRoutePoints,
    flightPlan: flightPlanPoints
  };
}

interface RouteResponse {
  errorCode: number;
  result: PositionReport[];
}

interface FlightPlanItem {
  name: string;
  type: number;
  children: FlightPlanItem[] | null;
  identifier: string | null;
  altitude: number;
  location: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
}

interface FlightPlanInfo {
  flightPlanId: string;
  flightId: string;
  waypoints: string[];
  lastUpdate: string;
  flightPlanItems: FlightPlanItem[];
  flightPlanType: number;
}

interface FlightPlanResponse {
  errorCode: number;
  result: FlightPlanInfo;
}

// Hole die geflogene Route eines Fluges
export const getFlightRouteAPI = async (
  sessionId: string,
  flightId: string,
  apiKey: string = API_KEY
): Promise<PositionReport[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/sessions/${sessionId}/flights/${flightId}/route?apikey=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: RouteResponse = await response.json();
    
    if (data.errorCode !== 0) {
      throw new Error(`API error! code: ${data.errorCode}`);
    }

    return data.result;
  } catch (error) {
    console.error('Error fetching flight route:', error);
    throw error;
  }
};

// Hole den Flight Plan eines Fluges
export const getFlightPlanAPI = async (
  sessionId: string,
  flightId: string,
  apiKey: string = API_KEY
): Promise<FlightPlanInfo> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/sessions/${sessionId}/flights/${flightId}/flightplan?apikey=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: FlightPlanResponse = await response.json();
    
    if (data.errorCode !== 0) {
      throw new Error(`API error! code: ${data.errorCode}`);
    }

    return data.result;
  } catch (error) {
    console.error('Error fetching flight plan:', error);
    throw error;
  }
};

// Konvertiere PositionReport zu FlightTrackPoint
export const convertToFlightTrackPoint = (report: PositionReport): FlightTrackPoint => ({
  latitude: report.latitude,
  longitude: report.longitude,
  altitude: report.altitude,
  heading: report.track,
  speed: report.groundSpeed,
  timestamp: new Date(report.date).getTime()
});
