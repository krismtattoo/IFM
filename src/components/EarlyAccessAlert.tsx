import { useState, useEffect } from 'react';
import { Rocket, Sparkles, X } from 'lucide-react';

export const EarlyAccessAlert = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Prüfe, ob die Warnung bereits angezeigt wurde
    const hasSeenWarning = localStorage.getItem('hasSeenEarlyAccessWarning');
    if (!hasSeenWarning) {
      setOpen(true);
      localStorage.setItem('hasSeenEarlyAccessWarning', 'true');
    }
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-8 shadow-2xl border border-slate-700/50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700/50">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Early Access
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4 text-slate-300">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
              <p className="leading-relaxed">
                Welcome to the Early Access phase of our application!
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
              <p className="leading-relaxed">
                Please note that the application is still in a very early development stage. 
                You may encounter bugs and unexpected issues during your experience.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
              <p className="leading-relaxed">
                The current state of the project does not reflect the final product. 
                We are continuously working on improvements and new features.
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => setOpen(false)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 