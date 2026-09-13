import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Video, 
  Camera, 
  CheckSquare, 
  Square, 
  Clock, 
  AlertOctagon, 
  Sparkles, 
  CheckCircle2, 
  Navigation, 
  FileCheck, 
  ShieldCheck, 
  Upload,
  Plus,
  X,
  Flame,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MOCK_EMERGENCY_VETS, MOCK_USER_HORSES } from '../../data/mockData';
import { EmergencyVetTeam, TriageResult } from '../../types';
import { OpenSourceMap } from '../common/OpenSourceMap';
import { useSavedAddress } from '../../context/SavedAddressContext';
import { 
  EQUINE_COLLECTIONS, 
  publishToFirestore, 
  subscribeToFirestoreCollection,
  geocodeEquineLocation 
} from '../../lib/equineDataService';

export const EmergencyVetView: React.FC = () => {
  const { savedAddress, calculateDistanceMiles, calculateDriveTimeMinutes } = useSavedAddress();
  
  // Real-time Firestore Emergency Vets State
  const [firestoreEmergencyVets, setFirestoreEmergencyVets] = useState<EmergencyVetTeam[]>([]);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Severe Colic']);
  const [severity, setSeverity] = useState<'CODE RED' | 'URGENT CARE'>('CODE RED');
  const [selectedHorse, setSelectedHorse] = useState(MOCK_USER_HORSES[0].name);
  const [photoNote, setPhotoNote] = useState('');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [emergencyState, setEmergencyState] = useState<string>('ALL');
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiTriage, setAiTriage] = useState<TriageResult | null>(null);

  const [isDispatched, setIsDispatched] = useState(false);
  const [dispatchMinutes, setDispatchMinutes] = useState(6);
  const [activeVetTeamId, setActiveVetTeamId] = useState<string>(MOCK_EMERGENCY_VETS[0].id);

  // Publish Emergency ICU Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('Santa Rosa, CA');
  const [newState, setNewState] = useState('CA');
  const [newPhone, setNewPhone] = useState('(707) 555-0199');
  const [newEta, setNewEta] = useState('12');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatusMsg, setPublishStatusMsg] = useState('');
  const [publishError, setPublishError] = useState('');

  // 1. Subscribe to Firestore emergency vets in real-time
  useEffect(() => {
    setIsFirebaseLoading(true);
    const unsubscribe = subscribeToFirestoreCollection<EmergencyVetTeam>(
      EQUINE_COLLECTIONS.VETERINARIANS,
      (loaded) => {
        // Filter those marked as emergency or with emergency status
        const emergencyList = loaded.filter(v => (v as any).isEmergency || (v as any).status);
        setFirestoreEmergencyVets(emergencyList);
        setIsFirebaseLoading(false);
      },
      (err) => {
        console.warn('Firestore emergency vet subscription warning:', err);
        setIsFirebaseLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Combine Firestore + Mock Emergency Vets
  const allEmergencyVets: EmergencyVetTeam[] = useMemo(() => {
    const combined = [...firestoreEmergencyVets, ...MOCK_EMERGENCY_VETS];
    const seen = new Set<string>();
    return combined.filter(v => {
      if (seen.has(v.id)) return false;
      seen.add(v.id);
      return true;
    });
  }, [firestoreEmergencyVets]);

  const activeVetTeam = useMemo(() => {
    return allEmergencyVets.find(v => v.id === activeVetTeamId) || allEmergencyVets[0] || MOCK_EMERGENCY_VETS[0];
  }, [allEmergencyVets, activeVetTeamId]);

  const filteredEmergencyVets = useMemo(() => {
    return allEmergencyVets.filter(vet => {
      if (emergencyState !== 'ALL' && vet.state !== emergencyState) return false;
      return true;
    });
  }, [allEmergencyVets, emergencyState]);

  const symptomsList = [
    'Severe Colic',
    'High Fever (>104°F)',
    'Respiratory Distress',
    'Deep Laceration (Bleeding)',
    'Foaling Emergency',
    'Sudden Severe Lameness / Fracture',
    'Eye Injury / Corneal Ulcer'
  ];

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleSimulatePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setUploadedPhotoUrl(url);
    } else {
      setUploadedPhotoUrl('https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=600');
    }
  };

  const handleRunAiTriage = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          horseName: selectedHorse,
          photoDescription: photoNote
        })
      });
      const data = await res.json();
      setAiTriage(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDispatchVetNow = () => {
    setIsDispatched(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handlePublishEmergencyVet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newLocation.trim()) {
      setPublishError('Please enter a team name and location.');
      return;
    }

    setIsPublishing(true);
    setPublishError('');
    setPublishStatusMsg('Registering emergency response team in Firebase...');

    try {
      const coords = geocodeEquineLocation(newLocation);
      const payload = {
        name: newName.trim(),
        location: newLocation.trim(),
        state: newState,
        phone: newPhone.trim() || '(707) 555-0199',
        etaMinutes: Number(newEta) || 12,
        status: 'available' as const,
        verified: true,
        rating: 5.0,
        lat: coords.lat,
        lng: coords.lng,
        isEmergency: true,
        isFirebase: true,
        publishedAsListing: true
      };

      const docRef = await publishToFirestore(
        EQUINE_COLLECTIONS.VETERINARIANS,
        payload
      );

      if (docRef?.id) {
        setActiveVetTeamId(docRef.id);
      }

      setPublishStatusMsg('Emergency ICU / Mobile Team Registered Successfully!');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

      setTimeout(() => {
        setShowRegisterModal(false);
        setNewName('');
        setPublishStatusMsg('');
      }, 800);

    } catch (err: any) {
      console.error('Failed to register emergency vet:', err);
      setPublishError(err?.message || 'Database error. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-10 space-y-6">
      {/* Title Header */}
      <div className="bg-[#1B4A72] text-white p-4 rounded-2xl shadow-md border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold uppercase tracking-wide text-white">
                EMERGENCY VET DISPATCH
              </h1>
              <span className="bg-red-500/20 text-red-200 border border-red-400/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                {allEmergencyVets.length} Units Active
              </span>
            </div>
            <p className="text-xs text-sky-200">
              Immediate critical dispatch, tele-triage &amp; GPS mobile unit tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3 py-2 rounded-xl flex items-center gap-1 shadow transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Register ICU Unit</span>
          </button>

          <a
            href="tel:4085042185"
            className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all shrink-0"
            title="Call 24/7 Dispatch Hotline at (408) 504-2185"
          >
            <Phone className="w-3.5 h-3.5 animate-bounce" />
            <span>(408) 504-2185</span>
          </a>
        </div>
      </div>

      {/* Live Active Dispatch Status Banner */}
      {isDispatched && (
        <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white p-5 rounded-2xl shadow-xl border-2 border-red-400 animate-fade-in space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white text-red-700 flex items-center justify-center font-black text-xl shadow-md">
                {dispatchMinutes}m
              </div>
              <div>
                <span className="bg-amber-400 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                  MOBILE VET DISPATCHED
                </span>
                <h3 className="text-lg font-extrabold mt-0.5">{activeVetTeam.name} En Route!</h3>
                <p className="text-xs text-red-100">ETA to your barn location: ~{dispatchMinutes} minutes ({activeVetTeam.location})</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a 
                href={`tel:${activeVetTeam.phone}`}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Call Mobile Vet</span>
              </a>
              <button 
                onClick={() => setIsDispatched(false)}
                className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-3 py-2 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-black/20 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Priority GPS routing locked</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-300" />
              <span>Horse records transmitted</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-300" />
              <span>Direct field radio open</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid: 2 Columns for Triage + Map Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left Column: Triage & Symptoms */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-600" />
              Rapid Equine Triage
            </h2>
            <span className="text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase">
              Field Intake
            </span>
          </div>

          {/* Select Horse */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Patient Horse</label>
            <select
              value={selectedHorse}
              onChange={(e) => setSelectedHorse(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              {MOCK_USER_HORSES.map(h => (
                <option key={h.id} value={h.name}>
                  {h.name} ({h.breed}, {h.age} yrs) - Coggins Verified
                </option>
              ))}
            </select>
          </div>

          {/* Symptoms Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Select Symptom(s)</label>
            <div className="space-y-2">
              {symptomsList.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-50 border-red-300 text-red-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-red-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      {symptom}
                    </span>
                    {symptom.includes('Colic') && (
                      <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">
                        Critical
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Red vs Urgent Care Priority Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Triage Priority Level</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSeverity('CODE RED')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  severity === 'CODE RED'
                    ? 'bg-red-600 text-white font-extrabold shadow-md border-red-700'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="block text-xs uppercase font-black tracking-wide">🚨 CODE RED</span>
                <span className="text-[10px] opacity-80">Immediate Life Threat</span>
              </button>

              <button
                onClick={() => setSeverity('URGENT CARE')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  severity === 'URGENT CARE'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md border-amber-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="block text-xs uppercase font-black tracking-wide">⚡ URGENT CARE</span>
                <span className="text-[10px] opacity-80">Needs Same-Day Vet</span>
              </button>
            </div>
          </div>

          {/* Photo Note & AI Triage Analysis Button */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                AI Tele-Triage & First Aid Guide
              </label>
              <label className="text-[11px] text-red-600 font-bold hover:underline cursor-pointer flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" />
                <span>Attach Photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleSimulatePhotoUpload}
                />
              </label>
            </div>

            {uploadedPhotoUrl && (
              <div className="relative h-24 rounded-lg overflow-hidden border border-slate-200">
                <img src={uploadedPhotoUrl} alt="Uploaded trauma note" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setUploadedPhotoUrl(null)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 text-[10px]"
                >
                  ✕
                </button>
              </div>
            )}

            <button
              onClick={handleRunAiTriage}
              disabled={isAiLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAiLoading ? 'Analyzing Clinical Protocol...' : 'Run Instant AI Tele-Triage'}</span>
            </button>

            {aiTriage && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1.5 animate-fade-in text-amber-950">
                <div className="flex items-center justify-between font-bold">
                  <span>Emergency Score: {aiTriage.riskLevel || 'High'}</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                    Protocols Loaded
                  </span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                  {aiTriage.summary || 'Do not allow horse to roll. Monitor heart rate & gum color. Keep haltered in a safe pen until mobile vet arrival.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: GPS Tracking & Mobile Teams */}
        <div className="space-y-4">
          
          {/* Map Preview */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-800 relative h-64">
            <OpenSourceMap
              center={{ lat: activeVetTeam.lat, lng: activeVetTeam.lng }}
              zoom={10}
              height="100%"
              selectedMarkerId={activeVetTeam.id}
              onMarkerSelect={(id) => {
                const team = allEmergencyVets.find(v => v.id === id);
                if (team) setActiveVetTeamId(team.id);
              }}
              markers={allEmergencyVets.map(vet => ({
                id: vet.id,
                lat: vet.lat,
                lng: vet.lng,
                title: vet.name,
                subtitle: `${vet.location} • ETA ${vet.etaMinutes} mins (${vet.phone})`,
                badge: vet.status.toUpperCase(),
                color: vet.status === 'en-route' ? '#dc2626' : vet.status === 'available' ? '#059669' : '#64748b',
                icon: '🚑',
                onClick: () => setActiveVetTeamId(vet.id)
              }))}
            />
          </div>

          {/* List of Mobile Emergency Vet Units */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
                Mobile Emergency Teams ({filteredEmergencyVets.length})
              </h3>
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                {['ALL', 'CA', 'KY', 'TX', 'FL', 'VA', 'NC', 'CO'].map(st => (
                  <button
                    key={st}
                    onClick={() => {
                      setEmergencyState(st);
                      const match = allEmergencyVets.find(v => st === 'ALL' || v.state === st);
                      if (match) setActiveVetTeamId(match.id);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-colors cursor-pointer ${
                      emergencyState === st 
                        ? 'bg-red-600 text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {filteredEmergencyVets.map((vet) => {
                const dist = calculateDistanceMiles(vet.lat, vet.lng);
                const time = calculateDriveTimeMinutes(vet.lat, vet.lng);
                return (
                  <div 
                    key={vet.id}
                    onClick={() => setActiveVetTeamId(vet.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      activeVetTeam.id === vet.id
                        ? 'bg-red-50 border-red-300 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-slate-800">{vet.name}</span>
                          {vet.state && (
                            <span className="bg-slate-100 text-slate-700 font-bold text-[9px] px-1 rounded">
                              {vet.state}
                            </span>
                          )}
                          {vet.verified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                          )}
                          {(vet as any).isFirebase && (
                            <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5 text-amber-300 fill-amber-300" /> Firebase
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {vet.location} • <strong className="text-red-700">{dist} mi to barn</strong> (~{time}m ETA)
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        vet.status === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {vet.status.toUpperCase()}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">★ {vet.rating}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DISPATCH EMERGENCY VET NOW Big Red Button */}
          <div className="space-y-2">
            <button
              onClick={handleDispatchVetNow}
              className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black text-sm uppercase tracking-wider py-4 rounded-2xl shadow-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] border-2 border-red-400 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldAlert className="w-5 h-5 animate-pulse" />
              <span>DISPATCH EMERGENCY VET NOW</span>
            </button>
            <p className="text-center text-[11px] text-slate-500 font-medium">
              Immediate dispatch signal sent to {activeVetTeam.name}.
            </p>
          </div>

        </div>

      </div>

      {/* 🔴 REGISTER EMERGENCY ICU / MOBILE TEAM MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-100 text-red-800">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    Register Emergency ICU / Mobile Team
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saves directly to Firebase Veterinarians collection with GPS map coordinates
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {publishStatusMsg ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-black text-base">{publishStatusMsg}</h4>
                <p className="text-xs text-emerald-800">Your emergency response unit is live on the GPS triage map.</p>
              </div>
            ) : (
              <form onSubmit={handlePublishEmergencyVet} className="space-y-3.5 text-xs">
                {publishError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{publishError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clinic / Mobile Unit Name *</label>
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="E.g., North Bay 24/7 Mobile Equine Trauma Unit"
                    className="w-full border border-slate-300 p-2.5 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Location / Base City *</label>
                    <input 
                      type="text" 
                      value={newLocation} 
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Santa Rosa, CA"
                      className="w-full border border-slate-300 p-2.5 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">State</label>
                    <select
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      className="w-full border border-slate-300 p-2.5 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-none"
                    >
                      {['CA', 'KY', 'TX', 'FL', 'VA', 'NC', 'CO', 'WA', 'OR', 'NY'].map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">24/7 Dispatch Phone *</label>
                    <input 
                      type="tel" 
                      value={newPhone} 
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="(707) 555-0199"
                      className="w-full border border-slate-300 p-2.5 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Average ETA (Minutes)</label>
                    <input 
                      type="number" 
                      value={newEta} 
                      onChange={(e) => setNewEta(e.target.value)}
                      placeholder="12"
                      className="w-full border border-slate-300 p-2.5 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-950 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-red-600" />
                    Verified Emergency Response Unit
                  </span>
                  <p className="text-[11px] text-red-800">
                    Registration immediately adds your mobile unit to the active GPS map and dispatches priority notifications during critical equine medical emergencies.
                  </p>
                </div>

                <div className="pt-2 flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowRegisterModal(false)}
                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isPublishing}
                    className="w-2/3 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-black shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Flame className="w-4 h-4 text-amber-300" />
                    <span>{isPublishing ? 'Registering...' : 'Register Response Team'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
