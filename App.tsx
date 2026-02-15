
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import HuddleWall from './components/HuddleWall';
import KaizenCard from './components/KaizenCard';
import SetupGuide from './components/SetupGuide';
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

  useEffect(() => {
    const fetchData = async () => {
      let currentEmployees: Employee[] = FALLBACK_EMPLOYEES;
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
          setEmployees(FALLBACK_EMPLOYEES);
        }
      }

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
              employeePhoto: empProfile?.photoUrl || '',
              impact: 'Improvement project'
            };
          });
          const local = JSON.parse(localStorage.getItem('kaizen_submissions') || '[]');
          const merged = [...parsed, ...local].filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
          setSubmissions(merged);
        } catch (err) {
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const locParam = params.get('loc');
    if (locParam && LOCATIONS.includes(locParam)) {
      setSelectedLocation(locParam);
      localStorage.setItem('kaizen_location', locParam);
      setStep(2);
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('kaizen_user_id');
    const savedLocation = localStorage.getItem('kaizen_location');
    if (savedUser && savedLocation && employees.length > 0) {
      const employee = employees.find(e => e.id === savedUser);
      if (employee) {
        setSelectedEmployee(employee);
        setSelectedLocation(savedLocation);
        setStep(3);
      }
    }
  }, [employees]);

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
    if (SUBMISSIONS_SCRIPT_URL) {
      const payload = JSON.stringify(newSubmission);
      const blob = new Blob([payload], { type: 'text/plain' });
      try {
        await fetch(SUBMISSIONS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: blob
        });
      } catch (err) {
        console.error("Sync Error:", err);
      }
    }
    setLatestSubmission(newSubmission);
    const updated = [newSubmission, ...submissions];
    setSubmissions(updated);
    localStorage.setItem('kaizen_submissions', JSON.stringify(updated));
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="text-lzb w-5 h-5" />
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Select Location</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {LOCATIONS.map(loc => (loc &&
                <button key={loc} onClick={() => { setSelectedLocation(loc); localStorage.setItem('kaizen_location', loc); setStep(2); }} className={`p-5 rounded-2xl border-2 transition-all uppercase text-xs font-black tracking-widest ${selectedLocation === loc ? 'border-lzb bg-lzb text-white' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'}`}>
                  {loc}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="text-lzb w-5 h-5" />
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Your Profile</h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {employees.filter(e => e.location === selectedLocation).map(emp => (
                <button key={emp.id} onClick={() => { setSelectedEmployee(emp); localStorage.setItem('kaizen_user_id', emp.id); setStep(3); }} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${selectedEmployee?.id === emp.id ? 'border-lzb bg-lzb text-white' : 'border-slate-100 hover:border-slate-300 bg-white'}`}>
                  <img src={emp.photoUrl} className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                  <div className="text-left">
                    <p className="font-black uppercase tracking-tight">{emp.name}</p>
                    <p className="text-[10px] uppercase font-black opacity-60">{emp.department}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8">
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                <AlertTriangle className="text-lzb w-5 h-5" />
                <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">The Problem</h2>
              </div>
              <textarea className="w-full h-32 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-lzb outline-none" placeholder="What is happening?" value={problem} onChange={(e) => setProblem(e.target.value)} />
            </div>
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                <Lightbulb className="text-lzb w-5 h-5" />
                <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">Your Idea</h2>
              </div>
              <textarea className="w-full h-32 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-lzb outline-none" placeholder="How to fix it?" value={idea} onChange={(e) => setIdea(e.target.value)} />
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <Layout activeRoute={route} onNavigate={(r) => setRoute(r as AppRoute)}>
      {route === AppRoute.HUDDLE_WALL ? <HuddleWall submissions={submissions} /> : route === AppRoute.ADMIN_SETUP ? <SetupGuide /> : route === AppRoute.QR_GEN ? (
        <div className="flex flex-col items-center justify-center py-4 text-center space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-2 border-slate-100 max-w-sm w-full print:border-lzb">
            <h3 className="text-3xl font-black text-lzb uppercase tracking-tighter">IDEA STATION</h3>
            <div className="mt-10">
               <img src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(window.location.origin + window.location.pathname)}`} alt="QR" className="w-48 h-48 mx-auto" />
            </div>
          </div>
          <button onClick={() => window.print()} className="px-10 py-5 bg-lzb text-white rounded-2xl font-black uppercase no-print">Print Sign</button>
        </div>
      ) : showSuccess ? (
        <div className="fixed inset-0 bg-lzb z-50 flex flex-col items-center justify-center p-8 overflow-y-auto">
          <h2 className="text-3xl font-black text-white uppercase mb-12 no-print">Idea Recorded</h2>
          <button onClick={() => window.print()} className="w-full max-w-xs py-5 bg-white text-lzb rounded-2xl font-black uppercase no-print">Print Kaizen Tag</button>
          <button onClick={resetForm} className="mt-4 w-full max-w-xs py-4 bg-white/10 text-white rounded-2xl font-black uppercase no-print">Done</button>
          {latestSubmission && <div className="hidden print:block absolute inset-0 bg-white"><KaizenCard submission={latestSubmission} printMode="thermal-2x3" /></div>}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="min-h-[300px]">{renderStep()}</div>
          <div className="flex gap-4 pt-8 no-print">
            {step > 1 && <button onClick={() => setStep(step - 1)} className="flex-1 py-5 bg-slate-100 rounded-2xl font-black uppercase text-xs">Back</button>}
            <button disabled={(step === 1 && !selectedLocation) || (step === 2 && !selectedEmployee) || (step === 3 && (!problem || !idea)) || isLoading} onClick={() => { if(step < 3) setStep(step + 1); else handleSubmit(); }} className="flex-[2] py-5 bg-lzb text-white rounded-2xl font-black uppercase text-xs disabled:opacity-50">
              {isLoading ? <Loader2 className="animate-spin mx-auto" /> : step < 3 ? 'Continue' : 'Submit Idea'}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
