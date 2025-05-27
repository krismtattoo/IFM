import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import L from 'leaflet';
import { AirportStatus } from '@/services/flight/worldService';
import { Airport } from '@/data/airportData';

export interface UnifiedAirportData {
  icao: string;
  liveData?: AirportStatus;
  staticData?: Airport;
  priority: 'live' | 'static';
}

interface UnifiedAirportMarkersProps {
  map: L.Map;
  liveAirports: AirportStatus[];
  staticAirports: Airport[];
  onAirportSelect: (airportData: UnifiedAirportData) => void;
}

const UnifiedAirportMarkers: React.FC<UnifiedAirportMarkersProps> = ({ 
  map, 
  liveAirports, 
  staticAirports, 
  onAirportSelect 
}) => {
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  // Combine and prioritize airport data
  const unifiedAirports = useMemo(() => {
    const airportMap = new Map<string, UnifiedAirportData>();
    
    // First, add all static airports
    staticAirports.forEach(staticAirport => {
      airportMap.set(staticAirport.icao, {
        icao: staticAirport.icao,
        staticData: staticAirport,
        priority: 'static'
      });
    });
    
    // Then, add live airports (will override static if exists, or add new)
    liveAirports.forEach(liveAirport => {
      const existing = airportMap.get(liveAirport.airportIcao);
      airportMap.set(liveAirport.airportIcao, {
        icao: liveAirport.airportIcao,
        liveData: liveAirport,
        staticData: existing?.staticData, // Keep static data if it exists
        priority: 'live'
      });
    });
    
    const result = Array.from(airportMap.values());
    console.log(`🔄 Unified ${result.length} airports (${liveAirports.length} live + ${staticAirports.length} static)`);
    return result;
  }, [liveAirports, staticAirports]);

  const createAirportIcon = useCallback((airportData: UnifiedAirportData): L.DivIcon => {
    const { liveData, staticData, priority } = airportData;
    
    if (priority === 'live' && liveData) {
      // Live airport with activity - green circles with pulsing animation
      const totalFlights = liveData.inboundFlightsCount + liveData.outboundFlightsCount;
      const hasATC = liveData.atcFacilities.length > 0;
      const size = Math.min(Math.max(16, totalFlights * 2), 32);
      
      return L.divIcon({
        html: `
          <div class="unified-airport-marker relative group">
            <div class="animate-pulse-subtle rounded-full ${hasATC ? 'bg-green-500' : 'bg-green-400'} shadow-lg border-2 border-white opacity-60" 
                 style="width: ${size}px; height: ${size}px;">
            </div>
            ${hasATC ? `
              <div class="absolute -top-2 -right-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-1.5 shadow-lg border border-white/50 transform scale-75 group-hover:scale-100 transition-all duration-200 group-hover:shadow-blue-500/50 group-hover:shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-3.5 h-3.5">
                  <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
                </svg>
              </div>
            ` : ''}
          </div>
        `,
        className: 'unified-airport-marker-container',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    } else if (staticData) {
      // Static airport only - blue circles with subtle pulsing animation
      const isInternational = staticData.iata && staticData.iata.length > 0;
      const colorClass = isInternational ? 'bg-blue-500' : 'bg-blue-400';
      
      return L.divIcon({
        html: `
          <div class="unified-airport-marker animate-pulse-subtle rounded-full ${colorClass} shadow-lg border-2 border-white opacity-50" 
               style="width: 16px; height: 16px;">
          </div>
        `,
        className: 'unified-airport-marker-container',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
    }
    
    // Fallback (shouldn't happen)
    return L.divIcon({
      html: `<div class="w-4 h-4 bg-gray-300 rounded-full opacity-40 animate-pulse-subtle"></div>`,
      className: 'unified-airport-marker-container',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  }, []);

  const getAirportCoordinates = useCallback((airportData: UnifiedAirportData): [number, number] | null => {
    const { liveData, staticData, priority } = airportData;
    
    if (priority === 'live' && liveData && liveData.atcFacilities.length > 0) {
      const coords = liveData.atcFacilities[0];
      return [coords.latitude, coords.longitude];
    } else if (staticData) {
      return [staticData.latitude, staticData.longitude];
    }
    
    return null;
  }, []);

  const createAirportMarker = useCallback((airportData: UnifiedAirportData): L.Marker | null => {
    try {
      if (!map) return null;
      
      const coordinates = getAirportCoordinates(airportData);
      if (!coordinates) return null;
      
      const icon = createAirportIcon(airportData);
      const { liveData, staticData } = airportData;
      
      const displayName = liveData?.airportName || staticData?.name || airportData.icao;
      const iataCode = staticData?.iata ? ` / ${staticData.iata}` : '';
      
      const marker = L.marker(coordinates, { 
        icon,
        draggable: false,
        keyboard: false
      })
        .on('click', (e) => {
          console.log(`🏢 Airport clicked: ${airportData.icao} (${displayName})`);
          L.DomEvent.stopPropagation(e);
          onAirportSelect(airportData);
        });

      return marker;
    } catch (error) {
      console.error(`❌ Failed to create airport marker for ${airportData.icao}:`, error);
      return null;
    }
  }, [map, createAirportIcon, getAirportCoordinates, onAirportSelect]);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    console.log(`🏢 Creating unified markers for ${unifiedAirports.length} airports`);

    // Create new unified markers
    unifiedAirports.forEach(airportData => {
      const marker = createAirportMarker(airportData);
      if (marker) {
        try {
          marker.addTo(map);
          markersRef.current[airportData.icao] = marker;
        } catch (error) {
          console.error(`❌ Failed to add airport marker to map for ${airportData.icao}:`, error);
        }
      }
    });

  }, [map, unifiedAirports, createAirportMarker]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(markersRef.current).forEach(marker => {
        if (map) {
          map.removeLayer(marker);
        }
      });
      markersRef.current = {};
    };
  }, [map]);

  return null;
};

export default UnifiedAirportMarkers;
