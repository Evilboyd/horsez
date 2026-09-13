import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  FileText, 
  Sparkles, 
  FolderOpen, 
  Phone, 
  Heart, 
  Edit3, 
  Trash2, 
  CheckSquare, 
  Square, 
  Activity, 
  Stethoscope, 
  ShoppingBag, 
  Truck, 
  Home, 
  UserCheck, 
  Info, 
  Utensils, 
  Thermometer, 
  ShieldAlert,
  Search,
  Filter,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import { TwoHorseshoesIcon } from '../common/TwoHorseshoesIcon';
import { FeedBagIcon } from '../common/FeedBagIcon';
import { 
  CategoryId, 
  UserHorse, 
  BarnChore, 
  StableHealthEvent, 
  BarnFacilityInfo 
} from '../../types';
import { 
  MOCK_USER_HORSES, 
  MOCK_BARN_CHORES, 
  MOCK_STABLE_EVENTS, 
  MOCK_BARN_FACILITY 
} from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

interface MyStableViewProps {
  onSelectCategory: (id: CategoryId) => void;
  onOpenAI: () => void;
  onOpenDrive: () => void;
  onOpenSignUp: () => void;
  onOpenProfile: () => void;
  onAddToCart?: (product: any, qty: number, isSub: boolean) => void;
  onOpenCart?: () => void;
}

type StableTab = 'horses' | 'nutrition' | 'chores' | 'health' | 'contacts';

