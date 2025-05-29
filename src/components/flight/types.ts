import { AirportStatus } from '@/services/flight';
import { Airport } from '@/data/airportData';

export interface UnifiedAirportData {
  icao: string;
  liveData?: AirportStatus;
  staticData?: Airport;
  priority: 'live' | 'static';
}

export interface AirportInfo {
  icao: string;
  name: string;
  city: string;
  country: string;
  elevation: number;
  latitude: number;
  longitude: number;
  timezone: string;
  website: string;
  wikipedia: string;
  runways: {
    ident: string;
    length: number;
    width: number;
    surface: string;
  }[];
} 