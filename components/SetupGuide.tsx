
import React, { useState } from 'react';
import { POWER_AUTOMATE_WEBHOOK_URL } from '../constants';
import { 
  Copy, 
  CheckCircle2, 
  ExternalLink, 
  Database, 
  Workflow, 
  Terminal, 
  Send, 
  Info,
  ArrowRight,
  ShieldCheck,
  LayoutTemplate,
  PieChart,
  FileSpreadsheet,
  MousePointer2,
  Zap,
  Globe
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
          id: "TEST-PING",
          location: "SYSTEM-TEST",
          employeeName: "Admin Test",
          idea: "System connection test successful",
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

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="bg-lzb p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic mb-3">Enterprise Setup</h2>
          <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Bridge to Microsoft SharePoint</p>
        </div>
      </div>

      {/* Mode Selector Info */}
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex items-start gap-4">
        <Zap className="w-6 h-6 text-blue-600 shrink-0" />
        <div>
           <p className="text-sm font-bold text-blue-900 mb-1">Choosing your path</p>
           <p className="text-xs text-blue-700 leading-relaxed">
             Since you have a <strong>Premium license</strong>, use <strong>Option A (The Webhook)</strong>. It is faster and more reliable. If you encounter issues finding the trigger, follow the search tips in the guide below.
           </p>
        </div>
      </div>

      {/* Option A: The Premium Webhook */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-lzb flex items-center justify-center text-white shadow-lg">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Option A: Premium Webhook</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Direct App-to-Cloud Connection</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm space-y-6">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
               <MousePointer2 className="w-5 h-5 text-lzb" />
               <p className="text-sm font-bold">1. Find the Correct Trigger</p>
             </div>
             <div className="pl-8 space-y-2">
                <p className="text-xs text-slate-500">In Power Automate, click <strong>Create > Automated Cloud Flow</strong>. In the trigger search box, type <span className="font-bold">"Request"</span>.</p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                   <p className="text-[10px] font-black text-lzb uppercase mb-1">Troubleshooting Tip:</p>
                   <p className="text-[10px] text-slate-600 leading-tight">If it doesn't appear, click the <strong>"Built-in"</strong> tab, then click the <strong>"Request"</strong> icon. The trigger is named <span className="font-bold">"When a HTTP request is received"</span>.</p>
                </div>
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-3">
               <Terminal className="w-5 h-5 text-lzb" />
               <p className="text-sm font-bold">2. Paste the JSON Schema</p>
             </div>
             <div className="pl-8 space-y-3">
                <p className="text-xs text-slate-500">Click "Use sample payload to generate schema" and paste this code:</p>
                <div className="bg-slate-900 rounded-2xl p-4 overflow-hidden relative">
                   <button 
                    onClick={handleCopy}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                   >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                   </button>
                   <pre className="text-[9px] text-emerald-300 font-mono overflow-x-auto whitespace-pre p-2 bg-black/30 rounded-lg max-h-40">
                      {JSON.stringify(schema, null, 2)}
                   </pre>
                </div>
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-3">
               <ShieldCheck className="w-5 h-5 text-emerald-500" />
               <p className="text-sm font-bold">3. Finish the Flow</p>
             </div>
             <div className="pl-8">
                <p className="text-xs text-slate-500 leading-relaxed">Add the <span className="font-bold">"SharePoint - Create Item"</span> action. Map the fields. Save the flow, copy the generated <strong>HTTP POST URL</strong>, and paste it into <code>constants.ts</code>.</p>
             </div>
          </div>

          <div className="pt-4">
             <button 
              onClick={handleTestPing}
              disabled={testLoading || !POWER_AUTOMATE_WEBHOOK_URL}
              className="w-full py-4 bg-lzb text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30"
             >
               {testLoading ? 'Sending Test...' : <><Send className="w-4 h-4" /> Test Connection</>}
             </button>
             {testResult === 'success' && <p className="text-[10px] text-emerald-600 font-bold mt-3 text-center">✓ Connection Success! Item added to SharePoint.</p>}
             {testResult === 'error' && <p className="text-[10px] text-rose-600 font-bold mt-3 text-center">✗ Connection Failed. Check your URL.</p>}
          </div>
        </div>
      </section>

      {/* Option B: Standard G-Sheet Bridge */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Option B: Standard Bridge</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Google Sheets to SharePoint</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm">
           <p className="text-xs text-slate-500 leading-relaxed">If Webhooks are giving you trouble, use the <strong>Google Sheets trigger</strong>. Power Automate watches the sheet this app sends to and copies any new rows to SharePoint. No Premium license or JSON schemas required.</p>
           <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-lzb uppercase tracking-widest">
              <MousePointer2 className="w-3 h-3" /> Select: "Google Sheets - When a new row is created"
           </div>
        </div>
      </section>

      {/* SharePoint Master Tips */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-lzb shadow-sm">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">SharePoint Architecture</h3>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6">
           <div>
              <p className="text-xs font-black uppercase text-white/40 tracking-widest mb-2">Location Filtering</p>
              <p className="text-sm leading-relaxed">In your SharePoint List, click <span className="text-lzb bg-white px-1.5 rounded font-bold">All Items > Create New View</span>. Name it by site (e.g. "Eugene Site"). Add a filter where <strong>Location is equal to Eugene</strong>. This allows local managers to see only their data.</p>
           </div>
           <div className="border-t border-white/10 pt-6">
              <p className="text-xs font-black uppercase text-white/40 tracking-widest mb-2">Leadership Roll-up</p>
              <p className="text-sm leading-relaxed">The <span className="font-bold">"All Items"</span> view naturally acts as your corporate roll-up. For advanced analytics, connect the SharePoint List to <span className="text-lzb bg-white px-1.5 rounded font-bold">Power BI</span> to see trends across all La-Z-Boy locations.</p>
           </div>
        </div>
      </section>
    </div>
  );
};

export default SetupGuide;
