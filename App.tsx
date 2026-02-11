
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import HuddleWall from './components/HuddleWall';
import KaizenCard from './components/KaizenCard';
import { AppRoute, KaizenSubmission, Employee } from './types';
import { LOCATIONS, FALLBACK_EMPLOYEES, SHEET_CSV_URL, LOGO_URL, SUBMISSIONS_SCRIPT_URL, SUBMISSIONS_READ_URL } from './constants';
import { analyzeKaizenIdea } from './services/geminiService';
import { 
  ChevronRight, 
  ChevronLeft, 
  Send, 
  CheckCircle2, 
  Loader2,
  AlertTriangle,
  UserCheck,
  Target,
  Sparkles,
  Zap,
  MapPin,
  QrCode,
  Printer,
  ChevronDown,
  Tag,
  Lightbulb
} from 'lucide-react';

const getDirectDriveUrl = (url: string) => {
  if (!url) return '';
  const driveMatch = url.match(/\/(?:d|file\/d|open\?id=)([\w-]{25,})[?\/]?/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/uc?id=${driveMatch[1]}`;
  }
  return url;
};

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.SUBMIT);
  const [submissions, setSubmissions] = useState<KaizenSubmission[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [latestSubmission, setLatestSubmission] = useState<KaizenSubmission | null>(null);

  const [qrLocation, setQrLocation] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [problem, setProblem] = useState('');
  const [idea, setIdea] = useState('');

  // 1. Fetch Employees & Global Submissions
  useEffect(() => {
    const fetchData = async () => {
      let currentEmployees: Employee[] = FALLBACK_EMPLOYEES;

      // Fetch Employees first
      if (SHEET_CSV_URL) {
        try {
          const response = await fetch(SHEET_CSV_URL);
          const csvText = await response.text();
          const lines = csvText.split('\n').filter(line => line.trim() !== '');
          const parsed: Employee[] = lines.slice(1).map(line => {
            const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
            return {
              id: values[0],
              name: values[1],
              department: values[2],
              location: values[3],
              photoUrl: getDirectDriveUrl(values[4])
            };
          }).filter(e => e.id && e.name);
          if (parsed.length > 0) {
            currentEmployees = parsed;
            setEmployees(parsed);
          }
        } catch (err) {
          console.error("Failed to fetch Employee data", err);
          setEmployees(FALLBACK_EMPLOYEES);
        }
      }

      // Fetch Global Submissions
      if (SUBMISSIONS_READ_URL) {
        try {
          const response = await fetch(SUBMISSIONS_READ_URL);
          const csvText = await response.text();
          const lines = csvText.split('\n').filter(line => line.trim() !== '');
          const parsed: KaizenSubmission[] = lines.slice(1).map(line => {
            const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
            const empId = values[4];
            const empProfile = currentEmployees.find(e => e.id === empId);
            
            return {
              id: values[0],
              submittedAt: values[1],
              location: values[2],
              employeeName: values[3],
              employeeId: empId,
              problem: values[5],
              idea: values[6],
              wasteType: values[7] as any,
              aiAnalysis: values[8],
              employeePhoto: empProfile?.photoUrl || '', // Map photo from registry
              impact: 'Improvement project'
            };
          });
          
          const local = JSON.parse(localStorage.getItem('kaizen_submissions') || '[]');
          const merged = [...parsed, ...local].filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
          setSubmissions(merged);
        } catch (err) {
          console.error("Failed to fetch Global Submissions", err);
          const saved = localStorage.getItem('kaizen_submissions');
          if (saved) setSubmissions(JSON.parse(saved));
        }
      } else {
        const saved = localStorage.getItem('kaizen_submissions');
        if (saved) setSubmissions(JSON.parse(saved));
      }
    };

    fetchData();
  }, []);

  // Handle URL Parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const locParam = params.get('loc');
    if (locParam && LOCATIONS.includes(locParam)) {
      setSelectedLocation(locParam);
      localStorage.setItem('kaizen_location', locParam);
      setStep(2);
    }
  }, []);

  // Auto-login logic
  useEffect(() => {
    const savedUser = localStorage.getItem('kaizen_user_id');
    const savedLocation = localStorage.getItem('kaizen_location');
    const params = new URLSearchParams(window.location.search);
    if (!params.get('loc') && savedUser && savedLocation && employees.length > 0) {
      const employee = employees.find(e => e.id === savedUser);
      if (employee) {
        setSelectedEmployee(employee);
        setSelectedLocation(savedLocation);
        setStep(3);
      }
    }
  }, [employees]);

  const saveSubmissions = (newSubmissions: KaizenSubmission[]) => {
    setSubmissions(newSubmissions);
    localStorage.setItem('kaizen_submissions', JSON.stringify(newSubmissions));
  };

  const handleLocationSelect = (loc: string) => {
    setSelectedLocation(loc);
    localStorage.setItem('kaizen_location', loc);
    setStep(2);
  };

  const handleEmployeeSelect = (emp: Employee) => {
    setSelectedEmployee(emp);
    localStorage.setItem('kaizen_user_id', emp.id);
    setStep(3);
  };

  const handleLogout = () => {
    localStorage.removeItem('kaizen_user_id');
    localStorage.removeItem('kaizen_location');
    setSelectedEmployee(null);
    setSelectedLocation(null);
    setStep(1);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleSubmit = async () => {
    if (!selectedEmployee || !problem || !idea || !selectedLocation) return;

    setIsLoading(true);
    const analysis = await analyzeKaizenIdea(problem, idea);

    const newSubmission: KaizenSubmission = {
      id: crypto.randomUUID(),
      location: selectedLocation,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      employeePhoto: selectedEmployee.photoUrl,
      problem,
      impact: "Improvement project",
      idea,
      wasteType: analysis?.wasteType,
      aiAnalysis: analysis?.shortAnalysis,
      submittedAt: new Date().toISOString()
    };

    // 1. Post to Google Sheet Script (Async)
    if (SUBMISSIONS_SCRIPT_URL) {
      try {
        fetch(SUBMISSIONS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSubmission)
        }).catch(err => console.error("Sheet Sync Error:", err));
      } catch (e) {
        console.error("Sheet post error", e);
      }
    }

    // 2. Update Local State & Storage immediately
    setLatestSubmission(newSubmission);
    const updated = [newSubmission, ...submissions];
    saveSubmissions(updated);
    
    setIsLoading(false);
    setShowSuccess(true);
  };

  const resetForm = () => {
    setStep(selectedEmployee ? 3 : 1);
    setProblem('');
    setIdea('');
    setShowSuccess(false);
    setLatestSubmission(null);
    setRoute(AppRoute.HUDDLE_WALL);
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const filteredEmployees = employees.filter(e => e.location === selectedLocation);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="text-lzb w-5 h-5" />
              <h2 className="text-xl font-black uppercase tracking-tight">Select Location</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {LOCATIONS.map(loc => (loc &&
                <button
                  key={loc}
                  onClick={() => handleLocationSelect(loc)}
                  className={`p-5 rounded-2xl border-2 transition-all text-center uppercase text-xs font-black tracking-widest ${
                    selectedLocation === loc 
                      ? 'border-lzb bg-lzb text-white shadow-xl scale-[1.02]' 
                      : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="text-lzb w-5 h-5" />
              <h2 className="text-xl font-black uppercase tracking-tight">Select Your Profile</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 mt-4">
              {filteredEmployees.length > 0 ? filteredEmployees.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => handleEmployeeSelect(emp)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    selectedEmployee?.id === emp.id 
                      ? 'border-lzb bg-lzb text-white shadow-lg' 
                      : 'border-slate-100 hover:border-slate-300 bg-white'
                  }`}
                >
                  <img 
                    src={emp.photoUrl || 'https://via.placeholder.com/150'} 
                    alt={emp.name} 
                    className="w-14 h-14 rounded-xl border border-white/20 object-cover shadow-sm" 
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150'; }}
                  />
                  <div className="text-left">
                    <p className={`font-black uppercase tracking-tight ${selectedEmployee?.id === emp.id ? 'text-white' : 'text-slate-900'}`}>{emp.name}</p>
                    <p className={`text-[10px] uppercase font-black tracking-widest ${selectedEmployee?.id === emp.id ? 'text-white/60' : 'text-slate-500'}`}>{emp.department}</p>
                  </div>
                  {selectedEmployee?.id === emp.id && (
                    <CheckCircle2 className="ml-auto text-white w-6 h-6" />
                  )}
                </button>
              )) : (
                <div className="text-center py-12">
                   <p className="text-slate-400 font-bold italic mb-4">No personnel profiles found for {selectedLocation}.</p>
                   <button onClick={() => setStep(1)} className="text-lzb font-black uppercase text-xs tracking-widest underline">Change Location</button>
                </div>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                <AlertTriangle className="text-lzb w-5 h-5" />
                <h2 className="text-lg font-black uppercase tracking-tight">State the problem to be solved</h2>
              </div>
              <textarea
                autoFocus
                className="w-full h-32 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-lzb/5 focus:border-lzb transition-all resize-none text-base font-medium"
                placeholder="What is slowing us down or causing a safety risk?"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
              />
            </div>
            
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                <Lightbulb className="text-lzb w-5 h-5" />
                <h2 className="text-lg font-black uppercase tracking-tight">What's your idea to solve it?</h2>
              </div>
              <textarea
                className="w-full h-32 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-lzb/5 focus:border-lzb transition-all resize-none text-base font-medium"
                placeholder="How can we fix this permanently?"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
              />
            </div>
          </div>
        );
      default: return null;
    }
  };

  const renderContent = () => {
    if (route === AppRoute.HUDDLE_WALL) {
      return <HuddleWall submissions={submissions} />;
    }

    if (route === AppRoute.QR_GEN) {
      const baseUrl = window.location.origin + window.location.pathname;
      const qrUrl = qrLocation ? `${baseUrl}?loc=${encodeURIComponent(qrLocation)}` : baseUrl;
      
      return (
        <div className="flex flex-col items-center justify-center py-4 text-center space-y-6 animate-in fade-in duration-500 pb-20">
          <div className="w-full max-w-sm space-y-4 no-print">
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Station Configuration</p>
              <div className="relative">
                <select 
                  className="w-full p-4 bg-white rounded-xl border-2 border-slate-200 font-bold text-sm appearance-none focus:border-lzb focus:ring-4 focus:ring-lzb/5 transition-all outline-none pr-10"
                  value={qrLocation}
                  onChange={(e) => setQrLocation(e.target.value)}
                >
                  <option value="">All Locations (General)</option>
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border-2 border-slate-100 relative overflow-hidden max-w-sm w-full print:border-lzb print:shadow-none print:max-w-none print:w-full print:h-[10in] print:p-16">
            <div className="absolute top-0 left-0 w-full h-6 bg-lzb"></div>
            
            <div className="mb-10 flex flex-col items-center">
              <div className="bg-lzb p-4 rounded-2xl shadow-lg h-20 flex items-center justify-center mb-6 min-w-[140px] print:h-24">
                 {!logoError ? (
                   <img src={LOGO_URL} alt="La-Z-Boy" className="h-full w-auto object-contain" onError={() => setLogoError(true)} />
                 ) : (
                   <span className="text-white font-black text-2xl uppercase tracking-tighter">LA-Z-BOY</span>
                 )}
              </div>
              <h3 className="text-3xl font-black text-lzb uppercase tracking-tighter print:text-5xl">IDEA STATION</h3>
              {qrLocation && (
                <p className="text-lzb font-black uppercase text-sm tracking-widest mt-2 bg-lzb/5 px-4 py-1 rounded-full print:text-2xl print:mt-6 print:px-8 print:py-4">{qrLocation}</p>
              )}
              <div className="flex items-center gap-2 mt-2 bg-slate-50 px-4 py-1 rounded-full border border-slate-100 print:mt-8 print:px-8 print:py-4">
                <QrCode className="w-4 h-4 text-lzb print:w-8 print:h-8" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 print:text-xl">Scan to Improve</p>
              </div>
            </div>

            <div className="p-6 bg-white rounded-[2rem] border-4 border-lzb relative shadow-inner inline-block mx-auto print:p-12 print:border-8">
               <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrUrl)}`} 
                alt="System QR" 
                className="w-48 h-48 mx-auto print:w-96 print:h-96"
              />
            </div>

            <div className="mt-10 space-y-4">
              <p className="text-slate-900 font-bold text-lg print:text-3xl">Scan with your phone camera</p>
              <p className="mt-8 text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] italic print:text-lg print:mt-24">"Empowering Every Team Member"</p>
            </div>
          </div>

          <button onClick={() => window.print()} className="px-10 py-5 bg-lzb text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 no-print">
            <Printer className="w-5 h-5 text-white" /> Print Station Sign
          </button>
        </div>
      );
    }

    return (
      <div className="relative pt-4">
        {showSuccess ? (
          <div className="fixed inset-0 bg-lzb z-50 flex flex-col items-center justify-center text-center p-8 animate-in zoom-in duration-500 overflow-y-auto">
            <div className="bg-white p-6 rounded-full shadow-2xl mb-6 no-print">
              <CheckCircle2 className="w-20 h-20 text-lzb" />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2 no-print">Success!</h2>
            <p className="text-white/60 font-bold uppercase tracking-[0.2em] text-sm mb-8 no-print">Print your tag for the board</p>
            
            <div className="space-y-4 w-full max-w-xs no-print">
               <button 
                onClick={() => window.print()} 
                className="w-full py-5 bg-white text-lzb rounded-2xl font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95"
               >
                 <Tag className="w-6 h-6" /> Print 2x3 Tag
               </button>
               <button 
                onClick={resetForm} 
                className="w-full py-4 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest border border-white/20 hover:bg-white/20 transition-all text-xs"
               >
                 Done, Back to Wall
               </button>
            </div>

            {latestSubmission && (
                <div className="hidden print:block absolute inset-0 bg-white">
                    <KaizenCard submission={latestSubmission} printMode="thermal-2x3" />
                </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {selectedEmployee && step > 2 && (
              <div className="flex items-center justify-between bg-lzb p-4 rounded-2xl border border-white/10 shadow-xl">
                <div className="flex items-center gap-3">
                  <img src={selectedEmployee.photoUrl} className="w-10 h-10 rounded-xl border-2 border-white/20 object-cover shadow-lg" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1454165833767-027ffea9e77b?w=100&h=100&fit=crop'; }} />
                  <div>
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block">{selectedLocation}</span>
                    <span className="text-sm font-black text-white uppercase tracking-tight">{selectedEmployee.name}</span>
                  </div>
                </div>
                <button onClick={handleLogout} className="text-[9px] uppercase font-black text-white bg-white/10 px-3 py-2 rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
                  Reset
                </button>
              </div>
            )}

            <div className="flex gap-2 h-2 no-print">
              {[1, 2, 3].map(s => (
                <div key={s} className={`flex-1 rounded-full transition-all duration-700 ${step >= s ? 'bg-lzb shadow-lg' : 'bg-slate-200'}`} />
              ))}
            </div>

            <div className="min-h-[300px]">
              {renderStep()}
            </div>

            <div className="flex gap-4 pt-8 no-print">
              {step > 1 && (
                <button onClick={prevStep} className="flex-1 py-5 px-6 bg-slate-100 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
              )}
              
              {step < 3 ? (
                <button
                  disabled={(step === 1 && !selectedLocation) || (step === 2 && !selectedEmployee)}
                  onClick={nextStep}
                  className={`flex-[2] py-5 px-6 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-xl ${
                    ((step === 1 && !selectedLocation) || (step === 2 && !selectedEmployee)) 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50' 
                      : 'bg-lzb text-white active:scale-95 shadow-lzb/20 hover:bg-lzb/90'
                  }`}
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  disabled={!problem || !idea || isLoading}
                  onClick={handleSubmit}
                  className="flex-[2] py-5 px-6 rounded-2xl font-black uppercase tracking-widest text-xs bg-lzb text-white shadow-2xl flex items-center justify-center gap-3 disabled:bg-slate-200 disabled:text-slate-400 disabled:opacity-50 active:scale-95 transition-all hover:bg-lzb/90"
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Submit Idea <Send className="w-6 h-6" /></>}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout activeRoute={route} onNavigate={(r) => setRoute(r as AppRoute)}>
      {renderContent()}
    </Layout>
  );
};

export default App;
