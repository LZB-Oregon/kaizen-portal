
import React, { useState } from 'react';
import { KaizenSubmission } from '../types';
import KaizenCard from './KaizenCard';
import { LOCATIONS } from '../constants';
import { Search, TrendingUp, Printer, Sofa, Tag, LayoutGrid, MapPin, ChevronDown } from 'lucide-react';

interface HuddleWallProps {
  submissions: KaizenSubmission[];
}

const HuddleWall: React.FC<HuddleWallProps> = ({ submissions }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('all');
  const [printFormat, setPrintFormat] = useState<'standard' | 'thermal'>('standard');

  const filtered = submissions.filter(s => {
    const matchesSearch = s.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.idea.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.problem.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = selectedLocationFilter === 'all' || s.location === selectedLocationFilter;
    
    return matchesSearch && matchesLocation;
  }).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-lzb p-6 rounded-[2rem] border border-slate-800 shadow-2xl no-print relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl">
              <TrendingUp className="text-lzb w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">The Wall</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Continuous Improvement</p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
               <button 
                onClick={() => setPrintFormat('standard')}
                className={`p-2 rounded-lg transition-all ${printFormat === 'standard' ? 'bg-white text-lzb shadow-lg' : 'text-white/40 hover:text-white'}`}
                title="Standard Card Format"
               >
                 <LayoutGrid className="w-4 h-4" />
               </button>
               <button 
                onClick={() => setPrintFormat('thermal')}
                className={`p-2 rounded-lg transition-all ${printFormat === 'thermal' ? 'bg-white text-lzb shadow-lg' : 'text-white/40 hover:text-white'}`}
                title="Thermal Tag Format (2x3)"
               >
                 <Tag className="w-4 h-4" />
               </button>
            </div>
            {filtered.length > 0 && (
                <button 
                onClick={handlePrintAll}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-lzb rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/90 transition-colors shadow-xl"
                >
                <Printer className="w-4 h-4" /> Print
                </button>
            )}
          </div>
        </div>
        
        <div className="space-y-3 relative z-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Search ideas or team members..."
              className="w-full pl-12 pr-6 py-4 bg-black/20 border border-white/10 rounded-2xl focus:ring-4 focus:ring-white/10 focus:border-white/50 transition-all text-sm text-white placeholder-slate-500 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select
              className="w-full pl-12 pr-10 py-3 bg-black/20 border border-white/10 rounded-2xl appearance-none focus:ring-4 focus:ring-white/10 focus:border-white/50 transition-all text-sm text-white font-bold outline-none"
              value={selectedLocationFilter}
              onChange={(e) => setSelectedLocationFilter(e.target.value)}
            >
              <option value="all" className="text-slate-900">All Locations</option>
              {LOCATIONS.map(loc => (
                <option key={loc} value={loc} className="text-slate-900">{loc}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4 pointer-events-none" />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 bg-white border-2 border-dashed border-slate-100 rounded-[2rem] no-print">
          <Sofa className="w-16 h-16 text-slate-100 mx-auto mb-6" />
          <p className="text-slate-300 font-black uppercase tracking-widest text-xs italic">
            {searchTerm || selectedLocationFilter !== 'all' ? "No matching ideas found." : "Awaiting first contribution..."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 no-print">
          {filtered.map(submission => (
            <KaizenCard key={submission.id} submission={submission} />
          ))}
        </div>
      )}

      {/* Optimized Print View */}
      <div className="hidden print:block space-y-4">
        {printFormat === 'standard' ? (
          <>
            <div className="mb-10 border-b-4 border-lzb pb-6 text-center">
                <h1 className="text-3xl font-black uppercase tracking-tighter text-lzb">LA-Z-BOY IDEA SYSTEM</h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">Team Huddle Records • {selectedLocationFilter === 'all' ? 'All Locations' : selectedLocationFilter} • {new Date().toLocaleDateString()}</p>
            </div>
            {filtered.map(submission => (
                <div key={`print-${submission.id}`} className="mb-10 break-inside-avoid">
                <KaizenCard submission={submission} printMode="card" />
                </div>
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center gap-0">
             {filtered.map(submission => (
                <div key={`print-thermal-${submission.id}`} className="break-after-page">
                   <KaizenCard submission={submission} printMode="thermal-2x3" />
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HuddleWall;
