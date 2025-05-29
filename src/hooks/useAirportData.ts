import { useState, useEffect } from 'react';
import { AirportStatus, getWorldStatus } from '@/services/flight/worldService';
import { toast } from 'sonner';
import { getServerNameById } from '@/services/flight/serverService';

interface UseAirportDataProps {
  activeServerId: string | null;
  serversInitialized: boolean;
}

export function useAirportData({ activeServerId, serversInitialized }: UseAirportDataProps) {
  const [airports, setAirports] = useState<AirportStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🛫 useAirportData useEffect triggered');
    const fetchAirports = async () => {
      console.log('🛫 fetchAirports function called');
      
      // Only fetch if server ID is available AND servers are initialized
      if (!activeServerId || !serversInitialized) {
        console.log('🛫 Waiting for active server ID and servers to be initialized.');
        return;
      }
      
      console.log(`🛫 Active server ID: ${activeServerId}. Servers initialized: ${serversInitialized}. Setting loading to true.`);
      setLoading(true);
      setError(null);
      
      try {
        console.log('🛫 Attempting to get server name by ID');
        const serverName = getServerNameById(activeServerId);
        console.log(`🛫 getServerNameById returned: ${serverName}`);

        if (!serverName) {
          const errorMsg = `Server name not found for ID: ${activeServerId}`;
          console.error(`🛫 ${errorMsg}`);
          setError(errorMsg);
          return;
        }

        console.log(`🛫 Fetching world status for server: ${serverName} (ID: ${activeServerId})`);
        const airportData = await getWorldStatus(serverName);
        
        console.log('🛫 getWorldStatus call finished.');

        if (!Array.isArray(airportData)) {
          const errorMsg = 'Invalid airport data received';
          console.error(`🛫 ${errorMsg}`, airportData);
          throw new Error(errorMsg);
        }
        
        console.log(`🛫 Retrieved ${airportData.length} airports for ${serverName}`);
        console.log('🛫 Sample airport data:', airportData[0]);
        
        setAirports(airportData);
        console.log('🛫 Airports state updated.');

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error("🛫 Failed to fetch airports (caught):", error);
        setError(errorMessage);
        toast.error(`Failed to load airport data: ${errorMessage}`);
      } finally {
        console.log('🛫 fetchAirports finally block. Setting loading to false.');
        setLoading(false);
      }
    };

    fetchAirports();
    
    // Poll for updated airport data every 30 seconds
    console.log('🛫 Setting up polling interval.');
    const interval = setInterval(fetchAirports, 30000);
    return () => {
      console.log('🛫 Clearing polling interval.');
      clearInterval(interval);
    };
  }, [activeServerId, serversInitialized]);

  console.log('🛫 useAirportData hook returning');
  return {
    airports,
    loading,
    error
  };
}
