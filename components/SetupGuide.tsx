
import React, { useState } from 'react';
import { SUBMISSIONS_SCRIPT_URL, LOGO_URL, SHEET_CSV_URL } from '../constants';
import { 
  Copy, 
  CheckCircle2, 
  Database, 
  Send, 
  Zap,
  AlertCircle,
  Link2,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';

const SetupGuide: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const appsScriptCode = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.id,
    data.submittedAt,
    data.location,
    data.employeeName,
    data.employeeId,
    data.problem,
    data.idea,
    data.wasteType,
    data.aiAnalysis
  ]);
  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestPing = async () => {
    if (!SUBMISSIONS_SCRIPT_URL) return;
    setTestLoading(true);
    setTestResult(null);
    try {
      const payload = JSON.stringify({
        id: "ADMIN-TEST-" + Date.now(),
        location: "SYSTEM-TEST",
        employeeName: "System Admin",
        employeeId: "ADMIN",
        problem: "Verifying Google Sheets Bridge.",
        idea: "Connection test from the La-Z-Boy Admin Panel.",
        submittedAt: new Date().toISOString()
      });
      const blob = new Blob([payload], { type: 'text/plain' });
      await fetch(SUBMISSIONS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: blob
      });
      setTestResult('success');
    } catch (err) {
      setTestResult('error');
    } finally {
      setTestLoading(false);
    }
  };

  const isLogoShared = LOGO_URL.toLowerCase().includes('drive.google.com') || LOGO_URL.toLowerCase().includes('googleusercontent.com') || LOGO_URL.startsWith('data:image');
  const isSheetExport = SHEET_CSV_URL.toLowerCase().includes('output=csv') || SHEET_CSV_URL.toLowerCase().includes('pub?');
  const isScriptSet = SUBMISSIONS_SCRIPT_URL && SUBMISSIONS_SCRIPT_URL.length > 20;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="bg-lzb p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic mb-2">Admin Setup</h2>
          <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">Google Sheets Data Bridge</p>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
            <Zap className="text-lzb w-5 h-5" />
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Connection Status</h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
            <div className={`p-4 rounded-2xl border flex items-start gap-4 ${isLogoShared ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
                {isLogoShared ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <div>
                    <p className="text-xs font-black uppercase mb-1">Branding</p>
                    <p className="text-[11px] leading-relaxed">System logo connection status.</p>
                </div>
            </div>
            
            <div className={`p-4 rounded-2xl border flex items-start gap-4 ${isSheetExport ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                {isSheetExport ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <Link2 className="w-5 h-5 shrink-0" />}
                <div>
                    <p className="text-xs font-black uppercase mb-1">Personnel Sync</p>
                    <p className="text-[11px] leading-relaxed">Employee directory connection status.</p>
                </div>
            </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-lzb flex items-center justify-center text-white shadow-lg">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Google Sheets Bridge</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cloud Integration</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm space-y-8">
          <div className="space-y-3">
             <div className="flex items-center gap-3">
               <div className="w-6 h-6 rounded-full bg-lzb text-white text-[10px] flex items-center justify-center font-black">1</div>
               <p className="text-sm font-bold text-slate-800">Copy Apps Script</p>
             </div>
             <div className="pl-9 space-y-3">
                <p className="text-xs text-slate-500">Paste code into Sheet Apps Script editor:</p>
                <div className="bg-slate-900 rounded-2xl p-4 overflow-hidden relative group">
                   <button onClick={handleCopy} className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white text-[9px] font-black uppercase border border-white/10">
                    {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                   </button>
                   <pre className="text-[9px] text-emerald-300 font-mono overflow-x-auto p-2 bg-black/30 rounded-lg max-h-40">
                      {appsScriptCode}
                   </pre>
                </div>
             </div>
          </div>

          <div className="space-y-3">
             <div className="flex items-center gap-3">
               <div className="w-6 h-6 rounded-full bg-lzb text-white text-[10px] flex items-center justify-center font-black">2</div>
               <p className="text-sm font-bold text-slate-800">Deploy Settings</p>
             </div>
             <div className="pl-9 space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-[10px] italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-bold">Web App</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    <span className="font-bold">Execute: Me</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    <span className="font-bold">Access: Anyone</span>
                </div>
             </div>
          </div>

          <div className="pt-6 border-t border-slate-100 text-center space-y-4">
             <button onClick={handleTestPing} disabled={testLoading || !isScriptSet} className="px-10 py-4 bg-lzb text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl flex items-center gap-3 mx-auto">
                {testLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                Verify Bridge
             </button>
             {testResult === 'success' && <p className="text-[10px] text-emerald-600 font-bold">Bridge Verified</p>}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SetupGuide;
