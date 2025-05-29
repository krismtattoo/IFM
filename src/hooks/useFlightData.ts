import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { getFlights, getServers, SERVER_TYPES, ServerInfo, FlightEntry, updateServerIdMap } from '@/services/flight';
import { API_KEY } from '@/config';

interface Server {
  id: string;
  name: string;
}

export function useFlightData() {
  const [activeServer, setActiveServer] = useState<ServerInfo | null>(null);
  const [availableServers, setAvailableServers] = useState<ServerInfo[]>([]);
  const [flights, setFlights] = useState<FlightEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [serversInitialized, setServersInitialized] = useState(false);

  // Load available servers on mount
  useEffect(() => {
    const fetchAvailableServers = async () => {
      setInitializing(true);
      try {
        console.log('Fetching available servers...');
        const serverData = await getServers();
        console.log(`Retrieved ${serverData.length} available servers`, serverData);
        setAvailableServers(serverData);
        setServersInitialized(true);
        
        // Update the server ID map after fetching servers
        updateServerIdMap(serverData);

        // Set default server once we have server data
        if (serverData.length > 0) {
          // Finde den Casual Server
          const casualServer = serverData.find(server => 
            server.name.toLowerCase().includes('casual')
          );
          
          if (casualServer) {
            setActiveServer(casualServer);
            console.log('Default server set to Casual:', casualServer);
          } else {
            // Setze den ersten verfügbaren Server, wenn Casual nicht gefunden wird
            setActiveServer(serverData[0]);
            console.log('Default server set to first available:', serverData[0]);
          }
        } else {
            console.warn('No available servers found.');
            setActiveServer(null);
        }
      } catch (error) {
        console.error("Failed to fetch available servers", error);
        toast.error("Failed to connect to Infinite Flight API.");
        setAvailableServers([]); // Ensure availableServers is empty on error
        setActiveServer(null);
      } finally {
        setInitializing(false);
      }
    };

    fetchAvailableServers();
  }, []); // Leeres Array als Dependency, nur einmal ausführen

  // Load flights for active server
  useEffect(() => {
    const fetchFlights = async () => {
      if (!activeServer) return;
      
      setLoading(true);
      try {
        console.log(`Fetching flights for server: ${activeServer.id}`);
        const flightData = await getFlights(activeServer.id, API_KEY);
        console.log(`Retrieved ${flightData.length} flights`);
        setFlights(flightData);
      } catch (error) {
        console.error("Failed to fetch flights", error);
        toast.error("Failed to load flights for this server.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
    
    // Poll for updated flight data every 15 seconds
    const interval = setInterval(fetchFlights, 15000);
    return () => clearInterval(interval);
  }, [activeServer]);

  // Handle server change
  const handleServerChange = (serverId: string) => {
    console.log(`Attempting to change server to ID: ${serverId}`);
    const server = availableServers.find(s => s.id === serverId);
    if (server) {
      setActiveServer(server);
      console.log('Active server changed to:', server);
    } else {
      console.warn(`Server with ID ${serverId} not found in available servers.`);
    }
  };

  return {
    activeServer,
    servers: availableServers,
    flights,
    loading,
    initializing,
    handleServerChange,
    serversInitialized
  };
}
