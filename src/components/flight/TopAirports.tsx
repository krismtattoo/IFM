import React from 'react';
import { AirportStatus } from '@/services/flight/worldService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane } from 'lucide-react';

interface TopAirportsProps {
  airports: AirportStatus[];
}

const TopAirports: React.FC<TopAirportsProps> = ({ airports }) => {
  // Sortiere Flughäfen nach Gesamtaktivität (Ankünfte + Abflüge)
  const sortedAirports = [...airports]
    .sort((a, b) => {
      const aTotal = a.inboundFlightsCount + a.outboundFlightsCount;
      const bTotal = b.inboundFlightsCount + b.outboundFlightsCount;
      return bTotal - aTotal;
    })
    .slice(0, 3);

  return (
    <Card className="bg-slate-900/95 backdrop-blur-sm shadow-2xl border border-slate-700 text-white w-72">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <Plane className="h-4 w-4 text-blue-400" />
          Top 3 Aktive Flughäfen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedAirports.map((airport, index) => {
          const totalFlights = airport.inboundFlightsCount + airport.outboundFlightsCount;
          const hasATC = airport.atcFacilities.length > 0;
          
          return (
            <div 
              key={airport.airportIcao}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-800/70 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                  {index + 1}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {airport.airportIcao}
                  </div>
                  <div className="text-xs text-gray-400">
                    {airport.airportName}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasATC && (
                  <div className="bg-blue-500/20 px-2 py-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-blue-400">
                      <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>
                    </svg>
                  </div>
                )}
                <div className="text-sm font-medium text-green-400">
                  {totalFlights}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default TopAirports; 