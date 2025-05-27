import { toast } from "sonner";
import { Airport } from './types';
import { API_KEY, AirportInfo } from "./types";

// API base URL
const API_BASE_URL = '/api';

export async function getAirports(serverId: string): Promise<AirportInfo[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/airports/${serverId}`, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Failed to fetch airports:', error);
    throw error;
  }
} 