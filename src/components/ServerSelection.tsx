import React from 'react';

interface Server {
  id: string;
  name: string;
}

interface ServerSelectionProps {
  servers: Server[];
  onServerChange: (serverId: string) => void;
  defaultValue?: string;
}

const ServerSelection: React.FC<ServerSelectionProps> = ({ servers, onServerChange, defaultValue }) => {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-slate-900/40 backdrop-blur-xl p-2 rounded-2xl border border-white/5 shadow-2xl">
        {servers.map((server) => (
          <button
            key={server.id}
            onClick={() => onServerChange(server.id)}
            className={`relative px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out
              ${defaultValue === server.id 
                ? 'bg-white/10 text-white shadow-lg' 
                : 'text-slate-300/70 hover:text-white hover:bg-white/5'
              }`}
          >
            {server.name}
            {defaultValue === server.id && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl" />
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-white/40 via-white/60 to-white/40 rounded-full" />
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ServerSelection; 