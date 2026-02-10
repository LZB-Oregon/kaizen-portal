
import React, { useState } from 'react';
import { Lightbulb, LayoutGrid, QrCode, Info } from 'lucide-react';
import { LOGO_URL } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeRoute: string;
  onNavigate: (route: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeRoute, onNavigate }) => {
  const [logoError, setLogoError] = useState(false);

  // Fallback navy color for header in case Tailwind is slow to load
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
            <div className="bg-white p-2 rounded-lg h-10 min-w-[80px] flex items-center justify-center shadow-md">
              {!logoError ? (
                <img 
                  src={LOGO_URL} 
                  alt="La-Z-Boy" 
                  className="h-full w-auto object-contain block" 
                  onError={() => {
                    console.warn("Logo failed to load from:", LOGO_URL);
                    setLogoError(true);
                  }}
                />
              ) : (
                <span 
                  style={{ color: '#002d4c' }}
                  className="font-black text-[10px] tracking-tighter"
                >
                  LA-Z-BOY
                </span>
              )}
            </div>
            <div className="h-8 w-px bg-white/20 hidden sm:block"></div>
            <div className="flex flex-col">
               <h2 className="text-sm font-light tracking-[0.25em] uppercase opacity-90 leading-none">Idea System</h2>
               <span className="text-[8px] font-bold tracking-widest opacity-50 mt-1 uppercase">Continuous Improvement</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => alert("Admin Panel:\n1. Update employees in Google Sheets.\n2. Print the Master QR code for your floor.\n3. Display 'The Wall' on team monitors.")}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="System Info"
            >
              <Info className="w-5 h-5 text-white/70" />
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
          onClick={() => onNavigate('submit')}
          className={`flex flex-col items-center p-3 rounded-xl transition-all ${activeRoute === 'submit' ? 'text-white bg-white/10' : 'text-white/40 hover:text-white'}`}
        >
          <Lightbulb className="w-6 h-6" />
          <span className="text-[9px] mt-1 font-bold uppercase tracking-widest">Submit</span>
        </button>
        <button 
          onClick={() => onNavigate('huddle')}
          className={`flex flex-col items-center p-3 rounded-xl transition-all ${activeRoute === 'huddle' ? 'text-white bg-white/10' : 'text-white/40 hover:text-white'}`}
        >
          <LayoutGrid className="w-6 h-6" />
          <span className="text-[9px] mt-1 font-bold uppercase tracking-widest">Huddle Wall</span>
        </button>
        <button 
          onClick={() => onNavigate('qr')}
          className={`flex flex-col items-center p-3 rounded-xl transition-all ${activeRoute === 'qr' ? 'text-white bg-white/10' : 'text-white/40 hover:text-white'}`}
        >
          <QrCode className="w-6 h-6" />
          <span className="text-[9px] mt-1 font-bold uppercase tracking-widest">Station QR</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
