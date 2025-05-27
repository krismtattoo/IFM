import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Plane, MapPin, User } from 'lucide-react';
import { SearchResult } from '@/hooks/useFlightSearch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAirportData } from '@/hooks/useAirportData';

interface Server {
  id: string;
  name: string;
}

interface FlightSearchProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  onQueryChange: (query: string) => void;
  searchResults: SearchResult[];
  onSelectResult: (result: SearchResult) => void;
  isSearching: boolean;
  debouncedQuery: string;
  activeServer: Server | null;
}

const FlightSearch: React.FC<FlightSearchProps> = ({
  isOpen,
  onOpenChange,
  query,
  onQueryChange,
  searchResults,
  onSelectResult,
  isSearching,
  debouncedQuery,
  activeServer
}) => {
  const [searchType, setSearchType] = React.useState<'airports' | 'flights' | 'username'>('flights');

  // Hole Airports basierend auf der activeServer Prop
  const { airports, loading: airportsLoading } = useAirportData({ activeServerId: activeServer?.id ?? undefined });

  // Traffic-Liste berechnen und sortieren
  const airportTrafficList = React.useMemo(() => {
    if (!airports || airports.length === 0) return [];
    return airports
      .map(airport => ({
        ...airport,
        traffic: (airport.inboundFlights?.length || 0) + (airport.outboundFlights?.length || 0)
      }))
      .filter(a => a.traffic > 0)
      .sort((a, b) => b.traffic - a.traffic);
  }, [airports]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'aircraft':
        return <Plane className="w-4 h-4 text-blue-400" />;
      case 'airport':
        return <MapPin className="w-4 h-4 text-red-400" />;
      case 'user':
        return <User className="w-4 h-4 text-green-400" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Flight Search
          </DialogTitle>
        </DialogHeader>
        
        <div className="mb-4">
          <Tabs value={searchType} onValueChange={v => setSearchType(v as any)}>
            <TabsList className="w-full grid grid-cols-3 bg-slate-800/80 mb-2">
              <TabsTrigger value="airports" className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">Airports</TabsTrigger>
              <TabsTrigger value="flights" className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">Flights</TabsTrigger>
              <TabsTrigger value="username" className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">Username</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Airports-Traffic-Liste */}
        {searchType === 'airports' && activeServer && (!debouncedQuery || debouncedQuery.length < 2) && airports.length >= 0 && (
          <div className="mb-4 max-h-64 overflow-y-auto space-y-1 custom-scrollbar">
            {[...airports]
              .sort((a, b) => {
                const trafficA = (a.inboundFlights?.length || 0) + (a.outboundFlights?.length || 0);
                const trafficB = (b.inboundFlights?.length || 0) + (b.outboundFlights?.length || 0);
                if (trafficA !== trafficB) return trafficB - trafficA;
                return a.airportIcao.localeCompare(b.airportIcao);
              })
              .map((airport, idx) => {
                const traffic = (airport.inboundFlights?.length || 0) + (airport.outboundFlights?.length || 0);
                return (
                  <div
                    key={airport.airportIcao}
                    className="flex items-center gap-3 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => onSelectResult({
                      type: 'airport',
                      id: airport.airportIcao,
                      title: airport.airportIcao,
                      subtitle: airport.airportName,
                      data: airport.airportIcao
                    })}
                  >
                    <span className="font-bold text-blue-400 w-8 text-right">{idx + 1}</span>
                    <div className="flex-1">
                      <div className="font-medium text-white">{airport.airportIcao}</div>
                      <div className="text-xs text-gray-400">{airport.airportName}</div>
                    </div>
                    <div className="text-xs text-green-400 font-bold">{traffic} Traffic</div>
                  </div>
                );
              })}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={`${searchType === 'airports' ? 'Flughäfen' : searchType === 'flights' ? 'Flüge' : 'Benutzer'} suchen...`}
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              autoFocus
            />
          </div>

          {isSearching && debouncedQuery && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-400">Suche...</span>
            </div>
          )}

          {!isSearching && debouncedQuery && debouncedQuery.length >= 2 && (
            <div className="max-h-96 overflow-y-auto space-y-1 custom-scrollbar">
              {searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => onSelectResult(result)}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    {getResultIcon(result.type)}
                    <div className="flex-1">
                      <div className="font-medium text-white">{result.title}</div>
                      <div className="text-sm text-gray-400">{result.subtitle}</div>
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {result.type === 'aircraft' ? 'Flugzeug' : 
                       result.type === 'airport' ? 'Flughafen' : 
                       result.type === 'user' ? 'Benutzer' : result.type}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Keine Ergebnisse gefunden für "{debouncedQuery}"
                </div>
              )}
            </div>
          )}

          {(!debouncedQuery || debouncedQuery.length < 2) && searchType !== 'airports' && (
            <div className="text-center py-8 text-gray-400">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      </DialogContent>
      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.5);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.7);
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 116, 139, 0.5) transparent;
        }
      `}</style>
    </Dialog>
  );
};

export default FlightSearch;
