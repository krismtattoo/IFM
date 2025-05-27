import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plane, Map, BarChart3, Users, Globe, ArrowRight } from 'lucide-react';
import { SiDiscord } from '@icons-pack/react-simple-icons';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Plane className="w-6 h-6 text-blue-400" />,
      title: "Real-Time Flight Tracking",
      description: "Track aircraft in real-time across all Infinite Flight servers with detailed flight information and performance metrics."
    },
    {
      icon: <Map className="w-6 h-6 text-green-400" />,
      title: "Interactive Map",
      description: "Explore a beautiful, interactive map with detailed airport information, flight routes, and real-time aircraft positions."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-400" />,
      title: "Performance Analytics",
      description: "Monitor aircraft performance with detailed charts showing altitude, speed, and vertical speed data."
    },
    {
      icon: <Users className="w-6 h-6 text-orange-400" />,
      title: "Pilot Information",
      description: "View detailed pilot profiles, including flight history, statistics, and current flight status."
    },
    {
      icon: <Globe className="w-6 h-6 text-cyan-400" />,
      title: "Global Coverage",
      description: "Access flight data from all Infinite Flight servers worldwide, including Casual, Training, and Expert servers."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Infinite Flight Navigator Logo" className="h-24 md:h-32 w-auto" />
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your ultimate companion for tracking and analyzing flights in Infinite Flight.
            Experience real-time flight tracking, detailed analytics, and comprehensive airport information.
          </p>
          <Button 
            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
            onClick={() => navigate('/map')}
          >
            Launch Map
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Image insertion point */}
        <div className="flex justify-center mt-4 mb-8">
          <img src="/infinitemap.png" alt="Flight Map" className="max-w-full h-auto rounded-lg shadow-lg" />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {feature.icon}
                  <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="py-8">
              <h2 className="text-2xl font-bold mb-4 text-white">Ready to Explore?</h2>
              <p className="text-gray-300 mb-6">
                Start tracking flights, exploring airports, and analyzing flight data now.
              </p>
              <div className="flex justify-center gap-4">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
                  onClick={() => navigate('/map')}
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-6 text-lg"
                  // onClick={() => window.open('YOUR_DISCORD_LINK', '_blank')}
                >
                  <SiDiscord className="mr-2 w-5 h-5" color="#7289DA" />
                  Join Discord
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <footer className="text-center text-gray-500 text-sm py-4">
        © 2025 - InfiniteMap | Created by Flugsohn | Not affiliated with Infinite Flight
      </footer>
    </div>
  );
};

export default LandingPage; 