import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AirportStatus } from '@/services/flight/worldService';
import { fetchWorldData } from '@/services/flight/worldService';
import UnifiedAirportMarkers from './UnifiedAirportMarkers';
import TopAirports from './TopAirports';

const MapUpdater: React.FC = () => {
  const map = useMap();
  
  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);

  return null;
};

const FlightMap: React.FC = () => {
  const [airports, setAirports] = useState<AirportStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchWorldData();
        setAirports(data);
        setLoading(false);
        console.log('Geladene Flughäfen:', data);
      } catch (err) {
        setError('Fehler beim Laden der Flugdaten');
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Aktualisiere alle 30 Sekunden
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[50.1109, 8.6821]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <MapUpdater />
        <UnifiedAirportMarkers airports={airports} />
      </MapContainer>
      
      {/* Top Airports Widget */}
      <div className="absolute top-4 left-4 z-50">
        <TopAirports airports={airports} />
        {airports.length === 0 && (
          <div className="mt-2 p-4 bg-slate-800 text-white rounded-lg shadow-lg">
            Keine Flughäfen gefunden.
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-white text-lg">Lade Flugdaten...</div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
};

export default FlightMap; 