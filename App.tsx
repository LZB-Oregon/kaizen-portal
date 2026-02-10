
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import HuddleWall from './components/HuddleWall';
import { AppRoute, KaizenSubmission, Employee } from './types';
import { LOCATIONS, FALLBACK_EMPLOYEES, SHEET_CSV_URL, LOGO_URL } from './constants';
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
  MapPin
} from 'lucide-react';

const getDirectDriveUrl = (url: string) => {
  if (!url) return '';
  const driveMatch = url.match(/\/(?:d|file\/d|open\?id=)([\w-]{25,})[?\/]?/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }
  return url;
};

const App: React.FC = () => {
  const [route, setRoute] = useState<AppRoute>(AppRoute.SUBMIT);
  const [submissions, setSubmissions] = useState<KaizenSubmission[]>([]);
  const [employees, setEmployees] = useState<Employee[]>(FALLBACK_EMPLOYEES);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [problem, setProblem] = useState('');
  const [impact, setImpact] = useState('');
  const [idea, setIdea] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!SHEET_CSV_URL) return;
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
        
        if (parsed.length > 0) setEmployees(parsed);
      } catch (err) {
        console.error("Failed to fetch Google Sheet data, using fallbacks.", err);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const savedSubmissions = localStorage.getItem('kaizen_submissions');
    if (savedSubmissions) setSubmissions(JSON.parse(savedSubmissions));

    const savedUser = localStorage.getItem('kaizen_user_id');
    const savedLocation = localStorage.getItem('kaizen_location');
    
    if (savedUser && savedLocation) {
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
  };

  const handleSubmit = async () => {
    if (!selectedEmployee || !problem || !impact || !idea || !selectedLocation) return;

    setIsLoading(true);
    const analysis = await analyzeKaizenIdea(problem, idea);

    const newSubmission: KaizenSubmission = {
      id: crypto.randomUUID(),
      location: selectedLocation,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      employeePhoto: selectedEmployee.photoUrl,
      problem,
      impact,
      idea,
      wasteType: analysis?.wasteType,
      aiAnalysis: analysis?.shortAnalysis,
      submittedAt: new Date().toISOString()
    };

    const updated = [newSubmission, ...submissions];
    saveSubmissions(updated);
    
    setIsLoading(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      resetForm();
      setRoute(AppRoute.HUDDLE_WALL);
    }, 2000);
  };

  const resetForm = () => {
    setStep(selectedEmployee ? 3 : 1);
    setProblem('');
    setImpact('');
    setIdea('');
    setShowSuccess(false);
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
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
                <p className="text-center py-12 text-slate-400 font-bold italic">No personnel profiles found for this location.</p>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-lzb w-5 h-5" />
              <h2 className="text-xl font-black uppercase tracking-tight">Describe the Problem</h2>
            </div>
            <textarea
              autoFocus
              className="w-full h-56 p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl focus:ring-8 focus:ring-slate-100 focus:border-lzb transition-all resize-none text-lg font-medium"
              placeholder="What specifically is causing friction or slowing us down?"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex items-center gap-2 mb-2">
              <Target className="text-lzb w-5 h-5" />
              <h2 className="text-xl font-black uppercase tracking-tight">What's the Impact?</h2>
            </div>
            <textarea
              autoFocus
              className="w-full h-56 p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl focus:ring-8 focus:ring-slate-100 focus:border-lzb transition-all resize-none text-lg font-medium"
              placeholder="How would fixing this help the team or our customers?"
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
            />
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-lzb w-5 h-5" />
              <h2 className="text-xl font-black uppercase tracking-tight">Share Your Idea</h2>
            </div>
            <textarea
              autoFocus
              className="w-full h-56 p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl focus:ring-8 focus:ring-slate-100 focus:border-lzb transition-all resize-none text-lg font-medium"
              placeholder="What is your solution or improvement?"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
            />
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
      const currentUrl = window.location.href.split('#')[0];
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-slate-100 relative overflow-hidden max-w-sm w-full">
            <div className="absolute top-0 left-0 w-full h-3 bg-lzb"></div>
            <div className="mb-8 flex flex-col items-center">
              <div className="bg-white p-2 rounded-lg shadow-sm h-12 flex items-center justify-center mb-4 min-w-[100px]">
                 {!logoError ? (
                   <img src={LOGO_URL} alt="La-Z-Boy" className="h-full w-auto object-contain" onError={() => setLogoError(true)} />
                 ) : (
                   <span className="text-lzb font-black text-xs uppercase tracking-tighter">LA-Z-BOY</span>
                 )}
              </div>
              <h3 className="text-xl font-black text-lzb uppercase tracking-tight">Idea Station</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Scan to Improve</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
               <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}`} 
                alt="System QR" 
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">"Empowering Every Team Member"</p>
          </div>
          <button onClick={() => window.print()} className="px-8 py-4 bg-lzb text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl flex items-center gap-3 transition-transform hover:scale-105 no-print">
            <Zap className="w-5 h-5 text-white" /> Print Station QR
          </button>
        </div>
      );
    }

    return (
      <div className="relative pt-4">
        {showSuccess ? (
          <div className="fixed inset-0 bg-lzb z-50 flex flex-col items-center justify-center text-center p-8 animate-in zoom-in duration-500">
            <div className="bg-white p-6 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.2)] mb-6">
              <CheckCircle2 className="w-20 h-20 text-lzb" />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Submission Received</h2>
            <p className="text-white/60 font-bold uppercase tracking-[0.2em] text-sm">Reviewing your Idea...</p>
            <Loader2 className="w-10 h-10 text-white animate-spin mt-12" />
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
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className={`flex-1 rounded-full transition-all duration-700 ${step >= s ? 'bg-lzb shadow-[0_0_10px_rgba(0,45,76,0.2)]' : 'bg-slate-200'}`} />
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
              
              {step < 5 ? (
                <button
                  disabled={(step === 1 && !selectedLocation) || (step === 2 && !selectedEmployee)}
                  onClick={nextStep}
                  className={`flex-[2] py-5 px-6 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-xl ${
                    ((step === 1 && !selectedLocation) || (step === 2 && !selectedEmployee)) 
                      ? 'bg-slate-200 text-slate-400' 
                      : 'bg-lzb text-white active:scale-95 shadow-lzb/20'
                  }`}
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  disabled={!idea || isLoading}
                  onClick={handleSubmit}
                  className="flex-[2] py-5 px-6 rounded-2xl font-black uppercase tracking-widest text-xs bg-lzb text-white shadow-2xl flex items-center justify-center gap-3 disabled:bg-slate-200 active:scale-95 transition-all"
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
    <Layout activeRoute={route} onNavigate={setRoute}>
      {renderContent()}
    </Layout>
  );
};

export default App;
