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
    // console.log(`🔄 Unified ${result.length} airports (${liveAirports.length} live + ${staticAirports.length} static)`);
    return result;
  }, [liveAirports, staticAirports]);

  const createAirportIcon = useCallback((airportData: UnifiedAirportData): L.DivIcon => {
    const { liveData, staticData } = airportData;
    
    // Berechne die Gesamtanzahl der Flüge
    const totalFlights = liveData ? 
      (liveData.inboundFlightsCount || 0) + (liveData.outboundFlightsCount || 0) : 0;
    
    // Bestimme die Größe basierend auf der Aktivität
    const size = Math.min(Math.max(20, totalFlights * 1.5), 36);
    
    // Bestimme die Farbe basierend auf der Aktivität
    let color = '#94A3B8'; // Standard Grau
    let ringColor = 'rgba(148, 163, 184, 0.3)';
    
    if (totalFlights > 15) {
      color = '#DC2626'; // Rot
      ringColor = 'rgba(220, 38, 38, 0.3)';
    } else if (totalFlights > 10) {
      color = '#F59E0B'; // Orange
      ringColor = 'rgba(245, 158, 11, 0.3)';
    } else if (totalFlights > 5) {
      color = '#10B981'; // Grün
      ringColor = 'rgba(16, 185, 129, 0.3)';
    }
    
    // Füge ATC-Indikator hinzu, wenn vorhanden
    const hasATC = liveData?.atcFacilities.length > 0;
    const atcIndicator = hasATC ? `
      <div class="absolute -top-4 -right-4 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg border-2 border-white/80 transform transition-all duration-300 group-hover:scale-110">
        <div class="absolute inset-0 rounded-full bg-white/10 blur-sm"></div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-4 h-4 drop-shadow-sm">
          <path d="M12 1a7 7 0 0 0-7 7v3a1 1 0 0 0 1 1h2v-4a5 5 0 0 1 10 0v4h2a1 1 0 0 0 1-1V8a7 7 0 0 0-7-7zm-5 10a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2v-5H7zm10 0h-2v5h2a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"/>
        </svg>
        <div class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-white flex items-center justify-center shadow-sm">
          <div class="w-1 h-1 rounded-full bg-emerald-500 animate-pulse-subtle"></div>
        </div>
        <div class="absolute inset-0 rounded-full animate-ping-slow opacity-75" style="background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);"></div>
      </div>
    ` : '';
    
    // Erstelle pulsierende Ringe für aktive Flughäfen
    const pulseRings = totalFlights > 5 ? `
      <div class="absolute inset-0">
        <div class="absolute inset-0 rounded-full animate-ping" style="background-color: ${ringColor};"></div>
        <div class="absolute inset-0 rounded-full animate-ping animation-delay-300" style="background-color: ${ringColor};"></div>
      </div>
    ` : '';
    
    return L.divIcon({
      html: `
        <div class="airport-marker relative group">
          ${pulseRings}
          <div class="relative flex items-center justify-center transform transition-all duration-300 group-hover:scale-110"
               style="width: ${size}px; height: ${size}px;">
            <div class="absolute inset-0 rounded-full" style="background-color: ${color}; box-shadow: 0 0 10px ${color};"></div>
            <div class="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            ${totalFlights > 0 ? `
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-3/4 h-3/4 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                  <span class="text-xs font-bold" style="color: ${color}; font-size: ${Math.max(10, size / 3)}px;">
                    ${totalFlights}
                  </span>
                </div>
              </div>
            ` : ''}
          </div>
          ${atcIndicator}
        </div>
      `,
      className: 'airport-marker-container',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
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
          // console.log(`🏢 Airport clicked: ${airportData.icao} (${displayName})`);
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

    // console.log(`🏢 Creating unified markers for ${unifiedAirports.length} airports`);
    // console.log('Live airports:', liveAirports);
    // console.log('Static airports:', staticAirports);
    // console.log('Unified airports:', unifiedAirports);

    // Create new unified markers
    unifiedAirports.forEach(airportData => {
      // console.log(`Processing airportData for ${airportData.icao}:`, airportData);
      const marker = createAirportMarker(airportData);
      if (marker) {
        try {
          marker.addTo(map);
          markersRef.current[airportData.icao] = marker;
          // console.log(`✅ Added marker for ${airportData.icao}`);
        } catch (error) {
          console.error(`❌ Failed to add airport marker to map for ${airportData.icao}:`, error);
        }
      } else {
        console.warn(`⚠️ Could not create marker for ${airportData.icao}`);
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

export default React.memo(UnifiedAirportMarkers);