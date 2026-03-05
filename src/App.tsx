import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Globe, ArrowRight, Activity, Shield, Hospital, User, Settings, LogOut, Plus, Bell, Camera, Mic, Search, MapPin, ChevronRight, Stethoscope, FileText, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from './lib/utils';
import { Language, UserProfile, SymptomAnalysis, ImageAnalysis, RoutineAnalysis, Alarm, Hospital as HospitalType } from './types';
import { analyzeSymptoms, analyzeMedicalImage, analyzeRoutine, searchHospitals, translateText } from './lib/gemini';
import ReactMarkdown from 'react-markdown';

// --- Components ---

const Button = ({ className, variant = 'primary', ...props }: any) => {
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
    secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2',
        variants[variant as keyof typeof variants],
        className
      )}
      {...props}
    />
  );
};

const Input = ({ className, ...props }: any) => (
  <input
    className={cn(
      'w-full px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all bg-white/50 backdrop-blur-sm placeholder:text-slate-400',
      className
    )}
    {...props}
  />
);

const Card = ({ children, className }: any) => (
  <div className={cn('bg-white/70 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm p-6', className)}>
    {children}
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xl font-display font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <Plus className="w-6 h-6 rotate-45 text-slate-500" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

const SpeechButton = ({ text, language }: { text: string; language: string }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Button
      variant="ghost"
      onClick={speak}
      className={cn("text-brand-600 h-8 px-2 text-xs", isSpeaking && "bg-brand-50")}
    >
      <Mic className={cn("w-3 h-3", isSpeaking && "animate-pulse")} />
      {isSpeaking ? "Stop" : "Read It"}
    </Button>
  );
};

const PumpingHeartBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {/* Vibrant Glitter Background Layer */}
    <div 
      className="absolute inset-0 opacity-40"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1533107862482-0e6974b06ec4?q=80&w=2000&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
    {/* Pumping Heart Layer */}
    <div className="absolute inset-0 flex items-center justify-center opacity-[0.18]">
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.9, 0.5],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Heart className="w-[400px] h-[400px] md:w-[600px] md:h-[600px] text-red-900 fill-red-900" />
      </motion.div>
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [step, setStep] = useState<'splash' | 'language' | 'login' | 'dashboard'>('splash');
  const [language, setLanguage] = useState<Language>('en');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'symptoms' | 'images' | 'routine' | 'hospitals' | 'alarms' | 'profile'>('home');

  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => setStep('language'), 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setStep('login');
  };

  const handleLogin = (profile: UserProfile) => {
    setUser(profile);
    setStep('dashboard');
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 font-sans selection:bg-brand-100 selection:text-brand-700 relative overflow-x-hidden">
      <PumpingHeartBackground />
      <div className="relative z-10 min-h-screen">
        <AnimatePresence mode="wait">
          {step === 'splash' && <SplashScreen key="splash" />}
          {step === 'language' && <LanguageScreen key="language" onSelect={handleLanguageSelect} />}
          {step === 'login' && <LoginScreen key="login" language={language} onLogin={handleLogin} />}
          {step === 'dashboard' && user && (
            <Dashboard
              key="dashboard"
              user={user}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onLogout={() => setStep('language')}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Screens ---

function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-transparent z-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-brand-600 rounded-3xl flex items-center justify-center shadow-xl shadow-brand-500/20 mb-6">
          <Heart className="w-12 h-12 text-white fill-white/20" />
        </div>
        <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight">
          Healthy<span className="text-brand-600">Me</span>
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Your AI Health Companion</p>
      </motion.div>
      
      <div className="absolute bottom-12">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 bg-brand-600 rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function LanguageScreen({ onSelect }: { onSelect: (lang: Language) => void }) {
  const languages: { code: Language; name: string; native: string }[] = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'de', name: 'German', native: 'Deutsch' },
    { code: 'zh', name: 'Chinese', native: '中文' },
    { code: 'ar', name: 'Arabic', native: 'العربية' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto px-6 py-12 flex flex-col min-h-screen"
    >
      <div className="mb-12 text-center">
        <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Globe className="w-8 h-8 text-brand-600" />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900">Choose Language</h2>
        <p className="text-slate-500 mt-2">Select your preferred language to continue</p>
      </div>

      <div className="grid gap-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            className="group flex items-center justify-between p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/20 hover:border-brand-500 hover:bg-brand-50/50 transition-all text-left"
          >
            <div>
              <p className="font-semibold text-slate-900">{lang.native}</p>
              <p className="text-sm text-slate-500">{lang.name}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 transition-colors" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function LoginScreen({ language, onLogin }: { language: Language; onLogin: (profile: UserProfile) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    district: '',
    pincode: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ ...formData, language });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-md mx-auto px-6 py-12"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-slate-900">Welcome to HealthyMe</h2>
        <p className="text-slate-500 mt-2">Please enter your details to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
          <Input
            required
            placeholder="John Doe"
            value={formData.name}
            onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
            <Input
              required
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Phone</label>
            <Input
              required
              type="tel"
              placeholder="+1 234 567 890"
              value={formData.phone}
              onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">State</label>
            <Input
              required
              placeholder="California"
              value={formData.state}
              onChange={(e: any) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">District</label>
            <Input
              required
              placeholder="Los Angeles"
              value={formData.district}
              onChange={(e: any) => setFormData({ ...formData, district: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 ml-1">Pincode</label>
          <Input
            required
            placeholder="90210"
            value={formData.pincode}
            onChange={(e: any) => setFormData({ ...formData, pincode: e.target.value })}
          />
        </div>

        <Button type="submit" className="w-full py-4 mt-4">
          Continue <ArrowRight className="w-5 h-5" />
        </Button>
      </form>
    </motion.div>
  );
}

// --- Dashboard & Tabs ---

function Dashboard({ user, activeTab, setActiveTab, onLogout }: { 
  user: UserProfile; 
  activeTab: string; 
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
}) {
  const [alarms, setAlarms] = useState<Alarm[]>([
    { id: '1', type: 'medication', time: '08:00', label: 'Morning Vitamins', active: true },
    { id: '2', type: 'meal', time: '13:00', label: 'Healthy Lunch', active: true },
    { id: '3', type: 'exercise', time: '18:00', label: 'Evening Walk', active: false },
  ]);
  const [triggeredAlarms, setTriggeredAlarms] = useState<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const todayKey = now.toDateString();

      alarms.forEach(alarm => {
        const triggerKey = `${alarm.id}-${todayKey}`;
        if (alarm.active && alarm.time === currentTime && !triggeredAlarms.has(triggerKey)) {
          console.log(`Triggering call for alarm: ${alarm.label}`);
          triggerCall(alarm);
          setTriggeredAlarms(prev => new Set(prev).add(triggerKey));
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [alarms, triggeredAlarms, user]);

  const triggerCall = async (alarm: Alarm) => {
    try {
      const response = await fetch('/api/trigger-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user.phone,
          label: alarm.label,
          time: alarm.time,
          language: user.language
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to trigger call');
      console.log('Call triggered successfully', data);
    } catch (error) {
      console.error('Error triggering call:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-white/60 backdrop-blur-md border-b border-white/20 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Heart className="w-6 h-6 text-white fill-white/10" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold leading-none text-slate-900">HealthyMe</h1>
            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {user.district}, {user.state}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-white/20 text-slate-600 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="Avatar" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-transparent p-6 pb-24 lg:pb-6">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && <HomeTab user={user} setActiveTab={setActiveTab} />}
            {activeTab === 'symptoms' && <SymptomsTab user={user} />}
            {activeTab === 'images' && <ImagesTab user={user} />}
            {activeTab === 'routine' && <RoutineTab user={user} />}
            {activeTab === 'hospitals' && <HospitalsTab user={user} />}
            {activeTab === 'alarms' && <AlarmsTab user={user} alarms={alarms} setAlarms={setAlarms} triggerCall={triggerCall} />}
            {activeTab === 'profile' && <ProfileTab user={user} onLogout={onLogout} />}
          </AnimatePresence>
        </div>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/60 backdrop-blur-md border-t border-white/20 px-4 py-2 flex justify-around items-center z-40 lg:relative lg:border-t-0 lg:bg-transparent lg:px-0 lg:py-0 lg:hidden">
        <NavButton icon={Activity} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavButton icon={Stethoscope} label="Symptom" active={activeTab === 'symptoms'} onClick={() => setActiveTab('symptoms')} />
        <NavButton icon={Camera} label="Scan" active={activeTab === 'images'} onClick={() => setActiveTab('images')} />
        <NavButton icon={Hospital} label="Hospitals" active={activeTab === 'hospitals'} onClick={() => setActiveTab('hospitals')} />
        <NavButton icon={User} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </nav>

      {/* Desktop Sidebar (Optional, but let's stick to a clean mobile-first layout that works on desktop too) */}
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 p-2 rounded-xl transition-all min-w-[64px]',
        active ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
      )}
    >
      <Icon className={cn('w-6 h-6', active && 'fill-brand-600/10')} />
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

// --- Tabs Implementation ---

function HomeTab({ user, setActiveTab }: { user: UserProfile; setActiveTab: (tab: any) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900">Hello, {user.name.split(' ')[0]}!</h2>
          <p className="text-slate-500">How are you feeling today?</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Health Score</p>
          <p className="text-3xl font-display font-bold text-brand-600">84%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActionCard
          icon={Stethoscope}
          title="Symptom Checker"
          desc="AI-powered disease prediction"
          color="bg-blue-500"
          onClick={() => setActiveTab('symptoms')}
        />
        <ActionCard
          icon={Camera}
          title="Medical Scan"
          desc="Analyze X-rays & reports"
          color="bg-purple-500"
          onClick={() => setActiveTab('images')}
        />
        <ActionCard
          icon={Activity}
          title="Daily Routine"
          desc="Track your healthy habits"
          color="bg-emerald-500"
          onClick={() => setActiveTab('routine')}
        />
        <ActionCard
          icon={Hospital}
          title="Find Hospitals"
          desc="Nearby medical centers"
          color="bg-orange-500"
          onClick={() => setActiveTab('hospitals')}
        />
        <ActionCard
          icon={Bell}
          title="Health Alarms"
          desc="Meds & meal reminders"
          color="bg-rose-500"
          onClick={() => setActiveTab('alarms')}
        />
        <ActionCard
          icon={Shield}
          title="Traditional Care"
          desc="Natural & home remedies"
          color="bg-amber-500"
          onClick={() => setActiveTab('symptoms')}
        />
      </div>

      <Card className="bg-brand-600 text-white border-0 overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">Health Tip of the Day</h3>
          <p className="text-brand-50 opacity-90 leading-relaxed">
            Drinking a glass of warm water with lemon in the morning can help boost your metabolism and clear your digestive system.
          </p>
          <Button variant="secondary" className="mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20">
            Read More
          </Button>
        </div>
        <Heart className="absolute -bottom-8 -right-8 w-48 h-48 text-white/10 rotate-12" />
      </Card>
    </motion.div>
  );
}

function ActionCard({ icon: Icon, title, desc, color, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="group bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-sm text-left card-hover flex items-start gap-4"
    >
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform', color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
      </div>
    </button>
  );
}

function SymptomsTab({ user }: { user: UserProfile }) {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SymptomAnalysis | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeSymptoms(input, user.language);
      setResult(analysis);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      // Stop logic would go here
    } else {
      setIsRecording(true);
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = user.language;
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + ' ' + transcript);
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.start();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Stethoscope className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-display font-bold">Symptom Checker</h2>
      </div>

      <Card>
        <p className="text-slate-600 mb-4">Describe how you're feeling or list your symptoms. You can type or use your voice.</p>
        <div className="relative">
          <textarea
            className="w-full h-32 p-4 rounded-xl border border-white/20 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all bg-white/40 backdrop-blur-sm resize-none"
            placeholder="e.g., I have a mild fever and a persistent cough for 2 days..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={toggleRecording}
            className={cn(
              "absolute bottom-4 right-4 p-3 rounded-full transition-all",
              isRecording ? "bg-red-500 text-white animate-pulse" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
            )}
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !input.trim()}
          className="w-full mt-4 py-3"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Symptoms"}
        </Button>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className="border-l-4 border-l-brand-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-600" /> Possible Condition: {result.condition}
              </h3>
              <SpeechButton text={`${result.condition}. ${result.description}`} language={user.language} />
            </div>
            <p className="text-slate-600 leading-relaxed">{result.description}</p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-amber-50 border-amber-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-amber-900 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Traditional Remedies
                </h4>
                <SpeechButton text={result.traditionalRemedies.join(". ")} language={user.language} />
              </div>
              <ul className="space-y-2">
                {result.traditionalRemedies.map((remedy, i) => (
                  <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    {remedy}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="bg-blue-50 border-blue-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-blue-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Recommendations
                </h4>
                <SpeechButton text={result.recommendations} language={user.language} />
              </div>
              <p className="text-sm text-blue-800 leading-relaxed">{result.recommendations}</p>
            </Card>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function ImagesTab({ user }: { user: UserProfile }) {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ImageAnalysis | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const base64 = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];
      const analysis = await analyzeMedicalImage(base64, mimeType, user.language);
      setResult(analysis);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSpeak = () => {
    if (!result) return;
    const utterance = new SpeechSynthesisUtterance(result.findings + ". " + result.details);
    utterance.lang = user.language;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <Camera className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-display font-bold">Medical Image Analysis</h2>
      </div>

      <Card className="flex flex-col items-center justify-center py-12 border-dashed border-2 border-white/20 bg-white/30 backdrop-blur-sm">
        {image ? (
          <div className="w-full max-w-sm space-y-4">
            <img src={image} alt="Upload" className="w-full rounded-xl shadow-md border border-slate-200" />
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setImage(null)}>Change</Button>
              <Button className="flex-1" onClick={handleAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? "Analyzing..." : "Analyze Image"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">Upload X-ray, Test Report, or Medical Photo</p>
            <p className="text-sm text-slate-400 mt-1 mb-6">Supported formats: JPG, PNG, PDF</p>
            <label className="cursor-pointer">
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              <span className="bg-brand-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-700 transition-all">
                Select File
              </span>
            </label>
          </div>
        )}
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {!result.isMedical ? (
            <Card className="bg-red-50 border-red-100 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <p className="text-red-800 font-medium">Please insert a correct medical image.</p>
            </Card>
          ) : (
            <>
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Analysis Findings</h3>
                  <Button variant="ghost" className="text-brand-600" onClick={handleSpeak}>
                    <Mic className="w-4 h-4" /> Listen
                  </Button>
                </div>
                <p className="text-slate-900 font-semibold mb-2">{result.findings}</p>
                <p className="text-slate-600 leading-relaxed">{result.details}</p>
              </Card>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

function RoutineTab({ user }: { user: UserProfile }) {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<RoutineAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeRoutine(input, user.language);
      setResult(analysis);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
          <Activity className="w-6 h-6 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-display font-bold">Daily Routine Tracker</h2>
      </div>

      <Card>
        <p className="text-slate-600 mb-4">Log your daily habits, activities, and sleep patterns to get AI-powered health advice.</p>
        <textarea
          className="w-full h-32 p-4 rounded-xl border border-white/20 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all bg-white/40 backdrop-blur-sm resize-none"
          placeholder="e.g., Woke up at 7 AM, had oatmeal for breakfast, walked for 30 mins, slept at 11 PM..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !input.trim()}
          className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Routine"}
        </Button>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className={cn(
            "border-l-4",
            result.status === 'healthy' ? "border-l-emerald-500 bg-emerald-50/30" : "border-l-amber-500 bg-amber-50/30"
          )}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {result.status === 'healthy' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                )}
                <span className={cn(
                  "font-bold uppercase tracking-wider text-sm",
                  result.status === 'healthy' ? "text-emerald-700" : "text-amber-700"
                )}>
                  {result.status} Routine
                </span>
              </div>
              <SpeechButton text={`${result.status} routine. ${result.feedback}`} language={user.language} />
            </div>
            <p className="text-slate-700 leading-relaxed">{result.feedback}</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-900">Personalized Tips</h4>
              <SpeechButton text={result.tips.join(". ")} language={user.language} />
            </div>
            <div className="grid gap-3">
              {result.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/40 border border-white/20">
                  <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm text-slate-600">{tip}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

function HospitalsTab({ user }: { user: UserProfile }) {
  const [hospitals, setHospitals] = useState<HospitalType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<HospitalType | null>(null);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const results = await searchHospitals(`${user.district}, ${user.state}`, user.language);
      setHospitals(results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Hospital className="w-6 h-6 text-orange-600" />
          </div>
          <h2 className="text-2xl font-display font-bold">Nearby Hospitals</h2>
        </div>
        <Button variant="ghost" onClick={handleSearch} disabled={isLoading}>
          <Search className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-6 w-48 bg-slate-100 rounded mb-2" />
              <div className="h-4 w-full bg-slate-50 rounded" />
            </Card>
          ))}
        </div>
      ) : hospitals.length > 0 ? (
        <div className="grid gap-4">
          {hospitals.map((h, i) => (
            <Card key={i} className="cursor-pointer card-hover" onClick={() => setSelectedHospital(h)}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{h.name}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {h.address}
                  </p>
                  <div className="mt-2 inline-block px-2 py-1 bg-orange-50 text-orange-700 text-[10px] font-bold uppercase rounded">
                    {h.specialty}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <p className="text-slate-500">No hospitals found in your area.</p>
        </Card>
      )}

      <Modal
        isOpen={!!selectedHospital}
        onClose={() => setSelectedHospital(null)}
        title="Hospital Details"
      >
        {selectedHospital && (
          <div className="space-y-6">
            <div>
              <h4 className="text-2xl font-display font-bold text-slate-900">{selectedHospital.name}</h4>
              <p className="text-slate-500 mt-1">{selectedHospital.address}</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">Main Specialty</p>
              <p className="text-orange-900 font-semibold">{selectedHospital.specialty}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {selectedHospital.phone && (
                <a
                  href={`tel:${selectedHospital.phone}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/20 hover:bg-white/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Mic className="w-5 h-5 text-brand-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">Call Now</span>
                </a>
              )}
              {selectedHospital.website && (
                <a
                  href={selectedHospital.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/20 hover:bg-white/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Globe className="w-5 h-5 text-brand-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">Website</span>
                </a>
              )}
            </div>

            <Button className="w-full py-4" onClick={() => setSelectedHospital(null)}>
              Close
            </Button>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}

function AlarmsTab({ user, alarms, setAlarms, triggerCall }: { 
  user: UserProfile; 
  alarms: Alarm[]; 
  setAlarms: (alarms: Alarm[]) => void;
  triggerCall: (alarm: Alarm) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAlarm, setNewAlarm] = useState<Partial<Alarm>>({
    type: 'medication',
    time: '09:00',
    label: ''
  });
  const [isTesting, setIsTesting] = useState(false);

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const handleAddAlarm = () => {
    if (!newAlarm.label || !newAlarm.time) return;
    const alarm: Alarm = {
      id: Date.now().toString(),
      type: newAlarm.type as any,
      time: newAlarm.time,
      label: newAlarm.label,
      active: true
    };
    setAlarms([...alarms, alarm]);
    setIsModalOpen(false);
    setNewAlarm({ type: 'medication', time: '09:00', label: '' });
  };

  const handleTestCall = async () => {
    setIsTesting(true);
    await triggerCall({
      id: 'test',
      type: 'other',
      time: 'Now',
      label: 'Test Call',
      active: true
    });
    setTimeout(() => setIsTesting(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
            <Bell className="w-6 h-6 text-rose-600" />
          </div>
          <h2 className="text-2xl font-display font-bold">Health Alarms</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleTestCall} disabled={isTesting}>
            {isTesting ? "Calling..." : "Test Call"}
          </Button>
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" /> New Alarm
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {alarms.map(alarm => (
          <Card key={alarm.id} className={cn("flex items-center justify-between", !alarm.active && "opacity-60")}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                alarm.type === 'medication' ? "bg-blue-100 text-blue-600" :
                alarm.type === 'meal' ? "bg-orange-100 text-orange-600" :
                "bg-emerald-100 text-emerald-600"
              )}>
                {alarm.type === 'medication' ? <Shield className="w-6 h-6" /> :
                 alarm.type === 'meal' ? <Heart className="w-6 h-6" /> :
                 <Activity className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-slate-900">{alarm.time}</p>
                <p className="text-sm text-slate-500 font-medium">{alarm.label}</p>
              </div>
            </div>
            <button
              onClick={() => toggleAlarm(alarm.id)}
              className={cn(
                "w-12 h-6 rounded-full transition-all relative",
                alarm.active ? "bg-brand-600" : "bg-slate-200"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                alarm.active ? "right-1" : "left-1"
              )} />
            </button>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-900 text-white border-0">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl">
            <Bell className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h4 className="font-bold text-lg">AI Smart Calling</h4>
            <p className="text-slate-400 text-sm mt-1 leading-relaxed">
              When an alarm rings, our AI will call your phone number to ensure you don't miss your medication or meal.
            </p>
            <div className="flex gap-3 mt-4">
              <Button variant="secondary" className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-sm">
                Configure Call
              </Button>
              <Button variant="ghost" className="text-red-400 hover:text-red-300 text-sm">
                Block AI Number
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Set New Health Alarm"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Alarm Label</label>
            <Input
              placeholder="e.g., Take Insulin, Morning Yoga"
              value={newAlarm.label}
              onChange={(e: any) => setNewAlarm({ ...newAlarm, label: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Time</label>
              <Input
                type="time"
                value={newAlarm.time}
                onChange={(e: any) => setNewAlarm({ ...newAlarm, time: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Type</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500/20"
                value={newAlarm.type}
                onChange={(e) => setNewAlarm({ ...newAlarm, type: e.target.value as any })}
              >
                <option value="medication">Medication</option>
                <option value="meal">Meal</option>
                <option value="exercise">Exercise</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <Button className="w-full py-4 mt-2" onClick={handleAddAlarm}>
            Save Alarm
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}

function ProfileTab({ user, onLogout }: { user: UserProfile; onLogout: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
          <User className="w-6 h-6 text-slate-600" />
        </div>
        <h2 className="text-2xl font-display font-bold">My Profile</h2>
      </div>

      <Card className="flex flex-col items-center text-center py-8">
        <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-md overflow-hidden mb-4">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="Avatar" className="w-full h-full" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
        <p className="text-slate-500">{user.email}</p>
        <div className="flex gap-2 mt-4">
          <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full uppercase tracking-wider">
            {user.language}
          </span>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wider">
            Patient
          </span>
        </div>
      </Card>

      <div className="grid gap-3">
        <ProfileItem icon={MapPin} label="Location" value={`${user.district}, ${user.state} (${user.pincode})`} />
        <ProfileItem icon={Globe} label="Preferred Language" value={user.language.toUpperCase()} />
        <ProfileItem icon={Calendar} label="Member Since" value="March 2026" />
      </div>

      <div className="pt-4 space-y-3">
        <Button variant="secondary" className="w-full justify-start px-6 py-4">
          <Settings className="w-5 h-5" /> Account Settings
        </Button>
        <Button variant="danger" className="w-full justify-start px-6 py-4" onClick={onLogout}>
          <LogOut className="w-5 h-5" /> Logout
        </Button>
      </div>
    </motion.div>
  );
}

function ProfileItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="font-semibold text-slate-900">{value}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-300" />
    </div>
  );
}
