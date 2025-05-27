export enum SERVER_TYPES {
  CASUAL = 'Casual',
  TRAINING = 'Training',
  EXPERT = 'Expert',
}

// API Key für Infinite Flight API
export const API_KEY = 'r8hxd0a54uoxrgj51ag5usiba3uls8ii';

// Basis-URL für die API (Proxy)
export const BASE_URL = '/api';

// Server ID Mapping
export const serverIdMap: { [key: string]: string } = {};

// Typen für die API-Antworten
export interface FlightTrackPoint {
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  timestamp: string;
}

export interface ServerInfo {
  id: string;
  name: string;
  type: string;
  status: string;
  maxUsers: number;
  currentUsers: number;
}

export interface AirportInfo {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  iata: string;
  icao: string;
  country: string;
  city: string;
}

export interface Flight {
  id: string;
  callsign: string;
  aircraftId: string;
  aircraftType: string;
  airline: string;
  departure: string;
  arrival: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  verticalSpeed: number;
  onGround: boolean;
  squawk: string;
  lastUpdate: string;
}

export interface AirportStatus {
  id: string;
  name: string;
  iata: string;
  icao: string;
  latitude: number;
  longitude: number;
  country: string;
  city: string;
  inboundFlights: number;
  outboundFlights: number;
  atc: ATCStatus[];
}

export interface ATCStatus {
  id: string;
  callsign: string;
  frequency: string;
  type: string;
  latitude: number;
  longitude: number;
  altitude: number;
  lastUpdate: string;
}

export interface LiveryData {
  id: string;
  name: string;
  aircraftId: string;
  airline: string;
  registration: string;
}

export interface AircraftData {
  id: string;
  name: string;
  type: string;
  liveries: LiveryData[];
}

export interface WorldResponse {
  result: {
    servers: ServerInfo[];
    flights: Flight[];
    airports: AirportInfo[];
  };
}

export interface AirportInfoResponse {
  result: {
    airport: AirportStatus;
  };
}

export interface Airport {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  iata: string;
  icao: string;
  country: string;
  city: string;
} 