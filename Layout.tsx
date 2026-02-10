
import React from 'react';
import { Lightbulb, LayoutGrid, QrCode, Info } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeRoute: string;
  onNavigate: (route: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeRoute, onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto bg-white shadow-xl min-h-screen">
      <header className="bg-indigo-700 text-white p-6 no-print">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
               <h1 className="text-2xl font-black tracking-tighter uppercase italic">KaizenConnect</h1>
               <div className="bg-yellow-400 text-indigo-900 text-[10px] font-bold px-1.5 rounded">PRO</div>
            </div>
            <p className="text-indigo-200 text-xs font-medium tracking-wide">CONTINUOUS IMPROVEMENT PORTAL</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => alert("Launch Instructions:\n1. Update constants.ts with real staff.\n2. Print the Master QR code.\n3. Display the Huddle Wall tab on a monitor.")}
              className="p-2 hover:bg-indigo-600 rounded-full transition-colors"
              title="Admin Help"
            >
              <Info className="w-5 h-5 text-indigo-300" />
            </button>
            <Lightbulb className="w-8 h-8 text-yellow-300 fill-yellow-300" />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white border-t border-slate-200 p-2 flex justify-around no-print shadow-[0_-4px_15px_rgba(0,0,0,0.1)] z-40">
        <button 
          onClick={() => onNavigate('submit')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeRoute === 'submit' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Lightbulb className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-bold uppercase tracking-wider">New Idea</span>
        </button>
        <button 
          onClick={() => onNavigate('huddle')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeRoute === 'huddle' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <LayoutGrid className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-bold uppercase tracking-wider">The Wall</span>
        </button>
        <button 
          onClick={() => onNavigate('qr')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeRoute === 'qr' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <QrCode className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-bold uppercase tracking-wider">Master QR</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
