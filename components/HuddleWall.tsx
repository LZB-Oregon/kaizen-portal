
import React from 'react';
import { KaizenSubmission } from '../types';
import KaizenCard from './KaizenCard';
import { Filter, Search, TrendingUp, Printer, ListFilter } from 'lucide-react';

interface HuddleWallProps {
  submissions: KaizenSubmission[];
}

const HuddleWall: React.FC<HuddleWallProps> = ({ submissions }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filtered = submissions.filter(s => 
    s.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.idea.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.problem.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm no-print">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-green-500 w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-800">Team Huddle Wall</h2>
          </div>
          {filtered.length > 0 && (
            <button 
              onClick={handlePrintAll}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors border border-indigo-100"
            >
              <Printer className="w-4 h-4" /> Print All Cards
            </button>
          )}
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text"
            placeholder="Search ideas or team members..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl no-print">
          <TrendingUp className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No ideas found yet. Start improving!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 no-print">
          {filtered.map(submission => (
            <KaizenCard key={submission.id} submission={submission} />
          ))}
        </div>
      )}

      {/* Optimized Print View for Thermal or Small Printers */}
      <div className="hidden print:block space-y-4">
        <div className="mb-8 border-b-2 border-slate-300 pb-4 text-center">
          <h1 className="text-2xl font-black uppercase tracking-widest text-slate-900">Physical Huddle Wall Batch</h1>
          <p className="text-sm text-slate-500">Printed on {new Date().toLocaleString()}</p>
        </div>
        {filtered.map(submission => (
          <div key={`print-${submission.id}`} className="mb-8 break-inside-avoid">
            <KaizenCard submission={submission} isPrintMode />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HuddleWall;