export const MyStableView: React.FC<MyStableViewProps> = ({
  onSelectCategory,
  onOpenAI,
  onOpenDrive,
  onOpenSignUp,
  onOpenProfile,
  onAddToCart,
  onOpenCart
}) => {
  const { user, userProfile, userHorses: firestoreHorses } = useAuth();
  
  // Active Tab
  const [activeTab, setActiveTab] = useState<StableTab>('horses');
  
  // Horses State (Combines mock + Firestore if logged in)
  const [horses, setHorses] = useState<UserHorse[]>(() => {
    try {
      const saved = localStorage.getItem('horsez_my_stable_horses');
      return saved ? JSON.parse(saved) : MOCK_USER_HORSES;
    } catch {
      return MOCK_USER_HORSES;
    }
  });

  // Chores State
  const [chores, setChores] = useState<BarnChore[]>(() => {
    try {
      const saved = localStorage.getItem('horsez_stable_chores');
      return saved ? JSON.parse(saved) : MOCK_BARN_CHORES;
    } catch {
      return MOCK_BARN_CHORES;
    }
  });

  // Health Events State
  const [healthEvents, setHealthEvents] = useState<StableHealthEvent[]>(() => {
    try {
      const saved = localStorage.getItem('horsez_stable_health_events');
      return saved ? JSON.parse(saved) : MOCK_STABLE_EVENTS;
    } catch {
      return MOCK_STABLE_EVENTS;
    }
  });

  // Facility Info
  const [facility] = useState<BarnFacilityInfo>(MOCK_BARN_FACILITY);

  // Selected Horse for Detailed View
  const [selectedHorseId, setSelectedHorseId] = useState<string>(horses[0]?.id || 'horse-1');
  const selectedHorse = horses.find(h => h.id === selectedHorseId) || horses[0];

  // Add Horse Modal State
  const [isAddHorseOpen, setIsAddHorseOpen] = useState(false);
  const [newHorseName, setNewHorseName] = useState('');
  const [newHorseBreed, setNewHorseBreed] = useState('');
  const [newHorseAge, setNewHorseAge] = useState<number>(7);
  const [newHorseColor, setNewHorseColor] = useState('Bay');
  const [newHorseStall, setNewHorseStall] = useState('Stall #04');
  const [newHorseDiscipline, setNewHorseDiscipline] = useState('Hunter/Jumper');
  const [newHorseHeight, setNewHorseHeight] = useState<number>(16.2);
  const [newHorseWeight, setNewHorseWeight] = useState<number>(1200);
  const [newHorseMicrochip, setNewHorseMicrochip] = useState('');
  const [newHorsePhoto, setNewHorsePhoto] = useState('https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800');
  const [newHorseNeeds, setNewHorseNeeds] = useState('');

  // Add Chore Modal State
  const [isAddChoreOpen, setIsAddChoreOpen] = useState(false);
  const [newChoreTitle, setNewChoreTitle] = useState('');
  const [newChoreSlot, setNewChoreSlot] = useState<BarnChore['timeSlot']>('Morning (6:30 AM)');
  const [newChoreCategory, setNewChoreCategory] = useState<BarnChore['category']>('feed');
  const [newChoreHorse, setNewChoreHorse] = useState('All Horses');

  // Filter for chores
  const [choreFilter, setChoreFilter] = useState<'all' | BarnChore['category']>('all');

  // Toggle Chore completion
  const handleToggleChore = (choreId: string) => {
    setChores(prev => {
      const updated = prev.map(c => {
        if (c.id === choreId) {
          const nextCompleted = !c.completed;
          return {
            ...c,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
          };
        }
        return c;
      });
      try {
        localStorage.setItem('horsez_stable_chores', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  // Add new horse handler
  const handleAddHorse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHorseName.trim()) return;

    const newHorse: UserHorse = {
      id: `horse-${Date.now()}`,
      name: newHorseName.trim(),
      breed: newHorseBreed.trim() || 'Equine Sport Horse',
      age: Number(newHorseAge) || 5,
      color: newHorseColor.trim() || 'Bay',
      cogginsVerified: true,
      vaccinesCurrent: true,
      photoUrl: newHorsePhoto || 'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?auto=format&fit=crop&q=80&w=800',
      stallNumber: newHorseStall.trim() || 'Stall #01',
      heightHands: Number(newHorseHeight) || 16.0,
      weightLbs: Number(newHorseWeight) || 1150,
      microchipNumber: newHorseMicrochip.trim() || `98514100${Math.floor(1000000 + Math.random() * 9000000)}`,
      discipline: newHorseDiscipline.trim() || 'General Riding',
      specialNeeds: newHorseNeeds.trim() || 'Standard turnout and care',
      feedSchedule: {
        morningHay: '2 flakes Orchard Grass',
        morningGrain: '2.0 lbs Concentrate',
        eveningHay: '2 flakes Timothy Blend',
        eveningGrain: '2.0 lbs Concentrate',
        supplements: ['Daily Multi-Vitamin', 'Electrolytes']
      },
      turnoutGroup: 'Main Pasture (8:00 AM - 12:00 PM)',
      blanketWeight: 'Medium (200g)'
    };

    const updated = [newHorse, ...horses];
    setHorses(updated);
    setSelectedHorseId(newHorse.id);
    try {
      localStorage.setItem('horsez_my_stable_horses', JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }

    setIsAddHorseOpen(false);
    setNewHorseName('');
    setNewHorseBreed('');
  };

  // Add chore handler
  const handleAddChore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChoreTitle.trim()) return;

    const newChore: BarnChore = {
      id: `chore-${Date.now()}`,
      title: newChoreTitle.trim(),
      timeSlot: newChoreSlot,
      category: newChoreCategory,
      horseName: newChoreHorse,
      completed: false
    };

    const updated = [newChore, ...chores];
    setChores(updated);
    try {
      localStorage.setItem('horsez_stable_chores', JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }

    setIsAddChoreOpen(false);
    setNewChoreTitle('');
  };

  // Quick Order Hay / Feed into cart
  const handleQuickOrderFeed = (itemName: string, category: string) => {
    if (onAddToCart) {
      onAddToCart({
        id: `feed-quick-${Date.now()}`,
        title: itemName,
        category: category as any,
        price: 28.50,
        image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800',
        rating: 4.9,
        description: `Direct barn restock order for ${facility.name}`,
        inStock: true,
        subscriptionAvailable: true
      }, 2, false);

      if (onOpenCart) {
        onOpenCart();
      }
    } else {
      onSelectCategory('feed-supplies');
    }
  };

  // Calculate chore stats
  const completedChoresCount = chores.filter(c => c.completed).length;
  const choreProgressPct = chores.length > 0 ? Math.round((completedChoresCount / chores.length) * 100) : 0;
  const filteredChores = choreFilter === 'all' ? chores : chores.filter(c => c.category === choreFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-10 font-sans space-y-6">
      
      {/* Top Stable Facility Header Card */}
      <div className="bg-gradient-to-br from-[#0c2f4d] via-[#10436e] to-[#133553] text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-sky-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-teal-400 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Home className="w-3.5 h-3.5" />
                My Stable Dashboard
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {horses.length} Active Horses Managed
              </span>
              {user ? (
                <span className="bg-sky-500/20 text-sky-200 border border-sky-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  Owner: {userProfile?.fullName || 'Registered Member'}
                </span>
              ) : null}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {userProfile?.barnName || facility.name}
            </h1>

            <p className="text-xs sm:text-sm text-sky-200 flex items-center gap-1.5 font-medium">
              <span>{userProfile?.address || facility.address}</span>
              <span>•</span>
              <span className="text-teal-300">Manager: {facility.managerName} ({facility.managerPhone})</span>
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-sky-100/90">
              <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                <Thermometer className="w-3.5 h-3.5 text-amber-300" />
                <span>{facility.weatherAlert}</span>
              </div>
              <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-emerald-300" />
                <span>Arena: <strong>{facility.arenaStatus}</strong></span>
              </div>
              <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                <span>Stalls: <strong>{facility.occupiedStalls} / {facility.totalStalls}</strong> Occupied</span>
              </div>
            </div>
          </div>

          {/* Quick Facility Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsAddHorseOpen(true)}
              className="flex-1 sm:flex-none bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Horse</span>
            </button>

            <button
              onClick={onOpenDrive}
              className="flex-1 sm:flex-none bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Coggins, CVI, Vaccine Records Vault"
            >
              <FolderOpen className="w-4 h-4 text-sky-300" />
              <span>Drive Vault</span>
            </button>

            <button
              onClick={onOpenAI}
              className="flex-1 sm:flex-none bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Equine Care & Nutrition AI Assistant"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Stable AI</span>
            </button>

            <button
              onClick={() => onSelectCategory('emergency-vet')}
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-500 text-white font-black text-xs px-3.5 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="24/7 Emergency Trauma & Vet Dispatch"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>24/7 ER Vet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs for My Stable */}
      <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200 flex items-center overflow-x-auto no-scrollbar gap-1">
        <button
          onClick={() => setActiveTab('horses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'horses' 
              ? 'bg-[#1B4A72] text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span className="text-base">🐴</span>
          <span>Horses & Stalls ({horses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('nutrition')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'nutrition' 
              ? 'bg-[#1B4A72] text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Utensils className="w-3.5 h-3.5 text-amber-500" />
          <span>Feed & Nutrition Rations</span>
        </button>

        <button
          onClick={() => setActiveTab('chores')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'chores' 
              ? 'bg-[#1B4A72] text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
          <span>Daily Care & Chores ({completedChoresCount}/{chores.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'health' 
              ? 'bg-[#1B4A72] text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5 text-rose-500" />
          <span>Farrier & Vet Schedule</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'contacts' 
              ? 'bg-[#1B4A72] text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Phone className="w-3.5 h-3.5 text-sky-600" />
          <span>Stable Contacts & Protocols</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HORSES & STALLS                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'horses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Horses Grid Cards */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span>Stabled Equines</span>
                <span className="text-xs font-bold text-slate-500 lowercase">({horses.length} horses)</span>
              </h2>

              <button
                onClick={() => setIsAddHorseOpen(true)}
                className="text-xs text-teal-700 hover:text-teal-900 font-extrabold flex items-center gap-1 cursor-pointer bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Horse</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {horses.map(horse => {
                const isSelected = horse.id === selectedHorse?.id;
                return (
                  <div
                    key={horse.id}
                    onClick={() => setSelectedHorseId(horse.id)}
                    className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-sm hover:shadow-md ${
                      isSelected 
                        ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/10' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={horse.photoUrl}
                          alt={horse.name}
                          className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-base text-slate-900">{horse.name}</h3>
                            <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              {horse.stallNumber || 'Stall #1'}
                            </span>
                            {horse.cogginsVerified && (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Coggins
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 font-medium">
                            {horse.breed} • {horse.age} yrs • {horse.color}
                          </p>

                          <p className="text-[11px] text-teal-700 font-semibold mt-1">
                            Discipline: {horse.discipline || 'All-Around'} • {horse.heightHands || 16.1} HH
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          horse.vaccinesCurrent 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {horse.vaccinesCurrent ? 'Vaccines Current' : 'Booster Due'}
                        </span>
                        
                        <div className="flex items-center gap-1 text-xs text-teal-600 font-extrabold group-hover:translate-x-1 transition-transform">
                          <span>View Dossier</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Horse Complete Dossier */}
          {selectedHorse && (
            <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md space-y-5">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={selectedHorse.photoUrl}
                    alt={selectedHorse.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-4 ring-teal-50 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-slate-900">{selectedHorse.name}</h2>
                      <span className="bg-teal-100 text-teal-900 text-xs font-black px-2 py-0.5 rounded-full">
                        {selectedHorse.stallNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {selectedHorse.breed} • {selectedHorse.color}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onOpenDrive}
                  className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold transition-colors cursor-pointer"
                  title="View Passport & Coggins in Google Drive Vault"
                >
                  <FolderOpen className="w-4 h-4 text-sky-600" />
                </button>
              </div>

              {/* Bio & Biometrics Grid */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Age</p>
                  <p className="text-sm font-black text-slate-800">{selectedHorse.age} Years</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Height</p>
                  <p className="text-sm font-black text-slate-800">{selectedHorse.heightHands || 16.2} HH</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Weight</p>
                  <p className="text-sm font-black text-slate-800">{selectedHorse.weightLbs || 1200} lbs</p>
                </div>
              </div>

              {/* Identification & Passport */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Microchip ID:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedHorse.microchipNumber || '985141002938471'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Registration #:</span>
                  <span className="font-bold text-slate-800">{selectedHorse.registrationNumber || 'USEF-Active'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Turnout Group:</span>
                  <span className="font-bold text-teal-800">{selectedHorse.turnoutGroup || 'North Pasture'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Tonight's Blanketing:</span>
                  <span className="bg-amber-100 text-amber-900 font-black px-2 py-0.5 rounded-md text-[10px]">
                    {selectedHorse.blanketWeight || 'Medium (200g)'}
                  </span>
                </div>
              </div>

              {/* Feeding Snapshot */}
              <div className="border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-amber-600" />
                    <span>Daily Nutrition & Feeding</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('nutrition')}
                    className="text-[11px] text-teal-700 hover:text-teal-900 font-extrabold underline cursor-pointer"
                  >
                    Edit Chart
                  </button>
                </div>

                <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                  <p><strong>AM:</strong> {selectedHorse.feedSchedule?.morningHay} + {selectedHorse.feedSchedule?.morningGrain}</p>
                  <p><strong>PM:</strong> {selectedHorse.feedSchedule?.eveningHay} + {selectedHorse.feedSchedule?.eveningGrain}</p>
                  {selectedHorse.feedSchedule?.supplements && (
                    <div className="pt-1 flex flex-wrap gap-1">
                      {selectedHorse.feedSchedule.supplements.map((sup, i) => (
                        <span key={i} className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {sup}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Special Care & Turnout Instructions */}
              {selectedHorse.specialNeeds && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold">Special Care & Turnout Notes</p>
                    <p className="text-[11px] text-amber-800">{selectedHorse.specialNeeds}</p>
                  </div>
                </div>
              )}

              {/* Quick Actions Bar */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => onSelectCategory('farriers')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <TwoHorseshoesIcon className="w-3.5 h-3.5 text-amber-600" />
                  <span>Book Farrier</span>
                </button>
                
                <button
                  onClick={() => onSelectCategory('vets')}
                  className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-extrabold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                  <span>Book Vet Visit</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FEED & NUTRITION RATIONS                                          */}
      {/* ========================================================================= */}
      {activeTab === 'nutrition' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-amber-500" />
                  <span>Barn Feeding Chart & Nutrition Master Board</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Customized forage, concentrates, and supplement formulations per stall
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuickOrderFeed('Timothy Grass Hay (Premium 3-String)', 'hay')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FeedBagIcon className="w-3.5 h-3.5" />
                  <span>Reorder Barn Hay & Grain</span>
                </button>

                <button
                  onClick={onOpenAI}
                  className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-extrabold text-xs px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>AI Diet Calculator</span>
                </button>
              </div>
            </div>

            {/* Nutrition Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <th className="p-3">Horse & Stall</th>
                    <th className="p-3">Morning Ration (6:30 AM)</th>
                    <th className="p-3">Evening Ration (5:30 PM)</th>
                    <th className="p-3">Custom Supplements</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {horses.map(horse => (
                    <tr key={horse.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={horse.photoUrl} 
                            alt={horse.name} 
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                          <div>
                            <p className="font-extrabold text-slate-900">{horse.name}</p>
                            <p className="text-[11px] text-slate-400">{horse.stallNumber}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <p className="font-bold text-slate-800">{horse.feedSchedule?.morningHay || '2 flakes Orchard'}</p>
                        <p className="text-[11px] text-slate-500">{horse.feedSchedule?.morningGrain || '2.5 lbs Strategy GX'}</p>
                      </td>

                      <td className="p-3">
                        <p className="font-bold text-slate-800">{horse.feedSchedule?.eveningHay || '2 flakes Timothy'}</p>
                        <p className="text-[11px] text-slate-500">{horse.feedSchedule?.eveningGrain || '2.5 lbs Strategy GX'}</p>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(horse.feedSchedule?.supplements || ['Electrolytes', 'Daily Pellets']).map((sup, idx) => (
                            <span key={idx} className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {sup}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleQuickOrderFeed(`${horse.name}'s Ration Pack`, 'grain')}
                          className="bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        >
                          Order Feed
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DAILY CARE, CHORES & TURNOUT                                       */}
      {/* ========================================================================= */}
      {activeTab === 'chores' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-teal-600" />
                  <span>Daily Stable Care & Chore Rota</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Track feeding, turnout rotations, mucking, and night checks in real time
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddChoreOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-2/3 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-slate-700">Today's Barn Progress</span>
                  <span className="text-teal-700">{completedChoresCount} of {chores.length} Completed ({choreProgressPct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-500 rounded-full transition-all duration-300"
                    style={{ width: `${choreProgressPct}%` }}
                  />
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'feed', 'turnout', 'mucking', 'medication', 'blanket'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setChoreFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-colors cursor-pointer ${
                      choreFilter === cat
                        ? 'bg-[#1B4A72] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Chores Checklist */}
            <div className="space-y-2.5">
              {filteredChores.map(chore => (
                <div
                  key={chore.id}
                  onClick={() => handleToggleChore(chore.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    chore.completed
                      ? 'bg-emerald-50/50 border-emerald-200 text-slate-500'
                      : 'bg-white border-slate-200 hover:border-teal-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                      chore.completed 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-slate-300 bg-white hover:border-teal-500'
                    }`}>
                      {chore.completed ? <Check className="w-4 h-4 stroke-[3]" /> : null}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs font-extrabold ${chore.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {chore.title}
                        </h4>
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {chore.timeSlot}
                        </span>
                        {chore.horseName && (
                          <span className="bg-teal-50 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-teal-200">
                            {chore.horseName}
                          </span>
                        )}
                      </div>
                      {chore.notes && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{chore.notes}</p>
                      )}
                    </div>
                  </div>

                  {chore.completedAt && (
                    <span className="text-[11px] font-mono text-emerald-700 font-bold shrink-0">
                      Done at {chore.completedAt}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: FARRIER & VET SCHEDULE                                            */}
      {/* ========================================================================= */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-rose-500" />
                  <span>Farrier, Shoeing, Vaccines & Health Schedule</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Track shoeing reset intervals, annual vaccines, and Coggins renewals
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectCategory('farriers')}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <TwoHorseshoesIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Find Local Farrier</span>
                </button>

                <button
                  onClick={() => onSelectCategory('vets')}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Book Vet Clinic</span>
                </button>
              </div>
            </div>

            {/* Events List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {healthEvents.map(event => (
                <div 
                  key={event.id}
                  className="bg-slate-50 border border-slate-200 hover:border-teal-300 rounded-2xl p-4 space-y-3 transition-all shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        event.type === 'farrier' 
                          ? 'bg-amber-100 text-amber-800' 
                          : event.type === 'vaccine' 
                          ? 'bg-teal-100 text-teal-800' 
                          : event.type === 'coggins'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {event.type}
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900 mt-1">{event.title}</h3>
                      <p className="text-xs text-teal-800 font-bold">Horse: {event.horseName}</p>
                    </div>

                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                      event.status === 'due_soon' 
                        ? 'bg-amber-200 text-amber-900 border border-amber-300' 
                        : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {event.status === 'due_soon' ? 'Due in < 7 Days' : 'On Schedule'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Last Service</p>
                      <p className="font-semibold text-slate-700">{event.lastDoneDate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Next Due Date</p>
                      <p className="font-bold text-teal-700">{event.nextDueDate}</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center justify-between pt-1">
                    <span>Provider: <strong>{event.providerName}</strong></span>
                    <button
                      onClick={onOpenDrive}
                      className="text-teal-700 hover:text-teal-900 font-extrabold text-[11px] underline flex items-center gap-1 cursor-pointer"
                    >
                      <FolderOpen className="w-3 h-3" />
                      <span>Drive Vault</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: STABLE CONTACTS & EMERGENCY PROTOCOLS                             */}
      {/* ========================================================================= */}
      {activeTab === 'contacts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Emergency Directory */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-sky-600" />
              <span>Dedicated Stable Service Directory</span>
            </h2>

            <div className="space-y-3">
              {[
                { role: 'Primary Equine Vet', name: 'Dr. Sarah Evans, DVM', phone: '(707) 555-0199', org: 'North Bay Equine Clinic' },
                { role: '24/7 Trauma Emergency', name: 'Ambulance Trauma Team', phone: '(408) 504-2185', org: 'UC Davis / Bay ER Dispatch' },
                { role: 'Master Farrier', name: 'Jack Crawford, CJF', phone: '(707) 555-0144', org: 'Precision Equine Shoeing' },
                { role: 'Emergency Hauler', name: 'Silver Streak Transport', phone: '(707) 555-0188', org: 'USDOT #392810' },
                { role: 'Barn Manager', name: facility.managerName, phone: facility.managerPhone, org: facility.name }
              ].map((contact, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700">
                      {contact.role}
                    </span>
                    <h3 className="font-extrabold text-xs text-slate-900">{contact.name}</h3>
                    <p className="text-[11px] text-slate-500">{contact.org}</p>
                  </div>

                  <a
                    href={`tel:${contact.phone}`}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1 shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Safety & Evacuation Protocols */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
              <h2 className="text-base font-black text-white">Barn Safety & Evacuation Rules</h2>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <p className="font-extrabold text-amber-300">Fire Evacuation Halters</p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Leather emergency halters and lead ropes are hung outside each stall door. Do not use nylon halters in fire conditions.
                </p>
              </div>

              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <p className="font-extrabold text-amber-300">Main Water & Power Shutoffs</p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Master electrical breaker is located inside the Tack Room west entrance. Main well pump valve is behind Paddock #2.
                </p>
              </div>

              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <p className="font-extrabold text-amber-300">Equine First Aid Station</p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Banamine paste, Vetrap, Betadine scrub, digital thermometers, and sterile gauze are locked in the medical cabinet.
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectCategory('contact')}
              className="w-full bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Contact horsez Barn Concierge 24/7</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD HORSE                                                         */}
      {/* ========================================================================= */}
      {isAddHorseOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  🐴
                </div>
                <h3 className="text-base font-black text-slate-900">Add Horse to My Stable</h3>
              </div>
              <button 
                onClick={() => setIsAddHorseOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddHorse} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                    Horse Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newHorseName}
                    onChange={(e) => setNewHorseName(e.target.value)}
                    placeholder="e.g. Bella Luna"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                    Breed
                  </label>
                  <input
                    type="text"
                    value={newHorseBreed}
                    onChange={(e) => setNewHorseBreed(e.target.value)}
                    placeholder="e.g. Hanoverian Warmblood"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={newHorseAge}
                    onChange={(e) => setNewHorseAge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    value={newHorseColor}
                    onChange={(e) => setNewHorseColor(e.target.value)}
                    placeholder="Bay, Chestnut..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                    Stall #
                  </label>
                  <input
                    type="text"
                    value={newHorseStall}
                    onChange={(e) => setNewHorseStall(e.target.value)}
                    placeholder="Stall #05"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                    Discipline
                  </label>
                  <input
                    type="text"
                    value={newHorseDiscipline}
                    onChange={(e) => setNewHorseDiscipline(e.target.value)}
                    placeholder="Hunter/Jumper, Dressage..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                    Height (HH)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newHorseHeight}
                    onChange={(e) => setNewHorseHeight(Number(e.target.value))}
                    placeholder="16.2"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                  Microchip / Tag ID
                </label>
                <input
                  type="text"
                  value={newHorseMicrochip}
                  onChange={(e) => setNewHorseMicrochip(e.target.value)}
                  placeholder="e.g. 985141002938471"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium font-mono focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                  Photo URL
                </label>
                <input
                  type="url"
                  value={newHorsePhoto}
                  onChange={(e) => setNewHorsePhoto(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                  Special Turnout / Care Needs
                </label>
                <textarea
                  rows={2}
                  value={newHorseNeeds}
                  onChange={(e) => setNewHorseNeeds(e.target.value)}
                  placeholder="e.g. Fly mask in summer, bell boots on turnout"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddHorseOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-black px-5 py-2 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Save to Stable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD CHORE                                                         */}
      {/* ========================================================================= */}
      {isAddChoreOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Add Barn Chore / Task</h3>
              <button 
                onClick={() => setIsAddChoreOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddChore} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={newChoreTitle}
                  onChange={(e) => setNewChoreTitle(e.target.value)}
                  placeholder="e.g. Afternoon electrolyte mash"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                  Time Slot
                </label>
                <select
                  value={newChoreSlot}
                  onChange={(e) => setNewChoreSlot(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Morning (6:30 AM)">Morning (6:30 AM)</option>
                  <option value="Afternoon (12:00 PM)">Afternoon (12:00 PM)</option>
                  <option value="Evening (5:30 PM)">Evening (5:30 PM)</option>
                  <option value="Night Check (9:00 PM)">Night Check (9:00 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newChoreCategory}
                  onChange={(e) => setNewChoreCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="feed">Feed & Supplements</option>
                  <option value="turnout">Turnout & Paddock</option>
                  <option value="mucking">Mucking & Bedding</option>
                  <option value="medication">Medication & Care</option>
                  <option value="blanket">Blanketing & Temperature</option>
                  <option value="exercise">Training & Exercise</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                  Horse Assigned
                </label>
                <input
                  type="text"
                  value={newChoreHorse}
                  onChange={(e) => setNewChoreHorse(e.target.value)}
                  placeholder="All Horses, Thunder, Sarafina..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddChoreOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-black px-5 py-2 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
