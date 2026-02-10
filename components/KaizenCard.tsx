
import React, { useState } from 'react';
import { KaizenSubmission } from '../types';
import { Printer, Calendar, MapPin, Tag } from 'lucide-react';
import { LOGO_URL } from '../constants';

interface KaizenCardProps {
  submission: KaizenSubmission;
  isPrintMode?: boolean;
}

const KaizenCard: React.FC<KaizenCardProps> = ({ submission, isPrintMode = false }) => {
  const [logoError, setLogoError] = useState(false);
  
  const handlePrint = () => {
    window.print();
  };

  const cardClasses = isPrintMode 
    ? "bg-white w-[5.8in] h-[4.1in] p-0 border-4 border-lzb mx-auto overflow-hidden relative shadow-none"
    : "bg-white p-0 border border-slate-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all relative overflow-hidden mb-6";

  return (
    <div className={cardClasses}>
      {/* Card Header - Navy Background */}
      <div className="bg-lzb text-white p-4 flex justify-between items-center border-b-4 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded border-2 border-white/30 overflow-hidden bg-white/10 shadow-inner">
            <img 
              src={submission.employeePhoto} 
              alt={submission.employeeName} 
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1454165833767-027ffea9e77b?w=100&h=100&fit=crop'; }}
            />
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-tight">{submission.employeeName}</h3>
            <p className="text-[9px] text-white/60 font-bold uppercase tracking-widest flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" /> {submission.location}
            </p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="h-8 min-w-[60px] flex items-center justify-center mb-1">
            {!logoError ? (
              <img 
                src={LOGO_URL} 
                alt="La-Z-Boy" 
                className="h-full w-auto object-contain" 
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-white font-black text-[12px] tracking-tighter uppercase px-2">LA-Z-BOY</span>
            )}
          </div>
          <p className="text-[7px] text-white/40 font-bold uppercase tracking-[0.2em] flex items-center justify-end gap-1">
            <Calendar className="w-2 h-2" /> {new Date(submission.submittedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 gap-4">
        <section>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-lzb"></span>
            <h4 className="font-black text-slate-900 uppercase text-[9px] tracking-widest">Observed Problem</h4>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed italic border-l-2 border-slate-100 pl-3">"{submission.problem}"</p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
            <h4 className="font-black text-slate-900 uppercase text-[9px] tracking-widest">Potential Impact</h4>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed pl-4">{submission.impact}</p>
        </section>

        <section className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <h4 className="font-black text-lzb uppercase text-[9px] tracking-widest mb-1">Proposed Solution</h4>
          <p className="text-slate-900 font-bold text-sm leading-tight">{submission.idea}</p>
        </section>
      </div>

      {submission.wasteType && (
        <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-lzb text-white px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border border-white/10">
          <Tag className="w-2 h-2 text-white/50" />
          Waste: {submission.wasteType}
        </div>
      )}

      {!isPrintMode && (
        <div className="p-4 pt-0">
          <button 
            onClick={handlePrint}
            className="w-full py-2 bg-lzb text-white rounded-lg hover:opacity-95 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all no-print shadow-lg"
          >
            <Printer className="w-4 h-4" /> Print Card
          </button>
        </div>
      )}
    </div>
  );
};

export default KaizenCard;
