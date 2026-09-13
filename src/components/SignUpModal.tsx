import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Database, 
  ChevronRight, 
  Phone,
  Building2,
  Heart,
  Layers,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const US_STATES = [
  { code: 'CA', name: 'California' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'TX', name: 'Texas' },
  { code: 'FL', name: 'Florida' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'OR', name: 'Oregon' },
  { code: 'CO', name: 'Colorado' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'OH', name: 'Ohio' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'GA', name: 'Georgia' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
];

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signup' | 'signin';
  onNavigateHome?: () => void;
}

export const SignUpModal: React.FC<SignUpModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signup',
  onNavigateHome
}) => {
  const { signUp, signIn, totalMembersCount } = useAuth();
  const [mode, setMode] = useState<'signup' | 'signin'>(initialMode);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage('');
      setSavedDataSummary(null);
    }
  }, [isOpen, initialMode]);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [equineRole, setEquineRole] = useState('Horse Owner');
  const [address, setAddress] = useState('4200 Sonoma Mountain Rd');
  const [city, setCity] = useState('Santa Rosa');
  const [state, setState] = useState('CA');
  const [zipCode, setZipCode] = useState('95404');
  const [primaryDiscipline, setPrimaryDiscipline] = useState('Hunter/Jumper');
  const [numberOfHorses, setNumberOfHorses] = useState(1);
  const [barnName, setBarnName] = useState('Sonoma Valley Stables');
  const [initialHorseName, setInitialHorseName] = useState('Thunderbolt');
  const [initialHorseBreed, setInitialHorseBreed] = useState('Dutch Warmblood');

  // UI Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStep, setSaveStep] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [savedDataSummary, setSavedDataSummary] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSavedDataSummary(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        if (!email.trim() || !password.trim() || !fullName.trim()) {
          setErrorMessage('Please fill in your full name, email, and password.');
          setIsSubmitting(false);
          return;
        }

        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters.');
          setIsSubmitting(false);
          return;
        }

        setSaveStep('1/3: Authenticating Firebase User...');
        await new Promise(r => setTimeout(r, 200));

        setSaveStep('2/3: Persisting User Profile to Firestore (/users/{uid})...');
        
        const computedLocation = [city.trim(), state.trim(), zipCode.trim()].filter(Boolean).join(', ') || 'Santa Rosa, CA';

        const savedProfile = await signUp({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          phone: phone.trim(),
          equineRole,
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
          location: computedLocation,
          primaryDiscipline,
          numberOfHorses: Number(numberOfHorses) || 1,
          barnName: barnName.trim(),
          initialHorseName: initialHorseName.trim(),
          initialHorseBreed: initialHorseBreed.trim()
        });

        setSaveStep('3/3: Registration Complete & Saved to Database!');
        setSavedDataSummary({
          fullName: savedProfile.fullName,
          email: savedProfile.email,
          role: savedProfile.equineRole,
          location: savedProfile.location,
          discipline: savedProfile.primaryDiscipline,
          horsesCount: savedProfile.numberOfHorses,
          horseName: initialHorseName.trim() || 'None',
          uid: savedProfile.uid
        });

        // Automatically return to home page after saving to Firebase
        setTimeout(() => {
          onClose();
          if (onNavigateHome) {
            onNavigateHome();
          }
        }, 1200);

      } else {
        if (!email.trim() || !password.trim()) {
          setErrorMessage('Please enter email and password.');
          setIsSubmitting(false);
          return;
        }

        setSaveStep('Verifying Credentials & Syncing from Firestore...');
        await signIn(email.trim(), password);
        setSaveStep('Signed In Successfully!');
        setTimeout(() => {
          onClose();
          if (onNavigateHome) {
            onNavigateHome();
          }
        }, 800);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setSaveStep(null);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('This email address is already registered. Please switch to Sign In.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setErrorMessage('Invalid email or password credentials.');
      } else {
        setErrorMessage(err.message || 'An error occurred during account registration.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (role: 'owner' | 'trainer' | 'vet' | 'facility') => {
    if (role === 'owner') {
      setEmail(`rider_${Math.floor(Math.random() * 899 + 100)}@horsez.ai`);
      setPassword('horsez2026!');
      setFullName('Eleanor Sterling');
      setPhone('(707) 555-0192');
      setEquineRole('Horse Owner');
      setAddress('4200 Sonoma Mountain Rd');
      setCity('Santa Rosa');
      setState('CA');
      setZipCode('95404');
      setPrimaryDiscipline('Hunter/Jumper');
      setNumberOfHorses(2);
      setBarnName('Sonoma Valley Stables');
      setInitialHorseName('Thunderbolt');
      setInitialHorseBreed('Holsteiner Warmblood');
    } else if (role === 'trainer') {
      setEmail(`trainer_${Math.floor(Math.random() * 899 + 100)}@horsez.ai`);
      setPassword('horsez2026!');
      setFullName('Marcus Vance, USHJA');
      setPhone('(707) 555-0144');
      setEquineRole('Equine Trainer & Instructor');
      setAddress('1150 Bodega Ave');
      setCity('Petaluma');
      setState('CA');
      setZipCode('94952');
      setPrimaryDiscipline('Eventing & Dressage');
      setNumberOfHorses(6);
      setBarnName('Redwood Equestrian Training Facility');
      setInitialHorseName('Apollo Gold');
      setInitialHorseBreed('Irish Sport Horse');
    } else if (role === 'vet') {
      setEmail(`vet_${Math.floor(Math.random() * 899 + 100)}@horsez.ai`);
      setPassword('horsez2026!');
      setFullName('Dr. Samantha Davis, DVM');
      setPhone('(707) 555-0188');
      setEquineRole('Veterinarian / Farrier Specialist');
      setAddress('2100 Arnold Dr');
      setCity('Sonoma');
      setState('CA');
      setZipCode('95476');
      setPrimaryDiscipline('Performance Medicine & Sports Care');
      setNumberOfHorses(1);
      setBarnName('Wine Country Equine Clinic');
      setInitialHorseName('Bella');
      setInitialHorseBreed('Dutch Warmblood');
    } else {
      setEmail(`barn_${Math.floor(Math.random() * 899 + 100)}@horsez.ai`);
      setPassword('horsez2026!');
      setFullName('Katherine Miller');
      setPhone('(707) 555-0133');
      setEquineRole('Barn Manager / Facility Owner');
      setAddress('5800 Bennett Valley Rd');
      setCity('Santa Rosa');
      setState('CA');
      setZipCode('95404');
      setPrimaryDiscipline('Hunter/Jumper & Boarding');
      setNumberOfHorses(14);
      setBarnName('Bennett Valley Equestrian Center');
      setInitialHorseName('Starlight Serenade');
      setInitialHorseBreed('Oldenburg');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#1B4A72] via-[#205886] to-[#1B4A72] text-white p-5 sm:p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 transition-colors cursor-pointer"
            title="Close"
          >
            ✕
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-teal-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Database className="w-3 h-3" />
              <span>Firestore Database Collection</span>
            </span>
            <span className="text-[11px] text-sky-200 font-bold">
              {totalMembersCount.toLocaleString()} Members Registered
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {mode === 'signup' ? 'Create Your horsez Account' : 'Welcome Back to horsez'}
          </h2>
          <p className="text-xs text-sky-100 mt-1">
            {mode === 'signup' 
              ? 'Complete your account form to save your member profile and registered horse data directly to the Firestore database.'
              : 'Sign in to access your horse profile records and connected equine services.'
            }
          </p>

          {/* Tab Switcher */}
          <div className="mt-4 bg-white/10 p-1 rounded-2xl flex text-xs font-bold">
            <button
              onClick={() => { setMode('signup'); setErrorMessage(''); setSavedDataSummary(null); }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'signup' 
                  ? 'bg-white text-slate-900 shadow-md font-extrabold' 
                  : 'text-sky-100 hover:text-white'
              }`}
            >
              Sign Up (New Account)
            </button>
            <button
              onClick={() => { setMode('signin'); setErrorMessage(''); setSavedDataSummary(null); }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'signin' 
                  ? 'bg-white text-slate-900 shadow-md font-extrabold' 
                  : 'text-sky-100 hover:text-white'
              }`}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Database Save Step Progress Notification */}
          {saveStep && (
            <div className="p-3.5 bg-teal-50 border border-teal-300 text-teal-900 rounded-2xl text-xs font-extrabold flex items-center gap-2 animate-in fade-in">
              <Database className="w-4 h-4 text-teal-600 animate-spin shrink-0" />
              <span>{saveStep}</span>
            </div>
          )}

          {/* Saved Data Summary Card */}
          {savedDataSummary && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Account Data Successfully Saved to Database!</span>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                  Returning to Home...
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-800 bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                <div>
                  <span className="font-bold text-slate-500 block text-[9px] uppercase">Name</span>
                  <span className="font-black text-slate-900">{savedDataSummary.fullName}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block text-[9px] uppercase">Role</span>
                  <span className="font-black text-slate-900">{savedDataSummary.role}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block text-[9px] uppercase">Discipline</span>
                  <span className="font-black text-slate-900">{savedDataSummary.discipline}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block text-[9px] uppercase">Registered Horse</span>
                  <span className="font-black text-slate-900">{savedDataSummary.horseName}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigateHome) onNavigateHome();
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Return to Home Page Now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Error Notification */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">

            {mode === 'signup' && (
              <>
                {/* Auto Fill Demo Buttons */}
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <span>⚡ Quick Auto-Fill Profile</span>
                    <span className="text-teal-700 font-bold">Populates Full Form</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleFillDemo('owner')}
                      className="bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 text-[11px] font-bold py-1.5 px-2 rounded-xl transition-colors text-center cursor-pointer"
                    >
                      🐴 Owner
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillDemo('facility')}
                      className="bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 text-[11px] font-bold py-1.5 px-2 rounded-xl transition-colors text-center cursor-pointer"
                    >
                      🏡 Barn Mgr
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillDemo('trainer')}
                      className="bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 text-[11px] font-bold py-1.5 px-2 rounded-xl transition-colors text-center cursor-pointer"
                    >
                      🏆 Trainer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillDemo('vet')}
                      className="bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 text-[11px] font-bold py-1.5 px-2 rounded-xl transition-colors text-center cursor-pointer"
                    >
                      🩺 Vet / Spec
                    </button>
                  </div>
                </div>

                {/* Full Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Eleanor Sterling"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        required
                      />
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(707) 555-0199"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>
                </div>

                {/* Role & Discipline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                      Equine Role *
                    </label>
                    <select
                      value={equineRole}
                      onChange={(e) => setEquineRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none cursor-pointer"
                    >
                      <option value="Horse Owner">Horse Owner</option>
                      <option value="Barn Manager / Facility Owner">Barn Manager / Facility Owner</option>
                      <option value="Equine Trainer & Instructor">Equine Trainer & Instructor</option>
                      <option value="Veterinarian / Farrier Specialist">Veterinarian / Farrier Specialist</option>
                      <option value="Competitive Rider / Student">Competitive Rider / Student</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                      Primary Discipline
                    </label>
                    <select
                      value={primaryDiscipline}
                      onChange={(e) => setPrimaryDiscipline(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none cursor-pointer"
                    >
                      <option value="Hunter/Jumper">Hunter / Jumper</option>
                      <option value="Dressage">Dressage</option>
                      <option value="Western / Reining">Western / Reining</option>
                      <option value="Eventing">Eventing</option>
                      <option value="Trail / Pleasure">Trail / Pleasure</option>
                      <option value="Breeding / Foaling">Breeding / Foaling</option>
                    </select>
                  </div>
                </div>

                {/* Number of Horses & Home Barn */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                      Horses Owned / Managed
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        min={1} 
                        max={100}
                        value={numberOfHorses}
                        onChange={(e) => setNumberOfHorses(parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                      <Layers className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>

                  <div className="sm:col-span-8">
                    <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                      Home Barn / Stables Facility
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={barnName}
                        onChange={(e) => setBarnName(e.target.value)}
                        placeholder="e.g. Sonoma Valley Stables or Private Facility"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                      <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                    Street Address *
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 4200 Sonoma Mountain Rd"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      required
                    />
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                {/* City, State, ZIP */}
                <div className="grid grid-cols-12 gap-2.5">
                  <div className="col-span-5">
                    <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                      City *
                    </label>
                    <input 
                      type="text" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Santa Rosa"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="col-span-4">
                    <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                      State *
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none cursor-pointer"
                      required
                    >
                      {US_STATES.map((st) => (
                        <option key={st.code} value={st.code}>
                          {st.code} - {st.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3">
                    <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                      ZIP *
                    </label>
                    <input 
                      type="text" 
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="95404"
                      maxLength={10}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Primary Horse Info for Database Collection */}
                <div className="bg-teal-50/70 border border-teal-200 p-3.5 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-teal-950 font-black text-xs">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      <span>Register Primary Horse in Firestore Database</span>
                    </div>
                    <span className="text-[10px] bg-teal-200/60 text-teal-900 font-bold px-2 py-0.5 rounded-full">
                      userHorses collection
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-teal-900 mb-0.5">Horse Show / Barn Name</label>
                      <input 
                        type="text" 
                        value={initialHorseName}
                        onChange={(e) => setInitialHorseName(e.target.value)}
                        placeholder="e.g. Thunderbolt"
                        className="w-full bg-white border border-teal-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-teal-900 mb-0.5">Breed</label>
                      <input 
                        type="text" 
                        value={initialHorseBreed}
                        onChange={(e) => setInitialHorseBreed(e.target.value)}
                        placeholder="e.g. Dutch Warmblood"
                        className="w-full bg-white border border-teal-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Email & Password */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.ai"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Submit CTA Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black py-3 rounded-2xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Database className="w-4 h-4 animate-spin" />
                  <span>Saving to Firestore Database...</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>{mode === 'signup' ? 'Complete Save to Database' : 'Sign In to Account'}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Footer notice */}
            <div className="text-center pt-1">
              <p className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                <span>Synchronized with Firestore Database Collection</span>
              </p>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
