
import React from 'react';
import { KaizenSubmission } from '../types';
import { Printer, Calendar, MapPin, Tag } from 'lucide-react';

interface KaizenCardProps {
  submission: KaizenSubmission;
  isPrintMode?: boolean;
}

const KaizenCard: React.FC<KaizenCardProps> = ({ submission, isPrintMode = false }) => {
  const handlePrint = () => {
    window.print();
  };

  const cardClasses = isPrintMode 
    ? "bg-white w-[5.8in] h-[4.1in] p-6 border-4 border-indigo-700 mx-auto overflow-hidden relative"
    : "bg-white p-6 border-2 border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden";

  return (
    <div className={cardClasses}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg border-2 border-indigo-100 overflow-hidden bg-slate-100">
            <img 
              src={submission.employeePhoto} 
              alt={submission.employeeName} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-lg text-indigo-900 leading-none">{submission.employeeName}</h3>
            <div className="flex flex-col gap-0.5 mt-1">
              <p className="text-[10px] text-slate-500 flex items-center gap-1 font-bold uppercase tracking-wider">
                <MapPin className="w-2.5 h-2.5 text-red-500" /> {submission.location}
              </p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" /> {new Date(submission.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-indigo-700 text-white px-3 py-1 text-sm font-black uppercase tracking-widest rounded">
          KAIZEN
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 text-sm">
        <section>
          <h4 className="font-bold text-indigo-700 uppercase text-[10px] tracking-wider border-b border-indigo-100 pb-1 mb-1">The Problem</h4>
          <p className="text-slate-700 leading-tight italic">"{submission.problem}"</p>
        </section>

        <section>
          <h4 className="font-bold text-indigo-700 uppercase text-[10px] tracking-wider border-b border-indigo-100 pb-1 mb-1">Expected Impact</h4>
          <p className="text-slate-700 leading-tight">{submission.impact}</p>
        </section>

        <section className="bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-500">
          <h4 className="font-bold text-indigo-800 uppercase text-[10px] tracking-wider pb-1 mb-1">The Kaizen Idea</h4>
          <p className="text-indigo-900 font-medium leading-tight">{submission.idea}</p>
        </section>
      </div>

      {submission.wasteType && (
        <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-yellow-200">
          <Tag className="w-2.5 h-2.5" />
          Waste: {submission.wasteType}
        </div>
      )}

      {!isPrintMode && (
        <button 
          onClick={handlePrint}
          className="mt-4 w-full py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 flex items-center justify-center gap-2 text-sm font-medium transition-colors no-print"
        >
          <Printer className="w-4 h-4" /> Print Card
        </button>
      )}
    </div>
  );
};

export default KaizenCard;
