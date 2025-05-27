import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Flight, FlightTrackPoint } from '@/services/flight';
import { getFlightRoute } from '@/services/flight';
import { toast } from "sonner";
import L from 'leaflet';
import { History, Sun, Moon } from 'lucide-react';
import { EarlyAccessAlert } from './EarlyAccessAlert';
import EarlyAccessPopup from './EarlyAccessPopup';

// Import our components
import ServerSelection from './flight/ServerSelection';
import FlightDetails from './flight/FlightDetails';
import FlightCount from './flight/FlightCount';
import LoadingIndicator from './flight/LoadingIndicator';
import NativeLeafletMap from './flight/NativeLeafletMap';
import LeafletAircraftMarker from './flight/LeafletAircraftMarker';
import LeafletFlightRoute from './flight/LeafletFlightRoute';
import FlightSearch from './flight/FlightSearch';
import SearchButton from './flight/SearchButton';
import EnhancedAirportDetails from './flight/EnhancedAirportDetails';
import UnifiedAirportMarkers, { UnifiedAirportData } from './flight/UnifiedAirportMarkers';
import { useFlightData } from '@/hooks/useFlightData';
import { useFlightSearch, SearchResult } from '@/hooks/useFlightSearch';
import { useAirportData } from '@/hooks/useAirportData';
import { useAirportInfo } from '@/hooks/useAirportInfo';
import { Airport, airports } from '@/data/airportData';

