import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SERVER_TYPES } from '@/services/flight';
import { Globe } from 'lucide-react';
import { FlightEntry } from '@/services/flight';

interface Server {
  id: string;
  name: string;
}

interface ServerSelectionProps {
  servers: Server[];
  onServerChange: (serverId: string) => void;
  selectedServerId?: string;
  flights: FlightEntry[];
}

const ServerSelection: React.FC<ServerSelectionProps> = ({
  servers,
  onServerChange,
  selectedServerId,
  flights,
}) => {
  const selectedServer = servers.find(server => server.id === selectedServerId);
  const onlineCount = flights.length;

  return (
    <div className="relative">
      <Select
        value={selectedServerId}
        onValueChange={onServerChange}
      >
        <SelectTrigger className="w-[200px] bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-slate-700/50 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">
              {selectedServer ? `${selectedServer.name} (${onlineCount} online)` : "Select Server"}
            </span>
          </div>
        </SelectTrigger>
        <SelectContent className="bg-slate-800/95 backdrop-blur-sm border-slate-700/50 text-white">
          {servers.map(server => (
            <SelectItem 
              key={server.id} 
              value={server.id}
              className="focus:bg-slate-700/50 focus:text-blue-300 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${selectedServerId === server.id ? 'bg-blue-400' : 'bg-slate-500'}`} />
                {server.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ServerSelection;
