
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import HuddleWall from './components/HuddleWall';
import { AppRoute, KaizenSubmission, Employee } from './types';
import { LOCATIONS, FALLBACK_EMPLOYEES, SHEET_CSV_URL } from './constants';
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
  QrCode,
  UserMinus,
  MapPin
} from 'lucide-react';

/**
 * Utility to convert Google Drive share links to direct image URLs
 */
const getDirectDriveUrl = (url: string) => {
  if (!url) return '';
  // Match standard Google Drive file links
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

  // Form State
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [problem, setProblem] = useState('');
  const [impact, setImpact] = useState('');
  const [idea, setIdea] = useState('');

  // Fetch Employees from Google Sheet CSV
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!SHEET_CSV_URL) return;
      try {
        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        
        const parsed: Employee[] = lines.slice(1).map(line => {
          // Use a basic CSV parser that handles potential quotes
          const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
          return {
            id: values[0],
            name: values[1],
            department: values[2],
            location: values[3],
            photoUrl: getDirectDriveUrl(values[4])
          };
        }).filter(e => e.id && e.name); // Filter out malformed rows
        
        if (parsed.length > 0) setEmployees(parsed);
      } catch (err) {
        console.error("Failed to fetch Google Sheet data, using fallbacks.", err);
      }
    };

    fetchEmployees();
  }, []);

  // Persist submissions and user identity
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
        setStep(3); // Skip Location & Name selection if remembered
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
              <MapPin className="text-red-600 w-5 h-5" />
              <h2 className="text-xl font-bold">Select Location</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {LOCATIONS.map(loc => (
                <button
                  key={loc}
                  onClick={() => handleLocationSelect(loc)}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    selectedLocation === loc 
                      ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-700' 
                      : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
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
              <UserCheck className="text-indigo-600 w-5 h-5" />
              <h2 className="text-xl font-bold">Who are you?</h2>
            </div>
            <p className="text-slate-500 text-sm">Team members at {selectedLocation}:</p>
            <div className="grid grid-cols-1 gap-2 mt-4">
              {filteredEmployees.length > 0 ? filteredEmployees.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => handleEmployeeSelect(emp)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    selectedEmployee?.id === emp.id 
                      ? 'border-indigo-600 bg-indigo-50' 
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <img 
                    src={emp.photoUrl || 'https://via.placeholder.com/150'} 
                    alt={emp.name} 
                    className="w-12 h-12 rounded-full border border-slate-200 object-cover" 
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150'; }}
                  />
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">{emp.name}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">{emp.department}</p>
                  </div>
                  {selectedEmployee?.id === emp.id && (
                    <CheckCircle2 className="ml-auto text-indigo-600 w-6 h-6" />
                  )}
                </button>
              )) : (
                <p className="text-center py-8 text-slate-400">No staff listed for this location yet.</p>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-amber-500 w-5 h-5" />
              <h2 className="text-xl font-bold">What's the problem?</h2>
            </div>
            <textarea
              autoFocus
              className="w-full h-48 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all resize-none text-lg"
              placeholder="Describe the current issue..."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex items-center gap-2 mb-2">
              <Target className="text-red-500 w-5 h-5" />
              <h2 className="text-xl font-bold">What's the impact?</h2>
            </div>
            <textarea
              autoFocus
              className="w-full h-48 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all resize-none text-lg"
              placeholder="How will solving this help?"
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
            />
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-yellow-500 w-5 h-5" />
              <h2 className="text-xl font-bold">What's your idea?</h2>
            </div>
            <textarea
              autoFocus
              className="w-full h-48 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all resize-none text-lg"
              placeholder="Explain your improvement idea..."
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
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-indigo-600 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
            <div className="mb-6 flex flex-col items-center">
              <QrCode className="w-16 h-16 text-indigo-600 mb-4" />
              <h3 className="text-2xl font-black text-indigo-900 italic">COMPANY KAIZEN</h3>
            </div>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}`} 
              alt="Company QR Code" 
              className="w-48 h-48 mx-auto border-4 border-slate-50 rounded-xl"
            />
            <p className="mt-6 text-sm text-slate-500 font-medium italic">"One Scan, Total Improvement"</p>
          </div>
          <button onClick={() => window.print()} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg flex items-center gap-2">
            <Zap className="w-5 h-5" /> Print QR for Wall
          </button>
        </div>
      );
    }

    return (
      <div className="relative pt-4">
        {showSuccess ? (
          <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center text-center p-6 animate-in zoom-in duration-300">
            <CheckCircle2 className="w-24 h-24 text-green-600 mb-4" />
            <h2 className="text-3xl font-bold text-slate-800">Idea Logged!</h2>
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mt-6" />
          </div>
        ) : (
          <div className="space-y-6">
            {selectedEmployee && step > 2 && (
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <img src={selectedEmployee.photoUrl} className="w-8 h-8 rounded-full border border-indigo-200 object-cover" />
                  <span className="text-xs font-bold text-slate-700">{selectedLocation} | {selectedEmployee.name}</span>
                </div>
                <button onClick={handleLogout} className="text-[10px] uppercase font-bold text-indigo-600 bg-white px-2 py-1 rounded border border-slate-200">
                  Switch User
                </button>
              </div>
            )}

            <div className="flex gap-1.5 h-1.5 no-print">
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className={`flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-indigo-600' : 'bg-slate-200'}`} />
              ))}
            </div>

            {renderStep()}

            <div className="flex gap-4 pt-4 no-print">
              {step > 1 && (
                <button onClick={prevStep} className="flex-1 py-4 px-6 bg-slate-100 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2">
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
              )}
              
              {step < 5 ? (
                <button
                  disabled={(step === 1 && !selectedLocation) || (step === 2 && !selectedEmployee)}
                  onClick={nextStep}
                  className={`flex-[2] py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                    ((step === 1 && !selectedLocation) || (step === 2 && !selectedEmployee)) 
                      ? 'bg-slate-200 text-slate-400' 
                      : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                  }`}
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  disabled={!idea || isLoading}
                  onClick={handleSubmit}
                  className="flex-[2] py-4 px-6 rounded-2xl font-bold bg-indigo-600 text-white shadow-lg flex items-center justify-center gap-2 disabled:bg-slate-200"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit Idea <Send className="w-5 h-5" /></>}
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