const FlightMap: React.FC = () => {
  const { 
    activeServer, 
    servers, 
    flights, 
    loading, 
    initializing, 
    handleServerChange 
  } = useFlightData();
  
  // Search functionality
  const {
    query,
    setQuery,
    searchResults,
    isOpen,
    setIsOpen,
    clearSearch,
    openSearch,
    isSearching,
    debouncedQuery
  } = useFlightSearch({ flights });
  
  // Memoize flights to prevent unnecessary re-renders
  const memoizedFlights = useMemo(() => flights, [flights]);
  
  // Debug log for flights changes
  useEffect(() => {
    console.log(`🛩️ FlightMap - Flights updated: ${flights.length} flights`);
  }, [flights]);
  
  const [map, setMap] = useState<L.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [flownRoute, setFlownRoute] = useState<FlightTrackPoint[]>([]);
  const [flightPlan, setFlightPlan] = useState<FlightTrackPoint[]>([]);
  const [airportMarkers, setAirportMarkers] = useState<L.Marker[]>([]);
  
  // Critical: Track selection in progress to prevent race conditions
  const [selectionInProgress, setSelectionInProgress] = useState<string | null>(null);
  
  // Airport data hook
  const { airports: liveAirports, loading: airportsLoading } = useAirportData({ 
    activeServerId: activeServer?.id || null 
  });
  
  // Unified airport selection state
  const [selectedAirportData, setSelectedAirportData] = useState<UnifiedAirportData | null>(null);
  
  // Airport info hook
  const { airportInfo, loading: airportInfoLoading, fetchAirportInfo, clearAirportInfo } = useAirportInfo();

  const [showChangelog, setShowChangelog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleMapInit = useCallback((initializedMap: L.Map) => {
    console.log("🗺️ Native Leaflet map initialized in FlightMap component");
    
    setMap(initializedMap);
    setMapLoaded(true);
  }, []);

  // Effect to manage map tile layers based on dark mode
  useEffect(() => {
    if (!map) return;

    const lightTileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    const darkTileUrl = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';

    // Remove existing tile layers
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Add the appropriate tile layer
    const tileLayer = L.tileLayer(isDarkMode ? darkTileUrl : lightTileUrl, {
      attribution: isDarkMode 
        ? '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    });

    tileLayer.addTo(map);

  }, [map, isDarkMode]);

  // Function to toggle dark mode
  const toggleDarkMode = useCallback(() => {
    console.log(`🌓 Toggling dark mode: ${!isDarkMode}`);
    setIsDarkMode(prevMode => !prevMode);
  }, [isDarkMode]);

  // Close airport details handler
  const handleCloseAirportDetails = useCallback(() => {
    console.log("🔄 Closing airport details");
    setSelectedAirportData(null);
    clearAirportInfo();
  }, [clearAirportInfo]);

  // Enhanced close handler to also clear airport selection
  const handleCloseFlightDetails = useCallback(() => {
    console.log("🔄 Closing flight details");
    
    // Clear the details panel and routes
    setFlownRoute([]);
    setFlightPlan([]);
    
    // Clear airport markers
    airportMarkers.forEach(marker => map?.removeLayer(marker));
    setAirportMarkers([]);
    
    // Clear selections after a short delay to allow smooth transition
    setTimeout(() => {
      console.log("🔄 Clearing selected flight");
      setSelectedFlight(null);
      setSelectionInProgress(null);
    }, 1000);
  }, [airportMarkers, map]);

  // Improved flight selection handler with immediate state protection
  const handleFlightSelect = useCallback(async (flight: Flight) => {
    console.log(`🎯 Flight selected: ${flight.id} - Starting selection process`);
    
    // Clear any airport markers when selecting a flight
    airportMarkers.forEach(marker => map?.removeLayer(marker));
    setAirportMarkers([]);
    
    // CRITICAL: Set selection in progress IMMEDIATELY to protect marker
    setSelectionInProgress(flight.id);
    
    // CRITICAL: Set selected flight IMMEDIATELY (synchronous)
    setSelectedFlight(flight);
    
    console.log(`🛡️ PROTECTION ACTIVATED for flight ${flight.id}`);
    
    if (!activeServer) {
      setSelectionInProgress(null);
      return;
    }
    
    try {
      // Log debug information
      console.log(`🔍 Fetching route for flight ${flight.id} on server ${activeServer.id}`);
      
      const routeData = await getFlightRoute(activeServer.id, flight.id);
      console.log(`📍 Retrieved flight route data:`, routeData);
      
      setFlownRoute(routeData.flownRoute);
      setFlightPlan(routeData.flightPlan);
      
      // Focus map on flight with smooth animation
      if (map && flight) {
        map.flyTo([flight.latitude, flight.longitude], 9, {
          animate: true,
          duration: 1.0
        });
      }
      
      console.log(`✅ Selection process completed for flight ${flight.id}`);
    } catch (error) {
      console.error("❌ Failed to fetch flight route:", error);
      toast.error("Failed to load flight route.");
    } finally {
      // Clear selection in progress after a delay to ensure marker stability
      setTimeout(() => {
        setSelectionInProgress(null);
        console.log(`🔓 Selection process finished for flight ${flight.id}`);
      }, 2000); // 2 second delay to ensure stability
    }
  }, [activeServer, map, airportMarkers]);

  // Handle unified airport selection
  const handleUnifiedAirportSelect = useCallback((airportData: UnifiedAirportData) => {
    console.log(`🏢 Unified airport selected: ${airportData.icao}`, airportData);
    setSelectedAirportData(airportData);
    
    // Fetch detailed airport information if we have static data
    if (airportData.staticData) {
      fetchAirportInfo(airportData.icao);
    } else {
      clearAirportInfo();
    }
    
    // Clear any selected flight when selecting an airport
    if (selectedFlight) {
      handleCloseFlightDetails();
    }
    
    // Focus map on airport
    if (map) {
      let coords: [number, number] | null = null;
      
      if (airportData.liveData && airportData.liveData.atcFacilities.length > 0) {
        const facility = airportData.liveData.atcFacilities[0];
        coords = [facility.latitude, facility.longitude];
      } else if (airportData.staticData) {
        coords = [airportData.staticData.latitude, airportData.staticData.longitude];
      }
      
      if (coords) {
        map.flyTo(coords, 10, {
          animate: true,
          duration: 1.5
        });
      }
    }
  }, [map, selectedFlight, handleCloseFlightDetails, fetchAirportInfo, clearAirportInfo]);

  // Handle search result selection
  const handleSelectSearchResult = useCallback((result: SearchResult) => {
    if (!map) return;

    console.log(`🔍 Search result selected:`, result);

    if (result.type === 'aircraft' || result.type === 'user') {
      const flight = result.data as Flight;
      
      // Select the flight
      handleFlightSelect(flight);
      
      // Focus map on flight
      map.flyTo([flight.latitude, flight.longitude], 12, {
        animate: true,
        duration: 1.5
      });
      
    } else if (result.type === 'airport') {
      // Behandlung für Airport aus Search-Liste (data ist Airport Objekt oder ICAO string)
      let airport: Airport | undefined;
      let airportIcao: string;

      if (typeof result.data === 'string') {
        // Wenn data ein ICAO string ist
        airportIcao = result.data;
        airport = airports.find(a => a.icao === airportIcao);
        console.log(`🏢 Airport selected from search (ICAO string): ${airportIcao}`, airport);
      } else {
        // Wenn data ein vollständiges Airport Objekt ist
        airport = result.data as Airport;
        airportIcao = airport.icao;
        console.log(`🏢 Airport selected from search (Airport object): ${airportIcao}`, airport);
      }
      
      if (!airport || typeof airport.latitude !== 'number' || typeof airport.longitude !== 'number') {
        console.error(`❌ No valid airport data or coordinates found for ICAO ${airportIcao}`);
        toast.error(`No valid airport data or coordinates found for ICAO ${airportIcao}`);
        clearSearch();
        return;
      }

      // Erstelle ein UnifiedAirportData Objekt und rufe handleUnifiedAirportSelect auf
      const selectedUnifiedAirportData: UnifiedAirportData = {
        icao: airport.icao,
        liveData: liveAirports.find(a => a.airportIcao === airport.icao), // Versuche Live-Daten zu finden
        staticData: airport, // Verwende das statische Airport-Objekt
        priority: liveAirports.find(a => a.airportIcao === airport.icao) ? 'live' : 'static' // Priorität basierend auf Live-Daten
      };

      handleUnifiedAirportSelect(selectedUnifiedAirportData);

      // Die Erstellung eines separaten roten Markers wird hier entfernt,
      // da handleUnifiedAirportSelect den UnifiedAirportMarkers-Component steuert.

    } else if (result.type === 'traffic') {
      // Behandlung für Airport aus Traffic-Liste (data ist ICAO string)
      const airportIcao = result.data;
      console.log(`🏢 Airport selected from traffic list: ${airportIcao}`);
      console.log("Debug: liveAirports data status:", { count: liveAirports.length, first: liveAirports[0], last: liveAirports[liveAirports.length - 1] });

      // Finde den Airport in den geladenen liveAirports
      const selectedLiveAirport = liveAirports.find(a => a.airportIcao === airportIcao);

      if (selectedLiveAirport) {
        console.log(`Debug: Found live airport data for ${airportIcao}:`, selectedLiveAirport);
        
        // Überprüfe, ob wir gültige Koordinaten haben (bevorzugt Live-Daten)
        let coordinates: [number, number] | null = null;
        
        if (selectedLiveAirport.atcFacilities.length > 0) {
          const facility = selectedLiveAirport.atcFacilities[0];
          if (typeof facility.latitude === 'number' && typeof facility.longitude === 'number') {
            coordinates = [facility.latitude, facility.longitude];
          }
        }
        
        // Fallback auf statische Daten, wenn keine Live-Koordinaten verfügbar sind
        if (!coordinates) {
          const staticAirport = airports.find(a => a.icao === selectedLiveAirport.airportIcao);
          if (staticAirport && typeof staticAirport.latitude === 'number' && typeof staticAirport.longitude === 'number') {
            coordinates = [staticAirport.latitude, staticAirport.longitude];
          }
        }
        
        if (coordinates) {
          // Erstelle ein UnifiedAirportData Objekt und setze es
          const newSelectedAirportData = {
            icao: selectedLiveAirport.airportIcao,
            liveData: selectedLiveAirport,
            staticData: airports.find(a => a.icao === selectedLiveAirport.airportIcao) || undefined,
            priority: 'live' as 'live'
          };
          console.log("Debug: Setting selectedAirportData to:", newSelectedAirportData);
          setSelectedAirportData(newSelectedAirportData);

          // Fokus auf Airport auf der Karte
          map.flyTo(coordinates, 10, {
            animate: true,
            duration: 1.5
          });
        } else {
          console.error(`❌ No valid coordinates found for airport ${airportIcao}`);
          toast.error("No valid coordinates found for this airport.");
        }
      } else {
        console.error(`❌ Airport ${airportIcao} not found in live data`);
        toast.error("Airport not found in live data.");
      }
    }

    clearSearch();
  }, [map, airportMarkers, clearSearch, liveAirports, airports, setSelectedAirportData, handleFlightSelect, handleUnifiedAirportSelect]);

  // Enhanced airport details with flight selection
  const handleAirportFlightSelect = useCallback((flight: Flight) => {
    console.log(`🛩️ Flight selected from airport panel: ${flight.id}`);
    
    // Close airport details
    handleCloseAirportDetails();
    
    // Select the flight
    handleFlightSelect(flight);
  }, [handleCloseAirportDetails, handleFlightSelect]);

  // FIXED: Clear selection when changing servers (removed problematic dependencies)
  useEffect(() => {
    console.log("🔄 Server changed, clearing flight selection immediately");
    setSelectedFlight(null);
    setFlownRoute([]);
    setFlightPlan([]);
    setSelectionInProgress(null);
    
    // Clear airport markers using current state
    setAirportMarkers(prevMarkers => {
      prevMarkers.forEach(marker => {
        if (map) {
          map.removeLayer(marker);
        }
      });
      return [];
    });
  }, [activeServer]); // ONLY activeServer as dependency

  // Enhanced selected flight ID calculation
  const selectedFlightId = useMemo(() => {
    // Return either the selected flight ID or the one in progress
    const id = selectedFlight?.id || selectionInProgress || null;
    console.log(`🎯 Current selected/protected flight ID: ${id}`);
    return id;
  }, [selectedFlight, selectionInProgress]);

  return (
    <div className="relative h-screen w-full bg-[#151920]">
      {/* Early Access Popup */}
      <EarlyAccessPopup />
      
      {/* Early Access Alert */}
      <EarlyAccessAlert />
      
      {/* Server Selection Tabs */}
      <ServerSelection 
        servers={servers} 
        onServerChange={handleServerChange} 
      />
      
      {/* Search Button */}
      <SearchButton onClick={openSearch} />
      
      {/* Search Dialog */}
      <FlightSearch
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        query={query}
        onQueryChange={setQuery}
        searchResults={searchResults}
        onSelectResult={handleSelectSearchResult}
        isSearching={isSearching}
        debouncedQuery={debouncedQuery}
        activeServer={activeServer}
      />
      
      {/* Loading indicator */}
      {(loading || initializing || !mapLoaded || airportsLoading) && (
        <LoadingIndicator 
          message={initializing ? "Verbinde mit Infinite Flight..." : 
                  !mapLoaded ? "Lade Karte..." : 
                  airportsLoading ? "Lade Flughäfen..." :
                  "Lade Flüge..."} 
        />
      )}
      
      {/* Enhanced Airport Details with unified data */}
      {selectedAirportData && (
        <EnhancedAirportDetails 
          airport={selectedAirportData.liveData}
          airportInfo={airportInfo || undefined}
          flights={memoizedFlights}
          loading={airportInfoLoading}
          onClose={handleCloseAirportDetails}
          onFlightSelect={handleAirportFlightSelect}
        />
      )}
      
      {/* Flight Details */}
      {selectedFlight && activeServer && (
        <FlightDetails 
          flight={selectedFlight} 
          serverID={activeServer.id} 
          onClose={handleCloseFlightDetails} 
        />
      )}
      
      {/* Flight Count */}
      <FlightCount count={flights.length} />
      
      {/* Native Leaflet Map Container */}
      <NativeLeafletMap onMapInit={handleMapInit} />
      
      {/* Aircraft Markers, Unified Airport Markers and Flight Route - only render when map is loaded */}
      {map && mapLoaded && (
        <>
          <LeafletAircraftMarker 
            map={map} 
            flights={memoizedFlights} 
            onFlightSelect={handleFlightSelect}
            selectedFlightId={selectedFlightId}
            selectionInProgress={selectionInProgress}
            isDarkMode={isDarkMode}
          />
          <UnifiedAirportMarkers
            map={map}
            liveAirports={liveAirports}
            staticAirports={airports}
            onAirportSelect={handleUnifiedAirportSelect}
          />
          <LeafletFlightRoute 
            map={map} 
            flownRoute={flownRoute}
            flightPlan={flightPlan}
            selectedFlight={selectedFlight} 
          />
        </>
      )}
      
      {/* Removed MapStyles component */}
      {/* <MapStyles /> */}
      
      {/* Dark Mode Toggle Icon unten rechts über Changelog */}
      <button
        onClick={toggleDarkMode}
        style={{
          position: 'fixed',
          bottom: 88,
          right: 24,
          zIndex: 9999,
          background: 'rgba(30,41,59,0.95)',
          borderRadius: '50%',
          width: 56,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
          border: '2px solid #334155',
          cursor: 'pointer',
        }}
        title={isDarkMode ? "Hellmodus aktivieren" : "Dunkelmodus aktivieren"}
      >
        {isDarkMode ? (
          <Sun size={28} className="text-yellow-400" /> // Sonnen-Icon im Dark Mode
        ) : (
          <Moon size={28} className="text-blue-400" /> // Mond-Icon im Light Mode
        )}
      </button>
      
      {/* Changelog Icon unten rechts */}
      <button
        onClick={() => setShowChangelog(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          background: 'rgba(30,41,59,0.95)',
          borderRadius: '50%',
          width: 56,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
          border: '2px solid #334155',
          cursor: 'pointer',
        }}
        title="Changelog anzeigen"
      >
        <History size={28} className="text-white" />
      </button>
      
      {/* Changelog Fenster */}
      {showChangelog && (
        <div className="fixed top-4 right-4 w-[480px] max-h-[calc(100vh-2rem)] z-50">
          <div className="bg-slate-900 border-slate-700 shadow-2xl rounded-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 p-4">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold text-white">Changelog</h2>
              </div>
              <button
                onClick={() => setShowChangelog(false)}
                className="text-gray-400 hover:text-white hover:bg-slate-700 rounded p-1"
                title="Schließen"
              >
                <span style={{fontSize: 20, fontWeight: 'bold'}}>&times;</span>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[65vh] custom-scrollbar text-white space-y-4">
              {/* Changelog Entries */}
              <div>
                <h3 className="font-semibold text-blue-300 mb-1">v1.2.0 – 2024-07-01</h3>
                <ul className="list-disc list-inside text-sm text-slate-200 space-y-1">
                  <li>Added Changelog window</li>
                  <li>Flight route line is now significantly smoother</li>
                  <li>Improved top-left logo</li>
                  <li>Performance optimizations for the map</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-300 mb-1">v1.1.0 – 2024-06-20</h3>
                <ul className="list-disc list-inside text-sm text-slate-200 space-y-1">
                  <li>Revamped flight info window</li>
                  <li>New airport icons</li>
                  <li>Bug fixes and UI improvements</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-300 mb-1">v1.0.0 – 2024-06-01</h3>
                <ul className="list-disc list-inside text-sm text-slate-200 space-y-1">
                  <li>Initial version released</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(FlightMap);
