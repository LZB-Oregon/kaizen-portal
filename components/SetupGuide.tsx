
import React, { useState } from 'react';
import { POWER_AUTOMATE_WEBHOOK_URL, LOGO_URL, SHEET_CSV_URL } from '../constants';
import { 
  Copy, 
  CheckCircle2, 
  Database, 
  Workflow, 
  Terminal, 
  Send, 
  Info,
  ShieldCheck,
  LayoutTemplate,
  MousePointer2,
  Zap,
  AlertCircle,
  Link2,
  ArrowRight
} from 'lucide-react';

const SetupGuide: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const schema = {
    "type": "object",
    "properties": {
      "id": { "type": "string" },
      "location": { "type": "string" },
      "employeeName": { "type": "string" },
      "employeeId": { "type": "string" },
      "problem": { "type": "string" },
      "idea": { "type": "string" },
      "wasteType": { "type": "string" },
      "aiAnalysis": { "type": "string" },
      "submittedAt": { "type": "string" }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestPing = async () => {
    if (!POWER_AUTOMATE_WEBHOOK_URL) return;
    setTestLoading(true);
    setTestResult(null);
    try {
      const response = await fetch(POWER_AUTOMATE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: "ADMIN-TEST-" + Date.now(),
          location: "SYSTEM-TEST",
          employeeName: "System Admin",
          problem: "Verifying the Power Automate pipe is open.",
          idea: "Connection test from the La-Z-Boy Admin Panel.",
          submittedAt: new Date().toISOString()
        })
      });
      if (response.ok) setTestResult('success');
      else setTestResult('error');
    } catch (err) {
      setTestResult('error');
    } finally {
      setTestLoading(false);
    }
  };

  // Basic Health Checks
  // Improved checks to handle more variations of Google Drive links and direct image hosts
  const isLogoShared = 
    LOGO_URL.toLowerCase().includes('uc?') || 
    LOGO_URL.toLowerCase().includes('id=') || 
    LOGO_URL.toLowerCase().includes('export=view') || 
    LOGO_URL.toLowerCase().includes('drive.google.com/thumbnail') || 
    LOGO_URL.toLowerCase().includes('lh3.googleusercontent.com') ||
    LOGO_URL.startsWith('data:image');

  const isSheetExport = 
    SHEET_CSV_URL.toLowerCase().includes('output=csv') || 
    SHEET_CSV_URL.toLowerCase().includes('export?format=csv');

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Header */}
      <div className="bg-lzb p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic mb-2">Admin Setup</h2>
          <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">Power Automate Premium Bridge</p>
        </div>
      </div>

      {/* System Health Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
            <Zap className="text-lzb w-5 h-5" />
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">System Health</h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
            <div className={`p-4 rounded-2xl border flex items-start gap-4 ${isLogoShared ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
                {isLogoShared ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <div>
                    <p className="text-xs font-black uppercase mb-1">Logo Connection</p>
                    <p className="text-[11px] leading-relaxed">
                        {isLogoShared 
                            ? "Your logo link is correctly formatted for direct display." 
                            : "Admin Tip: Ensure your logo in Google Drive is shared with 'Anyone with the link' and uses the direct download format (uc?id=...)."}
                    </p>
                </div>
            </div>
            <div className={`p-4 rounded-2xl border flex items-start gap-4 ${isSheetExport ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                {isSheetExport ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <Link2 className="w-5 h-5 shrink-0" />}
                <div>
                    <p className="text-xs font-black uppercase mb-1">Employee List Sync</p>
                    <p className="text-[11px] leading-relaxed">
                        {isSheetExport 
                            ? "Employee data list is successfully connected via CSV export." 
                            : "Admin Warning: Your SHEET_CSV_URL looks like a standard sharing link. You must go to File > Share > Publish to Web, select 'CSV', and use that link."}
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* Premium Trigger Instructions */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-lzb flex items-center justify-center text-white shadow-lg">
            <Workflow className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Power Automate Flow</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step-by-step for Premium Users</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm space-y-8">
          <div className="space-y-3">
             <div className="flex items-center gap-3">
               <div className="w-6 h-6 rounded-full bg-lzb text-white text-[10px] flex items-center justify-center font-black">1</div>
               <p className="text-sm font-bold text-slate-800">Choose the Trigger</p>
             </div>
             <div className="pl-9 space-y-3">
                <p className="text-xs text-slate-500">Create an <span className="font-bold">Automated Cloud Flow</span>. When searching for the trigger:</p>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                    <p className="text-xs text-slate-600 leading-relaxed">1. Select the <span className="font-black text-lzb uppercase">Built-in</span> tab.</p>
                    <p className="text-xs text-slate-600 leading-relaxed">2. Click the <span className="font-black text-emerald-600 uppercase">Request</span> icon (Green Globe).</p>
                    <p className="text-xs text-slate-600 leading-relaxed">3. Select <span className="font-bold">"When a HTTP request is received"</span>.</p>
                </div>
             </div>
          </div>

          <div className="space-y-3">
             <div className="flex items-center gap-3">
               <div className="w-6 h-6 rounded-full bg-lzb text-white text-[10px] flex items-center justify-center font-black">2</div>
               <p className="text-sm font-bold text-slate-800">Generate the Schema</p>
             </div>
             <div className="pl-9 space-y-3">
                <p className="text-xs text-slate-500">Inside the trigger, click <span className="italic">"Use sample payload to generate schema"</span> and paste this code:</p>
                <div className="bg-slate-900 rounded-2xl p-4 overflow-hidden relative group">
                   <button 
                    onClick={handleCopy}
                    className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white text-[9px] font-black uppercase tracking-widest border border-white/10"
                   >
                    {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy Schema'}
                   </button>
                   <pre className="text-[9px] text-emerald-300 font-mono overflow-x-auto whitespace-pre p-2 bg-black/30 rounded-lg max-h-40 scrollbar-hide">
                      {JSON.stringify(schema, null, 2)}
                   </pre>
                </div>
             </div>
          </div>

          <div className="space-y-3">
             <div className="flex items-center gap-3">
               <div className="w-6 h-6 rounded-full bg-lzb text-white text-[10px] flex items-center justify-center font-black">3</div>
               <p className="text-sm font-bold text-slate-800">Map to SharePoint</p>
             </div>
             <div className="pl-9 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">Add a <span className="font-bold">"SharePoint - Create Item"</span> action and use the "Dynamic Content" to map the fields:</p>
                <div className="grid grid-cols-2 gap-2">
                    {['location', 'employeeName', 'problem', 'idea', 'wasteType', 'aiAnalysis'].map(field => (
                        <div key={field} className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-bold text-slate-400 uppercase flex justify-between">
                            <span>{field}</span>
                            <ArrowRight className="w-3 h-3" />
                        </div>
                    ))}
                </div>
             </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
             <div className="bg-slate-50 p-6 rounded-3xl text-center space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Step 4: Live Test</p>
                <button 
                    onClick={handleTestPing}
                    disabled={testLoading || !POWER_AUTOMATE_WEBHOOK_URL}
                    className="px-10 py-4 bg-lzb text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale flex items-center gap-3 mx-auto"
                >
                    {testLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                    Send Test Ping to SharePoint
                </button>
                {testResult === 'success' && <p className="text-[10px] text-emerald-600 font-bold animate-bounce">✓ Success! Item added to SharePoint.</p>}
                {testResult === 'error' && <p className="text-[10px] text-rose-600 font-bold">✗ Error! Check your Webhook URL or Flow status.</p>}
             </div>
          </div>
        </div>
      </section>

      {/* Advanced SharePoint Views */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-lzb shadow-sm">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Manager Access</h3>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6">
           <div className="space-y-2">
              <p className="text-xs font-black uppercase text-lzb bg-white inline-block px-2 py-0.5 rounded tracking-widest">Site Segregation</p>
              <p className="text-sm leading-relaxed opacity-80">
                To separate data for managers (e.g., only Eugene ideas), go to your SharePoint list and:
              </p>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-xs leading-relaxed italic">
                  Create a New View &gt; Name it "Eugene Team" &gt; Add Filter &gt; <strong>Location is equal to Eugene</strong>.
                </p>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default SetupGuide;
