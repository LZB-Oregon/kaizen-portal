
import React, { useState, useMemo } from 'react';
import { Lightbulb, LayoutGrid, QrCode, Settings, Info } from 'lucide-react';
import { LOGO_URL } from '../constants';
import { AppRoute } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeRoute: string;
  onNavigate: (route: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeRoute, onNavigate }) => {
  const [logoError, setLogoError] = useState(false);
  
  // Robust URL processing for the logo, same logic as employee photos
  const directLogoUrl = useMemo(() => {
    if (!LOGO_URL) return '';
    const driveMatch = LOGO_URL.match(/\/(?:d|file\/d|open\?id=)([\w-]{25,})[?\/]?/);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/uc?id=${driveMatch[1]}`;
    }
    return LOGO_URL;
  }, []);

  const headerStyle = {
    backgroundColor: '#002d4c',
  };

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto bg-white shadow-2xl">
      <header 
        style={headerStyle}
        className="text-white p-6 no-print border-b-4 border-slate-200/10"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-10 min-w-[100px] flex items-center justify-start">
              {!logoError ? (
                <img 
                  src={directLogoUrl} 
                  alt="La-Z-Boy" 
                  className="h-full w-auto object-contain block transition-opacity duration-500" 
                  onError={() => {
                    setLogoError(true);
                  }}
                />
              ) : (
                <div className="flex flex-col">
                   <span className="font-black text-lg tracking-tighter leading-none text-white">LA-Z-BOY</span>
                </div>
              )}
            </div>
            <div className="h-8 w-px bg-white/20 hidden sm:block"></div>
            <div className="flex flex-col">
               <h2 className="text-sm font-light tracking-[0.25em] uppercase opacity-90 leading-none">Idea System</h2>
               <span className="text-[8px] font-bold tracking-widest opacity-50 mt-1 uppercase">Cloud Integrated</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate(AppRoute.ADMIN_SETUP)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Admin Settings"
            >
              <Settings className={`w-5 h-5 transition-all ${activeRoute === AppRoute.ADMIN_SETUP ? 'text-white' : 'text-white/40'}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-24 bg-white">
        {children}
      </main>

      <nav 
        style={headerStyle}
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl border-t border-white/10 p-2 flex justify-around no-print shadow-[0_-4px_20px_rgba(0,0,0,0.3)] z-40"
      >
        <button 
          onClick={() => onNavigate(AppRoute.SUBMIT)}
          className={`flex flex-col items-center p-3 rounded-xl transition-all ${activeRoute === AppRoute.SUBMIT ? 'text-white bg-white/10' : 'text-white/40 hover:text-white'}`}
        >
          <Lightbulb className="w-6 h-6" />
          <span className="text-[9px] mt-1 font-bold uppercase tracking-widest">Submit</span>
        </button>
        <button 
          onClick={() => onNavigate(AppRoute.HUDDLE_WALL)}
          className={`flex flex-col items-center p-3 rounded-xl transition-all ${activeRoute === AppRoute.HUDDLE_WALL ? 'text-white bg-white/10' : 'text-white/40 hover:text-white'}`}
        >
          <LayoutGrid className="w-6 h-6" />
          <span className="text-[9px] mt-1 font-bold uppercase tracking-widest">The Wall</span>
        </button>
        <button 
          onClick={() => onNavigate(AppRoute.QR_GEN)}
          className={`flex flex-col items-center p-3 rounded-xl transition-all ${activeRoute === AppRoute.QR_GEN ? 'text-white bg-white/10' : 'text-white/40 hover:text-white'}`}
        >
          <QrCode className="w-6 h-6" />
          <span className="text-[9px] mt-1 font-bold uppercase tracking-widest">Station QR</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
